(function () {
  'use strict';
  var SCRIPT = (document.currentScript && document.currentScript.src) || '';
  var BASE = SCRIPT ? new URL('../assets/video/ugc/', SCRIPT).href : '../assets/video/ugc/';
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var IC = {
    play: '<svg class="i-play" viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.2v11.6c0 .5.6.8 1 .5l8.6-5.8a.6.6 0 0 0 0-1L7.5 3.7c-.4-.3-1 0-1 .5Z" fill="currentColor"/></svg>',
    pause: '<svg class="i-pause" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.4" height="12" rx="1" fill="currentColor"/><rect x="11.6" y="4" width="3.4" height="12" rx="1" fill="currentColor"/></svg>',
    off: '<svg class="i-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor"/><path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
    on: '<svg class="i-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
    x: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(f) { return f ? new URL(f, BASE).href : ''; }

  var allVideos = [];
  function muteOthers(except) {
    allVideos.forEach(function (v) { if (v !== except && !v.muted) { v.muted = true; var c = v.closest('.ugc-card'); c && c.classList.remove('is-unmuted'); syncSoundLabel(c); } });
  }
  function syncSoundLabel(card) {
    if (!card) return; var b = card.querySelector('.ugc-sound'); if (!b) return;
    b.setAttribute('aria-label', card.classList.contains('is-unmuted') ? 'Silenciar video' : 'Activar sonido');
  }

  /* ---------- card markup ---------- */
  function cardHTML(id, it, slot, i) {
    var cls = ['ugc-item'];
    if (it.type === 'quote') cls.push('ugc-item--quote');
    if (slot === 'T' || slot === 'P') cls.push('ugc-item--tall');
    if (it.pill && it.type !== 'quote') cls.push('ugc-item--pill');
    if (it.type === 'quote') {
      return '<div class="' + cls.join(' ') + '" data-id="' + id + '"><div class="ugc-card"><div class="ugc-quote">' +
        '<div class="ugc-quote-top"><h3 class="ugc-q">“' + esc(it.quote) + '”</h3>' +
        '<button class="ugc-btn ugc-mini ugc-more" type="button" aria-expanded="false" aria-label="Ver cita completa">' + IC.plus + '</button></div>' +
        '<div class="ugc-meta"><h4 class="ugc-name">' + esc(it.name) + '</h4><p class="ugc-subt">' + esc(it.sub) + '</p></div>' +
        '</div></div></div>';
    }
    var label = esc(it.name);
    return '<div class="' + cls.join(' ') + '" data-id="' + id + '"><div class="ugc-card">' +
      '<div class="ugc-media" role="button" tabindex="0" aria-label="Ver video de ' + label + ' con sonido">' +
        '<img src="' + url(it.poster) + '" alt="' + label + (it.sub ? ' — ' + esc(it.sub) : '') + '" loading="lazy" decoding="async" style="object-position:' + (it.pos || '50% 50%') + '">' +
        '<video muted loop playsinline preload="none" disablepictureinpicture poster="' + url(it.poster) + '" data-src="' + url(it.src) + '"' + (it.hd ? ' data-hd="' + url(it.hd) + '"' : '') +
        ' style="object-position:' + (it.pos || '50% 50%') + '" aria-hidden="true"></video>' +
      '</div>' +
      (it.pill ? '<span class="ugc-pill">' + esc(it.pill) + '</span>' : '') +
      '<button class="ugc-btn ugc-play" type="button" aria-label="Reproducir video de ' + label + '">' + IC.play + IC.pause + '</button>' +
      '<div class="ugc-scrim"><div class="ugc-row"><div class="ugc-meta"><h4 class="ugc-name">' + esc(it.name) + '</h4>' +
        '<p class="ugc-subt">' + esc(it.sub) + '</p>' + (it.legal ? '<p class="ugc-legal">' + esc(it.legal) + '</p>' : '') + '</div>' +
        (it.noaudio ? '' : '<button class="ugc-btn ugc-mini ugc-sound" type="button" aria-label="Activar sonido">' + IC.off + IC.on + '</button>') +
      '</div></div>' +
      '</div></div>';
  }

  /* ---------- video control ---------- */
  function ensureSrc(v) {
    if (v.getAttribute('src')) return;
    var hd = v.getAttribute('data-hd'), w = v.getBoundingClientRect().width * (window.devicePixelRatio || 1);
    v.src = hd && w > 760 ? hd : v.getAttribute('data-src');
  }
  function play(v) {
    ensureSrc(v);
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function setPlaying(card, on) { card.classList.toggle('is-playing', on); var b = card.querySelector('.ugc-play'); if (b) b.setAttribute('aria-label', (on ? 'Pausar' : 'Reproducir') + ' video de ' + (card.querySelector('.ugc-name') || {}).textContent); }

  function wireCard(item, it, io) {
    var card = item.querySelector('.ugc-card');
    var v = item.querySelector('video');
    if (!v) {
      var more = item.querySelector('.ugc-more');
      more && more.addEventListener('click', function () {
        var open = item.classList.toggle('is-open'); more.setAttribute('aria-expanded', open ? 'true' : 'false');
        more.setAttribute('aria-label', open ? 'Cerrar cita' : 'Ver cita completa');
      });
      return;
    }
    allVideos.push(v);
    v.addEventListener('playing', function () { v.classList.add('is-ready'); setPlaying(card, true); });
    v.addEventListener('pause', function () { setPlaying(card, false); });
    v.addEventListener('loadeddata', function () { if (!v.paused) v.classList.add('is-ready'); });
    item.querySelector('.ugc-play').addEventListener('click', function (e) {
      e.stopPropagation();
      if (v.paused) { v._user = false; play(v); } else { v._user = true; v.pause(); }
    });
    var snd = item.querySelector('.ugc-sound');
    snd && snd.addEventListener('click', function (e) {
      e.stopPropagation();
      var unmute = v.muted;
      if (unmute) muteOthers(v);
      v.muted = !unmute; card.classList.toggle('is-unmuted', unmute); syncSoundLabel(card);
      if (unmute && v.paused) { v._user = false; play(v); }
    });
    var media = item.querySelector('.ugc-media');
    function open() { openModal(it, v); }
    media.addEventListener('click', open);
    media.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    io && io.observe(v);
  }

  var M = null, lastFocus = null, resumeAfter = null;
  function buildModal() {
    M = document.createElement('div');
    M.className = 'ugcm'; M.setAttribute('role', 'dialog'); M.setAttribute('aria-modal', 'true'); M.setAttribute('aria-label', 'Video');
    M.innerHTML = '<div class="ugcm-bg"></div><div class="ugcm-dlg"><video playsinline loop></video>' +
      '<span class="ugc-pill" hidden></span><div class="ugcm-scrim"><h2 class="ugcm-name"></h2><p class="ugcm-sub"></p><p class="ugcm-legal" hidden></p></div>' +
      '<button class="ugcm-x" type="button" aria-label="Cerrar">' + IC.x + '</button>' +
      '<button class="ugcm-snd" type="button" aria-label="Silenciar video">' + IC.off + IC.on + '</button></div>';
    document.body.appendChild(M);
    M.querySelector('.ugcm-bg').addEventListener('click', closeModal);
    M.querySelector('.ugcm-x').addEventListener('click', closeModal);
    M.querySelector('.ugcm-snd').addEventListener('click', function () {
      var mv = M.querySelector('video'); mv.muted = !mv.muted; M.classList.toggle('is-unmuted', !mv.muted);
      this.setAttribute('aria-label', mv.muted ? 'Activar sonido' : 'Silenciar video');
    });
    document.addEventListener('keydown', function (e) {
      if (!M.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') { // trap focus between the two buttons
        var a = M.querySelector('.ugcm-x'), b = M.querySelector('.ugcm-snd');
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    });
  }
  function openModal(it, cardVideo) {
    if (!M) buildModal();
    lastFocus = document.activeElement;
    var host = cardVideo.closest('.ugcw'); var cs = host ? getComputedStyle(host) : null;
    ['--ugc-font', '--ugc-body'].forEach(function (k) { if (cs) M.style.setProperty(k, cs.getPropertyValue(k)); });
    var dlg = M.querySelector('.ugcm-dlg'); dlg.classList.toggle('is-v', it.ratio !== '16/9');
    var mv = M.querySelector('video');
    mv.src = url(it.hd || it.src); mv.poster = url(it.poster);
    try { mv.currentTime = cardVideo.currentTime || 0; } catch (e) {}
    var pill = M.querySelector('.ugc-pill'); pill.hidden = !it.pill; pill.textContent = it.pill || '';
    M.querySelector('.ugcm-name').textContent = it.name;
    M.querySelector('.ugcm-sub').textContent = it.sub || '';
    var lg = M.querySelector('.ugcm-legal'); lg.hidden = !it.legal; lg.textContent = it.legal || '';
    var hasAudio = !it.noaudio; // official QiTrax film has no audio track
    M.querySelector('.ugcm-snd').hidden = !hasAudio;
    mv.muted = !hasAudio; M.classList.toggle('is-unmuted', hasAudio);
    M.querySelector('.ugcm-snd').setAttribute('aria-label', hasAudio ? 'Silenciar video' : 'Activar sonido');
    // pause the wall while the modal plays
    resumeAfter = allVideos.filter(function (v) { return !v.paused; });
    resumeAfter.forEach(function (v) { v.pause(); });
    M.classList.add('is-open'); document.documentElement.classList.add('ugcm-lock');
    var p = mv.play(); if (p && p.catch) p.catch(function () { mv.muted = true; M.classList.remove('is-unmuted'); mv.play().catch(function () {}); });
    M.querySelector('.ugcm-x').focus({ preventScroll: true });
  }
  function closeModal() {
    if (!M) return;
    var mv = M.querySelector('video'); mv.pause(); mv.removeAttribute('src'); mv.load();
    M.classList.remove('is-open'); document.documentElement.classList.remove('ugcm-lock');
    (resumeAfter || []).forEach(function (v) { if (!v._user && !RM) play(v); }); resumeAfter = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- section render ---------- */
  function render(sec, D) {
    if (sec.getAttribute('data-ugc-ready')) return;
    sec.setAttribute('data-ugc-ready', '1');
    var ctx = sec.getAttribute('data-ugc') || 'home';
    if (!D.orders[ctx]) ctx = 'home';
    var C = D.copy[ctx], order = D.orders[ctx];
    var hid = 'ugcw-h-' + ctx + '-' + Math.random().toString(36).slice(2, 7);
    sec.setAttribute('aria-labelledby', hid);
    var html = '<div class="ugcw-in"><div class="ugcw-head"><h2 class="ugcw-h" id="' + hid + '">' + esc(C.h) + '</h2>' +
      '<p class="ugcw-sub">' + esc(C.sub) + '</p></div><div class="ugcw-grid">';
    order.forEach(function (id, i) { var it = D.items[id]; if (it) html += cardHTML(id, it, D.slots[i] || 'S', i); });
    html += '</div></div>';
    html += '<div class="ugcw-cta" aria-hidden="true"><a href="https://www.qihealth.ai/" data-buy="' + esc(C.buy) + '" tabindex="-1"><span>' + esc(D.cta) + '</span></a></div>';
    sec.innerHTML = html;

    var hasIO = 'IntersectionObserver' in window;
    // videos: play when ≥25% visible, pause when off-screen
    var vio = hasIO ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.25) { if (!RM && !v._user && !(M && M.classList.contains('is-open'))) play(v); }
        else if (!e.isIntersecting) { // fully off-screen: WHOOP unmounts the video and restarts it from 0 on re-entry
          if (!v.paused) v.pause();
          if (!v._user && v.readyState) { try { v.currentTime = 0; } catch (x) {} }
        }
        else if (e.intersectionRatio < 0.25 && !v.paused && !v._user) { /* keep playing while partially visible */ }
      });
    }, { threshold: [0, 0.05, 0.25, 0.5] }) : null;

    var items = sec.querySelectorAll('.ugc-item');
    items.forEach(function (el) { wireCard(el, D.items[el.getAttribute('data-id')], vio); });
    if (!hasIO && !RM) sec.querySelectorAll('video').forEach(play);


    // sticky CTA while the grid is on screen
    var cta = sec.querySelector('.ugcw-cta'), grid = sec.querySelector('.ugcw-grid'), shown = false;
    function setCta(on) {
      if (on === shown) return; shown = on;
      cta.classList.toggle('is-shown', on); cta.classList.toggle('is-hidden', !on);
      cta.setAttribute('aria-hidden', on ? 'false' : 'true');
      cta.querySelector('a').setAttribute('tabindex', on ? '0' : '-1');
    }
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (e) { setCta(e.isIntersecting); }); }, { threshold: 0, rootMargin: '0px 0px -20% 0px' }).observe(grid);
    else setCta(true);
  }

  function init() {
    var D = window.QI_UGC;
    if (!D) { console.warn('[ugc] QI_UGC missing — load shop/ugc-data.js before shop/ugc.js'); return; }
    document.querySelectorAll('section.ugcw, .ugcw[data-ugc]').forEach(function (s) { render(s, D); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.QI_UGC_INIT = init;
})();
