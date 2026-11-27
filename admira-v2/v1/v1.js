(async function () {
  const P = 'https://admiraproject.github.io/previews-2/admira-v2/assets/proto/', $ = (s, r = document) => r.querySelector(s);
  const M = await AdmScene.manifest(P + 'manifest.json');

  const SZ = { '@hero': [1200, 600], '@panel': [1088, 570], '': [1440, 900] };
  const pickS = (sc, nums, size = '') => {
    const key = M[sc + size] ? sc + size : sc, [w, h] = SZ[M[sc + size] ? size : ''];
    return { es: nums.map(n => (M[key] || []).find(e => e.file.split('/').pop().startsWith(String(n).padStart(2, '0')))).filter(Boolean), w, h };
  };
  const autoS = (sc, nums, size, o) => { const { es, w, h } = pickS(sc, nums, size); return AdmScene.auto(P, es, { ...o, w, h }); };

  
  const ic = ADM.ICONS.map(k => `<img src="${ADM.L(k)}" alt="">`).join('');
  $('#icons').innerHTML = ic + ic;

  const MD = window.ADM_MEDIA || {}, phone = matchMedia('(max-width: 767px)');
  const TABS = [['Launch in chat', 'campaign-chat'], ['Optimize & report', 'optimize-report'], ['AI dashboards', 'ai-dashboard'], ['Journeys', 'individual-journey'], ['Ad canvas', 'creative-hub'], ['Workflows', 'workflows']].filter(([, k]) => MD[k]);
  const PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.2-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5Z"/></svg>';
  const EXP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
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
  const cap = (i, t, s) => `<div class="cap"><span class="ic"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${CAPI[i]}</svg></span><div><b>${t}</b><small>${s}</small></div></div>`;
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
  const FEATS = [
    ['Admira AI', 'Ask about your ads, CRM and revenue in plain words. Admira answers with your numbers and can launch the campaign for you.', 'ai', [6, 7, 8, 9, 10, 11, 12], { zoom: 1.25 },
      [['chat', 'Ask in plain words', 'Admira AI'], ['chart', 'Reports in seconds', 'Admira AI'], ['bolt', 'Launch campaigns', 'Admira AI'], ['plug', 'Connect in chat', 'Admira AI'], ['check', 'Approve changes', 'Admira AI'], ['layers', 'Sources on every answer', 'Admira AI']]],
    ['Dashboards and reports', 'Spend, leads, pipeline and revenue in one place, with ready-made reports for every channel and goal.', 'dash', [1, 2, 3, 5, 6, 7], { zoom: 1.3, pop: true },
      [['chart', 'Paid growth weekly', 'Dashboards'], ['money', 'Spend vs. leads', 'Dashboards'], ['layers', 'Leads by source', 'Dashboards'], ['spark', 'AI insights', 'Dashboards'], ['target', 'Pipeline goal', 'Dashboards'], ['flow', 'Drill into any number', 'Dashboards']]],
    ['Multi-touch attribution', 'Track every touch across the buyer journey, match anonymous activity to revenue, and see beyond first and last touch.', 'journey', [1, 2, 3], { zoom: 1.25 },
      [['flow', 'Winning journeys', 'Attribution'], ['layers', 'W-shaped model', 'Attribution'], ['pulse', 'Time decay', 'Attribution'], ['users', 'First and last touch', 'Attribution'], ['chart', 'Revenue by source', 'Attribution'], ['spark', 'Routes that sell', 'Attribution']]],
    ['Goals and forecasting', 'Define what a lead, an opportunity and a sale mean in your CRM, and see each goal against its monthly target.', 'goals', [1, 2, 3, 4], { zoom: 1.3 },
      [['target', 'Funnel goals', 'Goals'], ['check', 'Verify on real data', 'Goals'], ['chart', 'Monthly targets', 'Goals'], ['flow', 'CRM conditions', 'Goals'], ['pulse', 'Custom goals', 'Goals'], ['spark', 'Forecast pacing', 'Goals']]],
    ['Deals and pipeline', 'Every deal with its value, win probability and the touchpoints that brought it in.', 'deals', [1, 2, 3, 4, 5], { zoom: 1.3 },
      [['money', 'Open pipeline', 'Deals'], ['check', 'Won and lost', 'Deals'], ['flow', 'Deal timeline', 'Deals'], ['users', 'Associated contacts', 'Deals'], ['pulse', 'Win probability', 'Deals'], ['layers', 'Touchpoints per deal', 'Deals']]],
    ['People and journeys', 'Every person with every touch: the ad they clicked, the pages they read, the WhatsApp chat and the deal it became.', 'people', [], {},
      [['users', 'Every visitor', 'Journeys'], ['flow', 'Touches by channel', 'Journeys'], ['pulse', 'Event feed', 'Journeys'], ['layers', 'Journey timeline', 'Journeys'], ['target', 'First touch', 'Journeys'], ['chat', 'WhatsApp chats', 'Journeys']]],
    ['Tracking and events', 'One pixel and your CRM send every page view, form, WhatsApp chat and deal to a debugger you can read.', 'debugger', [1, 2, 3, 5, 6], { zoom: 1.3 },
      [['pulse', 'Event log', 'Tracking'], ['check', 'Event outcomes', 'Tracking'], ['layers', 'Business events', 'Tracking'], ['plug', 'Own system API', 'Tracking'], ['users', 'Identify calls', 'Tracking'], ['flow', 'UTM capture', 'Tracking']]],
    ['Connect your stack', 'Connect ad platforms, CRMs and Admira itself from one place, in a few clicks.', 'sources', [1, 2, 3, 4, 5, 6, 7, 8, 9], { zoom: 1.25 },
      [['plug', '32 sources', 'Integrations'], ['bolt', 'One-click connect', 'Integrations'], ['layers', 'Ad platforms', 'Integrations'], ['users', 'CRMs', 'Integrations'], ['chat', 'WhatsApp', 'Integrations'], ['check', 'Synced history', 'Integrations']]],
  ];
  const acc = $('#acc'), fscs = $('#fscs'), caps = $('#caps'), fsc = [];
  FEATS.forEach(([t, d, sc, nums, o, cp], i) => {
    acc.insertAdjacentHTML('beforeend', `<div class="it"><button>${t}</button><div class="b"><div><p>${d}</p></div></div><div class="bar"><i></i></div></div>`);
    const host = document.createElement('div'); host.innerHTML = '<div class="sc"></div>'; fscs.appendChild(host);
    const def = sc === 'people' ? AdmScene.people(P, '@panel') : autoS(sc, nums, '@panel', { ...o, hold: 1.4 });
    if (o.pop) { // the popover beat: card appears, cursor presses Keep changes, result card
      const k = def.w / 1440;
      def.overlay = `<div style="position:absolute;left:0;top:0;width:1440px;height:900px;transform:scale(${k});transform-origin:0 0;pointer-events:none">${POP}</div>`;
      def.steps.splice(2, 0, ['cam', def.w / 2, def.h / 2, 1, .6], ['ov', '.p1', true, .9], ['cur', 690 * k, 410 * k, .9], ['click'], ['ov', '.p1', false], ['ov', '.p2', true, 2.6], ['ov', '.p2', false, .3]);
    }
    fsc.push({ host, def, cp, sc: null });
    acc.lastElementChild.firstElementChild.addEventListener('click', () => open(i, true));
  });
  let fi = -1, ft;
  function open(i, user) {
    if (i === fi) return; fi = i; clearTimeout(ft);
    [...acc.children].forEach((el, k) => el.classList.toggle('on', k === i));
    fsc.forEach((f, k) => { f.host.classList.toggle('on', k === i); if (k !== i && f.sc) f.sc.stop(); });
    const f = fsc[i]; if (!f.sc) f.sc = new AdmScene(f.host.firstChild, f.def); else f.sc.restart();
    caps.innerHTML = f.cp.map(c => cap(...c)).join('');
    [...caps.children].forEach((c, k) => setTimeout(() => c.classList.add('on'), 250 + k * 120));
    const d = dur(f.def) + 800; acc.children[i].style.setProperty('--dur', d + 'ms');
    if (!user) ft = setTimeout(() => open((i + 1) % fsc.length), d);
  }
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { open(0); io.disconnect(); } }), { threshold: .3 }).observe(acc);

  
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
  $('#extr').innerHTML = EX.map(([s, c]) => s === 'bl'
    ? `<div class="c"><div class="th bl"><span class="t"><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/brand/admira-white.svg" style="width:auto;height:16px" alt="Admira"></span><h4>30+ integrations,<br>one source of truth</h4><img class="mini" src="${P}sources/05-apps-panel.webp" alt="" style="object-position:34% 42%"></div><p class="cap2">${c}</p></div>`
    : `<div class="c"><div class="th"><img src="${s}" alt="" loading="lazy"></div><p class="cap2">${c}</p></div>`).join('');
  let ex = 0; const tr = $('#extr'), maxEx = EX.length - 3;
  const mv = () => { tr.style.transform = `translateX(${-ex * 354}px)`; $('#exp').disabled = ex === 0; $('#exn').disabled = ex >= maxEx; };
  $('#exp').onclick = () => { ex = Math.max(0, ex - 1); mv(); }; $('#exn').onclick = () => { ex = Math.min(maxEx, ex + 1); mv(); };

  
  $('#ugc').outerHTML = AdmUGC('../');
  $('#faq').innerHTML = ADM.faqHtml();
  AdmUI.faq(); AdmUI.header(); AdmUI.videos(); AdmUI.ugc(); AdmUI.reveal();
})();
