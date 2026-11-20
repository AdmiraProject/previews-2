(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const state = { unit: 'Mond', mode: 'Zoom' };

  $$('.ph > img').forEach(img => {
    const on = () => img.classList.add('is-in');
    if (img.complete && img.naturalWidth) on(); else { img.addEventListener('load', on, { once: true }); img.addEventListener('error', on, { once: true }); }
  });

  /* ---------- header scroll state: widget hides + "Agenda tu visita" appears past hero ---------- */
  const hero = $('.hero');
  const onScroll = () => body.classList.toggle('scrolled', scrollY > hero.offsetHeight * 0.6);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- videos: lazy src, play only on-screen, toggle ---------- */
  const vids = $$('.js-v');
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); }
      if (!v.dataset.userPaused && !RM) v.play().catch(() => {});
    } else v.pause();
  }), { threshold: 0.15 });
  vids.forEach(v => { if (RM) { v.removeAttribute('autoplay'); v.pause(); } vio.observe(v); });
  $$('.js-vtoggle').forEach(b => {
    const v = b.parentElement.querySelector('video');
    const sync = () => { const p = v.paused; b.setAttribute('aria-pressed', p); b.setAttribute('aria-label', p ? 'Reproducir video' : 'Pausar video'); };
    if (RM) sync();
    b.addEventListener('click', () => { if (v.paused) { delete v.dataset.userPaused; if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); } else { v.dataset.userPaused = 1; v.pause(); } setTimeout(sync, 30); });
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
  });

  /* ---------- focus trap helper ---------- */
  const focusables = el => $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', el).filter(n => n.offsetParent !== null || n === document.activeElement);
  const trap = (el, e) => {
    if (e.key !== 'Tab') return;
    const f = focusables(el); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- MENU OVERLAY (opacity 1s; items opacity .5s / translate 50px .75s, staggered) ---------- */
  const menu = $('#menu'), burger = $('.js-menu');
  let menuRet = null;
  const items = [...$$('.menu__primary a'), $('.menu__util')];
  items.forEach((a, i) => { a.style.transitionDelay = `${RM ? 0 : 0.15 + i * 0.075}s`; });
  const openMenu = () => {
    menuRet = document.activeElement; menu.hidden = false; body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('-animate')));
    setTimeout(() => $('.menu__x').focus(), 50);
  };
  const closeMenu = (ret = true) => {
    menu.classList.remove('-animate'); body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!menu.classList.contains('-animate')) menu.hidden = true; }, RM ? 0 : 600);
    if (ret && menuRet) menuRet.focus();
  };
  burger.addEventListener('click', openMenu);
  $('.js-menu-close').addEventListener('click', () => closeMenu());
  menu.addEventListener('keydown', e => { trap(menu, e); if (e.key === 'Escape') closeMenu(); });
  $$('#menu a').forEach(a => a.addEventListener('click', () => closeMenu(false)));

  const bar = $('#bar');
  let barRet = null;
  const syncChoice = () => {
    $$('.chip[data-unit]').forEach(c => c.setAttribute('aria-checked', c.dataset.unit === state.unit));
    $$('.chip[data-mode]').forEach(c => c.setAttribute('aria-checked', c.dataset.mode === state.mode));
    $('[data-bw=unit]').textContent = state.unit; $('[data-bw=mode]').textContent = state.mode;
  };
  const openBar = (focus) => {
    barRet = document.activeElement; bar.hidden = false; body.classList.add('bar-open'); syncChoice();
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('is-open')));
    setTimeout(() => (focus === 'mode' ? $('.chip[aria-checked=true][data-mode]') : $('.chip[aria-checked=true][data-unit]'))?.focus(), 60);
  };
  const closeBar = (ret = true) => {
    bar.classList.remove('is-open'); body.classList.remove('bar-open');
    setTimeout(() => { if (!bar.classList.contains('is-open')) bar.hidden = true; }, RM ? 0 : 1500);
    if (ret && barRet) barRet.focus();
  };
  $$('.js-bar').forEach(b => b.addEventListener('click', () => openBar(b.dataset.focus)));
  $('.js-bar-close').addEventListener('click', () => closeBar());
  bar.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeBar();
    if (/Arrow(Left|Right)/.test(e.key) && e.target.matches('.chip')) {
      const g = $$('.chip', e.target.parentElement), i = g.indexOf(e.target), n = g[(i + (e.key === 'ArrowRight' ? 1 : g.length - 1)) % g.length];
      n.focus(); n.click(); e.preventDefault();
    }
  });
  $$('.chip').forEach(c => c.addEventListener('click', () => { if (c.dataset.unit) state.unit = c.dataset.unit; if (c.dataset.mode) state.mode = c.dataset.mode; syncChoice(); }));
  $('.js-bar-go').addEventListener('click', () => { closeBar(false); openModal({ unit: state.unit, mode: state.mode }); });
  syncChoice();

  /* ---------- MODAL ---------- */
  const modal = $('#modal'), form = $('#mform'), done = $('.mdone');
  let modalRet = null;
  function openModal(pre = {}) {
    modalRet = document.activeElement;
    if (bar.classList.contains('is-open')) closeBar(false);
    if (menu.classList.contains('-animate')) closeMenu(false);
    form.hidden = false; done.hidden = true; form.reset(); $$('.fld', form).forEach(f => f.classList.remove('bad'));
    if (pre.tel) form.tel.value = pre.tel;
    if (pre.unit) form.unidad.value = pre.unit;
    if (pre.mode) $$('input[name=cita]', form).forEach(r => r.checked = r.value === pre.mode);
    modal.hidden = false; body.classList.add('modal-open');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    setTimeout(() => form.tel.focus({ preventScroll: true }), 80);
  }
  const closeModal = () => {
    modal.classList.remove('is-open'); body.classList.remove('modal-open');
    setTimeout(() => { if (!modal.classList.contains('is-open')) modal.hidden = true; }, RM ? 0 : 500);
    if (modalRet && document.contains(modalRet)) modalRet.focus({ preventScroll: true });
  };
  window.openModal = openModal;
  document.addEventListener('click', e => {
    const b = e.target.closest('.js-open-modal'); if (!b) return;
    e.preventDefault(); openModal({ mode: b.dataset.mode });
  });
  $$('.js-modal-close').forEach(b => b.addEventListener('click', closeModal));
  modal.addEventListener('keydown', e => { trap($('.modal__panel'), e); if (e.key === 'Escape') closeModal(); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const tests = { tel: v => v.replace(/\D/g, '').length >= 8, email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), nombre: v => v.trim().length >= 2 };
    let firstBad = null;
    Object.entries(tests).forEach(([n, t]) => { const ok = t(form[n].value); form[n].closest('.fld').classList.toggle('bad', !ok); form[n].setAttribute('aria-invalid', !ok); if (!ok && !firstBad) firstBad = form[n]; });
    if (firstBad) { firstBad.focus(); return; }
    const mode = form.cita.value, unit = form.unidad.value;
    $('[data-done=name]').textContent = form.nombre.value.trim().split(' ')[0];
    $('[data-done=mode]').textContent = mode === 'Zoom' ? 'por Zoom' : 'presencial';
    $('[data-done=unit]').textContent = unit ? ` para conocer ${unit}` : '';
    form.hidden = true; done.hidden = false; done.focus();
  });
  $('.js-quick').addEventListener('submit', e => { e.preventDefault(); openModal({ tel: e.target.tel.value }); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && bar.classList.contains('is-open') && modal.hidden) closeBar(); });

  /* ---------- CAMPAIGN SLIDER (fade, autoplay 6s, dots) ---------- */
  const slides = $$('.camp__slide'), dots = $$('.camp .dot');
  let ci = 0, ct;
  const go = i => {
    ci = (i + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle('is-active', k === ci); s.inert = k !== ci; });
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === ci); d.setAttribute('aria-selected', k === ci); });
  };
  const auto = () => { clearInterval(ct); if (!RM) ct = setInterval(() => go(ci + 1), 6000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
  $('.camp').addEventListener('mouseenter', () => clearInterval(ct)); $('.camp').addEventListener('mouseleave', auto);
  $('.camp').addEventListener('focusin', () => clearInterval(ct));
  go(0); auto();

  /* ---------- UNIT EXPLORER ---------- */
  const U = {
    Sonne: { i: '01', hab: '1', m2: 75, price: 'US$168,000', plan: '../assets/plans/sonne.webp', w: 1000, h: 897,
      lead: 'Una habitación con sala, comedor y cocina integrados: el formato ideal para empezar o para invertir cerca de todo.',
      imgs: [['1h-sala', 'Sala'], ['1h-cocina', 'Cocina'], ['1h-hab', 'Habitación']],
      spots: [[23, 47, 'Sala'], [43, 28, 'Cocina'], [59, 73, 'Habitación']] },
    Mond: { i: '02', hab: '2', m2: 119, price: 'US$246,000', plan: '../assets/plans/mond.webp', w: 1000, h: 820,
      lead: 'Dos habitaciones y 119 m² para crecer: espacios sociales abiertos y áreas privadas bien separadas.',
      imgs: [['2h-hab', 'Habitación'], ['2h-cocina', 'Cocina'], ['2h-sala', 'Sala']],
      spots: [[20, 44, 'Sala'], [38, 22, 'Cocina'], [40, 57, 'Habitación'], [62, 76, 'Habitación principal']] },
    Aura: { i: '03', hab: '2 + balcón', m2: 119, price: 'US$273,000', plan: '../assets/plans/erker.webp', w: 1000, h: 873,
      lead: 'Dos habitaciones con balcón: la misma amplitud de Mond, con un espacio al aire libre para tu café de la mañana.',
      imgs: [['2hb-sala', 'Sala'], ['2hb-cocina', 'Cocina'], ['2hb-hab', 'Habitación'], ['2hb-hab2', 'Habitación']],
      spots: [[22, 39, 'Sala'], [38, 24, 'Cocina'], [60, 69, 'Habitación'], [10, 58, 'Balcón']] },
    Stern: { i: '04', hab: '3', m2: 156, price: 'US$398,000', plan: 'img/stern-plan.jpg', w: 1080, h: 830, stern: true,
      lead: 'Tres habitaciones y 156 m²: la unidad más amplia de la torre, pensada para familias que quieren espacio de sobra.',
      imgs: [['3h-hab', 'Habitación'], ['3h-cocina', 'Cocina'], ['3h-sala', 'Sala']],
      spots: [[31, 69, 'Sala'], [31, 34, 'Cocina'], [56, 54, 'Habitación'], [82, 39, 'Habitación principal']] },
  };
  const order = Object.keys(U);
  const tabs = $$('.tab'), ink = $('.tabs__ink'), plan = $('#plan'), pimg = $('.plan__img'), spots = $('.plan__spots'), unitEl = $('#unit-panel');
  const stage = $('[data-u=stage]'), thumbs = $('[data-u=thumbs]');
  let cur = null, gi = 0, gt;
  const showImg = k => {
    gi = k;
    $$('img', stage).forEach((im, n) => im.classList.toggle('is-on', n === k));
    $$('button', thumbs).forEach((b, n) => b.setAttribute('aria-pressed', n === k));
    const cap = $('.gal__cap', stage); if (cap) cap.textContent = U[cur].imgs[k][1];
  };
  const galAuto = () => { clearInterval(gt); if (!RM) gt = setInterval(() => showImg((gi + 1) % U[cur].imgs.length), 4200); };
  const setUnit = (name, animate = true) => {
    if (name === cur) return;
    const d = U[name]; const first = cur === null; cur = name; state.unit = name; syncChoice();
    const idx = order.indexOf(name);
    tabs.forEach((t, k) => { const on = k === idx; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    ink.style.transform = `translateX(${idx * 100}%)`;
    unitEl.setAttribute('aria-labelledby', 'tab-' + name);
    const apply = () => {
      $('[data-u=idx]').textContent = d.i; $('[data-u=name]').textContent = name; $('[data-u=lead]').textContent = d.lead;
      $('[data-u=hab]').textContent = d.hab; $('[data-u=m2]').textContent = d.m2; $('[data-u=price]').textContent = d.price;
      stage.innerHTML = d.imgs.map(([f, c]) => `<img src="../assets/units/${f}.jpg" alt="${c} — unidad ${name} (render)" loading="lazy">`).join('') + '<span class="gal__cap"></span>';
      thumbs.innerHTML = d.imgs.map(([f, c], n) => `<button aria-pressed="false" aria-label="Ver ${c.toLowerCase()} ${n + 1}"><img src="../assets/units/${f}.jpg" alt="" loading="lazy"></button>`).join('');
      $$('button', thumbs).forEach((b, n) => b.addEventListener('click', () => { showImg(n); galAuto(); }));
      requestAnimationFrame(() => showImg(0)); galAuto();
      // plan
      plan.classList.toggle('is-stern', !!d.stern);
      pimg.src = d.plan; pimg.width = d.w; pimg.height = d.h; pimg.alt = `Planta 3D de la unidad ${name}`;
      spots.innerHTML = d.spots.map(([x, y, l], n) => `<button class="spot" style="left:${x}%;top:${y}%;animation-delay:${RM ? 0 : 0.7 + n * 0.12}s" aria-label="${l}"><span class="spot__l">${l}</span></button>`).join('');
      plan.classList.remove('leave'); plan.classList.remove('enter'); void plan.offsetWidth;
      if (!RM) plan.classList.add('enter');
      unitEl.classList.remove('swap');
    };
    if (first || !animate || RM) apply();
    else { plan.classList.add('leave'); unitEl.classList.add('swap'); setTimeout(apply, 360); }
  };
  // plan spots positioned on the contained image box: wrap aspect to image ratio
  const fitSpots = () => {
    const d = U[cur]; if (!d) return;
    const box = plan.getBoundingClientRect(); const pad = d.stern ? 0.025 : 0;
    const bw = box.width * (1 - 2 * pad), bh = box.height * (1 - 2 * pad);
    const s = Math.min(bw / d.w, bh / d.h), w = d.w * s, h = d.h * s;
    Object.assign(spots.style, { left: (box.width - w) / 2 + 'px', top: (box.height - h) / 2 + 'px', width: w + 'px', height: h + 'px', right: 'auto', bottom: 'auto' });
  };
  new ResizeObserver(fitSpots).observe(plan);
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => { setUnit(t.dataset.unit); fitSpots(); });
    t.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight') n = (k + 1) % tabs.length; else if (e.key === 'ArrowLeft') n = (k + tabs.length - 1) % tabs.length;
      else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); tabs[n].focus(); setUnit(tabs[n].dataset.unit); fitSpots(); }
    });
  });
  setUnit('Mond', false); fitSpots();
  // replay entrance when section scrolls into view the first time
  let seen = false;
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !seen && !RM) { seen = true; plan.classList.remove('enter'); spots.innerHTML = spots.innerHTML; void plan.offsetWidth; plan.classList.add('enter'); } }), { threshold: 0.35 }).observe(plan);
  $('.js-unit-cta').addEventListener('click', () => openModal({ unit: cur }));
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => { setUnit(a.dataset.pick); fitSpots(); }));

  /* ---------- reveals: steps / location list / counters ---------- */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  $$('.step').forEach(s => rio.observe(s));
  const loc = $('.loc'); $$('.times li').forEach((li, i) => li.style.transitionDelay = `${RM ? 0 : i * 0.06}s`); rio.observe($('.loc__list') ? loc : loc);
  const segs = $$('.step .seg__o'); if (segs.length && !RM) setInterval(() => segs.forEach(s => s.classList.toggle('is-on')), 2600);
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const b = e.target, to = +b.dataset.count; if (RM) return;
    const t0 = performance.now(), D = 1600;
    const tick = t => { const p = Math.min(1, (t - t0) / D), v = 1 - Math.pow(1 - p, 4); b.textContent = Math.round(to * v); if (p < 1) requestAnimationFrame(tick); };
    b.textContent = '0'; requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(b => cio.observe(b));

  const cards = $$('.vc'); let vi = 0;
  const layout = () => {
    const mob = innerWidth < 700, N = cards.length;
    const step = mob ? 200 : 290, side = mob ? 0.8 : 250 / 320;
    cards.forEach((c, k) => {
      let o = k - vi; if (o > N / 2) o -= N; if (o < -N / 2) o += N;
      const a = Math.abs(o);
      c.style.transform = `translateX(${o * step}px) scale(${o === 0 ? 1 : side})`;
      c.style.opacity = a === 0 ? 1 : (mob ? (a > 1 ? 0 : .4) : (a > 2 ? 0 : 1));
      c.style.zIndex = 10 - a;
      c.classList.toggle('is-active', o === 0);
      c.setAttribute('aria-hidden', o !== 0); c.inert = o !== 0;
    });
  };
  const vgo = i => { vi = (i + cards.length) % cards.length; layout(); };
  $('.cf__nav--prev').addEventListener('click', () => vgo(vi - 1));
  $('.cf__nav--next').addEventListener('click', () => vgo(vi + 1));
  cards.forEach((c, k) => c.addEventListener('click', e => { if (k !== vi) { e.preventDefault(); vgo(k); } }));
  let tx = null; const cf = $('.cf');
  cf.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  cf.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) vgo(vi + (dx < 0 ? 1 : -1)); tx = null; });
  cf.addEventListener('keydown', e => { if (e.key === 'ArrowRight') vgo(vi + 1); if (e.key === 'ArrowLeft') vgo(vi - 1); });
  addEventListener('resize', layout); layout();

  /* ---------- gallery marquee: duplicate track for seamless loop ---------- */
  const tr = $('.social__track'); if (!RM) tr.innerHTML += tr.innerHTML.replace(/<li>/g, '<li aria-hidden="true">');
})();
