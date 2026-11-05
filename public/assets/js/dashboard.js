// ==========================================================
// Engine Labs - Command Center (V13: Auto-Filter Fixed)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    // Inicia carregando o mês atual automaticamente
    carregarRegistros();
});

// ==========================
// 1. Elementos e UI
// ==========================
const btnRegistros = document.getElementById("btnRegistros");
const userBtn = document.getElementById("userBtn");
const userDropdown = document.getElementById("userDropdown");
const userName = document.getElementById("userName");
const userMatriculaDisplay = document.getElementById("userMatriculaDisplay");
const btnLoadMore = document.getElementById("btnLoadMore"); 
const labelDateRange = document.getElementById("dateRangePickerLabel"); // Elemento da data no HTML

// --- CARREGAR TEMA (GLOBAL) ---
const isCleanMode = localStorage.getItem("config_cleanMode") === "true";
if (isCleanMode) {
    document.body.classList.add("clean-mode");
}

// --- LÓGICA DO AVATAR ---
const userAvatarNav = document.getElementById("userAvatarNav");
const savedAvatar = localStorage.getItem("userAvatar");
const sessionAvatar = sessionStorage.getItem("userAvatar");

if (userAvatarNav) {
    if (sessionAvatar) userAvatarNav.src = sessionAvatar;
    else if (savedAvatar) userAvatarNav.src = savedAvatar;
}

// Variáveis Globais de Paginação
let DADOS_FILTRADOS_CACHE = []; 
let ITENS_MOSTRADOS = 0; 
const PASSO_PAGINACAO = 10; 

// Matrícula
const matricula = sessionStorage.getItem("userMatricula") || localStorage.getItem("userMatricula") || "Usuário";
const nickname = sessionStorage.getItem("userNickname") || localStorage.getItem("userNickname");

if (userName) userName.textContent = nickname || matricula;
if (userMatriculaDisplay) userMatriculaDisplay.textContent = ` ${matricula}`;

// Dropdown Toggle
if (userDropdown) userDropdown.classList.add("hidden");
if (userBtn) {
  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.drpGlobal && window.drpGlobal.container.is(':visible')) {
        window.drpGlobal.hide();
    }
    if (userDropdown) userDropdown.classList.toggle("hidden");
  });
}
document.addEventListener("click", (e) => {
  if (userBtn && !userBtn.contains(e.target) && userDropdown && !userDropdown.contains(e.target)) {
    userDropdown.classList.add("hidden");
  }
});

// Botão Carregar Mais
if (btnLoadMore) {
  btnLoadMore.addEventListener("click", () => {
    renderizarLoteTabela();
  });
}

// ==========================
// 2. Configurações de Meta e Cores
// ==========================
const HORAS_DIARIAS_META = 1;   
const META_MENSAL_CONTRATO = 15; 
const USA_META_FIXA = true;
let chartGeral, chartUser, chartTimeline;
const FERIADOS = ["25/12", "01/01"];

function getThemeColors() {
    const isClean = document.body.classList.contains("clean-mode");
    return {
        start: isClean ? "#ffffff" : "#ff4fa3",
        end:   isClean ? "#666666" : "#7c4dff",
        bg:    isClean ? "#222222" : "#1a1a1a",
        text:  isClean ? "#888888" : "#cccccc"
    };
}

function contarDiasUteis(inicio, fim) {
  if (!inicio || !fim) return 0;
  let count = 0;
  let cur = new Date(inicio);
  cur.setHours(0, 0, 0, 0);
  let end = new Date(fim);
  end.setHours(0, 0, 0, 0);
  
  if (cur > end) return 0;
  
  let safety = 0;
  while (cur <= end && safety < 3660) {
    safety++;
    const day = cur.getDay();
    const diaMes = cur.getDate().toString().padStart(2, "0") + "/" + (cur.getMonth() + 1).toString().padStart(2, "0");
    if (day !== 0 && day !== 6 && !FERIADOS.includes(diaMes)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function getDiasUteisRestantesMes() {
  const hoje = new Date();
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const hojeZero = new Date(hoje);
  hojeZero.setHours(0, 0, 0, 0);
  const ultimoZero = new Date(ultimoDia);
  ultimoZero.setHours(0, 0, 0, 0);
  
  if (hojeZero >= ultimoZero) return 0;
  
  let amanha = new Date(hojeZero);
  amanha.setDate(amanha.getDate() + 1);
  return contarDiasUteis(amanha, ultimoZero);
}

function criarGraficoRosca(ctx, totalHoras, metaHoras) {
  if (!ctx) return;
  const colors = getThemeColors(); 

  const horasTrabalhadas = Math.min(totalHoras, metaHoras);
  const horasRestantes = Math.max(metaHoras - totalHoras, 0);
  
  const gradiente = ctx.createLinearGradient(0, 0, 0, 300);
  gradiente.addColorStop(0, colors.start);
  gradiente.addColorStop(1, colors.end);

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Concluído", "Falta"],
      datasets: [{
          data: [horasTrabalhadas, horasRestantes],
          backgroundColor: [gradiente, colors.bg],
          borderWidth: 0,
          borderRadius: 5,
          hoverOffset: 3,
        }],
    },
    options: {
      cutout: "60%",
      rotation: -90,
      circumference: 270,
      animation: { animateRotate: true, duration: 1200, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#151515",
          borderColor: "#333",
          borderWidth: 1,
          callbacks: { label: (ctx) => ` ${ctx.parsed.toFixed(1)}h` },
        },
      },
    },
  });
}

