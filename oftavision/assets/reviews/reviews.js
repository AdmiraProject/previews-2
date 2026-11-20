/* Oftavisión reviews block (Optical Express "Patient Reviews" pattern):
   centered H2 + intro → rounded rating card (summary left, review carousel right, arrows)
   → full-bleed strip of patient video tiles (arrows, click = lightbox player).
   Mount: <section data-ov-reviews></section>. Data: window.OV_REVIEWS (reviews-data.js) — REAL reviews only.
   Each version restyles through CSS vars (see reviews.css). */
(function () {
  var D = window.OV_REVIEWS; if (!D) return;
  var base = (document.currentScript ? document.currentScript.src : '').replace(/reviews\.js.*$/, '');
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'reviews.css'; document.head.appendChild(l);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
  function stars(n, cls) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span class="' + (cls || 'ovr-st') + (i <= Math.round(n) ? ' on' : '') + '">' + STAR + '</span>'; return '<span class="ovr-stars" role="img" aria-label="' + n + ' de 5 estrellas">' + s + '</span>'; }
  var G = '<svg class="ovr-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  var ARR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  document.querySelectorAll('[data-ov-reviews]').forEach(function (root) {
    var rv = D.reviews || [], vids = D.videos || [];
    var label = D.rating >= 4.5 ? 'Excelente' : D.rating >= 4 ? 'Muy bueno' : 'Bueno';
    root.classList.add('ovr');
    root.innerHTML =
      '<div class="ovr-in">' +
      '<h2 class="ovr-h">' + esc(D.title || 'Opiniones de pacientes') + '</h2>' +
      (D.intro ? '<p class="ovr-p">' + esc(D.intro) + '</p>' : '') +
      '<div class="ovr-card">' +
        '<div class="ovr-sum">' +
          (D.rating ? '<b class="ovr-ex">' + label + '</b>' + stars(D.rating, 'ovr-st ovr-st--box') +
            '<small>Basado en <a href="' + esc(D.url || '#') + '" target="_blank" rel="noopener" data-no-lead>' + esc(D.countLabel || (D.count + ' reseñas')) + '</a></small>' +
            '<span class="ovr-src">' + G + '<span>' + esc(D.source || 'Google') + '</span></span>'
          : '<b class="ovr-ex">' + esc(D.sumTitle || 'Historias reales') + '</b>' + (D.sumBig ? '<span class="ovr-big">' + esc(D.sumBig) + '</span>' : '') +
            '<small>' + esc(D.sumSub || '') + '</small>' + (D.logo ? '<img class="ovr-logo" src="' + esc(D.logo) + '" alt="">' : '')) +
        '</div>' +
        '<button class="ovr-ar ovr-ar--p" type="button" aria-label="Reseñas anteriores">' + ARR + '</button>' +
        '<div class="ovr-vp"><div class="ovr-tr">' +
          rv.map(function (r) {
            return '<article class="ovr-rv">' + (r.stars ? stars(r.stars, 'ovr-st ovr-st--box') : '<span class="ovr-tag">' + esc(r.tag || 'Testimonio en video') + '</span>') +
              '<p class="ovr-meta"><b>' + esc(r.name) + '</b>' + (r.when ? ', ' + esc(r.when) : '') + '</p>' +
              (r.title ? '<h3 class="ovr-t">' + esc(r.title) + '</h3>' : '') +
              '<p class="ovr-x">' + esc(r.text) + '</p></article>';
          }).join('') +
        '</div></div>' +
        '<button class="ovr-ar ovr-ar--n" type="button" aria-label="Más reseñas">' + ARR + '</button>' +
        (D.note ? '<p class="ovr-note">' + esc(D.note) + '</p>' : '') +
      '</div></div>' +
      (vids.length ? '<div class="ovr-vs"><button class="ovr-va ovr-va--p" type="button" aria-label="Videos anteriores">' + ARR + '</button><div class="ovr-vt">' +
        vids.map(function (v, i) {
          return '<button class="ovr-v" type="button" data-i="' + i + '" aria-label="Ver testimonio de ' + esc(v.name) + '"><img src="' + esc(v.poster) + '" alt="" loading="lazy">' +
            (v.src ? '<span class="ovr-vp-ic"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span>' : '<span class="ovr-vp-ic ovr-vp-ic--q">“</span>') +
            '<span class="ovr-vn"><b>' + esc(v.name) + '</b>' + (v.caption ? esc(v.caption) : '') + '</span></button>';
        }).join('') + '</div><button class="ovr-va ovr-va--n" type="button" aria-label="Más videos">' + ARR + '</button></div>' : '');

    // review carousel: step by card width, disable arrows at ends
    var vp = root.querySelector('.ovr-vp'), p = root.querySelector('.ovr-ar--p'), n = root.querySelector('.ovr-ar--n');
    function step(d) { var c = vp.querySelector('.ovr-rv'); vp.scrollBy({ left: d * (c ? c.offsetWidth + 24 : 300), behavior: 'smooth' }); }
    function upd() { p.disabled = vp.scrollLeft < 4; n.disabled = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 4; }
    p.onclick = function () { step(-1); }; n.onclick = function () { step(1); };
    vp.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    // auto-advance every 6s while visible, pause on hover/focus
    var hold = false, seen = false;
    root.querySelector('.ovr-card').addEventListener('pointerenter', function () { hold = true; });
    root.querySelector('.ovr-card').addEventListener('pointerleave', function () { hold = false; });
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(vp);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(function () { if (hold || !seen) return; if (n.disabled) vp.scrollTo({ left: 0, behavior: 'smooth' }); else step(1); }, 6000);

    // video strip
    var vt = root.querySelector('.ovr-vt');
    if (vt) {
      root.querySelector('.ovr-va--p').onclick = function () { vt.scrollBy({ left: -vt.clientWidth * .8, behavior: 'smooth' }); };
      root.querySelector('.ovr-va--n').onclick = function () { vt.scrollBy({ left: vt.clientWidth * .8, behavior: 'smooth' }); };
      vt.addEventListener('click', function (e) { var b = e.target.closest('.ovr-v'); if (b) play(vids[+b.dataset.i]); });
      // gentle hover preview: tiles lift + reveal name (CSS); stagger-in on view
      new IntersectionObserver(function (es, o) { es.forEach(function (x) { if (x.isIntersecting) { root.classList.add('ovr-in-view'); o.disconnect(); } }); }, { threshold: .2 }).observe(vt);
    }
  });

  var box;
  function play(v) {
    if (!box) {
      box = document.createElement('div'); box.className = 'ovr-lb';
      box.innerHTML = '<div class="ovr-lb-in"><button class="ovr-lb-x" type="button" aria-label="Cerrar">×</button><video controls playsinline></video><figure class="ovr-lb-q"><img alt=""><blockquote></blockquote></figure><p class="ovr-lb-c"></p></div>';
      document.body.appendChild(box);
      box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.ovr-lb-x')) shut(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('on')) shut(); });
    }
    var vd = box.querySelector('video'), q = box.querySelector('.ovr-lb-q');
    box.classList.toggle('is-q', !v.src);
    if (v.src) { vd.src = v.src; vd.poster = v.poster || ''; } else { q.querySelector('img').src = v.poster; q.querySelector('blockquote').textContent = '“' + (v.quote || '') + '”'; }
    box.querySelector('.ovr-lb-c').textContent = v.name + (v.caption ? ' · ' + v.caption : '');
    box.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    if (v.src) vd.play().catch(function () {});
  }
  function shut() { var vd = box.querySelector('video'); vd.pause(); if (vd.getAttribute('src')) { vd.removeAttribute('src'); vd.load(); } box.classList.remove('on'); document.documentElement.style.overflow = ''; }
})();
