// ARQUIVO: add_user.js
// Rode no terminal: node add_user.js <MATRICULA> <SENHA>

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Pega os argumentos do terminal
const args = process.argv.slice(2);
const matricula = args[0];
const senha = args[1];

if (!matricula || !senha) {
    console.log("Erro: Faltou matrícula ou senha.");
    console.log("Uso correto: node add_user.js 25214290020 123456");
    process.exit(1);
}

// Define o caminho do arquivo
const dataDir = path.join(process.cwd(), "data");
const usersFilePath = path.join(dataDir, "usuarios.txt");

// 1. Cria a criptografia (Hash)
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(senha, salt);

// 2. Prepara a linha para salvar
const novaLinha = `${matricula},${hash}\n`;

// 3. Salva no arquivo (cria a pasta se não existir)
try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    
    // Se quiser limpar o arquivo antes de adicionar (já que você só tem 1 usuário),
    // descomente a linha abaixo. Se quiser manter os antigos, deixe comentado.
    // fs.writeFileSync(usersFilePath, ""); 

    fs.appendFileSync(usersFilePath, novaLinha, "utf-8");
    
    console.log("Usuário criado/adicionado com segurança!");
    console.log(`Matrícula: ${matricula}`);
    console.log(`Hash gerado: ${hash}`);
} catch (err) {
    console.error("Erro ao salvar:", err);
}