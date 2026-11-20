(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqDesk = matchMedia('(min-width:1024px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* hero: portrait poster for the portrait mobile crop */

  /* ---------- header: promo collapse + pill -> bar (0.5s / 0.3s) ---------- */
  const hdr = $('#hdr');
  const onScrollHdr = () => hdr.classList.toggle('is-scrolled', scrollY > 4);
  addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();

  /* ---------- mobile menu ---------- */
  const mnav = $('#mnav'), burger = $('#burger');
  const setMenu = (open) => {
    mnav.classList.toggle('is-open', open); mnav.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-expanded', open); document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(true));
  $('#mnavClose').addEventListener('click', () => setMenu(false));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- counters ---------- */
  const fmt = (v, el) => {
    const dec = +(el.dataset.dec || 0);
    let s = v.toFixed(dec);
    if (el.dataset.sep) s = (+s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return s;
  };
  const runCount = (el) => {
    const to = parseFloat(el.dataset.to), from = parseFloat(el.dataset.from || 0);
    if (reduce) { el.textContent = fmt(to, el); return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(from + (to - from) * e, el); if (p < 1) requestAnimationFrame(step); };
    el.textContent = fmt(from, el); requestAnimationFrame(step);
  };

  /* ---------- reveals (line spans, fades, cards, charts, counters) ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; el.classList.add('in');
    $$('.count', el).forEach(c => { if (!c.closest('.fmedia')) runCount(c); });
    io.unobserve(el);
  }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('.reveal,.reveal-fade,.reveal-li,.chart,.lrow__media,.members__panel,.ncar,.tcards').forEach(el => io.observe(el));

  /* ---------- LED pulse placement over packshots (cover or contain + padding) ---------- */
  const placeLeds = () => $$('.led-wrap').forEach(w => {
    const img = $('img', w), led = $('.led', w); if (!img || !led) return;
    const [fx, fy] = w.dataset.led.split(',').map(Number), cs = getComputedStyle(img);
    const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
    const W = img.clientWidth - pl - pr, H = img.clientHeight - pt - pb, iw = img.naturalWidth || +img.getAttribute('width'), ih = img.naturalHeight || +img.getAttribute('height');
    const s = (cs.objectFit === 'contain' ? Math.min : Math.max)(W / iw, H / ih), dw = iw * s, dh = ih * s;
    const r0 = w.getBoundingClientRect(), ri = img.getBoundingClientRect(), sc = (r0.width / w.offsetWidth) || 1;
    led.style.left = ((ri.left - r0.left) / sc + pl + (W - dw) / 2 + fx * dw) + 'px';
    led.style.top = ((ri.top - r0.top) / sc + pt + (H - dh) / 2 + fy * dh) + 'px';
  });
  addEventListener('resize', placeLeds); addEventListener('load', placeLeds); placeLeds();

  /* ---------- videos: play only when visible ---------- */
  const vio = new IntersectionObserver((ents) => ents.forEach(en => {
    const v = en.target; v._vis = en.isIntersecting;
    if (v._vis && !v._hold) { if (v.preload === 'none') v.preload = 'metadata'; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.15 });
  $$('video').forEach(v => { if (!v.closest('.fmedia')) vio.observe(v); });

  /* ---------- 3. ¿Qué es? expandable cards ---------- */
  const wcards = $$('.wcard');
  const setW = (i) => { wcards.forEach((c, k) => c.classList.toggle('is-active', k === i)); placeLeds(); setTimeout(placeLeds, 520); };
  wcards.forEach((c, i) => {
    $('.wcard__hit', c).addEventListener('click', () => setW(i));
    $('.wcard__toggle', c).addEventListener('click', () => setW(c.classList.contains('is-active') ? (i + 1) % wcards.length : i));
  });

  /* ---------- 4. funciones: auto-advancing tabs, progress ring + text fill ---------- */
  const feat = $('#funciones'), tabs = $$('.ftab'), copies = $$('.fcopy'), medias = $$('.fmedia'), rings = $$('.ring');
  const fMediaBox = $('#featMedia');
  let fi = 0, fTimer = null, fVisible = false, fStart = 0, fLeft = 6000;
  const setF = (i, fromScroll) => {
    fi = i;
    tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.classList.remove('is-done'); t.setAttribute('aria-selected', k === i); t.style.animation = 'none'; t.offsetWidth; t.style.animation = ''; });
    copies.forEach((c, k) => c.classList.toggle('is-active', k === i));
    medias.forEach((m, k) => {
      m.classList.toggle('is-active', k === i);
      const v = $('video', m); if (v) { if (k === i && fVisible) { v.currentTime = 0; v.play().catch(() => {}); } else if (mqDesk.matches || k !== i) v.pause(); }
      if (k === i) $$('.count', m).forEach(runCount);
    });
    const dur = (+medias[i].dataset.dur || 6);
    feat.style.setProperty('--dur', dur + 's');
    $$('.ftab__fill', feat).forEach(f => { f.style.animation = 'none'; f.offsetWidth; f.style.animation = ''; });
    rings.forEach(r => { r.classList.remove('run'); r.getBoundingClientRect(); r.classList.add('run'); });
    if (!mqDesk.matches && !fromScroll) fMediaBox.scrollTo({ left: medias[i].offsetLeft - 20, behavior: 'smooth' });
    schedule(dur * 1000);
  };
  const schedule = (ms) => { clearTimeout(fTimer); fLeft = ms; fStart = performance.now(); if (fVisible) fTimer = setTimeout(() => setF((fi + 1) % tabs.length), ms); };
  tabs.forEach((t, i) => t.addEventListener('click', () => setF(i)));
  new IntersectionObserver(([en]) => {
    fVisible = en.isIntersecting; feat.classList.toggle('paused', !fVisible);
    if (fVisible) { const v = $('video', medias[fi]); v && v.play().catch(() => {}); fTimer = setTimeout(() => setF((fi + 1) % tabs.length), fLeft); fStart = performance.now(); }
    else { clearTimeout(fTimer); fLeft = Math.max(400, fLeft - (performance.now() - fStart)); medias.forEach(m => { const v = $('video', m); v && v.pause(); }); }
  }, { threshold: 0.25 }).observe(feat);
  let fsT; fMediaBox.addEventListener('scroll', () => { if (mqDesk.matches) return; clearTimeout(fsT); fsT = setTimeout(() => {
    const x = fMediaBox.scrollLeft; let best = 0, bd = 1e9; medias.forEach((m, k) => { const d = Math.abs(m.offsetLeft - 20 - x); if (d < bd) { bd = d; best = k; } });
    if (best !== fi) setF(best, true);
  }, 120); }, { passive: true });
  setF(0);

  /* ---------- scroll parallax (Eight lg: translateY(var(--parallax-y)), ±25% of own height) ---------- */
  const pars = $$('.par');
  let parTick = false;
  const parallax = () => {
    parTick = false;
    if (!mqDesk.matches || reduce) { pars.forEach(p => p.style.transform = ''); return; }
    const vh = innerHeight;
    pars.forEach(p => { // Eight: --parallax-y = 25% → −25% of the element's own height while it crosses the viewport (bottom edge in → top edge out)
      const cur = p._ty || 0, r = p.getBoundingClientRect(), top = r.top - cur, h = r.height;
      const k = clamp((vh - top) / (vh + h), 0, 1), ty = h * (0.25 - 0.5 * k);
      if (Math.abs(ty - cur) < 0.05) return;
      p._ty = ty; p.style.transform = `translate3d(0,${ty.toFixed(2)}px,0)`;
    });
  };
  addEventListener('scroll', () => { if (!parTick) { parTick = true; requestAnimationFrame(parallax); } }, { passive: true });
  addEventListener('resize', parallax); parallax();

  /* ---------- 5. vida: mobile pills + swipe ---------- */
  const pills = $$('.pill'), rows = $$('.lrow'), rowsBox = $('.life__rows');
  const mtxt = document.createElement('div'); mtxt.className = 'life__mtxt'; mtxt.setAttribute('aria-live', 'polite');
  rows.forEach(r => { const c = $('.lrow__txt', r).cloneNode(true); c.classList.remove('reveal-fade'); c.classList.add('in'); mtxt.appendChild(c); });
  rowsBox.before(mtxt);
  const mt = $$('.lrow__txt', mtxt); mt[0].classList.add('is-active');
  const ldots = document.createElement('div'); ldots.className = 'life__dots'; ldots.setAttribute('aria-hidden', 'true');
  rows.forEach((r, k) => { const d = document.createElement('span'); if (!k) d.className = 'is-active'; ldots.appendChild(d); }); rowsBox.after(ldots);
  const ld = $$('span', ldots);
  const setL = (i, fromScroll) => {
    pills.forEach((p, k) => p.classList.toggle('is-active', k === i));
    rows.forEach((r, k) => r.classList.toggle('is-active', k === i));
    mt.forEach((t, k) => t.classList.toggle('is-active', k === i));
    ld.forEach((t, k) => t.classList.toggle('is-active', k === i));
    if (!fromScroll && !mqDesk.matches) rowsBox.scrollTo({ left: rows[i].offsetLeft - 20, behavior: 'smooth' });
  };
  pills.forEach((p, i) => p.addEventListener('click', () => setL(i)));
  let lsT; rowsBox.addEventListener('scroll', () => { if (mqDesk.matches) return; clearTimeout(lsT); lsT = setTimeout(() => {
    const x = rowsBox.scrollLeft; let best = 0, bd = 1e9; rows.forEach((r, k) => { const d = Math.abs(r.offsetLeft - 20 - x); if (d < bd) { bd = d; best = k; } }); setL(best, true);
  }, 100); }, { passive: true });

  /* ---------- 6. noche: infinite carousel (arrows, dots, drag, keys) ---------- */
  const ncar = $('#ncar'), ncards = $$('.ncard'), dotsBox = $('#ncarDots'), nbg = $('#nightBg');
  const nColors = ['#061a2a', '#071f33', '#0a2a40', '#0b2236', '#08283d'];
  const N = ncards.length; let ni = 0;
  ncards.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1)); b.addEventListener('click', () => goN(i)); dotsBox.appendChild(b); });
  const dots = $$('button', dotsBox);
  /* mobile (Eight <lg): the header swaps to the active moment's title + text; cards show only the media */
  const nhead = $('.night__head'), nstack = document.createElement('div'); nstack.className = 'night__stack';
  const s0 = document.createElement('div'); s0.className = 'night__s is-on'; [...nhead.children].forEach(el => s0.appendChild(el)); nstack.appendChild(s0);
  ncards.forEach((c, i) => { if (!i) return; const d = document.createElement('div'); d.className = 'night__s night__s--m'; d.setAttribute('aria-hidden', 'true');
    const t = document.createElement('p'); t.className = 'night__mt'; t.textContent = c.querySelector(':scope > h3').textContent;
    const x = document.createElement('p'); x.className = 'night__md'; x.textContent = c.querySelector(':scope > p').textContent; d.append(t, x); nstack.appendChild(d); });
  nhead.appendChild(nstack); const nsl = $$('.night__s', nstack);
  const layoutN = (animate = true) => {
    const gap = mqDesk.matches ? 576 : 330;
    ncards.forEach((c, i) => {
      let d = ((i - ni) % N + N) % N; if (d > N / 2) d -= N;
      const prev = c._d; c._d = d;
      const jump = prev !== undefined && Math.abs(prev - d) > 2;
      c.classList.toggle('no-t', !animate || jump);
      c.classList.toggle('is-active', d === 0);
      c.style.transform = `translateX(${d * gap}px)`;
      c.style.zIndex = 10 - Math.abs(d);
      c.setAttribute('aria-hidden', d !== 0);
      if (jump) requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('no-t')));
    });
    dots.forEach((b, k) => b.classList.toggle('is-active', k === ni));
    nsl.forEach((x, k) => x.classList.toggle('is-on', k === ni));
    nbg.style.backgroundColor = nColors[ni % nColors.length];
    ncar.classList.toggle('on-first', ni === 0);
  };
  const goN = (i) => { ni = ((i % N) + N) % N; layoutN(); };
  $('#ncarPrev').addEventListener('click', () => goN(ni - 1));
  $('#ncarNext').addEventListener('click', () => goN(ni + 1));
  ncards.forEach((c, i) => c.addEventListener('click', () => { if (c._d) goN(ni + c._d); }));
  let dx0 = null;
  ncar.addEventListener('pointerdown', e => { dx0 = e.clientX; });
  addEventListener('pointerup', e => { if (dx0 === null) return; const d = e.clientX - dx0; dx0 = null; if (Math.abs(d) > 40) goN(ni + (d < 0 ? 1 : -1)); });
  ncar.tabIndex = 0; ncar.addEventListener('keydown', e => { if (e.key === 'ArrowRight') goN(ni + 1); if (e.key === 'ArrowLeft') goN(ni - 1); });
  layoutN(false); mqDesk.addEventListener('change', () => layoutN(false));

  /* ---------- 10. stories marquee (CSS loop, seamless clone) ---------- */
  const mtrack = $('#storiesMarq .marq__track');
  mtrack.innerHTML += mtrack.innerHTML;
  $$('[alt]', mtrack).forEach((im, k) => { if (k >= $$('[alt]', mtrack).length / 2) im.setAttribute('alt', ''); });
  const setMq = () => mtrack.style.setProperty('--mq-dur', (mtrack.scrollWidth / 2 / 40) + 's');
  addEventListener('load', setMq); setMq();

  /* ---------- 11. performers belt (JS marquee ≈37 px/s, pauses on hover/offscreen) ---------- */
  const belt = $('#belt'), btrack = $('#beltTrack');
  btrack.innerHTML += btrack.innerHTML;
  $$('img', btrack).slice($$('img', btrack).length / 2).forEach(im => im.setAttribute('alt', ''));
  $$('video', btrack).forEach(v => vio.observe(v));
  let bx = 0, bLast = 0, bOn = false, bHover = false;
  const beltLoop = (t) => {
    if (!bOn) return; const dt = bLast ? Math.min(64, t - bLast) : 16; bLast = t;
    if (!bHover && !reduce) { bx -= 37 * dt / 1000; const half = btrack.scrollWidth / 2; if (-bx >= half) bx += half; btrack.style.transform = `translate3d(${bx}px,0,0)`; }
    requestAnimationFrame(beltLoop);
  };
  new IntersectionObserver(([en]) => { bOn = en.isIntersecting; bLast = 0; if (bOn) requestAnimationFrame(beltLoop); }).observe(belt);
  belt.addEventListener('pointerenter', () => bHover = true); belt.addEventListener('pointerleave', () => bHover = false);

  /* ---------- footer ---------- */
  const nEmail = $('#newsEmail'), nBtn = $('#newsForm button');
  const okEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  nEmail.addEventListener('input', () => { nBtn.disabled = !okEmail(nEmail.value); });
  $('#newsForm').addEventListener('submit', e => { e.preventDefault(); if (okEmail(nEmail.value)) { nEmail.value = ''; nEmail.placeholder = 'Gracias. Te escribiremos pronto.'; nBtn.disabled = true; } });
  $$('.fcol__h').forEach(h => h.addEventListener('click', () => { if (mqDesk.matches) return; const c = h.parentElement, o = !c.classList.contains('open'); c.classList.toggle('open', o); h.setAttribute('aria-expanded', o); }));

  /* ---------- 15. quiz popup ---------- */
  const quiz = $('#popup'); let lastFocus = null;
  const recs = {
    band: { eye: 'Tu recomendación', t: 'QiHealth Band Pro', s: 'Sueño, HRV y recuperación, sin pantalla. Más de 15 días de batería. $3,500 MXN.', go: 'Ver la Band Pro', href: 'band-pro/' },
    trax: { eye: 'Tu recomendación', t: 'QiTrax', s: 'Tu glucosa cada minuto: 1,440 lecturas al día durante 15 días. Desde $1,380 MXN.', go: 'Ver QiTrax', href: 'qitrax/' },
    family: { eye: 'Tu recomendación', t: 'QiTrax', s: 'Para acompañar a un familiar con diabetes: su glucosa cada minuto y sus patrones en la app.', go: 'Ver QiTrax', href: 'qitrax/' },
    ring: { eye: 'Tu recomendación', t: 'QiHealth Ring Pro', s: 'Un anillo discreto para todo el día: sueño, frecuencia cardiaca y SpO2. Dorado, plateado o negro. $5,999 MXN.', go: 'Ver el Ring Pro', href: 'ring-pro/' },
    all: { eye: 'Conoce QiHealth', t: 'Elige lo que quieres entender', s: 'Band Pro para tu sueño y tu recuperación, QiTrax para tu glucosa y Ring Pro para todo el día.', go: 'Ver la Band Pro', href: 'band-pro/' }
  };
  const step = (n) => $$('.qstep', quiz).forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
  const openQ = () => {
    lastFocus = document.activeElement; step(1);
    quiz.classList.add('is-open'); quiz.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
    setTimeout(() => $('.qopt', quiz).focus({ preventScroll: true }), 300);
    try { sessionStorage.setItem('qh_quiz', '1'); } catch (e) {}
  };
  const closeQ = () => { quiz.classList.remove('is-open'); quiz.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); };
  $$('[data-open-quiz]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setMenu(false); openQ(); }));
  $('#quizClose').addEventListener('click', closeQ);
  $('#qNot').addEventListener('click', closeQ);
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (quiz.classList.contains('is-open')) closeQ(); if (mnav.classList.contains('is-open')) setMenu(false); } });
  $$('[data-pick]', quiz).forEach(b => b.addEventListener('click', () => {
    const r = recs[b.dataset.pick];
    $('#qEye').textContent = r.eye; $('#qTitle').textContent = r.t; $('#qSub').textContent = r.s;
    $('#qGo').textContent = r.go; $('#qGo').href = r.href; $('#qGo2').textContent = r.go; $('#qGo2').href = r.href;
    step(2); setTimeout(() => $('#qEmail').focus({ preventScroll: true }), 50);
  }));
  $('#quizForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#qEmail').value; if (!okEmail(v)) { $('#qErr').textContent = 'Escribe un correo válido.'; return; } $('#qErr').textContent = ''; step(3); });
  [$('#qGo'), $('#qGo2')].forEach(a => a.addEventListener('click', closeQ));
  quiz.addEventListener('keydown', e => { // focus trap
    if (e.key !== 'Tab') return; const f = $$('button,a,input', quiz).filter(x => x.offsetParent); const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  let seen = false; try { seen = sessionStorage.getItem('qh_quiz') === '1'; } catch (e) {}
  if (!seen && !/[?&]nopopup/.test(location.search)) setTimeout(() => { if (!quiz.classList.contains('is-open')) openQ(); }, 4000);
  if (/[?&]popup/.test(location.search) && !/nopopup/.test(location.search)) openQ();
})();
