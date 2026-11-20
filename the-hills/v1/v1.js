(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const A = '../assets/';

  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- pencil banner ---------- */
  $('.pencil__x').addEventListener('click', () => $('#pencil').classList.add('is-gone'));

  /* ---------- focus trap helper ---------- */
  const focusables = el => $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', el).filter(e => !e.hidden && e.offsetParent !== null);
  function trap(el, e) {
    if (e.key !== 'Tab') return;
    const f = focusables(el); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- drawer ---------- */
  const drawer = $('#drawer'), burger = $('#burger');
  let drawerReturn = null;
  function openDrawer() {
    drawerReturn = document.activeElement;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('is-locked');
    setTimeout(() => $('.drawer__close', drawer).focus(), 60);
  }
  function closeDrawer(restore = true) {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('is-locked');
    if (restore && drawerReturn) drawerReturn.focus();
  }
  burger.addEventListener('click', () => drawer.classList.contains('is-open') ? closeDrawer() : openDrawer());
  $$('[data-close-drawer]', drawer).forEach(b => b.addEventListener('click', () => closeDrawer()));
  $$('.drawer__nav a', drawer).forEach(a => a.addEventListener('click', () => closeDrawer(false)));
  drawer.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); trap($('.drawer__panel', drawer), e); });

  /* ---------- modal ---------- */
  const modal = $('#modal'), mForm = $('#mForm'), mDone = $('#mDone');
  let modalReturn = null;
  function openModal(opts = {}) {
    closeDrawer(false);
    modalReturn = document.activeElement;
    mForm.hidden = false; mDone.hidden = true; $('#mErr').textContent = '';
    if (opts.unit !== undefined) $('#fUnit').value = opts.unit;
    if (opts.cita) $$('input[name=cita]', mForm).forEach(r => { r.checked = r.value === opts.cita; });
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => $('#fTel').focus(), 80);
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (modalReturn && document.contains(modalReturn)) modalReturn.focus();
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal({ unit: t.dataset.unit, cita: t.dataset.cita }); }
  });
  $$('[data-close-modal]', modal).forEach(b => b.addEventListener('click', closeModal));
  modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); trap($('.modal__box', modal), e); });
  mForm.addEventListener('submit', e => {
    e.preventDefault();
    const tel = $('#fTel'), mail = $('#fMail'), name = $('#fName');
    const bad = [];
    [tel, mail, name].forEach(i => i.removeAttribute('aria-invalid'));
    if (tel.value.replace(/\D/g, '').length < 8) bad.push([tel, 'Escribe un teléfono o WhatsApp válido.']);
    if (!/^\S+@\S+\.\S+$/.test(mail.value.trim())) bad.push([mail, 'Escribe un correo válido.']);
    if (name.value.trim().length < 2) bad.push([name, 'Escribe tu nombre.']);
    if (bad.length) { bad.forEach(([i]) => i.setAttribute('aria-invalid', 'true')); $('#mErr').textContent = bad[0][1]; bad[0][0].focus(); return; }
    const cita = $('input[name=cita]:checked', mForm).value;
    const unit = $('#fUnit').value;
    $('#mDoneName').textContent = name.value.trim().split(' ')[0];
    $('#mDoneMsg').textContent = `Recibimos tu solicitud${unit ? ' por ' + unit : ''}. Te contactaremos pronto para coordinar tu cita ${cita === 'Zoom' ? 'por Zoom' : 'presencial'}.`;
    mForm.hidden = true; mDone.hidden = false; mDone.focus();
    mForm.reset();
  });

  /* ---------- newsletter (success state only) ---------- */
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = $('#newsEmail'), ok = $('#newsOk');
    if (!/^\S+@\S+\.\S+$/.test(i.value.trim())) { i.setAttribute('aria-invalid', 'true'); ok.textContent = 'Escribe un correo válido.'; i.focus(); return; }
    i.removeAttribute('aria-invalid'); ok.textContent = '¡Listo! Te escribiremos con novedades de preventa.'; i.value = '';
  });

  /* ---------- lazy video helper: load when near, play only when visible ---------- */
  const vids = new Set();
  const vio = new IntersectionObserver(es => es.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
      if (!reduced() && v.dataset.auto !== 'off') v.play().catch(() => {});
    } else v.pause();
  }), { rootMargin: '150px 0px' });
  const watchVideo = v => { vids.add(v); vio.observe(v); };

  /* ---------- hero crossfade sequence a → f → g → k ---------- */
  const hv = $$('.hero__v');
  let hi = 0, heroVisible = true;
  hv.forEach((v, i) => { v.loop = false; if (i === 0) { v.src = v.dataset.src; } });
  function heroPlay(v) { if (reduced() || !heroVisible) return; if (!v.src) v.src = v.dataset.src; v.currentTime = 0; v.play().catch(() => {}); }
  hv.forEach((v, i) => v.addEventListener('ended', () => {
    if (i !== hi) return;
    const n = (hi + 1) % hv.length; const nv = hv[n];
    if (!nv.src) nv.src = nv.dataset.src;
    heroPlay(nv); nv.classList.add('is-on'); v.classList.remove('is-on'); hi = n;
    const nn = hv[(n + 1) % hv.length]; if (!nn.src) { nn.preload = 'auto'; nn.src = nn.dataset.src; }
  }));
  new IntersectionObserver(([en]) => {
    heroVisible = en.isIntersecting;
    if (heroVisible) heroPlay(hv[hi]); else hv.forEach(v => v.pause());
  }).observe($('.hero'));
  if (!hv[1].src) setTimeout(() => { hv[1].preload = 'auto'; hv[1].src = hv[1].dataset.src; }, 1500);

  /* ---------- How it works: mobile carousel + progress (.52s) ---------- */
  const howTrack = $('#howTrack'), howFill = $('#howFill');
  let howI = 0;
  const mq = matchMedia('(max-width: 1023px)');
  function howGo(i) {
    const n = howTrack.children.length; howI = Math.max(0, Math.min(n - 1, i));
    if (!mq.matches) { howTrack.style.transform = ''; return; }
    const step = howTrack.children[0].getBoundingClientRect().width + 16;
    howTrack.style.transform = `translateX(${-howI * step}px)`;
    howFill.style.left = (howI / n * 100) + '%'; howFill.style.width = (100 / n) + '%';
  }
  swipe(howTrack, d => howGo(howI + d));
  mq.addEventListener('change', () => howGo(0));

  function swipe(el, cb) {
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) cb(dx < 0 ? 1 : -1); x0 = null;
    });
  }

  /* ---------- ELIGE TU HOGAR ---------- */
  const UNITS = [
    { key: 'Sonne', mean: 'Sonne significa “sol”', hab: '1 habitación', m2: '75 m²', extra: null, price: 'US$168,000',
      desc: 'Una habitación, sala y cocina integradas, y ventanales de piso a techo. Ideal para empezar en grande.',
      plan: 'plans/sonne.webp', w: 1000, h: 897, film: false,
      spots: [['Sala', 27, 47], ['Cocina', 50, 19], ['Habitación', 58, 72]],
      gal: [['units/1h-sala.jpg', 'Sala'], ['units/1h-cocina.jpg', 'Cocina'], ['units/1h-hab.jpg', 'Habitación']] },
    { key: 'Mond', mean: 'Mond significa “luna”', hab: '2 habitaciones', m2: '119 m²', extra: null, price: 'US$246,000',
      desc: 'Dos habitaciones y un área social abierta para recibir, trabajar o simplemente estar.',
      plan: 'plans/mond.webp', w: 1000, h: 820, film: false,
      spots: [['Sala', 20, 44], ['Cocina', 38, 17], ['Habitación', 41, 56], ['Habitación', 64, 72]],
      gal: [['units/2h-sala.jpg', 'Sala'], ['units/2h-cocina.jpg', 'Cocina'], ['units/2h-hab.jpg', 'Habitación']] },
    { key: 'Aura', mean: 'Dos habitaciones con balcón', hab: '2 habitaciones', m2: '119 m²', extra: 'Balcón', price: 'US$273,000',
      desc: 'Dos habitaciones y un balcón para tus mañanas al aire libre, con la ciudad de fondo.',
      plan: 'plans/erker.webp', w: 1000, h: 873, film: false,
      spots: [['Sala', 23, 40], ['Cocina', 40, 19], ['Balcón', 27, 66], ['Habitación', 42, 55], ['Habitación', 64, 71]],
      gal: [['units/2hb-sala.jpg', 'Sala'], ['units/2hb-cocina.jpg', 'Cocina'], ['units/2hb-hab.jpg', 'Habitación'], ['units/2hb-hab2.jpg', 'Habitación 2']] },
    { key: 'Stern', mean: 'Stern significa “estrella”', hab: '3 habitaciones', m2: '156 m²', extra: null, price: 'US$398,000',
      desc: 'Tres habitaciones y la mayor área de las cuatro tipologías: espacio para toda la familia.',
      plan: 'v1/img/stern-clean.jpg', w: 1080, h: 830, film: true,
      spots: [['Sala', 30, 70], ['Cocina', 31, 31], ['Habitación', 55, 54], ['Habitación', 84, 38]],
      gal: [['units/3h-sala.jpg', 'Sala'], ['units/3h-cocina.jpg', 'Cocina'], ['units/3h-hab.jpg', 'Habitación']] },
  ];
  const src = p => p.startsWith('v1/') ? p.slice(3) : A + p;
  // preload unit assets after idle
  const preload = () => UNITS.forEach(u => { new Image().src = src(u.plan); u.gal.forEach(g => { new Image().src = A + g[0]; }); });
  setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(preload) : preload()), 2500);

  const tabs = $$('.utab'), ink = $('.units__ink'), stage = $('#ustage'), plan = $('#uPlan'), planImg = $('#uPlanImg'), spots = $('#uSpots'), info = $('.uinfo');
  let cur = -1, galI = 0, swapT = null;
  function renderGallery(u) {
    const main = $('#uGalMain'), th = $('#uGalThumbs');
    main.innerHTML = u.gal.map((g, i) => `<img src="${A + g[0]}" alt="${u.key}: ${g[1].toLowerCase()} (render)" width="1000" height="500" ${i ? 'loading="lazy"' : ''} class="${i === 0 ? 'is-on' : ''}">`).join('') + `<figcaption id="uCap">${u.gal[0][1]}</figcaption>`;
    th.innerHTML = u.gal.map((g, i) => `<button type="button" aria-pressed="${i === 0}" aria-label="Ver ${g[1].toLowerCase()}"><img src="${A + g[0]}" alt="" width="1000" height="500" loading="lazy"></button>`).join('');
    galI = 0;
    $$('button', th).forEach((b, i) => b.addEventListener('click', () => galGo(i)));
  }
  function galGo(i) {
    const imgs = $$('#uGalMain img'), bs = $$('#uGalThumbs button'); galI = (i + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === galI));
    bs.forEach((b, k) => b.setAttribute('aria-pressed', k === galI));
    $('#uCap').textContent = UNITS[cur].gal[galI][1];
  }
  swipe($('#uGalMain'), d => galGo(galI + d));
  function setUnit(i, focusTab = false) {
    i = (i + UNITS.length) % UNITS.length; if (i === cur) return;
    const first = cur === -1; cur = i; const u = UNITS[i];
    tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    if (focusTab) tabs[i].focus();
    $('#unitPanel').setAttribute('aria-labelledby', tabs[i].id);
    ink.style.transform = `translateX(${i * 100}%)`;
    if (mq.matches) tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced() ? 'auto' : 'smooth' });
    const apply = () => {
      stage.classList.toggle('is-film', u.film);
      planImg.src = src(u.plan); planImg.width = u.w; planImg.height = u.h; planImg.alt = `Plano 3D del apartamento ${u.key}`;
      $('#uGhost').textContent = u.key;
      spots.innerHTML = u.spots.map(([l, x, y], k) => `<button type="button" class="spot" style="left:${x}%;top:${y}%;animation-delay:${600 + k * 90}ms" aria-label="${l}"><i></i><b>${l}</b></button>`).join('');
      $('#uIdx').textContent = String(i + 1).padStart(2, '0');
      $('#uKicker').textContent = `Tipología 0${i + 1} · ${u.mean}`;
      $('#uName').textContent = u.key;
      $('#uDesc').textContent = u.desc;
      $('#uChips').innerHTML = [u.hab, u.m2, u.extra, 'Preventa'].filter(Boolean).map(c => `<li>${c}</li>`).join('');
      $('#uPrice').textContent = u.price;
      renderGallery(u);
      plan.classList.remove('is-out'); void plan.offsetWidth; plan.classList.add('is-in');
      info.classList.remove('is-swap');
      // peek the first label briefly so users discover hotspots
      if (!reduced()) setTimeout(() => { const s = $('.spot', spots); if (s) { s.classList.add('is-peek'); setTimeout(() => s.classList.remove('is-peek'), 1600); } }, 1300);
    };
    clearTimeout(swapT);
    if (first || reduced()) apply();
    else { plan.classList.remove('is-in'); plan.classList.add('is-out'); info.classList.add('is-swap'); swapT = setTimeout(apply, 320); }
  }
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => setUnit(k));
    t.addEventListener('keydown', e => {
      const map = { ArrowRight: 1, ArrowLeft: -1, Home: -cur, End: UNITS.length - 1 - cur };
      if (e.key in map) { e.preventDefault(); setUnit(cur + map[e.key], true); }
    });
  });
  $('#uPrev').addEventListener('click', () => setUnit(cur - 1));
  $('#uNext').addEventListener('click', () => setUnit(cur + 1));
  swipe(stage, d => setUnit(cur + d));
  $('#uWant').addEventListener('click', () => openModal({ unit: UNITS[cur].key }));
  $('#uZoom').addEventListener('click', () => openModal({ unit: UNITS[cur].key, cita: 'Zoom' }));
  $$('[data-goto]').forEach(a => a.addEventListener('click', () => setUnit(+a.dataset.goto)));
  setUnit(0);
  // entrance when section first scrolls in
  plan.classList.remove('is-in');
  new IntersectionObserver(([en], o) => { if (en.isIntersecting) { plan.classList.add('is-in'); o.disconnect(); } }, { threshold: .3 }).observe(stage);

  const AM = [
    ['Piscina', 'Vista a las montañas', 'Nada al aire libre con las montañas de fondo.', 'v', 'f-pool-mountains'],
    ['Rooftop', 'Lounge y pérgola', 'Un rooftop para reunirte al caer la tarde.', 'v', 'j-pergola'],
    ['Área BBQ', 'Parrilla con vista', 'Comparte una parrillada con la ciudad de fondo.', 'i', 'img/bbq.jpg'],
    ['Gimnasio', 'Entrena en casa', 'Un gimnasio equipado dentro del condominio.', 'i', 'img/gym.jpg'],
    ['Coworking', 'Trabaja sin salir', 'Coworking para tus días de trabajo remoto.', 'i', 'img/coworking-2.jpg'],
    ['Salas de reuniones', 'Reuniones en casa', 'Salas para recibir clientes o a tu equipo.', 'i', 'img/meeting.jpg'],
    ['Área infantil', 'Para los más pequeños', 'Juegos al aire libre para los niños de la casa.', 'i', 'img/kids.jpg'],
    ['Jardines', 'Verde todos los días', 'Jardines y zonas verdes para caminar y descansar.', 'v', 'i-garden'],
    ['Lobby', 'Una llegada a la altura', 'Un lobby de bienvenida para ti y tus visitas.', 'i', 'img/lobby.jpg'],
  ];
  const track = $('#cardsTrack');
  const cardHTML = ([sup, t, p, kind, s], clone) => `<article class="hcard"${clone ? ' aria-hidden="true"' : ''}>
    <div class="hcard__img">${kind === 'v'
      ? `<video muted loop playsinline preload="none" poster="video/${s}.jpg" data-src="video/${s}.mp4" aria-hidden="true"></video>`
      : `<img src="${A + s}" alt="${clone ? '' : t + ' — ' + sup}" loading="lazy" width="484" height="613">`}</div>
    <p class="hcard__sup">${sup}</p><h3 class="hcard__t">${t}</h3><p class="hcard__p">${p}</p></article>`;
  track.innerHTML = AM.map(a => cardHTML(a, true)).join('') + AM.map(a => cardHTML(a, false)).join('') + AM.map(a => cardHTML(a, true)).join('');
  $$('video', track).forEach(watchVideo);
  const N = AM.length; let ci = N; // index of centered card (middle set)
  const cw = () => track.children[0].getBoundingClientRect().width + 12;
  function cPos(anim) {
    track.classList.toggle('is-anim', anim && !reduced());
    const W = track.parentElement.clientWidth, x = W / 2 - (cw() - 12) / 2 - ci * cw();
    track.style.transform = `translateX(${x}px)`;
    $$('.hcard', track).forEach((c, k) => { const own = k >= N && k < 2 * N; c.setAttribute('aria-hidden', own && Math.abs(k - ci) <= 1 ? 'false' : 'true'); });
  }
  let busy = false;
  function cGo(d) {
    if (busy) return; busy = true; ci += d; cPos(true);
    setTimeout(() => { if (ci < N) ci += N; else if (ci >= 2 * N) ci -= N; cPos(false); busy = false; }, reduced() ? 20 : 620);
  }
  $('#cPrev').addEventListener('click', () => cGo(-1));
  $('#cNext').addEventListener('click', () => cGo(1));
  swipe(track, d => cGo(d));
  addEventListener('resize', () => { cPos(false); howGo(howI); });
  cPos(false);

  const STORIES = [
    ['Don’t play the game. Own it.', 'The Cage · cancha de baloncesto'],
    ['Only Pets: un parque para quienes también son familia.', 'Only Pets · parque para mascotas'],
    ['Tu juego corto, a unos pasos de tu puerta.', 'The Hills Masters · minigolf'],
    ['Cuando cae la noche, empieza la hora tranquila.', 'The Quiet Hour · speakeasy'],
  ];
  const sec = $('#firmas'), slides = $$('.stories__slide'), thumbs = $$('.sthumb');
  let si = 0, sTimer = null, sVisible = false;
  function sGo(i, user) {
    if (i === si) return; si = i;
    slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
    thumbs.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-pressed', k === i); });
    sec.classList.add('is-fading');
    setTimeout(() => { $('#sQ').textContent = STORIES[i][0]; $('#sName').textContent = STORIES[i][1]; sec.classList.remove('is-fading'); }, reduced() ? 0 : 300);
    if (user) sStart();
  }
  function sStart() { clearInterval(sTimer); if (!reduced() && sVisible) sTimer = setInterval(() => sGo((si + 1) % STORIES.length), 6000); }
  thumbs.forEach((t, k) => t.addEventListener('click', () => sGo(k, true)));
  new IntersectionObserver(([en]) => { sVisible = en.isIntersecting; if (sVisible) sStart(); else clearInterval(sTimer); }, { threshold: .35 }).observe(sec);
  sec.addEventListener('focusin', () => clearInterval(sTimer));

  /* ---------- location list stagger + LaHaus reveals ---------- */
  $$('#locList li').forEach((li, k) => li.style.setProperty('--i', k));
  const rio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); } }), { threshold: .18 });
  $$('.reveal, #locList').forEach(el => rio.observe(el));

  const VO = [
    { img: 'img/ig-3.jpg', src: 'El Observador CR · ago. 2026', q: '“El futuro de la vivienda y del desarrollo inmobiliario, por lo menos en el área metropolitana, debería ser vertical.”', by: 'Mario Salazar, director de proyecto, LETRU' },
    { img: 'img/aerial-hires.jpg', src: 'El Observador CR · titular', q: 'Tibás apuesta por la altura: proyecto de $50 millones levantará 184 apartamentos cerca del estadio Ricardo Saprissa.', by: 'El Observador CR, 18 de agosto de 2026' },
    { img: 'img/facade-2.jpg', src: 'Engel & Völkers Costa Rica', q: 'Su ficha presenta a The Hills como un condominio vertical exclusivo en el corazón de San Juan de Tibás.', by: 'Paráfrasis de la ficha del inmueble' },
    { img: 'img/pool-1.jpg', src: 'Muy pronto', q: 'Historias de nuestros primeros propietarios.', by: 'Estamos grabándolas', cta: true },
  ];
  const vTrack = $('#vTrack');
  const VN = VO.length, VSETS = 3;
  for (let s = 0; s < VSETS; s++) VO.forEach((v, k) => {
    const el = document.createElement('article'); el.className = 'vcard'; el.dataset.k = s * VN + k;
    el.innerHTML = `<img src="${A + v.img}" alt="" loading="lazy" width="320" height="450"><div class="vcard__in"><span class="vcard__src">${v.src}</span><p class="vcard__q">${v.q}</p><p class="vcard__by">${v.by}</p>${v.cta ? '<button class="btn vcard__cta" data-modal tabindex="-1">Agenda tu visita</button>' : ''}</div>`;
    vTrack.appendChild(el);
  });
  const vCards = $$('.vcard', vTrack);
  let vi = VN; // centered absolute index
  function vLayout() {
    const small = mq.matches;
    const offs = small ? [0, 214, 400] : [0, 310, 580, 850]; // Luuna: center 720 → near 415(290..540 →center 415 = -305) far 145
    vCards.forEach((c, k) => {
      let d = k - vi; // relative position
      const half = vCards.length / 2; if (d > half) d -= vCards.length; if (d < -half) d += vCards.length;
      const a = Math.abs(d), on = d === 0;
      c.classList.toggle('is-active', on);
      c.classList.toggle('is-hidden', a >= offs.length);
      const x = a >= offs.length ? Math.sign(d) * (offs[offs.length - 1] + 270) : Math.sign(d) * offs[a];
      c.style.transform = `translateX(${x}px)`;
      c.style.zIndex = 10 - a;
      c.setAttribute('aria-hidden', on ? 'false' : 'true');
      const b = $('button', c); if (b) b.tabIndex = on ? 0 : -1;
    });
  }
  function vGo(d) { vi = (vi + d + vCards.length) % vCards.length; vLayout(); }
  vCards.forEach((c, k) => c.addEventListener('click', e => {
    if (e.target.closest('[data-modal]')) return;
    let d = k - vi; const half = vCards.length / 2; if (d > half) d -= vCards.length; if (d < -half) d += vCards.length; if (d) vGo(d);
  }));
  $('#vPrev').addEventListener('click', () => vGo(-1));
  $('#vNext').addEventListener('click', () => vGo(1));
  swipe(vTrack, d => vGo(d));
  mq.addEventListener('change', vLayout);
  vLayout();

  /* ---------- footer accordions open on desktop ---------- */
  const syncFooter = () => $$('.ftr__col').forEach(d => { d.open = !mq.matches; });
  syncFooter(); mq.addEventListener('change', syncFooter);
  $$('.ftr__col summary').forEach(s => s.addEventListener('click', e => { if (mq.matches) return; e.preventDefault(); }));

  /* ---------- reduced motion live toggle ---------- */
  RM.addEventListener('change', () => { if (reduced()) { hv.forEach(v => v.pause()); vids.forEach(v => v.pause()); clearInterval(sTimer); } else { heroPlay(hv[hi]); sStart(); } });
})();
