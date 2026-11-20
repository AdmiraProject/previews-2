(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const F = {
    abismo:    { name: 'Abismo',    desc: 'Negro azulado, acabado piano' },
    porcelana: { name: 'Porcelana', desc: 'Blanco porcelana, mate suave' },
    azur:      { name: 'Azur',      desc: 'Azul eléctrico, degradado líquido' },
    hielo:     { name: 'Hielo',     desc: 'Cian hielo, trazos grabados' },
    grafito:   { name: 'Grafito',   desc: 'Gris humo, metal cepillado' },
    aurora:    { name: 'Aurora',    desc: 'Cian a violeta, brillo iridiscente' },
  };
  const ORDER = Object.keys(F), N = ORDER.length;

  const rv = document.querySelector('.rv'), stage = document.querySelector('.rv-stage');
  const dotsEl = document.querySelector('.rv-dots');
  // d (slot offset) → [centerY, z, rotateX, rotateZ, scale, opacity]  (px at card width 420)
  const KF = [
    [-3, -700, -216, -235, 0, 0.90, 0],
    [-2, -500, -162, -195, -1, 0.93, 1],
    [-1, -248, -75, -100, -2, 0.97, 1],
    [0, 4, 0, 5, -5, 1.00, 1],
    [1, 307, 54, 95, -3, 1.00, 1],
    [2, 523, 129, 200, -2, 1.03, 1],
    [3, 720, 200, 250, 0, 1.05, 0],
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const sample = d => { d = Math.max(-3, Math.min(3, d)); const i = Math.min(KF.length - 2, Math.floor(d + 3)), t = d + 3 - i, A = KF[i], B = KF[i + 1]; return A.slice(1).map((v, k) => lerp(v, B[k + 1], t)); };

  const cards = ORDER.map((f, i) => {
    const w = document.createElement('div');
    w.innerHTML = PC.card(f, { face: 'both', cls: 'rv-card' });
    const el = w.firstElementChild; el.dataset.i = i;
    el.insertAdjacentHTML('beforeend', '<i class="shade"></i><i class="shade b"></i>');
    stage.appendChild(el); return el;
  });
  ORDER.forEach((f, i) => { const li = document.createElement('li'); li.innerHTML = `<button aria-label="${F[f].name}"></button>`; li.firstChild.onclick = () => goTo(i); dotsEl.appendChild(li); });
  const dots = [...dotsEl.querySelectorAll('button')];

  const step = () => innerHeight * (innerWidth <= 860 ? 0.36 : 0.42);
  const top0 = () => rv.getBoundingClientRect().top + scrollY;
  const rawP = () => Math.max(0, Math.min(N - 1, (scrollY - top0()) / step()));
  // magnetic dwell: cards ease into each slot instead of being forced there by a scroll snap
  const ease = f => { const k = 0.18; if (f < k) return 0; if (f > 1 - k) return 1; const t = (f - k) / (1 - 2 * k); return t * t * (3 - 2 * t); };
  const targetP = () => { const r = rawP(), i = Math.floor(r); return Math.min(N - 1, i + ease(r - i)); };
  const goTo = i => scrollTo({ top: top0() + i * step(), behavior: reduce ? 'auto' : 'smooth' });

  let p = reduce ? 0 : -1.7, v = 0, mx = 0, my = 0, tmx = 0, tmy = 0, shown = -1, last = performance.now();
  let dragging = false, dragP = 0, y0 = 0, p0 = 0, moved = 0;
  function setCaption(i) { if (i === shown) return; shown = i; dots.forEach((d, k) => d.classList.toggle('on', k === i)); }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const inView = rv.getBoundingClientRect().bottom > -50;
    const tp = dragging ? dragP : targetP();
    v += ((tp - p) * 64 - v * 16) * dt; p += v * dt; if (reduce) p = tp;
    mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
    if (inView) {
      const mobile = innerWidth <= 860;
      const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rv-cw')) / 420 || 1;
      cards.forEach((el, i) => {
        let d = i - p; d = ((d + 3) % N + N) % N - 3;
        let [cy, z, rx, rz, sc, op] = sample(d);
        if (mobile) op *= Math.max(0, Math.min(1, (d + 0.85) / 0.3));
        const fr = Math.max(0, 1 - Math.abs(d));
        el.style.transform = `perspective(1500px) translate3d(0, ${cy * s}px, ${z * s}px) rotateX(${rx - my * 5 * fr}deg) rotateY(${mx * 7 * fr}deg) rotateZ(${rz + mx * 1.5 * fr}deg) scale(${sc})`;
        el.style.setProperty('--op', op.toFixed(3));
        el.style.zIndex = Math.round(1000 + z);
        const cos = Math.cos(rx * Math.PI / 180);
        el.style.setProperty('--shade', ((1 - Math.abs(cos)) * 0.45 + Math.min(1, Math.abs(d)) * 0.06).toFixed(3));
        el.style.setProperty('--sx', `${(-40 + (rx % 360) * 0.25 + mx * 25).toFixed(1)}%`);
        el.style.pointerEvents = op > 0.5 && Math.abs(cos) > 0.25 ? 'auto' : 'none';
      });
      setCaption(((Math.round(p) % N) + N) % N);
      rv.classList.toggle('scrolled', scrollY - top0() > 40);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  rv.addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; });
  rv.addEventListener('pointerleave', () => { tmx = tmy = 0; });
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    dragging = true; moved = 0; y0 = e.clientY; p0 = targetP(); dragP = p0;
    stage.classList.add('dragging'); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => { if (!dragging) return; const dy = e.clientY - y0; moved = Math.max(moved, Math.abs(dy)); dragP = Math.max(0, Math.min(N - 1, p0 - dy / 230)); });
  stage.addEventListener('pointerup', e => {
    if (!dragging) return; dragging = false; stage.classList.remove('dragging');
    if (moved < 6) {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find(n => n.classList && n.classList.contains('rv-card'));
      const cur = Math.round(rawP());
      if (hit) { const i = +hit.dataset.i; goTo(i === cur ? (cur + 1) % N : i); }
      return;
    }
    const to = Math.round(dragP + Math.sign(dragP - p0) * 0.2);
    scrollTo({ top: top0() + Math.max(0, Math.min(N - 1, to)) * step(), behavior: 'auto' }); p = dragP;
  });
  addEventListener('keydown', e => {
    const y = scrollY - top0(); if (y < -10 || y > (N - 1) * step() + 10) return;
    const cur = Math.round(rawP());
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(N - 1, cur + 1)); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, cur - 1)); }
  });

  /* gutter in px from the real client width (scrollbar-safe) */
  const setGut = () => document.documentElement.style.setProperty('--gut', Math.max(16, (document.documentElement.clientWidth - 1856) / 2) + 'px');
  addEventListener('resize', setGut); setGut();

  const nav = document.getElementById('nav'), veil = document.querySelector('.veil');
  const navCheck = () => nav.classList.toggle('solid', scrollY > 8);
  addEventListener('scroll', navCheck, { passive: true }); navCheck();
  const trig = [...nav.querySelectorAll('[data-menu]')]; let openId = null, closeT;
  const menu = id => {
    clearTimeout(closeT); if (openId === id) return; openId = id;
    trig.forEach(t => t.setAttribute('aria-expanded', t.dataset.menu === id));
    nav.querySelectorAll('.mega').forEach(m => { m.hidden = false; m.classList.toggle('on', m.id === id); });
    nav.classList.toggle('open', !!id); veil.hidden = false; veil.classList.toggle('on', !!id);
  };
  const hide = () => { closeT = setTimeout(() => menu(null), 160); };
  trig.forEach(t => { t.addEventListener('mouseenter', () => menu(t.dataset.menu)); t.addEventListener('click', () => (openId === t.dataset.menu ? menu(null) : menu(t.dataset.menu))); });
  nav.addEventListener('mouseleave', hide); nav.addEventListener('mouseenter', () => clearTimeout(closeT));
  nav.querySelectorAll('.nav-t:not([data-menu]), .nav-logo, .nav-r').forEach(el => el.addEventListener('mouseenter', () => menu(null)));
  veil.addEventListener('click', () => menu(null)); addEventListener('keydown', e => { if (e.key === 'Escape') menu(null); });
  nav.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', () => menu(null)));
  const burger = nav.querySelector('.nav-burger'), sheet = document.querySelector('.msheet');
  const sheetOpen = o => { burger.setAttribute('aria-expanded', o); sheet.hidden = !o; document.documentElement.style.overflow = o ? 'hidden' : ''; requestAnimationFrame(() => sheet.classList.toggle('on', o)); };
  burger.onclick = () => sheetOpen(true);
  sheet.querySelector('.ms-close').onclick = () => sheetOpen(false);
  sheet.querySelectorAll('a').forEach(a => a.addEventListener('click', () => sheetOpen(false)));

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const stages = [...document.querySelectorAll('.stage')];
  const fit = () => stages.forEach(s => {
    const t = s.parentElement, w = t.clientWidth, h = t.clientHeight, dw = +s.dataset.w, dh = +s.dataset.h;
    let k = Math.max(w / dw, h / dh);
    const core = s.firstElementChild.getBoundingClientRect().width / (parseFloat(getComputedStyle(s).getPropertyValue('--k')) || 1);
    if (core) k = Math.min(k, (w - 32) / core);
    s.style.setProperty('--k', k.toFixed(4));
  });
  new ResizeObserver(fit).observe(document.querySelector('.grid')); fit();

  // loop runner: runs while the tile is on screen
  const loops = new Map();
  const vis = new IntersectionObserver(es => es.forEach(e => { const l = loops.get(e.target); if (!l) return; l.on = e.isIntersecting; if (l.on && !l.running) { l.running = true; l.fn(l).finally(() => l.running = false); } }), { threshold: 0.25 });
  const loop = (sel, fn) => { const el = document.querySelector(sel); const l = { on: false, running: false, fn }; loops.set(el, l); vis.observe(el); };
  const money = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // T1 — card, spend bar fills, UI tucks back
  document.querySelector('.t1-card').innerHTML = PC.card('abismo');
  const t1 = document.querySelector('.t1'), spent = t1.querySelector('.t1-spent');
  loop('[data-anim=t1]', async l => {
    while (l.on) {
      t1.classList.remove('fill'); spent.textContent = money(0) + ' MXN';
      await wait(500); t1.classList.add('open');
      await wait(1100); t1.classList.add('fill');
      const t0 = performance.now(); await new Promise(r => { const go = n => { const k = Math.min(1, (n - t0) / 1200), e = 1 - Math.pow(1 - k, 3); spent.textContent = money(850 * e) + ' MXN'; k < 1 ? requestAnimationFrame(go) : r(); }; requestAnimationFrame(go); });
      await wait(4200); t1.classList.remove('open'); await wait(1300);
    }
  });

  // T2 — underline walks tabs, dark bar drops
  const t2 = document.querySelector('.t2'), tabs = [...t2.querySelectorAll('.t2-tabs span')], ul = t2.querySelector('.t2-ul');
  const tabTo = i => { const r = tabs[i]; tabs.forEach((t, k) => t.classList.toggle('on', k === i)); ul.style.width = r.offsetWidth + 'px'; ul.style.setProperty('--ux', r.offsetLeft + 'px'); ul.style.setProperty('--us', 1); };
  loop('[data-anim=t2]', async l => {
    while (l.on) {
      t2.classList.remove('done'); tabs.forEach(t => t.classList.remove('on')); ul.style.setProperty('--us', 0); ul.style.setProperty('--ux', '0px');
      await wait(900); tabTo(0); await wait(1200); tabTo(1); await wait(1200); tabTo(2); await wait(900);
      t2.classList.add('done'); await wait(3600);
    }
  });

  const CHECKS = [['01', 'Edad', 'Validando edad', 'Edad: 27 años'], ['02', 'CURP', 'Estructura CURP', 'Estructura válida'], ['03', 'Historial', 'Solicitudes previas', 'Sin solicitudes previas'],
                  ['04', 'RENAPO', 'CURP contra RENAPO', 'CURP validada'], ['05', 'Riesgo', 'Listas de riesgo', 'Consulta completa']];
  const ICON = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const rollA = document.querySelector('.vr-roll'), rollB = document.querySelector('.vr-roll2');
  const slide = (box, html) => {
    const old = box.firstElementChild, it = document.createElement('div'); it.className = 'vr-it in'; it.innerHTML = html; box.appendChild(it);
    requestAnimationFrame(() => requestAnimationFrame(() => { it.classList.remove('in'); if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 750); } }));
    return it;
  };
  loop('[data-anim=t6]', async l => {
    let i = 0;
    while (l.on) {
      const c = CHECKS[i++ % CHECKS.length];
      slide(rollA, c[0]);
      const it = slide(rollB, `<b>Mariana López</b><span class="vr-av">${ICON}</span><b class="vr-who">${c[1]}</b><span class="vr-prog"><small>${c[2]}</small><i><b></b></i></span>`);
      await wait(500); it.querySelector('.vr-prog i b').style.setProperty('--pw', '100%');
      await wait(900); it.querySelector('small').textContent = c[3];
      await wait(1300);
    }
  });

  // T3 — odometer through categories (illustrative amounts)
  const PAYS = [['$1,250.00', 'Súper', '<path d="M3 4h2.2l2.1 10.2h10.4L20 7H6.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="9" cy="18.6" r="1.4" fill="currentColor"/><circle cx="16.4" cy="18.6" r="1.4" fill="currentColor"/>'],
                ['$800.00', 'Gasolina', '<path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20M4 20h11M5 10h9M14 8.5l3 2.5v6.5a1.3 1.3 0 0 0 2.6 0V9.5L17 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'],
                ['$345.50', 'Farmacia', '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8"/>'],
                ['$220.00', 'Cine', '<path d="M4 7.5h16v3a1.8 1.8 0 0 0 0 3v3H4v-3a1.8 1.8 0 0 0 0-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 7.5v9" stroke="currentColor" stroke-width="1.4" stroke-dasharray="1.6 1.6"/>'],
                ['$499.00', 'En línea', '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 12h16M12 4c2.4 2.6 2.4 13.4 0 16M12 4c-2.4 2.6-2.4 13.4 0 16" fill="none" stroke="currentColor" stroke-width="1.4"/>']];
  const od = document.querySelector('.od'), od2 = document.querySelector('.od2'), ic = document.querySelector('.t3-ic');
  const swap = (box, cls, html) => { const old = box.firstElementChild, n = document.createElement('span'); n.className = cls + ' in'; n.innerHTML = html; box.appendChild(n);
    requestAnimationFrame(() => requestAnimationFrame(() => { n.classList.remove('in'); if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 750); } })); };
  loop('[data-anim=t3]', async l => {
    let i = 0;
    while (l.on) { const p = PAYS[i++ % PAYS.length]; swap(od, 'o', p[0]); await wait(90); swap(od2, 'o', p[1]); swap(ic, 'ic o', `<svg viewBox="0 0 24 24">${p[2]}</svg>`); await wait(1700); }
  });

  // T4 — rows clear one by one, done banner, reset
  const t4 = document.querySelector('.t4'), rows = [...t4.querySelectorAll('.t4-r')], pr = t4.querySelector('.t4-pr');
  loop('[data-anim=t4]', async l => {
    while (l.on) {
      t4.classList.remove('done', 'hide'); rows.forEach(r => r.classList.remove('gone')); pr.style.setProperty('--tp', 0);
      await wait(1400);
      for (let k = 0; k < rows.length; k++) { pr.style.setProperty('--tp', (k + 1) / rows.length); await wait(450); rows[k].classList.add('gone'); await wait(750); }
      t4.classList.add('done'); await wait(2400); t4.classList.add('hide'); await wait(500);
    }
  });

  const ask = document.querySelector('.ask'), q = ask.querySelector('.ask-q'), ans = ask.querySelector('.ask-a');
  const QA = [['¿Tiene cargos ocultos?', 'No. Sin cargos ocultos: todo claro desde el inicio.'], ['¿Cuánto tardo en solicitarla?', 'Unos 5 minutos, con datos básicos desde tu celular.'], ['¿Cuándo puedo usarla?', 'Tu tarjeta virtual está lista al momento de tu aprobación.']];
  loop('[data-anim=t5]', async l => {
    let i = 0;
    while (l.on) {
      const [a, b] = QA[i++ % QA.length];
      ask.classList.remove('t', 'a'); q.textContent = ''; ans.textContent = '';
      await wait(600);
      for (let k = 0; k <= a.length; k++) { q.textContent = a.slice(0, k); await wait(48 + Math.random() * 40); }
      await wait(500); ask.classList.add('t'); await wait(900); ask.classList.add('a');
      await wait(400); for (let k = 0; k <= b.length; k++) { ans.textContent = b.slice(0, k); await wait(22); }
      await wait(2600);
    }
  });
  if (reduce) { q.textContent = QA[0][0]; ans.textContent = QA[0][1]; ask.classList.add('t', 'a'); }

  // reveal observer (section fade-ins)
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.2 });
  document.querySelectorAll('.rv-in').forEach(el => io.observe(el));

  /* ================= MARQUEE ================= */
  const WORDS = ['Súper', 'Gasolina', 'Farmacia', 'Restaurantes', 'Viajes', 'Compras en línea', 'Suscripciones', 'Transporte', 'Escuela', 'Hogar', 'Salud', 'Cine'];
  document.querySelector('.mq').innerHTML = [...WORDS, ...WORDS].map(w => `<li>${w}</li>`).join('');

  /* ================= STORIES carousel ================= */
  const slides = [...document.querySelectorAll('.sto-slide')], track = document.querySelector('.sto-track');
  let si = 0;
  const show = i => {
    si = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === si));
    const c = track.children[0], w = c.getBoundingClientRect().width + 16;
    track.style.transform = `translateX(${-si * w}px)`;
  };
  document.querySelector('.sto-next').onclick = () => show(si + 1);
  document.querySelector('.sto-prev').onclick = () => show(si - 1);
  addEventListener('resize', () => show(si));
})();
