document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. DADOS ---
    const userMatricula = sessionStorage.getItem("userMatricula") || "";
    const sshUserInput = document.getElementById("sshUser");
    if(sshUserInput && userMatricula) sshUserInput.value = userMatricula;

    // --- 2. ELEMENTOS ---
    const sshGate = document.getElementById("sshGate");
    const dashboard = document.getElementById("serverDashboard");
    
    const formSSH = document.getElementById("formSSH");
    const rowPass = document.getElementById("rowPass");
    const inputUser = document.getElementById("sshUser");
    const inputPass = document.getElementById("sshPass");
    
    // O JS tenta pegar isso. Se não achar, será null (e trataremos isso abaixo)
    const statusText = document.getElementById("statusText");
    
    // Modal 2FA
    const modal2FA = document.getElementById("securityModal");
    const input2FA = document.getElementById("input2FA");
    const btnConfirm2FA = document.getElementById("btnConfirm2FA");
    const btnCancel2FA = document.getElementById("btnCancel2FA");

    const uptimeEl = document.getElementById("uptimeCounter");
    const consoleOutput = document.getElementById("consoleOutput");
    const cmdInput = document.getElementById("cmdInput");

    // --- 3. FLUXO DE LOGIN (User -> Pass -> 2FA) ---
    
    formSSH.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // ETAPA 1: Usuário digitado?
        if (rowPass.classList.contains("hidden")) {
            if(inputUser.value.trim() === "") {
                // [FIX] Só exibe erro se o elemento de texto existir
                if (statusText) {
                    statusText.innerText = "Usuário requisitado.";
                    statusText.style.color = "#ef4444";
                }
                // Se não existir texto, podemos adicionar uma borda vermelha no input para feedback visual
                inputUser.style.borderColor = "#ef4444";
                setTimeout(() => inputUser.style.borderColor = "", 2000);
                return;
            }
            
            rowPass.classList.remove("hidden");
            
            // [FIX] Verifica se statusText existe antes de alterar
            if (statusText) {
                statusText.innerText = "Insira a sua senha...";
                statusText.style.color = "#6b7280";
            }
            
            inputPass.focus();
        } 
        // ETAPA 2: Senha digitada? -> CHAMA O 2FA
        else {
            if (inputPass.value.length > 0) {
                const secret = localStorage.getItem('user_2fa_secret');
                
                if (!secret) {
                    alert("ERRO: Você precisa configurar o 2FA nas Configurações antes de acessar o terminal.");
                    window.location.href = "/configuracoes";
                    return;
                }

                // Abre Modal 2FA
                modal2FA.classList.remove("hidden");
                input2FA.value = "";
                input2FA.focus();
            }
        }
    });

    // --- 4. LÓGICA DO 2FA ---

    function validar2FA() {
        const tokenDigitado = input2FA.value.trim();
        const secret = localStorage.getItem('user_2fa_secret');

        if (!secret) return;

        try {
            const totp = new OTPAuth.TOTP({
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(secret)
            });

            const delta = totp.validate({ token: tokenDigitado, window: 1 });

            if (delta !== null) {
                // SUCESSO ABSOLUTO!
                modal2FA.classList.add("hidden");
                executarLoginSucesso();
            } else {
                // ERRO
                input2FA.style.borderColor = "#ef4444";
                input2FA.classList.add("shake");
                setTimeout(() => input2FA.classList.remove("shake"), 400);
                input2FA.value = "";
                input2FA.focus();
                // Usa o sistema de toast se disponível, senão falha silenciosamente ou alert
                if(window.showToast) window.showToast("Código Inválido", "error");
            }
        } catch (e) {
            console.error(e);
            alert("Erro na validação do token.");
        }
    }

    // Eventos do Modal
    if(btnConfirm2FA) btnConfirm2FA.addEventListener("click", validar2FA);
    
    if(input2FA) {
        input2FA.addEventListener("keypress", (e) => {
            if(e.key === "Enter") validar2FA();
        });
    }

    if(btnCancel2FA) {
        btnCancel2FA.addEventListener("click", () => {
            modal2FA.classList.add("hidden");
            inputPass.value = ""; // Limpa senha para forçar redigitar
            inputPass.focus();
        });
    }


    // --- 5. TRANSIÇÃO DE SUCESSO ---
    function executarLoginSucesso() {
        // [FIX] Verifica se statusText existe antes de alterar
        if (statusText) {
            statusText.innerText = "Credentials verified. Establishing connection...";
            statusText.style.color = "#10b981"; 
        }
        
        // Simula delay de conexão SSH
        setTimeout(() => {
            sshGate.style.opacity = "0"; // Fade out
            setTimeout(() => {
                sshGate.style.display = "none";
                dashboard.classList.remove("hidden");
                iniciarSistema();
            }, 500);
        }, 800);
    }


    // --- 6. SISTEMA DASHBOARD (Mantido igual) ---
    function iniciarSistema() {
        iniciarRelogio();
        iniciarGraficoRede();
        iniciarLogs();
    }

    function iniciarRelogio() {
        let s = 0;
        setInterval(() => {
            s++;
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            if(uptimeEl) uptimeEl.innerText = `${h}h ${m}m ${s%60}s`;
        }, 1000);
    }

    function iniciarGraficoRede() {
        const canvas = document.getElementById('networkChart');
        if (!canvas) return; // Segurança extra

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); 
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: Array(20).fill(50),
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } },
                animation: { duration: 0 }
            }
        });

        setInterval(() => {
            const data = chart.data.datasets[0].data;
            data.shift(); data.push(Math.random() * 60 + 20);
            chart.update();
        }, 1000);
    }

    function log(msg, type = 'info') {
        if(!consoleOutput) return; // Segurança extra

        const div = document.createElement('div');
        div.className = 'log-line';
        const ts = new Date().toLocaleTimeString('pt-BR', { hour12: false });
        
        let colorClass = 'log-info';
        if(type === 'sys') colorClass = 'log-sys';
        if(type === 'err') colorClass = 'log-err';
        
        div.innerHTML = `<span class="log-ts">[${ts}]</span> <span class="${colorClass}">${msg}</span>`;
        consoleOutput.appendChild(div);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function iniciarLogs() {
        const user = (inputUser && inputUser.value) ? inputUser.value : "root";
        const boot = [
            { t: 100, m: "System process initialized.", type: 'sys' },
            { t: 600, m: "Establishing secure tunnel (TLS v1.3)...", type: 'info' },
            { t: 1200, m: "Authorized access confirmed via 2FA.", type: 'sys' },
            { t: 1800, m: `Welcome back, ${user}.`, type: 'sys' }
        ];
        boot.forEach(item => setTimeout(() => log(item.m, item.type), item.t));
    }

    if(cmdInput) {
        cmdInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter" && cmdInput.value.trim()) {
                const cmd = cmdInput.value;
                const user = (inputUser && inputUser.value) ? inputUser.value : "root";
                log(`${user}$ ${cmd}`, 'info');
                cmdInput.value = "";
                if(cmd === 'clear' && consoleOutput) consoleOutput.innerHTML = "";
            }
        });
    }
});