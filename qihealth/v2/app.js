(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body, mqMobile = matchMedia('(max-width:767px)'), canHover = matchMedia('(hover:hover)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- A1/A2 promo + nav, header colour by section ---------- */
  const nav = $('#nav'), bar = $('#navBar'), zones = $$('[data-hdr]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY;
    body.classList.toggle('scrolled', y > 8);
    const probe = (y > 8 ? 24 : 68);                  // vertical centre of the bar
    let col = 'light';
    for (const z of zones) { const r = z.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) col = z.dataset.hdr; }
    bar.style.backgroundColor = col === 'light' ? '#fff' : col;
    nav.classList.toggle('dark', col !== 'light');
    scrollLinked();
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- A3 drawer ---------- */
  const drawer = $('#drawer'), curtain = $('#curtain'), burger = $('#burger');
  const setDrawer = on => {
    drawer.classList.toggle('on', on); curtain.classList.toggle('on', on);
    drawer.setAttribute('aria-hidden', !on); burger.setAttribute('aria-expanded', on);
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(true));
  $('#drClose').addEventListener('click', () => setDrawer(false));
  curtain.addEventListener('click', () => setDrawer(false));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));

  /* ---------- videos: lazy src, play in view only, seamless cross-fade loop ---------- */
  const vurl = u => (innerWidth < 768 ? u.replace(/\.mp4$/, '_720.mp4') : u);
  function pickSrc(v) { const d = v.dataset; if (innerWidth < 768) return d.srcM || vurl(d.src); if (devicePixelRatio < 1.5 && d.src1x) return d.src1x; return d.src; }
  function loadSrc(v) { if (v.dataset.src && !v.getAttribute('src')) { v.src = pickSrc(v); if (!v.hasAttribute('data-eager')) v.preload = 'metadata'; } }
  function xloop(v) {                       // two stacked copies; next copy fades in 0.6s before the end
    const b = v.cloneNode(); b.removeAttribute('autoplay'); b.classList.add('xl-b');
    b.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .6s linear';
    v.style.transition = 'opacity .6s linear';
    if (getComputedStyle(v).position === 'static') v.style.position = 'relative';
    v.after(b); v.loop = false; b.loop = false;
    const pair = { cur: v, nxt: b, on: false };
    const tick = () => {
      const c = pair.cur;
      if (pair.on && c.duration && c.currentTime > c.duration - 0.65 && pair.nxt.paused) {
        const n = pair.nxt; if (!n.src) n.src = c.currentSrc || c.src;
        n.currentTime = 0; n.play().catch(() => {}); n.style.opacity = 1; c.style.opacity = 0;
        setTimeout(() => { c.pause(); c.currentTime = 0; }, 700);
        pair.cur = n; pair.nxt = c;
      }
      pair.raf = requestAnimationFrame(tick);
    };
    v._pair = pair;
    v._play = () => { pair.on = true; loadSrc(v); if (!b.src && v.src) b.src = v.src; b.preload = 'auto'; pair.cur.play().catch(() => {}); cancelAnimationFrame(pair.raf); tick(); };
    v._pause = () => { pair.on = false; cancelAnimationFrame(pair.raf); v.pause(); b.pause(); };
  }
  const vids = $$('video.xloop');
  vids.forEach(xloop);
  vids.filter(v => v.hasAttribute('data-eager')).forEach(v => { loadSrc(v); v._play(); });
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { loadSrc(v); if (!reduce) v._play(); } else v._pause();
  }), { rootMargin: '200px 0px' });
  vids.forEach(v => vio.observe(v));

  /* ---------- A4 featured tiles: hover = video cross-fade + zoom (touch: autoplay in view) ---------- */
  $$('.ftile').forEach(t => {
    const v = $('.ft-hov', t);
    const isV = v.tagName === 'VIDEO';               // Band Pro tile: still photo + Ken Burns instead of a clip
    const play = () => { if (isV) { loadSrc(v); v.play().catch(() => {}); } t.classList.add('playing'); };
    const stop = () => { if (isV) v.pause(); t.classList.remove('playing'); };
    if (canHover) { t.addEventListener('mouseenter', play); t.addEventListener('mouseleave', stop); }
    else new IntersectionObserver(([e]) => e.isIntersecting ? play() : stop(), { threshold: .5 }).observe(t);
  });

  /* ---------- A9 disclaimers ---------- */
  $$('.disc').forEach(d => {
    const b = $('.disc-t', d), inner = $('.disc-in', d), p = $('p', inner);
    // hide toggle when text fits 3 lines
    requestAnimationFrame(() => { if (inner.scrollHeight <= inner.clientHeight + 2 && $$('p', inner).length < 2 && p.offsetHeight <= inner.clientHeight) { b.style.display = 'none'; inner.style.setProperty('--fade', 'transparent'); } });
    b.addEventListener('click', () => { const o = d.classList.toggle('open'); b.textContent = o ? 'Leer menos' : 'Leer más'; });
  });

  /* ---------- in-view reveals (A6 headline, A10 sub, A15 tiles, curve, wordmark, odometer) ---------- */
  const once = (els, cb, opt = { threshold: .35 }) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } }), opt);
    els.forEach(el => io.observe(el));
  };
  once($$('.reveal-lines,.ac-sub,.bb-stack,.gcurve,.stag,.rv'), el => el.classList.add('in'), { threshold: .3 });

  /* odometer (A11): digit columns roll with overshoot */
  $$('.odo').forEach(o => {
    const txt = Number(o.dataset.value).toLocaleString('en-US'), num = $('.odo-num', o);
    [...txt].forEach((ch, i) => {
      if (!/\d/.test(ch)) { const s = document.createElement('span'); s.className = 'odo-sep'; s.textContent = ch; num.append(s); return; }
      const win = document.createElement('span'); win.className = 'odo-win';
      const col = document.createElement('div'); col.className = 'odo-col'; col.dataset.d = ch;
      for (let k = 0; k < 20; k++) { const s = document.createElement('span'); s.textContent = k % 10; col.append(s); }
      col.style.transitionDelay = (i * 0.1) + 's';
      win.append(col); num.append(win);
    });
  });
  const roll = o => $$('.odo-col', o).forEach(c => { c.style.transform = `translateY(-${(10 + +c.dataset.d) * 5}%)`; });
  $$('.odo').forEach(o => { if (o.getBoundingClientRect().top < innerHeight) { $$('.odo-col', o).forEach(c => c.style.transition = 'none'); roll(o); } });
  once($$('.odo'), roll, { threshold: .2 });

  /* footer wordmark (A21): letters rise, staggered left→right */
  const mark = $('#ftMark');
  if (mark) {
    const ps = $$('path', mark).map(p => ({ p, x: p.getBBox().x })).sort((a, b) => a.x - b.x);
    ps.forEach((o, i) => o.p.style.transitionDelay = (i * 0.07) + 's');
    once([mark], m => m.classList.add('in'), { threshold: .25 });
  }

  /* ---------- A13 fact slider ---------- */
  const ts = $('#tslider');
  if (ts) {
    const track = $('.ts-track', ts), n = $$('.ts-slide', ts).length, dots = $$('.ts-dots span', ts), prev = $('.ts-prev', ts), next = $('.ts-next', ts);
    let i = 0;
    const go = k => {
      i = Math.max(0, Math.min(n - 1, k)); track.style.transform = `translateX(${-100 * i}%)`;
      dots.forEach((d, j) => { d.className = j === i ? 'on' : Math.abs(j - i) === 1 ? 'near' : ''; });
      prev.disabled = i === 0; next.disabled = i === n - 1;
    };
    prev.addEventListener('click', () => go(i - 1)); next.addEventListener('click', () => go(i + 1));
    dots.forEach((d, j) => d.addEventListener('click', () => go(j)));
    let sx = null;
    ts.addEventListener('pointerdown', e => sx = e.clientX);
    ts.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); sx = null; });
    go(0);
  }

  /* ---------- A14 quick-view sheet (QiTrax use cases) ---------- */
  const QV = [
    { b: ['Glucosa 24/7', '15 días'], t: 'Ve lo que pasa entre piquetes', s: 'Sensor QiTrax · Sensor CGM', img: 'assets/cut/qitrax_kit3.png',
      d: 'Un piquete te da un solo punto del día. QiTrax registra 1,440 lecturas al día durante 15 días (21,600 por sensor) y las envía a tu app para que veas tu curva completa.', c: 'Comprar sensor · $1,380 MXN' },
    { b: ['Prediabetes', 'Comidas'], t: 'Descubre qué comida te sube', s: 'Sensor QiTrax + app QiHealth', img: 'assets/cut/qitrax_par.png',
      d: 'Si te dijeron prediabetes, ver tu curva después de cada comida te ayuda a entender tus patrones. QiCoach organiza y presenta tus datos de glucosa para facilitar su visualización.', c: 'Pack 6 · $5,999 MXN (90 días)' },
    { b: ['QiCoach', 'App'], t: 'Llega a tu consulta con datos', s: 'App QiHealth con QiCoach', img: '../assets/img/app/glucosa_Group_4622.png',
      d: 'Tus lecturas, tu tiempo en rango y tus promedios quedan organizados en la app, listos para revisarlos con tu profesional de la salud. Las pantallas son ilustrativas.', c: 'Comprar sensor · $1,380 MXN' },
    { b: ['Familia', '2.2 g'], t: 'Cuida a tu papá con diabetes', s: 'Sensor QiTrax · disco de 22 mm × 4.2 mm', img: 'assets/cut/qitrax_kit.png',
      d: 'Un sensor discreto que se usa 15 días y registra su glucosa minuto a minuto, para que tengan datos claros en casa y en cada consulta.', c: 'Pack 6 · $5,999 MXN (90 días)' },
  ];
  const qv = $('#qv');
  const openQV = k => {
    const q = QV[k]; if (!q) return;
    $('.qv-b', qv).innerHTML = q.b.map((x, j) => `<b class="${j ? '' : 'new'}">${x}</b>`).join('');
    $('.qv-t', qv).textContent = q.t; $('.qv-s', qv).textContent = q.s; $('.qv-d', qv).textContent = q.d; $('.qv-1', qv).textContent = q.c; $('.qv-1', qv).dataset.variant = /Pack 6/.test(q.c) ? '48612182917355' : '48612182819051';
    const im = $('.qv-hero img', qv); im.src = q.img; im.alt = q.t;
    $('.qv-disc', qv).textContent = 'Sensor CGM · Reg. SSA 2370E2025 · Permiso de publicidad 263300201B2529. Consulta a tu profesional de la salud para interpretar tus resultados.';
    qv.classList.add('on'); qv.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
  };
  const closeQV = () => { qv.classList.remove('on'); qv.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = ''; };
  $$('[data-qv]').forEach(t => t.addEventListener('click', () => { if (!t._dragged) openQV(+t.dataset.qv); }));
  $('.qv-x', qv).addEventListener('click', closeQV);
  $('.qv-1', qv).addEventListener('click', () => setTimeout(closeQV, 0));   // hand off to the cart pop-up
  qv.addEventListener('click', e => { if (e.target === qv) closeQV(); });
  $$('.qv-1,.qv-2,.qv-link', qv).forEach(a => a.addEventListener('click', closeQV));
  addEventListener('keydown', e => { if (e.key === 'Escape') { setDrawer(false); closeQV(); } });

  /* ---------- A16 phone screens toggle ---------- */
  const plan = $('#plan');
  if (plan) { let tm; new IntersectionObserver(([e]) => { clearInterval(tm); if (e.isIntersecting && !reduce) tm = setInterval(() => plan.classList.toggle('b'), 3200); }, { threshold: .4 }).observe(plan); }

  /* ---------- A17 scroll-linked marquee rows, A20 lead inset ---------- */
  const rows = $$('.mk-row'), mk = $('.lb-mk'), lead = $('.lead'), wlm = $('.wl-media');
  function scrollLinked() {
    const vh = innerHeight;
    if (wlm && !reduce) { const r = wlm.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) wlm.style.transform = `translateY(${Math.max(-60, Math.min(60, -r.top * 0.06))}px)`; }
    if (mk) {
      const r = mk.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) { const p = (vh - r.top) / (vh + r.height) - .5; rows.forEach((row, i) => row.style.transform = `translateX(${(i % 2 ? 1 : -1) * (40 + p * 120)}px)`); }
    }
    if (lead) { const r = lead.getBoundingClientRect(); lead.style.setProperty('--lead-pad', (r.top < vh * .55 && r.bottom > vh * .3) ? '6.75px' : (mqMobile.matches ? '6px' : '24px')); }
  }

  /* ---------- A19 carousels: drag to scroll on desktop ---------- */
  $$('.hscroll').forEach(s => {
    let down = false, x0 = 0, l0 = 0, moved = 0;
    s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; x0 = e.clientX; l0 = s.scrollLeft; s.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; moved = Math.max(moved, Math.abs(dx)); s.scrollLeft = l0 - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; s.style.scrollSnapType = ''; $$('[data-qv]', s).forEach(t => { t._dragged = moved > 6; setTimeout(() => t._dragged = false, 50); }); });
    s.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    s.addEventListener('dragstart', e => e.preventDefault());
  });

  /* ---------- A22 footer accordions (mobile only) ---------- */
  const accs = $$('.facc');
  const syncAcc = () => accs.forEach(a => { a.open = !mqMobile.matches; });
  accs.forEach(a => $('summary', a).addEventListener('click', e => { if (!mqMobile.matches) e.preventDefault(); }));
  mqMobile.addEventListener('change', syncAcc); syncAcc();

  onScroll();
})();
