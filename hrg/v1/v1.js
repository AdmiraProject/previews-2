(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- hero: lines draw on load, finder slides up (PG fadeInUp .6s .3s) ---- */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('.hero .draw').forEach(p => p.classList.add('is-in'));
    $('.finder').classList.add('is-in');
  }));

  /* ---- draw-on-scroll for every line drawing + reveal groups ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  }), { threshold: .35, rootMargin: '0px 0px -8% 0px' });
  $$('.ul, .step__ic, .trusted__line, .final__line, .tgrid-wrap').forEach(el => {
    if (el.closest('.hero')) return;
    io.observe(el.tagName === 'svg' ? el : el);
  });
  // svg containers: add is-in to the svg itself so `.is-in .draw` matches
  $$('.ul, .step__ic, .trusted__line, .final__line').forEach(svg => { if (!svg.closest('.hero')) io.observe(svg); });

  /* ---- count-up numbers ---- */
  const fmt = (n, sep) => sep ? n.toLocaleString('en-US') : String(n);
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, sep = el.dataset.sep === '1';
    if (reduce) { el.textContent = fmt(to, sep); return; }
    const t0 = performance.now(), d = 1600;
    const tick = t => { const k = Math.min(1, (t - t0) / d), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = fmt(v, sep); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('.count').forEach(c => cio.observe(c));

  /* ---- testimonials: video lightbox (PG playButton -> modal) ---- */
  const vm = $('#vmodal'), vv = $('.vmodal__v', vm); let vLast;
  const vOpen = card => {
    vLast = document.activeElement;
    vv.textContent = '';
    vv.src = card.dataset.video; vv.poster = $('img', card).src;
    if (card.dataset.vtt) { const t = document.createElement('track'); t.kind = 'captions'; t.srclang = 'es'; t.label = 'Español'; t.src = card.dataset.vtt; t.default = true; vv.appendChild(t); }
    vm.hidden = false; document.body.style.overflow = 'hidden';
    vv.play().catch(() => {}); $('.vmodal__x', vm).focus({ preventScroll: true });
  };
  const vClose = () => { vv.pause(); vv.src = ''; vm.hidden = true; document.body.style.overflow = ''; vLast && vLast.focus({ preventScroll: true }); };
  document.addEventListener('click', e => {
    const card = e.target.closest('.tcard--video'); if (card) { e.preventDefault(); vOpen(card); return; }
    if (e.target.closest('[data-vclose]')) vClose();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !vm.hidden) vClose(); });
  const stopAll = () => {};

  /* ---- sticky header + mega menu (PG nav dropdowns: slidedown .25s) ---- */
  const hdr = $('.hdr');
  const onScroll = () => hdr.classList.toggle('is-stuck', scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  let mT;
  const setMenu = it => {
    $$('.hdr__item').forEach(x => { const on = x === it; x.classList.toggle('is-open', on); $('.hdr__btn', x).setAttribute('aria-expanded', on); });
    hdr.classList.toggle('is-menu', !!it);
  };
  $$('.hdr__item').forEach(it => {
    it.addEventListener('mouseenter', () => { clearTimeout(mT); mT = setTimeout(() => setMenu(it), 90); });
    it.addEventListener('mouseleave', () => { clearTimeout(mT); mT = setTimeout(() => setMenu(null), 160); });
    $('.hdr__btn', it).addEventListener('click', () => setMenu(it.classList.contains('is-open') ? null : it));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(null); });
  document.addEventListener('click', e => { if (!e.target.closest('.hdr__item')) setMenu(null); else if (e.target.closest('.mega a, .mega button')) setMenu(null); });

  $$('.dot').forEach(d => d.addEventListener('click', () => {
    stopAll();
    const i = +d.dataset.go;
    $$('.tgrid').forEach(g => g.classList.toggle('is-active', +g.dataset.page === i));
    $$('.dot').forEach(x => { x.classList.toggle('is-active', x === d); x.setAttribute('aria-selected', x === d); });
  }));

  /* ---- FAQ accordion ---- */
  $$('.acc__h').forEach(h => h.addEventListener('click', () => {
    const it = h.parentElement, open = !it.classList.contains('is-open');
    it.classList.toggle('is-open', open); h.setAttribute('aria-expanded', open);
  }));

  /* ---- siniestros calculator (same rule as hrgseguros.com.mx: coaseguro 10%, tope $80,000) ---- */
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const inp = $('#siniestro'), rng = $('.calc__range');
  const cur = {};
  const tween = (k, to) => { const el = $(`[data-o=${k}]`), from = cur[k] ?? to; cur[k] = to; if (reduce || from === to) { el.textContent = money(to); return; } const t0 = performance.now(); el.classList.add('tick'); const f = t => { const q = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - q, 3); el.textContent = money(from + (to - from) * e); if (q < 1) requestAnimationFrame(f); else el.classList.remove('tick'); }; requestAnimationFrame(f); };
  let ded = 35000;
  const calc = () => {
    const s = Math.max(0, +inp.value.replace(/[^\d]/g, '') || 0);
    const coaRaw = Math.max(0, (s - ded) * .10), coa = Math.min(coaRaw, 80000);
    const you = s < ded ? s : ded + coa, ins = Math.max(0, s - you);
    tween('ded', Math.min(ded, s)); tween('coa', s < ded ? 0 : coa); tween('you', you); tween('ins', ins);
    const t = s || 1;
    $('.b-ded').style.flexGrow = Math.min(ded, s) / t; $('.b-coa').style.flexGrow = (s < ded ? 0 : coa) / t; $('.b-ins').style.flexGrow = ins / t;
  };
  inp.addEventListener('input', () => { const n = +inp.value.replace(/[^\d]/g, '') || 0; inp.value = n ? n.toLocaleString('en-US') : ''; rng.value = Math.min(2000000, Math.max(50000, n)); calc(); });
  rng.addEventListener('input', () => { inp.value = (+rng.value).toLocaleString('en-US'); calc(); });
  $$('.calc__chips button').forEach(b => b.addEventListener('click', () => {
    $$('.calc__chips button').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); });
    ded = +b.dataset.d; calc();
  }));
  calc();

  /* ---- mobile nav ---- */
  const burger = $('.hdr__burger'), mnav = $('.mnav');
  burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); mnav.hidden = !o; document.body.style.overflow = o ? 'hidden' : ''; });
  mnav.addEventListener('click', e => { if (e.target.closest('a,button')) { burger.setAttribute('aria-expanded', 'false'); mnav.hidden = true; document.body.style.overflow = ''; } });

  /* ---- quote modal ---- */
  const P = {
    vida: { t: 'Seguro de vida', ref: '<b>Seguro de vida a 10 años.</b> Suma asegurada de $1M, $2M o $3M. Desde <b>$8.04 al día</b> (mujer de 18 a 20 años, no fumadora, $1M). Un solo pago al año.' },
    enfermedad: { t: 'Seguro por enfermedad', ref: '<b>Te paga en efectivo</b> si te diagnostican una enfermedad cubierta: hasta $300,000. Infarto desde el día 1. Desde <b>$4.45 al día</b>. Tú y hasta 4 familiares.' },
    gmm: { t: 'Gastos médicos mayores', ref: '<b>Protege tu salud y tu patrimonio</b> ante gastos hospitalarios de alto costo. Un asesor te ayuda a elegir suma asegurada, deducible y coaseguro.' },
    retiro: { t: 'Seguro de retiro', ref: '<b>Protección con plan de ahorro a largo plazo</b> para tu jubilación. Te mostramos los escenarios según las condiciones del plan.' },
    educativo: { t: 'Seguro educativo', ref: '<b>Un fondo para la educación de tus hijos</b>, con respaldo si llegaras a faltar.' },
    empresarial: { t: 'Seguro empresarial', ref: '<b>Protege a las personas clave de tu empresa</b> en caso de fallecimiento o incapacidad. 100% deducible para la empresa.' },
  };
  const modal = $('#quote'); let prod = null, lastFocus, lead = {};
  const step = n => { $$('.qm-step', modal).forEach(s => s.classList.toggle('is-on', s.dataset.step == n)); const f = $(`.qm-step[data-step="${n}"] input, .qm-step[data-step="${n}"] .qm-opts button`, modal); f && f.focus({ preventScroll: true }); };
  const setProd = p => { prod = P[p] ? p : 'vida'; $('[data-ptitle]', modal).textContent = P[prod].t; $('[data-pref]', modal).innerHTML = P[prod].ref; };
  const open = p => { lastFocus = document.activeElement; prod = P[p] ? p : null; modal.hidden = false; document.body.style.overflow = 'hidden'; $$('.draw', modal).forEach(d => d.classList.remove('is-in')); step(1); };
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus({ preventScroll: true }); };
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open-quote]'); if (o) { e.preventDefault(); open(o.dataset.openQuote); return; }
    const n = e.target.closest('.mnav a[data-product]'); if (n) { e.preventDefault(); open(n.dataset.product); }
  });
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); if (e.target.closest('[data-back]')) step(2); const o = e.target.closest('.qm-opts button'); if (o) { setProd(o.dataset.p); step(3); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
  $$('.qm-seg', modal).forEach(g => $$('button', g).forEach(b => b.addEventListener('click', () => $$('button', g).forEach(x => x.classList.toggle('is-on', x === b)))));
  const err = (f, m) => { const e = $('.qm-err', f); e.hidden = !m; e.textContent = m; return !!m; };
  $('form[data-step="1"]', modal).addEventListener('submit', e => {
    e.preventDefault(); const f = e.target;
    const wa = f.wa.value.replace(/\D/g, ''), email = f.email.value.trim(), nombre = f.nombre.value.trim();
    if (err(f, wa.length !== 10 ? 'Escribe un número de WhatsApp de 10 dígitos.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'Escribe un correo válido.'
      : !nombre ? 'Escribe tu nombre para personalizar tu cotización.'
      : (!f.mayor.checked || !f.priv.checked) ? 'Confirma que eres mayor de edad y aceptas el Aviso de Privacidad.' : '')) return;
    lead = { wa, email, nombre };
    if (prod) { setProd(prod); step(3); } else step(2);
  });
  $('form[data-step="3"]', modal).addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, edad = +f.edad.value;
    const max = prod === 'vida' ? 70 : prod === 'enfermedad' ? 69 : 99;
    if (err(f, !edad || edad < 18 || edad > max ? (prod === 'vida' ? 'El seguro de vida se cotiza en línea de 18 a 70 años.' : 'Escribe una edad válida.') : '')) return;
    $('[data-done]', modal).textContent = `¡Listo, ${lead.nombre.split(' ')[0]}!`;
    step(4); requestAnimationFrame(() => requestAnimationFrame(() => $$('.qm-ok .draw', modal).forEach(d => d.classList.add('is-in'))));
  });

  /* ===================== motion layer ===================== */
  if (!reduce) {
    // word-by-word headline reveal
    const split = el => {
      let i = 0;
      [...el.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const s = document.createElement('span'); s.className = 'wd'; s.style.setProperty('--i', i++); s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') { n.classList.add('wd'); n.style.setProperty('--i', i++); }
      });
      el.style.setProperty('--n', i); el.classList.add('split');
    };
    $$('.hero h1, .h2').forEach(split);
    $('.hero h1').style.setProperty('--d0', '150ms');
    requestAnimationFrame(() => requestAnimationFrame(() => $('.hero h1').classList.add('is-in')));
    const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }), { threshold: .25, rootMargin: '0px 0px -6% 0px' });
    $$('.h2.split, .expert, .steps, .acc, .stats, .calc, .clipr').forEach(x => rio.observe(x));
    $$('.sub, .trusted__sub, .sim__tag, .sim__p, .final__p, .center-btn, .dots, .sim__copy > .btn, .final__copy > .btn, .sim__disc').forEach((x, k) => { x.classList.add('rv'); x.style.setProperty('--rd', '180ms'); rio.observe(x); });
    // hero parallax
    const himg = $('.hero__img'); let tk = false;
    addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { const y = Math.min(scrollY, 900); himg.style.transform = `translate3d(0,${y * .18}px,0) scale(${1.04 + y * .00005})`; tk = false; }); }, { passive: true });
    himg.style.animation = 'none';
  } else {
    $$('.expert, .steps, .acc, .stats, .calc, .clipr').forEach(x => x.classList.add('is-in'));
  }
})();
