(() => {
  const ORDER = PC.ORDER, F = PC.FINISHES, N = ORDER.length;
  const rv = document.querySelector('.rv'), stage = document.querySelector('.rv-stage');
  const cap = document.querySelector('.rv-cap-in'), dotsEl = document.querySelector('.rv-dots');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  function sample(d) {
    d = Math.max(-3, Math.min(3, d));
    const i = Math.min(KF.length - 2, Math.floor(d + 3)), t = d + 3 - i, A = KF[i], B = KF[i + 1];
    return A.slice(1).map((v, k) => lerp(v, B[k + 1], t));
  }

  // build cards
  const cards = ORDER.map((f, i) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = PC.card(f, { face: 'both', cls: 'rv-card' });
    const el = wrap.firstElementChild;
    el.dataset.i = i;
    el.insertAdjacentHTML('beforeend', '<i class="shade"></i><i class="shade b"></i>');
    stage.appendChild(el);
    return el;
  });
  ORDER.forEach((f, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button aria-label="${F[f].name}"></button>`;
    li.firstChild.onclick = () => goTo(i);
    dotsEl.appendChild(li);
  });
  const dots = [...dotsEl.querySelectorAll('button')];

  // scroll → target index
  const step = () => innerHeight * (innerWidth <= 860 ? 0.52 : 0.62);
  const top0 = () => rv.getBoundingClientRect().top + scrollY;
  const targetP = () => Math.max(0, Math.min(N - 1, (scrollY - top0()) / step()));
  function goTo(i) { scrollTo({ top: top0() + i * step(), behavior: reduce ? 'auto' : 'smooth' }); }

  // spring state
  let p = reduce ? 0 : -1.7, v = 0, mx = 0, my = 0, tmx = 0, tmy = 0, shown = -1;
  let last = performance.now();

  function setCaption(i) {
    if (i === shown) return; shown = i;
    const f = F[ORDER[i]];
    cap.querySelector('.rv-idx').textContent = `${f.n} — 0${N}`;
    cap.querySelector('.rv-name').textContent = f.name.toUpperCase();
    cap.querySelector('.rv-desc').textContent = f.desc;
    cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap');
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const tp = dragging ? dragP : targetP();
    const k = 120, c = 19;
    v += ((tp - p) * k - v * c) * dt; p += v * dt;
    if (reduce) p = tp;
    mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;

    const mobile = innerWidth <= 860;
    const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rv-cw')) / 420 || 1;
    cards.forEach((el, i) => {
      let d = i - p; d = ((d + 3) % N + N) % N - 3;
      let [cy, z, rx, rz, sc, op] = sample(d);
      if (mobile) op *= Math.max(0, Math.min(1, (d + 0.85) / 0.3)); // keep the headline clear on phones
      const front = Math.max(0, 1 - Math.abs(d));
      const ry = mx * 7 * front, rxm = -my * 5 * front;
      el.style.transform = `perspective(1500px) translate3d(0, ${cy * s}px, ${z * s}px) rotateX(${rx + rxm}deg) rotateY(${ry}deg) rotateZ(${rz + mx * 1.5 * front}deg) scale(${sc})`;
      el.style.setProperty('--op', op.toFixed(3)); // opacity on faces, not the 3D parent (would flatten preserve-3d)
      el.style.zIndex = Math.round(1000 + z);
      const cos = Math.cos(rx * Math.PI / 180);
      el.style.setProperty('--shade', ((1 - Math.abs(cos)) * 0.45 + Math.min(1, Math.abs(d)) * 0.06).toFixed(3));
      el.style.setProperty('--sx', `${(-40 + (rx % 360) * 0.25 + mx * 25).toFixed(1)}%`);
      el.style.pointerEvents = op > 0.5 && Math.abs(cos) > 0.25 ? 'auto' : 'none';
    });
    setCaption(((Math.round(tp) % N) + N) % N);
    rv.classList.toggle('scrolled', scrollY - top0() > 40);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // pointer tilt
  rv.addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; });
  rv.addEventListener('pointerleave', () => { tmx = tmy = 0; });

  // drag (mouse/pen) + tap
  let dragging = false, dragP = 0, y0 = 0, p0 = 0, moved = 0;
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return; // native scroll handles touch
    dragging = true; moved = 0; y0 = e.clientY; p0 = targetP(); dragP = p0;
    stage.classList.add('dragging'); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dy = e.clientY - y0; moved = Math.max(moved, Math.abs(dy));
    dragP = Math.max(0, Math.min(N - 1, p0 - dy / 230));
  });
  stage.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false; stage.classList.remove('dragging');
    if (moved < 6) {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find(n => n.classList && n.classList.contains('rv-card'));
      const cur = Math.round(targetP());
      if (hit) { const i = +hit.dataset.i; goTo(i === cur ? (cur + 1) % N : i); }
      return;
    }
    const to = Math.round(dragP + Math.sign(dragP - p0) * 0.2);
    scrollTo({ top: top0() + Math.max(0, Math.min(N - 1, to)) * step(), behavior: 'auto' });
    p = dragP; // keep spring continuity
  });
  // touch tap
  stage.addEventListener('click', e => {
    if (e.pointerType && e.pointerType !== 'touch') return;
  });

  // gentle snap to the nearest card after scrolling stops inside the drum
  let snapT;
  addEventListener('scroll', () => {
    clearTimeout(snapT);
    snapT = setTimeout(() => {
      const y = scrollY - top0(), st = step();
      if (y > 2 && y < (N - 1) * st - 2) {
        const i = Math.round(y / st);
        if (Math.abs(y - i * st) > 3) scrollTo({ top: top0() + i * st, behavior: 'smooth' });
      }
    }, 160);
  }, { passive: true });

  addEventListener('keydown', e => {
    const y = scrollY - top0(); if (y < -10 || y > (N - 1) * step() + 10) return;
    const cur = Math.round(targetP());
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(N - 1, cur + 1)); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, cur - 1)); }
  });

  // ---- "Elige tu diseño" grid → jump into the drum
  const grid = document.querySelector('.choose-grid');
  ORDER.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = 'ch-tile';
    b.innerHTML = `<b>${F[f].name}</b><small>${F[f].desc}</small>${PC.card(f, { cls: 'ch-card' })}<span class="ch-arrow">↑</span>`;
    b.onclick = () => goTo(i);
    grid.appendChild(b);
  });

  // ---- way glass selector
  const cta = document.querySelector('.way-copy .btn-white');
  document.querySelectorAll('.wg-opt').forEach(o => o.addEventListener('click', () => {
    document.querySelectorAll('.wg-opt').forEach(x => { x.classList.toggle('on', x === o); x.setAttribute('aria-checked', x === o); });
    cta.href = o.dataset.href; cta.textContent = o.dataset.href.includes('login') ? 'Iniciar sesión' : 'Solicitar mi tarjeta';
  }));

  // ---- reveal + nav on dark
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  const darks = [...document.querySelectorAll('.way, .choose, .foot')];
  const navCheck = () => { const y = 36; document.body.classList.toggle('on-dark', darks.some(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; })); };
  addEventListener('scroll', navCheck, { passive: true }); navCheck();
})();
