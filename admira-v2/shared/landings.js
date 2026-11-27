
(async function () {
  const A = 'https://admiraproject.github.io/previews-2/admira-v2/assets/', P = A + 'proto/', $ = (s) => document.querySelector(s), D = window.LND || {};
  AdmUI.faq(); AdmUI.header(); AdmUI.reveal();
  if (!$('#shw')) return; // heroes now play the home-3 film (data-film, pop.js); scene kept only as a fallback

  
  const M = await AdmScene.manifest(P + 'manifest.json');
  const pick = (sc, nums) => { const key = M[sc + '@hero'] ? sc + '@hero' : sc; return (M[key] || []).length ? nums.map(n => M[key].find(e => e.file.split('/').pop().startsWith(String(n).padStart(2, '0')))).filter(Boolean) : []; };
  const h = D.hero || {}; let def;
  if (h.t === 'people') def = AdmScene.people(P);
  else if (h.t === 'aidash') def = AdmScene.aidash(P);
  else if (h.t === 'fig') def = AdmScene.fig(h.k, A + 'fig2x/');
  else def = AdmScene.auto(P, pick(h.k, h.nums), { w: 1200, h: 600, hold: 1.5, ...(h.o || {}) });
  if ($('#shw')) new AdmScene($('#shw'), def);
})();
