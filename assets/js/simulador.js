/* =============================================================
   simulador.js — Simulador de preço do projeto

   REGRA DE PREÇO (definida por Jean Kássio):
     • R$ 200/hora — projetos de até 3 semanas          (até  90 h)
     • R$ 150/hora — de 3 semanas + 1 h até 1 mês       (91 a 120 h)
     • R$ 100/hora — projetos acima de 1 mês            (121 h ou mais)

   BASE DE CONVERSÃO (jornada de trabalho):
     6 h por dia · 5 dias por semana  ->  30 h/semana · 120 h/mês
     3 semanas = 90 h · 1 mês = 120 h

   Para mudar a política de preço ou a jornada, edite apenas
   as constantes de CONFIG logo abaixo.
   ============================================================= */
(function () {
  'use strict';

  var CONFIG = {
    hoursPerDay: 6,
    daysPerWeek: 5,
    weeksPerMonth: 4,
    // Faixas avaliadas em ordem: a primeira cujo limite (maxHours) comporta
    // o total de horas é a aplicada. A última (null) vale para o resto.
    tiers: [
      { id: 1, maxHours: 90,  rate: 200 },
      { id: 2, maxHours: 120, rate: 150 },
      { id: 3, maxHours: null, rate: 100 }
    ]
  };

  var H_DAY   = CONFIG.hoursPerDay;                        // 6
  var H_WEEK  = H_DAY * CONFIG.daysPerWeek;                // 30
  var H_MONTH = H_WEEK * CONFIG.weeksPerMonth;             // 120
  var D_MONTH = CONFIG.daysPerWeek * CONFIG.weeksPerMonth; // 20 dias úteis

  // Definição de cada unidade: quantas horas vale e o alcance do slider.
  var UNITS = {
    hours:  { hours: 1,       max: 480, label: 'horas',   labelOne: 'hora'   },
    days:   { hours: H_DAY,   max: 120, label: 'dias',    labelOne: 'dia'    },
    weeks:  { hours: H_WEEK,  max: 26,  label: 'semanas', labelOne: 'semana' },
    months: { hours: H_MONTH, max: 12,  label: 'meses',   labelOne: 'mês'    }
  };

  var el = {
    amount:   document.getElementById('simAmount'),
    range:    document.getElementById('simRange'),
    marks:    document.getElementById('simRangeMarks'),
    unitLbl:  document.getElementById('simUnitLabel'),
    minus:    document.getElementById('simMinus'),
    plus:     document.getElementById('simPlus'),
    units:    document.querySelectorAll('.sim__units .unit'),
    tiers:    document.querySelectorAll('.sim__tiers .tier'),
    badge:    document.getElementById('simBadge'),
    total:    document.getElementById('simTotal'),
    hours:    document.getElementById('simHours'),
    rate:     document.getElementById('simRate'),
    duration: document.getElementById('simDuration'),
    hint:     document.getElementById('simHint'),
    whats:    document.getElementById('simWhats')
  };

  if (!el.amount || !el.range || !el.total) return; // simulador ausente na página

  var nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = { unit: 'hours', value: 40 };
  var lastTotal = 0;

  /* ---------------- Cálculo ---------------- */

  function tierFor(totalHours) {
    for (var i = 0; i < CONFIG.tiers.length; i++) {
      var t = CONFIG.tiers[i];
      if (t.maxHours === null || totalHours <= t.maxHours) return t;
    }
    return CONFIG.tiers[CONFIG.tiers.length - 1];
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /** Converte um total de horas em algo legível: "1 mês e 2 semanas". */
  function humanDuration(totalHours) {
    var days = Math.ceil(totalHours / H_DAY);
    if (days <= 1) return '1 dia útil';

    var months = Math.floor(days / D_MONTH);
    var rest   = days % D_MONTH;
    var weeks  = Math.floor(rest / CONFIG.daysPerWeek);
    var rDays  = rest % CONFIG.daysPerWeek;

    var parts = [];
    if (months) parts.push(plural(months, 'mês', 'meses'));
    if (weeks)  parts.push(plural(weeks, 'semana', 'semanas'));
    if (rDays)  parts.push(plural(rDays, 'dia útil', 'dias úteis'));

    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ' e ' + parts[parts.length - 1];
  }

  function hintFor(tier, totalHours) {
    if (tier.id === 1) {
      var toNext = (CONFIG.tiers[0].maxHours + 1) - totalHours;
      return 'A partir de ' + (CONFIG.tiers[0].maxHours + 1) + ' h de projeto a hora passa a custar R$ '
           + CONFIG.tiers[1].rate + ' (faltam ' + nf.format(toNext) + ' h).';
    }
    if (tier.id === 2) {
      var toNext2 = (CONFIG.tiers[1].maxHours + 1) - totalHours;
      return 'A partir de ' + (CONFIG.tiers[1].maxHours + 1) + ' h de projeto a hora passa a custar R$ '
           + CONFIG.tiers[2].rate + ' (faltam ' + nf.format(toNext2) + ' h).';
    }
    return 'Melhor faixa aplicada: R$ ' + CONFIG.tiers[2].rate + ' por hora de trabalho.';
  }

  /* ---------------- Animação do valor ---------------- */

  var rafId = null;
  function renderTotal(value) {
    if (reduceMotion || lastTotal === 0) {
      el.total.textContent = nf.format(value);
      lastTotal = value;
      return;
    }
    if (rafId) cancelAnimationFrame(rafId);

    var from = lastTotal, delta = value - from, start = performance.now(), duration = 420;

    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.total.textContent = nf.format(Math.round(from + delta * eased));
      if (p < 1) { rafId = requestAnimationFrame(step); } else { rafId = null; }
    }
    rafId = requestAnimationFrame(step);
    lastTotal = value;
  }

  /* ---------------- Render ---------------- */

  function render() {
    var unit = UNITS[state.unit];
    var totalHours = state.value * unit.hours;
    var tier = tierFor(totalHours);
    var total = totalHours * tier.rate;

    // Campos numéricos e slider
    el.amount.value = state.value;
    el.amount.max = unit.max;
    el.range.max = unit.max;
    el.range.value = state.value;
    el.range.style.setProperty('--fill', ((state.value - 1) / (unit.max - 1)) * 100 + '%');
    el.unitLbl.textContent = state.value === 1 ? unit.labelOne : unit.label;
    if (el.marks) el.marks.innerHTML = '<span>1</span><span>' + unit.max + '</span>';

    // Resultado
    renderTotal(total);
    el.hours.textContent = nf.format(totalHours) + ' h';
    el.rate.textContent = 'R$ ' + nf.format(tier.rate);
    el.duration.textContent = humanDuration(totalHours);
    el.badge.textContent = 'Faixa ' + tier.id + ' · R$ ' + tier.rate + '/hora';
    if (el.hint) el.hint.textContent = hintFor(tier, totalHours);

    // Faixa ativa em destaque
    el.tiers.forEach(function (t) {
      t.classList.toggle('is-active', Number(t.getAttribute('data-tier')) === tier.id);
    });

    // Link do WhatsApp já com o resumo da simulação
    if (el.whats) {
      var wa = (window.SITE && window.SITE.whatsapp) || '5531975175889';
      var msg = 'Olá, Jean! Simulei um orçamento no seu site:\n\n'
              + '• Duração estimada: ' + humanDuration(totalHours) + ' (' + nf.format(totalHours) + ' h)\n'
              + '• Valor da hora: R$ ' + nf.format(tier.rate) + '\n'
              + '• Total estimado: R$ ' + nf.format(total) + '\n\n'
              + 'Podemos conversar sobre o projeto?';
      el.whats.setAttribute('href', 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg));
    }
  }

  /* ---------------- Interações ---------------- */

  function setValue(v) {
    var max = UNITS[state.unit].max;
    v = Math.round(Number(v));
    if (!isFinite(v) || v < 1) v = 1;
    if (v > max) v = max;
    state.value = v;
    render();
  }

  function setUnit(newUnit) {
    if (!UNITS[newUnit] || newUnit === state.unit) return;

    // Mantém a duração equivalente ao trocar de unidade (40 h -> 7 dias).
    var totalHours = state.value * UNITS[state.unit].hours;
    var converted = Math.round(totalHours / UNITS[newUnit].hours) || 1;

    state.unit = newUnit;
    el.units.forEach(function (b) {
      var on = b.getAttribute('data-unit') === newUnit;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    setValue(converted);
  }

  el.units.forEach(function (b) {
    b.addEventListener('click', function () { setUnit(b.getAttribute('data-unit')); });
  });

  el.range.addEventListener('input', function () { setValue(el.range.value); });
  el.amount.addEventListener('input', function () {
    // Não corrige enquanto o campo está vazio, para não atrapalhar a digitação.
    if (el.amount.value === '') return;
    setValue(el.amount.value);
  });
  el.amount.addEventListener('blur', function () { setValue(el.amount.value || 1); });

  if (el.minus) el.minus.addEventListener('click', function () { setValue(state.value - 1); });
  if (el.plus)  el.plus.addEventListener('click', function () { setValue(state.value + 1); });

  render();
})();
