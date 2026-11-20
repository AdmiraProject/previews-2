/* QiHealth shared cart engine.
   Contract:
   - [data-buy="band-pro|ring-pro|qitrax|kit-band|kit-ring"] (+ optional data-variant="<id>") → quick-add pop-up
   - [data-cart-open] → opens the drawer; [data-cart-count] → item count (hidden when 0)
   - localStorage "qi-cart" = [{id, qty}]
   - window.QiCart = { open, close, add(variantId, qty, opts), items, clear, quickAdd(key, variantId), checkoutUrl() }
   - "Pagar" → one-form checkout #qc-co (nombre, correo, WhatsApp; lead in localStorage "qi-lead") → Shopify cart
     permalink https://www.qihealth.ai/cart/<id>:<qty>,…?checkout[email]=…&checkout[shipping_address][…]=… . A cancelable `qi:checkout`
     event fires on window first (detail.url) so tests/pages can intercept. */
(function () {
  'use strict';
  if (window.QiCart) return;
  var P = window.QI_PRODUCTS || {}, V = window.QI_VARIANTS || {}, PAY = window.QI_PAY || {};
  var SHOP = window.QI_SHOP || { domain: 'https://www.qihealth.ai' };
  var BASE = window.QI_BASE || '/';
  var KEY = 'qi-cart', MAXQ = 10;
  var fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  var money = function (n) { return fmt.format(n); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var url = function (p) { return /^(https?:|\/)/.test(p) ? p : BASE + p; };

  /* ---------------- icons ---------------- */
  var IC = {
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3.2c0-.4.3-.7.7-.7h1.6c.4 0 .7.3.7.7v1.3M4.6 4.5l.6 8.3c0 .4.4.7.8.7h4c.4 0 .8-.3.8-.7l.6-8.3" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M6 7.5 9 10.5l3-3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevUp: '<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M7.5 12.5 11 9l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    left: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.2 2.8 4 6l3.2 3.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.8 2.8 8 6 4.8 9.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    minus: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  /* ---------------- state ---------------- */
  var items = [];
  function load() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); items = Array.isArray(a) ? a.filter(function (i) { return V[i.id] && i.qty > 0; }).map(function (i) { return { id: +i.id, qty: Math.min(MAXQ, i.qty | 0) }; }) : []; } catch (e) { items = []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { } }
  function count() { return items.reduce(function (s, i) { return s + i.qty; }, 0); }
  function subtotal() { return items.reduce(function (s, i) { return s + V[i.id].price * i.qty; }, 0); }
  function compareTotal() { return items.reduce(function (s, i) { var v = V[i.id]; return s + (v.cmp || v.price) * i.qty; }, 0); }
  function variantLabel(v) {
    var p = P[v.product], parts = [];
    p.opts.forEach(function (o) { if (v[o.key]) parts.push(o.key === 'talla' ? 'Talla ' + v[o.key] : v[o.key]); });
    return parts.join(' / ');
  }
  function thumbFor(v) {
    var p = P[v.product], key = v.color || v.pack || '_';
    return p.thumb[key] || p.thumb._;
  }
  function bgStyle(t) {
    if (!t) return '';
    var s = 'background-image:url(\'' + url(t.src) + '\');';
    if (t.zoom) s += 'background-size:' + Math.round(t.zoom * 100) + '%;background-position:' + (t.pos || '50% 50%') + ';';
    else if (t.pos) s += 'background-position:' + t.pos + ';';
    return s;
  }
  function swStyle(sw) { return sw ? 'background-image:url(\'' + url(sw.src) + '\');background-size:' + (sw.bs || 'cover') + ';background-position:' + (sw.bp || '50% 50%') + ';' : ''; }

  /* ---------------- DOM ---------------- */
  var root, ov, drawer, list, foot, modal, co, lastFocus = null, layer = null;
  function build() {
    root = document.createElement('div');
    root.className = 'qc';
    root.innerHTML =
      '<div class="qc-ov" data-qc-close></div>' +
      '<aside class="qc-drawer" role="dialog" aria-modal="true" aria-labelledby="qc-title" aria-hidden="true" tabindex="-1">' +
        '<div class="qc-head"><h2 class="qc-title" id="qc-title">Tu carrito</h2><div class="qc-head-r"><button class="qc-x" data-qc-close aria-label="Cerrar carrito">' + IC.x + '</button></div></div>' +
        '<div class="qc-list" aria-live="polite"></div>' +
        '<div class="qc-foot"></div>' +
      '</aside>' +
      '<div class="qc-modal" role="dialog" aria-modal="true" aria-labelledby="qc-m-name" aria-hidden="true" tabindex="-1"></div>' +
      '<div class="qc-co" id="qc-co" role="dialog" aria-modal="true" aria-labelledby="qc-co-h" aria-hidden="true" tabindex="-1" data-step="1"></div>';
    document.body.appendChild(root);
    ov = $('.qc-ov', root); drawer = $('.qc-drawer', root); list = $('.qc-list', drawer); foot = $('.qc-foot', drawer); modal = $('.qc-modal', root); co = $('.qc-co', root);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-qc-close]')) { e.preventDefault(); closeAll(); }
    });
    drawer.addEventListener('click', onDrawerClick);
    drawer.addEventListener('change', function (e) {
      var s = e.target.closest('select[data-qty]'); if (!s) return;
      setQty(+s.dataset.qty, +s.value);
    });
    modal.addEventListener('click', onModalClick);
    co.addEventListener('click', onCoClick);
    co.addEventListener('submit', function (e) { e.preventDefault(); coNext(); });
    co.addEventListener('input', function (e) { var f = e.target.closest('.qc-f'); if (f && f.classList.contains('err')) { f.classList.remove('err'); var m = $('.qc-f-msg', f); if (m) m.textContent = ''; var g = $('.qc-co-msg', co); if (g && !$('.qc-f.err', co)) g.textContent = ''; } });
    document.addEventListener('keydown', onKey, true);
  }

  /* ---------------- drawer render ---------------- */
  function renderList() {
    if (!items.length) {
      list.innerHTML = '<div class="qc-empty"><p>Tu carrito está vacío</p><small>Elige tu dispositivo o tus sensores para empezar.</small><div class="qc-empty-ctas">' +
        ['band-pro', 'ring-pro', 'qitrax'].map(function (k) { return '<a class="qc-chip" href="' + url(P[k].url) + '">' + esc(P[k].short) + '</a>'; }).join('') + '</div></div>';
      return;
    }
    list.innerHTML = items.map(function (it) {
      var v = V[it.id], p = P[v.product], opts = '';
      for (var q = 1; q <= Math.max(MAXQ, it.qty); q++) opts += '<option value="' + q + '"' + (q === it.qty ? ' selected' : '') + '>' + q + '</option>';
      var save = v.cmp ? (v.cmp - v.price) * it.qty : 0;
      return '<div class="qc-item" data-id="' + it.id + '">' +
        '<div class="qc-thumb"><i style="' + bgStyle(thumbFor(v)) + '"></i></div>' +
        '<div class="qc-body">' +
          '<div class="qc-row1"><p class="qc-name"><a href="' + url(p.url) + '">' + esc(p.name) + '</a></p><button class="qc-rm" data-rm="' + it.id + '" aria-label="Eliminar ' + esc(p.name) + '">' + IC.trash + '</button></div>' +
          (save ? '<span class="qc-promo">Ahorras ' + money(save) + '</span>' : '') +
          '<p class="qc-desc">' + esc(variantLabel(v)) + '</p>' +
          '<div class="qc-row2"><label class="qc-qty"><span aria-hidden="true">× ' + it.qty + '</span>' + IC.chev + '<select data-qty="' + it.id + '" aria-label="Cantidad de ' + esc(p.name) + '">' + opts + '</select></label>' +
          '<div class="qc-price">' + (v.cmp ? '<span class="qc-was">' + money(v.cmp * it.qty) + '</span>' : '') + '<span class="qc-now">' + money(v.price * it.qty) + '</span></div></div>' +
        '</div></div>';
    }).join('');
  }
  var upIndex = 0;
  var OFFERS = {
    'qitrax': { tag: 'Glucosa', t: 'QiTrax desde $1,380', d: 'Sensor CGM: 15 días y 1,440 lecturas al día.' },
    'band-pro': { tag: 'Nuevo', t: 'Band Pro · $3,500', d: '7 señales 24/7 y 15+ días de batería.' },
    'ring-pro': { tag: 'Nuevo', t: 'Ring Pro · $5,999', d: 'Sueño, frecuencia cardiaca, SpO2, estrés y actividad.' },
    'kit-band': { tag: 'Kit', t: 'Band Pro + 2 QiTrax · $6,260', d: 'Tu banda y 30 días de glucosa.' }
  };
  function renderFoot() {
    var inCart = {}; items.forEach(function (i) { inCart[V[i.id].product] = 1; });
    var offers = Object.keys(OFFERS).filter(function (k) { return P[k] && !inCart[k] && !(k === 'kit-band' && inCart['band-pro']); });
    var n = count(), sub = subtotal(), cmp = compareTotal();
    var payIcons = Object.keys(PAY).map(function (k) { return PAY[k].replace('<svg', '<svg aria-label="' + esc(k) + '" role="img"'); }).join('');
    foot.innerHTML =
      (offers.length && items.length ? '<div class="qc-up"><div class="qc-up-bar"><h3>Antes de irte</h3><div class="qc-up-nav"><button data-up="-1" aria-label="Anterior">' + IC.left + '</button><button data-up="1" aria-label="Siguiente">' + IC.right + '</button></div></div>' +
        '<div class="qc-up-vp"><div class="qc-up-track">' + offers.map(function (k) {
          var o = OFFERS[k], p = P[k];
          return '<div class="qc-offer"><i style="' + bgStyle(p.thumb._) + '"></i><div class="qc-offer-c"><span class="qc-offer-tag">' + esc(o.tag) + '</span><h4 class="qc-offer-t">' + esc(o.t) + '</h4><p class="qc-offer-d">' + esc(o.d) + ' <a href="' + url(p.url) + '">Ver más</a></p></div>' +
            '<button class="qc-offer-add" data-buy="' + k + '" aria-label="Agregar ' + esc(p.name) + '">' + IC.plus + '</button></div>';
        }).join('') + '</div></div></div>' : '') +
      (items.length ? '<div class="qc-sum">' +
        '<div class="qc-total"><span class="qc-total-l">Total (' + n + ' ' + (n === 1 ? 'artículo' : 'artículos') + ')</span><button class="qc-total-r" data-break aria-expanded="false" aria-controls="qc-break"><span>' + money(sub) + '</span>' + IC.chevUp + '</button></div>' +
        '<div class="qc-break" id="qc-break"><div><dl><dt>Subtotal</dt><dd>' + money(cmp) + '</dd>' + (cmp > sub ? '<dt>Ahorro</dt><dd>−' + money(cmp - sub) + '</dd>' : '') + '<dt>Envío</dt><dd>Se calcula al pagar</dd><dt>Total</dt><dd>' + money(sub) + ' MXN</dd></dl></div></div>' +
        '<p class="qc-tax">Envío gratis en zonas seleccionadas · se confirma al pagar</p>' +
        '<a class="qc-pay" href="' + esc(checkoutUrl()) + '" data-checkout>Pagar</a>' +
        '<button class="qc-cont" data-qc-close>Seguir comprando</button>' +
      '</div><div class="qc-trust"><div class="qc-paylogos">' + payIcons + '</div></div>' : '');
    upIndex = Math.min(upIndex, Math.max(0, offers.length - 1)); slideUp(0);
  }
  function slideUp(d) {
    var tr = $('.qc-up-track', foot); if (!tr) return;
    var cards = $$('.qc-offer', tr); upIndex = Math.max(0, Math.min(cards.length - 1, upIndex + d));
    var x = cards[upIndex] ? cards[upIndex].offsetLeft - cards[0].offsetLeft : 0;
    tr.style.transform = 'translateX(' + (-x) + 'px)';
    var b = $$('[data-up]', foot); if (b.length) { b[0].disabled = upIndex === 0; b[1].disabled = upIndex >= cards.length - 1; }
  }
  function render() { if (!root) return; renderList(); renderFoot(); updateCounts(); }
  function updateCounts(bump) {
    var n = count();
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = n > 9 ? '9+' : String(n); el.hidden = n === 0; el.setAttribute('aria-label', n + ' artículos en el carrito');
      if (bump && n) { el.classList.remove('qc-bump'); void el.offsetWidth; el.classList.add('qc-bump'); }
    });
  }
  function onDrawerClick(e) {
    var t;
    if ((t = e.target.closest('[data-rm]'))) { removeItem(+t.dataset.rm); return; }
    if ((t = e.target.closest('[data-up]'))) { slideUp(+t.dataset.up); return; }
    if ((t = e.target.closest('[data-break]'))) { var o = t.getAttribute('aria-expanded') !== 'true'; t.setAttribute('aria-expanded', o); $('#qc-break', drawer).classList.toggle('is-on', o); return; }
    if ((t = e.target.closest('[data-checkout]'))) { e.preventDefault(); openCheckout(1); return; }
  }
  function removeItem(id) {
    var el = $('.qc-item[data-id="' + id + '"]', list);
    var done = function () { items = items.filter(function (i) { return i.id !== id; }); save(); render(); emit(); };
    if (el && !matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-out'); setTimeout(done, 200); } else done();
  }
  function setQty(id, q) {
    q = Math.max(0, Math.min(MAXQ, q | 0));
    if (!q) return removeItem(id);
    items.forEach(function (i) { if (i.id === id) i.qty = q; });
    save(); render(); emit();
    var s = $('select[data-qty="' + id + '"]', list); if (s) s.focus();
  }
  function checkoutUrl(lead) {
    var u = SHOP.domain.replace(/\/$/, '') + '/cart/' + items.map(function (i) { return i.id + ':' + i.qty; }).join(',');
    if (!lead) return u;
    var q = [], add = function (k, v) { if (v) q.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); }, A = 'checkout[shipping_address]';
    add('checkout[email]', lead.email);
    var nm = (lead.nombre || '').trim().split(/\s+/), first = nm.shift() || '', last = lead.apellido || nm.join(' ');
    add(A + '[first_name]', first); add(A + '[last_name]', last);
    add(A + '[address1]', lead.calle); add(A + '[address2]', lead.colonia);
    add(A + '[city]', lead.ciudad); add(A + '[province]', lead.estado); add(A + '[zip]', lead.cp);
    add(A + '[country]', 'MX'); add(A + '[phone]', lead.tel ? '+52' + lead.tel : '');
    return u + (q.length ? '?' + q.join('&') : '');
  }
  function checkout(btn, lead) {
    if (!items.length) return;
    var u = checkoutUrl(lead);
    var ev = new CustomEvent('qi:checkout', { cancelable: true, detail: { url: u, items: items.slice() } });
    if (!window.dispatchEvent(ev)) return;
    if (btn) { btn.classList.add('is-busy'); btn.textContent = 'Abriendo pago seguro…'; }
    try { window.dispatchEvent(new CustomEvent('qi:checkout-go', { detail: { url: u } })); } catch (e) { }
    location.href = u;
  }
  function emit() { try { window.dispatchEvent(new CustomEvent('qi:cart', { detail: { items: items.slice(), count: count(), subtotal: subtotal() } })); } catch (e) { } }

  /* ---------------- layers: open/close + focus trap ---------------- */
  function show(el) {
    if (layer && layer !== el) hide(layer, true);
    if (!layer) lastFocus = document.activeElement;
    layer = el;
    document.documentElement.classList.add('qc-lock');
    ov.classList.add('is-on'); el.classList.add('is-on'); el.setAttribute('aria-hidden', 'false');
    setTimeout(function () { var f = focusables(el)[0]; (f || el).focus({ preventScroll: true }); }, 60);
  }
  function hide(el, swap) {
    el.classList.remove('is-on'); el.setAttribute('aria-hidden', 'true');
    if (swap) return;
    ov.classList.remove('is-on'); layer = null;
    document.documentElement.classList.remove('qc-lock');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) { }
  }
  function closeAll() { if (layer) hide(layer); }
  function focusables(el) { return $$('a[href],button:not([disabled]),select,input,[tabindex]:not([tabindex="-1"])', el).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; }); }
  function onKey(e) {
    if (!layer) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeAll(); return; }
    if (e.key === 'Tab') {
      var f = focusables(layer); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || !layer.contains(document.activeElement))) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && (document.activeElement === z || !layer.contains(document.activeElement))) { e.preventDefault(); a.focus(); }
    }
  }
  function open() { render(); show(drawer); }

  /* ---------------- add ---------------- */
  function add(variantId, qty, opts) {
    variantId = +variantId; qty = Math.max(1, qty | 0 || 1); opts = opts || {};
    if (!V[variantId]) { console.warn('[QiCart] variante desconocida', variantId); return false; }
    var ex = items.filter(function (i) { return i.id === variantId; })[0];
    if (ex) ex.qty = Math.min(MAXQ, ex.qty + qty); else items.push({ id: variantId, qty: Math.min(MAXQ, qty) });
    save(); render(); updateCounts(true); emit();
    if (!opts.silent) showAdded(variantId);
    return true;
  }
  // Magic-style: after adding, the product pop-up stays open with a confirmation + Pagar
  function showAdded(variantId) {
    var v = V[+variantId]; if (!v) { open(); return; }
    var p = P[v.product], sel = {};
    p.opts.forEach(function (o) { sel[o.key] = v[o.key]; });
    qa = { key: v.product, sel: sel, qty: 1, added: +variantId };
    renderModal(!modal.classList.contains('is-on')); show(modal);
  }
  function clear() { items = []; save(); render(); emit(); }


  /* ---------------- checkout: 1 formulario (nombre, correo, WhatsApp) → Shopify ---------------- */
  var LEADKEY = 'qi-lead';
  var FIELDS = [['nombre', 'Nombre completo', 'name', 'text'], ['email', 'Correo', 'email', 'email'], ['tel', 'WhatsApp', 'tel-national', 'tel']];
  function getLead() { try { return JSON.parse(localStorage.getItem(LEADKEY) || 'null') || {}; } catch (e) { return {}; } }
  function setLead(l) { try { localStorage.setItem(LEADKEY, JSON.stringify(l)); } catch (e) { } }
  function openCheckout(n) {
    if (!items.length) { open(); return; }
    coRender(true); show(co);
  }
  function validate(form, only) {
    var L = {}, bad = [];
    FIELDS.forEach(function (f) { L[f[0]] = (form.elements[f[0]].value || '').trim(); });
    L.tel = L.tel.replace(/\D/g, '').replace(/^52(?=\d{10}$)/, '');
    L.nombre = L.nombre.replace(/\s+/g, ' ');
    var chk = {
      nombre: L.nombre.replace(/\s+/g, ' ').length >= 3 || 'Escribe tu nombre.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(L.email) || 'Revisa tu correo (ej. nombre@correo.com).',
      tel: /^\d{10}$/.test(L.tel) || 'Escribe 10 dígitos, sin lada +52.'
    };
    FIELDS.forEach(function (f) {
      if (only && only !== f[0]) return;
      var ok = chk[f[0]], el = form.elements[f[0]], box = el.closest('.qc-f'), msg = $('.qc-f-msg', box);
      box.classList.toggle('err', ok !== true); el.setAttribute('aria-invalid', ok !== true);
      msg.textContent = ok === true ? '' : ok; if (ok !== true) bad.push(el);
    });
    return { lead: L, bad: bad };
  }
  document.addEventListener('input', liveCheck, true);
  document.addEventListener('change', liveCheck, true);
  function liveCheck(e) {
    var el = e.target, box = el && el.closest && el.closest('.qc-f.err'), form = box && el.form;
    if (box && form && form.classList.contains('qc-co-b') && el.name) {
      validate(form, el.name);
      var left = form.querySelectorAll('.qc-f.err').length, m = co && co.querySelector('.qc-co-msg');
      if (m) m.textContent = left ? 'Revisa ' + (left === 1 ? 'el campo marcado' : 'los ' + left + ' campos marcados') + '.' : '';
    }
  }
  function coLines(edit) {
    return items.map(function (it) {
      var v = V[it.id], p = P[v.product];
      return '<li class="qc-co-it"><i style="' + bgStyle(thumbFor(v)) + '"></i><div class="qc-co-itc"><b>' + esc(p.name) + '</b><small>' + esc(variantLabel(v)) + (edit ? '' : ' · × ' + it.qty) + '</small>' +
        (edit ? '<div class="qc-co-itr"><div class="qc-step qc-step-s" role="group" aria-label="Cantidad de ' + esc(p.name) + '"><button type="button" data-co-q="' + it.id + '" data-d="-1" aria-label="Quitar uno">' + IC.minus + '</button><output>' + it.qty + '</output><button type="button" data-co-q="' + it.id + '" data-d="1" aria-label="Agregar uno"' + (it.qty >= MAXQ ? ' disabled' : '') + '>' + IC.plus + '</button></div><button type="button" class="qc-co-rm" data-co-rm="' + it.id + '">Eliminar</button></div>' : '') +
        '</div><div class="qc-price">' + (v.cmp ? '<span class="qc-was">' + money(v.cmp * it.qty) + '</span>' : '') + '<span class="qc-now">' + money(v.price * it.qty) + '</span></div></li>';
    }).join('');
  }
  function coTotals() {
    var sub = subtotal(), cmp = compareTotal();
    return '<dl class="qc-co-tot"><dt>Subtotal</dt><dd>' + money(cmp) + '</dd>' + (cmp > sub ? '<dt>Ahorro</dt><dd class="qc-co-save">−' + money(cmp - sub) + '</dd>' : '') +
      '<dt>Envío</dt><dd>Gratis en zonas seleccionadas*</dd><dt class="qc-co-big">Total</dt><dd class="qc-co-big">' + money(sub) + ' <small>MXN</small></dd></dl>';
  }
  function coRender(first) {
    if (!items.length) { hide(co, true); open(); return; }
    var L = getLead(), n = count(), h = '';
    var nameVal = L.nombre ? (L.nombre + (L.apellido && L.nombre.indexOf(L.apellido) < 0 ? ' ' + L.apellido : '')) : '';
    var fld = function (k, label, inner) { return '<div class="qc-f"><label for="qc-' + k + '">' + label + '</label>' + inner + '<span class="qc-f-msg" aria-live="polite"></span></div>'; };
    h += '<div class="qc-co-c"><button type="button" class="qc-x qc-co-x" data-qc-close aria-label="Cerrar">' + IC.x + '</button>';
    h += '<form class="qc-co-b" novalidate><h2 class="qc-co-h" id="qc-co-h">Tus datos</h2><p class="qc-co-p">Solo 3 datos. Te llevamos al pago seguro de QiHealth con ellos ya llenos.</p>' +
      '<ul class="qc-co-list qc-co-list-s">' + coLines(false) + '</ul>' +
      '<p class="qc-co-sum"><span>' + n + ' ' + (n === 1 ? 'artículo' : 'artículos') + '</span><b>' + money(subtotal()) + ' <small>MXN</small></b></p>' +
      '<div class="qc-co-fields">' +
      fld('nombre', 'Nombre completo', '<input name="nombre" id="qc-nombre" type="text" autocomplete="name" value="' + esc(nameVal) + '" required>') +
      fld('email', 'Correo', '<input name="email" id="qc-email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" value="' + esc(L.email || '') + '" required>') +
      fld('tel', 'WhatsApp', '<span class="qc-pre"><span>+52</span><input name="tel" id="qc-tel" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="10 dígitos" value="' + esc(L.tel || '') + '" required></span>') +
      '</div><p class="qc-co-msg" role="alert"></p>' +
      '<button type="submit" class="qc-pay qc-co-go" data-co-pay>Continuar al pago · ' + money(subtotal()) + '</button>' +
      '<div class="qc-co-secure"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 20 6v6c0 4.6-3.3 8.4-8 9.5-4.7-1.1-8-4.9-8-9.5V6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><p>El cobro y el envío se completan en el checkout seguro de qihealth.ai (Shopify): tarjeta, PayPal, Apple Pay, Google Pay o Shop Pay.</p></div>' +
      '<div class="qc-paylogos qc-co-logos">' + Object.keys(PAY).map(function (k) { return PAY[k].replace('<svg', '<svg aria-label="' + esc(k) + '" role="img"'); }).join('') + '</div>' +
      '</form>';
    h += '</div>';
    co.dataset.step = 'form'; co.innerHTML = h;
    var sc = $('.qc-co-b', co); if (sc) sc.scrollTop = 0;
    if (!first) setTimeout(function () { var f = $('input', co); if (f) f.focus({ preventScroll: true }); }, 30);
  }
  function coNext() {
    var form = $('form', co); if (!form) return;
    var r = validate(form);
    if (r.bad.length) { $('.qc-co-msg', co).textContent = 'Revisa ' + (r.bad.length === 1 ? 'el campo marcado' : 'los ' + r.bad.length + ' campos marcados') + '.'; r.bad[0].focus(); return; }
    setLead(r.lead); checkout($('[data-co-pay]', co), r.lead);
  }
  function onCoClick(e) {
    // the form's submit button validates via the submit handler → coNext()
    var t;
    if ((t = e.target.closest('[data-co-q]'))) { var id = +t.dataset.coQ, cur = items.filter(function (i) { return i.id === id; })[0]; if (cur) { setQtySilent(id, cur.qty + (+t.dataset.d)); coRender(); } return; }
    if ((t = e.target.closest('[data-co-rm]'))) { setQtySilent(+t.dataset.coRm, 0); coRender(); return; }
  }
  function setQtySilent(id, q) {
    q = Math.max(0, Math.min(MAXQ, q | 0));
    if (!q) items = items.filter(function (i) { return i.id !== id; }); else items.forEach(function (i) { if (i.id === id) i.qty = q; });
    save(); render(); emit();
  }

  /* ---------------- quick-add pop-up ---------------- */
  var qa = null; // {key, sel:{color,talla,pack}, qty}
  function findVariant(key, sel) {
    var p = P[key];
    return p.variants.filter(function (v) { return p.opts.every(function (o) { return v[o.key] === sel[o.key]; }); })[0] || null;
  }
  function available(key, optKey, val, sel) {
    var p = P[key];
    return p.variants.some(function (v) {
      if (v.na) return false;
      if (v[optKey] !== val) return false;
      return p.opts.every(function (o) { return o.key === optKey || !sel[o.key] || o.key === 'talla' && optKey === 'color' || v[o.key] === sel[o.key]; });
    });
  }
  function quickAdd(key, variantId) {
    var p = P[key]; if (!p) { console.warn('[QiCart] producto desconocido', key); return; }
    var sel = {}, v = variantId && V[+variantId];
    if (v && v.product === key) p.opts.forEach(function (o) { sel[o.key] = v[o.key]; });
    else {
      // sensible defaults: first option of single-option products; packs default to the best seller
      p.opts.forEach(function (o, i) { if (i === 0 && o.key !== 'talla') sel[o.key] = o.key === 'pack' ? 'Pack 2 sensores' : o.values[0].v; });
    }
    qa = { key: key, sel: sel, qty: 1 };
    renderModal(true); show(modal);
  }
  function renderModal(first) {
    var p = P[qa.key], v = findVariant(qa.key, qa.sel), sel = qa.sel;
    var price = v ? v.price : p.from, cmp = v && v.cmp;
    var thumb = p.thumb[sel.color || sel.pack] || p.thumb._;
    var missing = p.opts.filter(function (o) { return !sel[o.key]; })[0];
    var h = '';
    h += '<div class="qc-m-media"><i style="' + bgStyle(thumb) + '"></i></div>';
    h += '<div class="qc-m-body"><button class="qc-x qc-m-x" data-qc-close aria-label="Cerrar">' + IC.x + '</button><div class="qc-m-scroll">';
    h += '<p class="qc-m-kind">' + esc(p.kind) + '</p><h2 class="qc-m-name" id="qc-m-name">' + esc(p.name) + '</h2>';
    h += '<div class="qc-m-price">' + (cmp ? '<span class="qc-m-was">' + money(cmp) + '</span>' : '') + '<span class="qc-m-now">' + (v ? '' : 'Desde ') + money(price) + '</span>' + (cmp ? '<span class="qc-m-save">Ahorras ' + money(cmp - price) + '</span>' : '') + '</div>';
    p.opts.forEach(function (o) {
      var cur = sel[o.key];
      h += '<div class="qc-opt" role="radiogroup" aria-label="' + esc(o.title) + '"><p class="qc-opt-h">' + esc(o.title) + '. <span>' + (cur ? esc(o.key === 'talla' ? 'Talla ' + cur : cur) : (o.key === 'talla' ? 'Elige tu talla.' : 'Elige una opción.')) + '</span></p><div class="qc-opt-v' + (o.key === 'pack' ? ' qc-packs' : '') + '">';
      o.values.forEach(function (val) {
        var on = cur === val.v, ok = available(qa.key, o.key, val.v, sel);
        if (o.key === 'color') h += '<button class="qc-sw" role="radio" aria-checked="' + on + '" aria-label="' + esc(val.v) + '" data-opt="color" data-val="' + esc(val.v) + '"' + (ok ? '' : ' disabled') + '><i style="' + swStyle(val.sw) + '"></i></button>';
        else if (o.key === 'talla') h += '<button class="qc-size" role="radio" aria-checked="' + on + '" aria-label="Talla ' + esc(val.v) + (ok ? '' : ' (no disponible en este color)') + '" data-opt="talla" data-val="' + esc(val.v) + '"' + (ok ? '' : ' disabled') + '>' + esc(val.v) + '</button>';
        else if (o.key === 'pack') {
          var pv = p.variants.filter(function (x) { return x.pack === val.v; })[0];
          h += '<button class="qc-pack" role="radio" aria-checked="' + on + '" data-opt="pack" data-val="' + esc(val.v) + '"><span><b>' + esc(val.label) + (val.tag ? '<span class="qc-pack-tag">' + esc(val.tag) + '</span>' : '') + '</b><small>' + val.days + ' días · ' + money(Math.round(pv.price / val.n)) + '/sensor</small></span>' +
            '<span class="qc-pack-p">' + (pv.cmp ? '<s>' + money(pv.cmp) + '</s>' : '') + '<span>' + money(pv.price) + '</span></span></button>';
        }
      });
      h += '</div>';
      if (o.key === 'talla') h += '<p class="qc-hint">Ni apretado ni suelto. Se recomienda el dedo índice de la mano no dominante.</p>';
      h += '</div>';
    });
    h += '<p class="qc-m-legal">' + esc(p.legal) + '</p>';
    if (qa.added) {
      var n = count();
      h += '</div><div class="qc-m-done" role="status" aria-live="polite"><p class="qc-m-ok"><span class="qc-m-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12.5 4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><b>Agregado al carrito</b><small>' + n + ' ' + (n === 1 ? 'artículo' : 'artículos') + ' · Subtotal ' + money(subtotal()) + ' MXN · <button type="button" class="qc-m-cart" data-qa-cart>Ver carrito</button></small></span></p>' +
        '<div class="qc-m-cta qc-m-cta2"><button type="button" class="qc-co-back qc-m-more" data-qc-close>Seguir comprando</button><button type="button" class="qc-pay qc-add" data-qa-checkout>Pagar · ' + money(subtotal()) + '</button></div></div></div>';
    } else
    h += '</div><div class="qc-m-cta"><div class="qc-step" role="group" aria-label="Cantidad"><button data-step="-1" aria-label="Quitar uno"' + (qa.qty <= 1 ? ' disabled' : '') + '>' + IC.minus + '</button><output aria-live="polite">' + qa.qty + '</output><button data-step="1" aria-label="Agregar uno"' + (qa.qty >= MAXQ ? ' disabled' : '') + '>' + IC.plus + '</button></div>' +
      '<button class="qc-pay qc-add" data-qa-add' + (v ? '' : ' disabled') + '>' + (v ? 'Agregar al carrito · ' + money(price * qa.qty) : (missing && missing.key === 'talla' ? 'Elige tu talla' : 'Elige ' + (missing ? missing.label.toLowerCase() : 'una opción'))) + '</button></div></div>';
    // keep scroll + crossfade image when only the selection changed
    var sc = $('.qc-m-scroll', modal), st = sc ? sc.scrollTop : 0, oldI = $('.qc-m-media i', modal);
    var focusSel = document.activeElement && modal.contains(document.activeElement) ? (document.activeElement.dataset.val ? '[data-opt="' + document.activeElement.dataset.opt + '"][data-val="' + document.activeElement.dataset.val + '"]' : document.activeElement.hasAttribute('data-step') ? '[data-step="' + document.activeElement.dataset.step + '"]' : null) : null;
    var oldStyle = oldI && oldI.getAttribute('style');
    modal.innerHTML = h;
    if (!first) {
      var sc2 = $('.qc-m-scroll', modal); if (sc2) sc2.scrollTop = st;
      var ni = $('.qc-m-media i', modal);
      if (oldStyle && ni.getAttribute('style') !== oldStyle) { var o = document.createElement('i'); o.setAttribute('style', oldStyle); ni.parentNode.insertBefore(o, ni.nextSibling); requestAnimationFrame(function () { o.classList.add('is-old'); setTimeout(function () { o.remove(); }, 400); }); }
      if (focusSel) { var f = $(focusSel, modal); if (f && !f.disabled) f.focus({ preventScroll: true }); }
    }
  }
  function onModalClick(e) {
    var t;
    if ((t = e.target.closest('[data-opt]'))) {
      if (t.disabled) return;
      var k = t.dataset.opt; qa.sel[k] = t.dataset.val; qa.added = 0;
      // changing color can invalidate a chosen size (e.g. Ring Pro Dorado has no 12/13, Negro starts at 9)
      if (k === 'color' && qa.sel.talla && !findVariant(qa.key, qa.sel)) delete qa.sel.talla;
      renderModal(); return;
    }
    if ((t = e.target.closest('[data-step]'))) { qa.qty = Math.max(1, Math.min(MAXQ, qa.qty + (+t.dataset.step))); renderModal(); return; }
    if ((t = e.target.closest('[data-qa-add]'))) {
      var v = findVariant(qa.key, qa.sel); if (!v) return;
      add(v.id, qa.qty, { silent: true }); qa.added = v.id; qa.qty = 1; renderModal();
      var pb = $('[data-qa-checkout]', modal); if (pb) pb.focus({ preventScroll: true });
      return;
    }
    if ((t = e.target.closest('[data-qa-checkout]'))) { openCheckout(); return; }
    if ((t = e.target.closest('[data-qa-cart]'))) { open(); return; }
  }

  /* ---------------- global delegation ---------------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-buy]');
    if (b && !b.closest('.qc-modal')) { e.preventDefault(); quickAdd(b.getAttribute('data-buy'), b.getAttribute('data-variant')); return; }
    var c = e.target.closest('[data-cart-open]');
    if (c) { e.preventDefault(); open(); }
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); render(); } });

  load();
  function init() { build(); render(); }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);

  window.QiCart = {
    open: open,
    close: closeAll,
    add: add,
    clear: clear,
    quickAdd: quickAdd,
    added: showAdded,
    remove: removeItem,
    setQty: setQty,
    checkoutUrl: checkoutUrl,
    checkout: function (n) { openCheckout(n || 1); },
    pay: function () { checkout(null, getLead()); },
    lead: getLead,
    money: money,
    get items() { return items.map(function (i) { var v = V[i.id]; return { id: i.id, qty: i.qty, product: v.product, name: P[v.product].name, variant: variantLabel(v), price: v.price, compareAt: v.cmp || null }; }); },
    get count() { return count(); },
    get subtotal() { return subtotal(); }
  };
  try { window.dispatchEvent(new CustomEvent('qi:cart-ready')); } catch (e) { }
})();
