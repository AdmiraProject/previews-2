(async function () {
  const ROOT = new URL('../', document.currentScript ? document.currentScript.src : location.href).href; // site root, from this script's URL
  const P = 'https://admiraproject.github.io/previews-2/admira-v2/assets/proto/', $ = (s, r = document) => r.querySelector(s);
  const M = await AdmScene.manifest(P + 'manifest.json');

  const SZ = { '@hero': [1200, 600], '@panel': [1088, 570], '': [1440, 900] };
  const pickS = (sc, nums, size = '') => {
    const key = M[sc + size] ? sc + size : sc, [w, h] = SZ[M[sc + size] ? size : ''];
    return { es: nums.map(n => (M[key] || []).find(e => e.file.split('/').pop().startsWith(String(n).padStart(2, '0')))).filter(Boolean), w, h };
  };
  const autoS = (sc, nums, size, o) => { const { es, w, h } = pickS(sc, nums, size); return AdmScene.auto(P, es, { ...o, w, h }); };

  
  const BARE = ['microsoft', 'snapchat', 'pinterest', 'webflow']; // marquee shows bare marks, no grey tile
  const ic = ADM.ICONS.map(k => `<img src="${BARE.includes(k) ? ADM.L(k).replace('/logos/', '/logos/bare/') : ADM.L(k)}" alt="">`).join('');
  $('#icons').innerHTML = ic + ic;

  const MD = window.ADM_MEDIA || {}, phone = matchMedia('(max-width: 767px)');
  const TABS = [['Launch in chat', 'campaign-chat'], ['Optimize & report', 'optimize-report'], ['AI dashboards', 'ai-dashboard'], ['Journeys', 'individual-journey'], ['Ad canvas', 'creative-hub'], ['Workflows', 'workflows']].filter(([, k]) => MD[k]);
  const PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.2-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5Z"/></svg>';
  const EXP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5"/></svg>';
  const tabs = $('#tabs'), win = $('#win'); win.classList.add('hfilm');
  win.innerHTML = '<video muted playsinline preload="auto"></video><div class="tx-fc"><button type="button" class="tx-fp" aria-label="Pause" title="Pause or play">' + PAUSE + '</button><button type="button" class="tx-fx" aria-label="Open full video" title="Open full video">' + EXP + '</button></div>';
  const vid = win.querySelector('video'), pp = win.querySelector('.tx-fp'), fx = win.querySelector('.tx-fx');
  const btns = TABS.map(([name], i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.setAttribute('role', 'tab'); tabs.appendChild(b); b.addEventListener('click', () => show(i, true)); return b; });
  tabs.setAttribute('role', 'tablist');
  let cur = -1, user = false, inView = true;
  const src = (m) => phone.matches && m.mvideo ? [m.mvideo, m.mposter] : m.wvideo ? [m.wvideo, m.wposter] : [m.video, m.poster];
  function show(i, byUser) {
    if (byUser) user = true;
    if (i === cur) return; cur = i;
    btns.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    const m = MD[TABS[i][1]], [v, p] = src(m);
    vid.poster = p || ''; vid.src = v; vid.loop = user; vid.setAttribute('aria-label', m.title); fx.dataset.watch = TABS[i][1];
    if (inView) vid.play().catch(() => {});
  }
  vid.addEventListener('ended', () => { if (!user) show((cur + 1) % TABS.length); });
  const ico = () => { pp.innerHTML = vid.paused ? PLAY : PAUSE; };
  vid.addEventListener('play', ico); vid.addEventListener('pause', ico);
  pp.onclick = () => { user = true; vid.loop = true; vid.paused ? vid.play().catch(() => {}) : vid.pause(); };
  new IntersectionObserver((es) => es.forEach((e) => { inView = e.isIntersecting; inView ? vid.play().catch(() => {}) : vid.pause(); }), { threshold: 0.2 }).observe(win);
  show(0);

  const dur = d => d.steps.reduce((t, [v, ...a]) => t + (v === 'wait' ? a[0] * 1000 : v === 'cam' ? (a[3] ?? 1) * 1000 : v === 'cur' ? (a[2] ?? .8) * 1000 + 60 : v === 'show' ? (a[1] ?? .45) * 1000 : v === 'click' ? 320 : v === 'type' && a.length ? a[3].length * 45 : 0), 0);
  
  const CAPI = {
    chat: '<path d="M3 4.5A1.5 1.5 0 014.5 3h11A1.5 1.5 0 0117 4.5v8a1.5 1.5 0 01-1.5 1.5H8l-4 3v-3.5A1.5 1.5 0 013 12.5z"/>',
    chart: '<path d="M3 17h14M6 14V9M10 14V5M14 14v-3"/>', flow: '<path d="M3 5h5v4H3zM12 11h5v4h-5zM8 7h2a2 2 0 012 2v4"/>',
    target: '<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r=".5"/>', money: '<rect x="2.5" y="5" width="15" height="10" rx="1.5"/><circle cx="10" cy="10" r="2.2"/>',
    users: '<circle cx="7.5" cy="7" r="2.5"/><path d="M3 16c.5-2.5 2.3-4 4.5-4s4 1.5 4.5 4M13 4.8a2.5 2.5 0 010 4.4M14.5 12.3c1.3.6 2.2 1.9 2.5 3.7"/>',
    pulse: '<path d="M2.5 10h3l2-5 4 10 2-5h4"/>', plug: '<path d="M7 3v4M13 3v4M5 7h10v3a5 5 0 01-10 0zM10 15v3"/>',
    check: '<path d="M4 10.5l3.5 3.5L16 5.5"/>', bolt: '<path d="M11 2L4 11h5l-1 7 7-9h-5z"/>', layers: '<path d="M10 3l7 4-7 4-7-4zM3 11l7 4 7-4"/>', spark: '<path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.5 4.5l2.5 2.5M13 13l2.5 2.5M15.5 4.5L13 7M7 13l-2.5 2.5"/>',
  };
  const cap = (i, t, s) => `<div class="cap"><span class="ic">${i}</span><div><b>${t}</b><small>${s}</small></div></div>`;
  const POP = `<div class="pop p1" style="left:640px;top:250px;width:470px"><div class="who"><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/brand/admira-icon-gradient.svg" alt="">Admira AI</div>
      <p>Display – Remarketing spent $18.4K with no attributed deals in 30 days, so I paused it. Its <mark>$300 a day</mark> now goes to Search – Brand, which closes leads at $21.</p>
      <div class="tags"><span class="tag">Budget +$300/day</span><span class="tag w">1 campaign paused</span></div><div class="acts"><b>Keep changes</b><span>↺ Undo</span></div></div>
    <div class="pop p2" style="left:820px;top:120px;width:460px"><div class="who"><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/brand/admira-icon-gradient.svg" alt="">Admira AI <span class="live" style="margin-left:auto">Live</span></div>
      <p style="margin-bottom:8px">Budget moved. Weekly report sent to #marketing.</p>
      <table><tr><th>Campaign</th><th>Daily budget</th><th>Deals (30d)</th></tr>
      <tr><td><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/logos/googleads.svg" alt="">Search – Brand</td><td>$900</td><td>48</td></tr>
      <tr><td><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/logos/meta.svg" alt="">Lookalike 1%</td><td>$600</td><td>31</td></tr>
      <tr><td><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/logos/linkedin.svg" alt="">Directors</td><td>$250</td><td>12</td></tr>
      <tr><td><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/logos/googleads.svg" alt="">Display – Remarketing</td><td style="color:#B91C1C">Paused</td><td>0</td></tr></table></div>`;
  {
  
  const FEATS = [
    ['attribution', 'Revenue attribution', 'See which campaigns helped win a deal and how the credit changes with your attribution model.'],
    ['journeys', 'Customer journeys', 'Open a person’s Feed, then switch to Journey to see how their ad clicks and conversations led to a sale.'],
    ['overview', 'Paid performance', 'Put each channel’s spend next to the pipeline and revenue it generated in the same reporting period.'],
    ['goals', 'Goals and funnels', 'Define the stages that matter to your team and see where leads move forward or leave the funnel.'],
    ['deals', 'Leads and deals', 'Open a pipeline number to see the individual deals, owners, and marketing touches behind it.'],
    ['reports', 'Custom dashboards', 'Choose Ask Admira and describe the report you need. Switch between a line chart and a table, then save it to your dashboard.'],
    ['agents', 'Admira AI', 'Ask about a change in performance using the accounts, metrics, and business context in your workspace.'],
    ['automations', 'Automations', 'Set a routine for repeat work, from reviewing campaign performance to preparing a weekly update.'],
  ];
  const TILES = [["attribution", "Revenue attribution", "<svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><path d=\"m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5\"></path></svg>"], ["journeys", "Customer journeys", "<svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><circle cx=\"5\" cy=\"6\" r=\"2\"></circle><circle cx=\"19\" cy=\"18\" r=\"2\"></circle><path d=\"M7 6h7a4 4 0 0 1 0 8H9a2 2 0 0 0 0 4h8\"></path></svg>"], ["overview", "Paid growth dashboard", "<svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><path d=\"M3 4v16h18M8 15v-3m5 3V7m5 8v-5\"></path></svg>"], ["goals", "Goals and funnels", "<svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><path d=\"M3 4h18l-7 9v6l-4 2v-8Z\"></path></svg>"], ["deals", "Deal explorer", "<svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 7V4h8v3M3 12c5 4 13 4 18 0\"></path></svg>"], ["sources", "Connected sources", "<svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><path d=\"m13 5 6 6m-3-9-4 4m10 2-4 4M9 6l9 9-3 3a5 5 0 0 1-7-7l3-3m-4 9-5 5\"></path></svg>"]];
  const MED = window.ADM_MEDIA || {}, PH = matchMedia('(max-width: 767px)');
  const acc = $('#acc'), fscs = $('#fscs'), caps = $('#caps'), panel = fscs.parentElement, fsc = [];
  caps.innerHTML = TILES.map(([k, t, i]) => `<button type="button" class="cap on" data-watch="${k}"><span class="ic">${i}</span><span><b>${t}</b><small>Product tour</small></span></button>`).join('');
  const PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.86l10.4-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z"/></svg>';
  const EXP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5"/></svg>';
  FEATS.forEach(([k, t, d], i) => {
    const m = MED[k] || {};
    acc.insertAdjacentHTML('beforeend', `<div class="it"><button type="button" aria-expanded="false">${t}</button><div class="b"><div><p>${d}</p><div class="slot"></div></div></div><div class="bar"><i></i></div></div>`);
    const host = document.createElement('div');
    host.innerHTML = `<div class="sc tx-film ff"><video muted playsinline preload="none" poster="${m.poster || ''}" aria-label="${t}"></video><div class="tx-fc"><button type="button" class="tx-fp" aria-label="Pause ${t}" title="Pause or play">${PAUSE}</button><button type="button" data-watch="${k}" aria-label="Enlarge ${t}" title="Open full video">${EXP}</button></div></div>`;
    fscs.appendChild(host);
    const v = host.querySelector('video'), pb = host.querySelector('.tx-fp');
    const ico = () => { pb.innerHTML = v.paused ? PLAY : PAUSE; };
    v.addEventListener('play', ico); v.addEventListener('pause', ico);
    pb.onclick = () => { if (v.paused) { held = false; v.play().catch(() => {}); } else { held = true; v.pause(); } };
    v.addEventListener('ended', () => { if (fi === i && !held) open((i + 1) % FEATS.length); });
    v.addEventListener('timeupdate', () => { if (fi === i && v.duration) acc.children[i].style.setProperty('--p', (v.currentTime / v.duration).toFixed(4)); });
    fsc.push({ host, v, m });
    acc.lastElementChild.firstElementChild.addEventListener('click', () => { held = false; open(i); });
  });
  let fi = -1, held = false, inView = false;
  function place(i) { // phones: the film + tour tiles sit inside the open tab, like home-3's inline slot
    const slot = PH.matches ? acc.children[i].querySelector('.slot') : $('#product .grid');
    if (panel.parentElement !== slot) slot.appendChild(panel);
  }
  function open(i) {
    if (i === fi) return; fi = i;
    [...acc.children].forEach((el, k) => { el.classList.toggle('on', k === i); el.firstElementChild.setAttribute('aria-expanded', k === i); el.style.setProperty('--p', 0); });
    place(i);
    fsc.forEach((f, k) => { f.host.classList.toggle('on', k === i); if (k !== i) { f.v.pause(); } });
    const f = fsc[i];
    if (!f.v.src) f.v.src = f.m.video;
    try { f.v.currentTime = 0; } catch (e) {}
    if (inView && !held) f.v.play().catch(() => {});
  }
  PH.addEventListener('change', () => fi >= 0 && place(fi));
  new IntersectionObserver((es) => es.forEach(e => { inView = e.isIntersecting; if (fi < 0 && inView) { open(0); return; } const v = fi >= 0 && fsc[fi].v; if (!v) return; if (inView && !held) v.play().catch(() => {}); else v.pause(); }), { threshold: .25 }).observe($('#product'));
  }

  
  $('#chips').innerHTML = ADM.CHIPS.map(ADM.chipHtml).join('');

  
  if ($('#whsc')) new AdmScene($('#whsc'), autoS('debugger', [1, 2, 3, 4], '@panel', { zoom: 1.4, hold: 1.4 }));

  
  (function reels() {
    const box = $('#mcp'), L = box.querySelector('.reel.l .tk'), R = box.querySelector('.reel.r .tk'), core = box.querySelector('.core span'), dot = box.querySelector('.dot');
    const T = ADM.TASKS, O = ADM.TOOLS, N = 40;
    const row = (k, t, right) => `<div class="row"><span class="i"><img src="${ADM.ico(k)}" alt=""></span>${t}${right ? '<span class="ok"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 5.2l2 2 4-4.4"/></svg></span>' : ''}</div>`;
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

  
  const EX = [
    [P + 'ai/04-answer.webp', 'Ask Admira AI which channel sells at the lowest cost, and get the report.'],
    ['bl', 'Connect ad platforms, CRMs and WhatsApp in a few clicks, with 30+ native integrations.'],
    [P + 'dash/01-paid-growth.webp', 'Shareable dashboards for spend, leads and pipeline, delivered by link, Slack or email.'],
    [P + 'journey/01-report.webp', 'Customer journey reports that show the routes that sell the most.'],
    [P + 'deals/01-list.webp', 'Every deal with its touchpoints, value and win probability.'],
    [P + 'debugger/02-event.webp', 'An event debugger that shows exactly what your pixel and CRM sent.'],
  ];
  if ($('#extr')) {
  $('#extr').innerHTML = EX.map(([s, c]) => s === 'bl'
    ? `<div class="c"><div class="th bl"><span class="t"><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/brand/admira-white.svg" style="width:auto;height:16px" alt="Admira"></span><h4>30+ integrations,<br>one source of truth</h4><img class="mini" src="${P}sources/05-apps-panel.webp" alt="" style="object-position:34% 42%"></div><p class="cap2">${c}</p></div>`
    : `<div class="c"><div class="th"><img src="${s}" alt="" loading="lazy"></div><p class="cap2">${c}</p></div>`).join('');
  let ex = 0; const tr = $('#extr'), maxEx = EX.length - 3;
  const mv = () => { tr.style.transform = `translateX(${-ex * 354}px)`; $('#exp').disabled = ex === 0; $('#exn').disabled = ex >= maxEx; };
  $('#exp').onclick = () => { ex = Math.max(0, ex - 1); mv(); }; $('#exn').onclick = () => { ex = Math.min(maxEx, ex + 1); mv(); };
  }

  
  $('#ugc').outerHTML = AdmUGC(ROOT);
  $('#faq').innerHTML = ADM.faqHtml();
  AdmUI.faq(); AdmUI.header(); AdmUI.videos(); AdmUI.ugc(); AdmUI.reveal();
})();
