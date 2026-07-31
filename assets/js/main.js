(function () {
  'use strict';

  var SITE = {
    whatsapp: '5531975175889',
    mailUser: 'jeankassiocheib',
    mailDomain: 'gmail.com',
    linkedin: 'https://www.linkedin.com/in/jeankassio/',
    waMessage: 'Olá, Jean! Vi o seu site e gostaria de conversar sobre um projeto.'
  };

  window.SITE = SITE;

  var root = document.documentElement;

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('jk-theme', next); } catch (e) {}
    });
  }

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
    }
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && !burger.contains(e.target)) closeNav();
    });
  }

  var sections = document.querySelectorAll('main section[id]');
  var navLinks = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('on'); });
        var link = navLinks[entry.target.id];
        if (link) link.classList.add('on');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  var waHref = 'https://wa.me/' + SITE.whatsapp + '?text=' + encodeURIComponent(SITE.waMessage);
  ['waTop', 'waCard'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('href', waHref);
  });

  var email = SITE.mailUser + '@' + SITE.mailDomain;
  var mailCard = document.getElementById('mailCard');
  var mailText = document.getElementById('mailText');
  if (mailCard) mailCard.setAttribute('href', 'mailto:' + email + '?subject=' + encodeURIComponent('Contato pelo site'));
  if (mailText) mailText.textContent = email;

  var linkedinCard = document.getElementById('linkedinCard');
  if (linkedinCard) {
    if (SITE.linkedin) {
      linkedinCard.setAttribute('href', SITE.linkedin);
      linkedinCard.removeAttribute('hidden');
      var lt = document.getElementById('linkedinText');
      if (lt) lt.textContent = SITE.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    } else {
      linkedinCard.remove();
    }
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();
