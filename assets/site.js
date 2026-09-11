/* saphir.one — theme toggle, print handling, section highlighting */
(function () {
  'use strict';

  var KEY = 'saphir-theme';
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemTheme() {
    return mq.matches ? 'dark' : 'light';
  }
  function current() {
    return root.getAttribute('data-theme') || systemTheme();
  }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-label', label);
      buttons[i].setAttribute('title', label);
    }
  }

  // Initial state (the inline snippet in <head> already set the attribute to avoid a flash).
  apply(stored() || systemTheme());

  // Follow the OS while no explicit choice has been stored.
  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (!stored()) apply(e.matches ? 'dark' : 'light');
    });
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-theme-toggle]');
    if (toggle) {
      var next = current() === 'dark' ? 'light' : 'dark';
      try {
        // If the choice matches the OS setting, forget it so the page keeps following the OS.
        if (next === systemTheme()) localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, next);
      } catch (err) { /* storage unavailable: theme still applies for this page view */ }
      apply(next);
      return;
    }
    if (e.target.closest('[data-print]')) {
      window.print();
    }
  });

  // Printing: force the light palette and expand every "More about this position".
  var printState = null;
  window.addEventListener('beforeprint', function () {
    var closed = [];
    var all = document.querySelectorAll('details.more');
    for (var i = 0; i < all.length; i++) {
      if (!all[i].open) { all[i].open = true; closed.push(all[i]); }
    }
    printState = { theme: current(), closed: closed };
    apply('light');
  });
  window.addEventListener('afterprint', function () {
    if (!printState) return;
    apply(printState.theme);
    for (var i = 0; i < printState.closed.length; i++) printState.closed[i].open = false;
    printState = null;
  });

  // Sticky sidebar: publish the real topbar height and the sidebar's own height
  // so the CSS can pin it without a jump and without a nested scrollbar.
  // Re-measured whenever either changes size: web fonts arriving, the role
  // switcher wrapping onto a second row, or the window being resized.
  var bar = document.querySelector('.topbar');
  var side = document.querySelector('.side-col');
  function measure() {
    if (bar) root.style.setProperty('--topbar-h', bar.getBoundingClientRect().height + 'px');
    if (side) root.style.setProperty('--side-h', side.getBoundingClientRect().height + 'px');
  }
  measure();
  window.addEventListener('resize', measure);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(measure);
    if (bar) ro.observe(bar);
    if (side) ro.observe(side);
  }

  // Highlight the section currently in view in the sidebar's "On this page" list.
  var links = document.querySelectorAll('.side-nav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    for (var j = 0; j < links.length; j++) byId[links[j].getAttribute('href').slice(1)] = links[j];
    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        if (!entries[k].isIntersecting) continue;
        for (var m = 0; m < links.length; m++) links[m].classList.remove('is-active');
        var a = byId[entries[k].target.id];
        if (a) a.classList.add('is-active');
      }
    }, { rootMargin: '-15% 0px -70% 0px' });
    for (var id in byId) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    }
  }
})();
