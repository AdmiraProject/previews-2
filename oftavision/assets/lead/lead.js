/* Oftavisión lead popup — every "Agendar / Valoración / WhatsApp" CTA opens a short form tailored to the use case,
   then forwards to WhatsApp with the data pre-filled.
   Fields: Nombre, Apellido, Celular (WhatsApp), Sede, + one tap-question that depends on the use case.
   Triggers: [data-lead="<case-key>"], any link to wa.me / whatsapp, href="#agendar".
   Config (use cases, sedes, WhatsApp numbers) lives in ov-config.js, loaded before this file.
   Versions restyle through CSS custom properties on .lead (see lead.css).
   CRM hook (VALIDAR con el equipo): window.OV_LEAD_ENDPOINT = "https://..." (POST JSON). */
(function () {
  var C = window.OV_CONFIG || {};
  var CASES = C.cases || {};
  var SEDES = C.sedes || [];
  var DEFAULT = C.defaultCase || Object.keys(CASES)[0];
  var script = document.currentScript;
  var base = script ? script.src.replace(/lead\.js.*$/, '') : '../assets/lead/';
  var ov, form, chip, title, sub, qWrap, qLabel, qOpts, media, lastTrigger, key = DEFAULT, answer = '';

  function caseOf(el) {
    var v = el.getAttribute('data-lead');
    if (v && CASES[v]) return v;
    var txt = ((el.getAttribute('href') || '') + ' ' + (el.textContent || '')).toLowerCase();
    for (var k in CASES) { var m = CASES[k].match; if (m && new RegExp(m, 'i').test(txt)) return k; }
    return DEFAULT;
  }
  function triggerOf(t) {
    var el = t.closest && t.closest('a, button, [data-lead]');
    if (!el || el.hasAttribute('data-no-lead')) return null;
    if (el.hasAttribute('data-lead')) return el;
    var href = el.getAttribute('href') || '';
    if (/wa\.me|whatsapp\.com/.test(href) || href === '#agendar') return el;
    return null;
  }

  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.43 9.42m8.02-17.45A11.27 11.27 0 0 0 12.05.72C5.8.72.72 5.8.72 12.05c0 2 .52 3.95 1.52 5.66L.62 23.28l5.7-1.5a11.3 11.3 0 0 0 5.73 1.46h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01"/></svg>';

  function trust(cls) {
    var T = window.OV_TRUST; if (!T) return '';
    var st = ''; for (var i = 0; i < 5; i++) { var f = Math.max(0, Math.min(1, T.rating - i)); st += '<i style="--f:' + Math.round(f * 100) + '%"></i>'; }
    return '<div class="' + cls + '"><span class="lead__st" aria-label="' + T.rating + ' de 5">' + st + '</span><b>' + T.rating.toFixed(1) + '</b><span class="lead__sep"></span><b>' + T.patients + '</b> pacientes</div>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build() {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'lead.css'; document.head.appendChild(l);
    ov = document.createElement('div');
    ov.className = 'lead-ov';
    var sedeField = SEDES.length > 1
      ? '<label class="lead__l lead__l--full"><span>Sede</span><select class="lead__i" name="sede" required><option value="">Elige tu sede</option>' +
        SEDES.map(function (s, i) { return '<option value="' + i + '">' + esc(s.name) + '</option>'; }).join('') + '</select><em class="lead__e" aria-live="polite"></em></label>'
      : '';
    ov.innerHTML =
      '<div class="lead" role="dialog" aria-modal="true" aria-labelledby="lead-t">' +
      '<button type="button" class="lead__x" aria-label="Cerrar"><span></span><span></span></button>' +
      '<div class="lead__media" aria-hidden="true"><img alt="">' + trust('lead__trust') + '</div>' +
      '<div class="lead__body">' +
      (C.logo ? '<img class="lead__logo" src="' + base + C.logo + '" alt="' + esc(C.brand || '') + '">' : '') +
      '<span class="lead__chip"></span>' +
      '<h2 class="lead__t" id="lead-t"></h2>' +
      '<p class="lead__s"></p>' +
      '<form class="lead__f" novalidate>' +
      '<div class="lead__row">' +
      '<label class="lead__l"><span>Nombre</span><input class="lead__i" name="nombre" type="text" autocomplete="given-name" placeholder="Tu nombre" required><em class="lead__e" aria-live="polite"></em></label>' +
      '<label class="lead__l"><span>Apellido</span><input class="lead__i" name="apellido" type="text" autocomplete="family-name" placeholder="Tu apellido" required><em class="lead__e" aria-live="polite"></em></label>' +
      '</div>' +
      '<label class="lead__l lead__l--full"><span>Celular (WhatsApp)</span><input class="lead__i" name="telefono" type="tel" inputmode="tel" autocomplete="tel" placeholder="10 dígitos" required><em class="lead__e" aria-live="polite"></em></label>' +
      sedeField +
      '<fieldset class="lead__q"><legend class="lead__ql"></legend><div class="lead__qo" role="radiogroup"></div><em class="lead__e" aria-live="polite"></em></fieldset>' +
      trust('lead__trust lead__trust--m') + '<button class="lead__b" type="submit">' + WA_ICON + '<span>Continuar en WhatsApp</span></button>' +
      '</form>' +
      '<p class="lead__p">Te contesta una persona del equipo Oftavisión. Usamos tus datos solo para agendar tu cita.</p>' +
      '</div></div>';
    document.body.appendChild(ov);
    form = ov.querySelector('form');
    chip = ov.querySelector('.lead__chip'); title = ov.querySelector('.lead__t'); sub = ov.querySelector('.lead__s');
    qWrap = ov.querySelector('.lead__q'); qLabel = ov.querySelector('.lead__ql'); qOpts = ov.querySelector('.lead__qo');
    media = ov.querySelector('.lead__media img');
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.lead__x')) close(); });
    qOpts.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      answer = b.dataset.v;
      [].forEach.call(qOpts.children, function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
      qWrap.classList.remove('is-err'); qWrap.querySelector('.lead__e').textContent = '';
    });
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = ov.querySelectorAll('button, input, select'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    form.addEventListener('submit', submit);
    form.addEventListener('input', function (e) { var l = e.target.closest('.lead__l'); if (l) { l.classList.remove('is-err'); l.querySelector('.lead__e').textContent = ''; } });
    try {
      var saved = JSON.parse(localStorage.getItem('ov_lead') || '{}');
      ['nombre', 'apellido', 'telefono'].forEach(function (k) { if (saved[k]) form[k].value = saved[k]; });
      if (saved.sede && form.sede) form.sede.value = saved.sede;
    } catch (e) {}
  }

  function fill() {
    var c = CASES[key] || {};
    chip.textContent = c.chip || c.label || '';
    title.textContent = c.title || 'Agenda tu cita';
    sub.textContent = c.sub || '';
    if (c.img) { media.src = base + c.img; media.parentNode.style.display = ''; } else media.parentNode.style.display = 'none';
    answer = '';
    if (c.q) {
      qWrap.hidden = false; qLabel.textContent = c.q.label;
      qOpts.innerHTML = c.q.options.map(function (o) { return '<button type="button" role="radio" aria-checked="false" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('');
    } else qWrap.hidden = true;
  }

  function open(el) {
    if (!ov) build();
    lastTrigger = el;
    key = caseOf(el);
    fill();
    ov.classList.add('is-open');
    document.documentElement.classList.add('lead-lock');
    setTimeout(function () { var f = !form.nombre.value ? form.nombre : !form.apellido.value ? form.apellido : !form.telefono.value ? form.telefono : form.querySelector('.lead__b'); f.focus({ preventScroll: true }); }, 80);
  }
  function close() {
    ov.classList.remove('is-open');
    document.documentElement.classList.remove('lead-lock');
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }
  function err(name, msg) {
    var l = form[name].closest('.lead__l'); l.classList.add('is-err'); l.querySelector('.lead__e').textContent = msg; return false;
  }

  function submit(e) {
    e.preventDefault();
    var c = CASES[key] || {};
    var n = form.nombre.value.trim(), a = form.apellido.value.trim(), t = form.telefono.value.trim();
    var digits = t.replace(/\D/g, ''), ok = true;
    if (n.length < 2) ok = err('nombre', 'Escribe tu nombre.');
    if (a.length < 2) ok = err('apellido', 'Escribe tu apellido.') && ok;
    if (digits.length < 10 || digits.length > 13) ok = err('telefono', 'Escribe un celular de 10 dígitos.') && ok;
    var sede = null;
    if (form.sede) { if (form.sede.value === '') ok = err('sede', 'Elige la sede más cercana.') && ok; else sede = SEDES[+form.sede.value]; }
    else if (SEDES.length === 1) sede = SEDES[0];
    if (c.q && !answer) { qWrap.classList.add('is-err'); qWrap.querySelector('.lead__e').textContent = 'Elige una opción.'; ok = false; }
    if (!ok) { var bad = form.querySelector('.is-err input, .is-err select, .lead__q.is-err button'); if (bad) bad.focus(); return; }

    var lead = { nombre: n, apellido: a, telefono: t, sede: sede && sede.name, caso: key, respuesta: answer, pagina: location.href, fecha: new Date().toISOString() };
    try { localStorage.setItem('ov_lead', JSON.stringify({ nombre: n, apellido: a, telefono: t, sede: form.sede ? form.sede.value : '' })); } catch (e2) {}
    (window.dataLayer = window.dataLayer || []).push({ event: 'lead_submit', lead_case: key, lead_sede: lead.sede || '' });
    if (window.fbq) window.fbq('track', 'Lead', { content_name: key });
    if (window.OV_LEAD_ENDPOINT) { try { fetch(window.OV_LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), keepalive: true }); } catch (e3) {} }

    var msg = 'Hola Oftavisión, soy ' + n + ' ' + a + '. ' + (c.msg || 'Quiero agendar una cita') + '.' +
      (c.q ? '\n' + c.q.label + ' ' + answer : '') +
      (sede ? '\nSede: ' + sede.name : '') +
      '\nCelular: ' + t;
    var wa = (sede && sede.wa) || C.wa;
    var url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);
    window.__ovLastLeadUrl = url;
    close();
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { location.href = url; return; }
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e4) {} } else { location.href = url; }
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var el = triggerOf(e.target);
    if (!el || (ov && ov.contains(el))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    open(el);
  }, true);
  window.OVLead = { open: function (k) { var d = document.createElement('a'); d.setAttribute('data-lead', k || DEFAULT); open(d); } };
})();
