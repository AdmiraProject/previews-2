
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  const h = $('.hdr'); addEventListener('scroll', () => h && h.classList.toggle('scrolled', scrollY > 40), { passive: true });

  const ri = $('.ri');
  if (ri && $('.chips', ri)) {
    let cat = 'All', q = '';
    const items = $$('[data-cat]', ri), none = $('.none', ri), grid = $('.grid', ri), allH = $('.all h2', ri);
    const apply = () => {
      let shown = 0;
      items.forEach(it => {
        const ok = (cat === 'All' || it.dataset.cat === cat) && (!q || it.dataset.q.includes(q));
        it.hidden = !ok; if (ok && it.classList.contains('row')) shown++;
      });
      const filtering = cat !== 'All' || q;
      if (grid) grid.hidden = !!filtering; // like the benchmark: featured grid only on the unfiltered view
      if (allH) allH.textContent = filtering ? `${shown} result${shown === 1 ? '' : 's'}` : allH.dataset.t;
      if (none) none.hidden = shown > 0;
    };
    $$('.chips button', ri).forEach(b => b.addEventListener('click', () => {
      $$('.chips button', ri).forEach(x => x.classList.toggle('on', x === b)); cat = b.dataset.c; apply();
    }));
    const inp = $('.srch input', ri); inp && inp.addEventListener('input', () => { q = inp.value.trim().toLowerCase(); apply(); });
  }

  $$('.vid button[data-yt]').forEach(b => b.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0&modestbranding=1`;
    f.title = b.getAttribute('aria-label') || 'Webinar recording';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    b.replaceWith(f);
  }));

  const links = $$('.side .toc a[href^="#"]');
  if (links.length) {
    const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const spy = () => { let cur = secs[0]; secs.forEach(s => { if (s.getBoundingClientRect().top < 140) cur = s; }); links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + (cur && cur.id))); };
    addEventListener('scroll', spy, { passive: true }); spy();
  }
})();

document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const s = b.querySelector('span'); try { await navigator.clipboard.writeText(location.href.split('#')[0]); s.textContent = 'Link copied'; } catch (_) { s.textContent = 'Copy failed'; }
  b.classList.add('ok'); setTimeout(() => { s.textContent = 'Copy link'; b.classList.remove('ok'); }, 1800);
}));
