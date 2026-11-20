/* HRG Seguros v2 — interactions (Root homepage behaviours, HRG content) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav: hides on scroll down, returns on scroll up (Root .nav-hideNav, 500ms) ---------- */
  const nav = $('#nav'), cta = $('#fixedCta'), hero = $('.hero'), burger = $('#burger');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY, heroEnd = hero.offsetTop + hero.offsetHeight - 60;
    if (!nav.classList.contains('open')) {
      if (y > lastY && y > 60) nav.classList.add('hide');
      else if (y < lastY - 2 || y <= 60) nav.classList.remove('hide');
    }
    // fixed CTA tab drops in once the nav is gone and the hero CTA is out of view
    cta.classList.toggle('show', nav.classList.contains('hide') && y > heroEnd);
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- mobile menu ---------- */
  const setMenu = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('lock', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('#mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- image fade-in on load + in view (Root: opacity 500ms linear) ---------- */
  const fades = $$('.fade');
  const show = el => {
    const img = el.tagName === 'IMG' ? el : null;
    if (img && !img.complete) img.addEventListener('load', () => el.classList.add('in'), { once: true });
    else el.classList.add('in');
  };
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px 0px' });
    fades.forEach(f => io.observe(f));
  } else fades.forEach(show);

  /* ---------- modals ---------- */
  let lastFocus = null;
  const openModal = m => {
    lastFocus = document.activeElement;
    m.hidden = false; document.body.classList.add('lock');
    const f = m.querySelector('input, button:not([data-close]), video, [data-close]');
    setTimeout(() => f && f.focus({ preventScroll: true }), 30);
  };
  const closeModal = m => {
    m.hidden = true; document.body.classList.remove('lock');
    if (m.id === 'vmodal') { vp.pause(); vp.removeAttribute('src'); vp.load(); }
    lastFocus && lastFocus.focus({ preventScroll: true });
  };
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(m); });
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = $$('.modal').find(x => !x.hidden);
      if (m) closeModal(m); else if (nav.classList.contains('open')) setMenu(false);
    }
    if (e.key === 'Tab') { // focus trap
      const m = $$('.modal').find(x => !x.hidden); if (!m) return;
      const f = $$('a[href], button, input, select, video[controls]', m).filter(x => !x.closest('[hidden]') && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- testimonial video modal ---------- */
  const VIDEOS = [
    { src: '../assets/video/t-alejandra.mp4', vtt: '../assets/video/t-alejandra.vtt', poster: '../assets/video/t-alejandra.jpg', name: 'Clienta de HRG Seguros', role: 'Testimonio en video' },
    // Dr. Ángel: edited cut (assets/v2/t-angel-v2.mp4 = original 0:10.4–0:19.4 + 0:32.4–end) — omits his product name and the investment-recovery Q&A (brand rules)
    { src: '../assets/v2/t-angel-v2.mp4', vtt: '../assets/v2/t-angel-v2.vtt', poster: '../assets/video/t-angel.jpg', name: 'Dr. Ángel Ramos', role: 'Cliente de HRG Seguros' },
    { src: '../assets/video/t-0512.mp4', vtt: '../assets/video/t-0512.vtt', poster: '../assets/video/t-0512.jpg', name: 'Cliente de HRG Seguros', role: 'Testimonio en video' }
  ];
  const vm = $('#vmodal'), vp = $('#vplayer');
  let segs = null;
  vp.addEventListener('timeupdate', () => {
    if (!segs) return;
    const t = vp.currentTime;
    const i = segs.findIndex(([a, b]) => t >= a - 0.05 && t < b);
    if (i === -1) { const nx = segs.find(([a]) => a > t); if (nx) vp.currentTime = nx[0]; else vp.pause(); }
  });
  vp.addEventListener('loadedmetadata', () => { if (segs && vp.currentTime < segs[0][0]) vp.currentTime = segs[0][0]; });
  const playVideo = i => {
    const v = VIDEOS[i]; segs = v.segs || null;
    $('#vtrack').src = v.vtt; vp.poster = v.poster; vp.src = v.src + (segs ? '#t=' + segs[0][0] : ''); vp.muted = false;
    $('#vname').textContent = v.name; $('#vrole').textContent = v.role;
    openModal(vm);
    if (vp.textTracks[0]) vp.textTracks[0].mode = 'showing';
    const p = vp.play(); if (p && p.catch) p.catch(() => {});
  };
  $$('[data-video]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); playVideo(+b.dataset.video); }));

  /* ---------- quote modal (cotizador, no backend) ---------- */
  const qm = $('#qmodal'), qf = $('#qform');
  $$('[data-quote]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); resetQuote(); openModal(qm); }));
  if (location.hash === '#cotizar') setTimeout(() => { resetQuote(); openModal(qm); }, 300);
  // Reference points ONLY from BRIEF (Notion LP, Nov 2026). Annual premiums, MXN.
  // mujer 18–20 no fuma $1M = $2,935.57; mujer 30 no fuma: $1M $3,630.24 (=3,748.71−118.47), $2M $5,955, $3M $8,481; gastos funerarios +$118.47 (mujer 30).
  const REF = { '18-20|1': 2935.57, '30|1': 3630.24, '30|2': 5955, '30|3': 8481 };
  const GF30 = 118.47;
  const money = (n, d = 2) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
  const val = n => (qf.querySelector(`input[name=${n}]:checked`) || {}).value;
  const price = () => {
    const age = parseInt($('#qAge').value, 10), sex = val('sex'), smk = val('smk'), sum = val('sum'), gf = $('#qGf').checked;
    const out = $('#qPrice');
    if (!(age >= 18 && age <= 70)) { out.innerHTML = '<p class="noref">Cotizas en línea de 18 a 70 años. Escribe tu edad para ver tu precio.</p>'; return; }
    let key = null;
    if (sex === 'F' && smk === '0') { if (age >= 18 && age <= 20 && sum === '1') key = '18-20|1'; if (age === 30) key = '30|' + sum; }
    if (key && gf && age !== 30) key = null; // gastos funerarios reference only exists for mujer 30
    if (!key) {
      out.innerHTML = '<p class="noref">Para tu perfil calculamos el precio exacto con la aseguradora y te lo enviamos por WhatsApp en tu cotización oficial. El seguro de vida a 10 años está disponible desde $8.04 al día.</p>';
      return;
    }
    const yr = REF[key] + (gf ? GF30 : 0), day = yr / 365;
    out.innerHTML = `<div class="pr-top"><div><small>Precio diario de referencia</small><div class="pd">${money(day)}<em>/ día</em></div></div><div class="pa"><small>Pago anual</small>${money(yr)} / año</div></div><p>Precio de referencia, sujeto a evaluación y aceptación de la aseguradora. Tu cotización oficial llega por WhatsApp.</p>`;
  };
  const resetQuote = () => { $('#qfMain').hidden = false; $('#qfDone').hidden = true; $('#qErr').textContent = ''; price(); };
  qf.addEventListener('input', price); qf.addEventListener('change', price);
  $('#qWa').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^\d ]/g, ''); });
  qf.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#qErr'), age = parseInt($('#qAge').value, 10), wa = $('#qWa').value.replace(/\D/g, '');
    if (!(age >= 18 && age <= 70)) { err.textContent = 'Escribe una edad entre 18 y 70 años.'; $('#qAge').focus(); return; }
    if (wa.length !== 10) { err.textContent = 'Escribe tu WhatsApp a 10 dígitos.'; $('#qWa').focus(); return; }
    if (!$('#qC1').checked || !$('#qC2').checked) { err.textContent = 'Para enviarte tu cotización necesitamos tu autorización.'; return; }
    err.textContent = ''; $('#qfMain').hidden = true; $('#qfDone').hidden = false;
    setTimeout(() => $('#qfDone button').focus(), 30);
  });

  /* ---------- placeholder links (pending real URLs) ---------- */
  $$('[data-validar]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  /* ---------- Mexico coverage map ---------- */
  const box = $('#mapBox'), tip = $('#mapTip'), sel = $('#stateSel'), res = $('#stateRes');
  fetch('../assets/v2/mx-map.svg').then(r => r.text()).then(svgText => {
    box.insertAdjacentHTML('afterbegin', svgText);
    const svg = box.querySelector('svg');
    const states = $$('.st', svg);
    const byId = Object.fromEntries(states.map(s => [s.id, s]));
    const label = id => svg.querySelector(`.xl[data-ref="${id}"]`);
    const tipFor = (st, x, y) => {
      tip.innerHTML = `<b>${st.dataset.name}</b><span>${st.dataset.mode}</span><em>Cotiza desde cualquier estado de México</em>`;
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('on');
    };
    const center = st => { const b = st.getBoundingClientRect(), r = box.getBoundingClientRect(); return [b.left + b.width / 2 - r.left, b.top + b.height * .35 - r.top]; };
    const hov = (st, on) => { st.classList.toggle('hov', on); const l = label(st.id); l && l.classList.toggle('hov', on); };
    states.forEach(st => {
      st.addEventListener('mousemove', e => { const r = box.getBoundingClientRect(); tipFor(st, e.clientX - r.left, e.clientY - r.top); });
      st.addEventListener('mouseenter', () => hov(st, true));
      st.addEventListener('mouseleave', () => { hov(st, false); tip.classList.remove('on'); });
      st.addEventListener('focus', () => { hov(st, true); tipFor(st, ...center(st)); });
      st.addEventListener('blur', () => { hov(st, false); tip.classList.remove('on'); });
      const pick = () => { states.forEach(s => s.classList.remove('sel')); st.classList.add('sel'); sel.value = st.id; showRes(st); };
      st.addEventListener('click', pick);
      st.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    $$('.xl', svg).forEach(l => {
      const st = byId[l.dataset.ref];
      l.addEventListener('mouseenter', () => { hov(st, true); tipFor(st, ...center(st)); });
      l.addEventListener('mouseleave', () => { hov(st, false); tip.classList.remove('on'); });
      l.addEventListener('click', () => st.dispatchEvent(new Event('click')));
    });
    const showRes = st => { res.textContent = `${st.dataset.name}: ${st.dataset.mode.toLowerCase()}. Cotiza en 30 segundos desde donde estés.`; };
    states.slice().sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, 'es')).forEach(s => sel.add(new Option(s.dataset.name, s.id)));
    sel.addEventListener('change', () => { states.forEach(s => s.classList.remove('sel')); const st = byId[sel.value]; if (st) { st.classList.add('sel'); showRes(st); } else res.textContent = ''; });
  }).catch(() => {});

  onScroll();
})();
