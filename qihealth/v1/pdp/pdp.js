(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, v)); };
  var isMobile = function () { return innerWidth < 768; };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DATA = JSON.parse(($('#pdp-data') || {}).textContent || '{}');
  var KEY = DATA.product, P = (window.QI_PRODUCTS || {})[KEY];
  var money = function (n) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n); };
  var hdrH = function () { var h = $('#hdr'); return h ? h.getBoundingClientRect().bottom : 89; };
  function scrollToEl(el, off) {
    var y = el.getBoundingClientRect().top + scrollY - (off === undefined ? hdrH() + 8 : off);
    scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ================= chrome: header, menu, drawer, footer, chat, cookie ================= */
  var hdr = $('#hdr');
  function onScrollHdr() { if (hdr) hdr.classList.toggle('pdp-scrolled', scrollY > 8); }
  addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();

  var mega = $('#mega'), scrim = $('#scrim'), burger = $('#burger');
  function openMega() { if (!mega) return; mega.classList.add('is-open'); mega.setAttribute('aria-hidden', 'false'); scrim && scrim.classList.add('is-on'); hdr.classList.add('is-open'); burger.classList.add('is-x'); burger.setAttribute('aria-expanded', 'true'); }
  function closeMega() { if (!mega) return; mega.classList.remove('is-open'); mega.setAttribute('aria-hidden', 'true'); scrim && scrim.classList.remove('is-on'); hdr.classList.remove('is-open'); burger.classList.remove('is-x'); burger.setAttribute('aria-expanded', 'false'); }
  if (burger) burger.addEventListener('click', function () { mega.classList.contains('is-open') ? closeMega() : openMega(); });
  if (scrim) scrim.addEventListener('click', closeMega);
  $$('a', mega || document.createElement('i')).forEach(function (a) { a.addEventListener('click', closeMega); });

  var drawer = $('#drawer'), burgerM = $('#burgerM');
  function closeDrawer() { if (!drawer) return; drawer.classList.remove('is-open'); burgerM.classList.remove('is-x'); burgerM.setAttribute('aria-expanded', 'false'); drawer.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = ''; }
  if (burgerM) burgerM.addEventListener('click', function () {
    if (drawer.classList.contains('is-open')) return closeDrawer();
    drawer.classList.add('is-open'); burgerM.classList.add('is-x'); burgerM.setAttribute('aria-expanded', 'true'); drawer.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
  });
  $$('a', drawer || document.createElement('i')).forEach(function (a) { a.addEventListener('click', closeDrawer); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMega(); closeDrawer(); closeVideo(); } });

  $$('.fh').forEach(function (h) { h.addEventListener('click', function () { if (!isMobile()) return; var o = h.parentElement.classList.toggle('open'); h.setAttribute('aria-expanded', o); }); });

  var chat = $('#chat'), chatBtn = $('#chatBtn');
  if (chatBtn) chatBtn.addEventListener('click', function () { var o = chat.classList.toggle('is-open'); chatBtn.setAttribute('aria-expanded', o); });

  var ck = $('#cookie');
  if (ck) {
    var getCk = function () { try { return localStorage.getItem('qh_ck'); } catch (e) { return null; } };
    var setCk = function (v) { try { localStorage.setItem('qh_ck', v); } catch (e) { } };
    var showCk = function () { ck.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { ck.classList.add('is-on'); }); }); };
    var hideCk = function () { ck.classList.remove('is-on'); setTimeout(function () { ck.hidden = true; }, 380); };
    if (!getCk() && !/[?&]nocookie/.test(location.search)) setTimeout(showCk, 1200);
    $$('[data-ck]', ck).forEach(function (b) { b.addEventListener('click', function () { var a = b.dataset.ck; if (a === 'accept' || a === 'decline') setCk(a); if (a !== 'manage') hideCk(); }); });
    var cp = $('#cookiePrefs'); if (cp) cp.addEventListener('click', showCk);
  }

  $$('a[href^="#"], [data-goto]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('data-goto') || a.getAttribute('href'); if (!id || id.length < 2) return;
      var el = $(id); if (!el) return; e.preventDefault(); closeMega(); closeDrawer(); scrollToEl(el);
    });
  });

  /* promo line (real Buen Fin offer on qihealth.ai) disappears automatically after its end date */
  $$('[data-promo-ends]').forEach(function (el) { if (Date.now() > Date.parse(el.dataset.promoEnds)) el.hidden = true; });

  /* reveal on scroll (v1 .rv) */
  var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
  $$('.rv').forEach(function (el) { rio.observe(el); });

  /* ================= gallery (embla-style: slides, dots with autoplay progress, arrows, swipe) ================= */
  var gal = $('#gal'), track = gal && $('.gal-track', gal), dotsW = gal && $('.gal-dots', gal);
  var gIdx = 0, gSet = DATA.gdef, gN = 0, gVisible = true;
  function galRender(setKey) {
    var list = (DATA.gallery || {})[setKey]; if (!list || !track) return;
    gSet = setKey; gN = list.length;
    track.style.opacity = '0';
    setTimeout(function () {
      track.innerHTML = list.map(function (s, i) { return '<div class="gal-slide' + (s.c ? ' is-contain' : '') + '"><img src="' + s.src + '" alt="' + (P ? P.name : '') + ' ' + setKey + ', imagen ' + (i + 1) + '"' + (i ? ' loading="lazy"' : '') + ' decoding="async" draggable="false"></div>'; }).join('');
      dotsW.innerHTML = list.map(function (s, i) { return '<button class="gal-dot" aria-label="Imagen ' + (i + 1) + '"><b></b></button>'; }).join('');
      track.style.transition = 'none'; galGo(0); void track.offsetWidth; track.style.transition = '';
      track.style.opacity = '1';
    }, 180);
  }
  function galGo(i) {
    if (!gN) return;
    gIdx = (i + gN) % gN;
    track.style.transform = 'translateX(' + (-gIdx * 100) + '%)';
    $$('.gal-dot', dotsW).forEach(function (d, k) { d.classList.toggle('is-on', k === gIdx); d.setAttribute('aria-current', k === gIdx ? 'true' : 'false'); });
  }
  if (gal) {
    track.style.transition += ',opacity .18s ease';
    gN = $$('.gal-slide', track).length; galGo(0);
    dotsW.addEventListener('click', function (e) { var d = e.target.closest('.gal-dot'); if (d) galGo($$('.gal-dot', dotsW).indexOf(d)); });
    $$('[data-g]', gal).forEach(function (b) { b.addEventListener('click', function () { galGo(gIdx + (+b.dataset.g)); }); });
    // swipe
    var sx = 0, sy = 0, dx = 0, drag = false, lock = null;
    gal.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; drag = true; lock = null; sx = e.clientX; sy = e.clientY; dx = 0; });
    addEventListener('pointermove', function (e) {
      if (!drag) return; dx = e.clientX - sx; var dy = e.clientY - sy;
      if (lock === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) lock = Math.abs(dx) > Math.abs(dy);
      if (lock) { track.classList.add('is-drag'); track.style.transform = 'translateX(calc(' + (-gIdx * 100) + '% + ' + dx + 'px))'; }
    });
    addEventListener('pointerup', function () { if (!drag) return; drag = false; track.classList.remove('is-drag'); if (lock && Math.abs(dx) > 50) galGo(gIdx + (dx < 0 ? 1 : -1)); else galGo(gIdx); });
  }

  /* ================= buy box state ================= */
  var state = { opts: {}, addon: undefined };
  var secs = $$('.bx-sec');
  function variant() {
    if (!P) return null;
    return P.variants.filter(function (v) { return P.opts.every(function (o) { return v[o.key] === state.opts[o.key]; }); })[0] || null;
  }
  function stepDone(sec) {
    switch (sec.dataset.step) {
      case 'color': return !!state.opts.color;
      case 'size': return !!state.opts.talla && !!variant();
      case 'pack': return !!state.opts.pack;
      case 'addon': return state.addon !== undefined;
      default: return true;
    }
  }
  function firstMissing() { return secs.filter(function (s) { return s.hasAttribute('data-gate') && !stepDone(s); })[0] || null; }
  function update() {
    var blocked = false;
    secs.forEach(function (s) {
      s.classList.toggle('is-locked', blocked);
      if (s.hasAttribute('data-gate') && !stepDone(s)) blocked = true;
    });
    // option buttons
    $$('[data-opt]').forEach(function (b) { b.setAttribute('aria-checked', state.opts[b.dataset.opt] === b.dataset.val ? 'true' : 'false'); });
    $$('[data-addon]').forEach(function (b) { b.setAttribute('aria-checked', String(state.addon !== undefined && +b.dataset.addon === state.addon)); });
    // size availability per color (Ring Pro: Dorado 7–11 & 14, Negro 9–14)
    $$('.bx-size').forEach(function (b) {
      var ok = !state.opts.color || P.variants.some(function (v) { return v.color === state.opts.color && v.talla === b.dataset.val && !v.na; });
      b.disabled = !ok; b.setAttribute('aria-label', 'Talla ' + b.dataset.val + (ok ? '' : ' (no disponible en ' + state.opts.color + ')'));
    });
    var hc = $('[data-hint="color"]'); if (hc && state.opts.color) hc.innerHTML = '<b>' + state.opts.color + '</b>' + (KEY === 'band-pro' ? ' · dispositivo QiHealth Band Pro con correa textil' : ' · elige tu talla');
    var v = variant(), add = state.addon ? (window.QI_VARIANTS || {})[state.addon] : null;
    // price block
    var pe = $('[data-price]'), we = $('[data-was]');
    if (pe && KEY === 'qitrax') {
      if (v) { pe.textContent = money(v.price); if (we) { we.hidden = !v.cmp; we.textContent = v.cmp ? money(v.cmp) : ''; } }
    }
    // summary
    var name = $('[data-sum-name]'), vv = $('[data-sum-var]'), rows = $('[data-sum-rows]'), tot = $('[data-sum-total]'), btn = $('[data-add]');
    if (rows && P) {
      var r = [], total = 0;
      if (v) { total += v.price; r.push([P.name + (KEY === 'qitrax' ? ' · ' + v.pack : ''), money(v.price)]); if (v.cmp) r.push(['Precio regular ' + money(v.cmp), '−' + money(v.cmp - v.price)]); }
      else r.push([P.name, KEY === 'qitrax' ? 'Desde ' + money(P.from) : money(P.from)]);
      var inc = { 'band-pro': 'Base de carga magnética', 'ring-pro': 'Base de carga', 'qitrax': 'Aplicador por sensor' }[KEY];
      r.push([inc, 'Incluido' + (KEY === 'qitrax' ? '' : 'a')]);
      r.push(['App QiHealth + QiCoach', 'Incluida']);
      if (add) { total += add.price; r.push([(add.pack === '1 sensor' ? '1 sensor QiTrax' : add.pack + ' QiTrax'), money(add.price)]); }
      rows.innerHTML = r.map(function (x) { return '<div class="bx-row"><span>' + x[0] + '</span><span>' + x[1] + '</span></div>'; }).join('');
      var label = [];
      if (state.opts.color) label.push(state.opts.color);
      if (state.opts.talla) label.push('Talla ' + state.opts.talla);
      if (state.opts.pack) label.push(state.opts.pack);
      vv.textContent = label.length ? label.join(', ') : 'Elige tus opciones';
      tot.textContent = v ? money(total) : '—';
      var missing = firstMissing();
      btn.disabled = !!missing || !v;
      if (!btn.classList.contains('is-done')) btn.textContent = missing ? (missing.dataset.cta || 'Completa tu pedido') : 'Agregar al carrito';
      // sticky bar
      var sb = $('.sbar-sum'), sbt = $('[data-sbar-total]'), cta = $('[data-sbar-cta]');
      if (sb) { sb.classList.toggle('is-on', !!v); sbt.textContent = v ? money(total) : ''; }
      if (cta) cta.textContent = missing ? (missing.dataset.cta || DATA.cta0) : 'Agregar al carrito';
    }
  }
  function nextAfter(sec) { var i = secs.indexOf(sec); return secs[i + 1] || null; }
  function choose(sec, wasDone) {
    update();
    if (!wasDone && stepDone(sec)) { var n = nextAfter(sec); if (n) setTimeout(function () { scrollToEl(n, isMobile() ? hdrH() - 24 : hdrH() - 24); }, 160); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.bx-sec [data-opt]');
    if (b && !b.disabled) {
      var sec = b.closest('.bx-sec'), was = stepDone(sec), k = b.dataset.opt;
      state.opts[k] = b.dataset.val;
      if (k === 'color') {
        if (state.opts.talla && !variant()) delete state.opts.talla;
        if (DATA.gallery[b.dataset.val] && gSet !== b.dataset.val) galRender(b.dataset.val);
        var dp = $('[data-design][data-swap]');
        if (dp) { var map = JSON.parse(dp.dataset.swap), nu = map[b.dataset.val]; if (nu && dp.getAttribute('src') !== nu) { dp.classList.add('is-swap'); var im = new Image(); im.onload = function () { dp.src = nu; dp.classList.remove('is-swap'); }; im.src = nu; } }
      }
      if (k === 'pack' && DATA.gallery[b.dataset.val] && gSet !== b.dataset.val) galRender(b.dataset.val);
      choose(sec, was); return;
    }
    var a = e.target.closest('[data-addon]');
    if (a) { var s2 = a.closest('.bx-sec'), w2 = stepDone(s2); state.addon = +a.dataset.addon; choose(s2, w2); return; }
    if (e.target.closest('[data-add]')) { addToCart(e.target.closest('[data-add]')); return; }
    if (e.target.closest('[data-sbar-cta]')) {
      var m = firstMissing();
      if (m) scrollToEl(m, hdrH() - 24); else addToCart($('[data-add]'));
    }
  });
  function addToCart(btn) {
    var v = variant(); if (!v || firstMissing() || !window.QiCart) return;
    QiCart.add(v.id, 1, { silent: true });
    if (state.addon) QiCart.add(state.addon, 1, { silent: true });
    QiCart.added(v.id);
    if (btn) { btn.classList.add('is-done'); btn.textContent = 'Agregado al carrito'; setTimeout(function () { btn.classList.remove('is-done'); update(); }, 2200); }
  }
  // nothing greyed out on load: start with a real, available configuration (user can change anything)
  if (P) {
    var DEF = { 'band-pro': { color: 'Negro' }, 'ring-pro': { color: 'Dorado', talla: '9' }, 'qitrax': { pack: 'Pack 2 sensores' } }[KEY] || {};
    Object.keys(DEF).forEach(function (k) { if (!state.opts[k] && $('[data-opt="' + k + '"][data-val="' + DEF[k] + '"]')) state.opts[k] = DEF[k]; });
    if (state.addon === undefined && $('[data-addon="0"]')) state.addon = 0;
  }
  if (P) update();

  /* ================= sticky image + words ================= */
  var otg = $('.otg');
  var otgW = otg ? $$('.otg-h span', otg) : [], otgRows = otg && $('.otg-rows', otg), otgP2 = otg && $('.otg-p2', otg);
  var snapM = $('.snap-m'), uns = $('.uns');
  var u1 = uns && $$('.uns-p1 .w', uns), u2 = uns && $$('.uns-p2 .w', uns);
  function frame() {
    var vh = innerHeight;
    if (otg) {
      var r = otg.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 1.2) {
        // reference: words fade in one after another while the section top travels from 600px to 0 (scroll-scrubbed, opacity only)
        var t = clamp((vh * .667 - r.top) / (vh * .667));
        otgW.forEach(function (w, i) { w.style.setProperty('--o', clamp((t - .45 - i * .055) / .2).toFixed(3)); });
        // spec rows fade in while the second panel's top travels from 300px to 0
        var p2 = otgP2.getBoundingClientRect().top;
        otgRows.style.setProperty('--ro', clamp((vh / 3 - p2) / (vh / 3 - 20)).toFixed(3));
      }
    }
    if (snapM) {
      var rs = snapM.getBoundingClientRect();
      if (rs.bottom > 0 && rs.top < vh) {
        var q = clamp((vh - rs.top) / (vh + 300)), e = q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
        snapM.style.setProperty('--sy', (60 * (1 - e)).toFixed(1) + 'px'); snapM.style.setProperty('--sr', (-18 * (1 - e)).toFixed(2) + 'deg'); snapM.style.setProperty('--ss', (.78 + .4 * e).toFixed(4));
      }
    }

    if (uns) {
      var ru = uns.getBoundingClientRect();
      if (ru.bottom > 0 && ru.top < vh) {
        // reference (1350px of scroll): P1 words fill 0→44%, P1 out at ~50%, P2 words fill 60→100%
        var t = clamp(-ru.top / (ru.height - vh)), fill = function (ws, a, b) { var n = ws.length, st = (b - a) / (n + 1); ws.forEach(function (w, i) { w.style.setProperty('--o', (.2 + .8 * clamp((t - a - i * st) / (st * 1.6))).toFixed(3)); }); };
        fill(u1, 0, .444); fill(u2, .6, 1);
        $('.uns-p1', uns).classList.toggle('is-off', t > .5);
        $('.uns-p2', uns).classList.toggle('is-on', t > .5);
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ================= AI carousel ================= */
  var car = $('#car');
  if (car) {
    var vp = $('.car-vp', car), tr = $('.car-tr', car), sl = $$('.car-sl', tr), dw = $('.car-dots', car), ci = 0, cMax = 0;
    var sw = function () { return sl[0].getBoundingClientRect().width; };
    var layout = function () {
      var inner = vp.clientWidth - parseFloat(getComputedStyle(vp).paddingLeft) - parseFloat(getComputedStyle(vp).paddingRight) + 16;
      cMax = Math.max(0, sl.length - Math.max(1, Math.floor((inner + 2) / sw())));
      dw.innerHTML = ''; for (var i = 0; i <= cMax; i++) dw.insertAdjacentHTML('beforeend', '<button class="car-dot" aria-label="Ir a ' + (i + 1) + '"></button>');
      cGo(Math.min(ci, cMax));
    };
    var cGo = function (i) {
      ci = i < 0 ? cMax : i > cMax ? 0 : i; tr.style.transform = 'translateX(' + (-ci * sw()) + 'px)'; /* UH Embla: arrows never disable, wrap around */
      $$('.car-dot', dw).forEach(function (d, k) { d.classList.toggle('is-on', k === ci); });
      sl.forEach(function (s, k) { s.classList.toggle('is-cur', k === ci); });

    };
    $$('[data-c]', car).forEach(function (b) { b.addEventListener('click', function () { cGo(ci + (+b.dataset.c)); }); });
    dw.addEventListener('click', function (e) { var d = e.target.closest('.car-dot'); if (d) cGo($$('.car-dot', dw).indexOf(d)); });
    var cx = 0, cdx = 0, cdrag = false, clock = null, cy = 0;
    vp.addEventListener('pointerdown', function (e) { cdrag = true; clock = null; cx = e.clientX; cy = e.clientY; cdx = 0; });
    addEventListener('pointermove', function (e) {
      if (!cdrag) return; cdx = e.clientX - cx;
      if (clock === null && (Math.abs(cdx) > 6 || Math.abs(e.clientY - cy) > 6)) clock = Math.abs(cdx) > Math.abs(e.clientY - cy);
      if (clock) { vp.classList.add('is-drag'); tr.classList.add('is-drag'); tr.style.transform = 'translateX(' + (-ci * sw() + cdx) + 'px)'; }
    });
    addEventListener('pointerup', function () { if (!cdrag) return; cdrag = false; vp.classList.remove('is-drag'); tr.classList.remove('is-drag'); if (clock && Math.abs(cdx) > 50) cGo(ci + (cdx < 0 ? Math.max(1, Math.round(-cdx / sw())) : -Math.max(1, Math.round(cdx / sw())))); else cGo(ci); });
    addEventListener('resize', layout); layout();
  }

  /* ================= app phone tabs (auto-advance 4.5 s while visible) ================= */
  var appS = $('#app');
  if (appS) {
    var bar = $('.mbar2', appS), btns = $$('button', bar), hl = $('.mbar2-hl', bar), scr = $$('.phone-s > *', appS), ai = 0, aT = 0, aVis = false;
    var aGo = function (i) {
      ai = (i + btns.length) % btns.length;
      btns.forEach(function (b, k) { b.classList.toggle('is-on', k === ai); b.classList.toggle('is-next', k === (ai + 1) % btns.length); b.setAttribute('aria-selected', k === ai); });
      scr.forEach(function (s, k) { s.classList.toggle('is-on', k === ai); });
      hl.style.width = btns[ai].offsetWidth + 'px'; hl.style.transform = 'translateX(' + (btns[ai].offsetLeft - 8) + 'px)';
    };
    btns.forEach(function (b, k) { b.setAttribute('role', 'tab'); b.addEventListener('click', function () { aGo(k); }); });
    new IntersectionObserver(function (es) { aVis = es[0].isIntersecting; aGo(ai); }, { threshold: .3 }).observe(appS);
    addEventListener('resize', function () { aGo(ai); });
    aGo(0);
  }

  /* ================= video modal ================= */
  var vm = $('#vmod'), vmv = vm && $('video', vm);
  function closeVideo() { if (!vm || !vm.classList.contains('is-on')) return; vm.classList.remove('is-on'); vm.setAttribute('aria-hidden', 'true'); vmv.pause(); }
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () { vmv.src = b.dataset.video; vm.classList.add('is-on'); vm.setAttribute('aria-hidden', 'false'); vmv.currentTime = 0; vmv.play().catch(function () { }); $('button', vm).focus(); });
  });
  if (vm) { $('button', vm).addEventListener('click', closeVideo); vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); }); }

  /* pause off-screen background videos */
  var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting) v.play().catch(function () { }); else v.pause(); }); });
  $$('video[autoplay]').forEach(function (v) { vio.observe(v); });
})();
