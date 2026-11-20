(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqMobile = matchMedia('(max-width: 1023px)');
  const isLG = () => innerWidth >= 1024;
  const isNavD = () => innerWidth >= 1180;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const inOut = p => t => (t < .5 ? Math.pow(2 * t, p) / 2 : 1 - Math.pow(2 * (1 - t), p) / 2);
  const ease3 = inOut(3), ease2 = inOut(2);
  const header = $('.site-header');
  const nav = $('.nav-container');

  /* ---------------- nav: hide on scroll down / show on scroll up ---------------- */
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (header.classList.contains('menu-open')) { lastY = y; return; }
    const d = y - lastY;
    if (Math.abs(d) < 1) return;
    if (d > 0 && y > 120) nav.classList.add('is-hidden');
    else if (d < 0) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  /* ---------------- mega menus: cascade reveal ---------------- */
  $$('.nav-item').forEach(li => {
    const items = $$('[data-cascade]', li);
    const hide = () => items.forEach(e => { e.style.transition = 'none'; e.style.opacity = '0'; e.style.transform = 'translateY(10px)'; });
    if (!RM) hide();
    let t;
    li.addEventListener('mouseenter', () => {
      clearTimeout(t);
      if (RM) return;
      items.forEach((e, i) => {
        e.style.transition = 'none'; e.style.opacity = '0'; e.style.transform = 'translateY(10px)';
        void e.offsetWidth;
        const d = 60 + i * 45;
        e.style.transition = `opacity .5s cubic-bezier(.22,1,.36,1) ${d}ms, transform .5s cubic-bezier(.22,1,.36,1) ${d}ms, background-color .3s`;
        e.style.opacity = '1'; e.style.transform = 'none';
      });
    });
    li.addEventListener('mouseleave', () => { li.classList.remove('is-closed'); t = setTimeout(() => { if (!RM) hide(); }, 320); });
    li.addEventListener('focusin', () => items.forEach(e => { e.style.opacity = '1'; e.style.transform = 'none'; }));
    $$('.mega a, .mega button', li).forEach(a => a.addEventListener('click', () => { li.classList.add('is-closed'); a.blur(); }));
  });

  /* ---------------- mobile menu ---------------- */
  const tog = $('.m-toggle'), panel = $('#m-panel');
  function showView(id) {
    $$('.m-view', panel).forEach(v => {
      const on = id === 'root' ? v.dataset.view === 'root' : v.id === id;
      v.classList.toggle('is-active', on);
      v.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) v.scrollTop = 0;
    });
  }
  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    tog.setAttribute('aria-expanded', String(open));
    tog.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.remove('is-hidden');
    if (!open) setTimeout(() => showView('root'), 300);
  }
  tog.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  $$('.m-trigger').forEach(b => b.addEventListener('click', () => showView(b.dataset.target)));
  $$('.m-back').forEach(b => b.addEventListener('click', () => showView('root')));
  $$('.m-panel a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  showView('root');

  /* ---------------- smooth anchors with nav offset ---------------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    const off = isNavD() ? 104 : 96;
    const top = id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - off;
    scrollTo({ top: Math.max(0, top), behavior: RM ? 'auto' : 'smooth' });
    history.pushState(null, '', id);
  });

  /* ---------------- videos: responsive source, lazy, pause off-screen ---------------- */
  const srcFor = v => (mqMobile.matches ? v.dataset.srcM : v.dataset.srcD) || v.dataset.srcD;
  const hero = $('.hero__video');
  if (hero) {
    if (mqMobile.matches && hero.dataset.posterM) hero.poster = hero.dataset.posterM;
    hero.addEventListener('playing', () => hero.classList.add('is-playing'));
    if (!RM) { hero.src = srcFor(hero); hero.play().catch(() => {}); }
  }
  const vio = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      if (RM) return;
      if (!v.getAttribute('src')) v.src = srcFor(v);
      v.play().catch(() => {});
    } else if (!v.paused) v.pause();
  }), { rootMargin: '150px 0px' });
  $$('[data-lazy-video], .hero__video').forEach(v => vio.observe(v));

  /* ---------------- founder film modal ---------------- */
  const film = $('#film'), fv = $('.film__v', film);
  let lastFocus = null;
  function openFilm() {
    lastFocus = document.activeElement;
    closePopup(); if (header.classList.contains('menu-open')) setMenu(false);
    if (!fv.getAttribute('src')) fv.src = fv.dataset.src;
    film.classList.add('is-open'); film.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    fv.muted = false; fv.volume = 1;
    try { fv.currentTime = 0; } catch (e) {}
    fv.play().catch(() => {});
    setTimeout(() => $('.film__x', film).focus(), 50);
  }
  function closeFilm() {
    if (!film.classList.contains('is-open')) return;
    film.classList.remove('is-open'); film.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    fv.pause();
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', e => { const t = e.target.closest('[data-film]'); if (t) { e.preventDefault(); openFilm(); } });
  film.addEventListener('click', e => { if (e.target === film || e.target.closest('.film__x')) closeFilm(); });

  /* ---------------- popup (8 s timer + exit intent, 1 day) ---------------- */
  const popup = $('#popup'), KEY = 'causce_v3_popup';
  const seen = () => { try { const t = +localStorage.getItem(KEY); return t && Date.now() - t < 864e5; } catch (e) { return false; } };
  const blocked = () => new URLSearchParams(location.search).has('nopopup') || navigator.webdriver;
  let popupShown = false;
  function openPopup() {
    if (popupShown || seen() || blocked() || film.classList.contains('is-open') || header.classList.contains('menu-open')) return;
    popupShown = true;
    popup.classList.add('is-open'); popup.setAttribute('aria-hidden', 'false');
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
  }
  function closePopup() { popup.classList.remove('is-open'); popup.setAttribute('aria-hidden', 'true'); }
  setTimeout(openPopup, 8000);
  document.addEventListener('mouseleave', e => { if (e.clientY <= 0) openPopup(); });
  popup.addEventListener('click', e => { if (e.target === popup || e.target.closest('.popup__x') || e.target.closest('.popup__btns a')) closePopup(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeFilm(); closePopup(); if (header.classList.contains('menu-open')) setMenu(false); } });

  /* ---------------- newsletter (no email tool yet — VALIDAR) ---------------- */
  const form = $('#news-form');
  form && form.addEventListener('submit', e => {
    e.preventDefault();
    let msg = $('.f-form__msg');
    if (!msg) { msg = document.createElement('p'); msg.className = 'f-form__msg'; form.after(msg); }
    msg.innerHTML = '¡Gracias! Para recibir novedades hoy mismo, escríbenos por <a href="https://wa.me/525516928266?text=Hola%20cauSCe%2C%20quiero%20recibir%20novedades" target="_blank" rel="noopener" style="text-decoration:underline">WhatsApp</a>.';
    form.reset();
  });

  function initPrograms() {
    const block = $('.programs'), el = $('.swiper-programs', block);
    if (!el || !window.Swiper) return;
    const pills = $$('.pill', block), bg = $('.pills__bg', block);
    let raf = null, running = false;
    const ce = sw => sw.slides.forEach(s => {
      const img = $('.slide-img', s), c = $('.slide-content', s);
      const a = Math.max(-1, Math.min(1, s.progress)), i = Math.abs(a);
      img.style.transform = `scale(${1 + .1 * i})`;
      c.style.transform = `scale(${Math.max(.95, 1 - .1 * i)})`;
    });
    const de = sw => sw.slides.forEach(s => {
      const on = Math.abs(s.progress) < .5;
      $('.card', s).classList.toggle('is-off', !on);
      const b = $('.slide-blob', s); b && b.classList.toggle('is-off', !on);
    });
    const tick = sw => {
      if (!running) return;
      const t = sw.getTranslate(); sw.updateProgress(t); sw.updateSlidesProgress(t); ce(sw); de(sw);
      raf = requestAnimationFrame(() => tick(sw));
    };
    const settle = sw => {
      running = false; if (raf) cancelAnimationFrame(raf); raf = null;
      const t = sw.getTranslate(); sw.updateProgress(t); sw.updateSlidesProgress(t); ce(sw); de(sw);
    };
    function setPill(i) {
      const p = pills[i]; if (!p) return;
      bg.style.width = p.offsetWidth + 'px'; bg.style.height = p.offsetHeight + 'px';
      bg.style.left = p.offsetLeft + 'px'; bg.style.top = p.offsetTop + 'px';
      pills.forEach((x, k) => { x.classList.toggle('is-active', k === i); x.setAttribute('aria-selected', String(k === i)); });
    }
    const sw = new Swiper(el, {
      slidesPerView: 1, centeredSlides: true, spaceBetween: 0, speed: RM ? 0 : 1500,
      watchSlidesProgress: true, grabCursor: false, observer: true, observeParents: true,
      mousewheel: { enabled: true, invert: false, releaseOnEdges: true, forceToAxis: true, thresholdDelta: 25 },
      slideToClickedSlide: true,
      on: {
        init() { ce(this); de(this); },
        slideChangeTransitionStart() { if (!running) { running = true; tick(this); } de(this); },
        transitionEnd() { settle(this); },
        touchStart() { settle(this); },
        setTranslate() { if (!running && this.touchEventsData && this.touchEventsData.isMoved) { ce(this); de(this); } },
        resize() { ce(this); de(this); requestAnimationFrame(() => setPill(this.activeIndex)); },
        slideChange() { setPill(this.activeIndex); }
      }
    });
    pills.forEach((p, i) => p.addEventListener('click', () => sw.slideTo(i)));
    requestAnimationFrame(() => requestAnimationFrame(() => { sw.update(); ce(sw); de(sw); setPill(sw.activeIndex); }));
    addEventListener('load', () => { sw.update(); setPill(sw.activeIndex); }, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setPill(sw.activeIndex));

    // sticky glass card (desktop): follows viewport centre inside the slide
    const resetCard = c => { c.style.position = ''; c.style.top = ''; };
    function sticky() {
      if (!isLG()) { sw.slides.forEach(s => resetCard($('.card', s))); return; }
      sw.slides.forEach(s => {
        const card = $('.card', s), sc = $('.slide-content', s);
        const cs = getComputedStyle(sc);
        const pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
        const top = sc.getBoundingClientRect().top;
        const r = card.getBoundingClientRect();
        const half = innerHeight / 2, h = card.offsetHeight;
        let f = pt;
        if (r.top < half) f = half - top - h / 2;
        f = Math.max(pt, Math.min(f, sc.clientHeight - pb - h));
        const prev = card.style.transition;
        card.style.transition = RM ? 'none' : `top 300ms ease-out, opacity 1s cubic-bezier(.65,0,.35,1), transform 1s cubic-bezier(.65,0,.35,1)`;
        card.style.position = 'absolute'; card.style.top = f + 'px';
        void card.offsetHeight;
        card.dataset.t = prev;
      });
    }
    addEventListener('scroll', sticky, { passive: true });
    addEventListener('resize', sticky);
    sticky();
  }

  /* ---------------- testimonial slider (Swiper fade 700, random edge tags) ---------------- */
  function initTesti() {
    const el = $('.swiper-testi');
    if (!el || !window.Swiper) return;
    const rnd = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    function place() {
      $$('.swiper-slide', el).forEach((s, si) => {
        const img = $('.t-img', s); if (!img) return;
        const W = img.offsetWidth, H = img.offsetHeight; if (!W || !H) return;
        const r = img.getBoundingClientRect();
        const R = rnd(si * 7 + 3);
        const sides = ['top', 'right', 'bottom', 'left'];
        for (let i = sides.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [sides[i], sides[j]] = [sides[j], sides[i]]; }
        $$('.t-tag', s).forEach((t, i) => {
          const w = t.offsetWidth, h = t.offsetHeight, side = sides[i % 4], d = .25 + .5 * R();
          let y = 0, x = 0;
          if (side === 'top') { y = -h / 2; x = d * (W - w); }
          else if (side === 'right') { y = d * (H - h); x = W - w / 2; }
          else if (side === 'bottom') { y = H - h / 2; x = d * (W - w); }
          else { y = d * (H - h); x = -w / 2; }
          if (innerWidth < 1024) { const minX = -r.left + 8, maxX = innerWidth - r.left - w - 8; x = Math.max(minX, Math.min(x, maxX)); }
          t.style.top = y + 'px'; t.style.left = x + 'px';
        });
      });
    }
    function tags(sw) {
      sw.slides.forEach((s, i) => {
        const col = s.dataset.color || '#fff';
        $$('.t-tag', s).forEach((t, k) => {
          $('.sdot', t).style.background = col;
          if (i === sw.activeIndex) { t.classList.add('is-hidden'); setTimeout(() => t.classList.remove('is-hidden'), RM ? 0 : 300 + 150 * k); }
          else t.classList.add('is-hidden');
        });
      });
    }
    const sw = new Swiper(el, {
      slidesPerView: 1, effect: 'fade', fadeEffect: { crossFade: true }, speed: RM ? 0 : 700,
      observer: true, observeParents: true, mousewheel: { enabled: false },
      navigation: { nextEl: $$('.btn-nav--next', el), prevEl: $$('.btn-nav--prev', el) },
      on: { init() { place(); tags(this); }, resize() { place(); }, slideChange() { tags(this); } }
    });
    addEventListener('load', place, { once: true });
    setTimeout(place, 600);
  }

  /* ---------------- counters (digit roll + count-up) ---------------- */
  const counters = $$('.counter').map((el, idx) => {
    const pre = el.dataset.prefix || '', val = parseFloat(el.dataset.value) || 0, suf = el.dataset.suffix || '';
    const digits = String(Math.floor(val)).length;
    const mk = (c, k) => `<span class="ch" style="rotate:${5 * (k + 1)}deg;transition-delay:${120 * idx + 100 * k}ms,${120 * idx + 100 * k}ms">${c === ' ' ? ' ' : c}</span>`;
    let k = 0, html = '';
    for (const c of pre) html += mk(c, k++);
    const numStart = k;
    for (let i = 0; i < digits; i++) html += mk(RM ? String(Math.floor(val)).padStart(digits, '0')[i] : '0', k++);
    for (const c of suf) html += mk(c, k++);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = html;
    const chars = $$('.ch', el).slice(numStart, numStart + digits);
    if (!RM) el.classList.add('ready');
    return { el, val, digits, chars, idx, done: RM };
  });
  function runCounter(c) {
    c.done = true; c.el.classList.add('go');
    const start = performance.now() + 120 * c.idx, dur = 1000;
    const step = now => {
      const p = clamp((now - start) / dur);
      const s = String(Math.floor(c.val * p)).padStart(c.digits, '0');
      c.chars.forEach((ch, i) => { ch.textContent = s[i]; });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------- community status tags (blur-in stagger) ---------------- */
  const commMedia = $('.comm__media');
  const commTags = commMedia ? $$('.status-tag', commMedia) : [];
  let commDone = RM;
  if (!RM) commTags.forEach((t, i) => { t.classList.add('st-pre'); t.style.transitionDelay = `${i * 150}ms`; });

  /* ---------------- CTA cards mobile reveal ---------------- */
  const cards = $$('.cta-card');
  const cardIO = new IntersectionObserver(es => es.forEach(en => {
    if (isLG()) return;
    if (en.isIntersecting) en.target.classList.add('in');
    else if (en.boundingClientRect.top > 0) en.target.classList.remove('in');
  }), { threshold: .2 });
  function setupCards() {
    cards.forEach(c => {
      if (!isLG() && !RM) { c.classList.add('rev'); cardIO.observe(c); }
      else { c.classList.remove('rev', 'in'); cardIO.unobserve(c); }
    });
  }
  setupCards(); addEventListener('resize', setupCards);

  /* ---------------- scroll-synced frame loop (anime ScrollObserver equivalents) ---------------- */
  const blobs = $$('.sec-blob'), preBlob = $('.pre-blob'), ctaWrap = $('.cta-cards');
  const lerpState = new WeakMap();
  const smooth = (key, target, k) => { const cur = lerpState.has(key) ? lerpState.get(key) : target; const n = Math.abs(target - cur) < .0005 ? target : cur + (target - cur) * k; lerpState.set(key, n); return n; };
  function frame() {
    const vh = innerHeight, lg = isLG();
    if (!RM) {
      // section gradient blobs: target centre from viewport bottom → viewport centre (desktop)
      blobs.forEach(b => {
        if (!lg) return;
        const r = b.getBoundingClientRect();
        const p = smooth(b, clamp((vh - (r.top + r.height / 2)) / (vh * .5)), .1), e = ease3(p);
        b.style.opacity = (.6 * e).toFixed(3);
        b.style.transform = `scale(${(.5 + e).toFixed(4)}) rotate(${(15 - 30 * e).toFixed(3)}deg)`;
      });
      // CTA cards stagger (desktop): enter 100% 50% → leave 75% 50%
      if (ctaWrap) {
        if (lg) {
          const r = ctaWrap.getBoundingClientRect();
          const p = smooth(ctaWrap, clamp((vh - (r.top + r.height / 2)) / (vh * .25)), .1), e = ease3(p);
          cards.forEach((c, i) => { c.style.transform = `translateY(${((1 - e) * 150 * i).toFixed(2)}px)`; });
        } else cards.forEach(c => { c.style.transform = ''; });
      }
      // pre-footer blob: enter 100% 20% → leave 100% 100%
      if (preBlob) {
        const r = preBlob.parentElement.getBoundingClientRect();
        const p = smooth(preBlob, clamp((vh - (r.top + r.height * .2)) / (r.height * .8)), .2), e = ease2(p);
        preBlob.style.opacity = e.toFixed(3);
        preBlob.style.transform = `translateX(${(-30 + 45 * e).toFixed(2)}%) scale(${(2.5 - .5 * e).toFixed(4)})`;
      }
      // community tags: enter 80% 50%
      if (!commDone && commMedia) {
        const r = commMedia.getBoundingClientRect();
        if (r.top + r.height / 2 <= vh * .8) { commDone = true; commTags.forEach(t => t.classList.add('in')); }
      }
      // counters: enter 100% 80%
      counters.forEach(c => { if (c.done) return; const r = c.el.getBoundingClientRect(); if (r.top + r.height * .8 <= vh) runCounter(c); });
    }
    requestAnimationFrame(frame);
  }

  function boot() { initPrograms(); initTesti(); requestAnimationFrame(frame); }
  if (window.Swiper) boot();
  else addEventListener('load', boot, { once: true });
})();
