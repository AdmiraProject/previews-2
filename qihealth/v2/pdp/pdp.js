(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CFG = window.PDP || {};
  var P = window.QI_PRODUCTS || {};
  var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };

  /* ---------------- nav: stuck + background by section ---------------- */
  var nav = $('#nav');
  var zones = $$('[data-nav]');
  var sections = $$('.p-main > section');
  function bgOf(sec) {
    if (sec.hasAttribute('data-nav')) return sec.getAttribute('data-nav');
    var c = getComputedStyle(sec).backgroundColor;
    return c && c !== 'rgba(0, 0, 0, 0)' ? c : '#fff';
  }
  var ticking = false;
  function onScroll() {
    ticking = false;
    if (!nav) return;
    nav.classList.toggle('stuck', window.scrollY > 0);
    var probe = nav.getBoundingClientRect().bottom - 2, col = '#fff';
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) col = bgOf(sections[i]);
    }
    var foot = $('.foot');
    if (foot && foot.getBoundingClientRect().top <= probe) col = '#092334';
    nav.style.setProperty('--nbg', col);
    nav.classList.toggle('dark', col === '#092334');
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------------- menu drawer (markup shared with v2 home) ---------------- */
  var drawer = $('#drawer'), curtain = $('#curtain'), burger = $('#burger');
  function setDrawer(on) {
    if (!drawer) return;
    drawer.classList.toggle('on', on); curtain.classList.toggle('on', on);
    drawer.setAttribute('aria-hidden', !on); burger.setAttribute('aria-expanded', on);
    document.documentElement.style.overflow = on ? 'hidden' : '';
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(true); });
    var x = $('#drClose'); if (x) x.addEventListener('click', function () { setDrawer(false); });
    curtain.addEventListener('click', function () { setDrawer(false); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('on')) setDrawer(false); });
  }

  /* ---------------- gallery ---------------- */
  var gal = $('.p-gal'), ul = gal && $('.p-gal-ul', gal), rack = gal && $('.p-thumbs', gal);
  function slideW() { return ul.clientWidth + parseFloat(getComputedStyle(ul).columnGap || getComputedStyle(ul).gap || 0); }
  function setActive(i) { $$('button', rack).forEach(function (b, k) { b.setAttribute('data-active', k === i ? 'true' : 'false'); }); }
  function goSlide(i) { ul.scrollTo({ left: i * slideW(), behavior: 'smooth' }); setActive(i); }
  if (ul) {
    rack.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) goSlide(+b.getAttribute('data-i')); });
    var st;
    ul.addEventListener('scroll', function () {
      clearTimeout(st);
      st = setTimeout(function () { setActive(Math.round(ul.scrollLeft / slideW())); }, 60);
    }, { passive: true });
    ul.addEventListener('keydown', function (e) {
      var i = Math.round(ul.scrollLeft / slideW()), n = ul.children.length;
      if (e.key === 'ArrowRight') { e.preventDefault(); goSlide(Math.min(n - 1, i + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goSlide(Math.max(0, i - 1)); }
    });
    var drag = null;
    ul.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || ul.children.length < 2) return;
      drag = { x: e.clientX, left: ul.scrollLeft, moved: false };
      ul.setPointerCapture(e.pointerId);
    });
    ul.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) { drag.moved = true; ul.classList.add('drag'); }
      if (drag.moved) ul.scrollLeft = drag.left - dx;
    });
    var end = function () {
      if (!drag) return;
      var moved = drag.moved, from = drag.left; drag = null;
      ul.classList.remove('drag');
      if (moved) {
        var w = slideW(), i = Math.round(ul.scrollLeft / w), cur = Math.round(from / w);
        if (i === cur) i = ul.scrollLeft > from ? cur + 1 : cur - 1;
        goSlide(Math.max(0, Math.min(ul.children.length - 1, i)));
      }
    };
    ul.addEventListener('pointerup', end); ul.addEventListener('pointercancel', end);
  }
  function swapGallery(key) {
    var list = CFG.gallery && CFG.gallery[key]; if (!list || !ul) return;
    var imgs = $$('img', ul), th = $$('img', rack);
    list.forEach(function (g, i) {
      var im = imgs[i]; if (!im) return;
      if (im.getAttribute('data-src-key') === g.full) return;
      im.setAttribute('data-src-key', g.full);
      im.srcset = g.src + ' 800w, ' + g.full + ' 1800w'; im.src = g.src; im.alt = g.alt; im.style.objectPosition = g.pos;
      if (th[i]) { th[i].srcset = ''; th[i].src = g.src; th[i].style.objectPosition = g.pos; }
    });
    ul.scrollTo({ left: 0, behavior: 'auto' }); setActive(0);
  }

  /* ---------------- purchase panel: selector cards + dropdowns ---------------- */
  var sel = {}; Object.keys(CFG.default || {}).forEach(function (k) { sel[k] = CFG.default[k]; });
  var card = CFG.cards && CFG.cards[0] ? CFG.cards[0].id : null;
  function productKey() { var c = (CFG.cards || []).filter(function (x) { return x.id === card; })[0]; return c ? c.product : CFG.key; }
  function variantsOf(pk) { return (P[pk] && P[pk].variants) || []; }
  function match(pk, s) {
    return variantsOf(pk).filter(function (v) { return Object.keys(s).every(function (k) { return v[k] === s[k]; }); })[0] || null;
  }
  function packsFor(c) { return c === 'one' ? ['1 sensor'] : ['Pack 2 sensores', 'Pack 3 sensores', 'Pack 4 sensores', 'Pack 6 sensores']; }
  function optAvailable(key, val) {
    var pk = productKey(), s = {}; Object.keys(sel).forEach(function (k) { s[k] = sel[k]; }); s[key] = val;
    if (key === 'color' && 'talla' in s) delete s.talla;          // any size in that finish
    return !!match(pk, s);
  }
  function optPrice(key, val) {
    var pk = productKey(), s = {}; Object.keys(sel).forEach(function (k) { s[k] = sel[k]; }); s[key] = val;
    if ('talla' in s) { var t = match(pk, s); if (!t) delete s.talla; }
    return match(pk, s);
  }
  function priceHTML(v) {
    if (!v) return '<span class="t t-lm c5 fw6">Agotado</span>';
    var unit = CFG.key === 'qitrax' && v.pack ? (function () { var n = parseInt(v.pack, 10) || 1; return n > 1 ? ' <span class="t t-lm c9 fw6">' + fmt(v.price / n) + '/sensor</span>' : ''; })() : '';
    return (v.cmp ? '<span class="t t-lm fw6 p-strike">' + fmt(v.cmp) + '</span>' : '') + '<span class="t t-lm c9 fw6">' + fmt(v.price) + '</span>' + (unit && false ? unit : '');
  }
  var dds = $$('.p-dd');
  function ddOptions(dd) {
    var key = dd.getAttribute('data-dd'), def = (CFG.dds || []).filter(function (d) { return d.key === key; })[0];
    var opts = def ? def.opts.slice() : [];
    if (key === 'pack') opts = opts.filter(function (o) { return packsFor(card).indexOf(o.v) > -1; });
    return opts;
  }
  function labelHTML(o) {
    return (o.sw ? '<i class="p-sw-dot" style="background:' + o.sw + '"></i>' : '') + o.label;
  }
  function renderDD(dd) {
    var key = dd.getAttribute('data-dd'), opts = ddOptions(dd);
    if (opts.map(function (o) { return o.v; }).indexOf(sel[key]) < 0) sel[key] = opts[0] && opts[0].v;
    if (key === 'talla' && !optAvailable('talla', sel.talla)) {
      var ok = opts.filter(function (o) { return optAvailable('talla', o.v); })[0]; if (ok) sel.talla = ok.v;
    }
    var cur = opts.filter(function (o) { return o.v === sel[key]; })[0] || opts[0];
    $('[data-dd-main]', dd).innerHTML = cur ? labelHTML(cur) : '';
    $('[data-dd-price]', dd).innerHTML = priceHTML(optPrice(key, sel[key]));
    var list = $('.p-ddl', dd);
    list.innerHTML = opts.map(function (o, i) {
      var av = optAvailable(key, o.v), v = optPrice(key, o.v);
      return '<li class="p-ddo' + (o.v === sel[key] ? ' sel' : '') + (av ? '' : ' off') + '" role="option" id="' + key + '-o' + i + '" data-v="' + o.v + '" aria-selected="' + (o.v === sel[key]) + '"' + (av ? '' : ' aria-disabled="true"') + '>' +
        '<span class="t t-lm c9">' + labelHTML(o) + '</span><span class="p-ddo-r">' + (av ? priceHTML(v) : '<span class="t t-lm c5 fw6">No disponible</span>') +
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></li>';
    }).join('');
  }
  function renderAll() {
    dds.forEach(renderDD);
    var v = currentVariant(), btn = $('[data-pdp-add]');
    if (btn) { btn.disabled = !v; btn.textContent = v ? 'Agregar al carrito' : 'No disponible'; }
    // card subtitles (kit prices) stay as rendered; gallery follows the colour / pack
    var gk = CFG.galleryKey && sel[CFG.galleryKey]; if (gk) swapGallery(gk);
  }
  function currentVariant() {
    var s = {}; Object.keys(sel).forEach(function (k) { s[k] = sel[k]; });
    return match(productKey(), s);
  }
  // cards
  $$('.p-sel').forEach(function (l) {
    var inp = $('input', l);
    inp.addEventListener('change', function () {
      if (!inp.checked) return;
      card = l.getAttribute('data-card');
      $$('.p-sel').forEach(function (x) { x.classList.toggle('on', x === l); });
      if (CFG.key === 'qitrax') sel.pack = card === 'one' ? '1 sensor' : 'Pack 2 sensores';
      renderAll();
    });
  });
  // dropdown open/close + keyboard
  var openDD = null;
  function closeDD(dd, focus) {
    if (!dd) return;
    var t = $('.p-ddt', dd); t.classList.remove('on'); t.setAttribute('aria-expanded', 'false'); $('.p-ddl', dd).hidden = true;
    if (focus) t.focus(); if (openDD === dd) openDD = null;
  }
  function open(dd) {
    if (openDD && openDD !== dd) closeDD(openDD);
    var t = $('.p-ddt', dd), l = $('.p-ddl', dd);
    renderDD(dd); l.hidden = false; t.classList.add('on'); t.setAttribute('aria-expanded', 'true'); openDD = dd;
    var s = $('.p-ddo.sel', l) || $('.p-ddo', l); if (s) { s.classList.add('foc'); l.setAttribute('aria-activedescendant', s.id); }
    l.focus({ preventScroll: true });
  }
  function choose(dd, li) {
    if (!li || li.classList.contains('off')) return;
    sel[dd.getAttribute('data-dd')] = li.getAttribute('data-v');
    closeDD(dd, true); renderAll();
  }
  dds.forEach(function (dd) {
    var t = $('.p-ddt', dd), l = $('.p-ddl', dd);
    t.addEventListener('click', function () { if (openDD === dd) closeDD(dd); else open(dd); });
    t.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(dd); } });
    l.addEventListener('click', function (e) { choose(dd, e.target.closest('.p-ddo')); });
    l.addEventListener('keydown', function (e) {
      var items = $$('.p-ddo', l), f = $('.p-ddo.foc', l), i = items.indexOf(f);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); var d = e.key === 'ArrowDown' ? 1 : -1, j = i;
        do { j = (j + d + items.length) % items.length; } while (items[j].classList.contains('off') && j !== i);
        if (f) f.classList.remove('foc'); items[j].classList.add('foc'); l.setAttribute('aria-activedescendant', items[j].id); items[j].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(dd, f); }
      else if (e.key === 'Escape' || e.key === 'Tab') { closeDD(dd, e.key === 'Escape'); }
    });
  });
  document.addEventListener('click', function (e) { if (openDD && !openDD.contains(e.target)) closeDD(openDD); });

  // add to cart → drawer
  var add = $('[data-pdp-add]');
  if (add) add.addEventListener('click', function () {
    var v = currentVariant(); if (!v || !window.QiCart) return;
    window.QiCart.add(v.id, 1);
  });
  $$('[data-pdp-top]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderAll); else renderAll();

  /* ---------------- accordions (height 0 ↔ auto, .41s ease-out) ---------------- */
  $$('.p-acc').forEach(function (a) {
    var d = $('details', a), s = $('summary', a), c = $('.p-acc-c', a);
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (a._busy) return;
      var opening = !a.classList.contains('open');
      a._busy = true; a.classList.add('anim');
      if (opening) {
        d.open = true; a.classList.add('open'); var h = c.scrollHeight; c.style.height = '0px';
        c.getBoundingClientRect(); c.style.height = h + 'px';
      } else {
        c.style.height = c.scrollHeight + 'px'; c.getBoundingClientRect();
        a.classList.remove('open'); d.open = false; c.style.height = '0px';
      }
      var t;
      var done = function (ev) {
        if (ev && (ev.target !== c || ev.propertyName !== 'height')) return;
        c.removeEventListener('transitionend', done); clearTimeout(t);
        c.style.height = ''; a._busy = false; a.classList.remove('anim');
      };
      c.addEventListener('transitionend', done);
      t = setTimeout(done, 650);
    });
  });

  /* ---------------- forever carousel (cross-sell) ---------------- */
  $$('.p-fv').forEach(function (fv) {
    var sc = $('.p-fv-in', fv), prev = $('.prev', fv), next = $('.next', fv);
    function step() { var c = sc.children[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(sc).columnGap || 0) : 300; }
    function upd() {
      var max = sc.scrollWidth - sc.clientWidth - 2;
      prev.hidden = sc.scrollLeft <= 2; next.hidden = sc.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { sc.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { sc.scrollBy({ left: step(), behavior: 'smooth' }); });
    sc.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* ---------------- footer wordmark rise (shared with v2 home) ---------------- */
  var fm = $('#ftMark');
  if (fm && 'IntersectionObserver' in window) {
    var paths = $$('.wm path', fm);
    paths.forEach(function (p, i) { p.style.transitionDelay = (i * 0.045) + 's'; });
    new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { fm.classList.add('in'); o.disconnect(); } }); }, { threshold: 0.3 }).observe(fm);
  } else if (fm) fm.classList.add('in');
})();
