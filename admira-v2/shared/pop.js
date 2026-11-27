
(function () {
  const M = window.ADM_MEDIA || {}, ORDER = window.ADM_MEDIA_ORDER || Object.keys(M);
  const ICON = {
    x: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.2-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5Z"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  };
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  
  let dlg, opener;
  function build() {
    dlg = document.createElement('dialog'); dlg.className = 'tx-dlg'; dlg.id = 'tour-dialog'; dlg.setAttribute('aria-labelledby', 'tour-title');
    dlg.innerHTML = `<div class="tx-win"><button type="button" class="tx-close" aria-label="Close video">${ICON.x}</button>
      <div class="tx-video"><video controls loop playsinline preload="metadata"></video></div>
      <div class="tx-info"><h2 id="tour-title"></h2><p id="tour-description"></p><a href="#" class="tx-go" data-lead>Book a demo</a></div></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector('.tx-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('[data-lead]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); dlg.close(); window.AdmLead && AdmLead.open(); });
    dlg.addEventListener('close', () => {
      const v = dlg.querySelector('video'); v.pause(); v.removeAttribute('src'); v.load();
      document.documentElement.classList.remove('alm-lock');
      opener && opener.isConnected && opener.focus({ preventScroll: true });
    });
  }
  function open(key, from) {
    const m = M[key]; if (!m) return false;
    if (!dlg) build();
    opener = from || document.activeElement;
    const v = dlg.querySelector('video');
    const portrait = matchMedia('(max-width: 767px)').matches && !!m.mvideo;
    dlg.classList.toggle('portrait', portrait); dlg.classList.toggle('panel-film', !portrait && !!m.panel);
    v.innerHTML = m.vtt ? `<track kind="captions" label="English" srclang="en" src="${m.vtt}">` : '';
    v.poster = (portrait ? m.mposter : m.poster) || ''; v.src = portrait ? m.mvideo : m.video; v.setAttribute('aria-label', m.title);
    dlg.querySelector('#tour-title').textContent = m.title;
    dlg.querySelector('#tour-description').textContent = m.desc || '';
    dlg.showModal(); document.documentElement.classList.add('alm-lock');
    v.play().catch(() => {});
    dlg.querySelector('.tx-close').focus({ preventScroll: true });
    return true;
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-watch]');
    if (!t || (dlg && dlg.contains(t))) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (open(t.dataset.watch, t)) e.preventDefault();
  });

  
  function rail(sec) {
    const keys = (sec.dataset.examples ? sec.dataset.examples.split(',') : ORDER).map((k) => k.trim()).filter((k) => M[k] && M[k].thumb);
    const title = sec.dataset.title || 'See Admira in action.', sub = sec.dataset.sub || 'Follow the work from campaign to close.';
    sec.classList.add('tx-ex');
    sec.innerHTML = `<div class="in"><h2 class="h2 rv">${esc(title)}<br><span class="m">${esc(sub)}</span></h2>
      <ul class="tx-rail" tabindex="0" aria-label="Product tour carousel">${keys.map((k) => `<li><button type="button" class="tx-card" data-watch="${k}">
        <span class="tx-thumb"><img loading="lazy" src="${M[k].thumb}" alt=""><span class="tx-play">${ICON.play}</span></span>
        <span class="tx-cap">${esc(M[k].caption || M[k].title)}</span></button></li>`).join('')}</ul>
      <div class="tx-ctrl"><button type="button" aria-label="Previous product tour" disabled>${ICON.back}</button><button type="button" aria-label="Next product tour">${ICON.next}</button></div></div>`;
    const ul = sec.querySelector('.tx-rail'), [pv, nx] = sec.querySelectorAll('.tx-ctrl button');
    const step = () => { const li = ul.querySelector('li'); return li ? li.getBoundingClientRect().width + 12 : 300; };
    const sync = () => { pv.disabled = ul.scrollLeft < 4; nx.disabled = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 4; };
    pv.onclick = () => ul.scrollBy({ left: -step(), behavior: 'smooth' }); nx.onclick = () => ul.scrollBy({ left: step(), behavior: 'smooth' });
    ul.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
    sec.querySelectorAll('.rv').forEach((el) => el.classList.add('on'));
  }
  
  const PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/></svg>';
  const EXP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
  function film(el) {
    const k = el.dataset.film, m = M[k]; if (!m) return;
    el.classList.add('tx-film'); if (matchMedia('(max-width: 767px)').matches && m.mvideo) { el.classList.add('portrait'); }
    el.innerHTML = `<video muted playsinline loop preload="none" poster="${el.classList.contains('portrait') ? (m.mposter || m.poster) : m.poster}" aria-label="${esc(m.title)}"></video>
      <div class="tx-fc"><button type="button" class="tx-fp" aria-label="Pause ${esc(m.title)}" title="Pause or play">${PAUSE}</button><button type="button" data-watch="${k}" aria-label="Enlarge ${esc(m.title)}" title="Open full video">${EXP}</button></div>`;
    const v = el.querySelector('video'), b = el.querySelector('.tx-fp'); let user = false, seen = false;
    const ico = () => { b.innerHTML = v.paused ? ICON.play.replace('19', '16').replace('19', '16') : PAUSE; };
    b.onclick = () => { user = !v.paused; v.paused ? v.play().catch(() => {}) : v.pause(); setTimeout(ico, 30); };
    v.addEventListener('play', ico); v.addEventListener('pause', ico);
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { if (!seen) { const ph = matchMedia('(max-width: 767px)').matches && m.mvideo; v.src = ph ? m.mvideo : m.video; if (ph) { v.poster = m.mposter || v.poster; el.classList.add('portrait'); } seen = true; } if (!user) v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.25 }).observe(el);
  }
  const init = () => { document.querySelectorAll('[data-examples]').forEach(rail); document.querySelectorAll('[data-film]').forEach(film); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
  window.AdmTour = { open, keys: () => Object.keys(M) };
})();