// ==========================
// 3. Lógica de Tabela
// ==========================
function renderizarLoteTabela() {
  const tabela = document.querySelector("#registrosTable tbody");
  if (!tabela) return;

  const proximoIndice = ITENS_MOSTRADOS + PASSO_PAGINACAO;
  const lote = DADOS_FILTRADOS_CACHE.slice(ITENS_MOSTRADOS, proximoIndice);

  const htmlLote = lote.map((r) => {
      let saidaFormatada = r.saida;
      if (r.saida && r.saida.includes(' ')) {
          const parts = r.saida.split(' '); 
          saidaFormatada = `<span class="desktop-date-part">${parts[0]}</span> ${parts[1]}`;
      }

      return `
      <tr>
        <td>${r.matricula}</td>
        <td>${r.email}</td>
        <td>${r.entrada}</td>
        <td>${saidaFormatada}</td> 
        <td>${parseFloat(r.duracao).toFixed(1)}</td>
        <td>${r.mes}</td>
        <td>${r.semana}</td>
      </tr>`;
    }).join("");

  tabela.insertAdjacentHTML("beforeend", htmlLote);
  ITENS_MOSTRADOS = proximoIndice;

  if (btnLoadMore) {
    if (ITENS_MOSTRADOS >= DADOS_FILTRADOS_CACHE.length) {
      btnLoadMore.classList.add("hidden"); 
    } else {
      btnLoadMore.classList.remove("hidden"); 
    }
  }
}

