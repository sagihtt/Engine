// ==========================================================
// Engine Labs - Global Controller (V3.2: Final Clean Version)
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. INICIALIZAÇÃO DO TEMA
    const isClean = localStorage.getItem("config_cleanMode") === "true";
    if (isClean) document.body.classList.add("clean-mode");

    // =========================================================
    // 2. CARREGAR DADOS NA NAVBAR (USANDO APENAS userMatricula)
    // =========================================================
    const userNameNav = document.getElementById("userName");
    const userAvatarNav = document.getElementById("userAvatarNav");
    
    // --- MUDANÇA AQUI: Agora busca só a variável oficial ---
    const matricula = localStorage.getItem("userMatricula"); 
    
    if (matricula) {
        // A. Carrega do Cache (Rápido)
        const nicknameCache = localStorage.getItem("userNickname");
        const avatarCache = localStorage.getItem("userAvatar");

        if (userNameNav) userNameNav.textContent = nicknameCache || matricula;
        if (userAvatarNav && avatarCache) userAvatarNav.src = avatarCache;
        
        // B. Atualiza em Segundo Plano (Servidor)
        try {
            const res = await fetch(`/api/perfil/${matricula}`);
            const json = await res.json();

            if (json.success && json.data) {
                const dados = json.data;

                // Atualiza UI
                if (userNameNav && dados.nickname) userNameNav.textContent = dados.nickname;
                if (userAvatarNav && dados.avatar) userAvatarNav.src = dados.avatar;

                // Sincroniza Tema
                if (dados.cleanMode === true) {
                    document.body.classList.add("clean-mode");
                    localStorage.setItem("config_cleanMode", "true");
                } else {
                    document.body.classList.remove("clean-mode");
                    localStorage.setItem("config_cleanMode", "false");
                }

                // Atualiza Cache
                localStorage.setItem("userNickname", dados.nickname || "");
                if (dados.avatar) localStorage.setItem("userAvatar", dados.avatar);
            }
        } catch (e) {
            console.error("Sync silencioso falhou:", e);
        }
    }

    // =========================================================
    // 3. MENU DROPDOWN
    // =========================================================
    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");

    if (userBtn && userDropdown) {
        const newBtn = userBtn.cloneNode(true);
        userBtn.parentNode.replaceChild(newBtn, userBtn);
        
        newBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.drpGlobal && window.drpGlobal.container) window.drpGlobal.hide();
            userDropdown.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!newBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add("hidden");
            }
        });
    }

    // =========================================================
    // 4. LOGOUT (Limpa apenas as variáveis oficiais)
    // =========================================================
    const logoutLinks = document.querySelectorAll('a[href="/logout"], .btn-logout');
    
    logoutLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); 
            
            // Limpa tudo
            localStorage.removeItem("userNickname");
            localStorage.removeItem("userAvatar");
            localStorage.removeItem("userMatricula"); // <--- A ÚNICA QUE IMPORTA
            localStorage.removeItem("user_profile");
            localStorage.removeItem("config_cleanMode");
            sessionStorage.clear();

            window.location.href = "/logout";
        });
    });

    // =========================================================
    // 5. BOTÃO DE TEMA (NAVBAR)
    // =========================================================
    const btnToggleThemeNav = document.getElementById("btnToggleThemeNav");

    if (btnToggleThemeNav) {
        btnToggleThemeNav.addEventListener("click", (e) => {
            e.preventDefault(); e.stopPropagation(); 
            const currentMode = localStorage.getItem("config_cleanMode") === "true";
            const newMode = !currentMode;
            localStorage.setItem("config_cleanMode", newMode);
            if (newMode) document.body.classList.add("clean-mode");
            else document.body.classList.remove("clean-mode");
            
            const switchConfig = document.getElementById("toggleCleanMode");
            if (switchConfig) switchConfig.checked = newMode;
            window.dispatchEvent(new Event("themeChanged"));
        });
    }
});