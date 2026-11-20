/* v1 behaviors — Tend interactions rebuilt for Oftavisión. */
(function () {
  var C = window.OV_CONFIG, R = window.OV_REVIEWS;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* header shrink on scroll + burger */
  var hd = $('#hd');
  if (hd) {
    var onS = function () { hd.classList.toggle('is-stuck', scrollY > 60); };
    addEventListener('scroll', onS, { passive: true }); onS();
    var bg = $('.hd__burger');
    if (bg) bg.onclick = function () { var n = $('.hd__nav'); var o = n.classList.toggle('open'); bg.setAttribute('aria-expanded', o); };
  }

  /* sede selects */
  $$('#hdSede, #insSede, [data-sede-select]').forEach(function (s) {
    C.sedes.forEach(function (x, i) { var o = document.createElement('option'); o.value = i; o.textContent = x.name; s.appendChild(o); });
  });
  var hs = $('#hdSede');
  if (hs) hs.onchange = function () { if (hs.value === '') return; var sec = $('#sedes'); if (sec) { sec.scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { focusSede(+hs.value); }, 700); } };

  /* generic horizontal carousels (service pills) */
  $$('.svc').forEach(function (w) {
    var vp = $('.svc__vp', w);
    $('.svc__ar--p', w).onclick = function () { vp.scrollBy({ left: -vp.clientWidth / 3, behavior: 'smooth' }); };
    $('.svc__ar--n', w).onclick = function () { if (vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 4) vp.scrollTo({ left: 0, behavior: 'smooth' }); else vp.scrollBy({ left: vp.clientWidth / 3, behavior: 'smooth' }); };
  });

  /* reveal on view */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv, .chk').forEach(function (el) { io.observe(el); });
  $$('.chk li').forEach(function (li, i) { li.style.transitionDelay = (i * 70) + 'ms'; });
  $$('.tc.rv').forEach(function (el, i) { el.style.transitionDelay = (i % 2 * 90) + 'ms'; });
  var vm = $('.viewmore');
  if (vm) vm.onclick = function () { var o = $('.chk').classList.toggle('open'); vm.setAttribute('aria-expanded', o); vm.firstChild.textContent = o ? 'Ver menos ' : 'Ver más '; };

  /* difference media → plays a real patient testimonial */
  var dif = $('.dif');
  if (dif) {
    var v = $('.dif__vid', dif);
    $('.dif__play', dif).onclick = function () { dif.classList.add('is-playing'); v.controls = true; v.play(); };
    v.addEventListener('ended', function () { dif.classList.remove('is-playing'); v.controls = false; v.currentTime = 0; });
  }

  /* "Por qué nos eligen" — Tend big-card carousel: real quote + patient photo + yellow stars + review-site logo.
     Endless loop (3 copies, re-centred on the middle copy) so the active card always has a neighbour on each side
     and never drifts to one side; auto-advance only while the section is on screen. */
  var tr = $('#loveTr');
  var GLOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  var FLOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#1877F2"/><path fill="#fff" d="M26.6 38V26.2h4l.6-4.6h-4.6v-2.9c0-1.3.4-2.2 2.3-2.2h2.4v-4.1c-.4-.1-1.9-.2-3.5-.2-3.5 0-5.9 2.1-5.9 6v3.4h-4v4.6h4V38h4.7z"/></svg>';
  var STAR = '<svg viewBox="0 0 20 20"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
  var stars = function (r) { var s = ''; for (var i = 0; i < 5; i++) { var f = Math.max(0, Math.min(1, r - i)); s += '<span class="st5" style="--f:' + Math.round(f * 100) + '%">' + STAR + STAR + '</span>'; } return s; };
  if (tr && (window.OV_LOVE || R)) {
    var list = window.OV_LOVE || R.reviews;
    var card = function (r) {
      var t = r.text, rt = r.rating || 5;
      return '<article class="lc"><p class="lc__q' + (t.length < 70 ? ' big' : '') + '">“' + esc(t) + '”</p><div class="lc__f">' +
        '<div class="lc__rv">' + (r.photo ? '<img class="lc__av" src="' + esc(r.photo) + '" alt="" loading="lazy" style="object-position:' + (r.pos || '50% 30%') + '">' : '') +
        '<div class="lc__sr"><span class="lc__stars" role="img" aria-label="' + rt + ' de 5 estrellas">' + stars(rt) + '</span>' +
        '<span class="lc__src"><b>' + rt.toFixed(1) + '</b>' + (r.source === 'facebook' ? FLOGO + 'Facebook' : GLOGO + 'Google') + '</span></div></div>' +
        (t.length > 110 ? '<button class="lc__more" type="button">Leer más <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>' : '<span></span>') +
        '<span class="lc__n"><b>' + esc(r.name) + '</b> ' + esc(r.when || '') + '</span></div></article>';
    };
    var one = list.map(card).join('');
    tr.innerHTML = one + one + one;
    var n = list.length, cards = $$('.lc', tr), k = n;
    var place = function (inst) {
      var vw = tr.parentElement.clientWidth, cw = cards[0].offsetWidth, gap = parseFloat(getComputedStyle(tr).columnGap) || 40;
      if (inst) tr.style.transition = 'none';
      tr.style.transform = 'translateX(' + Math.round((vw - cw) / 2 - k * (cw + gap)) + 'px)';
      cards.forEach(function (c, i) { c.classList.toggle('on', i === k); });
      if (inst) { void tr.offsetWidth; tr.style.transition = ''; }
    };
    var go = function (d) { k += d; place(false); };
    tr.addEventListener('transitionend', function (e) { if (e.target !== tr) return; if (k >= 2 * n) { k -= n; place(true); } else if (k < n) { k += n; place(true); } });
    var sec = tr.closest('.love');
    $('.circ', sec).onclick = function () { go(-1); }; $('.pill-next', sec).onclick = function () { go(1); };
    tr.addEventListener('click', function (e) { var b = e.target.closest('.lc__more'); if (b) { var c = b.closest('.lc'); c.classList.toggle('open'); b.firstChild.textContent = c.classList.contains('open') ? 'Leer menos ' : 'Leer más '; } });
    var sx = 0; tr.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    tr.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
    addEventListener('resize', function () { place(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(true); });
    addEventListener('load', function () { place(true); });
    place(true);
    if (!RM) {
      var hold = false, vis = false;
      sec.addEventListener('pointerenter', function () { hold = true; }); sec.addEventListener('pointerleave', function () { hold = false; });
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting && es[0].intersectionRatio > .5; }, { threshold: [0, .5, 1] }).observe(sec);
      setInterval(function () { if (!hold && vis && document.visibilityState === 'visible') go(1); }, 7000);
    }
  }

  /* locations list + Leaflet map */
  var ul = $('#locList'), map, markers = [];
  var PIN = function (on) { return '<svg viewBox="0 0 40 52"><path d="M20 1C9.5 1 1 9.4 1 19.8 1 33.5 20 51 20 51s19-17.5 19-31.2C39 9.4 30.5 1 20 1z" fill="' + (on ? '#326FCC' : '#172941') + '"/><circle cx="20" cy="19.5" r="9" fill="none" stroke="#CDEFF6" stroke-width="3"/><circle cx="20" cy="19.5" r="3.6" fill="#00B3D3"/></svg>'; };
  function popup(s, i) {
    return '<div class="pp"><b>' + esc(s.city) + '</b><p>' + esc(s.state) + '</p>' + (s.addr ? '<p>' + esc(s.addr) + '</p>' : '') +
      '<p>Tel. <a href="tel:+52' + s.tel.replace(/\D/g, '') + '" data-no-lead>' + esc(s.tel) + '</a></p><a class="btn btn--blue" href="#agendar" data-lead="consulta" data-sede="' + i + '">Agendar aquí</a></div>';
  }
  function focusSede(i) {
    $$('.loc__i').forEach(function (li, j) { li.classList.toggle('on', j === i); });
    if (!map) return;
    map.flyTo(C.sedes[i].ll, 11, { duration: RM ? 0 : 1.2 });
    markers.forEach(function (m, j) { m.setIcon(L.divIcon({ className: 'pin' + (j === i ? ' on' : ''), html: PIN(j === i), iconSize: [40, 52], iconAnchor: [20, 50], popupAnchor: [0, -46] })); });
    setTimeout(function () { markers[i].openPopup(); }, RM ? 0 : 1250);
  }
  window.focusSede = focusSede;
  if (ul) {
    ul.innerHTML = C.sedes.map(function (s, i) {
      return '<li class="loc__i" data-i="' + i + '"><span class="loc__c">' + esc(s.city) + '<small>' + esc(s.state) + ' · ' + esc(s.tel) + '</small></span><button class="loc__b" type="button">Ver sede <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></li>';
    }).join('');
    ul.addEventListener('click', function (e) { var li = e.target.closest('.loc__i'); if (li) focusSede(+li.dataset.i); });
    if (window.L && $('#map')) {
      map = L.map('map', { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([23.6, -102], 5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18, className: 'ov-tiles' }).addTo(map);
      C.sedes.forEach(function (s, i) {
        var m = L.marker(s.ll, { icon: L.divIcon({ className: 'pin', html: PIN(false), iconSize: [40, 52], iconAnchor: [20, 50], popupAnchor: [0, -46] }) }).addTo(map).bindPopup(popup(s, i));
        m.on('click', function () { $$('.loc__i').forEach(function (li, j) { li.classList.toggle('on', j === i); }); });
        markers.push(m);
      });
      map.fitBounds(L.latLngBounds(C.sedes.filter(function (s) { return s.key !== 'mexicali'; }).map(function (s) { return s.ll; })), { padding: [50, 50] });
    }
  }
  /* "Agendar aquí" inside a sede popup → preselect sede in the lead form */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sede]'); if (!a) return;
    try { var s = JSON.parse(localStorage.getItem('ov_lead') || '{}'); s.sede = a.dataset.sede; localStorage.setItem('ov_lead', JSON.stringify(s)); } catch (x) {}
    var sel = document.querySelector('.lead select[name="sede"]'); if (sel) sel.value = a.dataset.sede;
  }, true);

  /* inline lens form (Tend "check your insurance") → hands off to the WhatsApp lead popup prefilled */
  var f = $('#insForm');
  if (f) {
    f.addEventListener('input', function () { f.classList.toggle('ready', f.n.value.trim().length > 1 && f.t.value.replace(/\D/g, '').length >= 10); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var parts = f.n.value.trim().split(/\s+/);
      try { localStorage.setItem('ov_lead', JSON.stringify({ nombre: parts.shift() || '', apellido: parts.join(' '), telefono: f.t.value.trim(), sede: f.s.value })); } catch (x) {}
      var lf = document.querySelector('.lead__f');
      if (lf) { lf.nombre.value = ''; lf.apellido.value = ''; } // force refill from storage on rebuild
      window.OVLead && OVLead.open(f.dataset.case || 'lentes');
      var form = document.querySelector('.lead__f'), saved = JSON.parse(localStorage.getItem('ov_lead') || '{}');
      if (form) { form.nombre.value = saved.nombre || ''; form.apellido.value = saved.apellido || ''; form.telefono.value = saved.telefono || ''; if (form.sede) form.sede.value = saved.sede || ''; }
    });
  }

  /* footer: sedes accordion + hours + WhatsApp QR */
  var fs = $('#ftSedes');
  if (fs) {
    fs.innerHTML = C.sedes.map(function (s) { return '<li><button type="button">' + esc(s.city) + ' <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button><div class="ad">' + (s.addr ? esc(s.addr) + '<br>' : '') + 'Tel. ' + esc(s.tel) + '</div></li>'; }).join('');
    fs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) b.parentElement.classList.toggle('open'); });
  }
  var hrs = $('#ftHrs'); if (hrs) hrs.textContent = C.hours;
  var qr = $('#qr');
  if (qr && window.qrcode) { var q = qrcode(0, 'M'); q.addData('https://wa.me/' + C.wa); q.make(); qr.innerHTML = q.createSvgTag({ cellSize: 3, margin: 0, scalable: true }); var p = qr.querySelector('path'); if (p) p.setAttribute('fill', '#172941'); }
})();
/* lens-brand logos: continuous strip handled in motion.js (Tend auto-scroll) */
