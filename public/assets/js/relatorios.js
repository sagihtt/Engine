// ==========================================================
// Engine Labs - Relatórios (Logo Version)
// ==========================================================

const matriculaLogada = localStorage.getItem("userMatricula") || "Desconhecido";
let dadosCarregados = []; 
let dadosGerais = [];     
let inicioPeriodo = moment().startOf('month');
let fimPeriodo = moment().endOf('month');
let logoBase64 = null; // Variável para guardar a logo

// Configuração de Cores
const THEME = {
    primary: [31, 41, 55],    // #1f2937 (Fundo do Header)
    accent: [59, 130, 246],   // #3b82f6
    text: [60, 60, 60],
    light: [243, 244, 246]
};

$(function() {
    // 1. Carregar a Logo assim que a página abrir
    imgToBase64('assets/img/logo.png', function(base64) {
        logoBase64 = base64;
    });

    // --- Lógica do DateRangePicker ---
    const reportBtn = $('#reportRange');
    const dateLabel = reportBtn.find('.date-display');

    function cb(start, end) {
        dateLabel.html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
        inicioPeriodo = start;
        fimPeriodo = end;
        carregarDados();
    }

    reportBtn.daterangepicker({
        startDate: inicioPeriodo,
        endDate: fimPeriodo,
        opens: "left",
        parentEl: "body",
        autoUpdateInput: false,
        alwaysShowCalendars: true,
        locale: { 
            format: "DD/MM/YYYY", applyLabel: "Aplicar", cancelLabel: "Cancelar", customRangeLabel: "Personalizado",
            daysOfWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], 
            monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], 
            firstDay: 1 
        },
        ranges: {
           'Hoje': [moment(), moment()],
           'Este Mês': [moment().startOf('month'), moment().endOf('month')],
           'Mês Passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    const drp = reportBtn.data('daterangepicker');
    drp.container.addClass("drp-reports-mode");

    drp.move = function() {
        if (!this.container.is(':visible')) return;
        const offset = reportBtn.offset();
        const height = reportBtn.outerHeight();
        this.container.css({
            top: (offset.top + height + 5) + "px",
            left: offset.left + "px", 
            right: "auto",
            position: "absolute",
            zIndex: 999999
        });
    };

    reportBtn.off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (drp.container.is(':visible')) drp.hide();
        else { drp.show(); drp.move(); }
    });

    $(window).on('resize scroll', function() { if(drp.container.is(':visible')) drp.move(); });
    $(document).on('mousedown', function(e) {
        if (!reportBtn.is(e.target) && reportBtn.has(e.target).length === 0 && 
            !drp.container.is(e.target) && drp.container.has(e.target).length === 0) {
            drp.hide();
        }
    });

    cb(inicioPeriodo, fimPeriodo);
});

// --- LÓGICA DE DADOS ---
async function carregarDados() {
    try {
        document.getElementById("previewCount").textContent = "...";
        document.getElementById("previewHours").textContent = "...";
        const res = await fetch("/api/registros"); 
        if (!res.ok) throw new Error("API Error");
        const rawData = await res.json();
        
        dadosGerais = rawData.filter(r => {
            const parts = r.entrada.split(" ")[0].split(r.entrada.includes("-")?"-":"/");
            const d = r.entrada.includes("-") ? new Date(parts[0], parts[1]-1, parts[2]) : new Date(parts[2], parts[1]-1, parts[0]);
            return d >= inicioPeriodo.toDate().setHours(0,0,0,0) && d <= fimPeriodo.toDate().setHours(23,59,59,999);
        });
        dadosGerais.sort((a, b) => (a.matricula === b.matricula) ? a.entrada.localeCompare(b.entrada) : a.matricula.localeCompare(b.matricula));
        dadosCarregados = dadosGerais.filter(r => r.matricula === matriculaLogada);
        
        document.getElementById("previewCount").textContent = dadosCarregados.length;
        document.getElementById("previewHours").textContent = dadosCarregados.reduce((acc, r) => acc + parseFloat(r.duracao||0), 0).toFixed(2) + "h";
    } catch(e) { console.error(e); }
}

// ==========================================================
// EXPORTAÇÃO
// ==========================================================

