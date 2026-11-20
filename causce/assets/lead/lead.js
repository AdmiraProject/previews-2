/* cauSCe lead popup: every booking/contact CTA opens a form (nombre, teléfono, correo)
   and then redirects to WhatsApp with the lead data pre-filled.
   CRM hook for the dev team: set window.CAUSCE_LEAD_ENDPOINT = "https://..." (POST JSON) — VALIDAR. */
(function () {
  var WA = '525516928266';
  var CTA_TEXT = /reserv|agend|cita|cotiz|inscr|informes|escr[ií]benos|whatsapp/i;
  var script = document.currentScript;
  var base = script ? script.src.replace(/lead\.js.*$/, '') : '../assets/lead/';
  var ov, form, chip, lastTrigger, interest = '';

  function isTrigger(a) {
    if (!a || a.tagName !== 'A' || a.hasAttribute('data-no-lead')) return false;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('data-lead') || /wa\.me|whatsapp\.com/.test(href)) return true;
    var isBtn = /(^|\s)(btn|btn-m|btn-l|nlink--btn|lead-cta)(\s|$)/.test(a.className);
    return isBtn && /tienda\.causce\.com\.mx/.test(href) && CTA_TEXT.test(a.textContent);
  }

  function interestFrom(a) {
    if (a.getAttribute('data-lead')) return a.getAttribute('data-lead');
    var m = (a.getAttribute('href') || '').match(/[?&]text=([^&]+)/);
    if (m) {
      try { var t = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { t = ''; }
      t = t.replace(/^hola,?\s*causce,?\s*/i, '').trim();
      if (t) return t.charAt(0).toUpperCase() + t.slice(1);
    }
    var txt = a.textContent.replace(/\s+/g, ' ').trim();
    if (/reserv/i.test(txt)) return 'Quiero reservar una clase';
    if (/cotiz/i.test(txt)) return 'Quiero cotizar un evento';
    if (/cita/i.test(txt)) return 'Quiero agendar una cita de valoración';
    return 'Quiero informes';
  }

  function accentFrom(a) {
    var c = a && getComputedStyle(a).backgroundColor;
    if (!c || /rgba\(0, 0, 0, 0\)|transparent/.test(c) || /255, 255, 255/.test(c)) c = getComputedStyle(a || document.body).color;
    if (!c || /255, 255, 255|0, 0, 0\)/.test(c)) c = '#108474';
    return c;
  }

  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.43 9.42m8.02-17.45A11.27 11.27 0 0 0 12.05.72C5.8.72.72 5.8.72 12.05c0 2 .52 3.95 1.52 5.66L.62 23.28l5.7-1.5a11.3 11.3 0 0 0 5.73 1.46h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01"/></svg>';

  function build() {
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + 'lead.css';
    document.head.appendChild(l);
    ov = document.createElement('div');
    ov.className = 'lead-ov';
    ov.innerHTML =
      '<div class="lead" role="dialog" aria-modal="true" aria-labelledby="lead-t">' +
      '<button type="button" class="lead__x" aria-label="Cerrar">&times;</button>' +
      '<img class="lead__logo" src="' + base + '../logo/causce-logo.svg" alt="cauSCe" width="64" height="34">' +
      '<span class="lead__chip"></span>' +
      '<h2 class="lead__t" id="lead-t">Déjanos tus datos y seguimos por WhatsApp</h2>' +
      '<p class="lead__s">Te respondemos personalmente para ayudarte a elegir horario y experiencia.</p>' +
      '<form class="lead__f" novalidate>' +
      '<label class="lead__l">Nombre<input class="lead__i" name="nombre" type="text" autocomplete="name" placeholder="Tu nombre" required><span class="lead__e" aria-live="polite"></span></label>' +
      '<label class="lead__l">Teléfono<input class="lead__i" name="telefono" type="tel" inputmode="tel" autocomplete="tel" placeholder="55 1234 5678" required><span class="lead__e" aria-live="polite"></span></label>' +
      '<label class="lead__l">Correo<input class="lead__i" name="correo" type="email" inputmode="email" autocomplete="email" placeholder="tu@correo.com" required><span class="lead__e" aria-live="polite"></span></label>' +
      '<button class="lead__b" type="submit">' + WA_ICON + '<span>Continuar en WhatsApp</span></button>' +
      '</form>' +
      '<p class="lead__p">Usamos tus datos solo para contactarte. <a href="https://tienda.causce.com.mx/pages/aviso-de-privacidad" target="_blank" rel="noopener" data-no-lead>Aviso de privacidad</a></p>' +
      '</div>';
    document.body.appendChild(ov);
    form = ov.querySelector('form');
    chip = ov.querySelector('.lead__chip');
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.lead__x')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = ov.querySelectorAll('button, input, a[href]'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    form.addEventListener('submit', submit);
    form.addEventListener('input', function (e) { var l = e.target.closest('.lead__l'); if (l) { l.classList.remove('is-err'); l.querySelector('.lead__e').textContent = ''; } });
    try {
      var saved = JSON.parse(localStorage.getItem('causce_lead') || '{}');
      ['nombre', 'telefono', 'correo'].forEach(function (k) { if (saved[k]) form[k].value = saved[k]; });
    } catch (e) {}
  }

  function open(a) {
    if (!ov) build();
    lastTrigger = a;
    interest = interestFrom(a);
    chip.textContent = interest;
    ov.querySelector('.lead').style.setProperty('--la', accentFrom(a));
    ov.classList.add('is-open');
    document.documentElement.classList.add('lead-lock');
    setTimeout(function () { (form.nombre.value ? form.telefono.value ? form.correo : form.telefono : form.nombre).focus(); }, 60);
  }

  function close() {
    ov.classList.remove('is-open');
    document.documentElement.classList.remove('lead-lock');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function err(name, msg) {
    var l = form[name].closest('.lead__l');
    l.classList.add('is-err'); l.querySelector('.lead__e').textContent = msg;
    return false;
  }

  function submit(e) {
    e.preventDefault();
    var n = form.nombre.value.trim(), t = form.telefono.value.trim(), c = form.correo.value.trim();
    var digits = t.replace(/\D/g, ''), ok = true;
    if (n.length < 2) ok = err('nombre', 'Escribe tu nombre.');
    if (digits.length < 10 || digits.length > 13) ok = err('telefono', 'Escribe un teléfono de 10 dígitos.') && ok;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) ok = err('correo', 'Escribe un correo válido.') && ok;
    if (!ok) { var bad = form.querySelector('.is-err input'); if (bad) bad.focus(); return; }

    var lead = { nombre: n, telefono: t, correo: c, interes: interest, pagina: location.href, fecha: new Date().toISOString() };
    try { localStorage.setItem('causce_lead', JSON.stringify({ nombre: n, telefono: t, correo: c })); } catch (e2) {}
    (window.dataLayer = window.dataLayer || []).push({ event: 'lead_submit', lead_interest: interest });
    if (window.fbq) window.fbq('track', 'Lead');
    if (window.CAUSCE_LEAD_ENDPOINT) {
      try { fetch(window.CAUSCE_LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), keepalive: true }); } catch (e3) {}
    }
    var msg = 'Hola cauSCe, soy ' + n + '. ' + interest.replace(/\.$/, '') + '.\n' +
      'Teléfono: ' + t + '\nCorreo: ' + c;
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    window.__causceLastLeadUrl = url;
    close();
    var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (mobile) { location.href = url; return; }
    var w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest('a');
    if (!isTrigger(a) || (ov && ov.contains(a))) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(a);
  }, true);
})();
