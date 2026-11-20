(function () {
  var C = window.OV_CONFIG, R = window.OV_REVIEWS;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ARR = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';

  /* nav */
  var nv = $('#nv');
  if (nv) { var s = function () { nv.classList.toggle('is-stuck', scrollY > 45); }; addEventListener('scroll', s, { passive: true }); s(); var bu = $('.nv__burger'); if (bu) bu.onclick = function () { nv.classList.toggle('open'); }; }

  /* accordions (render home FAQ from data, then bind every .acc) */
  var hf = $('#homeFaq');
  if (hf && window.OV_HOME_FAQ) hf.innerHTML = OV_HOME_FAQ.map(function (q) { return '<div class="acc__i"><button class="acc__q" type="button" aria-expanded="false">' + esc(q[0]) + '<i></i></button><div class="acc__a"><p>' + esc(q[1]) + '</p></div></div>'; }).join('');
  $$('.acc__q').forEach(function (b) { b.addEventListener('click', function () { var o = b.parentElement.classList.toggle('open'); b.setAttribute('aria-expanded', o); }); });

  /* video lightbox */
  var vl;
  function playVideo(src) {
    if (!vl) { vl = document.createElement('div'); vl.className = 'vl'; vl.innerHTML = '<video controls playsinline></video><button type="button" aria-label="Cerrar">×</button>'; document.body.appendChild(vl);
      vl.addEventListener('click', function (e) { if (e.target === vl || e.target.tagName === 'BUTTON') { var v = $('video', vl); v.pause(); v.removeAttribute('src'); v.load(); vl.classList.remove('on'); } }); }
    var v = $('video', vl); v.src = src; vl.classList.add('on'); v.play().catch(function () {});
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-video]'); if (b) { e.preventDefault(); playVideo(b.dataset.video); } });

  /* "Personas reales" story cards */
  var tr = $('#rpTr');
  if (tr && R) {
    var byName = {}; R.reviews.forEach(function (r) { byName[r.name] = r; });
    tr.innerHTML = R.videos.map(function (v) {
      var r = byName[v.name] || {};
      var title = r.title ? v.name.split(' ')[0] + ': “' + r.title + '”' : v.name;
      var quote = r.text || v.quote || '';
      var media = v.src ? '<button class="rc__m" type="button" data-video="' + esc(v.src) + '" aria-label="Ver video de ' + esc(v.name) + '"><img src="' + esc(v.poster) + '" alt="" loading="lazy"><span class="rc__pl"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span></button>'
        : '<div class="rc__m"><img src="' + esc(v.poster) + '" alt="' + esc(v.name) + '" loading="lazy"></div>';
      return '<article class="rc">' + media + '<div class="rc__b"><h3>' + esc(title) + '</h3><p>' + esc(quote) + '</p>' +
        (v.src ? '<button class="rc__a" type="button" data-video="' + esc(v.src) + '">Ver historia ' + ARR + '</button>' : '<a class="rc__a" href="#agendar" data-lead="catarata">Agenda tu consulta ' + ARR + '</a>') + '</div></article>';
    }).join('');
    var vp = tr.parentElement, pa = $('.rp__ar--p'), na = $('.rp__ar--n');
    if (pa) {
      pa.onclick = function () { vp.scrollBy({ left: -326, behavior: 'smooth' }); };
      na.onclick = function () { vp.scrollBy({ left: 326, behavior: 'smooth' }); };
      var upd = function () { var s = vp.scrollLeft < 4; pa.style.opacity = s ? 0 : 1; pa.style.pointerEvents = s ? 'none' : ''; };
      vp.addEventListener('scroll', upd, { passive: true }); upd();
    }
  }

  /* steps +más */
  $$('.st__g button').forEach(function (b) { b.onclick = function () { var d = b.closest('div'); var o = d.classList.toggle('open'); b.textContent = o ? '−menos' : '+más'; }; });

  /* sedes cards */
  var sg = $('#sdG');
  if (sg) sg.innerHTML = C.sedes.map(function (s, i) {
    return '<article class="sc rv"><i><svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></i><h3>' + esc(s.city) + '</h3><small>' + esc(s.state) + '</small>' +
      (s.addr ? '<p>' + esc(s.addr) + '</p>' : '') + '<div class="sc__x"><a class="b b--blue" href="#agendar" data-lead="' + (document.body.dataset.case || 'consulta') + '" data-sede="' + i + '">Agendar aquí</a><a class="t" href="tel:+52' + s.tel.replace(/\D/g, '') + '" data-no-lead>' + esc(s.tel) + '</a></div></article>';
  }).join('') + '<article class="sc sc--cta rv"><i><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg></i><h3>¿No sabes cuál es tu sede?</h3><p>Escríbenos y te ayudamos a encontrar la clínica más cerca de ti.</p><a class="b b--y" href="#agendar" data-lead="' + (document.body.dataset.case || 'consulta') + '">Escribir por WhatsApp</a></article>';
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sede]'); if (!a) return;
    try { var st = JSON.parse(localStorage.getItem('ov_lead') || '{}'); st.sede = a.dataset.sede; localStorage.setItem('ov_lead', JSON.stringify(st)); } catch (x) {}
    setTimeout(function () { var sel = $('.lead select[name="sede"]'); if (sel) sel.value = a.dataset.sede; }, 0);
  }, true);
  var fh = $('#foHrs'); if (fh) fh.textContent = C.hours;

  /* reveal */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
  $$('.rv').forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 80) + 'ms'; io.observe(el); });

  /* hero counter */
  var n = $('.hr__n');
  if (n && !RM) { var t0 = null, end = +n.dataset.count; n.textContent = '+0'; requestAnimationFrame(function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1600); p = 1 - Math.pow(1 - p, 3); n.textContent = '+' + Math.round(end * p).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(f); }); }

  var sim = $('#sim');
  if (sim) {
    var rg = $('.sim__r', sim), setX = function (v) { sim.style.setProperty('--x', v + '%'); };
    rg.addEventListener('input', function () { setX(rg.value); }); setX(rg.value);
    var demo = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || RM) return; demo.disconnect(); var t0 = null;
      requestAnimationFrame(function f(t) { if (!t0) t0 = t; var q = (t - t0) / 2600; if (q > 1) { rg.value = 50; setX(50); return; } var v = 50 + Math.sin(q * Math.PI * 2) * 32; rg.value = v; setX(v); requestAnimationFrame(f); });
    }, { threshold: .6 });
    demo.observe(sim);
    document.addEventListener('click', function (e) { if (e.target.closest('[data-sim-focus]')) { sim.scrollIntoView({ behavior: 'smooth', block: 'center' }); rg.focus(); } });
  }
  /* quiz banner parallax */
  var qbi = $('.qb__bg img');
  if (qbi && !RM) addEventListener('scroll', function () { var r0 = qbi.parentElement.getBoundingClientRect(); if (r0.bottom < 0 || r0.top > innerHeight) return; qbi.style.transform = 'scale(1.08) translateY(' + ((r0.top - innerHeight / 2) * -0.06) + 'px)'; }, { passive: true });

  var QS = ['¿Ves borroso o nublado?', '¿Te deslumbran las luces de noche, por ejemplo al manejar?', '¿Sientes que ves como a través de un vidrio empañado?', '¿Notas que ves menos que antes?', '¿La revisión es para alguien de 50 años o más?'];
  var qz, step = 0, yes = 0;
  function quiz() {
    if (!qz) {
      qz = document.createElement('div'); qz.className = 'qz-ov';
      qz.innerHTML = '<div class="qz" role="dialog" aria-modal="true" aria-label="Test de síntomas"><button class="qz__x" type="button" aria-label="Cerrar">×</button><div class="qz__bar"><i></i></div><div class="qz__body"></div></div>';
      document.body.appendChild(qz);
      qz.addEventListener('click', function (e) {
        if (e.target === qz || e.target.closest('.qz__x')) { qz.classList.remove('on'); return; }
        var b = e.target.closest('[data-a]'); if (!b) return;
        if (b.dataset.a === '1') yes++; step++; render();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') qz.classList.remove('on'); });
    }
    step = 0; yes = 0; render(); qz.classList.add('on');
  }
  function render() {
    var body = $('.qz__body', qz); $('.qz__bar i', qz).style.width = (step / QS.length * 100) + '%';
    if (step < QS.length) {
      body.innerHTML = '<div class="qz__step"><p class="qz__n">Pregunta ' + (step + 1) + ' de ' + QS.length + '</p><h3>' + esc(QS[step]) + '</h3><div class="qz__o"><button type="button" data-a="1">Sí</button><button type="button" data-a="0">No</button></div></div>';
      setTimeout(function () { var f = $('.qz__o button', qz); if (f) f.focus(); }, 50);
    } else {
      var match = yes >= 2;
      body.innerHTML = '<div class="qz__step qz__r"><p class="qz__n">Tu resultado</p><h3>' + (match ? 'Tus respuestas coinciden con síntomas de catarata' : 'Tus respuestas no coinciden con los síntomas más comunes') + '</h3>' +
        '<p>' + (match ? 'Solo una consulta con tu oftalmólogo puede confirmarlo. Agenda tu consulta y te escribimos por WhatsApp con horarios en tu sede.' : 'Si notas cambios en tu vista, una revisión oftalmológica te da tranquilidad. Agenda tu consulta por WhatsApp.') + '</p>' +
        '<button class="b b--blue" type="button" data-qlead="' + (match ? 'catarata' : 'consulta') + '">Agendar consulta</button><small>Este test es orientativo y no sustituye una consulta médica.</small></div>';
      $('[data-qlead]', body).onclick = function () { qz.classList.remove('on'); OVLead.open(this.dataset.qlead); };
    }
  }
  document.addEventListener('click', function (e) { var q = e.target.closest('[data-quiz]'); if (q) { e.preventDefault(); quiz(); } });
})();
