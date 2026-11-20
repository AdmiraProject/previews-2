(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqM = matchMedia('(max-width: 767px)');
  const mqNav = matchMedia('(max-width: 991px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = matchMedia('(hover: hover)').matches;

  /* ---------- desktop dropdowns (hover + click) ---------- */
  $$('.dd').forEach(dd => {
    const tg = $('.dd__tg', dd);
    let t;
    const open = v => { dd.classList.toggle('open', v); tg.setAttribute('aria-expanded', v); };
    if (hoverable) {
      dd.addEventListener('mouseenter', () => { clearTimeout(t); $$('.dd.open').forEach(o => o !== dd && o.classList.remove('open')); open(true); });
      dd.addEventListener('mouseleave', () => { t = setTimeout(() => open(false), 160); });
    }
    tg.addEventListener('click', e => { e.preventDefault(); open(!dd.classList.contains('open')); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.dd')) $$('.dd.open').forEach(d => { d.classList.remove('open'); $('.dd__tg', d).setAttribute('aria-expanded', false); }); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.dd.open').forEach(d => d.classList.remove('open')); });
  // mega: category hover switches list
  $$('.mega__cat').forEach(c => {
    const act = () => { $$('.mega__cat').forEach(x => x.classList.toggle('is-on', x === c)); $$('.mega__list').forEach(l => l.classList.toggle('is-on', l.id === c.dataset.cat)); };
    c.addEventListener('mouseenter', act); c.addEventListener('focus', act); c.addEventListener('click', act);
  });

  /* ---------- mobile menu ---------- */
  const burger = $('.burger'), mm = $('#mmenu');
  const setMenu = v => {
    burger.classList.toggle('open', v); burger.setAttribute('aria-expanded', v);
    burger.setAttribute('aria-label', v ? 'Cerrar menú' : 'Abrir menú');
    if (v) { mm.hidden = false; requestAnimationFrame(() => mm.classList.add('open')); document.documentElement.style.overflow = 'hidden'; }
    else { mm.classList.remove('open'); document.documentElement.style.overflow = ''; }
  };
  burger.addEventListener('click', () => setMenu(!burger.classList.contains('open')));
  $$('a', mm).forEach(a => a.addEventListener('click', () => setMenu(false)));
  mqNav.addEventListener('change', () => setMenu(false));

  /* ---------- generic height accordions ---------- */
  const accordion = (item, btn, panel, cls = 'open') => {
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle(cls);
      btn.setAttribute('aria-expanded', isOpen);
      if (isOpen) { panel.style.height = panel.scrollHeight + 'px'; const done = () => { if (item.classList.contains(cls)) panel.style.height = 'auto'; panel.removeEventListener('transitionend', done); }; panel.addEventListener('transitionend', done); }
      else { panel.style.height = panel.scrollHeight + 'px'; requestAnimationFrame(() => requestAnimationFrame(() => { panel.style.height = '0px'; })); }
    });
  };
  $$('.macc').forEach(m => accordion(m, $('.macc__tg', m), $('.macc__p', m)));
  $$('.qa').forEach(q => accordion(q, $('.qa__q', q), $('.qa__a', q)));
  $$('.fcol').forEach(f => {
    const b = $('.fcol__h', f), l = $('.fcol__l', f);
    accordion(f, b, l);
    const sync = () => { if (!mqM.matches) { l.style.height = ''; f.classList.remove('open'); } };
    mqM.addEventListener('change', sync);
  });

  /* ---------- EXPO → wght word reveal ---------- */
  $$('.exp').forEach(e => { if (e.dataset.w) e.style.setProperty('--w', e.dataset.w); });
  const io = (els, fn, opts = { threshold: 0.35 }) => {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    const o = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { fn(en.target); o.unobserve(en.target); } }), opts);
    els.forEach(e => o.observe(e));
  };
  $$('h2').forEach(h => { const ex = $$('.exp', h); if (ex.length) io([h], () => ex.forEach((x, i) => setTimeout(() => x.classList.add('on'), reduce ? 0 : i * 90))); });

  /* ---------- lazy videos: play only in view ---------- */
  const vids = $$('video.lazyvid');
  if (reduce) vids.forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
  else if ('IntersectionObserver' in window) {
    const vo = new IntersectionObserver(es => es.forEach(en => { const v = en.target; if (en.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause(); }), { threshold: 0.15 });
    vids.forEach(v => vo.observe(v));
  }

  /* ---------- reviews carousel (slick centerMode + variableWidth, infinite) ---------- */
  (() => {
    const car = $('#rev'); if (!car) return;
    const track = $('.car__track', car);
    const orig = $$('.rcard', track); const n = orig.length;
    // clone 2 sets before + 2 after for seamless loop
    const mk = () => orig.map(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(i => i.loading = 'eager'); return k; });
    const pre = document.createDocumentFragment(); mk().concat(mk()).forEach(k => pre.appendChild(k)); track.insertBefore(pre, track.firstChild);
    mk().concat(mk()).forEach(k => track.appendChild(k));
    let idx = 2 * n; // first original
    const step = () => orig[0].offsetWidth + 20;
    const offset = () => (car.clientWidth - orig[0].offsetWidth) / 2 - idx * step() - (mqM.matches ? 0 : step() * 0); // center current
    const place = anim => {
      const desk = !mqM.matches;
      track.style.transition = anim ? (desk ? 'transform 1000ms linear' : 'transform 1000ms ease-in-out') : 'none';
      track.style.transform = `translate3d(${offset()}px,0,0)`;
      dots.forEach((d, i) => d.classList.toggle('on', i === ((idx % n) + n) % n));
    };
    const dwrap = $('[data-dots="rev"]');
    const dots = orig.map((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Testimonio ${i + 1}`); b.addEventListener('click', () => { idx = 2 * n + i; place(true); restart(); }); dwrap.appendChild(b); return b; });
    track.addEventListener('transitionend', () => { if (idx >= 3 * n) { idx -= n; place(false); } else if (idx < n) { idx += n; place(false); } });
    let timer, paused = reduce;
    const delay = () => (mqM.matches ? 3000 : 4000);
    const tick = () => { idx++; place(true); };
    const restart = () => { clearInterval(timer); if (!paused) timer = setInterval(tick, delay()); };
    const pbtn = $('[data-pause="rev"]');
    if (paused) pbtn.classList.add('paused');
    pbtn.addEventListener('click', () => { paused = !paused; pbtn.classList.toggle('paused', paused); pbtn.setAttribute('aria-label', paused ? 'Reproducir carrusel' : 'Pausar carrusel'); restart(); });
    // touch swipe on mobile
    let sx = null;
    car.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { idx += dx < 0 ? 1 : -1; place(true); restart(); } sx = null; });
    place(false); restart();
    addEventListener('resize', () => { place(false); restart(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(timer); else restart(); });
  })();

  /* ---------- how it works: hover state machine + mobile slider ---------- */
  (() => {
    const steps = $('#steps'); if (!steps) return;
    const items = $$('.step', steps);
    const track = document.createElement('div'); track.className = 'steps__track';
    items.forEach(s => track.appendChild(s)); steps.appendChild(track);
    const blob = $('.blob'), screens = $$('.phone__screen img');
    const set = (i, on) => {
      items.forEach((s, k) => s.classList.toggle('act', on && k === i));
      screens.forEach((im, k) => im.classList.toggle('is-on', k === i));
      blob.dataset.c = on ? items[i].dataset.c : 'tint';
    };
    items.forEach((s, i) => s.addEventListener('mouseenter', () => { if (!mqM.matches) set(i, true); }));
    track.addEventListener('mouseleave', () => { if (!mqM.matches) set(0, false); });
    // mobile slider
    const dwrap = $('[data-dots="steps"]'); let cur = 0;
    const dots = items.map((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Paso ${i + 1}`); b.addEventListener('click', () => go(i)); dwrap.appendChild(b); return b; });
    const go = i => { cur = Math.max(0, Math.min(items.length - 1, i)); const w = items[0].offsetWidth + 60; track.style.transform = mqM.matches ? `translate3d(${-(cur * w) + (steps.clientWidth - w) / 2}px,0,0)` : ''; dots.forEach((d, k) => d.classList.toggle('on', k === cur)); };
    let sx = null;
    steps.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    steps.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); sx = null; });
    go(0); addEventListener('resize', () => go(cur));
  })();

  /* ---------- offers: section panel takes hovered card color ---------- */
  (() => {
    const bg = $('.offers__bg'); if (!bg) return;
    const col = { mint: '#B2EADD', gold: '#F3D49C', pink: '#F4B9CC', sky: '#C5E6E1', peach: '#F7E1D5', teal: '#02614E' };
    $$('.ocard').forEach(c => {
      c.addEventListener('mouseenter', () => { if (mqM.matches) return; bg.style.backgroundColor = c.dataset.c === 'teal' ? '#CFE3DD' : col[c.dataset.c]; bg.style.opacity = 1; });
      c.addEventListener('mouseleave', () => { bg.style.opacity = 0; });
    });
  })();

  /* ---------- odometer counters ---------- */
  (() => {
    const odos = $$('.odo'); if (!odos.length) return;
    odos.forEach(o => {
      const target = String(o.dataset.to); o.textContent = '';
      [...target].forEach((ch, i) => {
        const d = document.createElement('span'); d.className = 'odo__d';
        const s = document.createElement('span'); s.className = 'odo__s';
        const loops = 2 + (target.length - i); const digit = +ch;
        const seq = []; for (let k = 0; k <= loops * 10 + digit; k++) seq.push(k % 10);
        s.innerHTML = seq.map(v => `<span>${v}</span>`).join('');
        s.dataset.n = seq.length - 1; d.appendChild(s); o.appendChild(d);
      });
    });
    io(odos, o => $$('.odo__s', o).forEach((s, i) => {
      const h = s.firstChild.offsetHeight;
      s.style.transitionDelay = (i * 0.12) + 's';
      s.style.transform = `translateY(${-s.dataset.n * h}px)`;
    }), { threshold: 0.5 });
    addEventListener('resize', () => $$('.odo__s').forEach(s => { if (s.style.transform) { s.style.transition = 'none'; s.style.transform = `translateY(${-s.dataset.n * s.firstChild.offsetHeight}px)`; } }));
  })();

  /* ---------- provider fade slider (750ms crossfade, autoplay) ---------- */
  (() => {
    const sl = $('#pslider'); if (!sl) return;
    const holder = $('[data-clone="slider"]');
    const media = sl.parentElement;
    const home = $('.prov__in');
    const place = () => { if (mqM.matches) { if (media.parentElement !== holder) holder.appendChild(media); } else if (media.parentElement !== home) home.appendChild(media); };
    const slides = $$('.pslide', sl), dw = $('[data-dots="pslider"]'); let cur = 0, t;
    const dots = slides.map((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Persona ${i + 1}`); b.addEventListener('click', () => { show(i); run(); }); dw.appendChild(b); return b; });
    const show = i => { cur = (i + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('is-on', k === cur)); dots.forEach((d, k) => d.classList.toggle('on', k === cur)); };
    const run = () => { clearInterval(t); if (!reduce) t = setInterval(() => show(cur + 1), 5000); };
    let sx = null;
    sl.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); run(); } sx = null; });
    show(0); run(); place(); mqM.addEventListener('change', place);
  })();

  /* ---------- evidence: fill rise + mobile autoplay slider ---------- */
  (() => {
    const wrap = $('#evi'); if (!wrap) return;
    const stats = $$('.estat', wrap);
    io([wrap], () => stats.forEach(s => s.classList.add('in')), { threshold: 0.3 });
    const dw = $('[data-dots="evi"]'); let cur = 0, t, paused = reduce;
    const dots = stats.map((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Beneficio ${i + 1}`); b.addEventListener('click', () => { show(i); run(); }); dw.appendChild(b); return b; });
    const show = i => { cur = (i + stats.length) % stats.length; stats.forEach((s, k) => s.classList.toggle('cur', k === cur)); dots.forEach((d, k) => d.classList.toggle('on', k === cur)); };
    const run = () => { clearInterval(t); if (!paused && mqM.matches) t = setInterval(() => show(cur + 1), 4000); };
    const pb = $('[data-pause="evi"]');
    if (paused) pb.classList.add('paused');
    pb.addEventListener('click', () => { paused = !paused; pb.classList.toggle('paused', paused); run(); });
    show(0); run(); mqM.addEventListener('change', run);
  })();

  /* ---------- WhatsApp form ---------- */
  const f = $('#waform');
  if (f) f.addEventListener('submit', e => {
    e.preventDefault();
    const name = (f.name.value || '').trim();
    const msg = `Hola cauSCe, soy ${name}. Quiero información de sus talleres y experiencias.`;
    window.open('https://wa.me/525516928266?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* ---------- founder film modal ---------- */
  const modal = $('#vmodal'), film = $('#film');
  let lastFocus = null;
  const openFilm = e => { e.preventDefault(); lastFocus = document.activeElement; setMenu(false); modal.hidden = false; document.documentElement.style.overflow = 'hidden'; film.currentTime = 0; const p = film.play(); if (p) p.catch(() => {}); $('.vmodal__x', modal).focus(); };
  const closeFilm = () => { film.pause(); modal.hidden = true; document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
  $$('[data-film]').forEach(b => b.addEventListener('click', openFilm));
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeFilm));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeFilm(); });
})();
