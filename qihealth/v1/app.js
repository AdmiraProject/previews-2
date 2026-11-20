(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const isMobile = () => innerWidth < 768;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('es-MX');

  /* ---------- smooth scroll (bench uses Lenis) ---------- */
  let lenis = null;
  function initLenis() {
    if (reduce || !window.Lenis || isMobile() || /[?&]nolenis/.test(location.search)) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const el = $(id); if (!el) return; e.preventDefault(); closeMega(); lenis.scrollTo(el, { offset: -90 });
    }));
  }
  if (window.Lenis) initLenis(); else window.addEventListener('load', initLenis, { once: true });

  /* ---------- header: banner collapse + pill state ---------- */
  const hdr = $('#hdr');
  const onScrollHdr = () => hdr.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();

  /* ---------- mega menu ---------- */
  const mega = $('#mega'), scrim = $('#scrim'), burger = $('#burger');
  let megaKey = null, closeT = 0;
  function openMega(key) {
    clearTimeout(closeT);
    megaKey = key;
    $$('.mega-panel', mega).forEach(p => p.classList.toggle('is-active', p.dataset.panel === key));
    $$('.nav-btn[data-mega]').forEach(b => b.classList.toggle('is-on', b.dataset.mega === key));
    burger.classList.toggle('is-x', key === 'more'); burger.setAttribute('aria-expanded', key === 'more');
    mega.classList.add('is-open'); mega.setAttribute('aria-hidden', 'false'); scrim.classList.add('is-on'); hdr.classList.add('is-open');
  }
  function closeMega() {
    megaKey = null; mega.classList.remove('is-open'); mega.setAttribute('aria-hidden', 'true'); scrim.classList.remove('is-on'); hdr.classList.remove('is-open');
    $$('.nav-btn').forEach(b => b.classList.remove('is-on')); burger.classList.remove('is-x'); burger.setAttribute('aria-expanded', 'false');
  }
  $$('.nav-btn[data-mega]').forEach(b => {
    b.addEventListener('mouseenter', () => openMega(b.dataset.mega));
    b.addEventListener('click', () => (megaKey === b.dataset.mega ? closeMega() : openMega(b.dataset.mega)));
  });
  burger.addEventListener('click', () => (megaKey === 'more' ? closeMega() : openMega('more')));
  $('#hdrBar').addEventListener('mouseleave', () => { if (megaKey && megaKey !== 'more') closeT = setTimeout(closeMega, 160); });
  $('#hdrBar').addEventListener('mouseenter', () => clearTimeout(closeT));
  scrim.addEventListener('click', closeMega);
  $$('a', mega).forEach(a => a.addEventListener('click', closeMega));
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMega(); closeDrawer(); } });

  /* ---------- mobile drawer ---------- */
  const drawer = $('#drawer'), burgerM = $('#burgerM'), dTrack = $('#drawerTrack');
  function closeDrawer() { drawer.classList.remove('is-open'); burgerM.classList.remove('is-x'); burgerM.setAttribute('aria-expanded', 'false'); drawer.setAttribute('aria-hidden', 'true'); dTrack.classList.remove('is-sub'); document.documentElement.style.overflow = ''; }
  burgerM.addEventListener('click', () => {
    const open = !drawer.classList.contains('is-open');
    if (!open) return closeDrawer();
    drawer.classList.add('is-open'); burgerM.classList.add('is-x'); burgerM.setAttribute('aria-expanded', 'true'); drawer.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
  });
  $$('.d-root[data-sub]').forEach(b => b.addEventListener('click', () => { $$('.d-sub').forEach(s => s.classList.toggle('is-on', s.dataset.sub === b.dataset.sub)); dTrack.classList.add('is-sub'); }));
  $('#dBack').addEventListener('click', () => dTrack.classList.remove('is-sub'));
  $$('a', drawer).forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------- videos: lazy src, play only on screen ---------- */
  const vids = $$('video.lv');
  const loadVid = v => { if (!v.getAttribute("src") && v.dataset.src) { v.src = (isMobile() && v.dataset.srcM) || v.dataset.src; } };
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { loadVid(v); if (!v.dataset.userPaused) v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  }), { rootMargin: '200px 0px' });
  vids.forEach(v => { v.muted = true; vio.observe(v); });
  loadVid($('.camp-media'));

  /* ---------- fit timeline: start card/settle/rule animations when the section enters ---------- */
  const fitSec = $('#fit');
  if (fitSec) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { fitSec.classList.add('is-seen'); o.disconnect(); } }, { rootMargin: '0px 0px -15% 0px' }).observe(fitSec);

  /* ---------- reveal on enter (one-shot) ---------- */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv, #gcurve, .film-card').forEach(el => rio.observe(el));

  /* ---------- counters ---------- */
  function countUp(el, to, dur = 1400, from = 0) {
    if (reduce) { el.textContent = fmt.format(to); return; }
    const t0 = performance.now();
    const step = t => { const p = clamp((t - t0) / dur); el.textContent = fmt.format(Math.round(lerp(from, to, easeOut(p)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target; countUp(el, +el.dataset.to); cio.unobserve(el); } }), { threshold: 0.6 });
  $$('.cnt').forEach(el => { el.textContent = '0'; cio.observe(el); });

  /* ---------- live counter: QiTrax readings today = minutes since 00:00 (CDMX) ---------- */
  const live = $('#liveCount');
  const minutesToday = () => { const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()); const h = +p.find(x => x.type === 'hour').value, m = +p.find(x => x.type === 'minute').value; return h * 60 + m; };
  let liveStarted = false;
  new IntersectionObserver(es => { if (es[0].isIntersecting && !liveStarted) { liveStarted = true; countUp(live, minutesToday(), 1600); setInterval(() => { live.textContent = fmt.format(minutesToday()); }, 5000); } }, { threshold: 0.6 }).observe(live);

  /* ---------- evidence collage: swirl-in, scroll-scrubbed with smoothing ---------- */
  const evid = $('#evid'), stage = evid && $('.evid-stage', evid), cards = evid ? $$('.ev-card', evid) : [];
  const D = [{ x: 130, y: 266, w: 184, h: 202, d: 0 }, { x: 205, y: 236, w: 258, h: 133, d: .17 }, { x: 979, y: 182, w: 230, h: 230, d: .13 }, { x: 149, y: 596, w: 271, h: 173, d: .28 }, { x: 1114, y: 552, w: 258, h: 133, d: .2 }, { x: 1072, y: 590, w: 184, h: 177, d: .36 }];
  const M = [{ x: 12, y: 150, w: 92, h: 100, d: 0 }, { x: 52, y: 128, w: 128, h: 66, d: .17 }, { x: 262, y: 76, w: 112, h: 112, d: .13 }, { x: 18, y: 620, w: 140, h: 90, d: .28 }, { x: 236, y: 610, w: 136, h: 70, d: .2 }, { x: 214, y: 646, w: 96, h: 92, d: .36 }];
  const evCur = cards.map(() => 0);
  function evidTick() {
    if (!evid) return;
    const r = evid.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -200 || r.top > vh + 200) return;
    const mob = isMobile(), L = mob ? M : D, k = mob ? 1 : Math.min(1, stage.clientWidth / 1440);
    const off = mob ? 0 : (stage.clientWidth - 1440 * k) / 2;
    const raw = (vh - r.top) / (vh - (mob ? 120 : 150));
    const C = { x: (mob ? 195 : 720), y: (mob ? 460 : 490) };
    cards.forEach((c, i) => {
      const L0 = L[i]; const target = reduce ? 1 : clamp((raw - L0.d) / (0.98 - L0.d));
      evCur[i] = Math.abs(target - evCur[i]) < 0.001 ? target : lerp(evCur[i], target, 0.14);
      const p = evCur[i], e = easeOut(p);
      const F = { x: L0.x + L0.w / 2, y: L0.y + L0.h / 2 };
      const aF = Math.atan2(F.y - C.y, F.x - C.x), rF = Math.hypot(F.x - C.x, F.y - C.y);
      const a = aF - (1 - e) * 2.4, rad = rF * (0.55 + 0.45 * e);
      const cx = C.x + Math.cos(a) * rad, cy = C.y + Math.sin(a) * rad;
      c.style.width = L0.w * k + 'px'; c.style.height = L0.h * k + 'px';
      c.style.transform = `translate(${off + (cx - L0.w / 2) * k}px,${(cy - L0.h / 2) * k}px) scale(${Math.max(0.001, e)})`;
      c.style.zIndex = i === 1 || i === 4 ? 1 : 0;
    });
  }

  const batt = $('#batt'), battCount = $('#battCount'), battArc = batt.querySelector('.batt-arc'), battSides = [...batt.querySelectorAll('.batt-side, .batt-stat')];
    const bs = { o: 0, w: 0, c: 1, done: false };
  /* UH AE2TOW (re-measured Nov 14 c): NOT scroll-scrubbed. One-shot when ≥60% of the stage is in view: title layer out (.35s,
     y −24), then after .33s the claim (opacity + side labels ±96px + stat scale .92→1) runs .7s easeOutQuad, the counter
     0→15 runs 1.6s easeOutQuad (floored), the arc wipes L→R in .8s. Never resets. */
  let battT0 = 0;
  const eoq = x => 1 - (1 - x) * (1 - x);
  function battTick() {
    const r = batt.getBoundingClientRect();
    if (!battT0) { if (r.top > innerHeight * 1.2 || r.bottom < -200) return;
      const vis = (Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) / Math.min(r.height, innerHeight);
      if (vis < 0.6 && !reduce) { if (bs.c !== 0) { bs.c = 0; battSides.forEach(e => e.style.setProperty('--o', '0')); battArc.style.setProperty('--w1', '0%'); battArc.style.setProperty('--w2', '0%'); battCount.textContent = '0'; } return; }
      battT0 = performance.now(); batt.classList.add('t-off'); }
    const el = reduce ? 1e6 : performance.now() - battT0 - 330;
    if (el > 2000 && bs.done) return;
    const pc = x => Math.max(0, Math.min(1, x));
    const o = eoq(pc(el / 700)), w = eoq(pc(el / 800)) * 100, c = eoq(pc(el / 1600)) * 15;
    battSides.forEach(e => e.style.setProperty('--o', o.toFixed(4)));
    battArc.style.setProperty('--w1', w.toFixed(2) + '%'); battArc.style.setProperty('--w2', (w * 2.5).toFixed(2) + '%');
    const n = String(Math.floor(c + 1e-6)); if (battCount.textContent !== n) battCount.textContent = n;
    bs.c = c; if (el > 2000) bs.done = true;
  }

  /* ---------- sticky curtain: dark block pins at its bottom (bench top = vh − height) ---------- */
  const blkDark = $('.blk-dark');
  function stickyTop() { if (!blkDark) return; if (innerWidth >= 1200) blkDark.style.top = (innerHeight - blkDark.offsetHeight) + 'px'; else blkDark.style.top = ''; }

  /* ---------- signals carousel (tabs, infinite track, 4 s autoplay, dot progress) ---------- */
  const sig = $('#sig'), track = $('#sigTrack'), vp = $('#sigVp'), tabs = $$('.sig-tab'), dots = $$('.sig-dot'), hl = $('#sigHl');
  const N = 5; let SW = 809; // slide pitch: 809 @1440×900, fluid at wide widths (UH --rm-card-w + 40 gap) — read from layout
  const originals = $$('.sig-slide', track);
  originals.forEach(s => { const c = s.cloneNode(true); c.classList.add('clone'); track.appendChild(c); });
  originals.slice().reverse().forEach(s => { const c = s.cloneNode(true); c.classList.add('clone'); track.prepend(c); });
  $$('video.lv', track).forEach(v => { if (!vids.includes(v)) { v.muted = true; vio.observe(v); } });
  let idx = N; // middle set
  const slideGeom = () => { const s = originals[0], m = s && s.querySelector('.sig-media'); if (!s || !m || !m.offsetWidth) return { sw: 809, cw: 769, pl: 40 }; return { sw: s.getBoundingClientRect().width, cw: m.getBoundingClientRect().width, pl: parseFloat(getComputedStyle(s).paddingLeft) || 0 }; };
  const base = () => { const g = slideGeom(); SW = g.sw; return (vp.clientWidth - g.cw) / 2 - g.pl; };
  function place(anim) { track.classList.toggle('anim', anim); const b = base(); track.style.transform = `translate3d(${b - SW * idx}px,0,0)`; }
  function setActive(k) {
    tabs.forEach((t, i) => { t.classList.toggle('is-on', i === k); t.setAttribute('aria-selected', i === k); });
    const t = tabs[k]; if (t && t.offsetWidth) { hl.style.width = t.offsetWidth + 'px'; hl.style.transform = `translateX(${t.offsetLeft}px)`; }
    dots.forEach((d, i) => { d.classList.toggle('is-on', i === k); const sp = d.firstElementChild; sp.style.animation = 'none'; void sp.offsetWidth; sp.style.animation = ''; });
    $$('.sig-slide', track).forEach(s => s.classList.toggle('is-cur', +s.dataset.i === k));
  }
  function go(i, anim = true) {
    idx = i; const k = ((i % N) + N) % N;
    if (isMobile()) { const s = originals[k]; vp.scrollTo({ left: s.offsetLeft - (vp.clientWidth - s.offsetWidth) / 2, behavior: anim ? 'smooth' : 'auto' }); }
    else place(anim);
    setActive(k);
  }
  track.addEventListener('transitionend', e => { if (e.target !== track) return; if (idx < N || idx >= 2 * N) { idx = ((idx % N) + N) % N + N; place(false); } });
  tabs.forEach((t, i) => t.addEventListener('click', () => { const cur = ((idx % N) + N) % N; go(idx + (i - cur)); }));
  dots.forEach((d, i) => { d.addEventListener('click', () => { const cur = ((idx % N) + N) % N; go(idx + (i - cur)); }); d.firstElementChild.addEventListener('animationend', () => { if (d.classList.contains('is-on')) go(idx + 1); }); });
  let mobScrollT = 0;
  vp.addEventListener('scroll', () => { if (!isMobile()) return; clearTimeout(mobScrollT); mobScrollT = setTimeout(() => {
    const c = vp.scrollLeft + vp.clientWidth / 2; let best = 0, bd = 1e9; originals.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
    if (best !== ((idx % N) + N) % N) { idx = N + best; setActive(best); }
  }, 120); }, { passive: true });
  new IntersectionObserver(es => sig.classList.toggle('is-paused', !es[0].isIntersecting), { threshold: 0.25 }).observe(sig);
  sig.classList.add('is-paused');
  place(false); setActive(0);
  const hlSync = () => setActive(((idx % N) + N) % N);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(hlSync);
  addEventListener('resize', hlSync);

  /* ---------- ripple canvas (QiTrax "2.2 g" panel) ---------- */
  const rpl = $('.ripple'); let rplOn = false;
  function ripple(t) {
    if (!rplOn) return;
    const c = rpl, dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2 - (isMobile() ? 0 : 10), maxR = Math.hypot(w, h) * 0.55;
    for (let i = 0; i < 7; i++) {
      const ph = ((t / 5200) + i / 7) % 1, r = 40 + ph * maxR;
      x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2);
      x.strokeStyle = `rgba(9,35,52,${0.07 * (1 - ph)})`; x.lineWidth = 18 * (1 - ph) + 2; x.stroke();
      x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; x.lineWidth = 1.2; x.stroke();
    }
    requestAnimationFrame(ripple);
  }
  new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !rplOn) { rplOn = true; requestAnimationFrame(ripple); } else if (!on) rplOn = false; }).observe($('#qtMetric'));

  /* ---------- film card watch pill ---------- */
  const film = $('#filmVid'), watch = $('#watch');
  watch.addEventListener('click', () => {
    if (film.paused) { film.dataset.userPaused = ''; delete film.dataset.userPaused; loadVid(film); film.play().catch(() => {}); watch.classList.remove('is-paused'); watch.setAttribute('aria-label', 'Pausar video'); }
    else { film.pause(); film.dataset.userPaused = '1'; watch.classList.add('is-paused'); watch.setAttribute('aria-label', 'Reproducir video'); }
  });

  /* ---------- globe (canvas, orthographic, land dots + warm city lights, centred on México) ---------- */
  const gcv = $('#globeCv');
  let G = null, gOn = false, gRot = -99, gTilt = 20, drag = null, gLast = 0;
  const CITIES = [[19.43, -99.13, 3], [20.67, -103.35, 2], [25.69, -100.31, 2], [19.04, -98.2, 1.2], [32.51, -117.04, 1.3], [20.97, -89.62, 1], [21.16, -86.85, .8], [16.85, -99.88, .8], [29.07, -110.95, .8], [22.15, -100.98, .8], [20.59, -100.39, 1], [21.88, -102.3, .8], [17.06, -96.72, .7], [19.18, -96.13, .9], [28.63, -106.07, .9], [24.8, -107.39, .8],
    [34.05, -118.24, 2.4], [40.71, -74.0, 2.6], [41.88, -87.63, 2], [29.76, -95.37, 1.8], [32.78, -96.8, 1.7], [33.75, -84.39, 1.4], [25.76, -80.19, 1.6], [37.77, -122.42, 1.6], [47.61, -122.33, 1.2], [39.74, -104.99, 1], [33.45, -112.07, 1.2], [43.65, -79.38, 1.5], [45.5, -73.57, 1], [38.9, -77.04, 1.5], [42.36, -71.06, 1.2],
    [4.71, -74.07, 1.6], [-12.05, -77.04, 1.5], [-23.55, -46.63, 2.6], [-22.91, -43.17, 1.8], [-34.6, -58.38, 2], [-33.45, -70.67, 1.4], [10.48, -66.9, 1.1], [14.63, -90.51, .9], [9.93, -84.08, .7], [8.98, -79.52, .7], [23.11, -82.37, .9], [18.47, -69.9, .8], [-0.18, -78.47, .8], [6.24, -75.58, 1], [-15.79, -47.88, 1], [-3.73, -38.52, 1], [-8.05, -34.9, 1],
    [51.5, -0.12, 2], [48.86, 2.35, 2], [40.42, -3.7, 1.6], [41.39, 2.17, 1.2], [38.72, -9.14, 1], [52.52, 13.4, 1.4], [45.46, 9.19, 1.3], [33.57, -7.59, .9], [6.52, 3.38, 1.4], [14.69, -17.44, .7], [5.6, -0.19, .8]];
  const GC = [];
  { const tpl = [...document.querySelectorAll('.globe-vis .gcard')]; const host = tpl[0] && tpl[0].parentElement;
    const AN = [[19.43, -99.13], [38.9, -45], [-8, 10], [28, 75], [-20, 135], [45, -160]];
    if (host) { AN.forEach(([la, lo], i) => { const el = tpl[i % 2].cloneNode(true); el.classList.remove('gc1', 'gc2'); el.classList.add('gtrack'); host.insertBefore(el, tpl[0]); GC.push({ el, v: toV(la, lo) }); }); tpl.forEach(t => t.remove()); } }
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  async function initGlobe() {
    const pts = [], lights = [];
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js');
      const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json')).json();
      const land = window.topojson.feature(topo, topo.objects.land);
      const W = 1440, H = 720, m = document.createElement('canvas'); m.width = W; m.height = H; const mx = m.getContext('2d');
      mx.fillStyle = '#000';
      land.features.forEach(f => { const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates; polys.forEach(poly => { mx.beginPath(); poly.forEach(ring => { let prev = null; ring.forEach(([lo, la], j) => { let x = (lo + 180) / 360 * W; if (prev !== null && Math.abs(x - prev) > W / 2) x += x < prev ? W : -W; const y = (90 - la) / 180 * H; j ? mx.lineTo(x, y) : mx.moveTo(x, y); prev = x; }); mx.closePath(); }); mx.fill('evenodd'); }); });
      const data = mx.getImageData(0, 0, W, H).data;
      for (let la = -58; la <= 82; la += 1.25) { const st = 1.25 / Math.max(0.2, Math.cos(la * Math.PI / 180)); for (let lo = -180; lo < 180; lo += st) { const x = Math.floor((lo + 180) / 360 * W), y = Math.floor((90 - la) / 180 * H); if (data[(y * W + x) * 4 + 3] > 0) pts.push([la, lo]); } }
    } catch (e) { /* offline: sphere + city lights only */ }
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    CITIES.forEach(([la, lo, s]) => { const n = Math.round(26 * s); for (let i = 0; i < n; i++) { const r = Math.pow(rnd(), 1.8) * 1.6 * Math.sqrt(s), a = rnd() * 6.283; lights.push([la + Math.sin(a) * r, lo + Math.cos(a) * r / Math.cos(la * Math.PI / 180), 0.35 + rnd() * 0.65 * (1 - r / 3)]); } });
    pts.forEach(p => { if (rnd() < 0.05) lights.push([p[0] + (rnd() - .5), p[1] + (rnd() - .5), 0.15 + rnd() * 0.3]); });
    G = { pts: pts.map(([la, lo]) => toV(la, lo)), lights: lights.map(([la, lo, b]) => [...toV(la, lo), b]) };
    gcv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, r: gRot, t: gTilt }; gcv.setPointerCapture(e.pointerId); });
    gcv.addEventListener('pointermove', e => { if (!drag) return; gRot = drag.r - (e.clientX - drag.x) * 0.3; gTilt = clamp(drag.t + (e.clientY - drag.y) * 0.2, -40, 60); });
    gcv.addEventListener('pointerup', () => { drag = null; });
  }
  function toV(la, lo) { const a = la * Math.PI / 180, b = lo * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; }
  function drawGlobe(t) {
    if (!gOn) return;
    const dt = gLast ? Math.min(64, t - gLast) : 16; gLast = t;
    if (!drag && !reduce) gRot -= dt * 0.00175;
    const c = gcv, dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    const R = Math.min(w, h) * 0.46, cx = w / 2, cy = h / 2;
    const atm = x.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.12); atm.addColorStop(0, 'rgba(26,152,255,.28)'); atm.addColorStop(1, 'rgba(26,152,255,0)');
    x.fillStyle = atm; x.beginPath(); x.arc(cx, cy, R * 1.12, 0, 6.283); x.fill();
    const sph = x.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R); sph.addColorStop(0, '#173c55'); sph.addColorStop(.55, '#0b2536'); sph.addColorStop(1, '#040f18');
    x.fillStyle = sph; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
    if (!G) { requestAnimationFrame(drawGlobe); return; }
    const ry = -gRot * Math.PI / 180, rx = gTilt * Math.PI / 180, cyy = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx);
    const proj = v => { const X = v[0] * cyy + v[2] * syy, Z0 = -v[0] * syy + v[2] * cyy, Y = v[1] * cxx - Z0 * sxx, Z = v[1] * sxx + Z0 * cxx; return [X, Y, Z]; };
    for (const v of G.pts) { const [X, Y, Z] = proj(v); if (Z <= 0) continue; x.fillStyle = `rgba(130,170,200,${0.14 + Z * 0.46})`; x.fillRect(cx + X * R - .9, cy - Y * R - .9, 1.8, 1.8); }
    x.globalCompositeOperation = 'lighter';
    for (const v of G.lights) { const [X, Y, Z] = proj(v); if (Z <= 0.02) continue; const a = v[3] * Math.min(1, Z * 1.6), px = cx + X * R, py = cy - Y * R;
      x.fillStyle = `rgba(255,170,90,${a * 0.2})`; x.beginPath(); x.arc(px, py, Math.max(1.4, R * 0.0095), 0, 6.283); x.fill();
      x.fillStyle = `rgba(255,226,170,${a})`; x.fillRect(px - .7, py - .7, 1.4, 1.4); }
    x.globalCompositeOperation = 'source-over';
    const sh = x.createRadialGradient(cx + R * .25, cy + R * .3, R * .2, cx, cy, R); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(2,8,14,.55)');
    x.fillStyle = sh; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
    /* glass cards ride the globe like UH xJWT3W: anchored to a point, scale 0.9 + 0.1·depth, fade at the limb (desktop only) */
    if (GC.length && innerWidth >= 992) for (const g of GC) { const [X, Y, Z] = proj(g.v); const o = Math.max(0, Math.min(1, (Z - 0.45) / 0.2));
      const st = g.el.style; if (o <= 0) { if (st.visibility !== 'hidden') st.visibility = 'hidden'; continue; }
      st.visibility = 'visible'; st.left = (cx + X * R - 24).toFixed(1) + 'px'; st.top = (cy - Y * R - 110).toFixed(1) + 'px'; st.transform = `scale(${(0.9 + 0.1 * Z).toFixed(4)})`; st.setProperty('--card-opacity', o.toFixed(3)); }
    requestAnimationFrame(drawGlobe);
  }
  let globeInit = false;
  new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !globeInit) { globeInit = true; initGlobe(); } if (on && !gOn) { gOn = true; gLast = 0; requestAnimationFrame(drawGlobe); } else if (!on) gOn = false; }, { rootMargin: '300px 0px' }).observe(gcv);

  /* ---------- proof marquee (≈24 px/s linear, infinite) ---------- */
  const mq = $('#mqTrack'); const row = mq.firstElementChild; mq.appendChild(row.cloneNode(true)); mq.appendChild(row.cloneNode(true));
  let mqX = 0, mqT = 0, mqOn = false;
  function mqTick(t) { if (!mqOn) return; const dt = mqT ? Math.min(64, t - mqT) : 16; mqT = t; mqX -= dt * 0.024; const w = row.offsetWidth; if (-mqX >= w) mqX += w; mq.style.transform = `translate3d(${mqX}px,0,0)`; requestAnimationFrame(mqTick); }
  new IntersectionObserver(es => { mqOn = es[0].isIntersecting; if (mqOn) { mqT = 0; requestAnimationFrame(mqTick); } }).observe(mq);

  /* ---------- mobile sticky product bar ---------- */
  const mbar = $('#mbar'), blocks = $$('.blk, .buy');
  function mbarTick() {
    if (!isMobile()) return;
    const vh = innerHeight; let cur = null;
    blocks.forEach(b => { const r = b.getBoundingClientRect(); if (r.top < vh * 0.6 && r.bottom > vh * 0.5) cur = b; });
    mbar.classList.toggle('is-on', !!cur); if (cur) mbar.classList.toggle('is-light', cur.dataset.bar === 'light');
  }

  /* ---------- chat FAB ---------- */
  const chat = $('#chat');
  $('#chatBtn').addEventListener('click', () => { const o = chat.classList.toggle('is-open'); $('#chatBtn').setAttribute('aria-expanded', o); });

  /* ---------- cookie banner ---------- */
  const ck = $('#cookie');
  const getCk = () => { try { return localStorage.getItem('qh_ck'); } catch (e) { return null; } };
  const setCk = v => { try { localStorage.setItem('qh_ck', v); } catch (e) { } };
  function showCk() { ck.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => ck.classList.add('is-on'))); }
  function hideCk() { ck.classList.remove('is-on'); setTimeout(() => { ck.hidden = true; }, 380); }
  if (!getCk() && !/[?&]nocookie/.test(location.search)) setTimeout(showCk, 1200);
  $$('[data-ck]', ck).forEach(b => b.addEventListener('click', () => { const a = b.dataset.ck; if (a === 'accept' || a === 'decline') setCk(a); if (a !== 'manage') hideCk(); }));
  $('#cookiePrefs').addEventListener('click', showCk);

  /* ---------- footer accordions (mobile) ---------- */
  $$('.fh').forEach(h => h.addEventListener('click', () => { if (!isMobile()) return; const s = h.parentElement; const o = s.classList.toggle('open'); h.setAttribute('aria-expanded', o); }));


  /* ---------- product gallery (thumbs, 5 s autoplay, crossfade) ---------- */
  const gal = $('#gal');
  if (gal) {
    const its = $$('.gal-it', gal), ths = $$('.gal-th', gal); let gi = 0;
    const show = i => {
      gi = (i + its.length) % its.length;
      its.forEach((e, k) => e.classList.toggle('is-on', k === gi));
      ths.forEach((e, k) => e.classList.toggle('is-on', k === gi));
      const v = its[gi].querySelector('video'); if (v) { loadVid(v); v.play().catch(() => {}); }
    };
    ths.forEach((t, k) => { t.addEventListener('click', () => show(k)); t.addEventListener('animationend', () => { if (t.classList.contains('is-on')) show(gi + 1); }); });
    new IntersectionObserver(es => gal.classList.toggle('is-paused', !es[0].isIntersecting), { threshold: 0.3 }).observe(gal);
    gal.classList.add('is-paused');
  }

  /* ---------- fit: segmented control swaps panels (cards re-animate) ---------- */
  const seg = $('.seg');
  if (seg) {
    const bs = $$('.seg-b', seg), rows = $$('.fit-row');
    const place2 = b => { seg.style.setProperty('--x', (b.offsetLeft - 4) + 'px'); seg.style.setProperty('--w', b.offsetWidth + 'px'); };
    bs.forEach(b => b.addEventListener('click', () => {
      bs.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); }); place2(b);
      rows.forEach(r => r.classList.toggle('is-on', r.dataset.p === b.dataset.p));
    }));
    place2(bs[0]); addEventListener('resize', () => place2($('.seg-b.is-on')));
  }

  /* ---------- math: 1 día / 15 días / 90 días ---------- */
  const yrs = $$('.yr');
  if (yrs.length) {
    const hl = $('#mathHl'), q = $('#mathQ'), pv = $('#mathP'), bq = $('#barQ'), bp = $('#barP');
    const HL = { 1: n => n + ' lecturas en un día con QiTrax.', 15: n => n + ' lecturas en 15 días con un sensor.', 90: n => n + ' lecturas en 90 días con Pack 6.' };
    let cur = 90, mathSeen = false;
    const set = d => {
      const from = 1440 * cur, to = 1440 * d; cur = d;
      yrs.forEach(y => y.classList.toggle('is-on', +y.dataset.d === d));
      hl.textContent = HL[d](fmt.format(to));
      countUp(q, to, 700, Math.min(from, to));
      pv.textContent = fmt.format(3 * d);
      bq.style.width = '100%'; bp.style.width = Math.max(0.8, 3 / 1440 * 100) + '%';
    };
    yrs.forEach(y => y.addEventListener('click', () => set(+y.dataset.d)));
    new IntersectionObserver(es => { if (es[0].isIntersecting && !mathSeen) { mathSeen = true; requestAnimationFrame(() => requestAnimationFrame(() => { cur = 1; set(90); })); } }, { threshold: 0.4 }).observe($('.math-rows'));
  }

  /* ---------- research banner shader (soft moving blue light) ---------- */
  const rbc = $('.rb-shader'); let rbOn = false;
  function rbDraw(t) {
    if (!rbOn) return;
    const c = rbc, dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    const s = t / 1000;
    [[0.78, 0.2, 0.55, '43,81,240'], [0.95, 0.8, 0.45, '26,152,255'], [0.62, 0.9, 0.35, '43,81,240']].forEach(([cx, cy, r, col], i) => {
      const px = w * (cx + Math.sin(s * 0.35 + i * 2) * 0.08), py = h * (cy + Math.cos(s * 0.42 + i) * 0.25), R = w * r;
      const g = x.createRadialGradient(px, py, 0, px, py, R); g.addColorStop(0, 'rgba(' + col + ',.55)'); g.addColorStop(1, 'rgba(' + col + ',0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    const l = x.createLinearGradient(0, 0, w, 0); l.addColorStop(0, 'rgba(10,34,51,1)'); l.addColorStop(.45, 'rgba(10,34,51,.85)'); l.addColorStop(1, 'rgba(10,34,51,0)');
    x.fillStyle = l; x.fillRect(0, 0, w, h);
    requestAnimationFrame(rbDraw);
  }
  if (rbc) new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !rbOn) { rbOn = true; requestAnimationFrame(rbDraw); } else if (!on) rbOn = false; }).observe(rbc);

  /* ---------- frame loop for scroll-linked bits ---------- */
  function frame() { evidTick(); battTick(); mbarTick(); requestAnimationFrame(frame); }
  function onResize() { stickyTop(); place(false); }
  addEventListener('resize', onResize); onResize();
  requestAnimationFrame(frame);
  addEventListener('load', stickyTop);
})();