// ==========================
// 4. Carregar Registros (Lógica Central)
// ==========================
async function carregarRegistros(filtroMes = null, filtroSemana = null, inicio = null, fim = null) {
  const tabela = document.querySelector("#registrosTable tbody");
  if (tabela) tabela.innerHTML = ""; 
  ITENS_MOSTRADOS = 0; 
  DADOS_FILTRADOS_CACHE = []; 

  // --- Elementos UI ---
  const elSaldo = document.getElementById("kpiSaldo");
  const elMedia = document.getElementById("kpiMedia");
  const elDiasRest = document.getElementById("kpiDiasRest");
  const elEficiencia = document.getElementById("kpiEficiencia");
  const elBadge = document.getElementById("userStatusBadge");
  const barraProgresso = document.getElementById("progressBar");
  const progressoTexto = document.getElementById("progressText");
  const cvGeral = document.getElementById("chartGeral");
  const cvUser = document.getElementById("chartUser");
  const cvTimeline = document.getElementById("chartTimeline");

  // --- 1. Definição Precisa das Datas ---
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  let dataInicioCalc, dataFimCalc;

  if (inicio && fim) {
    // Se veio do DatePicker (YYYY-MM-DD)
    dataInicioCalc = new Date(inicio + "T00:00:00");
    dataFimCalc = new Date(fim + "T23:59:59");
  } else {
    // PADRÃO: 1º dia do Mês ATUAL até Último dia do Mês ATUAL
    dataInicioCalc = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    dataFimCalc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0); // O dia 0 do próximo mês é o último deste
    dataFimCalc.setHours(23, 59, 59, 999);
  }

  // --- FIX VISUAL: Atualiza o texto do calendário no HTML ---
  if (labelDateRange) {
      // Formata DD/MM/YYYY
      const fmtIni = dataInicioCalc.toLocaleDateString('pt-BR');
      const fmtFim = dataFimCalc.toLocaleDateString('pt-BR');
      labelDateRange.textContent = `${fmtIni} - ${fmtFim}`;
  }

  // --- 2. Cálculo da Meta Dinâmica ---
  let META_TOTAL = 0;
  if (USA_META_FIXA) {
    const diffTime = Math.abs(dataFimCalc - dataInicioCalc);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 28) META_TOTAL = META_MENSAL_CONTRATO;
    else META_TOTAL = contarDiasUteis(dataInicioCalc, dataFimCalc) * HORAS_DIARIAS_META;
  } else {
    META_TOTAL = contarDiasUteis(dataInicioCalc, dataFimCalc) * HORAS_DIARIAS_META;
  }

  // --- 3. Cálculo de Ritmo ---
  let proporcaoMes = 1;
  if (dataFimCalc >= hoje && dataInicioCalc <= hoje) {
    const diasUteisPassados = contarDiasUteis(dataInicioCalc, hoje);
    const diasUteisTotaisMes = contarDiasUteis(dataInicioCalc, dataFimCalc);
    if (diasUteisTotaisMes > 0) proporcaoMes = diasUteisPassados / diasUteisTotaisMes;
  } else if (dataInicioCalc > hoje) {
    proporcaoMes = 0; 
  }
  const META_RITMO = META_TOTAL * proporcaoMes;

  // --- 4. Fetch e FILTRAGEM RIGOROSA ---
  let rawData = [];
  try {
    const res = await fetch("/api/registros");
    if (!res.ok) throw new Error(`Erro API: ${res.status}`);
    rawData = await res.json();
  } catch (err) {
    console.error(err);
    if (tabela) tabela.innerHTML = "<tr><td colspan='7'>Erro na API. Verifique o console.</td></tr>";
    return;
  }

  // [CORREÇÃO CRÍTICA] O FILTRO AGORA ACONTECE SEMPRE
  DADOS_FILTRADOS_CACHE = rawData.filter((r) => {
      if (!r.entrada) return false;
      
      const dataStr = r.entrada.split(" ")[0]; // Pega só a data
      let d;
      
      if (dataStr.includes("-")) {
          // ISO: YYYY-MM-DD
          const parts = dataStr.split("-");
          d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
          // BR: DD/MM/YYYY
          const parts = dataStr.split("/");
          d = new Date(parts[2], parts[1] - 1, parts[0]);
      }
      
      return d >= dataInicioCalc && d <= dataFimCalc;
  });

  renderizarLoteTabela();

  // --- 5. KPIs e Gráficos (Baseados no Cache Filtrado) ---
  const userData = DADOS_FILTRADOS_CACHE.filter((r) => r.matricula === matricula);
  const totalHorasUser = userData.reduce((acc, r) => acc + parseFloat(r.duracao || 0), 0);
  const saldoRitmo = totalHorasUser - META_RITMO;
  const saldoFinal = totalHorasUser - META_TOTAL;
  const metaBatida = totalHorasUser >= (META_TOTAL - 0.1);

  let statusClass = "status-stable";
  let statusText = "Em Dia";
  if (metaBatida) {
    statusText = "Concluído";
    statusClass = "status-overclock";
  } else {
    if (saldoRitmo > 0.5) {
      statusText = "Adiantado";
      statusClass = "status-overclock";
    } else if (saldoRitmo < -0.5) {
      statusText = "Atrasado";
      statusClass = "status-lagging";
    }
  }

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const isPeriodoPassado = dataFimCalc < ontem;
  
  let userRestantes = 0;
  let userPerdidas = 0;

  if (metaBatida) {
    userRestantes = 0;
    userPerdidas = 0;
  } else {
    if (isPeriodoPassado) userPerdidas = Math.max(META_TOTAL - totalHorasUser, 0);
    else userRestantes = Math.max(META_TOTAL - totalHorasUser, 0);
  }

  const diasTrab = new Set(userData.map((r) => r.entrada.split(" ")[0])).size;
  const mediaDiaria = diasTrab > 0 ? totalHorasUser / diasTrab : 0;
  const eficiencia = (mediaDiaria / HORAS_DIARIAS_META) * 100;

  if (elSaldo) {
    elSaldo.textContent = (saldoFinal > 0 ? "+" : "") + saldoFinal.toFixed(1) + "h";
    elSaldo.className = "kpi-value " + (saldoFinal >= 0 ? "val-pos" : "val-neg");
  }
  if (elBadge) {
    elBadge.className = "status-badge " + statusClass;
    elBadge.textContent = statusText;
  }
  if (elMedia) {
    const h = Math.floor(mediaDiaria);
    const m = Math.round((mediaDiaria - h) * 60);
    elMedia.textContent = `${h}h ${m}m`;
  }
  if (elDiasRest) {
    if (metaBatida) elDiasRest.innerHTML = "<i class='ph ph-check-circle' style='color:#7c4dff'></i>";
    else elDiasRest.textContent = isPeriodoPassado ? "0" : getDiasUteisRestantesMes();
    elDiasRest.className = "kpi-value val-neutral";
  }
  if (elEficiencia) {
    elEficiencia.textContent = (isNaN(eficiencia) ? 0 : eficiencia.toFixed(0)) + "%";
    elEficiencia.className = "kpi-value " + (eficiencia >= 95 ? "val-pos" : eficiencia < 80 ? "val-neg" : "val-neutral");
  }

  // --- Gráficos Gerais ---
  const totalHorasGeral = DADOS_FILTRADOS_CACHE.reduce((acc, r) => acc + parseFloat(r.duracao || 0), 0);
  const usuariosUnicos = [...new Set(DADOS_FILTRADOS_CACHE.map((r) => r.matricula))].length || 1;
  const metaGeralTotal = META_TOTAL * (usuariosUnicos || 1);
  
  let geralRestantes = Math.max(metaGeralTotal - totalHorasGeral, 0);
  let geralPerdidas = 0;
  if (isPeriodoPassado && !metaBatida) {
    geralPerdidas = geralRestantes;
    geralRestantes = 0;
  }

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("geralTrabalhadas", `${totalHorasGeral.toFixed(1)}h`);
  setTxt("geralRestantes", `${geralRestantes.toFixed(1)}h`);
  setTxt("geralPerdidas", `${geralPerdidas.toFixed(1)}h`);
  setTxt("centerGeral", `${totalHorasGeral.toFixed(0)}h`);
  setTxt("userTrabalhadas", `${totalHorasUser.toFixed(1)}h`);
  setTxt("userRestantes", `${userRestantes.toFixed(1)}h`);
  setTxt("userPerdidas", `${userPerdidas.toFixed(1)}h`);
  setTxt("centerUser", `${totalHorasUser.toFixed(1)}h`);

  if (cvGeral && cvUser) {
    if (chartGeral) chartGeral.destroy();
    if (chartUser) chartUser.destroy();
    
    chartGeral = criarGraficoRosca(cvGeral.getContext("2d"), totalHorasGeral, metaGeralTotal);
    chartUser = criarGraficoRosca(cvUser.getContext("2d"), totalHorasUser, META_TOTAL);
  }
  
  if (barraProgresso) {
    const percent = Math.min((totalHorasGeral / metaGeralTotal) * 100, 100) || 0;
    barraProgresso.style.width = `${percent}%`;
    if (progressoTexto) progressoTexto.textContent = `XP Geral: ${percent.toFixed(1)}%`;
  }

  if (cvTimeline) {
    if (chartTimeline) chartTimeline.destroy();
    const colors = getThemeColors();

    const dadosPorDia = {};
    
    DADOS_FILTRADOS_CACHE.forEach((r) => {
      if (!r.entrada) return;
      const dataPura = r.entrada.split(" ")[0]; 
      let labelDia;
      
      if (dataPura.includes("-")) {
        const parts = dataPura.split("-");
        labelDia = `${parts[2]}/${parts[1]}`;
      } else {
        const parts = dataPura.split("/");
        labelDia = `${parts[0]}/${parts[1]}`;
      }

      if (!dadosPorDia[labelDia]) dadosPorDia[labelDia] = { user: 0, total: 0, usersSet: new Set() };
      
      dadosPorDia[labelDia].total += parseFloat(r.duracao);
      dadosPorDia[labelDia].usersSet.add(r.matricula);
      
      if (r.matricula === matricula) {
        dadosPorDia[labelDia].user += parseFloat(r.duracao);
      }
    });

    const labels = Object.keys(dadosPorDia).sort((a, b) => {
      const [da, ma] = a.split("/");
      const [db, mb] = b.split("/");
      return new Date(hoje.getFullYear(), ma - 1, da) - new Date(hoje.getFullYear(), mb - 1, db);
    });

    const dataUser = labels.map((d) => dadosPorDia[d].user);
    const dataMedia = labels.map((d) => {
      const info = dadosPorDia[d];
      return info.usersSet.size > 0 ? info.total / info.usersSet.size : 0;
    });

    chartTimeline = new Chart(cvTimeline.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Você",
            data: dataUser,
            borderColor: colors.end,
            backgroundColor: "transparent",
            borderWidth: 3,
            pointBackgroundColor: colors.bg,
            pointBorderColor: colors.start,
            fill: false,
            tension: 0.4,
            order: 1,
          },
          {
            label: "Média da Equipe",
            data: dataMedia,
            borderColor: "#666",
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: true, labels: { color: colors.text, font: { family: "Fira Sans" } } },
          tooltip: {
            backgroundColor: "#101010",
            titleColor: "#fff",
            bodyColor: "#ccc",
            borderColor: "#333",
            borderWidth: 1,
            callbacks: { label: (c) => ` ${c.dataset.label}: ${c.raw.toFixed(2)}h` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#222" },
            ticks: { color: "#666" },
            suggestedMax: 4,
          },
          x: { grid: { display: false }, ticks: { color: "#666" } },
        },
      },
    });
  }
}

