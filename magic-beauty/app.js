(() => {
  const D = window.MB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth < 768;
  const V = document.body.dataset.hero;
  const waUrl = t => `https://wa.me/${D.wa}?text=${encodeURIComponent(t)}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const prod = id => D.products.find(p => p.id === id) || {};
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const sstore = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);

  const HOME = !!$('#page');
  if (HOME) window.renderSections($('#page')); else if ($('#foot')) window.renderFooter($('#foot'));

  /* ---------- scroll suave ---------- */
  const hasG = !!window.gsap; if (hasG) gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && hasG && window.Lenis) { lenis = new Lenis({ duration: 1.1 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  const goTo = (el, off = -60) => { el = typeof el === 'string' ? $(el) : el; if (!el) return; lenis ? lenis.scrollTo(el, { offset: off }) : scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: reduce ? 'auto' : 'smooth' }); };
  document.addEventListener('click', e => {
    const w = e.target.closest('[data-wa]'); if (w) { e.preventDefault(); waGate(w.dataset.wa); return; }
    const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
    const h = a.getAttribute('href'); if (h !== '#top' && !$(h)) { location.href = MBL.home + h; return; }
    e.preventDefault(); closeMenus(); goTo(h === '#top' ? document.body : h);
  });

  /* ---------- WhatsApp: capturar nombre, correo y teléfono antes de redirigir ---------- */
  const lead = () => store.get('mb-lead', null);
  const withLead = (msg, L) => `${msg}\n\nNombre: ${L.nombre}\nCorreo: ${L.email}\nTeléfono: ${L.tel}`;
  let pendingWa = '';
  function waGate(msg) {
    const L = lead(); if (L) { open(waUrl(withLead(msg, L)), '_blank', 'noopener'); return; }
    pendingWa = msg; const g = $('#lg'); g.hidden = false; lenis && lenis.stop(); setTimeout(() => $('#lgForm').nombre.focus(), 50);
  }
  const closeLg = () => { const g = $('#lg'); if (g.hidden) return; g.hidden = true; lenis && lenis.start(); };
  $('#lgX').onclick = closeLg; $('#lg').addEventListener('click', e => { if (e.target.id === 'lg') closeLg(); });
  $('#lgForm').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, m = $('.co-msg', f);
    const L = { nombre: f.nombre.value.trim(), email: f.email.value.trim(), tel: f.tel.value.replace(/\D/g, '') };
    $$('.co-f', f).forEach(x => x.classList.remove('err'));
    const bad = !L.nombre ? 'nombre' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(L.email) ? 'email' : L.tel.length < 10 ? 'tel' : !f.ok.checked ? 'ok' : '';
    if (bad) { f[bad].closest('.co-f, label').classList.add('err'); m.textContent = bad === 'ok' ? 'Acepta el aviso de privacidad para continuar.' : 'Revisa el campo marcado.'; f[bad].focus(); return; }
    store.set('mb-lead', L); m.textContent = 'Abriendo WhatsApp…';
    open(waUrl(withLead(pendingWa, L)), '_blank', 'noopener'); setTimeout(closeLg, 600);
  });

  /* ---------- nav ---------- */
  const nAll = window.MB_CAT ? window.MB_CAT.items.length : 74;
  $('#dd1').innerHTML = D.categories.slice(0, 4).map(c => `<a class="dd-i" href="${MBL.cat(c.cc)}"><img src="${MBU(`media/cat/${c.id}.webp`)}" alt="" loading="lazy"><b>${c.name}</b></a>`).join('') + `<a class="dd-all" href="${MBL.equipos}">Ver los ${nAll} equipos <span aria-hidden="true">→</span></a>`;
  $$('.dd').forEach(dd => {
    const b = $('button, .dd-t', dd);
    if (b.tagName === 'BUTTON') b.addEventListener('click', () => { const o = dd.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
    dd.addEventListener('mouseenter', () => { dd.classList.add('open'); b.setAttribute('aria-expanded', true); });
    dd.addEventListener('mouseleave', () => { dd.classList.remove('open'); b.setAttribute('aria-expanded', false); });
  });
  const burger = $('#burger'), mnav = $('#mnav');
  burger.onclick = () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); mnav.hidden = !o; };
  function closeMenus() { $$('.dd').forEach(d => d.classList.remove('open')); burger.setAttribute('aria-expanded', false); mnav.hidden = true; }

  /* ---------- HERO ---------- */
  const L = window.HERO_LABELS;
  function hotLayer(scene, wrap, host) {
    wrap.innerHTML = scene.items().length ? '' : '';
    const ids = Object.keys(L);
    wrap.innerHTML = ids.map(id => `<button class="hs" data-id="${id}" aria-label="Ver ${esc(L[id].neo)}"><span class="hs-dot"></span><span class="hs-chip"><span class="o">${L[id].old}</span><span class="n">${L[id].neo}</span></span></button>`).join('') +
      `<div class="pop" id="pop" role="dialog" aria-label="Equipo"></div>`;
    const pop = $('#pop', wrap);
    let sel = null, final = false;
    const update = (show = true) => {
      const r = host.getBoundingClientRect();
      scene.items().forEach(it => {
        const el = $(`.hs[data-id="${it.id}"]`, wrap); if (!el) return;
        const vis = show && it.x > 18 && it.x < r.width - 18 && it.y > 40 && it.y < r.height - 30;
        el.style.left = it.x + 'px'; el.style.top = it.y + 'px';
        el.classList.toggle('on', vis);
        el.classList.toggle('done', it.t >= 0.5);
        el.classList.toggle('final', final);
        el.classList.toggle('left', it.x > r.width * 0.62);
      });
      if (sel) placePop();
    };
    function placePop() {
      const b = $(`.hs[data-id="${sel}"]`, wrap); if (!b) return;
      const x = parseFloat(b.style.left), y = parseFloat(b.style.top), W = host.clientWidth, H = host.clientHeight;
      const left = x > W * 0.55 ? x - 200 : x + 22; const top = Math.min(Math.max(10, y - 120), H - 260);
      pop.style.left = Math.max(8, Math.min(left, W - 188)) + 'px'; pop.style.top = top + 'px';
    }
    const openPop = id => {
      sel = id; const p = prod(id);
      pop.innerHTML = `<div class="pop-img"><img src="${MBU(`media/p/${id}.webp`)}" alt=""><button class="pop-x" aria-label="Cerrar">✕</button></div><div class="pop-b"><b>${esc(p.name)}</b><small>Inversión: cotización personalizada</small><span class="disc">Hasta 24 MSI*</span><button class="btn" data-goto="${id}">Ver equipo</button></div>`;
      $$('.hs', wrap).forEach(h => h.classList.toggle('sel', h.dataset.id === id));
      placePop(); pop.classList.add('on');
    };
    const closePop = () => { sel = null; pop.classList.remove('on'); $$('.hs', wrap).forEach(h => h.classList.remove('sel')); };
    wrap.addEventListener('click', e => {
      const h = e.target.closest('.hs'); if (h) { sel === h.dataset.id ? closePop() : openPop(h.dataset.id); return; }
      if (e.target.closest('.pop-x')) closePop();
      const g = e.target.closest('[data-goto]'); if (g) { closePop(); showProduct(g.dataset.goto); }
    });
    return { update, setFinal(v) { final = v; update(); }, closePop };
  }

  function heroV1() {
    const cv = $('#heroCv'); if (!cv) return;
    const pin = $('.hero1 .pin');
    const scene = HeroScene(cv, { focusX: mobile() ? 0.2 : 0.5, focusY: 0.5 });
    const hot = hotLayer(scene, $('#hsl'), pin);
    if (reduce || !hasG) return;
    const baF = $('#baF'), baL = $('#baL');
    scene.ready.then(() => {
      const S0 = 0.1, S1 = 0.72;
      ScrollTrigger.create({
        trigger: '.hero1', start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: self => {
          const p = self.progress, s = gsap.utils.clamp(0, 1, (p - S0) / (S1 - S0));
          const se = gsap.parseEase('sine.inOut')(s);
          const light = gsap.utils.clamp(0, 1, (p - S1) / 0.08) * (1 - 0.65 * gsap.utils.clamp(0, 1, (p - S1 - 0.08) / 0.1));
          scene.set({ s: se, light, zoom: 1.1 - 0.1 * gsap.parseEase('power2.out')(Math.min(1, p / 0.85)), t: performance.now() });
          baF.style.transform = `scaleX(${se})`; baL.textContent = se <= 0 ? 'Antes' : se >= 1 ? 'Después' : 'Transformando';
          hot.setFinal(p > 0.8); hot.update(p > 0.06);
          if (p < 0.78) hot.closePop();
        }
      });
      // brillo vivo de la línea mientras se hace scroll
      gsap.ticker.add(() => { const st = scene.state; if (st.s > 0 && st.s < 1) scene.set({ t: performance.now() }); });
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero1', start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
    gsap.set('.c2 .ln>span,.c3 .ln>span', { yPercent: 110 }); gsap.set('.c2 p,.c3 p,.c3 .cta', { autoAlpha: 0, y: 14 }); gsap.set('.c2,.c3', { autoAlpha: 1 });
    tl.to('.hint', { autoAlpha: 0, duration: .04 }, .02)
      .to('.c1 .ln>span', { yPercent: -110, stagger: .02, duration: .07, ease: 'power2.in' }, .08).to('.c1 p', { autoAlpha: 0, duration: .05 }, .08)
      .to('.c2 .ln>span', { yPercent: 0, stagger: .03, duration: .08, ease: 'power3.out' }, .3).to('.c2 p', { autoAlpha: 1, y: 0, duration: .06 }, .34)
      .to('.c2 .ln>span', { yPercent: -110, stagger: .02, duration: .07, ease: 'power2.in' }, .6).to('.c2 p', { autoAlpha: 0, duration: .05 }, .6)
      .to('.c3 .ln>span', { yPercent: 0, stagger: .03, duration: .08, ease: 'power3.out' }, .8).to('.c3 p,.c3 .cta', { autoAlpha: 1, y: 0, stagger: .03, duration: .07 }, .85)
      .to({}, { duration: .05 }, .95);
    if (scrollY < 10) gsap.from('.c1', { y: 30, autoAlpha: 0, duration: 1.2, ease: 'power3.out', delay: .2 });
  }

  function heroV2() {
    const slider = $('#slider'); if (!slider) return;
    const slide0 = $('.slide[data-s="0"]', slider), cv = $('#heroCv');
    const scene = HeroScene(cv, { focusX: mobile() ? 0.2 : 0.5, focusY: mobile() ? 0.5 : 0.66 });
    const hot = hotLayer(scene, $('#hsl'), slide0);
    let tw = null, cur = 0, auto = null;
    const SH = new URLSearchParams(location.search), SHOT_S = SH.has('s') ? +SH.get('s') : null;
    const play = () => {
      if (SH.has('shot')) { const v = SHOT_S ?? 1; scene.set({ s: v, light: v >= 1 ? .35 : 0, zoom: 1, t: 1200 }); hot.setFinal(v >= 1); hot.update(v > 0); return; }
      if (reduce || !hasG) { scene.set({ s: 1, light: .35, zoom: 1 }); hot.setFinal(true); return; }
      tw && tw.kill(); hot.closePop(); hot.setFinal(false);
      const st = { s: 0, light: 0, zoom: 1.08 }; scene.set(st);
      tw = gsap.timeline({ onUpdate: () => { scene.set({ ...st, t: performance.now() }); hot.update(st.s > 0.001 || st.zoom < 1.079); } })
        .to(st, { zoom: 1, duration: 6.6, ease: 'power2.out' }, 0)
        .to(st, { s: 1, duration: 4.6, ease: 'sine.inOut' }, 0.9)
        .to(st, { light: 1, duration: .6, ease: 'power2.out' }, 5.4).to(st, { light: .35, duration: 1.2 }, 6)
        .add(() => { hot.setFinal(true); hot.update(); }, 6.2);
    };
    scene.ready.then(() => { hot.update(false); if (SH.has('shot')) { play(); return; } new IntersectionObserver(([en], o) => { if (en.isIntersecting) { play(); o.disconnect(); } }, { threshold: .4 }).observe(slider); });
    addEventListener('resize', () => hot.update(scene.state.s > 0));
    $('#replay').onclick = play;
    const slides = $$('.slide', slider), dots = $$('#sDots button');
    const go = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('on', j === cur)); dots.forEach((d, j) => d.setAttribute('aria-current', j === cur));
      hot.closePop(); if (cur === 0) { scene.resize(); play(); }
      restart();
    };
    const restart = () => { clearTimeout(auto); if (SH.has('shot')) return; if (!reduce) auto = setTimeout(() => go(cur + 1), cur === 0 ? 11000 : 6500); };
    $$('[data-go]', slider).forEach(b => b.onclick = () => go(cur + +b.dataset.go));
    dots.forEach((d, j) => d.onclick = () => go(j));
    slider.addEventListener('mouseenter', () => clearTimeout(auto)); slider.addEventListener('mouseleave', restart);
    restart();
  }
  if (V === 'v2') heroV2(); else if (V === 'v1') heroV1();

  /* ---------- equipos destacados ---------- */
  const row = $('#dealsRow');
  const allB = $('#dealsAll');
  if (allB) allB.onclick = () => { const on = row.classList.toggle('all'); allB.setAttribute('aria-expanded', on); allB.textContent = on ? 'Ver menos' : `Ver los ${D.products.length} equipos`; if (!on) goTo('#equipos'); };
  $$('[data-row]').forEach(b => b.onclick = () => row.scrollBy({ left: +b.dataset.row * row.clientWidth, behavior: 'smooth' }));
  function showProduct(id) { location.href = `product.html?id=${id}`; }
  function scrollToCard(id) {
    if (!row) { location.href = 'index.html#equipos'; return; }
    if (allB && !row.classList.contains('all')) allB.click();
    goTo('#equipos');
    const card = $('#p-' + id); if (!card) return;
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.animate([{ boxShadow: '0 0 0 3px #0047bb' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 2000, delay: 300 });
    }, lenis ? 900 : 400);
  }
  document.addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (!c) return; const p = D.products.find(x => x.cat === c.dataset.cat); if (p) { e.preventDefault(); scrollToCard(p.id); } });

  /* ---------- cotización en 2 pasos: tus datos → agenda tu llamada (Calendly de Magic) ---------- */
  const CAL = 'https://calendly.com/magic-beauty-mexico/50min';
  const metaTxt = m => !m ? '' : [m.qty > 1 ? `${m.qty} equipos` : '', m.pay || '', ...(m.opts || [])].filter(Boolean).join(' · ');
  const co = $('#co'), S = [$('#coS1'), $('#coS2'), $('#coS3')];
  let sel = [], summary = '';
  const step = n => {
    co.dataset.step = n; S.forEach((s, i) => s.hidden = i !== n - 1);
    $$('.co-steps li', co).forEach((li, i) => { li.classList.toggle('on', i === n - 1); li.classList.toggle('ok', i < n - 1); li.setAttribute('aria-current', i === n - 1 ? 'step' : 'false'); });
    $('.co-c', co).scrollTop = 0;
  };
  // mode 'cal' = datos → Calendly; mode 'wa' = mismos datos → WhatsApp con la cotización
  const T = { h: $('#co-h').textContent, p: $('#co-h').nextElementSibling.textContent, b: $('#coForm .co-b').textContent };
  function openCo(items, mode = 'cal') {
    sel = items || []; co.hidden = false; lenis && lenis.stop(); step(1);
    co.dataset.mode = mode; const wa = mode === 'wa';
    $('#co-h').textContent = wa ? 'Cotiza por WhatsApp' : T.h;
    $('#co-h').nextElementSibling.textContent = wa ? 'Déjanos tus datos y te llevamos a WhatsApp con tu cotización lista. Un especialista Magic te responde con tu inversión estimada, MSI y financiamiento.' : T.p;
    $('#coForm .co-b').textContent = wa ? 'Continuar a WhatsApp →' : T.b;
    const L = lead(), f = $('#coForm'); if (L) { f.nombre.value ||= L.nombre; f.email.value ||= L.email; f.tel.value ||= L.tel; }
    $('#coList').innerHTML = sel.map(({ id, meta }) => `<li><img src="${MBU(prod(id).img || `media/p/${id}.webp`)}" alt=""><span><b>${esc(prod(id).name)}</b><small>${esc(metaTxt(meta) || 'Cotización personalizada · Hasta 24 MSI*')}</small></span></li>`).join('');
    $('#coList').hidden = !sel.length;
    setTimeout(() => f.nombre.focus(), 60);
  }
  const closeCo = () => { if (co.hidden) return; co.hidden = true; lenis && lenis.start(); $('#calBox').innerHTML = ''; };
  const openDr = () => openCo([]), closeDr = () => {};
  $('#coX').onclick = closeCo; co.addEventListener('click', e => { if (e.target === co) closeCo(); });
  $('#coForm').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, msg = $('.co-msg', f);
    const v = n => f[n].value.trim(), tel = v('tel').replace(/\D/g, '');
    const bad = !v('nombre') ? 'nombre' : !v('esp') ? 'esp' : tel.length < 10 ? 'tel' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) ? 'email' : !f.ok.checked ? 'ok' : '';
    $$('.co-f, .co-ok', f).forEach(x => x.classList.remove('err'));
    if (bad) { const el = f[bad]; (el.closest('.co-f') || el.closest('.co-ok')).classList.add('err'); msg.textContent = bad === 'ok' ? 'Acepta el aviso de privacidad para continuar.' : 'Revisa el campo marcado.'; el.focus(); return; }
    msg.textContent = '';
    store.set('mb-lead', { nombre: v('nombre'), email: v('email'), tel });
    const eq = sel.map(({ id, meta }) => `${prod(id).name}${metaTxt(meta) ? ' (' + metaTxt(meta) + ')' : ''}`);
    summary = [eq.length ? 'Equipos: ' + eq.join('; ') : 'Equipos: por definir', 'Especialidad: ' + v('esp'), v('clinica') && 'Clínica: ' + v('clinica'), v('ciudad') && 'Ciudad: ' + v('ciudad'), 'WhatsApp: ' + tel].filter(Boolean).join(' | ');
    if (co.dataset.mode === 'wa') { open(waUrl(`Hola Magic Beauty, quiero cotizar.\nNombre: ${v('nombre')}\nCorreo: ${v('email')}\n${summary.split(' | ').join('\n')}`), '_blank', 'noopener'); closeCo(); toast('Te llevamos a WhatsApp con tu cotización'); return; }
    const u = new URL(CAL);
    Object.entries({ embed_domain: location.hostname || 'localhost', embed_type: 'Inline', hide_gdpr_banner: 1, hide_event_type_details: 1, primary_color: '0047bb', name: v('nombre'), email: v('email'), a1: summary }).forEach(([k, val]) => u.searchParams.set(k, val));
    $('#calBox').innerHTML = `<iframe src="${u}" title="Agenda tu llamada con Magic Beauty" loading="lazy" allow="payment"></iframe><p class="cal-load">Cargando horarios disponibles…</p>`;
    $('#calBox iframe').onload = () => { const l = $('#calBox .cal-load'); l && l.remove(); };
    $('#coWho').textContent = v('nombre').replace(/^(Dra?\.|Lic\.|Ing\.)\s*/i, '').split(' ')[0];
    step(2);
  });
  const waTxt = () => `Hola Magic Beauty, quiero cotizar y hablar con un especialista.\n${summary.split(' | ').join('\n')}`;
  $('#coBack').onclick = () => step(1);
  $('#coWa').onclick = e => { e.preventDefault(); open(waUrl(waTxt()), '_blank', 'noopener'); };
  $('#coWa3').onclick = e => { e.preventDefault(); open(waUrl(waTxt() + '\n\nYa agendé mi llamada en Calendly.'), '_blank', 'noopener'); };
  $('#coDone').onclick = closeCo;
  addEventListener('message', e => { if (/calendly\.com$/.test(new URL(e.origin).hostname) && e.data && e.data.event === 'calendly.event_scheduled') step(3); });
  document.addEventListener('click', e => {
    const w = e.target.closest('[data-add-wa]'); if (w) { e.preventDefault(); openCo([{ id: w.dataset.addWa, meta: null }], 'wa'); return; }
    const a = e.target.closest('[data-add]'); if (a) { e.preventDefault(); openCo([{ id: a.dataset.add, meta: null }]); }
  });
  $('#quoteBtn').onclick = () => openCo([]);
  window.MBQ = {
    add(id, meta) { openCo([{ id, meta }]); },
    openDrawer: () => openCo([]), toast: m => toast(m), goTo, openVideo: id => openM(id), checkout: () => openCo(sel), has: () => false
  };
  let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2400); }

  /* ---------- reels / embajadores ---------- */
  const hover = matchMedia('(hover:hover)').matches;
  const VID = window.MB_VIDEO, vsrc = id => VID ? VID[id] || null : { mp4: `media/reels/${id}.mp4` };
  const ytUrl = (y, sound) => `https://www.youtube-nocookie.com/embed/${y}?autoplay=1&rel=0&playsinline=1&modestbranding=1${sound ? '' : '&mute=1'}`;
  if (VID) $$('[data-reel]').forEach(el => { if (!vsrc(el.dataset.reel)) { el.removeAttribute('data-reel'); el.removeAttribute('role'); el.classList.add('novid'); } });
  $$('[data-hover]').forEach(el => {
    const hs = vsrc(el.dataset.hover); if (!hs || !hs.mp4) return;
    let v; const ensure = () => { if (!v) { v = document.createElement('video'); Object.assign(v, { src: MBU(hs.mp4), muted: true, loop: true, playsInline: true, preload: 'none' }); v.setAttribute('aria-hidden', 'true'); el.insertBefore(v, el.children[1]); } return v; };
    if (hover && !reduce) { el.addEventListener('mouseenter', () => ensure().play().catch(() => {})); el.addEventListener('mouseleave', () => v && v.pause()); }
  });
  const modal = $('#modal'), mv = $('#modalVid'); let lastF;
  const openM = id => {
    const s = vsrc(id); if (!s) return; lastF = document.activeElement; modal.hidden = false; lenis && lenis.stop();
    if (s.yt) { mv.hidden = true; modal.insertAdjacentHTML('beforeend', `<iframe class="modal-yt" src="${ytUrl(s.yt, true)}" title="Video" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`); }
    else { mv.hidden = false; mv.src = MBU(s.mp4); mv.play().catch(() => {}); }
    $('#modalX').focus();
  };
  const closeM = () => { if (modal.hidden) return; mv.pause(); mv.removeAttribute('src'); mv.load(); const f = $('.modal-yt', modal); f && f.remove(); modal.hidden = true; lenis && lenis.start(); lastF && lastF.focus(); };
  document.addEventListener('click', e => { const r = e.target.closest('[data-reel]'); if (r && !r.closest('.cf')) openM(r.dataset.reel); });
  $('#modalX').onclick = closeM; modal.addEventListener('click', e => { if (e.target === modal) closeM(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenus(); closeDr(); closeM(); closeEx(); closeCo(); closeLg(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-reel]') && !e.target.closest('.cf')) { e.preventDefault(); openM(e.target.dataset.reel); }
  });

  /* ---------- coverflow (Lo que sienten) ---------- */
  const cf = $('#cf'), cards = cf ? $$('.cf-c', cf) : []; let ci = 1;
  function layoutCf() {
    const n = cards.length, gap = mobile() ? 150 : 216;
    cards.forEach((c, i) => {
      let d = i - ci; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      c.classList.toggle('c', d === 0);
      const x = d * gap + (d === 0 ? 0 : Math.sign(d) * 28);
      c.style.transform = `translate(calc(-50% + ${x}px), -50%)`;
      c.style.opacity = Math.abs(d) > 2 ? 0 : 1; c.style.zIndex = 3 - Math.abs(d);
      if (d !== 0) stopCf(c);
    });
  }
  function stopCf(c) { const v = $('video, iframe', c); if (v) { v.pause && v.pause(); v.remove(); } c.classList.remove('playing'); }
  function playCf(c) {
    if (c.classList.contains('playing')) { stopCf(c); return; }
    const s = vsrc(c.dataset.reel); if (!s) return;
    if (s.yt) { c.insertAdjacentHTML('afterbegin', `<iframe class="cf-yt" src="${ytUrl(s.yt, true)}" title="Testimonio" allow="autoplay; encrypted-media" allowfullscreen></iframe>`); c.classList.add('playing'); return; }
    const v = document.createElement('video'); Object.assign(v, { src: MBU(s.mp4), playsInline: true, controls: false }); c.insertBefore(v, c.children[1]);
    c.classList.add('playing'); v.play().catch(() => {}); v.onended = () => stopCf(c);
  }
  if (cf) cf.addEventListener('click', e => {
    if (e.target.closest('.cf-a.l')) { ci = (ci - 1 + cards.length) % cards.length; layoutCf(); return; }
    if (e.target.closest('.cf-a.r')) { ci = (ci + 1) % cards.length; layoutCf(); return; }
    const c = e.target.closest('.cf-c'); if (!c) return;
    if (+c.dataset.i === ci) playCf(c); else { ci = +c.dataset.i; layoutCf(); }
  });
  if (cf) cf.addEventListener('keydown', e => { const c = e.target.closest('.cf-c'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); } });
  if (cf) { layoutCf(); addEventListener('resize', layoutCf); }

  /* ---------- videos autoplay solo visibles ---------- */
  const vio = new IntersectionObserver(es => es.forEach(en => { const v = en.target; if (reduce) return v.pause(); en.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { threshold: .2 });
  $$('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); vio.observe(v); });

  /* ---------- reveal + contadores ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
  $$('.rvl').forEach(el => io.observe(el));
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target); if (reduce || !hasG) return;
    const el = en.target, to = +el.dataset.count, o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = (el.dataset.prefix || '') + Math.round(o.v).toLocaleString('es-MX') });
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- newsletter ---------- */
  $('#newsForm') && $('#newsForm').addEventListener('submit', e => {
    e.preventDefault(); const i = $('#newsEmail'), m = $('.form-msg', e.target);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)) { m.textContent = 'Escribe un correo válido.'; return; }
    location.href = `mailto:${D.email}?subject=${encodeURIComponent('Suscripción al newsletter')}&body=${encodeURIComponent('Quiero recibir promociones y lanzamientos en: ' + i.value)}`;
    m.textContent = '¡Gracias! Confirma el envío en tu correo.';
  });

  /* ---------- privacidad + pop-up de salida ---------- */
  const priv = $('#priv'); if (!store.get('mb-priv', false)) priv.hidden = false;
  $$('[data-close-priv]').forEach(b => b.onclick = () => { priv.hidden = true; store.set('mb-priv', true); });
  const ex = $('#ex'); let exShown = !!sstore.get('mb-ex');
  const showEx = () => { if (exShown || !co.hidden) return; exShown = true; sstore.set('mb-ex', '1'); ex.hidden = false; lenis && lenis.stop(); $('#exTel').focus(); };
  function closeEx() { if (ex.hidden) return; ex.hidden = true; lenis && lenis.start(); }
  document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY < 8 && scrollY > innerHeight) showEx(); });
  setTimeout(() => { if (scrollY > innerHeight * 2) showEx(); }, 60000);
  $('#exX').onclick = closeEx; ex.addEventListener('click', e => { if (e.target === ex) closeEx(); });
  $('#exForm').addEventListener('submit', e => {
    e.preventDefault(); const t = $('#exTel').value.replace(/\D/g, '');
    if (t.length < 10) { $('#exTel').setCustomValidity('Escribe 10 dígitos'); $('#exTel').reportValidity(); return; }
    if (!$('#exOk').checked) { $('#exOk').focus(); toast('Acepta la política de privacidad para continuar'); return; }
    open(waUrl(`Hola Magic Beauty, quiero asesoría para mi clínica. Mi WhatsApp es ${t}.`), '_blank', 'noopener'); closeEx();
  });
  $('#exTel').addEventListener('input', e => e.target.setCustomValidity(''));

  /* modo captura para presentaciones: ?open=lg | co */
  const op = new URLSearchParams(location.search).get('open');
  if (new URLSearchParams(location.search).has('shot')) document.documentElement.classList.add('shot');
  if (op === 'lg') setTimeout(() => waGate('Hola Magic Beauty'), 400);
  if (op === 'co') setTimeout(() => window.MBQ.add('hypercare', { qty: 1, pay: 'Hasta 24 MSI', opts: ['Fotoestimulación IR PRO'] }), 400);

})();
