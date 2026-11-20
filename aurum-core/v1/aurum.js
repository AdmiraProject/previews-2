(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[aurum]', name, e); } };
  const byText = (root, t, sel = '*') => $$(sel, root).find(e => e.childElementCount === 0 && e.textContent.trim() === t);
  const closestBig = (el, minH) => { let p = el; while (p && p.getBoundingClientRect().height < minH) p = p.parentElement; return p; };
  function inView(el, cb, opt = {}) {
    if (!el) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { cb(true); if (opt.once !== false) io.disconnect(); }
      else if (opt.once === false) cb(false);
    }), { threshold: opt.threshold ?? 0.25, rootMargin: opt.margin || '0px' });
    io.observe(el);
  }
  async function typeInto(el, text, cps = 28) {
    el.textContent = ''; el.classList.add('aurum-caret');
    for (const ch of text) { el.textContent += ch; await sleep(1000 / cps + Math.random() * 18); }
    el.classList.remove('aurum-caret');
  }
  // reveal all text in a block word by word (streaming)
  async function stream(root, wps = 38) {
    const nodes = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) if (n.textContent.trim()) nodes.push([n, n.textContent]);
    nodes.forEach(([n]) => n.textContent = '');
    for (const [n, t] of nodes) {
      const parts = t.split(/(\s+)/);
      for (const p of parts) { n.textContent += p; if (p.trim()) await sleep(1000 / wps); }
    }
  }
  const main = $('main');
  const secs = main ? [...main.children] : [];
  const header = $('header');

  /* ---------------- header: banner, dark mode over dark sections, menus ---------------- */
  safe('header', () => {
    const bannerBtn = header.querySelector('[data-banner-uid] button');
    if (bannerBtn) bannerBtn.addEventListener('click', () => { const b = header.querySelector('[data-banner-uid]'); b.style.display = 'none'; document.documentElement.style.setProperty('--site-header-height', '68px'); });
    const darks = () => $$('section.dark, footer, main > div.relative.isolate').filter(Boolean);
    const onScroll = () => {
      const y = header.getBoundingClientRect().bottom - 1;
      const dark = darks().some(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
      header.classList.toggle('dark', dark);
      document.body.toggleAttribute('data-scrolled', scrollY > 2);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // mega menus
    const triggers = $$('nav ul > li > button', header);
    const panels = $$('[data-closed][hidden]', header).filter(p => p.parentElement && p.parentElement.closest('nav'));
    const popup = $$('nav[data-side]', header)[0];
    const holder = popup && popup.parentElement;
    const panes = popup ? [...popup.querySelectorAll(':scope > div > div')] : [];
    let closeT;
    const open = i => {
      clearTimeout(closeT);
      if (!holder) return;
      [holder, popup].forEach(e => { e.hidden = false; e.removeAttribute('data-closed'); e.setAttribute('data-open', ''); });
      holder.style.cssText += ';position:absolute;top:100%;left:0;z-index:100;';
      panes.forEach((p, k) => { p.hidden = k !== i; p.toggleAttribute('data-closed', k !== i); if (k === i) p.setAttribute('data-open', ''); else p.removeAttribute('data-open'); });
      triggers.forEach((t, k) => t.toggleAttribute('data-popup-open', k === i));
    };
    const close = () => { closeT = setTimeout(() => { if (!holder) return; holder.hidden = true; popup.hidden = true; triggers.forEach(t => t.removeAttribute('data-popup-open')); }, 120); };
    triggers.forEach((t, i) => { t.addEventListener('mouseenter', () => open(i)); t.addEventListener('focus', () => open(i)); t.addEventListener('mouseleave', close); t.addEventListener('click', () => open(i)); });
    if (holder) { holder.addEventListener('mouseenter', () => clearTimeout(closeT)); holder.addEventListener('mouseleave', close); }
    // mobile menu → demo link
    const mob = header.querySelector('[data-site-header-mobile-menu-trigger]');
    if (mob) mob.addEventListener('click', () => window.open('https://meetings.hubspot.com/alejandroflores/aurumcore-mktg-fafm', '_blank'));
  });

  safe('portal', () => {
    const win = $('[data-home-hero="attio-window"]'); if (!win) return;
    window.__aurumPortal = true;
    const kids = [...win.children]; const bar = kids[0]; const body = kids.slice(1);
    const bodyH = body.reduce((h, k) => h + k.getBoundingClientRect().height, 0) || 590;
    body.forEach(k => k.style.display = 'none');
    const host = document.createElement('div'); host.className = 'pa-host'; host.style.height = Math.round(bodyH) + 'px'; win.append(host);
    const NAV = [
      ['Operación', [['inicio', 'Inicio'], ['mov', 'Movimientos'], ['conc', 'Conciliación'], ['cuentas', 'Cuentas']]],
      ['Productos', [['fab', 'Fábrica de productos'], ['deb', 'Motor de Débito'], ['cred', 'Motor de Crédito'], ['inv', 'Motor de Inversión']]],
      ['Clientes', [['kyc', 'Expedientes y KYC'], ['aten', 'Atención al cliente']]],
      ['Plataforma', [['orq', 'Orquestador'], ['con', 'Conectores'], ['rep', 'Reportes'], ['api', 'API']]],
    ];
    const ICO = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="3"/></svg>';
    host.innerHTML = `<div class="pa" style="--k:1">
      <aside class="pa-side">
        <div class="pa-ws"><img src="../assets/brand/icon.png" alt=""><b>Mi Institución</b><span>▾</span></div>
        <div class="pa-search">Buscar cuenta, CLABE o folio <kbd>⌘K</kbd></div>
        ${NAV.map(([g, items]) => `<div class="pa-g"><small>${g}</small>${items.map(([k, l]) => `<div class="pa-i" data-k="${k}">${ICO}<span>${l}</span>${k === 'mov' ? '<em>en vivo</em>' : ''}</div>`).join('')}</div>`).join('')}
        <div class="pa-env"><i></i>Producción · tiempo real</div>
      </aside>
      <main class="pa-main">
        <div class="pa-top"><span class="pa-crumb"></span><div class="pa-tg"><span>Sandbox</span><span class="on">Producción</span></div><span class="pa-me">AR</span></div>
        <div class="pa-stage"></div>
      </main></div>`;
    const scale = () => { const w = host.getBoundingClientRect().width; const pa = host.firstElementChild; const k = w / 1068; pa.style.transform = `scale(${k})`; pa.style.width = '1068px'; pa.style.height = (host.getBoundingClientRect().height / k) + 'px'; };
    scale(); addEventListener('resize', scale);
    const stage = host.querySelector('.pa-stage'), crumb = host.querySelector('.pa-crumb');
    const money = n => '$' + Math.round(n).toLocaleString('en-US');
    const count = (el, to, ms, f) => { const t0 = performance.now(); const st = now => { const u = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - u, 3); el.textContent = f(to * e); if (u < 1 && el.isConnected) requestAnimationFrame(st); }; requestAnimationFrame(st); };
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const SCENES = {
      inicio: () => {
        crumb.innerHTML = 'Operación › <b>Inicio</b>';
        stage.innerHTML = `<div class="ps-h"><b>Buenos días, Ana</b><small>Así va la operación de tu institución hoy.</small></div>
          <div class="ps-k">
            <div><small>Saldo en cuentas</small><b data-v="48230915" data-f="m">$0</b><em class="up">+2.4% vs ayer</em></div>
            <div><small>Movimientos hoy</small><b data-v="18452" data-f="n">0</b><em>SPEI, tarjeta y depósitos</em></div>
            <div><small>Dispersado vía SPEI</small><b data-v="6240000" data-f="m">$0</b><em>148 operaciones</em></div>
            <div><small>Conciliado</small><b data-v="99.8" data-f="p">0%</b><em class="up">3 por validar</em></div></div>
          <div class="ps-grid"><div class="ps-card"><div class="ps-ct">Movimientos en tiempo real <span class="ps-live"><i></i>en vivo</span></div><div class="ps-feed"></div></div>
          <div class="ps-card"><div class="ps-ct">Conectores</div>${[['SPEI', 'Operando'], ['KYC', 'Operando'], ['PLD y Antifraude', 'Operando'], ['Tarjetas', 'Operando'], ['Depósitos referenciados', 'Operando']].map(([a, b]) => `<div class="ps-con"><i></i><span>${a}</span><em>${b}</em></div>`).join('')}</div></div>`;
        $$('.ps-k b', stage).forEach(b => count(b, +b.dataset.v, 1300, v => b.dataset.f === 'm' ? money(v) : b.dataset.f === 'p' ? v.toFixed(1) + '%' : Math.round(v).toLocaleString('en-US')));
        const F = [['SPEI recibido', 'Ferretería Robles', '+$48,200.00', 'Liquidado'], ['Compra autorizada', 'Tarjeta ••0042', '−$318.90', 'Autorizado'], ['Dispersión de nómina', 'Lote 14 · 148 pagos', '−$6.2M', 'Enviado'], ['Reverso', 'Cuenta ••0042', '+$1,250.00', 'Aplicado'], ['Pago de crédito', 'Crédito ••2041', '+$2,310.00', 'Aplicado'], ['Remesa recibida', 'Mario Sánchez', '+US$250.00', 'Liquidado'], ['Depósito referenciado', 'Café Origen', '+$12,000.00', 'Conciliado']];
        const feed = stage.querySelector('.ps-feed'); let i = 0;
        const push = () => { if (!feed.isConnected) return; const [a, b, c, d] = F[i++ % F.length]; const r = document.createElement('div'); r.className = 'ps-row'; r.innerHTML = `<span class="ps-dot ${c[0] === '+' ? 'in' : 'out'}"></span><div><b>${a}</b><small>${b}</small></div><b class="${c[0] === '+' ? 'pos' : ''}">${c}</b><span class="ps-st">${d}</span>`; feed.prepend(r); while (feed.children.length > 5) feed.lastChild.remove(); later(push, 950); };
        push(); push(); push();
      },
      conc: () => {
        crumb.innerHTML = 'Operación › <b>Conciliación</b>';
        const R = [['SPEI 7781204', 'Transportes Del Valle', '$184,250.00'], ['SPEI 7781219', 'Grupo Altamar', '$62,500.00'], ['Ref. 004512', 'Café Origen', '$12,000.00'], ['SPEI 7781233', 'Clínica San Ángel', '$31,200.00'], ['Ref. 004518', 'Panadería La Espiga', '$4,380.00'], ['SPEI 7781240', 'Distribuidora Norte', '$96,000.00']];
        stage.innerHTML = `<div class="ps-h"><b>Corte SPEI 2 · 14:30</b><small>Cada movimiento del banco contra tu ledger, en automático.</small></div>
          <div class="ps-bar"><div><small>Conciliados</small><b class="cc">0</b> de 615</div><div class="ps-prog"><i></i></div><span class="ps-chip">Ledger ↔ SPEI</span></div>
          <div class="ps-card ps-tbl"><div class="ps-th"><span>Folio</span><span>Contraparte</span><span>Monto</span><span>Ledger</span><span>Estado</span></div>
          ${R.map(r => `<div class="ps-tr"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span class="ps-led">—</span><span class="ps-s">Por conciliar</span></div>`).join('')}</div>`;
        const cc = stage.querySelector('.cc'); count(cc, 612, 4200, v => Math.round(v)); stage.querySelector('.ps-prog i').style.width = '99.5%';
        $$('.ps-tr', stage).forEach((tr, j) => later(() => { tr.querySelector('.ps-led').textContent = tr.children[2].textContent; tr.classList.add('ok'); tr.querySelector('.ps-s').textContent = j === 4 ? 'Por validar' : '✓ Conciliado'; if (j === 4) tr.classList.add('warn'); }, 700 + j * 550));
      },
      kyc: () => {
        crumb.innerHTML = 'Clientes › <b>Expedientes y KYC</b>';
        const S = ['Identificación oficial', 'Prueba de vida', 'CURP y RFC', 'Listas PLD', 'Score de riesgo'];
        stage.innerHTML = `<div class="ps-h"><b>Alta de cliente · Laura Méndez</b><small>Onboarding digital desde la app, validado en segundos.</small></div>
          <div class="ps-grid"><div class="ps-card"><div class="ps-ct">Validaciones</div>${S.map((s, j) => `<div class="ps-chk"><span class="ps-ci">${j + 1}</span><span>${s}</span><em>Pendiente</em></div>`).join('')}</div>
          <div class="ps-card ps-acc"><div class="ps-ct">Cuenta</div><div class="ps-new"><small>Cuenta de débito</small><b>Creando…</b><div class="ps-clabe">CLABE ———— ———— ——</div><div class="ps-cardmini"><img src="../assets/brand/aurum_logo_white.png" alt=""><span>•••• 4821</span></div></div></div></div>`;
        const rows = $$('.ps-chk', stage);
        rows.forEach((r, j) => later(() => { r.classList.add('ok'); r.querySelector('em').textContent = j === 4 ? 'Bajo' : '✓ Aprobado'; r.querySelector('.ps-ci').textContent = '✓'; }, 600 + j * 650));
        later(() => { const n = stage.querySelector('.ps-new'); n.classList.add('ok'); n.querySelector('b').textContent = 'Cuenta ••4821 activa'; n.querySelector('.ps-clabe').textContent = 'CLABE 0123 4500 1234 4821'; }, 600 + 5 * 650 + 300);
      },
      cred: () => {
        crumb.innerHTML = 'Productos › <b>Motor de Crédito</b>';
        stage.innerHTML = `<div class="ps-h"><b>Dispersión · Crédito de nómina</b><small>Lote 14 · 148 créditos aprobados, enviados por SPEI.</small></div>
          <div class="ps-bar"><div><small>Enviados</small><b class="dd">0</b> de 148</div><div class="ps-prog g"><i></i></div><b class="ds">$0</b></div>
          <div class="ps-card ps-disp">${[['Crédito ••2041', '$15,000.00'], ['Crédito ••2038', '$8,500.00'], ['Crédito ••2035', '$22,000.00'], ['Crédito ••2031', '$45,000.00'], ['Crédito ••2027', '$31,200.00']].map(([a, b]) => `<div class="ps-dr"><span>${a}</span><b>${b}</b><div class="ps-lane"><i></i></div><em>Liquidada</em></div>`).join('')}</div>`;
        count(stage.querySelector('.dd'), 148, 4000, v => Math.round(v)); count(stage.querySelector('.ds'), 6240000, 4000, money); stage.querySelector('.ps-prog i').style.width = '100%';
        $$('.ps-dr', stage).forEach((r, j) => later(() => r.classList.add('go'), 300 + j * 500));
      },
    };
    const ORDER = ['inicio', 'conc', 'kyc', 'cred'];
    let n = 0;
    const show = () => {
      timers.forEach(clearTimeout); timers = [];
      const k = ORDER[n++ % ORDER.length];
      $$('.pa-i', host).forEach(i => i.classList.toggle('on', i.dataset.k === k));
      stage.classList.remove('in'); void stage.offsetWidth; SCENES[k](); stage.classList.add('in');
      if (!RM) setTimeout(show, 8200);
    };
    show();
  });

  /* ---------------- hero ---------------- */
  safe('hero', () => {
    const win = $('[data-home-hero="attio-window"]');
    if (!win) return;
    const apps = $$('[data-home-hero="desktop-window"]');
    // pill border sheen
    const pill = $('[style*="--angle"]');
    if (pill && !RM) { let a = -80; const tick = () => { a = (a + 0.6) % 360; pill.style.setProperty('--angle', a + 'deg'); requestAnimationFrame(tick); }; tick(); }
    const group = win.closest('[class*="group/hero"]') || win.closest('section');
    const hs = () => {
      const base = innerWidth >= 1024 ? Math.min(1, 1 - Math.max(0, 800 - innerHeight) * 0.000466) : 1;
      const k = Math.min(1, scrollY / 56); const s = base * (1 - 0.05 * k);
      [win, ...apps].forEach(e => e.style.transform = s < 0.9999 ? `scale(${s.toFixed(4)})` : 'none');
      if (group) group.toggleAttribute('data-hero-scrolling', scrollY > 0);
      if (copy) { const on = scrollY > 0; copy.style.opacity = on ? '0' : '1'; copy.style.filter = on ? 'blur(2.5px)' : 'none'; }
    };
    const copy = $$('[class*="sticky"]', win.closest('section')).find(e => /-mb-\[min\(/.test(e.className));
    if (copy) copy.style.transition = 'opacity .45s cubic-bezier(.22,1,.36,1), filter .45s cubic-bezier(.22,1,.36,1)';
    addEventListener('resize', hs);
    addEventListener('scroll', hs, { passive: true }); hs();
    $$('[style*="filter: blur(3px)"]').forEach((w, i) => { w.style.transition = 'opacity .9s ease, filter .9s ease'; setTimeout(() => { w.style.opacity = '1'; w.style.filter = 'none'; }, 500 + i * 180); });
    // call visual
    $$('.aurum-callvis').forEach(v => { v.innerHTML = '<div class="aurum-callvis__av">C</div><div class="aurum-callvis__wave">' + Array.from({ length: 22 }, (_, i) => `<i style="animation-delay:${(i * 73) % 900}ms"></i>`).join('') + '</div>'; });
    // scene timeline
    const store = {}; $$('#aurum-scene-store template').forEach(t => store[t.dataset.t] = t);
    const content = () => [...win.children].slice(1); // first child is the traffic-light bar
    let cur = null;
    const apply = key => {
      const t = store[key]; if (!t || cur === key) return null; cur = key;
      const tmp = document.createElement('div'); tmp.innerHTML = t.innerHTML;
      const newKids = [...tmp.children].slice(1);
      const old = content();
      old.forEach(o => o.remove()); newKids.forEach(k => win.append(k));
      if (window.__aurumRecolor) requestAnimationFrame(() => window.__aurumRecolor(win));
      return win;
    };
    const Q = '¿Cuánto dispersamos hoy vía SPEI?';
    const T = [
      [0, () => apply('1500')],
      [2000, () => { apply('3500'); const el = byText(win, Q, 'span'); if (el && !RM) typeInto(el, Q, 26); }],
      [4800, () => { apply('6000'); const th = byText(win, 'Analizando', 'span'); if (th) th.classList.add('aurum-shimmer'); }],
      [6800, () => { apply('8800'); const h = byText(win, 'Dispersiones SPEI · hoy'); const blk = h && h.closest('div').parentElement; if (blk && !RM) stream(blk, 42); }],
      [9600, () => apply('12000')],
      [10600, () => { apply('15500'); dmFill(); }],
      [16100, () => apply('19000')],
      [21000, () => apply('24000')],
      [26000, () => apply('29000')],
      [30000, () => apply('32500')],
      [33300, () => { apply('38500'); opsDashboard(win); }],
    ];
    const LOOP = 39700;
    function dmFill() {
      const vals = ['Aprobado', 'En revisión', 'Pendiente', 'Bajo', 'Medio'];
      const cells = $$('span', win).filter(s => s.childElementCount === 0 && vals.includes(s.textContent.trim()));
      cells.forEach(c => {
        const pill = c.closest('div'); const host = pill.parentElement; const keep = pill.cloneNode(true);
        const ph = document.createElement('span'); ph.textContent = 'Verificando...'; ph.className = 'aurum-shimmer'; ph.style.cssText = 'font-size:12px;font-weight:500';
        pill.replaceWith(ph);
        setTimeout(() => { if (ph.isConnected) { ph.replaceWith(keep); keep.animate([{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' }); } }, 500 + Math.random() * 3400);
      });
    }
    let t0 = performance.now(), next = 0;
    const loop = () => {
      const t = (performance.now() - t0);
      if (t >= LOOP) { t0 = performance.now(); next = 0; cur = null; }
      while (next < T.length && t >= T[next][0]) { safe('scene' + next, T[next][1]); next++; }
      requestAnimationFrame(loop);
    };
    if (window.__aurumPortal) { /* portal replaces Attio scenes */ } else if (!RM) loop(); else apply('8800');
    // terminal: sequential reveal
    const term = $('[data-home-hero-app="terminal"]');
    if (term && !RM) {
      const lines = $$('p', term).filter(p => !/sandbox|API Multicanal/.test(p.textContent));
      const run = async () => {
        while (true) {
          lines.forEach((p, i) => { if (i > 0) p.style.opacity = '0'; });
          for (let i = 1; i < lines.length; i++) { await sleep(i === 1 ? 900 : 520); lines[i].style.transition = 'opacity .3s'; lines[i].style.opacity = '1'; }
          await sleep(6000);
        }
      };
      run();
    }
    // chat: reply appears
    const chat = $('[data-home-hero-app="slack"]');
    if (chat && !RM) {
      const ps = $$('p', chat); const reply = ps.slice(-2);
      const run = async () => { while (true) { reply.forEach(p => p.style.opacity = '0'); await sleep(1600); for (const p of reply) { p.style.transition = 'opacity .4s'; p.style.opacity = '1'; await sleep(250); } await sleep(9000); } };
      run();
    }
    // call: transcript slow scroll + timer
    const call = $('[data-home-hero-app="call"]');
    if (call && !RM) {
      const tr = $$('p', call)[0]; const box = tr && tr.parentElement && tr.parentElement.parentElement;
      if (box) { let y = 0; const lst = box.firstElementChild || box; setInterval(() => { y = (y + 1) % Math.max(1, box.scrollHeight - box.clientHeight + 40); box.scrollTop = y; }, 60); }
      const tm = byText(call, '10:00', 'span');
      if (tm) { let s = 600; setInterval(() => { s++; tm.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000); }
    }
  });


  function opsDashboard(win) {
    const t = $$('*', win).filter(e => e.childElementCount === 0 && e.textContent.trim() === 'Métricas de la institución');
    if (!t.length) return;
    let pane = t[t.length - 1];
    while (pane && pane.parentElement && !/Acciones rápidas/.test(pane.parentElement.innerText || '')) pane = pane.parentElement;
    if (!pane) return;
    pane.innerHTML = `<div class="od">
      <div class="od-bar"><span class="od-crumb">Reportes › <b>Operación en vivo</b></span><span class="od-live"><i></i>En vivo</span></div>
      <div class="od-head"><b>Operación de hoy</b><small>Saldos, movimientos y conciliación de tu institución en tiempo real.</small></div>
      <div class="od-kpis">
        <div><small>Saldo en cuentas</small><b data-to="48230915">$0</b><em class="up">+2.4% vs ayer</em></div>
        <div><small>Movimientos hoy</small><b data-to="18452" data-int>0</b><em>SPEI, tarjeta y depósitos</em></div>
        <div><small>Dispersado vía SPEI</small><b data-to="6240000">$0</b><em>148 operaciones</em></div>
        <div><small>Conciliación</small><b data-to="99.8" data-pct>0%</b><em class="up">3 por validar</em></div>
      </div>
      <div class="od-grid">
        <div class="od-card"><div class="od-ct">Movimientos en tiempo real</div><div class="od-feed"></div></div>
        <div class="od-card"><div class="od-ct">Movimientos por canal</div><div class="od-ch">
          ${[['App móvil', 46], ['Web', 21], ['Tarjeta', 18], ['Call center', 9], ['Chatbot', 6]].map(([n, v]) => `<div class="od-chr"><span>${n}</span><div><i style="--w:${v}%"></i></div><b>${v}%</b></div>`).join('')}
        </div><div class="od-recon"><div class="od-ct">Corte SPEI 2 · 14:30</div><div class="od-rb"><i></i></div><small><b>612</b> conciliados · <b>3</b> por validar</small></div></div>
      </div></div>`;
    const money = n => '$' + Math.round(n).toLocaleString('en-US');
    $$('.od-kpis b', pane).forEach(b => { const to = +b.dataset.to, t0 = performance.now(); const st = now => { const u = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - u, 3), v = to * e; b.textContent = b.hasAttribute('data-pct') ? v.toFixed(1) + '%' : b.hasAttribute('data-int') ? Math.round(v).toLocaleString('en-US') : money(v); if (u < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); });
    requestAnimationFrame(() => pane.querySelector('.od').classList.add('is-in'));
    const FEED = [['SPEI recibido', 'Ferretería Robles', '+$48,200.00', 'Liquidado'], ['Compra autorizada', 'Tarjeta ••0042', '−$318.90', 'Autorizado'], ['Dispersión nómina', 'Crédito ••2041', '−$15,000.00', 'Enviado'], ['Reverso', 'Cuenta ••0042', '+$1,250.00', 'Aplicado'], ['Pago de crédito', 'Ana Ruiz', '+$2,310.00', 'Aplicado'], ['Remesa recibida', 'Mario Sánchez', '+US$250.00', 'Liquidado'], ['Depósito referenciado', 'Café Origen', '+$12,000.00', 'Conciliado']];
    const feed = pane.querySelector('.od-feed'); let i = 0;
    const push = () => { if (!feed.isConnected) return; const [a, b, c, d] = FEED[i++ % FEED.length]; const row = document.createElement('div'); row.className = 'od-row'; row.innerHTML = `<span class="od-dot ${c.startsWith('+') ? 'in' : 'out'}"></span><div><b>${a}</b><small>${b}</small></div><b class="${c.startsWith('+') ? 'pos' : ''}">${c}</b><span class="od-st">${d}</span>`; feed.prepend(row); while (feed.children.length > 5) feed.lastChild.remove(); setTimeout(push, 900); };
    push(); push(); push();
  }

  function growCharts(root) {
    const rects = $$('svg rect', root).filter(r => +r.getAttribute('height') > 4 && +r.getAttribute('width') < 60);
    rects.forEach((r, i) => { r.classList.add('aurum-grow'); r.style.transitionDelay = (i % 12) * 40 + 'ms'; });
    $$('svg path', root).forEach(p => { try { const L = p.getTotalLength(); if (L > 80 && p.getAttribute('fill') === 'none') { p.style.setProperty('--len', L); p.classList.add('aurum-draw'); } } catch (e) {} });
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.aurum-grow, .aurum-draw', root).forEach(e => e.classList.add('is-in'))));
  }

  /* ---------------- platform: scroll-spy nav + per-feature motion ---------------- */
  safe('platform', () => {
    const plat = secs.find(s => s.querySelector('[data-feature-id]')); if (!plat) return;
    const ids = ['home-2026-generate-pipeline', 'home-2026-convert-leads', 'home-2026-run-sales-motions', 'home-2026-forecast-revenue', 'home-2026-retain-and-expand'];
    const arts = $$('article', plat);
    arts.forEach((a, i) => { if (!a.id) a.id = ids[i]; a.style.scrollMarginTop = '140px'; });
    const deskLinks = $$('ol.hidden a', plat); const mobLinks = $$('[data-feature-id]', plat);
    const indicator = deskLinks[0] && deskLinks[0].querySelector('span[aria-hidden]');
    const setActive = i => {
      deskLinks.forEach((a, k) => {
        const t = a.querySelector('span:not([aria-hidden])'); if (!t) return;
        t.classList.toggle('text-primary-foreground', k === i); t.classList.toggle('text-[color:var(--nav-idle)]', k !== i);
        if (k === i) { a.setAttribute('aria-current', 'location'); if (indicator && indicator.parentElement !== a) { a.prepend(indicator); indicator.animate([{ transform: 'scaleY(.4)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' }); } }
        else a.removeAttribute('aria-current');
      });
      mobLinks.forEach((a, k) => { a.classList.toggle('bg-surface-subtle', k === i); a.classList.toggle('text-primary-foreground', k === i); a.classList.toggle('bg-secondary-background', k !== i); a.classList.toggle('text-tertiary-foreground', k !== i); });
    };
    const spy = () => { const mid = innerHeight * 0.45; let best = 0; arts.forEach((a, i) => { if (a.getBoundingClientRect().top < mid) best = i; }); setActive(best); };
    addEventListener('scroll', spy, { passive: true }); spy();
    [...deskLinks, ...mobLinks].forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href').slice(1); const t = document.getElementById(id); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }));
    if (RM) return;

    // 1 · cuentas table + transfer panel
    const a1 = arts[0];
    if (a1) {
      const rows = $$('span', a1).filter(s => s.childElementCount === 0 && ['Ferretería Robles', 'Ana Ruiz', 'Grupo Altamar', 'Lucía Navarro', 'Café Origen', 'Transportes Del Valle', 'Mario Sánchez', 'Clínica San Ángel', 'Sofía Herrera'].includes(s.textContent.trim()));
      const panelTitle = byText(a1, 'Transferencia a Transportes Del Valle', 'p');
      const panel = panelTitle && closestBig(panelTitle, 250);
      const body = $$('p', a1).find(p => /Concepto: pago factura/.test(p.textContent));
      const subj = byText(a1, 'Monto: $184,250.00 MXN', 'span');
      const table = rows[0] && closestBig(rows[0], 250);
      // collect cell rows by vertical position
      const cells = table ? $$('div > div > div', table).filter(d => d.childElementCount && d.getBoundingClientRect().height < 30 && d.getBoundingClientRect().height > 12) : [];
      const bodyText = body ? body.textContent : '';
      const prep = () => {
        cells.forEach(c => { c.style.opacity = '0'; c.style.transition = 'none'; });
        if (panel) { panel.style.opacity = '0'; panel.style.transform = 'translateX(16px)'; panel.style.transition = 'none'; }
        if (body) body.textContent = ''; if (subj) subj.textContent = '';
      };
      const play = async () => {
        const rowsY = [...new Set(cells.map(c => Math.round(c.getBoundingClientRect().top)))].sort((a, b) => a - b);
        cells.forEach(c => { const k = rowsY.indexOf(Math.round(c.getBoundingClientRect().top)); c.style.transition = `opacity .35s ease ${k * 70}ms`; c.style.opacity = '1'; });
        await sleep(rowsY.length * 70 + 500);
        if (panel) { panel.style.transition = 'opacity .45s ease, transform .6s cubic-bezier(.22,1,.36,1)'; panel.style.opacity = '1'; panel.style.transform = 'none'; }
        await sleep(450);
        if (subj) await typeInto(subj, 'Monto: $184,250.00 MXN', 40);
        if (body) await typeInto(body, bodyText, 75);
      };
      prep(); inView(a1, () => play(), { threshold: 0.3 });
      // search box typing loop
      const ask = byText(a1, 'Busca una cuenta o movimiento...', 'span');
      if (ask) {
        const qs = ['Reembolso de Ana Ruiz', 'Retenciones activas hoy', 'SPEI recibidos > $40,000'];
        inView(ask, async () => { let i = 0; while (true) { await sleep(1400); await typeInto(ask, qs[i++ % qs.length], 22); await sleep(2200); ask.textContent = 'Busca una cuenta o movimiento...'; } });
      }
    }
    // 2 · flow: badges complete in sequence + edge highlight
    const a2 = arts[1];
    if (a2) {
      const badges = $$('span', a2).filter(s => ['Completado', 'Disparado'].includes(s.textContent.trim())).map(s => s.closest('div').parentElement);
      const play = async () => { while (true) { badges.forEach(b => { b.style.opacity = '0'; b.style.transform = 'translateY(4px)'; b.style.transition = 'none'; }); await sleep(700); for (const b of badges) { b.style.transition = 'opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1)'; b.style.opacity = '1'; b.style.transform = 'none'; await sleep(850); } await sleep(4200); } };
      inView(a2, () => play());
    }
    // 3 · kanban: card travels Análisis → Aprobado
    const a3 = arts[2];
    if (a3) {
      const name = $$('span', a3).find(s => s.textContent.trim() === 'Crédito #2031');
      const card = name && closestBig(name, 100);
      const anchor = $$('span', a3).find(s => s.textContent.trim() === 'Crédito #2035');
      const anchorCard = anchor && closestBig(anchor, 100);
      if (card && anchorCard) {
        const play = async () => {
          while (true) {
            const a = anchorCard.getBoundingClientRect(), b = card.getBoundingClientRect();
            const dx = a.left - b.left, dy = (a.bottom + 8) - b.top;
            card.animate([
              { transform: `translate(${dx}px, ${dy}px)`, boxShadow: '0 0 0 rgba(0,0,0,0)' },
              { transform: `translate(${dx}px, ${dy - 6}px) rotate(-2.5deg)`, boxShadow: '0 14px 28px rgba(16,24,40,.16)', offset: 0.2 },
              { transform: `translate(${dx * 0.1}px, -6px) rotate(-2deg)`, boxShadow: '0 14px 28px rgba(16,24,40,.16)', offset: 0.75 },
              { transform: 'none', boxShadow: '0 0 0 rgba(0,0,0,0)' },
            ], { duration: 1900, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'both' });
            card.style.zIndex = 5; card.style.position = 'relative';
            await sleep(6500);
          }
        };
        inView(a3, () => setTimeout(play, 400));
      }
      // people cards vertical marquee
      const p0 = $$('span', a3).find(s => s.textContent.trim() === 'Miguel Juárez');
      const stack = p0 && closestBig(p0, 120);
      const lane = stack && stack.parentElement;
      if (lane && lane.children.length > 1) {
        const step = () => { const first = lane.firstElementChild; const h = first.getBoundingClientRect().height + 12; lane.animate([{ transform: 'none' }, { transform: `translateY(${-h}px)` }], { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = () => { lane.append(first); }; };
        inView(lane, () => setInterval(step, 2800));
      }
      // thinking → stream risk list
      const th = $$('span', a3).find(s => /^Analizando/.test(s.textContent.trim()));
      if (th) {
        const box = th.closest('div').parentElement.nextElementSibling || th.parentElement.parentElement.nextElementSibling;
        const ans = $$('p', a3).find(p => /Créditos en riesgo/.test(p.textContent));
        const blk = ans && ans.parentElement;
        if (blk) { const html = blk.innerHTML; blk.style.visibility = 'hidden'; th.classList.add('aurum-shimmer');
          inView(blk, async () => { await sleep(1300); th.classList.remove('aurum-shimmer'); blk.style.visibility = ''; await stream(blk, 40); }); }
      }
    }
    // 4 · SQL answer streams
    const a4 = arts[3];
    if (a4) {
      const lead = $$('p', a4).find(p => /Voy a consultar/.test(p.textContent));
      const blk = lead && lead.closest('div').parentElement;
      if (blk) { blk.style.visibility = 'hidden'; inView(blk, async () => { await sleep(500); blk.style.visibility = ''; await stream(blk, 55); }); }
    }
    // 5 · charts + list
    const a5 = arts[4];
    if (a5) {
      const chartBox = a5;
      $$('svg rect', a5).filter(r => +r.getAttribute('height') > 4 && +r.getAttribute('width') < 60).forEach((r, i) => { r.classList.add('aurum-grow'); r.style.transitionDelay = (Math.floor(i / 3) * 90 + (i % 3) * 30) + 'ms'; });
      $$('svg path', a5).forEach(p => { try { const L = p.getTotalLength(); if (L > 100 && (p.getAttribute('fill') === 'none' || !p.getAttribute('fill'))) { p.style.setProperty('--len', L); p.classList.add('aurum-draw'); } } catch (e) {} });
      inView(a5, () => $$('.aurum-grow, .aurum-draw', a5).forEach(e => e.classList.add('is-in')), { threshold: 0.3 });
      const lead = $$('p', a5).find(p => /depósitos que vencen/.test(p.textContent));
      const blk = lead && lead.parentElement;
      if (blk) { blk.style.visibility = 'hidden'; inView(blk, async () => { await sleep(700); blk.style.visibility = ''; await stream(blk, 60); }); }
      const sugg = $$('span', a5).filter(s => s.textContent.trim() === 'Sugerencia').map(s => closestBig(s, 60));
      sugg.forEach((s, i) => { if (!s) return; s.style.opacity = '0'; s.style.transform = 'translateY(10px)'; });
      inView(sugg[0], () => sugg.forEach((s, i) => { if (!s) return; s.style.transition = `opacity .5s ease ${i * 400}ms, transform .6s cubic-bezier(.22,1,.36,1) ${i * 400}ms`; s.style.opacity = i ? '.55' : '1'; s.style.transform = 'none'; }));
    }
  });

  safe('factory', () => {
    const plat = secs.find(s => s.querySelector('[data-feature-id]')); if (!plat) return;
    const art = $$('article', plat)[2]; if (!art) return;
    const col = $$('div', art).find(d => /\bh-\[291px\]/.test(d.className));
    if (!col) return;
    const panel = art.children[1];
    if (!panel) return;
    const H = Math.round(panel.getBoundingClientRect().height); panel.style.height = H + 'px'; panel.style.overflow = 'hidden';
    [...panel.children].forEach(c => c.style.display = 'none');
    panel.style.position = panel.style.position || 'relative';
    const PRODUCTS = [
      { n: 'Cuenta nómina', m: 'Motor de Débito', st: 'Activo' },
      { n: 'Tarjeta virtual', m: 'Motor de Débito', st: 'Activo' },
      { n: 'Crédito de nómina', m: 'Motor de Crédito', st: 'Borrador' },
      { n: 'Plazo fijo 90 días', m: 'Motor de Inversión', st: 'Borrador' },
      { n: 'Puntos de lealtad', m: 'Programa de recompensas', st: 'Activo' },
    ];
    const CONFIGS = [
      { idx: 2, name: 'Crédito de nómina', motor: 'Motor de Crédito', f1: ['Monto máximo', 5000, 50000, 35000], chips: ['12', '24', '36'], chip: 1, chipLabel: 'Plazo (meses)', f3: ['Tasa anual fija', '18.0%'], f4: ['Comisión por apertura', '$0.00'], toggle: ['Descuento vía nómina', true], preview: ['Crédito de nómina', 'Hasta $35,000 · 24 meses', 'Solicitar'] },
      { idx: 3, name: 'Plazo fijo 90 días', motor: 'Motor de Inversión', f1: ['Monto mínimo', 1000, 100000, 10000], chips: ['30', '90', '180'], chip: 1, chipLabel: 'Plazo (días)', f3: ['Rendimiento anual', '9.5%'], f4: ['Pago de rendimientos', 'Al vencimiento'], toggle: ['Reinversión automática', true], preview: ['Plazo fijo 90 días', 'Desde $10,000 · 9.5% anual', 'Invertir'] },
    ];
    const CH = ['App', 'Web', 'Call center', 'Chatbot'];
    const root = document.createElement('div'); root.className = 'af'; root.style.height = H + 'px';
    root.innerHTML = `
      <div class="af-card af-cat"><div class="af-h"><span>Fábrica de productos</span><span class="af-dot"></span></div>
        <div class="af-list">${PRODUCTS.map((p, i) => `<div class="af-item" data-i="${i}"><span class="af-ic af-ic${i}"></span><div class="af-tx"><b>${p.n}</b><small>${p.m}</small></div><span class="af-st ${p.st === 'Activo' ? 'on' : ''}">${p.st}</span></div>`).join('')}</div>
        <div class="af-new">+ Nuevo producto</div></div>
      <div class="af-card af-cfg">
        <div class="af-top"><div><small>Configurar producto</small><b class="af-name"></b></div><span class="af-motor"></span></div>
        <div class="af-field"><label class="af-f1l"></label><div class="af-val af-f1v"></div><div class="af-track"><i></i><em></em></div></div>
        <div class="af-field"><label class="af-chl"></label><div class="af-chips"></div></div>
        <div class="af-grid"><div class="af-field"><label class="af-f3l"></label><div class="af-val af-f3v"></div></div><div class="af-field"><label class="af-f4l"></label><div class="af-val af-f4v"></div></div></div>
        <div class="af-field af-tg"><label class="af-tgl"></label><span class="af-sw"></span></div>
        <div class="af-field"><label>Canales</label><div class="af-ch">${CH.map(c => `<span>${c}</span>`).join('')}</div></div>
        <div class="af-btn"><span>Publicar producto</span></div>
      </div>
      <div class="af-phone"><div class="af-screen"><div class="af-notch"></div><small>Mi app</small><div class="af-bal"><span>Saldo</span><b>$12,480.50</b></div><div class="af-prod"><span class="af-pi"></span><div><b class="af-pn"></b><small class="af-pd"></small></div><span class="af-pb"></span></div><div class="af-row"></div><div class="af-row"></div></div></div>`;
    panel.append(root);
    const q = s => root.querySelector(s);
    const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
    const items = $$('.af-item', root);
    const run = async () => {
      let k = 0;
      while (true) {
        const c = CONFIGS[k++ % CONFIGS.length];
        // reset
        root.classList.remove('is-pub'); q('.af-btn').classList.remove('is-load', 'is-done'); q('.af-btn span').textContent = 'Publicar producto';
        items.forEach(it => it.classList.remove('is-sel'));
        items[c.idx].querySelector('.af-st').textContent = 'Borrador'; items[c.idx].querySelector('.af-st').classList.remove('on');
        q('.af-name').textContent = ''; q('.af-motor').textContent = c.motor;
        q('.af-f1l').textContent = c.f1[0]; q('.af-chl').textContent = c.chipLabel; q('.af-f3l').textContent = c.f3[0]; q('.af-f4l').textContent = c.f4[0]; q('.af-tgl').textContent = c.toggle[0];
        q('.af-f1v').textContent = fmt(c.f1[1]); q('.af-f3v').textContent = '—'; q('.af-f4v').textContent = '—';
        q('.af-track').style.setProperty('--p', '0'); q('.af-sw').classList.remove('on');
        q('.af-chips').innerHTML = c.chips.map(x => `<span>${x}</span>`).join('');
        $$('.af-ch span', root).forEach(s => s.classList.remove('on'));
        q('.af-pn').textContent = c.preview[0]; q('.af-pd').textContent = c.preview[1]; q('.af-pb').textContent = c.preview[2];
        await sleep(500);
        items[c.idx].classList.add('is-sel');
        await sleep(450);
        await typeInto(q('.af-name'), c.name, 30);
        // slider
        const t0 = performance.now(), target = (c.f1[3] - c.f1[1]) / (c.f1[2] - c.f1[1]);
        await new Promise(res => { const st = now => { const u = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - u, 3); q('.af-track').style.setProperty('--p', (target * e).toFixed(3)); q('.af-f1v').textContent = fmt(c.f1[1] + (c.f1[3] - c.f1[1]) * e); u < 1 ? requestAnimationFrame(st) : res(); }; requestAnimationFrame(st); });
        await sleep(250);
        const chips = $$('.af-chips span', root); chips[0].classList.add('on'); await sleep(350); chips[0].classList.remove('on'); chips[c.chip].classList.add('on');
        await sleep(350); await typeInto(q('.af-f3v'), c.f3[1], 14);
        await sleep(150); await typeInto(q('.af-f4v'), c.f4[1], 18);
        await sleep(250); q('.af-sw').classList.add('on');
        for (const s of $$('.af-ch span', root)) { await sleep(220); s.classList.add('on'); }
        await sleep(500); q('.af-btn').classList.add('is-load'); q('.af-btn span').textContent = 'Publicando…';
        await sleep(1100); q('.af-btn').classList.replace('is-load', 'is-done'); q('.af-btn span').textContent = 'Publicado en 4 canales';
        items[c.idx].querySelector('.af-st').textContent = 'Activo'; items[c.idx].querySelector('.af-st').classList.add('on');
        root.classList.add('is-pub');
        await sleep(3600);
      }
    };
    if (RM) { root.classList.add('is-pub'); return; }
    inView(root, () => run(), { threshold: 0.3 });
  });

  function aurumRecolor(root = document) {
    const toRGB = s => { const m = (s || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/); return m ? [+m[1], +m[2], +m[3]] : null; };
    const hue = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return [0, 0, mx]; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, d / (1 - Math.abs(mx + mn - 1) || 1), (mx + mn) / 2]; };
    const map = c => { const [h, s, l] = hue(c); if (s < 0.45) return null; if (h >= 205 && h <= 240) return l > 0.8 ? '#F6E7BE' : l > 0.65 ? '#E8CB78' : '#B6802C'; if (h > 240 && h <= 290) return l > 0.8 ? '#DCE7EE' : '#365F7A'; return null; };
    root.querySelectorAll('svg *').forEach(el => {
      if (el.closest('.aurum-artwork, .af, .uw, .aurum-rim')) return;
      const cs = getComputedStyle(el);
      ['fill', 'stroke'].forEach(p => { const c = toRGB(cs[p]); if (c) { const n = map(c); if (n) el.style[p] = n; } });
      if (el.tagName === 'stop') { const c = toRGB(cs.stopColor); if (c) { const n = map(c); if (n) el.style.stopColor = n; } }
    });
    root.querySelectorAll('span, div').forEach(el => {
      if (el.childElementCount || el.closest('.af, .uw, .aurum-rim, .aurum-chip')) return;
      const r = el.getBoundingClientRect(); if (r.width > 14 || r.height > 14 || !r.width) return; // legend dots / small markers
      const c = toRGB(getComputedStyle(el).backgroundColor); if (c) { const n = map(c); if (n) el.style.backgroundColor = n; }
    });
  }
  window.__aurumRecolor = aurumRecolor;
  safe('recolor', () => aurumRecolor(document));

  safe('invest', () => {
    const plat = secs.find(s => s.querySelector('[data-feature-id]')); if (!plat) return;
    const art = $$('article', plat)[4]; if (!art) return;
    const anchor = $$('p, span', art).find(e => e.childElementCount === 0 && /Captación - Inversión/.test(e.textContent));
    if (!anchor) return;
    const panel = art.children[1];
    if (!panel) return;
    const H = Math.round(panel.getBoundingClientRect().height); panel.style.height = H + 'px'; panel.style.overflow = 'hidden';
    [...panel.children].forEach(c => c.style.display = 'none');
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    const ROWS = [['C', 'Café Origen', 'Plazo fijo 90 días', '$107,000', 'Reinvertir', 'Reinvertido'], ['C', 'Clínica San Ángel', 'Plazo fijo 180 días', '$86,000', 'Reinvertir', 'Reinvertido'], ['M', 'Mario Sánchez', 'Plazo fijo 30 días', '$25,000', 'Pagar a cuenta', 'Pagado a cuenta'], ['L', 'Lucía Navarro', 'Inversión a la vista', '$48,300', 'Reinvertir', 'Reinvertido']];
    const root = document.createElement('div'); root.className = 'iv'; root.style.height = H + 'px';
    root.innerHTML = `
      <div class="iv-card iv-main">
        <div class="iv-top"><div><small>Motor de Inversión</small><b>Plazo fijo · Cuenta ••0107</b></div><span class="iv-tag">Activo</span></div>
        <div class="iv-body">
          <div class="iv-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="iv-bg"/><circle cx="60" cy="60" r="50" class="iv-fg" pathLength="1"/></svg><div class="iv-day"><b>0</b><small>de 90 días</small></div></div>
          <div class="iv-kpis">
            <div><small>Capital</small><b class="iv-cap">$100,000.00</b></div>
            <div><small>Rendimiento anual</small><b>9.5%</b></div>
            <div><small>Intereses generados</small><b class="iv-int pos">$0.00</b></div>
          </div>
        </div>
        <div class="iv-foot"><span>Reinversión automática</span><span class="iv-sw on"></span><em class="iv-ev"></em></div>
      </div>
      <div class="iv-card iv-list">
        <div class="iv-top"><div><small>Vencimientos de esta semana</small><b>4 depósitos · $266,300</b></div></div>
        ${ROWS.map((r, i) => `<div class="iv-row" data-i="${i}"><span class="iv-av a${i}">${r[0]}</span><div class="iv-tx"><b>${r[1]}</b><small>${r[2]}</small></div><b class="iv-amt">${r[3]}</b><span class="iv-act" data-done="${r[5]}">${r[4]}</span></div>`).join('')}
      </div>`;
    panel.append(root);
    const q = s => root.querySelector(s);
    const money = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const run = async () => {
      let cap = 100000;
      while (true) {
        q('.iv-ev').textContent = ''; root.classList.remove('is-mature');
        $$('.iv-act', root).forEach(a => { a.classList.remove('done'); a.textContent = a.dataset.done.startsWith('Pagado') ? 'Pagar a cuenta' : 'Reinvertir'; });
        $$('.iv-row', root).forEach(r => r.classList.remove('is-in'));
        $$('.iv-row', root).forEach((r, i) => setTimeout(() => r.classList.add('is-in'), 150 + i * 120));
        const t0 = performance.now(), D = 4200, rate = 0.095 * 90 / 365;
        await new Promise(res => { const st = now => { const u = Math.min(1, (now - t0) / D); q('.iv-fg').style.strokeDashoffset = (1 - u).toFixed(4); q('.iv-day b').textContent = Math.round(u * 90); q('.iv-int').textContent = money(cap * rate * u); u < 1 ? requestAnimationFrame(st) : res(); }; requestAnimationFrame(st); });
        root.classList.add('is-mature'); q('.iv-ev').textContent = '✓ Reinvertido al vencimiento';
        await sleep(900);
        cap = Math.round(cap * (1 + rate) * 100) / 100; q('.iv-cap').textContent = money(cap);
        for (const a of $$('.iv-act', root)) { await sleep(420); a.classList.add('done'); a.textContent = '✓ ' + a.dataset.done; }
        await sleep(2600);
        q('.iv-fg').style.strokeDashoffset = '1'; q('.iv-day b').textContent = '0'; q('.iv-int').textContent = money(0);
        if (cap > 120000) { cap = 100000; q('.iv-cap').textContent = money(cap); }
        await sleep(500);
      }
    };
    if (RM) return;
    inView(root, () => run(), { threshold: 0.3 });
  });

  /* ---------------- self-building record: blocks fill in ---------------- */
  safe('selfbuild', () => {
    const sb = secs.find(s => /Listo desde el día uno/.test(s.innerText || '')); if (!sb || RM) return;
    const rec = $$('span', sb).find(s => s.textContent.trim() === 'Resumen');
    const box = rec && closestBig(rec, 300);
    if (!box) return;
    const blocks = $$('div', box).filter(d => { const r = d.getBoundingClientRect(); return r.height > 30 && r.height < 120 && r.width > 120 && d.children.length >= 1 && d.querySelector('span'); }).slice(0, 18);
    blocks.forEach(b => { b.style.opacity = '0'; b.style.transform = 'translateY(6px)'; });
    inView(box, () => blocks.forEach((b, i) => { b.style.transition = `opacity .5s ease ${120 + i * 90}ms, transform .6s cubic-bezier(.22,1,.36,1) ${120 + i * 90}ms`; b.style.opacity = '1'; b.style.transform = 'none'; }), { threshold: 0.2 });
  });

  /* ---------------- dark block: arc canvas, wormhole canvas, accordion, marquee, quote ---------------- */
  safe('dark', () => {
    const uc = secs.find(s => /El core financiero con/.test(s.innerText || '') && /Transacciones/.test(s.innerText || '')); if (!uc) return;
    // plus Aurum payment chips riding the rim (gold side → cyan side).
    const h2 = $$('h2', uc).find(h => /Fábrica de productos/.test(h.textContent));
    const sec = h2 && h2.closest('section');
    const ringHost = $('[style*="clip-path: inset(-64px"]', uc);
    const hueEl = $('[style*="hue-rotate"]', uc);
    const kicker = h2 && h2.parentElement.querySelector('p');
    const stage = ringHost && ringHost.parentElement;
    const clamp = v => Math.max(0, Math.min(1, v));
    if (sec && ringHost) {
      const lay = document.createElement('div'); lay.className = 'aurum-rim'; stage.append(lay);
      const PAY = [['SPEI recibido', '+$4,200.00'], ['Cobro domiciliado', '$2,310.00'], ['Remesa recibida', '+US$250.00'], ['Depósito referenciado', '+$12,000.00'], ['Reverso aplicado', '+$1,250.00'], ['Reinversión', '+$107,000.00']];
      const apex = document.createElement('img'); apex.src = '../assets/brand/icon.png'; apex.className = 'aurum-apex'; stage.append(apex);
      const chips = PAY.map((p, i) => { const c = document.createElement('div'); c.className = 'aurum-chip'; c.innerHTML = `<i></i><span>${p[0]}</span><b>${p[1]}</b>`; lay.append(c); return { el: c, t: i / PAY.length }; });
      let last = performance.now();
      const frame = now => {
        const dt = Math.min(64, now - last); last = now;
        const top = sec.getBoundingClientRect().top;
        const p = clamp((600 - top) / 605);
        ringHost.style.clipPath = `inset(-64px calc(${((1 - p) * 100).toFixed(3)}% - ${(64 * p).toFixed(2)}px) -64px -64px)`;
        ringHost.style.opacity = p.toFixed(3);
        const q = clamp((495 - top) / 200);
        h2.style.cssText += `;opacity:${q};filter:blur(${(2.5 * (1 - q)).toFixed(2)}px);transform:translateY(${(4 * (1 - q)).toFixed(2)}px)`;
        if (kicker) kicker.style.cssText += `;opacity:${q};filter:blur(${(1.5 * (1 - q)).toFixed(2)}px);transform:translateY(${(4 * (1 - q)).toFixed(2)}px)`;
        if (hueEl && !RM) { const s = now / 4000; hueEl.style.filter = `hue-rotate(${(Math.sin(s) * 4).toFixed(2)}deg) saturate(${(1.3 + Math.sin(s * 0.7) * 0.15).toFixed(3)})`; }
        // rim chips: follow the actual ring circle
        const ring = ringHost.querySelector('.rounded-full');
        if (ring) { const rr0 = ring.getBoundingClientRect(), sr0 = stage.getBoundingClientRect(); apex.style.left = (rr0.left + rr0.width / 2 - sr0.left) + 'px'; apex.style.top = (rr0.top - sr0.top) + 'px'; apex.style.opacity = clamp((p - 0.5) / 0.5); }
        if (ring && p > 0.05) {
          const rr = ring.getBoundingClientRect(), sr = stage.getBoundingClientRect();
          const R = rr.width / 2 + 3, cx = rr.left + rr.width / 2 - sr.left, cy = rr.top + rr.height / 2 - sr.top;
          const span = Math.acos(clamp((sr.width / 2 - 40) / R) * 0.999); // visible half-angle from vertical
          chips.forEach(c => {
            if (!RM) c.t = (c.t + dt / 70000) % 1;
            const a = -Math.PI / 2 - span + c.t * span * 2; // left → right over the top
            const x = cx + Math.cos(a) * (R - 46), y = cy + Math.sin(a) * (R - 46);
            const edge = Math.min(c.t, 1 - c.t);
            c.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
            c.el.style.opacity = (clamp(edge * 9) * clamp((p - 0.6) / 0.4)).toFixed(3);
            c.el.style.opacity = (clamp(edge * 7) * clamp((p - 0.6) / 0.4) * (Math.abs(c.t - 0.5) < 0.12 ? 0 : 1)).toFixed(3);
          });
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
    const MODES = [
      ['SPEI recibido +$4,200', 'Pago con tarjeta −$318.90', 'Reverso aplicado +$1,250', 'Pago de crédito $2,310', 'Depósito de nómina +$18,500', 'Reinversión plazo fijo', 'Remesa recibida +US$250', 'Cobro domiciliado $899', 'Retención de fondos', 'Cashback +$12.40'],
      ['Alta de cliente', 'KYC aprobado ✓', 'Validación PLD ✓', 'Evaluación de crédito', 'Dispersión SPEI', 'Cobro vía nómina', 'Conciliación SPEI ✓', 'Pago de rendimientos', 'Notificación al cliente', 'Registro de auditoría'],
      ['SPEI · transferencia liquidada', 'KYC · identidad validada', 'PLD · sin alertas', 'Tarjetas · compra autorizada', 'Remesas · USD → MXN', 'Pasarela · cobro en línea', 'Depósito referenciado', 'ERP · póliza contable', 'CRM · expediente actualizado', 'Impuestos · retención calculada'],
    ];
    window.__aurumWormMode = 0;
    const icon = new Image(); icon.src = '../assets/brand/icon.png';
    $$('canvas', uc).filter(c => !c.classList.contains('aurum-canvas')).forEach(cv => {
      const ctx = cv.getContext('2d');
      const N = 9;
      const parts = Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 2 + Math.random() * 0.3, t: 0.15 + (i / N) * 1.0, s: 0.00055 + Math.random() * 0.00035, label: MODES[0][i % MODES[0].length], mode: 0 }));
      let pulses = [], landed = 0;
      const frame = () => {
        const r = cv.parentElement.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
        if (!r.width) return requestAnimationFrame(frame);
        if (r.bottom < -50 || r.top > innerHeight + 50) return requestAnimationFrame(frame);
        if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; }
        const W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.36; ctx.clearRect(0, 0, W, H);
        const proj = (ang, k) => {
          const rx = W * (0.075 + 0.62 * Math.pow(k, 1.55)); const ry = rx * (0.30 + 0.12 * k);
          const dy = H * (0.075 * Math.pow(1 - Math.min(k, 1), 3)) + H * 0.52 * Math.pow(Math.max(0, k - 0.42), 2);
          return [cx + Math.cos(ang) * rx, cy + Math.sin(ang) * ry + dy];
        };
        ctx.lineWidth = 1 * dpr;
        [0.06, 0.16, 0.3, 0.46, 0.64, 0.84, 1.04].forEach(k => { ctx.strokeStyle = `rgba(255,255,255,${0.10 + 0.12 * (1 - Math.min(k, 1))})`; ctx.beginPath(); for (let s = 0; s <= 96; s++) { const [x, y] = proj(s / 96 * Math.PI * 2, k); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
        for (let s = 0; s < 20; s++) { const ang = s / 20 * Math.PI * 2; ctx.strokeStyle = 'rgba(255,255,255,.085)'; ctx.beginPath(); for (let i = 0; i <= 28; i++) { const [x, y] = proj(ang, 0.06 + 1.1 * i / 28); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
        const [tx, ty] = proj(0, 0.0); const throatY = ty;
        ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(cx, throatY + H * 0.02); ctx.lineTo(cx, H); ctx.stroke();
        // core glow + Aurum swoosh at the throat
        const g = ctx.createRadialGradient(cx, throatY, 0, cx, throatY, W * 0.09); g.addColorStop(0, 'rgba(236,202,101,.45)'); g.addColorStop(1, 'rgba(236,202,101,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, throatY, W * 0.09, 0, Math.PI * 2); ctx.fill();
        if (icon.complete && icon.naturalWidth) { const iw = W * 0.045, ih = iw * icon.naturalHeight / icon.naturalWidth; ctx.globalAlpha = 0.95; ctx.drawImage(icon, cx - iw / 2, throatY - ih / 2 - 2 * dpr, iw, ih); ctx.globalAlpha = 1; }
        pulses = pulses.filter(pl => pl.k < 1); pulses.forEach(pl => { pl.k += 0.02; ctx.strokeStyle = `rgba(236,202,101,${0.5 * (1 - pl.k)})`; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); for (let s = 0; s <= 64; s++) { const [x, y] = proj(s / 64 * Math.PI * 2, 0.06 + pl.k * 0.22); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
        // particles with labels
        const mode = window.__aurumWormMode || 0;
        ctx.font = `500 ${11 * dpr}px inter, system-ui, sans-serif`; ctx.textBaseline = 'middle';
        parts.forEach((p, i) => {
          if (!RM) p.t -= p.s * (0.6 + p.t);
          if (p.t < 0.05) { p.t = 1.12; p.a = Math.random() * Math.PI * 2; p.mode = mode; { const used = new Set(parts.map(q => q.label)); const pool = MODES[mode].filter(l => !used.has(l)); p.label = pool.length ? pool[landed % pool.length] : MODES[mode][landed % MODES[mode].length]; } landed++; pulses.push({ k: 0 }); }
          const ang = p.a + (1 - p.t) * 0.9;
          const [x, y] = proj(ang, p.t); const [x2, y2] = proj(ang - 0.08, Math.min(1.2, p.t + 0.08));
          const fade = Math.min(1, (1.12 - p.t) * 6) * Math.min(1, p.t * 6);
          const gr = ctx.createLinearGradient(x2, y2, x, y); gr.addColorStop(0, 'rgba(236,202,101,0)'); gr.addColorStop(1, `rgba(255,236,180,${0.9 * fade})`);
          ctx.strokeStyle = gr; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = `rgba(255,244,214,${fade})`; ctx.beginPath(); ctx.arc(x, y, 1.6 * dpr, 0, Math.PI * 2); ctx.fill();
          if (p.t > 0.32) {
            const a = fade * Math.min(1, (p.t - 0.32) * 4);
            const tw = ctx.measureText(p.label).width, px = x + 8 * dpr, py = y - 12 * dpr, ph = 20 * dpr, pw = tw + 22 * dpr;
            ctx.globalAlpha = a; ctx.fillStyle = 'rgba(22,22,24,.92)'; ctx.strokeStyle = 'rgba(236,202,101,.35)'; ctx.lineWidth = 1 * dpr;
            ctx.beginPath(); ctx.roundRect(px, py - ph / 2, pw, ph, 10 * dpr); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ECCA65'; ctx.beginPath(); ctx.arc(px + 9 * dpr, py, 2.5 * dpr, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillText(p.label, px + 16 * dpr, py + 0.5 * dpr); ctx.globalAlpha = 1;
          }
        });
        requestAnimationFrame(frame);
      };
      frame();
    });
    if (!RM) $$('[style*="height: 360px"]').forEach((b, i) => {
      const host = b.parentElement; const run = () => { const h = host.getBoundingClientRect().height || 600; b.animate([{ transform: 'translateY(-360px)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { transform: `translateY(${h}px)`, opacity: 0 }], { duration: 2600 + Math.random() * 2200, easing: 'cubic-bezier(.45,0,.55,1)' }).onfinish = () => setTimeout(run, 1500 + Math.random() * 6000); };
      setTimeout(run, Math.random() * 5000);
    });
    // accordion autoplay (Esquema / Orquestador / Conectores)
    const labels = ['Esquema transaccional', 'Orquestador de procesos', 'Conectores'];
    const desc = { 'Esquema transaccional': 'Cuentas, créditos, depósitos y conectores. Todo en vivo.', 'Orquestador de procesos': 'Flujos que corren 24/7: altas, autorizaciones, cobros y reinversiones.', 'Conectores': 'SPEI, KYC, tarjetas, remesas y pasarela de pagos, listos para usar.' };
    const items = labels.map(l => $$('p', uc).find(p => p.textContent.trim() === l)).filter(Boolean).map(p => p.parentElement.parentElement);
    if (items.length === 3) {
      const descEl = items[0].querySelectorAll('p')[1]; const bar = items[0].querySelector('[data-max]');
      const tplDesc = descEl && descEl.parentElement; const tplBar = bar && bar.parentElement;
      let k = 0, t0 = 0;
      const show = i => {
        k = i; t0 = performance.now();
        items.forEach((it, j) => { const p = it.querySelectorAll('p')[1]; if (j === i) { if (!p && tplDesc) { const d = tplDesc.cloneNode(true); d.querySelector('p').textContent = desc[labels[j]]; it.append(d); if (tplBar) it.append(tplBar.cloneNode(true)); } } else { if (p && j !== 0) p.parentElement.remove(); const b = it.querySelector('[data-max]'); if (b && j !== 0) b.parentElement.remove(); } });
        items.forEach((it, j) => { const p = it.querySelectorAll('p')[1]; if (p) p.parentElement.style.display = j === i ? '' : 'none'; const b = it.querySelector('[data-max]'); if (b) b.parentElement.style.display = j === i ? '' : 'none'; it.querySelector('p').style.opacity = '1'; });
        window.__aurumWormMode = i;
      };
      const tick = () => { const p = Math.min(1, (performance.now() - t0) / 6500); const b = items[k].querySelector('[data-max]'); if (b) { b.style.transformOrigin = 'left'; b.style.transform = `scaleX(${p})`; if (b.firstElementChild) b.firstElementChild.style.width = p * 100 + '%'; } if (p >= 1) show((k + 1) % 3); requestAnimationFrame(tick); };
      items.forEach((it, j) => { it.style.cursor = 'pointer'; it.addEventListener('click', () => show(j)); });
      show(0); if (!RM) tick();
    }
    // connectivity marquee
    const tile = $('.aurum-tileicon', uc);
    let row = tile; for (let i = 0; i < 6 && row; i++) { row = row.parentElement; if (row && row.children.length >= 8) break; }
    if (row && !RM) { row.append(...[...row.children].map(c => c.cloneNode(true))); row.classList.add('aurum-marquee'); row.style.width = 'max-content'; }
    const q = $('.aurum-quote');
    if (q) {
      const words = [...q.children].filter(c => c.tagName === 'SPAN');
      const pin = q.closest('[data-visual-test="blackout"]'), holder = pin && pin.parentElement;
      const attr = [...(pin ? pin.querySelectorAll('*') : [])].find(e => e.childElementCount === 0 && e.textContent.trim() === 'AurumCore');
      if (attr && !attr.querySelector('img')) { const lg = document.createElement('img'); lg.src = '../assets/brand/icon.png'; lg.alt = ''; lg.className = 'aq-mark'; attr.parentElement.insertBefore(lg, attr); }
      const lit = new Array(words.length).fill(false);
      const upd = () => {
        if (!holder) return;
        const s = -holder.getBoundingClientRect().top + 64;
        const p = Math.max(0, Math.min(1, (s - 250) / 850));
        const n = RM ? words.length : Math.round(p * words.length);
        words.forEach((w, i) => {
          const on = i < n;
          if (on === lit[i]) return; lit[i] = on;
          w.classList.toggle('aq-on', on);
          if (on) { w.classList.add('aq-hot'); setTimeout(() => w.classList.remove('aq-hot'), 420); }
        });
      };
      addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    }
  });

  /* ---------------- Aurum swoosh blueprint: draws itself in ---------------- */
  safe('artwork', () => {
    const art = $('.aurum-artwork'); if (!art || RM) return;
    const outs = $$('.aw-out, .aw-edge', art), hatch = $$('.aw-hatch', art), nodes = $$('.aw-n', art);
    outs.forEach(o => o.style.opacity = '0'); hatch.forEach(h => h.style.opacity = '0'); nodes.forEach(n => { n.style.opacity = '0'; });
    inView(art, () => {
      outs.forEach((o, i) => o.animate([{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { duration: 1600, delay: i * 250, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }));
      nodes.forEach((n, i) => n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 300 + i * 120, fill: 'forwards' }));
      hatch.forEach(h => h.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 1400, fill: 'forwards' }));
    }, { threshold: 0.35 });
  });

  /* ---------------- scale: curve draw + counters ---------------- */
  safe('scale', () => {
    const sc = secs.find(s => /Hecho para escalar/.test(s.innerText || '')); if (!sc || RM) return;
    $$('svg path', sc).forEach(p => { try { const L = p.getTotalLength(); if (L > 300) { p.style.setProperty('--len', L); p.classList.add('aurum-draw'); } } catch (e) {} });
    const nums = $$('*', sc).filter(e => e.childElementCount === 0 && /^\d+$/.test(e.textContent.trim()));
    inView(sc, () => {
      $$('.aurum-draw', sc).forEach(e => e.classList.add('is-in'));
      nums.forEach(n => { const end = +n.textContent; let v = 0; const iv = setInterval(() => { v++; n.textContent = v; if (v >= end) clearInterval(iv); }, Math.max(30, 900 / end)); n.textContent = '0'; });
    }, { threshold: 0.3 });
  });

  /* ---------------- scale curve → Aurum adoption path with milestones ---------------- */
  safe('scalepath', () => {
    const sc = secs.find(s => /Hecho para escalar/.test(s.innerText || '')); if (!sc) return;
    const path = $$('svg path', sc).filter(p => getComputedStyle(p).fill === 'none' && getComputedStyle(p).stroke !== 'none').map(p => { try { return [p, p.getTotalLength()]; } catch (e) { return [p, 0]; } }).sort((a, b) => b[1] - a[1])[0];
    if (!path || path[1] < 300) return;
    const [p, L0] = path;
    const flip = p.getPointAtLength(0).x > p.getPointAtLength(L0).x;
    const L = L0; const orig = p.getPointAtLength.bind(p);
    p.getPointAtLength = d => orig(flip ? L - d : d);
    sc.style.position = sc.style.position || 'relative';
    $$('svg', sc).forEach(sv => { if (sv.querySelectorAll('*').length > 40) sv.style.filter = 'sepia(.85) saturate(1.5) hue-rotate(-12deg)'; });
    $$('*', sc).forEach(e => { const bi = getComputedStyle(e).backgroundImage; if (/gradient/.test(bi) && !e.closest('.sp-lay')) e.style.filter = 'sepia(.85) saturate(1.5) hue-rotate(-12deg)'; });
    const lay = document.createElement('div'); lay.className = 'sp-lay'; sc.append(lay);
    const MS = [[0.30, 'Carteras electrónicas', 'Motor de Débito · App y Web'], [0.46, 'Tarjetas de débito', 'Autorizaciones y reversos'], [0.60, 'Préstamos de nómina', 'Motor de Crédito · SPEI'], [0.72, 'Plazo fijo', 'Motor de Inversión · reinversión'], [0.83, 'Remesas', 'Conectores · USD → MXN'], [0.92, 'Puntos de lealtad', 'Recompensas y cashback']];
    const nodes = MS.map(([t, h, d], i) => { const el = document.createElement('div'); el.className = 'sp-m' + (i % 2 ? ' alt' : ''); el.innerHTML = `<i></i><div><b>${h}</b><small>${d}</small></div>`; lay.append(el); return { el, t }; });
    const dot = document.createElement('span'); dot.className = 'sp-dot'; lay.append(dot);
    const place = () => {
      const m = p.getScreenCTM(); if (!m) return; const sr = sc.getBoundingClientRect();
      const at = t => { const pt = p.getPointAtLength(L * t); const x = m.a * pt.x + m.c * pt.y + m.e, y = m.b * pt.x + m.d * pt.y + m.f; return [x - sr.left, y - sr.top]; };
      nodes.forEach(n => { const [x, y] = at(n.t); n.el.style.left = x + 'px'; n.el.style.top = y + 'px'; n.el.classList.toggle('flip', x > sr.width - 260); });
      return at;
    };
    let at = place(); addEventListener('resize', () => { at = place(); });
    if (RM) { nodes.forEach(n => n.el.classList.add('is-in')); return; }
    inView(sc, () => {
      at = place();
      nodes.forEach((n, i) => setTimeout(() => n.el.classList.add('is-in'), 300 + n.t * 1600));
      let t0 = performance.now();
      const run = now => { const u = ((now - t0) / 6000) % 1; const [x, y] = at(0.18 + u * 0.82); dot.style.transform = `translate(${x}px, ${y}px)`; dot.style.opacity = u < 0.05 ? u * 20 : u > 0.95 ? (1 - u) * 20 : 1; requestAnimationFrame(run); };
      requestAnimationFrame(run);
    }, { threshold: 0.3 });
  });

  /* ---------------- use cases: tabs + phone renders ---------------- */
  safe('usecases', () => {
    const st = secs.find(s => /Imagina tu caso de uso/.test(s.innerText || '')); if (!st) return;
    st.id = 'casos';
    const CASES = [
      { cat: 'Banca móvil', h: 'Lanza tu cartera digital', p: 'Cuentas, SPEI y tarjeta de débito con un solo motor',
        w: `<div class="uw-card"><div class="uw-head"><span class="uw-ico">⇄</span><b>Movimientos</b><em>$12,480.50</em></div>
          <div class="uw-row"><span class="uw-av">M</span><span>SPEI de Mariel S.</span><b class="pos">+$1,500.00</b></div>
          <div class="uw-row"><span class="uw-av c2">C</span><span>Compra en comercio</span><b>−$318.90</b></div>
          <div class="uw-row"><span class="uw-av c3">R</span><span>Recarga de saldo</span><b>−$150.00</b></div>
          <div class="uw-row"><span class="uw-av c4">D</span><span>Devolución de dinero</span><b class="pos">+$12.40</b></div></div>
          <div class="uw-pill"><span>CLABE</span><b>0123 •••• •••• 4821</b><i>Copiar</i></div>` },
      { cat: 'Préstamos', h: 'Préstamos de nómina', p: 'Del alta al cobro vía nómina, automatizado en cada etapa',
        w: `<div class="uw-card"><div class="uw-head"><b>Dispersiones</b><span class="uw-btn">Crear</span></div>
          <div class="uw-disp"><span>$15,000.00</span><div class="uw-lane"><i style="--d:0ms"></i></div><em>Liquidada</em></div>
          <div class="uw-disp"><span>$8,500.00</span><div class="uw-lane"><i style="--d:350ms"></i></div><em>Liquidada</em></div>
          <div class="uw-disp"><span>$22,000.00</span><div class="uw-lane"><i style="--d:700ms"></i></div><em>Liquidada</em></div></div>
          <div class="uw-pill dark"><span>Descuento vía nómina</span><b>8 de 24 pagos</b></div>` },
      { cat: 'Tarjetas', h: 'Tarjetas de débito', p: 'Autorizaciones, reversos y límites desde el Motor de Débito',
        w: `<div class="uw-auth"><span class="uw-spin">↻</span><b>Autorización</b><span class="uw-pan">•••• 0042</span><span class="uw-ok">✓</span></div>
          <div class="uw-card"><div class="uw-head"><b>Controles de tarjeta</b></div>
          <div class="uw-row"><span>Compras en línea</span><span class="uw-sw on"></span></div>
          <div class="uw-row"><span>Retiros en cajero</span><span class="uw-sw on"></span></div>
          <div class="uw-row"><span>Límite diario</span><b>$20,000</b></div>
          <div class="uw-row"><span>Cargo duplicado · $1,250</span><b class="pos">Reversado</b></div></div>` },
      { cat: 'Lealtad', h: 'Puntos de lealtad', p: 'Recompensas y devolución de dinero ligadas a cada compra',
        w: `<div class="uw-card"><div class="uw-head"><b>Programa de recompensas</b><em>2,340 pts</em></div>
          <div class="uw-meter"><i></i></div><small class="uw-note">Faltan 660 pts para tu siguiente recompensa</small>
          <div class="uw-row"><span class="uw-av">S</span><span>Supermercado</span><b class="pos">+46 pts</b></div>
          <div class="uw-row"><span class="uw-av c2">G</span><span>Gasolina</span><b class="pos">+18 pts</b></div>
          <div class="uw-row"><span class="uw-av c4">$</span><span>Devolución de dinero</span><b class="pos">+$35.20</b></div></div>
          <div class="uw-pill"><span>Regla</span><b>1 pt por cada $10</b></div>` },
    ];
    $$('.aurum-story-visual', st).forEach(vis => { vis.innerHTML = CASES.map((c, i) => `<div class="uw" data-i="${i}">${c.w}</div>`).join(''); });
    const tabs = $$('button[data-aurum-tab]', st);
    const cat = $$('*', st).filter(e => e.childElementCount === 0 && /^Banca móvil$/i.test(e.textContent.trim()));
    const hh = $$('*', st).filter(e => e.childElementCount === 0 && e.textContent.trim() === 'Lanza tu cartera digital');
    const pp = $$('*', st).filter(e => e.childElementCount === 0 && e.textContent.trim() === 'Cuentas, SPEI y tarjeta de débito con un solo motor');
    const set = i => {
      tabs.forEach((b, k) => { b.setAttribute('aria-pressed', k === i); const bg = b.querySelector('span[aria-hidden]'); if (bg) bg.style.opacity = k === i ? '1' : '0'; });
      cat.forEach(e => e.textContent = CASES[i].cat); hh.forEach(e => e.textContent = CASES[i].h); pp.forEach(e => e.textContent = CASES[i].p);
      $$('.uw', st).forEach(a => a.classList.toggle('is-on', +a.dataset.i === i));
    };
    tabs.forEach((b, i) => {
      if (!b.querySelector('span[aria-hidden]')) { const bg = document.createElement('span'); bg.setAttribute('aria-hidden', 'true'); bg.className = 'absolute inset-0 origin-left bg-white-200'; bg.style.opacity = '0'; bg.style.transition = 'opacity .25s'; b.prepend(bg); }
      b.addEventListener('click', () => set(i));
    });
    set(0);
  });

  /* ---------------- Aurum signature on the section grid: gold diamonds at rail joints + glint on dividers ---------------- */
  safe('rails', () => {
    const lay = document.createElement('div'); lay.className = 'aurum-rails'; document.body.append(lay);
    const draw = () => {
      lay.innerHTML = '';
      if (innerWidth < 1024) return;
      const cont = $$('main .container').map(c => c.getBoundingClientRect()).find(r => r.width > 900);
      if (!cont) return;
      const L = cont.left + scrollX, Rr = cont.right + scrollX;
      const ys = new Set();
      const heroBottom = $('main > section').getBoundingClientRect().bottom + scrollY - 2;
      [...$$('main > *'), $('footer')].filter(Boolean).forEach(s => {
        const r = s.getBoundingClientRect(); if (r.height < 120 || r.top + scrollY < heroBottom) return;
        const cs = getComputedStyle(s);
        if (parseFloat(cs.borderTopWidth) >= 1) ys.add(Math.round(r.top + scrollY));
        if (parseFloat(cs.borderBottomWidth) >= 1) ys.add(Math.round(r.bottom + scrollY - 1));
        ys.add(Math.round(r.top + scrollY));
      });
      ys.forEach(y => {
        if (y < 120) return;
        const dark = !!document.elementFromPoint(Math.min(innerWidth - 2, L + 3), Math.max(0, y - scrollY + 2))?.closest('.dark, footer');
        [L, Rr].forEach(x => { const d = document.createElement('i'); d.className = 'ar-d' + (dark ? ' dk' : ''); d.style.left = x + 'px'; d.style.top = y + 'px'; lay.append(d); });
        const g = document.createElement('b'); g.className = 'ar-g' + (dark ? ' dk' : ''); g.style.left = L + 'px'; g.style.width = (Rr - L) + 'px'; g.style.top = y + 'px'; lay.append(g);
      });
      // glint on view
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '-10% 0px' });
      $$('.ar-g', lay).forEach(g => io.observe(g));
    };
    let t; const later = () => { clearTimeout(t); t = setTimeout(draw, 300); };
    addEventListener('resize', later); addEventListener('load', later); setTimeout(draw, 1200); setTimeout(draw, 4000);
  });

  /* ---------------- dark feature cards + module cards: animated Aurum vignettes ---------------- */
  safe('vignettes', () => {
    const findCard = (title, minH) => { const p = $$('p, h3, h4, span').find(e => e.childElementCount === 0 && e.textContent.trim() === title); if (!p) return null; let c = p; while (c && c.getBoundingClientRect().height < minH) c = c.parentElement; return c; };
    const mount = (card, html, cls) => { if (!card || card.querySelector('.vg')) return null; if (getComputedStyle(card).position === 'static') card.style.position = 'relative'; const v = document.createElement('div'); v.className = 'vg ' + cls; v.innerHTML = html; card.append(v); inView(card, () => v.classList.add('is-in'), { threshold: 0.4 }); return v; };
    // dark row (5 cards)
    const DARK = [
      ['Se registra solo.', 'vg-log', `<div class="vg-rows">${['SPEI recibido · ••0042', 'Reverso · ••0042', 'Alta de cliente · KYC', 'Cambio de límite · admin'].map((t, i) => `<div style="--d:${i * 0.5}s"><i></i><span>${t}</span><em>${['14:02:11', '14:02:19', '14:03:02', '14:03:40'][i]}</em></div>`).join('')}</div>`],
      ['Tus sistemas, conectados.', 'vg-net', `<svg viewBox="0 0 200 90"><g class="ln"><path d="M100 45 L30 18"/><path d="M100 45 L30 72"/><path d="M100 45 L170 18"/><path d="M100 45 L170 72"/></g><circle cx="100" cy="45" r="13" class="core"/>${[[30, 18, 'ERP'], [30, 72, 'CRM'], [170, 18, 'PLD'], [170, 72, 'SAT']].map(([x, y, t]) => `<g><circle cx="${x}" cy="${y}" r="10" class="nd"/><text x="${x}" y="${y + 3}">${t}</text></g>`).join('')}<text x="100" y="48" class="ct">AC</text></svg>`],
      ['Modular de verdad.', 'vg-mod', ['Motor de Débito', 'Motor de Crédito', 'Motor de Inversión'].map((t, i) => `<div style="--d:${0.3 + i * 0.45}s"><span>${t}</span><b></b></div>`).join('')],
      ['Pregunta y ahí está.', 'vg-q', `<div class="q">Saldo de cuenta ••0042</div><div class="a"><b>$1,236,900.00</b><small>Actualizado hace 1 s</small></div>`],
      ['Sin bloqueo.', 'vg-dep', `<div class="sw"><span class="on">OnPrem</span><span>IaaS</span></div><div class="srv">${'<i></i>'.repeat(6)}</div>`],
    ];
    DARK.forEach(([t, cls, html]) => { const card = findCard(t, 200); mount(card, html, 'vg-dark ' + cls); });
    // module cards (light)
    const MOD = [
      ['Motor de Débito', 'vg-mdeb', `<div class="mc"><small>Cuenta ••0042</small><b>$12,480.50</b><div class="tx"><span>Autorización</span><em>✓</em></div><div class="tx"><span>Reverso</span><em>✓</em></div></div>`],
      ['Motor de Crédito', 'vg-mcred', `<div class="mc"><small>Crédito de nómina</small><b>$45,000</b><div class="bar"><i></i></div><small>8 de 24 pagos</small></div>`],
      ['Motor de Inversión', 'vg-minv', `<div class="mc"><small>Plazo fijo 90 días</small><b>9.5% anual</b><svg viewBox="0 0 120 34"><path d="M2 30 C 30 28, 60 20, 118 4" /></svg></div>`],
      ['API Multicanal', 'vg-mapi', `<div class="mc code"><span class="k">POST</span> /v1/debit/accounts<br><span class="g">201</span> Created · 84 ms</div>`],
    ];
    MOD.forEach(([t, cls, html]) => {
      const p = $$('h3, p, span').find(e => e.childElementCount === 0 && e.textContent.trim() === t && e.closest('main section') && /Crece a tu ritmo/.test(e.closest('main section').innerText || ''));
      if (!p) return; let card = p; while (card && card.getBoundingClientRect().height < 200) card = card.parentElement;
      mount(card, html, 'vg-light ' + cls);
    });
  });

  /* ---------------- article 3 sub-cards: PLD alert stack + committee summary ---------------- */
  safe('subcards', () => {
    const plat = secs.find(s => s.querySelector('[data-feature-id]')); if (!plat) return;
    const art = $$('article', plat)[2]; if (!art) return;
    const h4s = $$('h4', art);
    const slotOf = h => { const card = h.parentElement.parentElement; const vis = card.children[1]; return vis; };
    const prep = vis => { const H = Math.round(vis.getBoundingClientRect().height) || 260; vis.style.height = H + 'px'; vis.style.position = 'relative'; vis.style.overflow = 'hidden'; [...vis.children].forEach(c => c.style.display = 'none'); return H; };
    const hA = h4s.find(h => /Alertas antes/.test(h.textContent)), hB = h4s.find(h => /Llega listo/.test(h.textContent));
    if (hA) {
      const vis = slotOf(hA); prep(vis);
      const AL = [['Operación inusual', '$185,000.00', 'Cuenta ••0042 · SPEI saliente 02:14', 'Alta', 'hi'], ['Depósitos fraccionados', '5 en 1 hora', 'Cuenta ••6630 · ventanilla y app', 'Media', 'md'], ['Cambio de domicilio', 'Expediente', 'Cuenta ••1907 · validar comprobante', 'Baja', 'lo']];
      const root = document.createElement('div'); root.className = 'pl';
      root.innerHTML = AL.map((a, i) => `<div class="pl-c" data-i="${i}"><div class="pl-t"><span class="pl-ic">!</span><b>${a[0]}</b><span class="pl-r ${a[4]}">${a[3]}</span></div><div class="pl-m">${a[1]}</div><small>${a[2]}</small><div class="pl-a"><span>Revisar</span><span>${a[4] === 'hi' ? 'Retener fondos' : 'Solicitar documento'}</span></div></div>`).join('');
      vis.append(root);
      let k = 0; const cards = $$('.pl-c', root);
      const order = () => cards.forEach((c, i) => { const pos = (i - k + cards.length) % cards.length; c.style.setProperty('--p', pos); c.classList.toggle('top', pos === 0); });
      order(); if (!RM) inView(root, () => setInterval(() => { k = (k + 1) % cards.length; order(); }, 2800));
    }
    if (hB) {
      const vis = slotOf(hB); prep(vis);
      const root = document.createElement('div'); root.className = 'cm';
      root.innerHTML = `<div class="cm-h"><b>Resumen para comité de crédito</b><span class="cm-s">Generando…</span></div>
        <div class="cm-k"><div><small>Cartera vigente</small><b>$48.2M</b></div><div><small>Al corriente</small><b class="pos">96.1%</b></div><div><small>Vencido</small><b class="neg">3.9%</b></div></div>
        <div class="cm-l"><div><span class="d hi"></span><b>Crédito nómina ••2016</b><em>$29,288 · nómina no depositada</em></div><div><span class="d md"></span><b>Crédito PyME ••2008</b><em>$18,280 · 2 pagos parciales</em></div><div><span class="d lo"></span><b>12 créditos en seguimiento</b><em>sin atraso mayor a 30 días</em></div></div>`;
      vis.append(root);
      const rows = [...root.querySelectorAll('.cm-k > div, .cm-l > div')];
      const run = async () => { while (true) { rows.forEach(r => r.classList.remove('in')); root.querySelector('.cm-s').textContent = 'Generando…'; root.querySelector('.cm-s').classList.remove('ok'); await sleep(700); for (const r of rows) { r.classList.add('in'); await sleep(380); } root.querySelector('.cm-s').textContent = '✓ Listo para comité'; root.querySelector('.cm-s').classList.add('ok'); await sleep(4200); } };
      if (RM) rows.forEach(r => r.classList.add('in')); else inView(root, () => run());
    }
  });

  /* ---------------- generic: section headings fade-up on first view ---------------- */
  safe('reveal', () => {
    if (RM) return;
    $$('main h2, main h3').forEach(h => { const r = h.getBoundingClientRect(); if (r.top > innerHeight) { h.classList.add('aurum-rise'); inView(h, () => h.classList.add('is-in'), { threshold: 0.2 }); } });
  });
})();
