/* AurumCore v1 — custom product renders for the platform slots (runs after aurum.js). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = (n, f) => { try { f(); } catch (e) { console.warn('[aurum-feat]', n, e); } };
  const money = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function inView(el, cb) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); cb(); } }), { threshold: 0.25 }); io.observe(el); }
  function mount(slot, cls, html) {
    const H = Math.round(slot.getBoundingClientRect().height);
    slot.style.height = H + 'px'; slot.style.overflow = 'hidden';
    if (getComputedStyle(slot).position === 'static') slot.style.position = 'relative';
    [...slot.children].forEach(c => c.style.display = 'none');
    const root = document.createElement('div'); root.className = 'fx ' + cls; root.innerHTML = html; slot.append(root);
    return root;
  }
  const loop = (root, fn) => { if (RM) return; inView(root, async () => { while (true) { await fn(); } }); };
  const plat = [...document.querySelectorAll('main > *')].find(s => s.querySelector('[data-feature-id]'));
  const arts = plat ? $$('article', plat) : [];

  /* 1 · Motor de Débito live view */
  safe('debito', () => {
    const slot = arts[0] && arts[0].children[1]; if (!slot) return;
    const root = mount(slot, 'fx-deb', `
      <div class="fx-col">
        <div class="fx-card fx-acct"><small>Cuenta ••0042 · Débito nómina</small><b class="fx-bal">$1,236,900.00</b><div class="fx-acct-row"><span>Disponible</span><span class="fx-avail">$1,236,900.00</span></div><div class="fx-acct-row"><span>Retenido</span><span class="fx-hold">$0.00</span></div></div>
        <div class="fx-card fx-ledger"><div class="fx-h">Movimientos en tiempo real <span class="fx-live"><i></i>En vivo</span></div><div class="fx-feed"></div></div>
      </div>
      <div class="fx-card fx-spei">
        <div class="fx-h">Transferencia SPEI</div>
        <div class="fx-kv"><span>Para</span><b>Transportes Del Valle</b></div>
        <div class="fx-kv"><span>CLABE</span><b>0123 •••• •••• 4821</b></div>
        <div class="fx-kv"><span>Monto</span><b class="fx-amt">$184,250.00</b></div>
        <div class="fx-kv"><span>Concepto</span><b>Pago factura 1043</b></div>
        <div class="fx-checks"><div data-c>Saldo disponible</div><div data-c>Validación PLD</div><div data-c>Límite diario</div></div>
        <div class="fx-btn"><span>Autorizar transferencia</span></div>
        <div class="fx-folio">Folio SPEI <b>DIN20261114</b><span>Liquidada · 14:32:08</span></div>
      </div>`);
    const q = s => root.querySelector(s);
    let bal = 1236900;
    const EV = [['SPEI recibido', 'Nómina Grupo Altamar', 96000], ['Compra autorizada', 'Tarjeta ••0042 · Farmacia', -318.9], ['Retención de fondos', 'Garantía de renta', -15000, 'hold'], ['Reverso', 'Cargo duplicado', 1250], ['Reembolso', 'Comercio en línea', 899], ['SPEI enviado', 'Pago de servicios', -2150]];
    let k = 0;
    const push = () => {
      const [a, b, v, kind] = EV[k++ % EV.length];
      const row = document.createElement('div'); row.className = 'fx-row';
      row.innerHTML = `<span class="fx-dot ${v > 0 ? 'in' : kind === 'hold' ? 'hold' : 'out'}"></span><div><b>${a}</b><small>${b}</small></div><b class="${v > 0 ? 'pos' : ''}">${v > 0 ? '+' : '−'}${money(Math.abs(v))}</b>`;
      const feed = q('.fx-feed'); feed.prepend(row); while (feed.children.length > 4) feed.lastChild.remove();
      if (kind === 'hold') { q('.fx-hold').textContent = money(15000); q('.fx-avail').textContent = money(bal - 15000); }
      else { bal += v; q('.fx-bal').textContent = money(bal); q('.fx-avail').textContent = money(bal - (q('.fx-hold').textContent === '$0.00' ? 0 : 15000)); q('.fx-bal').animate([{ color: v > 0 ? '#1a8f5e' : '#C2543A' }, { color: '#1b1c1f' }], { duration: 900 }); }
    };
    push(); push(); push();
    loop(root, async () => {
      const checks = $$('[data-c]', root); checks.forEach(c => c.className = '');
      q('.fx-btn').className = 'fx-btn'; q('.fx-btn span').textContent = 'Autorizar transferencia'; q('.fx-folio').classList.remove('on');
      for (let i = 0; i < 3; i++) { await sleep(1100); push(); }
      for (const c of checks) { c.className = 'run'; await sleep(450); c.className = 'ok'; }
      await sleep(300); q('.fx-btn').classList.add('load'); q('.fx-btn span').textContent = 'Enviando…';
      await sleep(1000); q('.fx-btn').className = 'fx-btn done'; q('.fx-btn span').textContent = 'Enviado'; bal -= 184250; q('.fx-bal').textContent = money(bal); q('.fx-avail').textContent = money(bal - (q('.fx-hold').textContent === '$0.00' ? 0 : 15000));
      await sleep(700); q('.fx-folio').classList.add('on');
      await sleep(3200); bal = 1236900; q('.fx-hold').textContent = '$0.00'; q('.fx-bal').textContent = money(bal); q('.fx-avail').textContent = money(bal);
    });
  });

  /* 2 · Originación de crédito */
  safe('credito', () => {
    const slot = arts[1] && arts[1].children[1]; if (!slot) return;
    const ST = [['Solicitud', 'Crédito de nómina · $45,000'], ['KYC', 'Identidad y domicilio verificados'], ['Evaluación', '$45,000 · 18% fija · 24 meses'], ['Contrato', 'Firma electrónica'], ['Dispersión SPEI', 'Liquidada · folio 7781204'], ['Primer cobro', 'Descuento vía nómina · 30 nov']];
    const root = mount(slot, 'fx-cr', `
      <div class="fx-card fx-step">
        <div class="fx-h">Motor de Crédito · Solicitud #2041 <span class="fx-tag">En proceso</span></div>
        <div class="fx-rail"><i class="fx-fill"></i>${ST.map((s, i) => `<div class="fx-st" data-i="${i}"><span class="fx-node">${i + 1}</span><b>${s[0]}</b><small>${s[1]}</small></div>`).join('')}</div>
        <div class="fx-app"><span class="fx-av">AR</span><div><b>Ana Ruiz</b><small>Cuenta ••0042 · nómina Grupo Altamar</small></div><span class="fx-stage">Solicitud</span></div>
      </div>
      <div class="fx-card fx-amort"><div class="fx-h">Tabla de amortización</div>
        <div class="fx-tr th"><span>#</span><span>Fecha</span><span>Capital</span><span>Interés</span><span>Pago</span></div>
        ${[['1', '30 nov', '$1,571.62', '$675.00', '$2,246.62'], ['2', '30 dic', '$1,595.19', '$651.43', '$2,246.62'], ['3', '30 ene', '$1,619.12', '$627.50', '$2,246.62'], ['4', '28 feb', '$1,643.41', '$603.21', '$2,246.62']].map(r => `<div class="fx-tr">${r.map(c => `<span>${c}</span>`).join('')}</div>`).join('')}
      </div>`);
    const q = s => root.querySelector(s);
    loop(root, async () => {
      const sts = $$('.fx-st', root); sts.forEach(s => s.className = 'fx-st'); q('.fx-fill').style.width = '0%'; root.classList.remove('done'); q('.fx-tag').textContent = 'En proceso';
      for (let i = 0; i < sts.length; i++) {
        sts[i].classList.add('run'); q('.fx-stage').textContent = ST[i][0]; q('.fx-fill').style.width = (i / (sts.length - 1) * 100) + '%';
        await sleep(950); sts[i].classList.replace('run', 'ok');
      }
      q('.fx-tag').textContent = 'Activo'; root.classList.add('done');
      await sleep(4200);
    });
  });

  /* 3 · Reportes */
  safe('reportes', () => {
    const slot = arts[3] && arts[3].children[1]; if (!slot) return;
    const ROWS = [['Crédito de nómina', '$18,420,300', 97.1, 2.9], ['Crédito PyME', '$9,815,000', 93.4, 6.6], ['Microcrédito', '$2,104,750', 90.8, 9.2], ['Plazo fijo 90 días', '$12,640,000', 100, 0], ['Cuenta nómina', '$48,230,915', 100, 0]];
    const root = mount(slot, 'fx-rp', `
      <div class="fx-card fx-rep">
        <div class="fx-rbar"><div class="fx-sel"><small>Reporte</small><b class="fx-rname">Selecciona un reporte</b></div><div class="fx-sel"><small>Periodo</small><b class="fx-per">—</b></div><div class="fx-sel"><small>Formato</small><b>Regulatorio</b></div><span class="fx-run">Generar</span></div>
        <div class="fx-tr th"><span>Producto</span><span>Saldo</span><span>Al corriente</span><span>Vencido</span></div>
        <div class="fx-rows">${ROWS.map(r => `<div class="fx-tr"><span>${r[0]}</span><span>${r[1]}</span><span><i class="fx-mb"><em style="--w:${r[2]}%"></em></i>${r[2].toFixed(1)}%</span><span class="${r[3] > 5 ? 'warn' : ''}">${r[3].toFixed(1)}%</span></div>`).join('')}</div>
        <div class="fx-rfoot"><span class="fx-exp">Exportar CSV</span><span class="fx-exp">Exportar XML</span><span class="fx-sched"><span class="fx-sw"></span>Envío diario 8:00</span></div>
      </div>`);
    const q = s => root.querySelector(s);
    loop(root, async () => {
      root.classList.remove('filled', 'exp'); q('.fx-sw').classList.remove('on'); q('.fx-rname').textContent = 'Selecciona un reporte'; q('.fx-per').textContent = '—';
      $$('.fx-rows .fx-tr', root).forEach(r => r.classList.remove('in'));
      await sleep(700); q('.fx-rname').textContent = 'Cartera por producto'; q('.fx-rname').parentElement.animate([{ background: '#FBF4E2' }, { background: '#fff' }], { duration: 700 });
      await sleep(500); q('.fx-per').textContent = 'Noviembre 2026';
      await sleep(500); q('.fx-run').animate([{ transform: 'scale(.94)' }, { transform: 'none' }], { duration: 250 });
      root.classList.add('filled');
      for (const r of $$('.fx-rows .fx-tr', root)) { await sleep(240); r.classList.add('in'); }
      await sleep(700); root.classList.add('exp');
      await sleep(500); q('.fx-sw').classList.add('on');
      await sleep(3600);
    });
  });

  /* 4 · Implementación timeline (self-building slot) */
  safe('impl', () => {
    const sec = [...document.querySelectorAll('main > *')].find(s => /Listo desde el día uno/.test(s.innerText || '')); if (!sec) return;
    const slot = $('[data-at-start]', sec); if (!slot) return;
    const STEPS = [['Día 1', 'Sandbox y llaves de API', 'POST /v1/sandbox → 201 Created'], ['Conectores', 'SPEI, KYC y PLD conectados', 'GET /v1/connectors → 3 activos'], ['Productos', 'Débito, crédito e inversión configurados', 'POST /v1/products → 4 publicados'], ['Portales', 'Admin y Atención al Cliente', 'Roles y controles de acceso listos'], ['Producción', 'OnPrem o IaaS, sin bloqueo', 'Health check → 200 OK']];
    const root = mount(slot, 'fx-im', `
      <div class="fx-card fx-tl">
        <div class="fx-h">Implementación AurumCore <span class="fx-tag">Integración en días, implementación en meses</span></div>
        <div class="fx-tls">${STEPS.map((s, i) => `<div class="fx-ts" data-i="${i}"><span class="fx-node">✓</span><div><small>${s[0]}</small><b>${s[1]}</b></div></div>`).join('')}<i class="fx-tfill"></i></div>
        <div class="fx-log"></div>
      </div>`);
    const q = s => root.querySelector(s);
    loop(root, async () => {
      const ts = $$('.fx-ts', root); ts.forEach(t => t.className = 'fx-ts'); q('.fx-log').innerHTML = ''; q('.fx-tfill').style.width = '0%';
      await sleep(500);
      for (let i = 0; i < ts.length; i++) {
        ts[i].classList.add('run'); await sleep(700); ts[i].classList.replace('run', 'ok');
        q('.fx-tfill').style.width = (i / (ts.length - 1) * 100) + '%';
        const l = document.createElement('div'); l.className = 'fx-ll'; l.innerHTML = `<span>${new Date(2026, 10, 14, 9, 2 + i * 3).toTimeString().slice(0, 5)}</span><code>${STEPS[i][2]}</code><b>OK</b>`; q('.fx-log').append(l);
        await sleep(450);
      }
      await sleep(3800);
    });
  });
})();
