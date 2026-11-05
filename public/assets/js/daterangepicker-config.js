$(function () {
  const calendarBtn = $("#btnCalendario");
  const label = $("#dateRangePickerLabel");

  // Cria um input oculto para o daterangepicker
  const picker = $(
    "<input type='text' id='dateRangePickerHidden' style='display:none;'>"
  );
  $("body").append(picker);

  // Configuração principal do calendário
  picker.daterangepicker(
    {
      opens: "right",
      autoUpdateInput: true,
      locale: {
        format: "DD/MM/YYYY",
        applyLabel: "Aplicar",
        cancelLabel: "Cancelar",
        fromLabel: "De",
        toLabel: "Até",
        customRangeLabel: "Personalizado",
        daysOfWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        monthNames: [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ],
        firstDay: 1,
      },
      ranges: {
        Hoje: [moment(), moment()],
        Ontem: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Últimos 7 dias": [moment().subtract(6, "days"), moment()],
        "Últimos 30 dias": [moment().subtract(29, "days"), moment()],
        "Este mês": [moment().startOf("month"), moment().endOf("month")],
        "Mês passado": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      startDate: moment().startOf("month"),
      endDate: moment().endOf("month"),
    },
    function (start, end) {
      const inicio = start.format("YYYY-MM-DD");
      const fim = end.format("YYYY-MM-DD");

      label.text(`${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`);

      document.dispatchEvent(
        new CustomEvent("dataRangeChanged", { detail: { inicio, fim } })
      );
    }
  );

  const drp = picker.data("daterangepicker");

  // Controla a abertura manual
  calendarBtn.on("click", function (e) {
    e.stopPropagation();

    if (drp.container.is(":visible")) {
      drp.hide();
    } else {
      // Primeiro posicionamos, depois mostramos
      const offset = calendarBtn.offset();
      const btnHeight = calendarBtn.outerHeight();

      // Aplicamos o CSS ANTES do show para ele já "nascer" no lugar
      drp.container.css({
        top: offset.top + btnHeight + 6,
        left: offset.left,
        display: "none", // garante que não pisque antes do show
      });

      drp.show();
    }
  });
});
