
(async function () {
  const A = 'https://admiraproject.github.io/previews-2/admira-v2/assets/', P = A + 'proto/', $ = (s) => document.querySelector(s), D = window.SOL || {};
  AdmUI.faq(); AdmUI.header(); AdmUI.reveal();

  
  const M = await AdmScene.manifest(P + 'manifest.json');
  const pick = (sc, nums) => { const key = M[sc + '@hero'] ? sc + '@hero' : sc; return (M[key] || []).length ? nums.map(n => M[key].find(e => e.file.split('/').pop().startsWith(String(n).padStart(2, '0')))).filter(Boolean) : []; };
  const h = D.hero || {}; let def;
  if (h.t === 'people') def = AdmScene.people(P);
  else if (h.t === 'aidash') def = AdmScene.aidash(P);
  else if (h.t === 'fig') def = AdmScene.fig(h.k, A + 'fig2x/');
  else def = AdmScene.auto(P, pick(h.k, h.nums), { w: 1200, h: 600, hold: 1.5, ...(h.o || {}) });
  if ($('#shw')) new AdmScene($('#shw'), def);

  
  const box = $('#reel'); if (!box) return;
  const L = box.querySelector('.reel.l .tk'), R = box.querySelector('.reel.r .tk'), core = box.querySelector('.core span'), dot = box.querySelector('.dot');
  const ico = (k) => k === 'ad' ? A + 'brand/admira-icon-gradient.svg' : k === 'zoho' ? A + 'logos/zoho-crm-icon.png' : A + 'logos/' + k + '.svg';
  const T = D.tasks, O = D.tools, N = 40;
  const row = (k, t, right) => `<div class="row"><span class="i"><img src="${ico(k)}" alt=""></span>${t}${right ? '<span class="ok"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 5.2l2 2 4-4.4"/></svg></span>' : ''}</div>`;
  L.innerHTML = Array.from({ length: N }, (_, i) => row(...T[i % T.length])).join('');
  R.innerHTML = Array.from({ length: N }, (_, i) => row(...O[i % O.length], true)).join('');
  const H = 48, C = 248 - 24; let i = 4;
  const paint = (tk, idx) => [...tk.children].forEach((r, k) => { const d = Math.abs(k - idx); r.style.opacity = Math.max(0.12, 1 - d * .2).toFixed(2); r.style.transform = tk === L ? `translateX(${-d * d * 6}px)` : `translateX(${d * d * 4}px)`; r.style.fontWeight = d ? 400 : 500; });
  const set = () => { L.style.transform = `translateY(${C - i * H}px)`; R.style.transform = `translateY(${C - (i + 1) * H}px)`; paint(L, i); paint(R, i + 1); };
  set(); let t;
  const step = () => {
    [...R.children].forEach(r => r.classList.remove('hit'));
    dot.classList.remove('go'); void dot.offsetWidth; dot.classList.add('go');
    setTimeout(() => core.textContent = 'Thinking…', 900);
    setTimeout(() => { R.children[i + 1].classList.add('hit'); }, 2100);
    setTimeout(() => { core.textContent = 'Admira'; }, 2700);
    setTimeout(() => { [...R.children].forEach(r => r.classList.remove('hit')); i = (i + 1) % (N - 6); if (i < 4) i = 4; set(); }, 3300);
  };
  new IntersectionObserver(es => es.forEach(e => { clearInterval(t); if (e.isIntersecting) { step(); t = setInterval(step, 3900); } }), { threshold: .3 }).observe(box);
})();