document.getElementById("btnExportTXT").addEventListener("click", () => {
    if(!dadosGerais.length) return alert("Sem dados para exportar.");
    let csv = "matricula,email,entrada,saida,duracao\n";
    dadosGerais.forEach(r => csv += `${r.matricula},${r.email||""},${r.entrada},${r.saida},${r.duracao}\n`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Dados_Engine_${moment().format('YYYYMMDD')}.csv`; a.click();
});

document.getElementById("btnExportPDF").addEventListener("click", () => {
    if(!dadosCarregados.length) return alert("Sem dados no período selecionado.");
    
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    
    desenharCabecalho(doc, "Relatório Individual");
    desenharInfoAluno(doc, dadosCarregados[0].matricula, dadosCarregados);

    doc.autoTable({
        startY: 75,
        head: [['Data', 'Entrada', 'Saída', 'Duração (h)']],
        body: dadosCarregados.map(r => [
            r.entrada.split(" ")[0], 
            r.entrada.split(" ")[1], 
            r.saida.split(" ")[1], 
            parseFloat(r.duracao).toFixed(2)
        ]),
        theme: 'grid',
        headStyles: { fillColor: THEME.primary, textColor: [255,255,255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: THEME.light }
    });

    desenharRodape(doc);
    doc.save(`Relatorio_Individual_${matriculaLogada}.pdf`);
});

document.getElementById("btnExportGeneral").addEventListener("click", () => {
    if(!dadosGerais.length) return alert("Sem dados gerais.");
    
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    let currentY = 45;

    desenharCabecalho(doc, "Relatório Geral da Equipe");
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Período: ${inicioPeriodo.format('DD/MM/YYYY')} até ${fimPeriodo.format('DD/MM/YYYY')}`, 14, 35);

    const grupos = {};
    dadosGerais.forEach(r => { if (!grupos[r.matricula]) grupos[r.matricula] = []; grupos[r.matricula].push(r); });

    Object.keys(grupos).sort().forEach((aluno, index) => {
        const regs = grupos[aluno];
        const total = regs.reduce((acc, r) => acc + parseFloat(r.duracao || 0), 0);
        
        if (currentY > 260) { 
            doc.addPage(); 
            desenharCabecalho(doc, "Relatório Geral (Cont.)"); 
            currentY = 40; 
        }

        doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]); 
        doc.rect(14, currentY, 182, 8, 'F');
        
        doc.setFont("helvetica", "bold"); 
        doc.setFontSize(11);
        doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
        doc.text(`Aluno: ${aluno}`, 16, currentY + 5.5);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Total: ${total.toFixed(2)}h`, 194, currentY + 5.5, { align: "right" });

        currentY += 10;

        doc.autoTable({
            startY: currentY,
            head: [['Data', 'Entrada', 'Saída', 'Duração']],
            body: regs.map(r => [
                r.entrada.split(" ")[0], 
                r.entrada.split(" ")[1], 
                r.saida.split(" ")[1], 
                parseFloat(r.duracao).toFixed(2) + "h"
            ]),
            theme: 'plain',
            headStyles: { fillColor: [150, 150, 150], textColor: 255, fontSize: 8 },
            styles: { fontSize: 8, cellPadding: 1 },
            margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 10;
    });

    desenharRodape(doc);
    doc.save("Relatorio_Geral_Equipe.pdf");
});

// --- HELPER FUNCTIONS ---

// Converte Imagem URL para Base64 (Necessário para PDF)
function imgToBase64(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function desenharCabecalho(doc, titulo) {
    // Fundo Escuro
    doc.setFillColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]); 
    doc.rect(0, 0, 210, 25, 'F');
    
    // LOGO: Se carregou a imagem, usa ela. Se não, usa texto.
    if (logoBase64) {
        // x, y, largura, altura (ajuste conforme o formato da sua logo)
        // Se sua logo for muito larga, aumente a largura e diminua altura
        doc.addImage(logoBase64, 'PNG', 14, 5, 40, 15); 
    } else {
        doc.setTextColor(255, 255, 255); 
        doc.setFontSize(18); 
        doc.setFont("helvetica", "bold");
        doc.text("ENGINE LABS", 14, 16);
    }

    // Título e Data
    doc.setTextColor(255, 255, 255); 
    doc.setFontSize(10); 
    doc.setFont("helvetica", "normal");
    doc.text(titulo.toUpperCase(), 200, 10, { align: "right" });
    doc.setFontSize(8); 
    doc.text(`Gerado em: ${moment().format('DD/MM/YYYY HH:mm')}`, 200, 16, { align: "right" });
}

function desenharInfoAluno(doc, matricula, dados) {
    const totalHoras = dados.reduce((acc, r) => acc + parseFloat(r.duracao || 0), 0);
    const diasTrabalhados = new Set(dados.map(r => r.entrada.split(" ")[0])).size;
    const media = diasTrabalhados > 0 ? (totalHoras / diasTrabalhados).toFixed(2) : "0.00";

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, 35, 182, 30, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Matrícula:", 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(matricula, 45, 45);

    doc.setFont("helvetica", "bold");
    doc.text("Período:", 120, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`${inicioPeriodo.format('DD/MM/YYYY')} a ${fimPeriodo.format('DD/MM/YYYY')}`, 140, 45);

    doc.setDrawColor(230);
    doc.line(20, 50, 190, 50);

    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(totalHoras.toFixed(2) + "h", 35, 60, { align: "center" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text("TOTAL HORAS", 35, 55, { align: "center" });

    doc.setTextColor(0); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(diasTrabalhados.toString(), 100, 60, { align: "center" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text("DIAS ATIVOS", 100, 55, { align: "center" });

    doc.setTextColor(0); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(media + "h", 165, 60, { align: "center" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text("MÉDIA DIÁRIA", 165, 55, { align: "center" });
}

function desenharRodape(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100);
    for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200);
        doc.line(14, 285, 196, 285);
        doc.text('Projeto engine - Relatório', 14, 290);
        doc.text('Página ' + i + ' de ' + pageCount, 196, 290, { align: 'right' });
    }
}