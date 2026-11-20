(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const C = window.PDP || {};
  const P = window.QI_PRODUCTS || {}, V = window.QI_VARIANTS || {};
  const mqDesk = matchMedia('(min-width:1024px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  const money = (n) => fmt.format(n).replace('MX', '').trim();
  const imgBase = '../../assets/img/store/';

  /* ---------- header: promo collapse (0.5s cubic-bezier(.65,0,.35,1)), hide when the top buy bar is on ---------- */
  const hdr = $('#hdr'), root = document.documentElement;
  const buySec = $('#comprar'), tbar = $('#tbar'), mbar = $('#mbar'), foot = $('.foot'), pbar = $('#pbar');
  let barOn = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-scrolled', y > 0);
    root.classList.toggle('pd-scrolled', y > 0);
    const b = buySec.getBoundingClientRect().bottom;
    // desktop: Eight's fixed top bar appears once the buy section has scrolled away;
    // mobile: the fixed bottom bar is always on, except while the panel's own bar is on screen
    const pr = pbar.getBoundingClientRect();
    const on = mqDesk.matches ? b < 0 : !(pr.top < innerHeight && pr.bottom > 0);
    if (on !== barOn) { barOn = on; tbar.classList.toggle('is-on', on && mqDesk.matches); mbar.classList.toggle('is-on', on && !mqDesk.matches); }
    hdr.classList.toggle('is-hidden', on && mqDesk.matches);
    const ft = foot.getBoundingClientRect().top;
    tbar.classList.toggle('is-light', ft < 106);          // Eight flips the bar to white over the black footer
    mbar.classList.toggle('is-light', ft < innerHeight);
  };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* ---------- mobile menu + footer (same as v3 home) ---------- */
  const mnav = $('#mnav'), burger = $('#burger');
  const setMenu = (open) => { mnav.classList.toggle('is-open', open); mnav.setAttribute('aria-hidden', !open); burger.setAttribute('aria-expanded', open); root.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(true));
  $('#mnavClose').addEventListener('click', () => setMenu(false));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  const nEmail = $('#newsEmail'), nBtn = $('#newsForm button');
  const okEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  nEmail.addEventListener('input', () => { nBtn.disabled = !okEmail(nEmail.value); });
  $('#newsForm').addEventListener('submit', ev => { ev.preventDefault(); if (okEmail(nEmail.value)) { nEmail.value = ''; nEmail.placeholder = 'Gracias. Te escribiremos pronto.'; nBtn.disabled = true; } });
  $$('.fcol__h').forEach(h => h.addEventListener('click', () => { if (mqDesk.matches) return; const c = h.parentElement, o = !c.classList.contains('open'); c.classList.toggle('open', o); h.setAttribute('aria-expanded', o); }));
  /* payment icons (real checkout methods from qihealth.ai) */
  const PAY = window.QI_PAY || {};
  $$('[data-payicons]').forEach(el => { const n = +el.dataset.payicons || 99; el.innerHTML = Object.keys(PAY).slice(0, n).map(k => PAY[k].replace('<svg', `<svg aria-label="${k}" role="img"`)).join(''); });

  /* ---------- gallery: scroll-snap track, arrows, thumbs (op .5 → 1, .25s), dots ---------- */
  const track = $('#galTrack'), slides = $$('.pd-slide', track);
  const prev = $('.pd-gal__arr--prev'), next = $('.pd-gal__arr--next');
  const thumbs = $$('.pd-thumb'), tTrack = $('.pd-thumbs__track'), tArr = $$('.pd-thumbs__arr'), dots = $$('.pd-dots button');
  let gi = 0, tOff = 0;
  const TH = 108, TVIS = 5;
  const goSlide = (i, smooth = true) => { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft - (slides[0].offsetLeft - track.offsetLeft), behavior: smooth && !reduce ? 'smooth' : 'auto' }); };
  const setThumbOff = (o) => { tOff = Math.max(0, Math.min(Math.max(0, thumbs.length - TVIS), o)); tTrack.style.transform = `translateX(${-tOff * TH}px)`; tArr[0].disabled = tOff === 0; tArr[1].disabled = tOff >= thumbs.length - TVIS; };
  const markSlide = (i) => {
    if (i === gi && track.dataset.init) return; gi = i; track.dataset.init = 1;
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    thumbs.forEach((t, k) => t.classList.toggle('is-on', k === i)); dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    if (i < tOff) setThumbOff(i); else if (i >= tOff + TVIS) setThumbOff(i - TVIS + 1);
    slides.forEach((s, k) => { const v = $('video', s); if (!v) return; if (k === i) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); });
  };
  track.addEventListener('scroll', () => { const w = slides[0].getBoundingClientRect().width + 24; markSlide(Math.round(track.scrollLeft / w)); }, { passive: true });
  prev.addEventListener('click', () => goSlide(gi - 1)); next.addEventListener('click', () => goSlide(gi + 1));
  thumbs.forEach(t => t.addEventListener('click', () => goSlide(+t.dataset.go)));
  dots.forEach(d => d.addEventListener('click', () => goSlide(+d.dataset.go)));
  tArr.forEach(a => a.addEventListener('click', () => setThumbOff(tOff + (+a.dataset.th) * TVIS)));
  track.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight') { ev.preventDefault(); goSlide(gi + 1); } if (ev.key === 'ArrowLeft') { ev.preventDefault(); goSlide(gi - 1); } });
  setThumbOff(0); markSlide(0);

  /* ---------- small carousels (add-on cards, mobile plan carousel) ---------- */
  $$('[data-car]').forEach(c => {
    const t = $('.pd-car__track', c), s = $$('.pd-car__s', t), d = $$('.pd-car__dots button', c), p = $('.pd-car__a--p', c), n = $('.pd-car__a--n', c);
    let k = 0;
    const w = () => s[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(t).columnGap) || 0);
    const go = (i) => t.scrollTo({ left: Math.max(0, Math.min(s.length - 1, i)) * w(), behavior: reduce ? 'auto' : 'smooth' });
    const mark = () => { k = Math.round(t.scrollLeft / w()); d.forEach((b, j) => b.classList.toggle('is-on', j === k)); p.disabled = k === 0; n.disabled = k >= s.length - 1; };
    t.addEventListener('scroll', mark, { passive: true });
    p.addEventListener('click', () => go(k - 1)); n.addEventListener('click', () => go(k + 1));
    d.forEach((b, j) => b.addEventListener('click', () => go(j)));
    mark();
  });

  /* ---------- configuration state ---------- */
  const sel = Object.assign({}, C.sel || {});
  let plan = C.plan;
  const addOn = {}; const addSel = {};
  Object.keys(C.addons || {}).forEach(id => { addOn[id] = false; addSel[id] = Object.assign({}, C.addons[id].sel); });
  const findV = (key, s) => { const p = P[key]; if (!p) return null; return p.variants.find(v => p.opts.every(o => v[o.key] === s[o.key])) || null; };
  const avail = (key, k, val, s) => { const p = P[key]; return p && p.variants.some(v => v[k] === val && p.opts.every(o => o.key === k || !s[o.key] || v[o.key] === s[o.key])); };
  const isSub = () => C.sub && plan === 'sub';
  const mainKey = () => (C.plans || {})[plan] || C.key;
  const missing = () => Object.keys(C.need || {}).find(k => !sel[k]);
  const mainSel = () => (C.planSel && C.planSel[plan]) ? addSel[C.planSel[plan]] : sel;   // QiTrax "Kit Band Pro" uses the Band Pro card colour
  const lines = () => {
    const out = [];
    const mv = findV(mainKey(), mainSel());
    if (mv) out.push({ v: mv, name: P[mainKey()].short || P[mainKey()].name, label: label(mainKey(), mv) });
    ((C.extra || {})[plan] || []).forEach(x => { const v = findV(x.key, x.sel); if (v && mv) out.push({ v, name: x.label, label: '' }); });
    Object.keys(addOn).forEach(id => { if (!addOn[id]) return; const a = C.addons[id]; const v = findV(a.key, addSel[id]); if (v) out.push({ v, name: a.label, label: label(a.key, v), addon: id }); });
    return out;
  };
  const label = (key, v) => (P[key].opts || []).map(o => o.key === 'talla' ? 'Talla ' + v.talla : v[o.key]).filter(Boolean).join(', ');
  const subPrice = () => C.sub && C.sub.prices[sel.pack];

  /* ---------- render prices / bars / tiles ---------- */
  const render = () => {
    const L = lines();
    const ms = mainSel();
    const mv = findV(mainKey(), ms) || (P[mainKey()] && P[mainKey()].variants.find(v => !ms.color || v.color === ms.color)) || null;
    let price = mv ? mv.price : 0, cmp = mv && mv.cmp ? mv.cmp : 0;
    if (isSub() && subPrice()) { cmp = mv.cmp || mv.price; price = subPrice(); }
    $('[data-price]').textContent = mv ? money(price) : '';
    $('[data-cmp]').textContent = cmp ? money(cmp) : '';
    $('[data-off]').textContent = cmp ? money(cmp - price) + ' de descuento' : '';
    let tot = L.reduce((s, l) => s + l.v.price, 0), tcmp = L.reduce((s, l) => s + (l.v.cmp || l.v.price), 0);
    if (isSub() && subPrice()) { tot = tot - L[0].v.price + subPrice(); }
    if (!L.length && mv) { tot = mv.price; tcmp = mv.cmp || mv.price; }
    $$('[data-total]').forEach(el => el.textContent = money(tot));
    $$('[data-tcmp]').forEach(el => el.textContent = tcmp > tot ? money(tcmp) : '');
    $$('[data-toff]').forEach(el => el.textContent = tcmp > tot ? money(tcmp - tot) + ' off' : '');
    const nm = missing();
    const title = (P[mainKey()] ? (P[mainKey()].short || C.short) : C.short) + (L[0] && L[0].label ? ` (${L[0].label})` : '') + L.slice(1).map(l => ' + ' + l.name).join('');
    $$('[data-title]').forEach(el => el.textContent = title);
    $$('[data-pay]').forEach(b => { b.textContent = isSub() ? (subPrice() ? 'Suscribirme' : 'No disponible') : nm ? C.need[nm] : 'Pagar'; b.disabled = isSub() && !subPrice(); });
    // tiles
    $$('[data-opt]').forEach(t => {
      const k = t.dataset.opt, v = t.dataset.val, on = sel[k] === v;
      t.classList.toggle('is-on', on); $('input', t).checked = on;
      const ok = avail(mainKey(), k, v, sel); t.classList.toggle('is-off', !ok); $('input', t).disabled = !ok;
    });
    // pack tiles prices (QiTrax)
    $$('[data-pp]').forEach(el => { const v = findV('qitrax', { pack: el.dataset.pp }); if (!v) return; el.innerHTML = (v.cmp ? `<s>${money(v.cmp)}</s>` : '') + money(v.price); });
    $$('[data-pb]').forEach(el => { const v = findV('qitrax', { pack: el.dataset.pb }); el.textContent = v && v.cmp ? money(v.cmp - v.price) + ' de descuento' : ''; });
    // plans
    $$('.pd-plan').forEach(p => { const on = p.dataset.plan === plan; p.classList.toggle('is-on', on); $('input', p).checked = on; });
    if (C.sub) {
      const once = findV('qitrax', sel); const op = $('[data-plprice="once"]'); if (op && once) op.textContent = money(once.price);
      const sp = $('[data-plprice="sub"]'); if (sp) sp.textContent = subPrice() ? money(subPrice()) : 'Solo packs 2, 4 y 6';
    }
    // add-ons
    $$('.pd-acard').forEach(c => {
      const id = c.dataset.addon, on = !!addOn[id]; c.classList.toggle('is-on', on); $('.pd-acard__h', c).setAttribute('aria-checked', on);
      const a = C.addons[id];
      $$('.pd-acard__opts', c).forEach(row => { const k = row.dataset.aopt; $$('.pd-ch', row).forEach(ch => { ch.classList.toggle('is-on', addSel[id][k] === ch.dataset.v); ch.classList.toggle('is-off', !avail(a.key, k, ch.dataset.v, addSel[id])); }); });
    });
    renderSummary();
  };
  const pick = (k, v) => {
    sel[k] = v;
    if (k === 'color' && sel.talla && !avail(mainKey(), 'talla', sel.talla, sel)) delete sel.talla;
    // first slide follows the chosen colour / pack (Eight keeps the lead image; QiHealth packshots differ per variant)
    const f = (C.firstByColor && C.firstByColor[sel.color]) || (C.firstByPack && C.firstByPack[sel.pack]);
    if (f && (k === 'color' || k === 'pack')) {
      const [name, pos, zoom] = Array.isArray(f) ? f : [f, '50% 50%', 1];
      const im = $('.pd-slide[data-first] img'), th = $('.pd-thumb img');
      if (im) { im.src = imgBase + name + '@800.webp'; im.srcset = `${imgBase}${name}@800.webp 800w, ${imgBase}${name}.webp 1600w`; im.style.objectPosition = pos; im.style.transform = zoom > 1 ? `scale(${zoom})` : ''; im.style.transformOrigin = pos; }
      if (th) { th.src = imgBase + name + '@800.webp'; th.style.objectPosition = pos; th.style.transform = zoom > 1 ? `scale(${zoom})` : ''; th.style.transformOrigin = pos; }
      if (gi !== 0) goSlide(0);
    }
    render();
  };
  $$('[data-opt]').forEach(t => t.addEventListener('click', ev => { ev.preventDefault(); if (t.classList.contains('is-off')) return; pick(t.dataset.opt, t.dataset.val); }));
  $$('.pd-plan').forEach(p => p.addEventListener('click', ev => { ev.preventDefault(); plan = p.dataset.plan; render(); }));
  $$('.pd-acard').forEach(c => {
    const id = c.dataset.addon, h = $('.pd-acard__h', c);
    const tog = () => { const a = C.addons[id]; if (!addOn[id] && a.need && !addSel[id][a.need]) { const row = $(`[data-aopt="${a.need}"]`, c); row && row.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 300 }); return; } addOn[id] = !addOn[id]; render(); };
    h.addEventListener('click', tog); h.addEventListener('keydown', ev => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); tog(); } });
    $$('.pd-ch', c).forEach(ch => ch.addEventListener('click', () => { const k = ch.parentElement.dataset.aopt; addSel[id][k] = ch.dataset.v; if (k === 'color' && addSel[id].talla && !avail(C.addons[id].key, 'talla', addSel[id].talla, addSel[id])) delete addSel[id].talla; const a = C.addons[id]; if (a.need && addSel[id][a.need]) addOn[id] = true; render(); }));
  });

  /* ---------- buy ---------- */
  const flash = (el) => { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); el.animate([{ outline: '2px solid #2B51F0', outlineOffset: '4px' }, { outline: '2px solid transparent', outlineOffset: '4px' }], { duration: 1400 }); };
  const buyNow = () => {
    if (isSub()) { if (subPrice()) window.open(C.sub.url, '_blank', 'noopener'); return; }
    const nm = missing(); if (nm) { closeMod(); flash($('#opt-' + nm)); return; }
    if (!window.QiCart) return;
    const ls = lines(); ls.forEach(l => window.QiCart.add(l.v.id, 1, { silent: true }));
    closeMod(); if (ls.length) window.QiCart.added(ls[0].v.id);
  };
  document.addEventListener('click', ev => { const b = ev.target.closest('[data-pay]'); if (b) { ev.preventDefault(); buyNow(); } });

  /* ---------- tabs (sliding 2px bar, .25s cubic-bezier(0,0,.2,1)) + order-summary modal (Eight's "Financiamiento" modal) ---------- */
  const tabs = $('.pd-tabs'), sumM = $('#sumModal');
  let lastFocus = null;
  const openMod = (m) => { lastFocus = document.activeElement; m.classList.add('is-on'); m.setAttribute('aria-hidden', 'false'); root.style.overflow = 'hidden'; setTimeout(() => { const f = $('[data-close]', m); f && f.focus({ preventScroll: true }); }, 50); };
  const closeMod = () => { $$('.pd-mod.is-on').forEach(m => { m.classList.remove('is-on'); m.setAttribute('aria-hidden', 'true'); const v = $('video', m); v && v.pause(); }); root.style.overflow = ''; tabs.dataset.on = '0'; $$('.pd-tab', tabs).forEach((t, i) => t.setAttribute('aria-selected', i === 0)); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); };
  const setSumTab = (i) => { const row = $('.pd-sum__tabs'); row.dataset.on = i; $('.pd-tabs__bar', row).style.transform = i ? 'translateX(100%)' : ''; $('.pd-sum__pay').hidden = !i; };
  $$('.pd-tab', tabs).forEach(t => t.addEventListener('click', () => { const i = +t.dataset.tab; tabs.dataset.on = i; $$('.pd-tab', tabs).forEach((x, k) => x.setAttribute('aria-selected', k === i)); if (i === 1) { setSumTab(1); setTimeout(() => openMod(sumM), 180); } }));
  $$('[data-stab]').forEach(t => t.addEventListener('click', () => setSumTab(+t.dataset.stab)));
  $$('[data-summary]').forEach(b => b.addEventListener('click', () => { setSumTab(0); openMod(sumM); }));
  function renderSummary() {
    const L = lines(), rows = $('#sumRows'); if (!rows) return;
    rows.innerHTML = L.map(l => `<li><b>${l.name}${l.label ? ` (${l.label})` : ''}</b><span>${l.v.cmp ? `<s>${money(l.v.cmp)}</s>` : ''}${money(isSub() && l === L[0] && subPrice() ? subPrice() : l.v.price)}</span></li>`).join('') || `<li><b>${C.short}</b><span>Elige tus opciones</span></li>`;
    $('#sumTot').textContent = $('[data-total]').textContent;
  }
  $$('.pd-mod').forEach(m => { m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-close]')) closeMod(); }); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && $('.pd-mod.is-on')) closeMod(); });

  /* ---------- sale reminder / explore accessory shortcuts ---------- */
  document.addEventListener('click', ev => {
    const s = ev.target.closest('[data-sale]'); if (!s) return; ev.preventDefault();
    if (s.dataset.sale === 'kit') { plan = 'kit'; render(); flash($('#planes')); }
    if (s.dataset.sale === 'pack6') { pick('pack', 'Pack 6 sensores'); flash($('#opt-pack')); }
  });

  /* ---------- lightbox (explore hotspots + "Recorre la app"): Eight's step modal 1/N with arrows ---------- */
  const lb = $('#lbModal'); let steps = [], si = 0;
  const showStep = () => {
    const s = steps[si];
    $('#lbMedia').innerHTML = `<img src="${s.img}" alt="${s.t}">`; $('#lbT').textContent = s.t; $('#lbD').textContent = s.d; $('#lbN').textContent = `${si + 1}/${steps.length}`;
    $('[data-lb="-1"]', lb).disabled = si === 0; $('[data-lb="1"]', lb).disabled = si === steps.length - 1;
  };
  const openLb = (arr) => { steps = arr; si = 0; showStep(); openMod(lb); };
  $$('[data-lb]', lb).forEach(b => b.addEventListener('click', () => { si = Math.max(0, Math.min(steps.length - 1, si + (+b.dataset.lb))); showStep(); }));
  $$('.pd-hs').forEach(h => h.addEventListener('click', () => openLb(JSON.parse(h.dataset.lb))));
  /* how section: QiTrax opens the official video; Band/Ring open the app walkthrough */
  const vm = $('#vidModal');
  const howBtn = $('[data-how]');
  howBtn && howBtn.addEventListener('click', () => {
    if (C.video) { $('#vidBox').innerHTML = `<video src="${C.video}" controls autoplay muted playsinline></video>`; openMod(vm); }
    else if (C.how) openLb(C.how);
  });
  /* guides ("Consulta la guía de tamaños") */
  const gm = $('#guideModal');
  $$('[data-guide]').forEach(b => b.addEventListener('click', () => { $$('[data-gd]', gm).forEach(d => d.hidden = d.dataset.gd !== b.dataset.guide); openMod(gm); }));

  /* ---------- explore: state toggle (image crossfade .6s), hotspot sets, text reveal (Eight: bg static at -49px, no parallax) ---------- */
  const exp = $('.pd-exp');
  if (exp) {
    const bgs = $$('.pd-exp__bg img', exp), segs = $$('.pd-seg button', exp), hss = $$('.pd-hs', exp);
    segs.forEach(b => b.addEventListener('click', () => { const i = b.dataset.st; segs.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); }); bgs.forEach(im => im.classList.toggle('is-on', im.dataset.st === i)); hss.forEach(h => h.hidden = h.dataset.st !== i); }));
    new IntersectionObserver((en, o) => en.forEach(x => { if (x.isIntersecting) { exp.classList.add('in'); o.disconnect(); } }), { threshold: .25 }).observe(exp);
  }

  /* ---------- horizontal scrollers with arrow buttons (mobile install / features) ---------- */
  $$('[data-hscroll]').forEach(t => {
    const nav = t.nextElementSibling; if (!nav) return; const [p, n] = $$('[data-hs]', nav);
    const step = () => (t.firstElementChild ? t.firstElementChild.getBoundingClientRect().width + 16 : 300);
    const mark = () => { p.disabled = t.scrollLeft < 4; n.disabled = t.scrollLeft > t.scrollWidth - t.clientWidth - 4; };
    p.addEventListener('click', () => t.scrollBy({ left: -step(), behavior: 'smooth' })); n.addEventListener('click', () => t.scrollBy({ left: step(), behavior: 'smooth' }));
    t.addEventListener('scroll', mark, { passive: true }); mark();
  });

  /* ---------- mobile features: one carousel across groups; heading follows the visible card (Eight max-lg) ---------- */
  const fl = $('.pd-feat__list'), gh = $('.pd-feat__gh');
  if (fl && gh) {
    const items = $$('.pd-fi', fl); let cur = '';
    const upd = () => { if (mqDesk.matches) return; const x = fl.getBoundingClientRect().left + 20; const it = items.find(i => i.getBoundingClientRect().right > x + 40) || items[0]; const g = it.dataset.g; if (g === cur) return; cur = g; const [h, t] = g.split('|'); gh.innerHTML = h + (t ? `<span>${t}</span>` : ''); };
    fl.addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- specs accordions (mobile) + FAQ (grid-rows .35s) ---------- */
  $$('.pd-spc>button').forEach(b => b.addEventListener('click', () => { if (mqDesk.matches) return; const c = b.parentElement, o = !c.classList.contains('is-open'); c.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); }));
  $$('.pd-fq button').forEach(b => b.addEventListener('click', () => { const c = b.closest('.pd-fq'), o = !c.classList.contains('is-open'); c.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); }));

  /* ---------- videos: play only in view ---------- */
  const vio = new IntersectionObserver(en => en.forEach(x => { const v = x.target; if (x.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; if (!v.closest('.pd-slide') || v.closest('.pd-slide').dataset.i == gi) v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
  $$('video[data-src]').forEach(v => { if (!v.closest('.pd-slide')) vio.observe(v); });

  /* ---------- reviews (QiTrax, real qihealth.ai reviews): filters, star filter, sort, 6 per page, "Leer más" ---------- */
  const rd = $('#revData');
  if (rd) {
    const all = JSON.parse(rd.textContent); let f = 'all', star = 0, sort = 'new', page = 0; const PER = 6;
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fd = (d) => { const [y, m, dd] = d.split('-'); return `${+dd} de ${meses[+m - 1]} de ${y}`; };
    const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const st = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.3l1.98 4.15 4.55.55-3.35 3.13.86 4.5L8 11.42 3.96 13.63l.86-4.5L1.47 6l4.55-.55z" fill="currentColor"/></svg>';
    const draw = () => {
      let L = all.filter(r => (f === 'all' || r.t.includes(f)) && (!star || r.s === star));
      L = L.slice().sort(sort === 'new' ? (a, b) => b.d.localeCompare(a.d) : (a, b) => b.b.length - a.b.length);
      const pages = Math.max(1, Math.ceil(L.length / PER)); page = Math.min(page, pages - 1);
      $('#revList').innerHTML = L.slice(page * PER, page * PER + PER).map(r => `<article class="pd-rc"><div class="pd-rc__top"><span class="pd-rc__st" aria-label="${r.s} de 5 estrellas">${st.repeat(r.s)}</span><span class="pd-rc__src">qihealth.ai</span></div><p class="pd-rc__who"><b>${esc(r.a)}</b>${fd(r.d)}</p><p>${esc(r.b).replace(/\n+/g, ' ')}</p>${r.b.length > 230 ? '<button class="pd-rc__more" type="button">Leer más</button>' : ''}</article>`).join('') || '<p class="pd-sub">No hay reseñas con este filtro.</p>';
      const pg = $('#revPg'), arr = (d, dis) => `<button type="button" data-pg="${d}" aria-label="${d < 0 ? 'Anterior' : 'Siguiente'}"${dis ? ' disabled' : ''}>${d < 0 ? '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'}</button>`;
      pg.innerHTML = arr(-1, page === 0) + [...Array(pages)].map((_, i) => `<button type="button" data-p="${i}"${i === page ? ' class="is-on"' : ''}>${i + 1}</button>`).join('') + arr(1, page >= pages - 1);
    };
    $$('[data-rf]').forEach(b => b.addEventListener('click', () => { f = b.dataset.rf; page = 0; $$('[data-rf]').forEach(x => x.classList.toggle('is-on', x === b)); draw(); }));
    $$('[data-rs]').forEach(b => b.addEventListener('click', () => { star = star === +b.dataset.rs ? 0 : +b.dataset.rs; page = 0; draw(); }));
    $('[data-rsort]').addEventListener('change', ev => { sort = ev.target.value; draw(); });
    $('#revPg').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b || b.disabled) return; page = b.dataset.p != null ? +b.dataset.p : page + (+b.dataset.pg); draw(); });
    $('#revList').addEventListener('click', ev => { const b = ev.target.closest('.pd-rc__more'); if (!b) return; const c = b.closest('.pd-rc'); c.classList.toggle('is-open'); b.textContent = c.classList.contains('is-open') ? 'Leer menos' : 'Leer más'; });
    draw();
  }

  render();
  window.addEventListener('pageshow', onScroll);
})();
