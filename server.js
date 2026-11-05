// ==========================================================
// Engine Labs - Servidor Node/Express V4.6 (Original Style)
// ==========================================================

import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth"; // Importante para o 2FA
import { createServer } from "http";
import { Server } from "socket.io";
import { Client } from "ssh2";

const app = express();
const PORT = 3000;
const secretKey = '8QNZ^0rp2CxpiwWn5,L%'; // Chave Fixa

// ==========================================================
// 1. CONFIGURAÇÕES E MIDDLEWARES
// ==========================================================

// A CORREÇÃO MÁGICA PARA NGINX/HTTPS:
app.set('trust proxy', 1); 

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração da Sessão
app.use(session({
    secret: secretKey, 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// --- DEBUG: Middleware para ver se a sessão existe ---
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`[REQUEST] ${req.method} ${req.path}`);
        console.log(`[SESSION] Logado? ${req.session.user ? 'SIM (' + req.session.user.matricula + ')' : 'NÃO'}`);
    }
    next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));

// ==========================================================
// 2. MIDDLEWARE DE PROTEÇÃO (O Porteiro)
// ==========================================================
function protegerRota(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/');
    }
}

// ==========================================================
// 3. ROTAS DE PÁGINAS (HTML)
// ==========================================================

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Rotas Protegidas (Exigem Login)
app.get('/dashboard', protegerRota, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'dashboard.html'));
});

app.get('/console', protegerRota, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'terminal.html'));
});

app.get('/relatorios', protegerRota, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'relatorios.html'));
});

app.get('/configuracoes', protegerRota, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'configuracoes.html'));
});

app.get('/registro', protegerRota, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'registro.html'));
});

// ==========================================================
// 4. ROTAS DE API E LÓGICA
// ==========================================================
const dataDir = path.join(process.cwd(), "data");
const usersFilePath = path.join(dataDir, "usuarios.txt");
const registrosFilePath = path.join(dataDir, "registros.txt");
const perfisFilePath = path.join(dataDir, "perfis.json");
const usersJsonPath = path.join(dataDir, "users.json"); // Caminho do JSON do 2FA

// --- Rota de Login (SEGURA COM BCRYPT + SESSION SAVE) ---
app.post("/login", (req, res) => {
    const { matricula, senha } = req.body;
    
    if (!fs.existsSync(usersFilePath)) return res.status(500).json({ success: false });

    const linhas = fs.readFileSync(usersFilePath, "utf-8").trim().split("\n");
    
    // 1. Procura a linha que tem a matrícula digitada
    const usuarioEncontrado = linhas.find(linha => {
        const p = linha.split(",");
        return p[0]?.trim() === matricula;
    });

    if (usuarioEncontrado) {
        const partes = usuarioEncontrado.split(",");
        const hashArmazenado = partes[1]?.trim();
        
        // 2. Compara a senha digitada com o Hash
        if (bcrypt.compareSync(senha, hashArmazenado)) {
            
            // Sucesso! Cria a sessão
            req.session.user = {
                id: partes[0]?.trim(),
                matricula: matricula
            };

            // IMPORTANTE: Força salvar a sessão antes de responder
            req.session.save((err) => {
                if (err) {
                    console.error("Erro ao salvar sessão:", err);
                    return res.status(500).json({ success: false });
                }
                console.log(`Login Seguro OK: ${matricula}`);
                res.status(200).json({ success: true, redirect: '/dashboard' });
            });

        } else {
            console.log("Senha incorreta.");
            res.status(401).json({ success: false });
        }
    } else {
        console.log("Usuário não encontrado.");
        res.status(401).json({ success: false });
    }
});

// --- Rota Logout ---
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- Rota Mudar Senha ---
app.post("/api/mudar_senha", (req, res) => {
    const { matricula, senhaAtual, novaSenha } = req.body;

    if (!novaSenha || novaSenha.trim() === "") {
        return res.json({ success: false, message: 'Erro: A nova senha não foi recebida.' });
    }
    if (!fs.existsSync(usersFilePath)) {
        return res.status(500).json({ success: false, message: 'Banco de dados offline' });
    }

    const rawData = fs.readFileSync(usersFilePath, "utf-8");
    let linhas = rawData.split('\n');
    let sucesso = false;
    let mensagemErro = "Usuário não encontrado.";
    let novoConteudo = "";

    for (let i = 0; i < linhas.length; i++) {
        let linha = linhas[i].trim();
        if (!linha) continue;
        
        let partes = linha.split(',');
        const mat = partes[0]?.trim();
        const hashArmazenado = partes[1]?.trim();
        
        if (mat === matricula) {
            if (bcrypt.compareSync(senhaAtual, hashArmazenado)) {
                const salt = bcrypt.genSaltSync(10);
                const novoHash = bcrypt.hashSync(novaSenha, salt);

                partes[1] = novoHash; 
                novoConteudo += partes.join(',') + '\n';
                sucesso = true;
            } else {
                novoConteudo += linha + '\n';
                mensagemErro = "A senha atual está incorreta.";
            }
        } else {
            novoConteudo += linha + '\n';
        }
    }

    if (sucesso) {
        fs.writeFileSync(usersFilePath, novoConteudo, "utf-8");
        console.log(`Senha alterada com sucesso para: ${matricula}`);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: mensagemErro });
    }
});

