document.addEventListener("DOMContentLoaded", () => {
    
    // --- FUNÇÃO TOAST ---
    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return; 
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-warning-circle"></i>';
        toast.innerHTML = `${icon}<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // --- ELEMENTOS GERAIS ---
    const inputNomeDisplay = document.getElementById("inputNomeDisplay");
    const btnSalvarPerfil = document.getElementById("btnSalvarPerfil");
    const inputMatricula = document.getElementById("inputMatricula");
    const inputEmail = document.getElementById("inputEmail");
    const fileInput = document.getElementById("fileInput");
    const previewAvatar = document.getElementById("previewAvatar");
    const toggleCleanMode = document.getElementById("toggleCleanMode"); // Switch do tema
    
    // Senha
    const btnSalvarSenha = document.getElementById("btnSalvarSenha");
    const fieldSenhaAtual = document.getElementById("senhaAtual");
    const fieldSenhaNova = document.getElementById("senhaNova");
    const fieldSenhaConfirmar = document.getElementById("senhaConfirmar");

    const matriculaReal = sessionStorage.getItem("userMatricula") || localStorage.getItem("userMatricula") || "Usuário";

    // Limpa campos de senha
    if(fieldSenhaAtual) fieldSenhaAtual.value = "";
    if(fieldSenhaNova) fieldSenhaNova.value = "";
    if(fieldSenhaConfirmar) fieldSenhaConfirmar.value = "";

    if (inputMatricula) inputMatricula.value = matriculaReal;

    // ======================================================
    // 1. CARREGAMENTO INICIAL (SYNC SERVER)
    // ======================================================
    async function carregarPerfilServidor() {
        try {
            const res = await fetch(`/api/perfil/${matriculaReal}`);
            const json = await res.json();

            if (json.success && json.data) {
                const dados = json.data;

                // 1. Aplica Nickname
                if (inputNomeDisplay) inputNomeDisplay.value = dados.nickname || "";
                localStorage.setItem("userNickname", dados.nickname || "");
                const navName = document.getElementById("userName");
                if(navName) navName.textContent = dados.nickname || matriculaReal;

                // 2. Aplica Avatar
                if (dados.avatar) {
                    if (previewAvatar) previewAvatar.src = dados.avatar;
                    const navAvatar = document.getElementById("userAvatarNav");
                    if(navAvatar) navAvatar.src = dados.avatar;
                    localStorage.setItem("userAvatar", dados.avatar);
                }

                // 3. Aplica Tema
                const isClean = dados.cleanMode === true;
                localStorage.setItem("config_cleanMode", isClean);
                if (isClean) document.body.classList.add("clean-mode");
                else document.body.classList.remove("clean-mode");
                
                if (toggleCleanMode) toggleCleanMode.checked = isClean;

                // 4. CORREÇÃO CRÍTICA: Aplica Status 2FA do SERVIDOR
                // Se o servidor disse que tem 2FA, forçamos o botão para "DESATIVAR"
                if (typeof dados.twoFactorEnabled !== 'undefined') {
                    atualizarStatus2FA(dados.twoFactorEnabled);
                }
            }
        } catch (e) {
            console.log("Perfil ainda não criado no servidor, usando local.", e);
            carregarDoLocalStorage();
        }
    }

    function carregarDoLocalStorage() {
        if (inputNomeDisplay) inputNomeDisplay.value = localStorage.getItem("userNickname") || "";
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedAvatar && previewAvatar) previewAvatar.src = savedAvatar;
        const savedMode = localStorage.getItem("config_cleanMode") === "true";
        if (toggleCleanMode) toggleCleanMode.checked = savedMode;
    }

    // Executa o carregamento
    carregarPerfilServidor();

    // Carrega Email (vem de outra API)
    fetch("/api/registros")
        .then(res => res.json())
        .then(dados => {
            if(Array.isArray(dados)){
                const user = dados.find(r => r.matricula === matriculaReal);
                if(user && user.email && inputEmail) {
                    inputEmail.value = user.email;
                }
            }
        })
        .catch(() => {});

    // --- SALVAR PERFIL ---
    let avatarBase64Temporario = localStorage.getItem("userAvatar") || "";

    if (fileInput) {
        fileInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    return showToast("A imagem deve ter no máximo 2MB.", "error");
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarBase64Temporario = e.target.result;
                    if (previewAvatar) previewAvatar.src = avatarBase64Temporario;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnSalvarPerfil) {
        btnSalvarPerfil.addEventListener("click", async () => {
            const btnOriginalText = btnSalvarPerfil.innerText;
            btnSalvarPerfil.innerText = "SALVANDO...";
            btnSalvarPerfil.disabled = true;

            const nome = inputNomeDisplay.value.trim();
            
            let isClean = false;
            if (toggleCleanMode) isClean = toggleCleanMode.checked;
            else isClean = document.body.classList.contains("clean-mode");

            try {
                const res = await fetch("/api/salvar_perfil", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        matricula: matriculaReal,
                        nickname: nome,
                        avatar: avatarBase64Temporario,
                        cleanMode: isClean
                    })
                });

                const json = await res.json();

                if (json.success) {
                    localStorage.setItem("userNickname", nome);
                    localStorage.setItem("userAvatar", avatarBase64Temporario);
                    localStorage.setItem("config_cleanMode", isClean);

                    const navName = document.getElementById("userName");
                    if(navName) navName.textContent = nome || matriculaReal;
                    const navAvatar = document.getElementById("userAvatarNav");
                    if(navAvatar) navAvatar.src = avatarBase64Temporario;

                    if (isClean) document.body.classList.add("clean-mode");
                    else document.body.classList.remove("clean-mode");
                    window.dispatchEvent(new Event("themeChanged"));
                    
                    showToast("Perfil salvo na nuvem com sucesso!", "success");
                } else {
                    showToast("Erro ao salvar: " + json.message, "error");
                }

            } catch (err) {
                console.error(err);
                showToast("Erro de conexão com o servidor.", "error");
            } finally {
                btnSalvarPerfil.innerText = btnOriginalText;
                btnSalvarPerfil.disabled = false;
            }
        });
    }

    // --- ALTERAR SENHA ---
    if (btnSalvarSenha) {
        btnSalvarSenha.addEventListener("click", async () => {
            const atual = fieldSenhaAtual.value;
            const nova = fieldSenhaNova.value;
            const conf = fieldSenhaConfirmar.value;

            if (!atual || !nova || !conf) return showToast("Preencha todos os campos.", "error");
            if (nova !== conf) return showToast("As novas senhas não coincidem.", "error");
            if (nova.length < 8) return showToast("Senha muito curta (mínimo 8).", "error");

            const textoOriginal = btnSalvarSenha.innerText;
            btnSalvarSenha.innerText = "VERIFICANDO...";
            btnSalvarSenha.disabled = true;

            try {
                const res = await fetch("/api/mudar_senha", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ matricula: matriculaReal, senhaAtual: atual, novaSenha: nova })
                });

                const json = await res.json();
                if (json.success) {
                    showToast("Senha alterada com sucesso!", "success");
                    fieldSenhaAtual.value = "";
                    fieldSenhaNova.value = "";
                    fieldSenhaConfirmar.value = "";
                } else {
                    showToast("Erro: " + json.message, "error");
                }
            } catch (erro) {
                showToast("Erro de conexão com o servidor.", "error");
            } finally {
                btnSalvarSenha.innerText = textoOriginal;
                btnSalvarSenha.disabled = false;
            }
        });
    }

    // Validação Visual Senha
    function validarVisual() {
        const s1 = fieldSenhaNova.value;
        const s2 = fieldSenhaConfirmar.value;
        const g1 = document.getElementById('groupNovaSenha');
        const g2 = document.getElementById('groupConfirmarSenha');
        
        if(g1) g1.classList.remove('valid', 'invalid');
        if(g2) g2.classList.remove('valid', 'invalid');

        if (s1.length < 8 && s1.length > 0) { if(g1) g1.classList.add('invalid'); return; }
        if (s1 === s2 && s1.length >= 8) { if(g1) g1.classList.add('valid'); if(g2) g2.classList.add('valid'); }
        else if (s2.length > 0) { if(g2) g2.classList.add('invalid'); }
    }
    if(fieldSenhaNova && fieldSenhaConfirmar) {
        fieldSenhaNova.addEventListener('input', validarVisual);
        fieldSenhaConfirmar.addEventListener('input', validarVisual);
    }

    // ======================================================
    // 5. 2FA (CORRIGIDO E COMPLETO)
    // ======================================================
    const btnSetup2FA = document.getElementById('btnSetup2FA');
    const modalSetup = document.getElementById('modalSetup2FA');
    const btnCancelSetup = document.getElementById('btnCancelSetup');
    const btnFinishSetup = document.getElementById('btnFinishSetup');
    const inputVerify = document.getElementById('inputVerify2FA');
    const qrContainer = document.getElementById('qrCodeContainer');
    const secretTextDisplay = document.getElementById('secretTextDisplay');
    let secretTemporario = null;

    // Atualiza visual do botão
    function atualizarStatus2FA(ativo) {
        if (!btnSetup2FA) return;
        const desc = btnSetup2FA.previousElementSibling.querySelector('.setting-desc');
        if (ativo) {
            btnSetup2FA.textContent = "DESATIVAR";
            btnSetup2FA.classList.add('btn-danger');
            btnSetup2FA.dataset.status = "active";
            // Remove token do localStorage para garantir que a fonte é o server
            localStorage.removeItem('user_2fa_secret'); 
            if(desc) desc.innerHTML = '<span style="color: #2CFF05"><i class="ph ph-check-circle"></i> Proteção Ativa</span>';
        } else {
            btnSetup2FA.textContent = "ATIVAR";
            btnSetup2FA.classList.remove('btn-danger');
            btnSetup2FA.dataset.status = "inactive";
            if(desc) desc.textContent = "Proteger acesso ao terminal.";
        }
    }

    // Tenta detectar estado inicial pelo texto (fallback visual)
    if(btnSetup2FA && btnSetup2FA.textContent.includes("DESATIVAR")) atualizarStatus2FA(true);

    if (btnSetup2FA) {
        btnSetup2FA.addEventListener('click', async () => {
            const estaAtivo = btnSetup2FA.dataset.status === "active" || btnSetup2FA.textContent.includes("DESATIVAR");

            // DESATIVAR
            if (estaAtivo) {
                const confirmar = confirm("Tem certeza? Isso deixará sua conta menos segura.");
                if (confirmar) {
                    try {
                        const res = await fetch("/api/salvar_2fa", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: 'include',
                            body: JSON.stringify({ enabled: false })
                        });
                        const data = await res.json();

                        if (data.success) {
                            localStorage.removeItem('user_2fa_secret');
                            atualizarStatus2FA(false);
                            showToast("2FA Desativado.", "success");
                        } else {
                            if(res.status === 401) showToast("Sessão expirada. Recarregue a página.", "error");
                            else showToast("Erro: " + data.error, "error");
                        }
                    } catch (e) {
                        showToast("Erro de conexão.", "error");
                    }
                }
                return;
            }

            // ATIVAR (Gera QR Code Local)
            try {
                const secret = new OTPAuth.Secret({ size: 20 });
                secretTemporario = secret.base32;

                const totp = new OTPAuth.TOTP({
                    issuer: "Engine",
                    label: matriculaReal,
                    algorithm: "SHA1",
                    digits: 6,
                    period: 30,
                    secret: secret
                });
                
                qrContainer.innerHTML = "";
                new QRCode(qrContainer, {
                    text: totp.toString(),
                    width: 160,
                    height: 160,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.M
                });

                secretTextDisplay.textContent = secretTemporario;
                modalSetup.classList.remove('hidden');
                inputVerify.value = "";
                inputVerify.focus();

            } catch (e) {
                console.error("Erro libs:", e);
                showToast("Erro ao carregar bibliotecas.", "error");
            }
        });
    }

    if (btnCancelSetup) {
        btnCancelSetup.addEventListener('click', () => {
            modalSetup.classList.add('hidden');
            secretTemporario = null;
        });
    }

    if (btnFinishSetup) {
        btnFinishSetup.addEventListener('click', async () => {
            const tokenDigitado = inputVerify.value.trim();
            if (!secretTemporario) return;

            try {
                const totp = new OTPAuth.TOTP({
                    algorithm: "SHA1",
                    digits: 6,
                    period: 30,
                    secret: OTPAuth.Secret.fromBase32(secretTemporario)
                });

                if (totp.validate({ token: tokenDigitado, window: 1 }) !== null) {
                    const res = await fetch("/api/salvar_2fa", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: 'include',
                        body: JSON.stringify({ secret: secretTemporario, enabled: true })
                    });
                    const data = await res.json();

                    if (data.success) {
                        localStorage.removeItem('user_2fa_secret');
                        modalSetup.classList.add('hidden');
                        atualizarStatus2FA(true);
                        showToast("2FA Ativado e Salvo no Servidor!", "success");
                    } else {
                        if(res.status === 401) showToast("Erro: Você foi desconectado. Faça login novamente.", "error");
                        else showToast("Erro ao salvar: " + data.error, "error");
                    }
                } else {
                    showToast("Código inválido.", "error");
                    inputVerify.value = "";
                    inputVerify.focus();
                }
            } catch (e) {
                console.error(e);
                showToast("Erro técnico.", "error");
            }
        });
    }
});