
(async function () {
  const D = window.CO || {}, R = D.R || '../', $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  AdmUI.faq(); AdmUI.header(); AdmUI.reveal();

  
  $$('.pc .vs select').forEach(s => s.addEventListener('change', () => { const v = s.closest('.pc').querySelector('.pr .v'); v.textContent = s.selectedOptions[0].dataset.p; }));

  
  const lots = $$('[data-lottie]');
  if (lots.length && window.lottie) {

    const clear = (d) => {
      const W = d.w, H = d.h, comps = [d.layers, ...(d.assets || []).filter(a => a.layers).map(a => a.layers)];
      const walk = (it, hit) => it.forEach(s => { if (s.ty === 'gr') walk(s.it || [], hit); else hit(s); });
      comps.forEach(ls => ls.forEach(l => {
        if (l.ty !== 4) return; let big = false; const fills = [];
        walk(l.shapes || [], s => { if (s.ty === 'rc' && Array.isArray(s.s && s.s.k) && s.s.k[0] >= W * .9 && s.s.k[1] >= H * .9) big = true; if (s.ty === 'fl') fills.push(s); });
        if (big) fills.forEach(f => { const c = f.c && f.c.k; if (Array.isArray(c) && c[0] + c[1] + c[2] < 2.97) f.o = { a: 0, k: 0 }; });
      }));
      return d;
    };
    const io = new IntersectionObserver(es => es.forEach(e => { e.target._vis = e.isIntersecting; const a = e.target._a; if (!a) return; e.isIntersecting ? a.play() : a.pause(); }), { threshold: .2 });
    lots.forEach(async el => {
      const opts = { container: el, renderer: 'svg', loop: true, autoplay: false, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } };
      try { opts.animationData = clear(await fetch(el.dataset.lottie).then(r => r.json())); } catch (_) { opts.path = el.dataset.lottie; } // opened from disk: play as-is
      const an = el._a = lottie.loadAnimation(opts); io.observe(el);
      an.addEventListener('DOMLoaded', () => { const f = Math.round(an.totalFrames * .35); el._vis ? an.goToAndPlay(f, true) : an.goToAndStop(f, true); }); // first view already shows content
    });
  }

  
  const cats = $('.ci .cats');
  if (cats) {
    const inp = $('.ci .srch input'); let f = 'all';
    const apply = () => {
      const q = (inp.value || '').trim().toLowerCase(); let shown = 0;
      $$('.ci .cg .cc, .ci .al a').forEach(el => {
        const stat = el.classList.contains('st');
        const ok = stat ? (f === 'all' && !q) : (f === 'all' || el.dataset.ind === f) && (!q || el.dataset.q.includes(q));
        el.hidden = !ok; if (ok && el.closest('.cg')) shown++;
      });
      $('.ci .none').hidden = shown > 0;
    };
    cats.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f = b.dataset.f; $$('button', cats).forEach(x => x.setAttribute('aria-selected', x === b)); apply(); });
    inp.addEventListener('input', apply);
    const h = location.hash.slice(1); const b = h && $(`button[data-f="${h}"]`, cats); if (b) b.click();
  }

  
  const cp = $('.cs .cp');
  if (cp) cp.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); } catch (_) {} const s = $('span', cp); s.textContent = 'Copied'; setTimeout(() => s.textContent = 'Copy link', 1600); });

  
  if (D.scenes) {
    const P = R + 'assets/proto/'; const M = await AdmScene.manifest(P + 'manifest.json');
    const pick = (sc, nums) => { const key = M[sc + '@hero'] ? sc + '@hero' : sc; return (M[key] || []).length ? nums.map(n => M[key].find(e => e.file.split('/').pop().startsWith(String(n).padStart(2, '0')))).filter(Boolean) : []; };
    D.scenes.forEach((s, i) => {
      const el = $('#scn' + i); if (!el) return;
      const def = s.k === 'aidash' ? AdmScene.aidash(P) : AdmScene.auto(P, pick(s.k, s.nums), { w: 1200, h: 600, hold: 1.5, zoom: 1.2 });
      new AdmScene(el, def);
    });
  }
})();
