/**
 * Engine Auth Guard (Produção)
 * Protege rotas verificando sessionStorage
 */
(function() {
    // 1. Arquivos Públicos
    const publicPages = ['index.html', 'login.html', ''];

    // 2. Detecta página atual
    let path = window.location.pathname.split('/').pop();
    if (path === "") path = "index.html";

    // 3. Verificação de Segurança
    if (!publicPages.includes(path)) {
        // Agora verifica na SESSÃO (que morre ao fechar o navegador)
        const user = sessionStorage.getItem("userMatricula");

        if (!user) {
            // Se não tiver login, chuta para fora
            window.location.href = "/logout";
        }
    }
})();