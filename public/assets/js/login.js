// ==========================================================
// Engine Labs - Login Script (Com Toasts)
// ==========================================================

// Função para mostrar notificação de erro
function showErrorToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast error'; // Sempre estilo erro aqui
    
    // Ícone de alerta do Font Awesome
    toast.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);

    // Remove após 3.5 segundos
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const matricula = document.getElementById("matricula").value.trim();
  const senha = document.getElementById("senha").value.trim();

  try {
    const resposta = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha }),
    });

    // 1. AQUI MUDOU: Lemos o JSON que o servidor mandou
    const data = await resposta.json();

    // 2. Checamos se data.success é true (que vem do server.js)
    if (data.success) {
      // Guarda matricula pro frontend (navbar) usar depois
      localStorage.setItem("userMatricula", matricula);
      
      // 3. SEGUE O MESTRE: Redireciona para onde o servidor mandou (/dashboard)
      window.location.href = data.redirect; 
    } else {
      // Se falhar
      showErrorToast("Credenciais inválidas. Tente novamente.");
      
      document.getElementById("senha").value = "";
      document.getElementById("senha").focus();
    }
  } catch (erro) {
    console.error("Erro ao tentar login:", erro);
    showErrorToast("Erro de conexão com o servidor.");
  }
});

// Limpa campos ao voltar
window.addEventListener("pageshow", () => {
  const form = document.getElementById("loginForm");
  if (form) form.reset();
});