// --- Rota Registros (SUA LÓGICA MANTIDA ORIGINALMENTE) ---
app.get("/api/registros", (req, res) => {
  if (!req.session.user) {
      return res.status(403).json({ error: "Acesso negado. Faça login." });
  }

  try {
    if (!fs.existsSync(registrosFilePath)) {
      return res.json([]); 
    }

    const rawData = fs.readFileSync(registrosFilePath, "utf-8");
    const linhas = rawData.split("\n").filter(l => l.trim() !== "");

    const registros = linhas.map(linha => {
      const parts = linha.split(","); 
      if (parts.length < 4) return null;
      
      const matricula = parts[0]?.trim();
      const email = parts[1]?.trim();
      const entrada = parts[2]?.trim();
      const saida = parts[3]?.trim();
      
      let duracao = parts[4]?.trim() || "0";
      let mesNome = parts[5]?.trim() || "-";
      let semanaStr = parts[6]?.trim() || "-";

      // --- SUA LÓGICA DE CÁLCULO ---
      if (duracao === "0" || mesNome === "-") {
          try {
            const [dataE, horaE] = entrada.split(" ");
            const [dataS, horaS] = saida.split(" ");
            
            if(dataE && horaE && dataS && horaS) {
                const entradaDate = new Date(`${dataE.split("/").reverse().join("-")}T${horaE}`);
                const saidaDate = new Date(`${dataS.split("/").reverse().join("-")}T${horaS}`);
                
                const diff = saidaDate - entradaDate;
                if(diff > 0) {
                    duracao = (diff / 1000 / 60 / 60).toFixed(2);
                }
            }
          } catch (e) { duracao = "0"; }

          try {
              const [dia, mes, ano] = entrada.split(" ")[0].split("/");
              const dataEntrada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
              
              let mesTemp = dataEntrada.toLocaleString("pt-BR", { month: "long" });
              mesNome = mesTemp.charAt(0).toUpperCase() + mesTemp.slice(1);
              
              const semana = Math.ceil(parseInt(dia) / 7);
              semanaStr = semana.toString();
          } catch (e) { mesNome = "-"; semanaStr = "-"; }
      }
      // -----------------------------------------

      return { matricula, email, entrada, saida, duracao, mes: mesNome, semana: semanaStr };
    }).filter(r => r !== null);

    res.json(registros);
  } catch (err) {
    console.error("Erro registros:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// --- Helper para ler perfis ---
function lerPerfis() {
    if (!fs.existsSync(perfisFilePath)) return {};
    try {
        return JSON.parse(fs.readFileSync(perfisFilePath, "utf-8"));
    } catch (e) { return {}; }
}

// Rota: Salvar Perfil
app.post("/api/salvar_perfil", (req, res) => {
    const { matricula, nickname, avatar, cleanMode } = req.body;

    if (!matricula) return res.json({ success: false, message: "Matrícula necessária" });

    const perfis = lerPerfis();
    
    perfis[matricula] = {
        nickname: nickname || "",
        avatar: avatar || "",
        cleanMode: cleanMode || false
    };

    fs.writeFileSync(perfisFilePath, JSON.stringify(perfis, null, 2), "utf-8");
    res.json({ success: true });
});

// Rota: Obter Perfil (MODIFICADA PARA RETORNAR STATUS 2FA)
app.get("/api/perfil/:matricula", (req, res) => {
    const { matricula } = req.params;
    
    // 1. Pega dados visuais
    const perfis = lerPerfis();
    const dadosPerfil = perfis[matricula] || {};

    // 2. Pega dados de segurança (2FA) do users.json
    let tem2FA = false;
    if (fs.existsSync(usersJsonPath)) {
        try {
            const users = JSON.parse(fs.readFileSync(usersJsonPath, "utf-8"));
            const u = users.find(user => user.matricula === matricula || user.id === matricula);
            if (u && u.twoFactorEnabled) {
                tem2FA = true;
            }
        } catch (e) {
            console.error("Erro ao ler status 2FA:", e);
        }
    }

    res.json({ 
        success: true, 
        data: {
            ...dadosPerfil,
            twoFactorEnabled: tem2FA // Envia para o front saber se deve mostrar "DESATIVAR"
        }
    });
});

// ==========================================================
// ROTA DE SEGURANÇA: SALVAR 2FA NO ARQUIVO JSON
// ==========================================================
app.post('/api/salvar_2fa', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Você precisa estar logado." });
    }

    const { secret, enabled } = req.body;
    const userId = req.session.user.id || req.session.user.matricula;

    try {
        if (!fs.existsSync(usersJsonPath)) fs.writeFileSync(usersJsonPath, '[]');
        
        const fileData = fs.readFileSync(usersJsonPath, 'utf8');
        let users = JSON.parse(fileData);

        // Encontra ou Cria
        let userIndex = users.findIndex(u => u.id === userId || u.matricula === userId);
        
        if (userIndex === -1) {
             const novoUser = {
                 id: userId,
                 matricula: req.session.user.matricula,
                 email: "auto@gerado.com"
             };
             users.push(novoUser);
             userIndex = users.length - 1;
        }

        if (enabled) {
            users[userIndex].twoFactorSecret = secret;
            users[userIndex].twoFactorEnabled = true;
            console.log(`[2FA] Ativado para: ${userId}`);
        } else {
            delete users[userIndex].twoFactorSecret;
            users[userIndex].twoFactorEnabled = false;
            console.log(`[2FA] Desativado para: ${userId}`);
        }

        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2));
        
        // Atualiza a sessão
        req.session.user.twoFactorEnabled = users[userIndex].twoFactorEnabled;
        req.session.save();

        return res.json({ success: true });

    } catch (err) {
        console.error("Erro ao salvar 2FA:", err);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// ==========================================================
// 6. INICIALIZAÇÃO SOCKET.IO + SSH (COM VALIDAÇÃO 2FA)
// ==========================================================

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
    console.log("Socket conectado. Aguardando credenciais SSH...");
    let sshConn = null;
    let streamRef = null;

    socket.on("ssh-login", (credentials) => {
        const { username, password, host, port, token, matriculaWeb } = credentials;

        // --- VALIDAÇÃO DE 2FA (AQUI É O SEGREDO) ---
        if (fs.existsSync(usersJsonPath)) {
            try {
                const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
                // Verifica o usuário WEB (quem está logado no site)
                const webUser = users.find(u => u.matricula === matriculaWeb || u.id === matriculaWeb);
                
                if (webUser && webUser.twoFactorEnabled && webUser.twoFactorSecret) {
                    // Se o usuário tem 2FA ativado, exigimos o token
                    if (!token) {
                        return socket.emit('ssh-status', { status: 'error', message: '🔒 Segurança 2FA: Digite o código do autenticador.' });
                    }

                    // Valida o token
                    const totp = new OTPAuth.TOTP({
                        algorithm: "SHA1", digits: 6, period: 30,
                        secret: OTPAuth.Secret.fromBase32(webUser.twoFactorSecret)
                    });
                    
                    const delta = totp.validate({ token: token, window: 1 });
                    if (delta === null) {
                        return socket.emit('ssh-status', { status: 'error', message: '❌ Código 2FA incorreto ou expirado.' });
                    }
                    console.log(`2FA Validado com sucesso para ${matriculaWeb}`);
                }
            } catch (e) { console.error("Erro validação 2FA Socket:", e); }
        }
        // ---------------------------------------------

        sshConn = new Client();

        sshConn.on('ready', () => {
            console.log(`SSH Conectado: ${username}@${host || 'localhost'}`);
            socket.emit('ssh-status', { status: 'connected', message: 'Conexão SSH estabelecida!' });

            // --- AQUI ESTÁ A CORREÇÃO DO NANO ---
            // Definimos que somos um terminal 'xterm-256color'
            const termConfig = {
                term: 'xterm-256color', // Isso avisa o Linux para limpar a tela ao sair do nano
                rows: 24,
                cols: 80
            };

            // Passamos a configuração aqui antes do callback
            sshConn.shell(termConfig, (err, stream) => {
                if (err) return socket.emit('ssh-status', { status: 'error', message: 'Erro ao abrir shell: ' + err.message });
                
                streamRef = stream;

                stream.on('data', (data) => {
                    socket.emit('terminal-output', data.toString());
                });

                stream.on('close', () => {
                    sshConn.end();
                    socket.emit('ssh-status', { status: 'disconnected', message: 'Sessão encerrada.' });
                });
            });
        });

        sshConn.on('error', (err) => {
            console.error("Erro SSH:", err);
            socket.emit('ssh-status', { status: 'error', message: 'Falha na autenticação ou conexão.' });
        });

        sshConn.on('end', () => {
            socket.emit('ssh-status', { status: 'disconnected', message: 'Desconectado.' });
        });

        try {
            sshConn.connect({
                host: host || '127.0.0.1',
                port: port || 22,
                username: username,
                password: password,
                algorithms: {
                    kex: ['diffie-hellman-group1-sha1', 'ecdh-sha2-nistp256', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1'],
                    cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-gcm', 'aes128-cbc', '3des-cbc']
                }
            });
        } catch (error) {
            socket.emit('ssh-status', { status: 'error', message: 'Erro de conexão: ' + error.message });
        }
    });

    socket.on("terminal-input", (data) => {
        if (streamRef) {
            streamRef.write(data);
        }
    });

    socket.on("terminal-resize", (size) => {
        if (streamRef) {
            streamRef.setWindow(size.rows, size.cols, size.height, size.width);
        }
    });

    socket.on("disconnect", () => {
        if (sshConn) sshConn.end();
        console.log("Cliente desconectado.");
    });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});