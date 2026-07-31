(function () {
  'use strict';

  var CONFIG = {
    hoursPerDay: 6,
    daysPerWeek: 5,
    weeksPerMonth: 4,
    tiers: [
      { id: 1, maxHours: 90, rate: 200 },
      { id: 2, maxHours: 120, rate: 150 },
      { id: 3, maxHours: null, rate: 100 }
    ]
  };

  var H_DAY = CONFIG.hoursPerDay;
  var H_WEEK = H_DAY * CONFIG.daysPerWeek;
  var H_MONTH = H_WEEK * CONFIG.weeksPerMonth;
  var D_MONTH = CONFIG.daysPerWeek * CONFIG.weeksPerMonth;

  var UNITS = {
    hours: { hours: 1, max: 480, label: 'horas', labelOne: 'hora' },
    days: { hours: H_DAY, max: 120, label: 'dias', labelOne: 'dia' },
    weeks: { hours: H_WEEK, max: 26, label: 'semanas', labelOne: 'semana' },
    months: { hours: H_MONTH, max: 12, label: 'meses', labelOne: 'mês' }
  };

  var el = {
    amount: document.getElementById('simAmount'),
    range: document.getElementById('simRange'),
    marks: document.getElementById('simRangeMarks'),
    unitLbl: document.getElementById('simUnitLabel'),
    minus: document.getElementById('simMinus'),
    plus: document.getElementById('simPlus'),
    units: document.querySelectorAll('.sim__units .unit'),
    tiers: document.querySelectorAll('.sim__tiers .tier'),
    badge: document.getElementById('simBadge'),
    total: document.getElementById('simTotal'),
    hours: document.getElementById('simHours'),
    rate: document.getElementById('simRate'),
    duration: document.getElementById('simDuration'),
    hint: document.getElementById('simHint'),
    whats: document.getElementById('simWhats')
  };

  if (!el.amount || !el.range || !el.total) return;

  var nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var state = { unit: 'hours', value: 40 };

  function tierFor(totalHours) {
    for (var i = 0; i < CONFIG.tiers.length; i++) {
      var t = CONFIG.tiers[i];
      if (t.maxHours === null || totalHours <= t.maxHours) return t;
    }
    return CONFIG.tiers[CONFIG.tiers.length - 1];
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function humanDuration(totalHours) {
    var days = Math.ceil(totalHours / H_DAY);
    if (days <= 1) return '1 dia útil';

    var months = Math.floor(days / D_MONTH);
    var rest = days % D_MONTH;
    var weeks = Math.floor(rest / CONFIG.daysPerWeek);
    var rDays = rest % CONFIG.daysPerWeek;

    var parts = [];
    if (months) parts.push(plural(months, 'mês', 'meses'));
    if (weeks) parts.push(plural(weeks, 'semana', 'semanas'));
    if (rDays) parts.push(plural(rDays, 'dia útil', 'dias úteis'));

    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ' e ' + parts[parts.length - 1];
  }

  function hintFor(tier, totalHours) {
    if (tier.id === 3) return 'Essa já é a hora mais barata que eu trabalho.';
    var limit = CONFIG.tiers[tier.id - 1].maxHours + 1;
    var next = CONFIG.tiers[tier.id].rate;
    return 'A partir de ' + nf.format(limit) + ' h a hora passa a custar R$ ' + next
         + '. Faltam ' + nf.format(limit - totalHours) + ' h.';
  }

  function render() {
    var unit = UNITS[state.unit];
    var totalHours = state.value * unit.hours;
    var tier = tierFor(totalHours);
    var total = totalHours * tier.rate;

    el.amount.value = state.value;
    el.amount.max = unit.max;
    el.range.max = unit.max;
    el.range.value = state.value;
    el.range.style.setProperty('--fill', ((state.value - 1) / (unit.max - 1)) * 100 + '%');
    el.unitLbl.textContent = state.value === 1 ? unit.labelOne : unit.label;
    if (el.marks) el.marks.innerHTML = '<span>1</span><span>' + unit.max + '</span>';

    el.total.textContent = nf.format(total);
    el.hours.textContent = nf.format(totalHours) + ' h';
    el.rate.textContent = 'R$ ' + nf.format(tier.rate);
    el.duration.textContent = humanDuration(totalHours);
    el.badge.textContent = 'Faixa ' + tier.id + ' · R$ ' + tier.rate + '/hora';
    if (el.hint) el.hint.textContent = hintFor(tier, totalHours);

    el.tiers.forEach(function (t) {
      t.classList.toggle('is-active', Number(t.getAttribute('data-tier')) === tier.id);
    });

    if (el.whats) {
      var wa = (window.SITE && window.SITE.whatsapp) || '5531975175889';
      var msg = 'Olá, Jean! Simulei um orçamento no seu site:\n\n'
              + 'Duração estimada: ' + humanDuration(totalHours) + ' (' + nf.format(totalHours) + ' h)\n'
              + 'Valor da hora: R$ ' + nf.format(tier.rate) + '\n'
              + 'Total estimado: R$ ' + nf.format(total) + '\n\n'
              + 'Podemos conversar sobre o projeto?';
      el.whats.setAttribute('href', 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg));
    }
  }

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
    if (el.amount.value === '') return;
    setValue(el.amount.value);
  });
  el.amount.addEventListener('blur', function () { setValue(el.amount.value || 1); });

  if (el.minus) el.minus.addEventListener('click', function () { setValue(state.value - 1); });
  if (el.plus) el.plus.addEventListener('click', function () { setValue(state.value + 1); });

  render();
})();