document.addEventListener("dataRangeChanged", (e) =>
  carregarRegistros(null, null, e.detail.inicio, e.detail.fim)
);

// ==========================
// 5. DateRangePicker (Dashboard)
// ==========================
$(function () {
  const calendarBtn = $("#btnCalendario");
  const label = $("#dateRangePickerLabel");

  $("#dateRangePickerHidden").remove();
  const picker = $("<input type='text' id='dateRangePickerHidden' style='display:none;'>");
  $("body").append(picker);

  picker.daterangepicker({
      autoUpdateInput: false,
      alwaysShowCalendars: true,
      parentEl: "body",
      opens: "left",
      locale: { 
        format: "DD/MM/YYYY", applyLabel: "Aplicar", cancelLabel: "Cancelar", customRangeLabel: "Personalizado",
        daysOfWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        firstDay: 1
      },
      ranges: {
        Hoje: [moment(), moment()],
        "Este mês": [moment().startOf("month"), moment().endOf("month")],
        "Mês passado": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
      },
      startDate: moment().startOf("month"),
      endDate: moment().endOf("month"),
    },
    function (start, end) {
      label.text(`${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`);
      document.dispatchEvent(new CustomEvent("dataRangeChanged", { detail: { inicio: start.format("YYYY-MM-DD"), fim: end.format("YYYY-MM-DD") } }));
    }
  );

  const drp = picker.data("daterangepicker");
  window.drpGlobal = drp;
  drp.container.addClass("drp-dashboard-mode");

  drp.move = function () {
    if (!this.container.is(':visible')) return;
    const rect = calendarBtn[0].getBoundingClientRect();
    this.container.css({
      top: "85px",
      left: rect.left + "px",
      right: "auto",
      position: "fixed"
    });
  };

  let isCooldown = false;
  picker.on("hide.daterangepicker", function () {
    isCooldown = true;
    setTimeout(() => { isCooldown = false; }, 300);
  });

  $(window).on("scroll", function () {
    if (drp.container.is(":visible") && $(window).scrollTop() > 150) { 
        drp.hide(); calendarBtn.blur(); 
    }
  });

  calendarBtn.off("click");
  calendarBtn.on("click", function (e) {
    e.stopPropagation(); e.preventDefault();
    if (isCooldown) return;
    if (drp.container.is(":visible")) { drp.hide(); return; }
    
    if ($(window).scrollTop() > 50) {
      $("html, body").animate({ scrollTop: 0 }, 300, function () { drp.show(); drp.move(); });
    } else {
      drp.show(); drp.move();
    }
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#btnCalendario").length && !$(e.target).closest(".daterangepicker").length) { drp.hide(); }
  });

  $(window).on("resize", function () { if (drp.container.is(":visible")) drp.move(); });
});

// ==========================
// 6. Logo Action
// ==========================
$(".logo").on("click", function () {
  $("html, body").animate({ scrollTop: 0 }, 600);
});

// ==========================
// 7. Atualizador de Tema (Restart)
// ==========================
window.addEventListener("themeChanged", () => {
    // Destrói os gráficos antigos
    Object.values(Chart.instances).forEach(chart => {
        chart.destroy();
    });

    if (typeof carregarRegistros === "function") {
        // --- AQUI ESTÁ A CORREÇÃO ---
        // Pegamos as datas que já estão no calendário (window.drpGlobal)
        // e passamos para a função recarregar, em vez de deixar ela resetar pro mês atual.
        if (window.drpGlobal) {
            const start = window.drpGlobal.startDate.format("YYYY-MM-DD");
            const end = window.drpGlobal.endDate.format("YYYY-MM-DD");
            carregarRegistros(null, null, start, end);
        } else {
            // Se o calendário não estiver carregado (raro), carrega padrão
            carregarRegistros();
        }
    } else {
        window.location.reload();
    }
});