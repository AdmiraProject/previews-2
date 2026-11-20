(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]validar=1/.test(location.search)) document.documentElement.classList.add('show-validar');

  /* ---------- nav ---------- */
  const top = $('.topbar');
  $$('.nav-item').forEach(it => {
    if (!$('.mega', it)) return;
    it.addEventListener('mouseenter', () => top.classList.add('is-mega'));
    it.addEventListener('mouseleave', () => top.classList.remove('is-mega'));
  });
  const burger = $('.burger');
  burger && burger.addEventListener('click', () => { const o = document.body.classList.toggle('is-nav-open'); burger.setAttribute('aria-expanded', o); });
  $$('.mnav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('is-nav-open')));

  /* ---------- modals ---------- */
  const openModal = m => { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  let lastFocus = null;
  const closeModal = m => { m.classList.toggle('is-open', false); document.body.style.overflow = ''; const v = $('video', m); if (v) { v.pause(); } if (lastFocus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; } };
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('.modal__close')) closeModal(m); });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.is-open').forEach(closeModal); });
  const vm = $('#video-modal');
  /* captions: [[start,end,text],...] rendered over a video */
  function attachCC(v, list, host) {
    let el = $('.cc', host); if (!el) { el = document.createElement('div'); el.className = 'cc'; host.appendChild(el); }
    v._cc = list;
    if (!v._ccBound) { v._ccBound = true; v.addEventListener('timeupdate', () => { const t = v.currentTime; const c = (v._cc || []).find(x => t >= x[0] && t < x[1]); const txt = c ? c[2] : ''; if (el.textContent !== txt) el.textContent = txt; el.classList.toggle('on', !!txt); }); }
    el.textContent = ''; el.classList.toggle('on', false);
  }
  function playInModal(src, portrait, poster, cc) {
    if (!vm) return;
    const box = $('.modal__video', vm); box.classList.toggle('portrait', !!portrait);
    const v = $('video', vm); v.src = src; if (poster) v.poster = poster; v.muted = false; v.currentTime = 0;
    if (cc) attachCC(v, JSON.parse(cc), box); else { v._cc = []; const e = $('.cc', box); if (e) e.textContent = ''; }
    openModal(vm); v.play().catch(() => {});
    setTimeout(() => { const c = $('.modal__close', vm); c && c.focus({ preventScroll: true }); }, 60);
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-video]');
    if (t) { e.preventDefault(); lastFocus = t; playInModal(t.dataset.video, t.hasAttribute('data-portrait'), t.dataset.poster, t.dataset.cc); return; }
    const f = e.target.closest('[data-form]');
    if (f) {
      e.preventDefault(); lastFocus = f;
      const fm = $('#form-modal'); if (!fm) return;
      const sel = $('select[name="interes"], select[name="tipo"]', fm);
      if (sel && f.dataset.form) { const o = [...sel.options].find(o => o.value === f.dataset.form || o.text === f.dataset.form); if (o) sel.value = o.value; }
      $('.fbox', fm).classList.remove('is-done');
      openModal(fm); setTimeout(() => { const i = $('input', fm); i && i.focus({ preventScroll: true }); }, 50);
    }
  });
  $$('form.form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    f.closest('.fbox').classList.add('is-done');
  }));

  /* ---------- hero video loader ---------- */
  $$('.hvideo video').forEach(v => {
    const done = () => v.parentElement.classList.remove('is-loading');
    v.addEventListener('playing', done); v.addEventListener('loadeddata', done);
    if (v.readyState >= 2) done();
  });

  /* ---------- slick-like slider ---------- */
  function Slider(root, opt) {
    const list = $('.js-list', root), track = $('.js-track', root);
    const orig = $$(':scope > *', track);
    const n = orig.length; if (!n) return;
    const clonesN = opt.clones || 3;
    for (let i = 0; i < clonesN; i++) {
      track.appendChild(orig[i % n].cloneNode(true));
      track.insertBefore(orig[(n - 1 - i % n + n) % n].cloneNode(true), track.firstChild);
    }
    $$('video', track).forEach(v => { v.muted = true; });
    const all = $$(':scope > *', track);
    const layout = () => {
      if (!opt.center) return;
      const cs = getComputedStyle(list);
      const w = list.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      all.forEach(s => { s.style.width = w + 'px'; });
      if (innerWidth > 1023) root.style.setProperty('--ch', ((w - 24) * 0.5625).toFixed(2) + 'px'); else root.style.removeProperty('--ch');
    };
    layout();
    let idx = 0, busy = false, timer = null;
    const slideW = () => orig[0].getBoundingClientRect().width + (opt.gap || 0);
    const offset = i => {
      const w = slideW();
      const base = opt.center ? 0 : 0;
      return -((i + clonesN) * w) + base;
    };
    const set = (anim) => {
      track.style.transition = anim ? `transform ${opt.speed}ms ${opt.ease}` : 'none';
      track.style.transform = `translate3d(${offset(idx)}px,0,0)`;
      $$(':scope > *', track).forEach((s, k) => s.classList.toggle('is-center', k === idx + clonesN));
    };
    const go = (d) => {
      if (busy) return; busy = true; idx += d; set(true);
      setTimeout(() => { if (idx >= n) idx -= n; if (idx < 0) idx += n; set(false); busy = false; }, opt.speed + 20);
    };
    const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => go(1), opt.autoplay + opt.speed); };
    set(false);
    addEventListener('resize', () => { layout(); set(false); });
    $('.prev', root) && $('.prev', root).addEventListener('click', () => { go(-1); play(); });
    $('.next', root) && $('.next', root).addEventListener('click', () => { go(1); play(); });
    // drag
    let sx = null, dx = 0;
    list.addEventListener('pointerdown', e => { if (e.button !== 0) return; sx = e.clientX; dx = 0; list.classList.add('dragging'); clearInterval(timer); });
    addEventListener('pointermove', e => { if (sx === null) return; dx = e.clientX - sx; track.style.transition = 'none'; track.style.transform = `translate3d(${offset(idx) + dx}px,0,0)`; });
    addEventListener('pointerup', () => {
      if (sx === null) return; list.classList.remove('dragging'); sx = null;
      if (Math.abs(dx) > slideW() / 5) go(dx < 0 ? 1 : -1); else set(true);
      play();
    });
    list.addEventListener('click', e => { if (Math.abs(dx) > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    play();
  }
  $$('.js-slider').forEach(r => Slider(r, { center: true, autoplay: 5000, speed: 500, ease: 'ease', clones: 3 }));
  $$('.js-caps').forEach(r => Slider(r, { autoplay: 5000, speed: 500, ease: 'ease', clones: 6, gap: 20 }));

  /* ---------- marquees (96 px/s) ---------- */
  const mqs = $$('.js-marquee').map(m => {
    const tr = $('.marquee__track', m);
    tr.innerHTML += tr.innerHTML; // duplicate for loop
    return { tr, dir: +m.dataset.dir || -1, x: 0, w: 0 };
  });
  const measure = () => mqs.forEach(q => { q.w = q.tr.scrollWidth / 2; if (q.dir > 0 && !q.x) q.x = -q.w; });
  measure(); addEventListener('resize', measure); addEventListener('load', measure);
  let last = performance.now();
  function tick(t) {
    const dt = Math.min(64, t - last) / 1000; last = t;
    if (!reduce) mqs.forEach(q => {
      q.x += q.dir * 96 * dt;
      if (q.dir < 0 && q.x <= -q.w) q.x += q.w;
      if (q.dir > 0 && q.x >= 0) q.x -= q.w;
      q.tr.style.transform = `translate3d(${q.x.toFixed(1)}px,0,0)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- text parallax (rellax speed 3) ---------- */
  const plx = $$('.js-plx');
  const onScroll = () => { const y = scrollY; plx.forEach(p => { p.style.transform = `translate3d(0,${Math.round(-y / 3)}px,0)`; }); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- counters (linear 2000ms) ---------- */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, end = parseFloat(el.dataset.end), dec = +(el.dataset.dec || 0), sep = el.dataset.sep === '1';
    const fmt = v => { let s = v.toFixed(dec); if (sep) s = Number(s).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return s; };
    if (reduce) { el.textContent = fmt(end); return; }
    const t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 2000); el.textContent = fmt(end * p); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.5 });
  $$('.js-count').forEach(c => cio.observe(c));

  /* ---------- accordion ---------- */
  $$('.acc__btn').forEach(b => b.addEventListener('click', () => {
    const it = b.closest('.acc__item'); const open = !it.classList.contains('is-open');
    it.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open);
  }));

  /* ---------- live clock (footer) ---------- */
  const clocks = $$('[data-tz]');
  const clk = () => clocks.forEach(c => { c.textContent = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: c.dataset.tz }).format(new Date()) + ' h'; });
  clk(); setInterval(clk, 15000);

  /* ---------- inline video cards: click to unmute (testimonial / corpore) ---------- */
  $$('[data-unmute]').forEach(w => {
    const v = $('video', w);
    w.addEventListener('click', e => { e.preventDefault(); v.muted = !v.muted; if (v.paused) v.play(); w.classList.toggle('is-sound', !v.muted); });
  });
  /* ---------- lazy videos (below the fold) ---------- */
  const lazyV = $$('video[data-src]');
  /* section-level image preload: every card image in a slider/marquee section is requested together ~1 screen before
     the section arrives, so off-screen clones never pop in mid-animation */
  const sio = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; $$('img[data-lazysrc]', en.target).forEach(i => { i.src = i.dataset.lazysrc; delete i.dataset.lazysrc; }); sio.unobserve(en.target); }), { rootMargin: '900px 0px' });
  $$('section').forEach(sec => { if ($('img[data-lazysrc]', sec)) sio.observe(sec); });
  /* lazy background images (tiles, mega thumbs) */
  const bio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { const el = en.target; el.style.backgroundImage = `url('${el.dataset.bg}')`; bio.unobserve(el); } }), { rootMargin: '400px 0px' });
  $$('[data-bg]').forEach(el => bio.observe(el));
  $$('.nav-item').forEach(it => it.addEventListener('pointerenter', () => $$('.mega [data-bg]', it).forEach(el => { el.style.backgroundImage = `url('${el.dataset.bg}')`; }), { once: true }));
  $$('.nav-item').forEach(it => it.addEventListener('focusin', () => $$('.mega [data-bg]', it).forEach(el => { el.style.backgroundImage = `url('${el.dataset.bg}')`; }), { once: true }));
  const vio = new IntersectionObserver(es => es.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.src) { v.src = v.dataset.src; v.load(); }
      v.play().catch(() => {});
    } else if (v.src) v.pause();
  }), { rootMargin: '200px 0px' });
  lazyV.forEach(v => { vio.observe(v); if (v.dataset.cc) attachCC(v, JSON.parse(v.dataset.cc), v.closest('.vcard') || v.parentElement); });
  /* modal focus trap */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return; const m = $('.modal.is-open'); if (!m) return;
    const f = $$('button,a[href],input,select,textarea,video[controls]', m).filter(x => x.offsetParent !== null);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  /* location filter hint */
  $$('select[name="ubicacion"]').forEach(s => s.addEventListener('change', () => s.closest('form').classList.toggle('is-otra', s.value === 'Otra')));

})();
