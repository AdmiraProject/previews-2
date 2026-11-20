(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const hasGsap = !!window.gsap, hasScroll = hasGsap && !!window.ScrollTrigger;
  if (hasScroll) gsap.registerPlugin(ScrollTrigger);
  let paused = reduced.matches;
  const motionOn = () => !paused && !reduced.matches;
  const header = $('.header'), motionButton = $('.motion-toggle');

  /* ---------- Videos: play only on screen ---------- */
  const videoIO = new IntersectionObserver(entries => entries.forEach(e => {
    const v = e.target; v._vis = e.isIntersecting; syncVideo(v);
  }), { rootMargin: '120px' });
  function syncVideo(v) {
    const want = v._vis && !document.hidden && (motionOn() || v.classList.contains('hero__image') && !reduced.matches) && v.dataset.active !== 'false';
    if (want) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
  }
  $$('video').forEach(v => { v.muted = true; if (!v.closest('.entrance')) videoIO.observe(v); });
  const syncAllVideos = () => $$('video').forEach(v => !v.closest('.entrance') && syncVideo(v));

  /* ---------- Hero state ---------- */
  const heroState = { presence: 1, night: 0 };
  const nightVideo = $('.hero__image--night');
  function publishHero() {
    root.style.setProperty('--hero-presence', heroState.presence);
    root.style.setProperty('--hero-night', heroState.night);
    nightVideo.dataset.active = heroState.night > .02 ? 'true' : 'false'; syncVideo(nightVideo);
  }
  publishHero();

  let introTimeline, introActive = false, introSettled = !!window.thIntroExpired || reduced.matches, introSafety, introStarted = false;
  const entranceVideo = $('.entrance__video');
  function setIntroInert(v) { $$('header,main,footer,.motion-toggle').forEach(el => { el.inert = v; }); }
  function finishIntro() {
    const was = introActive; introSettled = true; introActive = false; clearTimeout(introSafety); introTimeline?.kill();
    root.classList.remove('intro-playing'); root.classList.add('intro-done'); setIntroInert(false); entranceVideo.pause();
    if (hasGsap) gsap.set(['.hero__content', '.header', '.hero__scroll'], { clearProps: 'opacity,visibility,transform' });
    if (was) { heroState.presence = 1; publishHero(); heroTimeline?.scrollTrigger?.refresh(); }
  }
  window.thFinishIntro = finishIntro;
  function startIntro(force = false) {
    if (!force && (introStarted || introSettled || window.thIntroExpired)) { if (!introActive) finishIntro(); return; }
    introStarted = true;
    if (!force && location.hash && location.hash !== '#inicio') { finishIntro(); requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' })); return; }
    if (!hasGsap || !motionOn()) { finishIntro(); return; }
    introActive = true; introSettled = false; introSafety = setTimeout(finishIntro, 4200);
    root.classList.remove('intro-done', 'intro-safe'); root.classList.add('intro-playing'); setIntroInert(true);
    entranceVideo.currentTime = 0; entranceVideo.play().catch(() => {});
    gsap.set('.entrance__surface', { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }); gsap.set('.entrance__light', { opacity: 0, xPercent: -100 }); gsap.set('.entrance__identity', { opacity: 1, y: 0 });
    heroState.presence = 0; publishHero(); gsap.set(['.hero__content', '.header', '.hero__scroll'], { opacity: 0 });
    introTimeline = gsap.timeline({ onComplete: () => { introActive = false; introSettled = true; clearTimeout(introSafety); setIntroInert(false); root.classList.remove('intro-playing'); root.classList.add('intro-done'); entranceVideo.pause(); } })
      .fromTo('.entrance__logo .brand-stroke', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
      .fromTo('.entrance__logo .brand-material', { opacity: 0 }, { opacity: 1, duration: .9 }, .3)
      .fromTo('.entrance__logo', { clipPath: 'inset(0 100% 0 0)', y: 12 }, { clipPath: 'inset(0 0% 0 0)', y: 0, duration: 1, ease: 'power3.out' }, .05)
      .fromTo('.entrance__caption', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, .55)
      .to('.entrance__light', { opacity: .8, xPercent: 150, duration: 2.1, ease: 'sine.inOut' }, .3)
      .to('.entrance__identity', { y: -18, opacity: 0, duration: .5 }, 1.9)
      .to('.entrance__surface', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.25, ease: 'power4.inOut' }, 2.05)
      .to('.entrance__light', { opacity: 0, duration: .3 }, 2.15)
      .to(heroState, { presence: 1, duration: 1.25, ease: 'power2.inOut', onUpdate: publishHero }, 2.1)
      .to('.header', { opacity: 1, duration: .7 }, 2.35)
      .fromTo('.hero__content', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 2.45)
      .to('.hero__scroll', { opacity: 1, duration: .5 }, 2.85);
  }
  $('.skip-intro').addEventListener('click', finishIntro);
  $('.skip-link').addEventListener('click', finishIntro);
  $('.replay').addEventListener('click', () => { finishIntro(); scrollTo({ top: 0, behavior: 'instant' }); heroTimeline?.progress(0); hasScroll && ScrollTrigger.update(); startIntro(true); $('.skip-intro').focus({ preventScroll: true }); });

  /* ---------- Header / menu ---------- */
  const menuButton = $('.menu-toggle'), menu = $('.mobile-menu');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menú'); updateHeader(); }
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); updateHeader(); if (open) menu.querySelector('a').focus(); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (introActive) finishIntro(); if (!menu.hidden) { closeMenu(); menuButton.focus(); } } });
  const heroEl = $('.hero'), deepSections = $$('.architecture-chapter,.essence,.outdoor,.footer');
  const navSections = $$('main>section[id],footer[id]');
  function updateHeader() {
    const solid = scrollY > heroEl.offsetHeight - 90 || !menu.hidden;
    header.classList.toggle('is-solid', solid);
    const deep = deepSections.some(s => { const b = s.getBoundingClientRect(); return b.top < 80 && b.bottom > 80; });
    header.classList.toggle('is-deep', solid && deep && menu.hidden);
    let active = ''; navSections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .35) active = s.id; });
    const map = { esencia: 'perspectiva', hogar: 'residencias', encuentros: 'amenidades', comprar: 'ubicacion', voces: 'ubicacion', espacios: 'ubicacion' };
    const navId = map[active] || active;
    $$('.nav a,.mobile-menu a').forEach(a => a.hash === '#' + navId || a.hash === '#' + active ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
    const p = Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight));
    root.style.setProperty('--page-progress', p);
    if (motionOn()) { root.style.setProperty('--atm-y', (-p * 60).toFixed(1) + 'px'); root.style.setProperty('--atm-x', ((p - .5) * 120).toFixed(1) + 'px'); }
  }
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { updateHeader(); ticking = false; }); }, { passive: true });

  /* ---------- Hero scroll timeline (scrub .65, identical positions) ---------- */
  let heroTimeline, revealTweens = [];
  function configureMotion() {
    heroTimeline?.scrollTrigger?.kill(); heroTimeline?.kill();
    if (hasGsap) gsap.set(['.hero__image-frame', '.hero__content', '.hero__scroll', '.hero__reframe'], { clearProps: 'all' });
    root.classList.toggle('motion-paused', paused || reduced.matches);
    if (!hasScroll || reduced.matches) { heroState.presence = 1; heroState.night = 0; publishHero(); return; }
    heroTimeline = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: paused ? true : .65, invalidateOnRefresh: true }, onUpdate: () => { const c = $('.hero__content'); c.inert = Number(gsap.getProperty(c, 'opacity')) < .08; } })
      .to('.hero__content', { y: -50, opacity: 0, ease: 'none', duration: .24 }, .15)
      .to('.hero__scroll', { opacity: 0, duration: .2 }, 0)
      .fromTo(heroState, { night: 0 }, { night: 1, duration: .39, ease: 'sine.inOut', onUpdate: publishHero }, .04)
      .fromTo(heroState, { presence: 1 }, { presence: 0, duration: .34, ease: 'sine.inOut', onUpdate: publishHero }, .66)
      .to('.hero__reframe', { opacity: 1, duration: .17 }, .82);
  }
  function configureReveals() {
    revealTweens.forEach(t => { t.scrollTrigger?.kill(); t.revert(); }); revealTweens = [];
    if (!hasScroll || !motionOn()) return;
    $$('.reveal').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .92) return; revealTweens.push(gsap.from(el, { opacity: 0, y: 32, duration: 1.25, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } })); });
    // Location list: rule lines draw by drive time
    const list = $('.location__list');
    revealTweens.push(gsap.from(list.querySelectorAll('li'), { opacity: 0, y: 18, duration: .8, ease: 'power2.out', stagger: .05, scrollTrigger: { trigger: list, start: 'top 85%', once: true } }));
    revealTweens.push(gsap.fromTo(list.querySelectorAll('i'), { '--grow': 0 }, { '--grow': 1, duration: 1.4, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: list, start: 'top 80%', once: true } }));
    const prima = $('.prima-card');
    revealTweens.push(gsap.fromTo(prima, { '--prima': 0 }, { '--prima': 1, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: prima, start: 'top 75%', once: true } }));
  }

  /* ---------- Photo viewer ---------- */
  const viewer = $('.photo-viewer'), viewerImg = $('.photo-viewer__image'); let viewerOrigin;
  function openViewer(src, alt, title, origin) {
    if (viewer.open) return; viewerOrigin = origin; viewerImg.src = src; viewerImg.alt = alt || ''; $('#viewer-title').textContent = title || 'Render de referencia';
    viewer.showModal(); root.classList.add('viewer-open'); onMotionChange();
  }
  $('.photo-viewer__close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer) { const b = viewer.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) viewer.close(); } });
  viewer.addEventListener('close', () => { root.classList.remove('viewer-open'); viewerOrigin?.focus({ preventScroll: true }); onMotionChange(); });
  $$('[data-viewer-src]').forEach(b => b.addEventListener('click', () => openViewer(b.dataset.viewerSrc, b.querySelector('img')?.alt, b.dataset.viewerTitle, b)));

  const journeys = [];
  $$('.photo-journey').forEach(section => {
    const panels = $$('.journey-panel', section), heading = $('[data-journey-title]', section), count = $('.journey-count', section);
    const prev = $('[data-journey-prev]', section), next = $('[data-journey-next]', section), open = $('.journey-open', section);
    const prog = $('.journey-progress', section); prog.innerHTML = panels.map(() => '<i></i>').join(''); const marks = $$('i', prog);
    let current = 0, requested = 0, request = 0, trigger, tween, visible = false;
    const pad = n => String(n).padStart(2, '0');
    function hydrate(i) { const img = panels[i]?.querySelector('img'); if (!img) return Promise.resolve(); img.loading = 'eager'; return img.decode().catch(() => {}); }
    function settle() { panels.forEach((p, i) => { p.classList.toggle('is-current', i === current); p.classList.remove('is-entering'); p.setAttribute('aria-hidden', String(i !== current)); if (hasGsap) gsap.set(p, { clearProps: 'opacity,visibility,clipPath' }); }); }
    function commit(i, serial) {
      if (serial !== request) return; current = i;
      heading.textContent = panels[i].dataset.title; count.textContent = `${pad(i + 1)} / ${pad(panels.length)}`;
      open.setAttribute('aria-label', `Ver imagen completa: ${heading.textContent}`);
      prev.disabled = i === 0; next.disabled = i === panels.length - 1;
      marks.forEach((m, n) => { m.classList.toggle('is-past', n < i); m.classList.toggle('is-current', n === i); });
      settle(); hydrate(i + 1);
    }
    async function show(i, manual = false) {
      i = clamp(i, 0, panels.length - 1);
      if (i === requested && tween?.isActive() || i === current && !tween?.isActive()) return;
      requested = i; const serial = ++request; tween?.kill(); settle();
      heading.parentElement.setAttribute('aria-live', manual ? 'polite' : 'off');
      await hydrate(i); if (serial !== request) return;
      if (!hasScroll || !motionOn() || !visible || root.classList.contains('viewer-open')) { commit(i, serial); return; }
      const target = panels[i]; target.classList.add('is-entering');
      const back = i < current;
      tween = gsap.fromTo(target, { opacity: .16, clipPath: back ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0%)', duration: .85, ease: 'power2.inOut', onComplete: () => commit(i, serial) });
    }
    const desiredAt = p => Math.min(panels.length - 1, Math.floor(clamp(p) * panels.length));
    function go(i) {
      const t = clamp(i, 0, panels.length - 1);
      if (trigger && section.classList.contains('journey-scroll')) scrollTo({ top: trigger.start + (trigger.end - trigger.start) * (t + .45) / panels.length, behavior: 'instant' });
      show(t, true);
    }
    prev.addEventListener('click', () => go(requested - 1)); next.addEventListener('click', () => go(requested + 1));
    section.addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return; e.preventDefault(); go(requested + (e.key === 'ArrowRight' ? 1 : -1)); });
    open.addEventListener('click', () => { const img = panels[current].querySelector('img'); openViewer(img.currentSrc || img.src, img.alt, panels[current].dataset.title, open); });
    function configure() {
      trigger?.kill(); trigger = null; tween?.kill(); request++; settle();
      const linear = reduced.matches || !hasScroll || matchMedia('(max-height: 480px)').matches;
      section.classList.toggle('journey-linear', linear); section.classList.toggle('journey-scroll', !linear); section.classList.add('journey-ready');
      if (linear) { panels.forEach((p, i) => { p.removeAttribute('aria-hidden'); hydrate(i); }); return; }
      const top = () => section.getBoundingClientRect().top + scrollY;
      trigger = ScrollTrigger.create({ trigger: section, start: top, end: () => top() + section.offsetHeight - innerHeight, onRefresh: s => show(desiredAt(s.progress)), onUpdate: s => { if (!root.classList.contains('viewer-open')) show(desiredAt(s.progress)); } });
    }
    new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) hydrate(requested + 1); }, { rootMargin: '400px' }).observe(section);
    commit(0, request); configure(); journeys.push(configure);
  });

  /* ---------- Perspectiva: photographic descent (cinema-tour) ---------- */
  const tour = [
    ['../assets/img/aerial-hires.jpg', 'La torre sobre San Juan de Tibás'], ['../assets/img/ig-1.jpg', 'Once pisos sobre tres sótanos'],
    ['../assets/img/ig-2.jpg', 'Fachada y acceso principal'], ['../assets/img/facade-2.jpg', 'Una fachada para la ciudad'],
    ['../assets/img/tower-03.jpg', 'Luz al final del día'], ['../assets/img/lobby.jpg', 'Lobby'],
    ['../assets/img/pool-floor1.jpg', 'Piscina entre jardines'], ['../assets/img/pool-3.jpg', 'Piscina con vista a las montañas'],
    ['../assets/img/rooftop-court.jpg', 'Cancha en el rooftop'], ['../assets/img/the-cage.jpg', 'The Cage'],
    ['../assets/img/dog-park.jpg', 'Only Pets'], ['../assets/img/kids.jpg', 'Área infantil'],
    ['../assets/img/gym.jpg', 'Gimnasio'], ['../assets/img/coworking-3.jpg', 'Coworking'],
    ['../assets/img/meeting.jpg', 'Salas de reuniones'], ['../assets/img/speakeasy-3.jpg', 'The Quiet Hour'],
    ['../assets/img/vista-05.jpg', 'The Hills de noche']
  ];
  (function cinema() {
    const chapter = $('.architecture-chapter'), depth = $('.architectural-depth', chapter), N = tour.length;
    depth.innerHTML = tour.map(([src, t], i) => `<figure class="tour-shot"><img src="${src}" alt="${t}" ${i > 1 ? 'loading="lazy"' : ''} decoding="async"></figure>`).join('');
    const shots = $$('.tour-shot', depth), count = $('.architecture-count', chapter), title = $('.architecture-photo-title', chapter);
    const prev = $('[data-tour-prev]', chapter), next = $('[data-tour-next]', chapter), openB = $('.architecture-open-photo', chapter);
    let idx = -1, st, raf = 0, phase = 0, drawn = -1;
    const P0 = .07, span = (1 - P0) / N;
    function sync(i) {
      if (i === idx) return; idx = i;
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${N}`; title.textContent = tour[i][1];
      prev.disabled = i === 0; next.disabled = i === N - 1; openB.setAttribute('aria-label', `Ampliar imagen ${i + 1} de ${N}: ${tour[i][1]}`);
      shots.slice(i, i + 3).forEach(s => { const img = s.querySelector('img'); img.loading = 'eager'; });
    }
    function draw() {
      raf = 0; if (phase === drawn) return; drawn = phase;
      const p = phase;
      chapter.style.setProperty('--expansion', smooth(0, .06, p).toFixed(4));
      chapter.style.setProperty('--copy', (1 - smooth(.02, .065, p)).toFixed(3));
      chapter.style.setProperty('--copy-y', `${(-smooth(0, .065, p) * 24).toFixed(2)}px`);
      const t = clamp((p - P0) / (1 - P0)) * N; const i = Math.min(N - 1, Math.floor(t)); const local = t - i;
      chapter.style.setProperty('--tour', ((i + clamp(local)) / N).toFixed(4));
      shots.forEach((s, n) => {
        let o = 0, z = 1.12, px = 0;
        if (n === i) { o = 1; z = 1.12 - .1 * local; px = (n % 2 ? -1 : 1) * local * 1.6; }
        else if (n === i + 1 && local > .72) { o = smooth(.72, 1, local); z = 1.16 - .04 * smooth(.72, 1, local); }
        else if (n === 0 && p < P0) { o = 1; z = 1.12; }
        if (s._o !== o) { s.style.opacity = o; s._o = o; }
        if (o > 0) { const img = s.firstChild; img.style.setProperty('--z', z.toFixed(4)); img.style.setProperty('--px', px.toFixed(2) + '%'); }
      });
      sync(local > .86 && i < N - 1 ? i + 1 : i);
    }
    function jump(i) { if (!st) { idx = -1; phase = P0 + span * (i + .3); drawn = -1; draw(); return; } scrollTo({ top: st.start + (st.end - st.start) * (P0 + span * (i + .35)), behavior: 'instant' }); }
    prev.addEventListener('click', () => jump(idx - 1)); next.addEventListener('click', () => jump(idx + 1));
    openB.addEventListener('click', () => openViewer(tour[idx][0], tour[idx][1], tour[idx][1], openB));
    $('.architecture-skip', chapter).addEventListener('click', () => { const d = chapter.nextElementSibling; d.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'instant', block: 'start' }); const h = d.querySelector('h2') || d; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); });
    function configure() {
      st?.kill(); st = null;
      const isStatic = !hasScroll || reduced.matches;
      chapter.classList.toggle('cinema-static', isStatic);
      if (isStatic) { phase = P0 + span * .3; drawn = -1; draw(); chapter.style.setProperty('--copy', 1); chapter.style.setProperty('--expansion', 1); return; }
      st = ScrollTrigger.create({ trigger: chapter, start: 'top top', end: 'bottom bottom', onUpdate: s => { phase = s.progress; if (!raf) raf = requestAnimationFrame(draw); }, onRefresh: s => { phase = s.progress; drawn = -1; draw(); } });
      phase = st.progress; drawn = -1; draw();
    }
    sync(0); configure(); journeys.push(configure);
  })();

  (function essence() {
    const host = $('#esencia'), frame = $('.essence-frame', host), panels = $$('[data-essence-panel]', host), buttons = $$('[data-essence-select]', host);
    const line = $('.essence-line', host), status = $('.essence-status', host);
    const lines = ['Montañas desde la piscina.', 'La terraza también es casa.', 'Tibás, encendida de noche.'];
    const compact = matchMedia('(max-height: 519px), (max-width: 700px) and (max-height: 619px)');
    let active = 0, desired = 0, anim = null, visible = false, raf = 0;
    const videos = panels.map(p => p.querySelector('video'));
    function settle(i, announce) {
      active = i; panels.forEach((p, n) => { p.style.opacity = n === i ? '1' : '0'; p.style.zIndex = n === i ? '1' : '0'; videos[n].dataset.active = String(n === i || !host.classList.contains('essence-scroll')); syncVideo(videos[n]); });
      buttons.forEach((b, n) => b.setAttribute('aria-pressed', String(n === i))); line.textContent = lines[i];
      if (announce) status.textContent = `${buttons[i].dataset.title}. ${lines[i]}`;
    }
    function select(i, announce = false) {
      if (i === desired && !announce) return; desired = i; anim?.cancel(); anim = null;
      if (i === active) { settle(i, announce); return; }
      if (!motionOn() || !visible || !host.classList.contains('essence-scroll')) { settle(i, announce); return; }
      const inc = panels[i]; inc.style.zIndex = '2'; videos[i].dataset.active = 'true'; syncVideo(videos[i]);
      anim = inc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'forwards' });
      anim.finished.then(() => { settle(i, announce); anim?.cancel(); anim = null; }).catch(() => {});
    }
    function geometry() { const box = host.getBoundingClientRect(), top = parseFloat(getComputedStyle(frame).top) || 0; const dist = Math.max(1, box.height - frame.getBoundingClientRect().height); return { top: box.top + scrollY - top, dist, progress: clamp((top - box.top) / dist) }; }
    function paint() { raf = 0; if (!visible || !host.classList.contains('essence-scroll')) return; const { progress } = geometry(); host.style.setProperty('--essence-progress', progress.toFixed(4)); select(Math.min(panels.length - 1, Math.floor(progress * panels.length))); if (motionOn()) host.style.setProperty('--essence-light', `${((progress - .5) * 48).toFixed(2)}px`); }
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    function navigate(i) {
      if (!host.classList.contains('essence-scroll')) { select(i, true); return; }
      const { top, dist } = geometry(); scrollTo({ top: Math.max(0, top + dist * (i + .5) / panels.length), behavior: motionOn() ? 'smooth' : 'instant' }); if (!motionOn()) select(i, true);
    }
    buttons.forEach((b, i) => { b.addEventListener('click', () => navigate(i)); b.addEventListener('keydown', e => { const n = e.key === 'ArrowRight' ? Math.min(buttons.length - 1, i + 1) : e.key === 'ArrowLeft' ? Math.max(0, i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : null; if (n === null) return; e.preventDefault(); buttons[n].focus({ preventScroll: true }); navigate(n); }); });
    addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue, { passive: true });
    new IntersectionObserver(e => { visible = e[0].isIntersecting; queue(); }, { rootMargin: '400px 0px' }).observe(host);
    function layout() { host.classList.toggle('essence-scroll', !compact.matches && !reduced.matches); host.classList.add('essence-ready'); settle(active); queue(); }
    compact.addEventListener('change', layout); journeys.push(layout); layout();
  })();

  /* ---------- 03 Elige tu hogar ---------- */
  const UNITS = {
    sonne: { name: 'Sonne', kicker: 'Sol, en alemán.', rooms: '1', roomsLabel: 'Habitación', area: 75, price: '168,000', plan: '../assets/plans/sonne.webp', w: 1000, h: 897, label: '01',
      alt: 'Vista 3D de la distribución Sonne: sala, cocina y una habitación.',
      spots: [['Sala', 25, 48], ['Cocina', 43, 26], ['Habitación', 55, 74]],
      shots: [['1h-sala', 'Sala'], ['1h-cocina', 'Cocina'], ['1h-hab', 'Habitación']] },
    mond: { name: 'Mond', kicker: 'Luna, en alemán.', rooms: '2', roomsLabel: 'Habitaciones', area: 119, price: '246,000', plan: '../assets/plans/mond.webp', w: 1000, h: 820, label: '02',
      alt: 'Vista 3D de la distribución Mond: sala, cocina y dos habitaciones.',
      spots: [['Sala', 17, 41], ['Cocina', 38, 24], ['Habitación', 42, 59], ['Habitación principal', 63, 75]],
      shots: [['2h-sala', 'Sala'], ['2h-cocina', 'Cocina'], ['2h-hab', 'Habitación']] },
    aura: { name: 'Aura', kicker: 'Dos habitaciones y balcón.', rooms: '2', roomsLabel: 'Hab. + balcón', area: 119, price: '273,000', plan: '../assets/plans/erker.webp', w: 1000, h: 873, label: '03',
      alt: 'Vista 3D de la distribución Aura: sala con balcón, cocina y dos habitaciones.',
      spots: [['Balcón', 10, 61], ['Sala', 22, 40], ['Cocina', 38, 19], ['Habitación', 43, 50], ['Habitación principal', 63, 69]],
      shots: [['2hb-sala', 'Sala'], ['2hb-cocina', 'Cocina'], ['2hb-hab', 'Habitación principal'], ['2hb-hab2', 'Habitación']] },
    stern: { name: 'Stern', kicker: 'Estrella, en alemán.', rooms: '3', roomsLabel: 'Habitaciones', area: 156, price: '398,000', plan: '../assets/plans/stern-film.jpg', w: 1080, h: 830, label: '04',
      alt: 'Vista 3D de la distribución Stern: sala, comedor, cocina y tres habitaciones.',
      spots: [['Balcón', 8, 52], ['Cocina', 32, 35], ['Sala', 32, 69], ['Habitación', 57, 56], ['Habitación principal', 85, 39]],
      shots: [['3h-sala', 'Sala'], ['3h-cocina', 'Cocina'], ['3h-hab', 'Habitación']] }
  };
  (function homes() {
    const tabs = $$('.homes__tabs [role=tab]'), ink = $('.homes__ink'), panel = $('#home-panel'), plan = $('.homes__plan'), planImg = $('.homes__plan-img');
    const spots = $('.homes__hotspots'), stage = $('.homes__plan-stage'), shotA = $('.homes__shot'), shotB = $('.homes__shot--in'), thumbs = $('.homes__thumbs');
    let unit = 'sonne', shot = 0, shotTween;
    function placeInk() { const t = tabs.find(t => t.dataset.unit === unit), r = t.getBoundingClientRect(), pr = t.parentElement.getBoundingClientRect(); ink.style.setProperty('--ink-x', (r.left - pr.left + t.parentElement.scrollLeft) + 'px'); ink.style.setProperty('--ink-w', r.width + 'px'); }
    function sizeSpots() { spots.style.width = planImg.clientWidth + 'px'; spots.style.height = planImg.clientHeight + 'px'; }
    function renderSpots(u) {
      spots.innerHTML = u.spots.map(([n, x, y]) => `<button type="button" style="left:${x}%;top:${y}%" aria-label="${n}"><span>${n}</span></button>`).join('');
      $$('button', spots).forEach(b => b.addEventListener('click', () => { const was = b.classList.contains('is-on'); $$('button', spots).forEach(x => x.classList.remove('is-on')); b.classList.toggle('is-on', !was); const k = u.shots.findIndex(s => b.textContent.startsWith(s[1].split(' ')[0])); if (k >= 0) setShot(k); }));
      sizeSpots();
    }
    function renderThumbs(u) {
      thumbs.innerHTML = u.shots.map(([f, t], i) => `<button type="button" aria-label="${t}" aria-current="${i === 0}"><img src="../assets/units/${f}.jpg" alt="" width="1000" height="500" loading="lazy" decoding="async"></button>`).join('');
      thumbs.style.gridTemplateColumns = `repeat(${Math.max(4, u.shots.length)},1fr)`;
      $$('button', thumbs).forEach((b, i) => b.addEventListener('click', () => setShot(i)));
    }
    async function setShot(i, instant = false) {
      const u = UNITS[unit]; i = (i + u.shots.length) % u.shots.length; shot = i;
      const [f, t] = u.shots[i], src = `../assets/units/${f}.jpg`;
      $('.homes__count').textContent = `${String(i + 1).padStart(2, '0')} / ${String(u.shots.length).padStart(2, '0')}`; $('.homes__shot-title').textContent = t;
      $$('button', thumbs).forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
      const alt = `${t} del apartamento ${u.name}.`;
      if (instant || !hasGsap || !motionOn()) { shotA.src = src; shotA.alt = alt; return; }
      shotTween?.kill(); shotB.src = src; try { await shotB.decode(); } catch {}
      if (shot !== i || unit !== u.name.toLowerCase()) return;
      shotB.style.visibility = 'visible';
      shotTween = gsap.fromTo(shotB, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: .72, ease: 'sine.inOut', onComplete: () => { shotA.src = src; shotA.alt = alt; gsap.set(shotB, { opacity: 0, visibility: 'hidden', clearProps: 'scale' }); } });
    }
    function setUnit(key, focus = false) {
      if (!UNITS[key]) return; const u = UNITS[key], changed = key !== unit; unit = key;
      tabs.forEach(t => { const on = t.dataset.unit === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus({ preventScroll: true }); if (on && changed) { const bar = t.parentElement; bar.scrollTo({ left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: motionOn() ? 'smooth' : 'instant' }); } });
      panel.setAttribute('aria-labelledby', 'tab-' + key); placeInk();
      plan.classList.toggle('is-stern', key === 'stern');
      $$('[data-unit-name]').forEach(e => e.textContent = u.name); $('[data-unit-kicker]').textContent = u.kicker;
      $('[data-plan-label]').textContent = `VISTA 3D / ${u.label}`;
      $('[data-spec-rooms]').textContent = u.rooms; $('[data-spec-rooms]').nextElementSibling.textContent = u.roomsLabel;
      $('[data-spec-area]').innerHTML = `${u.area} <small>m²</small>`; $('[data-spec-price]').innerHTML = `<small>US$</small>${u.price}<sup>*</sup>`;
      $('[data-unit-cta]').dataset.unitCta = u.name;
      renderThumbs(u); setShot(0, !changed);
      const swap = () => { planImg.src = u.plan; planImg.width = u.w; planImg.height = u.h; planImg.alt = u.alt; };
      if (!changed || !hasGsap || !motionOn()) { swap(); planImg.decode().catch(() => {}).then(() => renderSpots(u)); return; }
      const pre = new Image(); pre.src = u.plan;
      gsap.timeline()
        .to([planImg, spots], { opacity: 0, scale: .94, rotate: 3, y: -16, duration: .32, ease: 'power2.in' })
        .add(() => pre.decode().catch(() => {}).then(() => { swap(); requestAnimationFrame(() => { renderSpots(u); entrance(); }); }));
      gsap.fromTo('.homes__name,.homes__kicker', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .06, delay: .15 });
      gsap.fromTo('.homes__watermark', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out', delay: .1 });
      gsap.fromTo('.homes__specs>div', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7, ease: 'power2.out', stagger: .07, delay: .25 });
    }
    function entrance() {
      gsap.fromTo(planImg, { opacity: 0, scale: .82, rotate: -7, y: 50, filter: 'blur(6px) drop-shadow(0 10px 10px rgba(2,40,56,.1))' }, { opacity: 1, scale: 1, rotate: 0, y: 0, filter: unit === 'stern' ? 'blur(0px) drop-shadow(0 0 0 rgba(0,0,0,0))' : 'blur(0px) drop-shadow(0 34px 34px rgba(2,40,56,.22))', duration: 1.25, ease: 'expo.out', clearProps: 'filter' });
      gsap.fromTo(spots, { opacity: 0 }, { opacity: 1, scale: 1, rotate: 0, y: 0, duration: .5, delay: .7 });
      gsap.fromTo($$('button', spots), { scale: 0 }, { scale: 1, duration: .6, ease: 'back.out(2)', stagger: .08, delay: .75, clearProps: 'transform' });
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => setUnit(t.dataset.unit));
      t.addEventListener('keydown', e => { const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null; if (n === null) return; e.preventDefault(); setUnit(tabs[n].dataset.unit, true); });
    });
    $('[data-shot-prev]').addEventListener('click', () => setShot(shot - 1)); $('[data-shot-next]').addEventListener('click', () => setShot(shot + 1));
    $('.homes__plan-open').addEventListener('click', e => openViewer(planImg.src, planImg.alt, `Vista 3D · ${UNITS[unit].name}`, e.currentTarget));
    addEventListener('resize', () => { placeInk(); sizeSpots(); });
    planImg.addEventListener('load', sizeSpots); new ResizeObserver(sizeSpots).observe(planImg);
    setUnit('sonne'); renderSpots(UNITS.sonne); requestAnimationFrame(placeInk);
    if (hasScroll && motionOn()) ScrollTrigger.create({ trigger: plan, start: 'top 78%', once: true, onEnter: entrance });
  })();

  /* ---------- 06 Steps: LaHaus stacking cards ---------- */
  (function steps() {
    if (!hasScroll) return;
    const cards = $$('.step-card'); let tweens = [];
    function configure() {
      tweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); }); tweens = []; cards.forEach(c => gsap.set(c, { clearProps: 'transform' }));
      if (!motionOn()) return;
      cards.forEach((c, i) => { const nxt = cards[i + 1]; if (!nxt) return;
        tweens.push(gsap.to(c, { scale: .94, ease: 'none', scrollTrigger: { trigger: nxt, start: 'top bottom', end: () => `top ${parseFloat(getComputedStyle(nxt).top) + 10}px`, scrub: .5, invalidateOnRefresh: true } })); });
      cards.forEach(c => tweens.push(gsap.from(c.querySelectorAll('.step-tag,.step-timeline,.prima-card'), { opacity: 0, y: 24, scale: .9, duration: .8, ease: 'back.out(1.6)', stagger: .12, scrollTrigger: { trigger: c, start: 'top 70%', once: true } })));
    }
    configure(); journeys.push(configure);
  })();

  (function voices() {
    const cards = $$('.voice-card'), status = $('.voices__status'); let active = 0;
    function render(announce) {
      cards.forEach((c, i) => {
        let off = i - active; const n = cards.length; if (off > n / 2) off -= n; if (off < -n / 2) off += n;
        const a = Math.abs(off);
        c.style.setProperty('--off', off); c.style.setProperty('--s', a === 0 ? 1 : .78); c.style.setProperty('--o', a > 2 ? 0 : 1); c.style.setProperty('--zi', 10 - a);
        c.classList.toggle('is-active', a === 0); c.setAttribute('aria-hidden', String(a > 0)); c.inert = a > 0;
      });
      if (announce) status.textContent = `${active + 1} de ${cards.length}`;
    }
    const go = d => { active = (active + d + cards.length) % cards.length; render(true); };
    $('.prev-btn').addEventListener('click', () => go(-1)); $('.next-btn').addEventListener('click', () => go(1));
    cards.forEach((c, i) => c.addEventListener('click', e => { if (i !== active) { e.preventDefault(); active = i; render(true); } }));
    $('.voices__rail').addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
    let sx = null; const tr = $('.voices__track');
    tr.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
    tr.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1); sx = null; }, { passive: true });
    render();
  })();

  (function gallery() {
    const items = [
      ['aerial-hires', 'Vista aérea de la torre', 'tower'], ['ig-1', 'La torre en Tibás', 'tower'], ['ig-2', 'Acceso y fachada', 'tower'], ['ig-3', 'Fachada al atardecer', 'tower'], ['vista-05', 'The Hills de noche', 'tower'],
      ['pool-3', 'Piscina con vista a las montañas', 'outdoor'], ['pool-1', 'Deck y piscina', 'outdoor'], ['bbq', 'Pérgola y área BBQ', 'outdoor'], ['rooftop-court', 'Cancha en el rooftop', 'outdoor'], ['kids', 'Área infantil', 'outdoor'],
      ['the-cage', 'The Cage', 'amenities'], ['pets-6', 'Only Pets', 'amenities'], ['minigolf', 'The Hills Masters', 'amenities'], ['speakeasy-3', 'The Quiet Hour', 'amenities'], ['coworking-3', 'Coworking', 'amenities'], ['meeting', 'Salas de reuniones', 'amenities'], ['lobby', 'Lobby', 'amenities'],
      ['sala-1hab-v2', 'Sala con vista', 'interiors'], ['sala-1hab-v5', 'Sala y ventanal', 'interiors'], ['../units/3h-sala', 'Sala del apartamento Stern', 'interiors'], ['../units/2hb-sala', 'Sala del apartamento Aura', 'interiors']
    ].map(([f, t, c]) => ({ src: `../assets/img/${f}.jpg`, title: t, cat: c }));
    $('[data-gallery-total]').textContent = items.length;
    const g = $('.gallery'), img = $('#gallery-image'), inc = $('.gallery-incoming'), play = $('.gallery-play');
    let list = items, index = 0, auto = false, timer, hovered = false, visible = false, req = 0;
    const pad = n => String(n).padStart(2, '0');
    function commit(i) { index = i; const it = list[i]; img.src = it.src; img.alt = `${it.title}. Render de referencia de The Hills.`; $('#gallery-title').textContent = it.title; $('.gallery__count').textContent = `${pad(i + 1)} / ${pad(list.length)}`; }
    const canPlay = () => auto && motionOn() && !document.hidden && visible && !hovered && !viewer.open && !g.contains(document.activeElement);
    function schedule() { clearTimeout(timer); g.classList.remove('is-playing'); if (!canPlay()) return; void g.offsetWidth; g.classList.add('is-playing'); timer = setTimeout(() => change(1, false), 6500); }
    function updatePlay() { play.setAttribute('aria-pressed', String(auto)); play.setAttribute('aria-label', auto ? 'Pausar secuencia de imágenes' : 'Reproducir secuencia de imágenes'); play.firstElementChild.textContent = auto ? 'Ⅱ' : '▷'; }
    async function change(d, manual = true, abs = false) {
      if (manual) { auto = false; updatePlay(); } clearTimeout(timer); g.classList.remove('is-playing');
      const i = abs ? 0 : (index + d + list.length) % list.length, it = list[i], r = ++req;
      const pre = new Image(); pre.src = it.src; try { await pre.decode(); } catch {}
      if (r !== req) return;
      $('.gallery__title').setAttribute('aria-live', manual ? 'polite' : 'off');
      if (!hasGsap || !motionOn()) { commit(i); schedule(); return; }
      inc.src = it.src; inc.style.visibility = 'visible';
      gsap.fromTo(inc, { opacity: 0 }, { opacity: 1, duration: .72, ease: 'sine.inOut', onComplete: () => { if (r !== req) return; commit(i); gsap.set(inc, { opacity: 0, visibility: 'hidden' }); schedule(); } });
    }
    $$('[data-category]').forEach(b => b.addEventListener('click', () => { list = b.dataset.category === 'all' ? items : items.filter(x => x.cat === b.dataset.category); $$('[data-category]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); change(0, true, true); }));
    $('.gallery-prev').addEventListener('click', () => change(-1)); $('.gallery-next').addEventListener('click', () => change(1));
    play.addEventListener('click', () => { auto = !auto; updatePlay(); if (auto) { visible = true; schedule(); } else schedule(); });
    g.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); change(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); change(1); } });
    g.addEventListener('pointerenter', () => { hovered = true; schedule(); }); g.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    new IntersectionObserver(e => { visible = e[0].isIntersecting && e[0].intersectionRatio >= .6; schedule(); }, { threshold: .6 }).observe($('.gallery__stage'));
    $('.photo-open').addEventListener('click', e => openViewer(list[index].src, img.alt, list[index].title, e.currentTarget));
    let tx; img.parentElement.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    img.parentElement.addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 55) change(dx < 0 ? 1 : -1); tx = null; }, { passive: true });
    commit(0); updatePlay();
    window.addEventListener('th:motion', schedule);
  })();

  /* ---------- Contact modal ---------- */
  (function contact() {
    const modal = $('.contact-modal'), form = $('.contact-form', modal), ok = $('.contact-success', modal), err = $('.contact-form__error', modal); let origin;
    function open(e) {
      origin = e.currentTarget; form.hidden = false; ok.hidden = true; err.textContent = '';
      const u = origin.dataset.unitCta; const sel = form.unit; sel.selectedIndex = 0;
      if (u) [...sel.options].forEach((o, i) => { if (o.text.startsWith(u)) sel.selectedIndex = i; });
      modal.showModal(); root.classList.add('viewer-open'); requestAnimationFrame(() => form.phone.focus());
    }
    $$('[data-contact]').forEach(b => b.addEventListener('click', open));
    $('.contact-modal__close').addEventListener('click', () => modal.close());
    $('.contact-success__close').addEventListener('click', () => modal.close());
    modal.addEventListener('click', e => { if (e.target === modal) { const b = modal.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) modal.close(); } });
    modal.addEventListener('close', () => { root.classList.remove('viewer-open'); origin?.focus({ preventScroll: true }); });
    form.addEventListener('submit', e => {
      e.preventDefault(); err.textContent = '';
      const checks = [[form.phone, v => v.replace(/\D/g, '').length >= 8, 'Escribe un teléfono o WhatsApp válido.'], [form.email, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Escribe un correo válido.'], [form.name, v => v.trim().length >= 2, 'Escribe tu nombre.']];
      checks.forEach(([f]) => f.removeAttribute('aria-invalid'));
      const bad = checks.find(([f, t]) => !t(f.value));
      if (bad) { bad[0].setAttribute('aria-invalid', 'true'); err.textContent = bad[2]; bad[0].focus(); return; }
      $('[data-success-name]').textContent = `${form.name.value.trim().split(' ')[0]}.`;
      $('[data-success-mode]').textContent = form.mode.value === 'Zoom' ? 'por Zoom' : 'presencial';
      form.hidden = true; ok.hidden = false; ok.focus(); form.reset();
    });
  })();

  /* ---------- Motion toggle / global ---------- */
  function onMotionChange() { syncAllVideos(); window.dispatchEvent(new Event('th:motion')); }
  function updateMotionButton() { motionButton.setAttribute('aria-pressed', String(paused)); motionButton.setAttribute('aria-label', paused ? 'Activar animaciones' : 'Reducir animaciones'); $('.motion-icon').textContent = paused ? '▷' : 'Ⅱ'; }
  motionButton.addEventListener('click', () => {
    paused = !paused; root.classList.toggle('motion-paused', paused); updateMotionButton();
    const scrub = heroTimeline?.scrollTrigger?.getTween(); if (scrub) { scrub.duration(paused ? 0 : .65); if (paused) scrub.progress(1); }
    configureReveals(); journeys.forEach(f => f()); onMotionChange(); hasScroll && ScrollTrigger.refresh();
  });
  reduced.addEventListener('change', () => { paused = reduced.matches; if (introActive) finishIntro(); configureMotion(); configureReveals(); journeys.forEach(f => f()); onMotionChange(); hasScroll && ScrollTrigger.refresh(); });
  document.addEventListener('visibilitychange', onMotionChange);
  let rz, lastW = innerWidth; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (innerWidth > 1000) closeMenu(); if (Math.abs(innerWidth - lastW) > 2) { lastW = innerWidth; configureMotion(); } updateHeader(); }, 220); });

  updateMotionButton(); configureReveals(); configureMotion(); updateHeader();
  if (hasScroll) { ScrollTrigger.refresh(); document.fonts.ready.then(() => requestAnimationFrame(() => ScrollTrigger.refresh())); }
  const heroVideo = $('.hero__image:not(.hero__image--night)');
  Promise.race([new Promise(r => heroVideo.readyState >= 2 ? r() : heroVideo.addEventListener('loadeddata', r, { once: true })), new Promise(r => setTimeout(r, 900))]).then(() => startIntro());
})();
