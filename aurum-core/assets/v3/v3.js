(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hdr = $('#hdr');

  let theme = 'light';
  const swappers = $$('[data-cd]');
  function setTheme(t) {
    if (t === theme) return;
    theme = t;
    hdr.dataset.theme = t;
    swappers.forEach(el => { if (el.closest('.dd-panel') && !el.closest('header')) return; el.className = t === 'dark' ? el.dataset.cd : el.dataset.cl; });
    $$('.hdr-vl').forEach(v => v.style.background = t === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
  }
  // dropdown internals start as dark-built; sync to initial light
  swappers.forEach(el => { el.className = el.dataset.cl; });
  hdr.dataset.theme = 'light';
  const themed = $$('[data-header-theme]');
  function themeTick() {
    const y = hdr.getBoundingClientRect().bottom;
    let t = 'light';
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { t = s.dataset.headerTheme; } }
    setTheme(t);
  }

  /* ---------- dropdowns ---------- */
  const ddWrap = $('#ddWrap');
  let open = null;
  function setDD(name) {
    open = name;
    $$('[data-dd]').forEach(b => b.setAttribute('aria-expanded', String(b.dataset.dd === name)));
    $$('.dd-panel').forEach(p => p.hidden = p.dataset.panel !== name);
    ddWrap.style.gridTemplateRows = name ? '1fr' : '0fr';
    ddWrap.setAttribute('aria-hidden', String(!name));
    $$('.hdr-vl').forEach(v => v.style.transform = name ? 'scaleY(1)' : 'scaleY(0)');
  }
  $$('[data-dd]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); setDD(open === b.dataset.dd ? null : b.dataset.dd); }));
  document.addEventListener('click', e => { if (open && !e.target.closest('#ddWrap')) setDD(null); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setDD(null); mm(false); } });
  ddWrap.addEventListener('click', e => { if (e.target.closest('a')) setDD(null); });

  /* ---------- mobile menu ---------- */
  const mmP = $('#mobile-menu');
  function mm(on) { mmP.style.translate = on ? '0 0' : '100% 0'; $('#mmOpen').setAttribute('aria-expanded', String(on)); document.documentElement.style.overflow = on ? 'hidden' : ''; }
  $('#mmOpen').addEventListener('click', () => mm(true));
  $('#mmClose').addEventListener('click', () => mm(false));
  mmP.addEventListener('click', e => { if (e.target.closest('a')) mm(false); });
  $$('.mm-g > button').forEach(b => b.addEventListener('click', () => { const g = b.parentElement; g.classList.toggle('mm-open'); b.setAttribute('aria-expanded', String(g.classList.contains('mm-open'))); }));
  $$('.fcol h3 button').forEach(b => b.addEventListener('click', () => { const n = $('#' + b.getAttribute('aria-controls')); const on = n.classList.toggle('hidden') === false; b.setAttribute('aria-expanded', String(on)); b.querySelector('svg').style.transform = on ? 'rotate(180deg)' : ''; }));

  /* ---------- generic render scaling ---------- */
  function fit() {
    $$('.rnd[data-rw]').forEach(r => {
      const w = +r.dataset.rw, h = +r.dataset.rh, inn = r.querySelector('.rnd-in');
      const cw = r.clientWidth, ch = r.clientHeight || cw * h / w;
      const s = Math.max(cw / w, ch / h);
      inn.style.width = w + 'px'; inn.style.height = h + 'px';
      inn.style.transform = `translate(${-w * s / 2}px, ${-h * s / 2}px) scale(${s})`;
      if (r.classList.contains('r4')) { const s4 = Math.min(cw / w, ch / h) < 1 ? cw / w : s; inn.style.transform = `translate(${-cw / 2}px, ${-ch / 2}px) scale(${s4})`; }
    });
    const dg = $('#dg'); if (dg) { const s = dg.parentElement.clientWidth / 1232; dg.style.transform = `scale(${s})`; }
    const pane = $('#awPane'), sc = $('#appScale');
    if (pane && sc) { const mob = innerWidth < 768; const s = pane.clientWidth / (mob ? 790 : 1152); sc.style.transform = mob ? `translate(${-262 * s}px, 0) scale(${s})` : `scale(${s})`; sc.style.height = (pane.clientHeight / s) + 'px'; sc.firstElementChild.style.height = Math.max(560, pane.clientHeight / s) + 'px'; }
  }

  const shell = $('#awShell'), fades = $$('.ah-fade'), sats = $$('.sat');
  const wide = () => innerWidth >= 768;
  function heroTick() {
    if (!shell) return;
    if (!wide()) { shell.style.transform = ''; fades.forEach(f => { f.style.opacity = ''; f.style.filter = ''; }); return; }
    const p = clamp(scrollY / 480, 0, 1);
    shell.style.transform = `scale(${0.95 + 0.05 * p})`;
    const tf = clamp((p - 0.15) / 0.55, 0, 1);
    fades.forEach((f, i) => { const k = clamp(tf * 1.15 - i * 0.04, 0, 1); f.style.opacity = String(1 - k); f.style.filter = k > 0.01 ? `blur(${(2.5 * k).toFixed(2)}px)` : 'none'; });
    const sp = clamp((p - 0.3) / 0.55, 0, 1), e = 1 - Math.pow(1 - sp, 3);
    sats.forEach(s => { const sx = +s.dataset.sx, sy = +s.dataset.sy; s.style.opacity = String(e); s.style.transform = `translate(${sx * (1 - e)}px, ${sy * (1 - e)}px) scale(${0.94 + 0.06 * e})`; });
  }

  /* ---------- in-view helper ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { en.target._vis = en.isIntersecting; if (en.isIntersecting && en.target._start && !en.target._started) { en.target._started = true; en.target._start(); } }), { threshold: 0.15 });
  function whenVisible(el, fn) { if (!el) return; el._start = fn; io.observe(el); }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function waitVis(el) { while (!el._vis) await sleep(250); }

  /* ---------- hero app: live operations dashboard ---------- */
  function heroApp() {
    const rows = $('#mvRows'); if (!rows) return;
    const kS = $('#kSaldo'), kM = $('#kMov'), kSp = $('#kSpei'), kC = $('#kConc'), cP = $('#concPct'), cT = $('#concTxt'), cB = $('#concBar');
    let saldo = 48215730.40, mov = 12486, spei = 3912400, conc = 12436;
    const ev = [['SPEI recibido', 'App móvil', 8500, 'ok', 'Aplicado'], ['Compra con tarjeta', 'Tarjeta', -1250, 'au', 'Autorizado'], ['Dispersión a proveedores', 'API', -38400, 'ok', 'Liquidado'], ['Depósito referenciado', 'Conector', 12750, 'ok', 'Aplicado'], ['Pago de crédito', 'Domiciliación', 4180, 'ok', 'Aplicado'], ['Reverso', 'Portal', 200, 'rv', 'Reversado'], ['Retiro en cajero', 'Tarjeta', -2000, 'au', 'Autorizado'], ['Rendimiento a plazo', 'Motor', 1312.5, 'ok', 'Pagado'], ['Transferencia interna', 'Web', -5600, 'ok', 'Aplicado'], ['Retención de fondos', 'API', 3000, 'hd', 'Retenido']];
    const accts = ['0042', '0187', '0310', '0458', '0107', '0099', '0563', '0721'];
    let k = 0, sec = 18;
    const pad = n => String(n).padStart(2, '0');
    const bump = el => { el.classList.add('up'); setTimeout(() => el.classList.remove('up'), 700); };
    setInterval(() => {
      const [t, ch, amt, st, sl] = ev[k++ % ev.length];
      sec += 7 + Math.floor(Math.random() * 9); const mm = 24 + Math.floor(sec / 60), ss = sec % 60;
      const d = document.createElement('div'); d.className = 'tr new';
      const hold = st === 'hd';
      d.innerHTML = `<span class="c1">10:${pad(mm)}:${pad(ss)}</span><span class="c2">${t}</span><span class="c3">Cuenta ${accts[k % accts.length]}</span><span class="c5${amt < 0 ? ' neg' : ''}">${hold ? '' : amt < 0 ? '−' : '+'}$${fmt(Math.abs(amt))}</span><span class="c6"><i class="chip ${st}">${sl}</i></span>`;
      rows.prepend(d); setTimeout(() => d.classList.add('fade'), 900);
      while (rows.children.length > 9) rows.lastElementChild.remove();
      if (!hold) { saldo += amt; kS.textContent = '$' + fmt(saldo); bump(kS); }
      mov += 1; kM.textContent = mov.toLocaleString('en-US');
      if (t === 'SPEI recibido' || t === 'Depósito referenciado') { spei += amt; kSp.textContent = '$' + fmt(spei); bump(kSp); }
      conc = Math.min(mov, conc + 1 + (Math.random() < .4 ? 1 : 0)); const pct = (conc / mov * 100);
      kC.textContent = pct.toFixed(1) + '%'; cP.textContent = pct.toFixed(1) + '%'; cT.textContent = `${conc.toLocaleString('en-US')} de ${mov.toLocaleString('en-US')}`; cB.style.width = pct + '%';
    }, 1500);
    // card-control satellite + KYC satellite
    const sw = $$('.cctl .sw'), limV = $('#limV'), limB = $('#limBar'), kyc = $$('#kycL li');
    (async function cycle() {
      for (;;) {
        for (const li of kyc) { await sleep(650); li.classList.add('ok'); }
        await sleep(700); sw[2] && sw[2].classList.add('on');
        await sleep(900); limV.textContent = '$8,000.00'; limB.style.width = '64%';
        await sleep(2600);
        sw[2] && sw[2].classList.remove('on'); limV.textContent = '$5,000.00'; limB.style.width = '40%';
        kyc.forEach(l => l.classList.remove('ok')); await sleep(600);
      }
    })();
  }

  /* ---------- R1: autorizaciones stream ---------- */
  function r1() {
    const rows = $('#r1rows'), bal = $('#r1bal'); if (!rows) return;
    let b = 350000;
    const I = { out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>', in: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17M7 9v8h8"/></svg>', hold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>' };
    const ev = [['out', 'Compra con tarjeta', -1500], ['in', 'Reverso', 200], ['hold', 'Retención de fondos', -350], ['in', 'Reembolso', 420], ['out', 'Pago de servicio', -890], ['in', 'Depósito SPEI', 8500], ['out', 'Retiro en cajero', -2000], ['in', 'Cashback', 62.5]];
    let k = 4;
    async function loop() {
      for (;;) {
        await sleep(1900); await waitVis(rows.closest('.rnd'));
        const [t, label, amt] = ev[k++ % ev.length];
        const d = document.createElement('div'); d.className = 'row new';
        d.innerHTML = `<span class="i${t === 'in' ? ' g' : ''}">${I[t]}</span><span class="n">${label}</span><span class="a">${amt < 0 ? '−' : '+'}$${fmt(Math.abs(amt))}</span>`;
        rows.prepend(d);
        while (rows.children.length > 5) rows.lastElementChild.remove();
        b += amt; bal.textContent = '$' + fmt(b);
      }
    }
    loop();
  }

  /* ---------- R3: depósito a plazo config ---------- */
  function r3() {
    const seg = $$('#r3seg span'), sub = $('#r3sub'), btn = $('#r3btn'), amt = $('#r3amt'); if (!btn) return;
    const days = [30, 60, 90];
    (async function loop() {
      for (;;) {
        await waitVis(btn.closest('.rnd'));
        for (let i = 0; i < 3; i++) {
          seg.forEach((s, j) => s.classList.toggle('on', j === i));
          const r = 100000 * 0.105 * days[i] / 360;
          sub.textContent = `Rendimiento al vencimiento: $${fmt(r)} · pago automático`;
          await sleep(1100);
        }
        await sleep(500); btn.classList.add('press'); await sleep(160); btn.classList.remove('press'); btn.classList.add('done');
        await sleep(2600); btn.classList.remove('done');
        const v = [100000, 250000, 100000][Math.floor(Math.random() * 3)]; amt.textContent = '$' + fmt(v);
        await sleep(400);
      }
    })();
  }

  function r4() {
    const stk = $('#r4stk'); if (!stk) return;
    const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    const SPIN = svg('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>'), CHECK = svg('<path d="M5 12.5 10 17l9-10"/>'), SEND = svg('<path d="M5 12h14M13 6l6 6-6 6"/>'), CHECKB = svg('<path d="M6 12.5 10 16.5 18 8"/>').replace('stroke-width="2"', 'stroke-width="3"');
    const steps = [
      { act: 'Solicitud recibida', done: 'Solicitud recibida', rt: 'Crédito 0042', ic: SPIN },
      { act: 'Evaluando solicitud…', done: 'Solicitud aprobada', rt: '12 pagos · tasa fija', ic: SPIN },
      { act: 'Enviando desembolso…', done: 'Desembolso por SPEI', rt: '$45,000.00', ic: SEND },
      { act: 'Crédito cerrado', done: '', rt: '12 de 12 pagos', ic: CHECKB, fin: true },
    ];
    const root = stk.closest('.rnd');
    async function type(el, s) { el.textContent = ''; for (let i = 1; i <= s.length; i++) { el.textContent = s.slice(0, i); await sleep(34); } }
    (async function loop() {
      for (;;) {
        await waitVis(root);
        root.classList.remove('out'); stk.innerHTML = '';
        const pills = [];
        for (let i = 0; i < steps.length; i++) {
          const st = steps[i];
          pills.forEach((p, j) => { p.style.top = `${(pills.length - j) * 105}px`; });
          const el = document.createElement('div');
          el.className = 'pl act in' + (st.fin ? ' fin' : '');
          el.innerHTML = `<span class="ic${st.ic === SPIN ? ' spin' : ''}">${st.ic}</span><span class="txt"></span><span class="rt">${st.rt}</span>`;
          stk.prepend(el); pills.push(el);
          await type(el.querySelector('.txt'), st.act);
          await sleep(st.fin ? 3200 : 1900);
          if (!st.fin) { el.classList.remove('act'); el.querySelector('.ic').className = 'ic'; el.querySelector('.ic').innerHTML = CHECK; el.querySelector('.txt').textContent = st.done; await sleep(450); }
        }
        root.classList.add('out'); await sleep(900);
      }
    })();
  }

  function r5() {
    const dg = $('#dg'); if (!dg) return;
    $$('path.base', dg).forEach(p => { const L = p.getTotalLength(); p.style.setProperty('--len', L.toFixed(1)); });
    const on = (i, v) => $$(`[data-p="${i}"]`, dg).forEach(e => e.classList.toggle('on', v));
    (async function loop() {
      for (;;) {
        await waitVis(dg);
        for (let i = 0; i < 3; i++) { on(i, true); await sleep(1700); }
        await sleep(4200);
        for (let i = 0; i < 3; i++) on(i, false);
        await sleep(1200);
      }
    })();
  }

  function casos() {
    const bgs = $$('#csBgs .cs-slide'), cards = $$('#csCards [data-slide]'); if (!bgs.length) return;
    let i = 0, timer;
    function show(n) {
      const prev = i; i = (n + bgs.length) % bgs.length;
      bgs.forEach((b, j) => {
        const a = j === i;
        b.dataset.on = a ? '1' : '0';
        if (a) { b.style.zIndex = '2'; b.style.transition = 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 1800ms cubic-bezier(0.22, 1, 0.36, 1)'; b.style.opacity = '1'; b.style.transform = 'scale(1)'; const kb = b.querySelector('.cs-kb'); kb.style.animation = 'none'; kb.offsetWidth; kb.style.animation = ''; }
        else { b.style.zIndex = j === prev ? '1' : '0'; b.style.transition = 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 0ms linear 900ms'; b.style.opacity = '0'; b.style.transform = 'scale(1.04)'; }
      });
      cards.forEach((c, j) => {
        const a = j === i;
        c.dataset.active = String(a); c.setAttribute('aria-hidden', String(!a)); c.inert = !a;
        c.style.transition = a ? 'opacity 560ms cubic-bezier(0.22, 1, 0.36, 1) 220ms, transform 720ms cubic-bezier(0.22, 1, 0.36, 1) 220ms' : 'opacity 240ms ease-in, transform 0ms linear 240ms';
        c.style.opacity = a ? '1' : '0'; c.style.transform = a ? 'translateY(0)' : 'translateY(10px)';
      });
      sceneKick(bgs[i]);
    }
    const restart = () => { clearInterval(timer); timer = setInterval(() => { if ($('#csBgs')._vis !== false) show(i + 1); }, 6500); };
    $('#csNext').addEventListener('click', () => { show(i + 1); restart(); });
    $('#csPrev').addEventListener('click', () => { show(i - 1); restart(); });
    io.observe($('#csBgs'));
    restart(); sceneKick(bgs[0]);
  }
  function sceneKick(slide) {
    const kind = slide.querySelector('.cs-kb').dataset.scene;
    if (kind === 'sched') {
      const bars = $$('.bars i', slide); bars.forEach(b => b.style.height = '0');
      setTimeout(() => bars.forEach((b, k) => setTimeout(() => b.style.height = b.dataset.h + '%', k * 70)), 250);
    } else if (kind === 'desk') {
      const rows = $$('.am[data-k]', slide); let n = 3;
      const paint = () => rows.forEach(r => { const k = +r.dataset.k; r.className = 'am' + (k < n ? ' paid' : k === n ? ' now' : ''); r.querySelector('.chip').textContent = k < n ? 'Pagado' : k === n ? 'En curso' : 'Programado'; });
      paint(); setTimeout(() => { n = 4; paint(); }, 1500);
    } else if (kind === 'wallet') {
      const bal = $('.wbal', slide); let v = 3980.5; bal.textContent = '$' + fmt(v);
      const t0 = performance.now(), from = 3980.5, to = 12480.5;
      const step = now => { const k = clamp((now - t0 - 700) / 1100, 0, 1); bal.textContent = '$' + fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
  }

  /* ---------- boot ---------- */
  let raf = 0;
  const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; themeTick(); heroTick(); }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { fit(); onScroll(); });
  fit(); themeTick(); heroTick();
  if (document.fonts) document.fonts.ready.then(fit);
  if (!reduce) { heroApp(); r1(); r3(); r4(); r5(); }
  casos();
  $$('.rnd').forEach(r => io.observe(r)); io.observe($('#dg'));
})();
