
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const grid = $('#grid');
  if (grid) {
    let f = 'all'; const q = $('#q');
    const run = () => {
      const t = (q.value || '').trim().toLowerCase(); let n = 0;
      $$('.ix', grid).forEach(c => { const ok = (f === 'all' || c.dataset.cat.split(' ').includes(f)) && (!t || c.dataset.name.includes(t)); c.classList.toggle('hide', !ok); if (ok) n++; });
      $('#fc').textContent = n; $('#fn').textContent = f === 'all' ? 'All' : $(`.flt [data-f="${f}"]`).textContent; $('#none').hidden = n > 0;
    };
    $$('.flt button').forEach(b => b.addEventListener('click', () => { f = b.dataset.f; $$('.flt button').forEach(x => x.classList.toggle('on', x === b)); run(); }));
    q.addEventListener('input', run);
    if (location.hash === '#soon') { const b = $('.flt [data-f="soon"]'); b && b.click(); }
  }
  $$('.faq .q>button').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('o')));
  $$('.sa').forEach(b => b.addEventListener('click', () => { const g = b.previousElementSibling; g.classList.add('all'); b.remove(); }));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));
  const w = $('.win[data-scene]');
  if (w && window.AdmScene) (async () => {
    const R = new URL('../', document.currentScript ? document.currentScript.src : location.href).href; // site root
    const P = R + 'assets/proto/', M = await AdmScene.manifest(P + 'manifest.json'), sc = w.dataset.scene, nums = w.dataset.nums.split(',').map(Number);
    const key = M[sc + '@panel'] ? sc + '@panel' : sc;
    const es = nums.map(n => (M[key] || []).find(e => e.file.split('/').pop().startsWith(String(n).padStart(2, '0')))).filter(Boolean);
    const [W, H] = M[sc + '@panel'] ? [1088, 570] : [1440, 900];
    new AdmScene(w.querySelector('.sc'), AdmScene.auto(P, es, { w: W, h: H, zoom: 1.25, hold: 1.4 }));
  })();
})();
