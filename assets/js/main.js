/* =============================================================
   main.js — comportamento geral do site
   ============================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------
     CONFIGURAÇÃO — altere aqui os seus dados de contato.
     ----------------------------------------------------------- */
  var SITE = {
    whatsapp: '5531975175889',
    mailUser: 'jeankassiocheib',
    mailDomain: 'gmail.com',
    linkedin: 'https://www.linkedin.com/in/jeankassio/',
    waMessage: 'Olá, Jean! Vi o seu site e gostaria de conversar sobre um projeto.'
  };

  window.SITE = SITE; // usado também pelo simulador de orçamento

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Tema claro/escuro ---------------- */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('jk-theme', next); } catch (e) {}
    });
  }

  /* ---------------- Header: sombra + barra de progresso ---------------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('scrollProgress');
  var waFloat = document.getElementById('waFloat');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) header.classList.toggle('is-stuck', y > 12);
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (waFloat) waFloat.classList.toggle('is-visible', y > window.innerHeight * 0.6);

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------------- Menu mobile ---------------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    // Fecha ao tocar fora do menu (comum em mobile).
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  /* ---------------- Animação de entrada (reveal) ---------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- Scroll spy no menu ---------------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // O hero não tem link no menu: ao voltar para ele, nenhum item fica ativo.
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('is-active'); });
        var link = navLinks[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Contadores do hero ---------------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }

    var duration = 1400;
    var start = performance.now();

    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------------- Efeito de digitação no hero ---------------- */
  var typed = document.getElementById('typed');
  var roles = [
    'Desenvolvedor Backend',
    'Node.js & TypeScript',
    'PHP & Python',
    'Automação & IA local',
    'Freelancer / PJ'
  ];

  if (typed) {
    if (reduceMotion) {
      typed.textContent = roles[0];
    } else {
      var rIndex = 0, cIndex = 0, deleting = false;

      (function type() {
        var word = roles[rIndex];
        cIndex += deleting ? -1 : 1;
        typed.textContent = word.slice(0, cIndex);

        var delay = deleting ? 40 : 75;

        if (!deleting && cIndex === word.length) {
          deleting = true;
          delay = 1900;
        } else if (deleting && cIndex === 0) {
          deleting = false;
          rIndex = (rIndex + 1) % roles.length;
          delay = 350;
        }
        setTimeout(type, delay);
      })();
    }
  }

  /* ---------------- Luz que acompanha o mouse no hero ---------------- */
  var hero = document.getElementById('inicio');
  var spot = document.getElementById('heroSpot');

  if (hero && spot && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      spot.style.left = ((e.clientX - r.left) / r.width) * 100 + '%';
      spot.style.top = ((e.clientY - r.top) / r.height) * 100 + '%';
    });
  }

  /* ---------------- Links de contato (montados em JS) ---------------- */
  var waHref = 'https://wa.me/' + SITE.whatsapp + '?text=' + encodeURIComponent(SITE.waMessage);
  ['waFloat', 'waCard'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('href', waHref);
  });

  var email = SITE.mailUser + '@' + SITE.mailDomain;
  var mailCard = document.getElementById('mailCard');
  var mailText = document.getElementById('mailText');
  if (mailCard) {
    mailCard.setAttribute('href', 'mailto:' + email + '?subject=' + encodeURIComponent('Contato pelo site'));
  }
  if (mailText) mailText.textContent = email;

  var linkedinCard = document.getElementById('linkedinCard');
  if (linkedinCard && SITE.linkedin) {
    linkedinCard.setAttribute('href', SITE.linkedin);
    linkedinCard.hidden = false;
    var lt = document.getElementById('linkedinText');
    if (lt) lt.textContent = SITE.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com/, '');
  }

  /* ---------------- Ano no rodapé ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();
