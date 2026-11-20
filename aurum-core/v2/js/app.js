(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var fmt = function (n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  function inView(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }
  function whenVisible(el, on, off, margin) {
    if (!('IntersectionObserver' in window)) { on(); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? on() : off && off(); }); }, { rootMargin: margin || '0px', threshold: 0.05 }).observe(el);
  }

  /* ---------- header: scrolled state + adjusted vw ---------- */
  var header = $('.header');
  function onScroll() { header.classList.toggle('scrolled', scrollY >= 100); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setVW() { document.documentElement.style.setProperty('--adjusted-vw', 'calc(100vw - ' + (innerWidth - document.documentElement.clientWidth) + 'px)'); }
  addEventListener('load', setVW); addEventListener('resize', setVW); setVW();

  /* ---------- mega menus (Webflow dropdown: hover on desktop, click on mobile) ---------- */
  var desk = window.matchMedia('(min-width: 992px)');
  $$('.header_dropdown-wrapper').forEach(function (w) {
    var t = $('.w-dropdown-toggle', w), l = $('.w-dropdown-list', w), timer;
    function open() { clearTimeout(timer); $$('.header_dropdown-wrapper').forEach(function (o) { if (o !== w) close.call(o, true); }); t.classList.add('w--open'); l.classList.add('w--open'); }
    function close(now) { var tt = $('.w-dropdown-toggle', this), ll = $('.w-dropdown-list', this); tt.classList.remove('w--open'); ll.classList.remove('w--open'); }
    w.addEventListener('mouseenter', function () { if (desk.matches) open(); });
    w.addEventListener('mouseleave', function () { if (desk.matches) timer = setTimeout(function () { close.call(w); }, 0); });
    t.addEventListener('click', function () { l.classList.contains('w--open') ? close.call(w) : open(); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.w--open').forEach(function (n) { if (!n.classList.contains('w-nav-button')) n.classList.remove('w--open'); }); });
  var menuBtn = $('.menu-button'), menu = $('.header_menu-wrapper');
  menuBtn.addEventListener('click', function () {
    var o = menuBtn.classList.toggle('w--open');
    o ? menu.setAttribute('data-nav-menu-open', '') : menu.removeAttribute('data-nav-menu-open');
  });
  $$('.header_menu-wrapper a').forEach(function (a) { a.addEventListener('click', function () { if (!desk.matches) { menuBtn.classList.remove('w--open'); menu.removeAttribute('data-nav-menu-open'); } }); });

  /* ---------- logo stacks (use-case wall): every 5s, staggered 400ms per slot ---------- */
  (function () {
    var grid = $('[data-logo-stacks]'); if (!grid) return;
    var slots = $$('.logo-link-slot', grid).map(function (s, i) { return { logos: $$('.logo-link_logo', s), idx: 0, gi: i }; });
    var multi = slots.filter(function (s) { return s.logos.length >= 2; });
    function set(s, i) { s.idx = i; s.logos.forEach(function (l, n) { n === i ? l.setAttribute('data-active', 'true') : l.removeAttribute('data-active'); }); }
    slots.forEach(function (s) { if (s.logos.length) set(s, 0); });
    grid.setAttribute('data-logo-stacks-ready', '');
    if (reduce) return;
    var iv = null, tos = [], vis = false, hov = false;
    function step() { tos.forEach(clearTimeout); tos = []; multi.forEach(function (s) { tos.push(setTimeout(function () { set(s, (s.idx + 1) % s.logos.length); }, 400 * s.gi)); }); }
    function stop() { tos.forEach(clearTimeout); tos = []; if (iv) { clearInterval(iv); iv = null; } }
    function start() { stop(); if (vis && !hov && multi.length) iv = setInterval(step, 5000); }
    $$('.logo-link_link', grid).forEach(function (a) { a.addEventListener('mouseenter', function () { hov = true; stop(); }); a.addEventListener('mouseleave', function () { hov = false; start(); }); });
    whenVisible(grid, function () { vis = true; start(); }, function () { vis = false; stop(); });
  })();

  /* ---------- customer slider (tabs + scroll-snap slides) ---------- */
  (function () {
    var wrap = $('[data-styled-cs-slider="wrapper"]'); if (!wrap) return;
    var nav = $('[data-styled-cs-slider="nav"]', wrap), slides = $('[data-styled-cs-slider="slides"]', wrap);
    var boxes = $$('.customer-slider_button-box', nav), btns = boxes.map(function (b) { return $('button', b); }), items = $$('.customer-slider_slide', slides);
    var cur = -1, lock = false, raf = null, beh = reduce ? 'auto' : 'smooth';
    function activate(i) {
      if (i === cur) return; cur = i; wrap.setAttribute('data-active-index', i);
      boxes.forEach(function (b, n) { if (n === i) { b.setAttribute('data-active', 'true'); b.removeAttribute('data-indicator-origin'); } else { b.removeAttribute('data-active'); b.setAttribute('data-indicator-origin', n > i ? 'left' : 'right'); } });
      btns.forEach(function (b, n) { b.setAttribute('aria-pressed', n === i ? 'true' : 'false'); });
      items.forEach(function (s, n) { var rx = $('.rx', s); if (rx) rx.classList.toggle('is-play', n === i); });
    }
    function navTo(i) { nav.scrollTo({ left: boxes[i].offsetLeft, behavior: beh }); }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { lock = true; slides.scrollTo({ left: items[i].offsetLeft - slides.offsetLeft, behavior: beh }); activate(i); navTo(i); setTimeout(function () { lock = false; }, reduce ? 0 : 400); }); });
    slides.addEventListener('scroll', function () { if (raf) return; raf = requestAnimationFrame(function () { raf = null; if (lock) return; var w = slides.clientWidth, i = w <= 0 ? 0 : Math.min(items.length - 1, Math.round(slides.scrollLeft / (w + 20))); activate(i); navTo(i); }); }, { passive: true });
    activate(0); wrap.setAttribute('data-styled-cs-slider-ready', '');
  })();

  /* ---------- scroll tabs (sticky; progress bars driven by scroll) ---------- */
  (function () {
    var w = $('[data-scroll-tabs="wrapper"]'); if (!w) return;
    var inner = $('[data-scroll-tabs="inner"]', w), btns = $$('[data-tabs="button"]', w), prog = btns.map(function (b) { return $('[data-tabs="progress"]', b); }), vis = $$('[data-tabs="visual-item"]', w), n = prog.length;
    var mq = window.matchMedia('(min-width: 768px)'), last = -1, lastP = prog.map(function () { return -1; }), raf = null, ratios = btns.map(function () { return 0; }), io = null;
    function half() { mq.matches ? w.style.setProperty('--scroll-tabs-half-height', inner.offsetHeight / 2 + 'px') : w.style.removeProperty('--scroll-tabs-half-height'); }
    function setP(i, v) { v = Math.round(200 * v) / 200; if (lastP[i] !== v) { lastP[i] = v; prog[i].style.setProperty('--tab-progress', String(v)); } }
    function act(i) { if (i === last) return; last = i; btns.concat(vis).forEach(function (el) { el.removeAttribute('data-active'); }); btns[i].setAttribute('data-active', 'true'); vis[i].setAttribute('data-active', 'true'); }
    function calc() { if (!mq.matches) return; var r = w.getBoundingClientRect(), range = w.offsetHeight - innerHeight; if (range <= 0) return; var p = clamp(-r.top / range, 0, 1) * n, i = Math.min(n - 1, Math.floor(p)), f = clamp(p - i, 0, 1); for (var k = 0; k < n; k++) setP(k, k < i ? 1 : k === i ? f : 0); act(i); }
    function tick() { if (!raf) raf = requestAnimationFrame(function () { raf = null; calc(); }); }
    function mobile() {
      if (io) io.disconnect(); act(0);
      io = new IntersectionObserver(function (es) { es.forEach(function (e) { var k = btns.indexOf(e.target); if (k > -1) ratios[k] = e.isIntersecting ? e.intersectionRatio : 0; }); var best = 0; for (var k = 1; k < n; k++) if (ratios[k] > ratios[best]) best = k; act(best); }, { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
      btns.forEach(function (b) { io.observe(b); });
    }
    function mode() { if (mq.matches) { if (io) io.disconnect(); w.style.setProperty('--scroll-tabs-count', String(n)); half(); calc(); } else { w.style.removeProperty('--scroll-tabs-count'); w.style.removeProperty('--scroll-tabs-half-height'); prog.forEach(function (p, k) { p.style.removeProperty('--tab-progress'); lastP[k] = -1; }); mobile(); } }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { if (!mq.matches) act(i); }); });
    mq.addEventListener('change', mode); addEventListener('scroll', tick, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(half).observe(inner); else addEventListener('resize', half);
    mode(); w.setAttribute('data-scroll-tabs-ready', '');
    var t = null;
    function toggleIn(panel) { var it = $$('[data-switch-board="item"]', panel); if (!it.length) return; var k = Math.max(1, Math.floor(Math.random() * Math.ceil(it.length / 2)) + 1); for (var i = it.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = it[i]; it[i] = it[j]; it[j] = x; } it.slice(0, k).forEach(function (el) { el.getAttribute('data-active') === 'true' ? el.removeAttribute('data-active') : el.setAttribute('data-active', 'true'); }); }
    function sync() { clearInterval(t); t = null; if (reduce) return; var p = $('[data-tabs="visual-item"][data-active="true"][data-animate-items="true"]', w); if (!p) return; toggleIn(p); t = setInterval(function () { var a = $('[data-tabs="visual-item"][data-active="true"][data-animate-items="true"]', w); if (!a) { clearInterval(t); t = null; return; } toggleIn(a); }, 1000); }
    var mo = new MutationObserver(sync); vis.forEach(function (v) { mo.observe(v, { attributes: true, attributeFilter: ['data-active'] }); }); sync();
  })();

  /* ---------- use-case swiper (16 cards, 3.5 per view, gap 20) ---------- */
  (function () {
    var wrap = $('#uc-wrapper'); if (!wrap) return;
    var ic = {
      deb: '<rect x="2" y="4.5" width="16" height="11" rx="1.8"/><path d="M2 8h16M5 12.5h3"/>',
      cre: '<path d="M3 15.5l4-4 3 3 7-7"/><path d="M12.5 7.5H17V12"/>',
      dep: '<rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2.5v3M13 2.5v3M7 12h2"/>',
      con: '<path d="M4 7h11.5M12.5 4l3 3-3 3M16 13H4.5M7.5 10l-3 3 3 3"/>'
    };
    var motor = { deb: 'Motor de Débito', cre: 'Motor de Crédito', dep: 'Motor de Depósito', con: 'Conectores' };
    var big = {
      wallet: '<path d="M3 6.5h12.5a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15V5.5A1.5 1.5 0 0 1 4.5 4H14v2.5"/><circle cx="13.5" cy="11.5" r="1"/>',
      phone: '<rect x="5.5" y="2" width="9" height="16" rx="2"/><path d="M9 15.5h2"/>',
      card: '<rect x="2" y="4.5" width="16" height="11" rx="1.8"/><path d="M2 8h16M5 12.5h3"/>',
      payroll: '<rect x="3" y="3" width="14" height="14" rx="1.5"/><path d="M6.5 7h7M6.5 10h7M6.5 13h4"/>',
      coin: '<circle cx="10" cy="10" r="7.5"/><path d="M10 5.5v9M12.5 7.5c-.5-1-1.4-1.4-2.5-1.4-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.3 5.2 4 0 1.1-1.1 1.9-2.7 1.9-1.2 0-2.2-.5-2.7-1.5"/>',
      person: '<circle cx="10" cy="6.5" r="3.2"/><path d="M3.5 17.5c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/>',
      brief: '<rect x="2.5" y="6.5" width="15" height="10.5" rx="1.5"/><path d="M7 6.5V4.5h6v2M2.5 11h15"/>',
      house: '<path d="M3 9.5L10 3.5l7 6M5 8v9h10V8M8.5 17v-4.5h3V17"/>',
      bolt: '<path d="M11 2.5L4.5 11.5H10l-1 6 6.5-9H10z"/>',
      cal: '<rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2.5v3M13 2.5v3"/>',
      bank: '<path d="M3 8l7-4.5L17 8M4.5 8.5v6.5M8 8.5v6.5M12 8.5v6.5M15.5 8.5v6.5M2.5 17h15"/>',
      heart: '<path d="M10 17s-6.5-3.8-6.5-8.6A3.6 3.6 0 0 1 10 6.3a3.6 3.6 0 0 1 6.5 2.1C16.5 13.2 10 17 10 17z"/>',
      globe: '<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.2 2.2 2.2 12.8 0 15M10 2.5c-2.2 2.2-2.2 12.8 0 15"/>',
      gift: '<rect x="3" y="7.5" width="14" height="10" rx="1"/><path d="M2 5h16v2.5H2zM10 5v12.5M10 5C8 1.5 5 2.5 6.5 5M10 5c2-3.5 5-2.5 3.5 0"/>',
      back: '<path d="M16 7.5A6.5 6.5 0 1 0 16.5 12"/><path d="M16.8 3.5v4.2h-4.2"/>',
      star: '<path d="M10 2.5l2.3 4.7 5.2.8-3.8 3.6.9 5.1L10 14.3l-4.6 2.4.9-5.1L2.5 8l5.2-.8z"/>'
    };
    var cards = [
      ['deb', 'Carteras electrónicas con saldo y transferencias SPEI', 'Carteras electrónicas', 'wallet', '#e0be5a', '#071024'],
      ['deb', 'Banca móvil con cuentas y movimientos en tiempo real', 'Banca móvil', 'phone', '#071024', '#ecca65'],
      ['deb', 'Tarjetas de débito con autorizaciones y reversos', 'Tarjetas de débito', 'card', '#00b4dc', '#071024'],
      ['cre', 'Opera préstamos de nómina con tasa y plazo pactados', 'Préstamos de nómina', 'payroll', '#365f7a', '#ffffff'],
      ['cre', 'Automatiza microcréditos de la solicitud al cierre', 'Microcréditos', 'coin', '#f8fcfc', '#071024'],
      ['cre', 'Administra préstamos personales en todo su ciclo', 'Préstamos personales', 'person', '#b6802c', '#ffffff'],
      ['cre', 'Opera préstamos comerciales para tu cartera empresarial', 'Préstamos comerciales', 'brief', '#0c1d38', '#ffffff'],
      ['cre', 'Administra préstamos hipotecarios a plazos largos', 'Préstamos hipotecarios', 'house', '#d6f4fa', '#071024'],
      ['cre', 'Dispersa préstamos de emergencia por SPEI', 'Préstamos de emergencia', 'bolt', '#a76f19', '#ffffff'],
      ['dep', 'Contratos de duración determinada con pagos de rendimiento', 'Contratos a plazo', 'cal', '#071024', '#ffffff'],
      ['dep', 'Cuentas bajo demanda para el ahorro de tus clientes', 'Cuentas bajo demanda', 'bank', '#acc2c8', '#071024'],
      ['con', 'Recaudación de fondos con depósitos referenciados', 'Recaudación de fondos', 'heart', '#ecca65', '#071024'],
      ['con', 'Remesas conectadas a tus cuentas y a SPEI', 'Remesas', 'globe', '#365f7a', '#d6f4fa'],
      ['deb', 'Programas de recompensas ligados a cada transacción', 'Programa de recompensas', 'gift', '#00b4dc', '#ffffff'],
      ['deb', 'Devolución de dinero (cashback) en cada compra', 'Cashback', 'back', '#e0be5a', '#071024'],
      ['deb', 'Puntos de lealtad que tus clientes acumulan al pagar', 'Puntos de lealtad', 'star', '#071024', '#ecca65']
    ];
    wrap.innerHTML = cards.map(function (c) {
      return '<div class="swiper-slide h-auto"><div data-has-link-arrow="default" class="case-study-slide_narrow"><a href="https://meetings.hubspot.com/alejandroflores/aurumcore-mktg-fafm" target="_blank" rel="noopener" class="absolute-link w-inline-block" aria-label="' + c[2] + '"></a>' +
        '<div class="case-study-slide_narrow-heading"><div class="case-study-slide_narrow-logo-wrapper"><div class="case-study-slide_narrow-logo"><span class="motor-mark"><svg viewBox="0 0 20 20">' + ic[c[0]] + '</svg>' + motor[c[0]] + '</span></div><div class="link-arrow"><img src="../assets/v2/arrow-ur.svg" alt="" class="object-contain"></div></div><h3 class="text-h7">' + c[1] + '</h3></div>' +
        '<div class="case-study-slide_narrow-thumbnail" style="background-color:' + c[4] + ';--fg:' + c[5] + '"><i class="uc-ring"></i><i class="uc-ring r2"></i>' + (window.aurumMini ? window.aurumMini(c) : '') + '</div></div></div>';
    }).join('');
    var slides = $$('.swiper-slide', wrap), prev = $('.swiper-button-prev_cs'), next = $('.swiper-button-next_cs'), idx = 0, gap = 20, w = 0, spv = 3.5;
    function layout() {
      var cw = wrap.parentElement.clientWidth;
      spv = innerWidth < 480 ? 1.1 : innerWidth < 768 ? 1.6 : innerWidth < 992 ? 2.5 : 3.5;
      gap = 20;
      w = (cw - gap * (Math.ceil(spv) - 1 - (spv % 1 ? 0 : 0))) / spv; w = (cw - gap * (spv - 1)) / spv;
      slides.forEach(function (s) { s.style.width = w + 'px'; s.style.marginRight = gap + 'px'; });
      go(idx);
    }
    function maxIdx() { return Math.max(0, Math.ceil(slides.length - spv)); }
    function go(i) {
      idx = clamp(i, 0, maxIdx());
      var cw = wrap.parentElement.clientWidth, total = slides.length * (w + gap) - gap, x = Math.min(idx * (w + gap), Math.max(0, total - cw));
      wrap.style.transform = 'translate3d(' + (-x) + 'px,0,0)';
      prev.classList.toggle('swiper-button-disabled', idx === 0);
      next.classList.toggle('swiper-button-disabled', x >= total - cw - 1);
    }
    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });
    var sx = null, sy = null, base = 0, drag = false;
    wrap.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; drag = false; base = idx; });
    addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; if (Math.abs(dx) > 40) go(base + (dx < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dx) / (w + gap)))); sx = null; });
    wrap.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; base = idx; }, { passive: true });
    wrap.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(base + (dx < 0 ? 1 : -1)); sx = null; }, { passive: true });
    addEventListener('resize', layout); layout();
  })();

  /* ======================= render choreography ======================= */
  function loopWhileVisible(el, fn, ms) {
    var iv = null;
    whenVisible(el, function () { el.classList.add('is-play'); if (!iv && !reduce) { fn(); iv = setInterval(fn, ms); } }, function () { if (iv) { clearInterval(iv); iv = null; } });
  }
  function countTo(node, to, dec, dur) {
    var from = parseFloat(node.textContent.replace(/,/g, '')) || 0, t0 = performance.now();
    if (reduce) { node.textContent = fmt(to, dec); return; }
    (function f(t) { var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); node.textContent = fmt(from + (to - from) * e, dec); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* R1 Motor de Débito: authorizations / holds / reversals update the balance */
  (function () {
    var rx = $('.rx-debit'); if (!rx) return;
    var rows = $$('.ph-row', rx), bal = $('[data-count-to]', rx), k = 0, seq = [17001.20, 15801.20, 16151.20, 17250.20];
    loopWhileVisible(rx, function () {
      rows.forEach(function (r) { r.classList.remove('is-hi'); });
      if (rows[k]) rows[k].classList.add('is-hi'); countTo(bal, seq[k], 2, 900); k = (k + 1) % seq.length;
    }, 1900);
  })();
  /* R2 Transferencias: CSS loop (4.8s); recount amount each cycle */
  (function () {
    var rx = $('.rx-move'); if (!rx) return;
    var n = $('.mv-amt span', rx), amts = [1500, 2350, 980, 12000], k = 0;
    loopWhileVisible(rx, function () { n.textContent = '0'; countTo(n, amts[k], 0, 1100); k = (k + 1) % amts.length; }, 4800);
  })();
  /* R3 Motor de Crédito: lifecycle advances step by step, payments count 1..12 */
  (function () {
    var rx = $('.rx-credit'); if (!rx) return;
    var steps = $$('.cr-step', rx), pay = $('.cr-pay small', rx), s = 0;
    loopWhileVisible(rx, function () {
      if (s > steps.length) { s = 0; }
      steps.forEach(function (el, i) { el.classList.toggle('is-done', i < s); el.classList.toggle('is-cur', i === s); });
      if (s === 4) { var p = 0; var pi = setInterval(function () { p++; pay.textContent = p; if (p >= 12) clearInterval(pi); }, 70); } else if (s < 4) pay.textContent = '0';
      s++;
    }, 1100);
  })();
  /* R4 Motor de Depósito: term progresses, payment ticks, reinvestment toggles at maturity */
  (function () {
    var rx = $('.rx-deposit'); if (!rx) return;
    var day = $('[data-day]', rx), bar = $('.dp-term i b', rx), big = $('.dp-big span', rx), sw = $('.dp-sw', rx), d = 1;
    loopWhileVisible(rx, function () {
      d += 9; if (d > 180) { d = 1; sw.classList.toggle('is-on'); }
      day.textContent = d; bar.style.width = (d / 180 * 100) + '%'; big.textContent = 395 + (d % 30 < 15 ? 0 : 0);
      if (d === 1) sw.classList.add('is-on');
    }, 220);
    sw.classList.add('is-on');
  })();
  /* R5 slider thumbnails */
  (function () {
    var s = $('.th-sofom'); if (s) { var chips = $$('.st', s), names = ['En cola', 'Enviada', 'Liquidada'], st = chips.map(function (c) { return +c.getAttribute('data-st'); });
      setInterval(function () { if (!s.classList.contains('is-play') || reduce) return; var i = st.indexOf(0) > -1 ? st.indexOf(1) > -1 ? st.indexOf(1) : st.indexOf(0) : -1; if (i === -1) st = [2, 2, 1, 0, 0]; else st[i]++; chips.forEach(function (c, k) { c.setAttribute('data-st', st[k]); c.textContent = names[st[k]]; }); }, 1100); }
    var c = $('.th-coop'); if (c) { var bars = $$('.tc-bars i', c), k = 0; setInterval(function () { if (!c.classList.contains('is-play') || reduce) return; bars.forEach(function (b, i) { b.classList.toggle('is-paid', i <= k); }); k = (k + 1) % (bars.length + 1); }, 900); }
    var e = $('.th-corp'); if (e) { var pts = $('[data-pts]', e), toast = $('.te-toast', e), v = 12480; setInterval(function () { if (!e.classList.contains('is-play') || reduce) return; v += 120 + Math.round(Math.random() * 240); countTo(pts, v, 0, 700); toast.classList.add('is-in'); setTimeout(function () { toast.classList.remove('is-in'); }, 1700); }, 2600); }
  })();
  /* R6 Portal Admin: live account stream, KPIs tick, reversal toast */
  (function () {
    var rx = $('.rx-portal'); if (!rx) return;
    var body = $('.pa-rows', rx), toast = $('.pa-toast', rx), k1 = $('[data-kpi]', rx), k2 = $('[data-kpi2]', rx), n = 0, a = 1248, b = 3912;
    var data = [['Cuenta 0042', 'Autorización', '−$249.00', 'Aplicada', 'g'], ['Crédito 0187', 'Dispersión SPEI', '$35,000.00', 'Liquidada', 'g'], ['Depósito 0311', 'Pago rendimiento', '$395.83', 'Aplicado', 'g'], ['Cuenta 0057', 'Retención', '$1,200.00', 'Retenido', ''], ['Cuenta 0063', 'SPEI recibido', '$9,120.00', 'Conciliado', 'c'], ['Cuenta 0071', 'Reverso', '+$350.00', 'Aplicado', 'c'], ['Crédito 0154', 'Pago recibido', '$3,125.00', 'Conciliado', 'c'], ['Cuenta 0042', 'Ref. 7710', '$2,480.00', 'Conciliado', 'c']];
    function row(d, isNew) { var r = document.createElement('div'); r.className = 'pa-tr' + (isNew ? ' is-new' : ''); r.innerHTML = '<span>' + d[0] + '</span><span>' + d[1] + '</span><span>' + d[2] + '</span><span class="chip ' + d[4] + '">' + d[3] + '</span>'; return r; }
    for (var i = 0; i < 5; i++) body.appendChild(row(data[i]));
    n = 5;
    loopWhileVisible(rx, function () {
      $$('.is-new', body).forEach(function (o) { o.classList.remove('is-new'); }); body.insertBefore(row(data[n % data.length], true), body.firstChild); if (body.children.length > 5) body.removeChild(body.lastChild);
      a += 1 + Math.round(Math.random() * 2); b += 3 + Math.round(Math.random() * 9); countTo(k1, a, 0, 600); countTo(k2, b, 0, 600);
      if (n % 3 === 0) { toast.classList.add('is-in'); setTimeout(function () { toast.classList.remove('is-in'); }, 1600); }
      n++;
    }, 1800);
  })();
  /* thumbnails that only need .is-play while visible */
  $$('.rx-docs, .rx-sec').forEach(function (r) { whenVisible(r, function () { r.classList.add('is-play'); }); });
})();
