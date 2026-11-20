/* v2 review pass: Aurum renders in the platform panes + mini widgets for the use-case thumbnails */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var visible = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el.closest('.full-stack_panel') || el).opacity > 0.2; };

  /* ---------- Fábrica de productos ---------- */
  var fab = $('[data-ax="fab"]');
  if (fab && !RM) (async function () {
    var P = [
      { e: 1, n: 'Crédito de nómina', l: ['Monto máximo', 'Plazo', 'Tasa anual fija'], v: [35000, '24 meses', '18.0%'], p: 0.68 },
      { e: 2, n: 'Plazo fijo 90 días', l: ['Monto mínimo', 'Plazo', 'Rendimiento anual'], v: [10000, '90 días', '9.5%'], p: 0.32 },
      { e: 0, n: 'Cuenta nómina', l: ['Límite diario', 'Comisión', 'Tarjeta virtual'], v: [20000, '$0.00', 'Incluida'], p: 0.5 }
    ];
    var k = 0;
    while (true) {
      if (!visible(fab)) { await sleep(500); continue; }
      var c = P[k++ % P.length];
      fab.classList.remove('is-pub'); $('.ax-btn span', fab).textContent = 'Publicar producto';
      $$('.ax-eng span', fab).forEach(function (s) { s.classList.toggle('on', +s.dataset.e === c.e); });
      $$('.ax-ch span', fab).forEach(function (s) { s.classList.remove('on'); });
      $('.ax-name', fab).textContent = c.n; $('.ax-l1', fab).textContent = c.l[0]; $('.ax-l2', fab).textContent = c.l[1]; $('.ax-l3', fab).textContent = c.l[2];
      $('.ax-v2', fab).textContent = '—'; $('.ax-v3', fab).textContent = '—'; $('.ax-fill', fab).style.width = '0%';
      await sleep(400);
      var t0 = performance.now();
      await new Promise(function (res) { (function st(now) { var u = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - u, 3); $('.ax-fill', fab).style.width = (c.p * e * 100) + '%'; $('.ax-v1', fab).textContent = '$' + Math.round(c.v[0] * (0.2 + 0.8 * e)).toLocaleString('en-US'); u < 1 ? requestAnimationFrame(st) : res(); })(t0); });
      await sleep(250); $('.ax-v2', fab).textContent = c.v[1];
      await sleep(300); $('.ax-v3', fab).textContent = c.v[2];
      for (var s of $$('.ax-ch span', fab)) { await sleep(180); s.classList.add('on'); }
      await sleep(450); $('.ax-btn span', fab).textContent = 'Publicando…'; await sleep(800);
      fab.classList.add('is-pub'); $('.ax-btn span', fab).textContent = '✓ Activo en 4 canales';
      await sleep(2600);
    }
  })();

  /* ---------- API → Portal de Atención ---------- */
  var api = $('[data-ax="api"]');
  if (api) {
    var FEED = [['Compra autorizada', '−$318.90', 'AUT-7781'], ['SPEI recibido', '+$4,200.00', 'SPEI-1189'], ['Reverso aplicado', '+$1,250.00', 'REV-0412'], ['Retención liberada', '+$600.00', 'RET-2207']];
    var feed = $('.ax-feed', api), j = 0;
    var push = function () {
      if (visible(api) || !feed.children.length) {
        var f = FEED[j++ % FEED.length]; var row = document.createElement('div'); row.className = 'ax-fr';
        row.innerHTML = '<span class="d ' + (f[1][0] === '+' ? 'in' : '') + '"></span><span>' + f[0] + '</span><b>' + f[1] + '</b><em>' + f[2] + '</em>';
        feed.prepend(row); while (feed.children.length > 3) feed.lastChild.remove();
        var res = $('.ax-res', api); res.classList.remove('on'); void res.offsetWidth; res.classList.add('on');
      }
      setTimeout(push, RM ? 999999 : 2200);
    };
    push(); push();
  }

  /* ---------- Audit log ---------- */
  var ctl = $('[data-ax="ctl"]');
  if (ctl) {
    var LOG = [['AR', 'Ana Ruiz', 'Tesorería', 'aprobó la dispersión de nómina', '14:02'], ['LO', 'Luis Ortega', 'Mesa de control', 'revisó el expediente ••2041', '14:00'], ['PR', 'Paola Ríos', 'Crédito', 'publicó «Crédito de nómina»', '13:57'], ['DF', 'Daniel Fuentes', 'Contabilidad', 'cerró el corte SPEI 1', '13:31'], ['SC', 'Sara Campos', 'Auditoría', 'exportó el reporte de accesos', '13:12']];
    var log = $('.ax-log', ctl), q = 0;
    var add = function () {
      if (visible(ctl) || !log.children.length) {
        var l = LOG[q++ % LOG.length]; var row = document.createElement('div'); row.className = 'ax-lr';
        row.innerHTML = '<span class="av">' + l[0] + '</span><div><b>' + l[1] + '</b> ' + l[3] + '<small>' + l[2] + ' · ' + l[4] + '</small></div>';
        log.prepend(row); while (log.children.length > 4) log.lastChild.remove();
      }
      setTimeout(add, RM ? 999999 : 1900);
    };
    add(); add(); add();
  }

  /* ---------- use-case mini widgets ---------- */
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  window.aurumMini = function (c) {
    var t = c[3], name = c[2];
    var head = '<div class="um-h"><b>' + name + '</b></div>';
    if (t === 'phone') return '<div class="um">' + head + '<small>Transferencia SPEI</small><div class="um-big">$2,500.00</div><div class="um-r"><span>A cuenta ••1907</span><b class="pos">Enviada</b></div><div class="um-r"><span>Pago de servicios</span><b>−$890.00</b></div></div>';
    if (t === 'wallet') return '<div class="um">' + head + '<small>Saldo disponible</small><div class="um-big">$12,840.50</div><div class="um-r"><span>SPEI recibido</span><b class="pos">+$1,500</b></div><div class="um-r"><span>Compra en comercio</span><b>−$318.90</b></div></div>';
    if (t === 'card') return '<div class="um">' + head + '<div class="um-card"><i></i><span>•••• 0042</span></div><div class="um-r"><span>Autorización</span><b class="pos">✓ Aprobada</b></div><div class="um-r"><span>Cargo duplicado</span><b class="pos">Reversado</b></div></div>';
    if (['payroll', 'coin', 'person', 'brief', 'house', 'bolt'].indexOf(t) > -1) {
      var amt = { payroll: 45000, coin: 5000, person: 30000, brief: 250000, house: 1800000, bolt: 8000 }[t], n = { payroll: 24, coin: 12, person: 18, brief: 36, house: 240, bolt: 6 }[t], d = { payroll: 8, coin: 5, person: 7, brief: 12, house: 61, bolt: 2 }[t];
      return '<div class="um">' + head + '<small>Monto</small><div class="um-big">' + money(amt) + '</div><div class="um-bar"><i style="width:' + Math.round(d / n * 100) + '%"></i></div><div class="um-r"><span>Pagos</span><b>' + d + ' de ' + n + '</b></div><div class="um-r"><span>Siguiente</span><b>30 nov</b></div></div>';
    }
    if (t === 'cal' || t === 'bank') return '<div class="um">' + head + '<small>Capital</small><div class="um-big">$100,000</div><div class="um-r"><span>Rendimiento</span><b class="pos">+$2,342.47</b></div><div class="um-r"><span>Reinversión</span><b><span class="um-sw"></span></b></div></div>';
    if (t === 'heart') return '<div class="um">' + head + '<small>Recaudado</small><div class="um-big">$84,300</div><div class="um-bar"><i style="width:68%"></i></div><div class="um-r"><span>Depósitos referenciados</span><b>312</b></div></div>';
    if (t === 'globe') return '<div class="um">' + head + '<small>Remesa recibida</small><div class="um-big">US$250.00</div><div class="um-r"><span>Abonado en cuenta</span><b class="pos">+$4,362.50</b></div><div class="um-r"><span>Estatus</span><b class="pos">Liquidada</b></div></div>';
    return '<div class="um">' + head + '<small>' + (t === 'back' ? 'Cashback del mes' : 'Puntos acumulados') + '</small><div class="um-big">' + (t === 'back' ? '$184.20' : '2,340 pts') + '</div><div class="um-bar"><i style="width:78%"></i></div><div class="um-r"><span>Última compra</span><b class="pos">' + (t === 'back' ? '+$12.40' : '+46 pts') + '</b></div></div>';
  };
  // app.js may have rendered thumbnails before this script loaded → fill any empty ones
  var fill = function () {
    $$('.case-study-slide_narrow').forEach(function (s) {
      var th = $('.case-study-slide_narrow-thumbnail', s); if (!th || $('.um', th)) return;
      var name = (($('a.absolute-link', s) || {}).getAttribute ? $('a.absolute-link', s).getAttribute('aria-label') : '') || '';
      var map = { 'Carteras electrónicas': 'wallet', 'Banca móvil': 'phone', 'Tarjetas de débito': 'card', 'Préstamos de nómina': 'payroll', 'Microcréditos': 'coin', 'Préstamos personales': 'person', 'Préstamos comerciales': 'brief', 'Préstamos hipotecarios': 'house', 'Préstamos de emergencia': 'bolt', 'Contratos a plazo': 'cal', 'Cuentas bajo demanda': 'bank', 'Recaudación de fondos': 'heart', 'Remesas': 'globe', 'Programa de recompensas': 'gift', 'Cashback': 'back', 'Puntos de lealtad': 'star' };
      th.insertAdjacentHTML('beforeend', window.aurumMini([0, 0, name, map[name] || 'star']));
    });
  };
  fill(); setTimeout(fill, 800);
})();
