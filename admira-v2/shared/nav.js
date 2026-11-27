/* Admira header: Product / Solutions / Resources mega-menus (1:1 with hyperfx.ai's Products / Platforms / Resources panels)
   + the mobile menu behind the burger. One script for every page; paths resolve from this file's location. */
(function () {
  const R = new URL('..', document.currentScript ? document.currentScript.src : location.href).href; // site root
  const hdr = document.querySelector('.hdr'); if (!hdr || hdr.dataset.nav) return; hdr.dataset.nav = '1';
  const ARR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  const P = (d) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    ai: `<img src="${R}assets/brand/admira-icon-gradient.svg" alt="">`,
    attr: P('<circle cx="10" cy="10" r="6.5"/><path d="M10 3.5V10l4.5 4.5"/>'),
    dash: P('<rect x="3.5" y="3.5" width="13" height="13" rx="2.5"/><path d="M7 13v-3M10 13V7M13 13V9"/>'),
    journey: P('<circle cx="5" cy="5.5" r="1.6"/><circle cx="15" cy="14.5" r="1.6"/><path d="M6.6 5.5h4.4a2.8 2.8 0 010 5.6H9a2.8 2.8 0 000 5.6h4.4"/>'),
    plug: P('<path d="M7.5 3.5v3M12.5 3.5v3M5.5 6.5h9v3a4.5 4.5 0 01-9 0v-3zM10 14v2.5"/>'),
    capi: P('<path d="M3.5 7h11l-3-3M16.5 13h-11l3 3"/>'),
    code: P('<rect x="3" y="4" width="14" height="12" rx="2.5"/><path d="M7.5 8.5L5.5 10l2 1.5M12.5 8.5l2 1.5-2 1.5"/>'),
    spark: P('<path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/>'),
    cart: P('<path d="M3 4h2l1.6 8h8.2L16.5 6.5H6"/><circle cx="8" cy="15.5" r="1"/><circle cx="14" cy="15.5" r="1"/>'),
    saas: P('<rect x="3" y="4.5" width="14" height="10" rx="2"/><path d="M7 17h6"/>'),
    lead: P('<path d="M4 16l3.5-5 3 3L16 6.5M12 6.5h4v4"/>'),
    agency: P('<circle cx="7" cy="7.5" r="2.5"/><circle cx="13.5" cy="8.5" r="2"/><path d="M3 15.5c.6-2.3 2.2-3.5 4-3.5s3.4 1.2 4 3.5M11.5 15.5c.4-1.7 1.4-2.6 2.5-2.6s2.1.9 2.5 2.6"/>'),
    home: P('<path d="M3.5 9L10 3.5 16.5 9v7.5h-13z"/><path d="M8 16.5v-4h4v4"/>'),
    star: P('<path d="M10 3.5l2 4.2 4.5.6-3.3 3.1.8 4.5L10 13.8l-4 2.1.8-4.5-3.3-3.1 4.5-.6z"/>'),
    play: P('<rect x="3" y="4.5" width="14" height="11" rx="2.5"/><path d="M8.5 8l3.5 2-3.5 2z"/>'),
    mail: P('<rect x="3" y="5" width="14" height="10" rx="2"/><path d="M3.5 6l6.5 5 6.5-5"/>'),
    cal: P('<rect x="3.5" y="4.5" width="13" height="12" rx="2"/><path d="M3.5 8.5h13M7 3v3M13 3v3"/>'),
    user: P('<circle cx="10" cy="7" r="3"/><path d="M4.5 16.5c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/>'),
    rss: P('<path d="M4.5 4.5a11 11 0 0111 11M4.5 9a6.5 6.5 0 016.5 6.5"/><circle cx="5" cy="15" r="1"/>'),
    help: P('<circle cx="10" cy="10" r="6.5"/><path d="M8 8.2a2 2 0 113 1.7c-.7.4-1 .8-1 1.6M10 13.6v.1"/>'),
  };
  const lg = (f) => `<img src="${R}assets/logos/${f}" alt="">`;
  const I = (s) => `${R}integrations/${s}/`, SO = (s) => `${R}solutions/${s}/`;
  // item: [icon, title, sub, href, lead?]
  const PRODUCT = [
    ['Product', [['ai', 'Admira AI', 'Ask your ads and CRM anything', `${R}v1/#ai`], ['attr', 'Attribution', 'Every touch, every model', `${R}multi-touch-attribution/`], ['dash', 'Dashboards', 'Reports built from a prompt', `${R}marketing-dashboard/`], ['journey', 'Journeys', 'From first click to sale', `${R}lead-tracking/`]]],
    ['Platform', [['plug', 'Integrations', 'Connect your tools', `${R}integrations/`], ['capi', 'Conversions API', 'Send real sales back', `${R}conversions-api/`], ['code', 'Admira pixel', 'Cookieless tracking', I('admira-pixel')], ['spark', 'AI creative', 'Ads made for you', `${R}ai-creative/`]]],
  ];
  const COMPANY = [['Ecommerce', SO('ecommerce')], ['B2B SaaS', SO('b2b-saas')], ['Marketing leaders', SO('marketing-leaders')], ['Agencies', SO('agencies')], ['Real estate', SO('real-estate')]];
  const CH1 = [['meta.svg', 'Meta Ads', 'meta-ads'], ['googleads.svg', 'Google Ads', 'google-ads'], ['tiktok.svg', 'TikTok Ads', 'tiktok-ads'], ['linkedin.svg', 'LinkedIn Ads', 'linkedin-ads'], ['openai.svg', 'OpenAI Ads', 'openai-ads']];
  const CH2 = [['whatsapp.svg', 'WhatsApp', 'whatsapp'], ['hubspot.svg', 'HubSpot', 'hubspot'], ['salesforce.svg', 'Salesforce', 'salesforce'], ['src/kommo-logo.webp', 'Kommo', 'kommo'], ['shopify.svg', 'Shopify', 'shopify']];
  const SOLI = [['cart', 'Ecommerce'], ['saas', 'B2B SaaS'], ['lead', 'Marketing leaders'], ['agency', 'Agencies'], ['home', 'Real estate']];
  const RES = [
    ['Help and support', [['star', 'Customers', 'Teams growing with Admira', `${R}customers/`], ['play', 'Webinars', 'Live sessions and replays', `${R}webinars/`], ['mail', 'Contact', 'Talk to sales or support', 'mailto:support@getadmira.com']]],
    ['Company', [['cal', 'Book a demo', 'See Admira in action', '#demo', 1], ['user', 'Log in', 'Open your workspace', 'https://app.getadmira.com']]],
    ['Learn', [['rss', 'Blog', 'Insights and best practices', `${R}blog/`], ['help', 'FAQ', 'Answers to common questions', `${R}v1/#faq`]]],
  ];
  const item = ([ic, t, s, h, lead]) => `<a class="mi" href="${h}"${lead ? ' data-lead' : ''}><span class="mt">${IC[ic]}</span><span><b>${t}</b><small>${s}</small></span></a>`;
  const col = ([lab, items]) => `<div class="mc"><p class="ml">${lab}</p>${items.map(item).join('')}</div>`;
  const panels = {
    product: `<div class="mp mp-prod">${PRODUCT.map(col).join('')}<div class="mc mc-co"><p class="ml">By company</p>${COMPANY.map(([t, h]) => `<a class="mco" href="${h}">${t}</a>`).join('')}</div>
      <a class="mpromo" href="#demo" data-lead><b>One AI platform for ads, attribution and ROI</b><span>Book a demo ${ARR}</span><i style="background-image:url(${R}assets/proto/ai@panel/04-answer.webp)"></i></a></div>`,
    solutions: `<div class="mp mp-sol"><div class="ms-l"><p class="ml">Platforms</p><div class="ms-g">${[...CH1, ...CH2].map(([f, t, s]) => `<a class="mch" href="${I(s)}"><span class="mt sm">${lg(f)}</span>${t}</a>`).join('')}</div></div>
      <div class="ms-r"><p class="ml">By company</p>${SOLI.map(([ic, t]) => `<a class="mch" href="${SO(COMPANY.find(c => c[0] === t)[1].split('/').slice(-2, -1)[0])}"><span class="mt sm">${IC[ic]}</span>${t}</a>`).join('')}</div>
      <div class="ms-f"><a href="${R}integrations/"><b>All integrations</b><small>22 live, more on the way ${ARR}</small></a><a href="#demo" data-lead><b>Book a demo</b><small>See Admira on your own data ${ARR}</small></a></div></div>`,
    resources: `<div class="mp mp-res">${RES.map(col).join('')}</div>`,
  };
  const keyOf = (t) => /^product|^platform/i.test(t) ? 'product' : /^solution/i.test(t) ? 'solutions' : /^resource/i.test(t) ? 'resources' : null;
  const wrap = document.createElement('div'); wrap.className = 'mm'; hdr.querySelector('.in').appendChild(wrap);
  let cur = null, tOpen = 0, tClose = 0;
  const triggers = [...hdr.querySelectorAll('.nav > a, .nav > button')].filter(b => keyOf(b.textContent.trim()));
  const open = (b) => {
    const k = keyOf(b.textContent.trim()); if (cur === b) return; cur = b;
    triggers.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-expanded', x === b); });
    wrap.innerHTML = panels[k]; wrap.classList.add('on');
  };
  const close = () => { cur = null; triggers.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-expanded', 'false'); }); wrap.classList.remove('on'); };
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  triggers.forEach(b => {
    b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', e => { e.preventDefault(); cur === b ? close() : open(b); });
    if (fine) { b.addEventListener('mouseenter', () => { clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(() => open(b), cur ? 0 : 90); }); }
  });
  if (fine) {
    hdr.addEventListener('mouseleave', () => { clearTimeout(tOpen); tClose = setTimeout(close, 160); });
    hdr.addEventListener('mouseenter', () => clearTimeout(tClose));
    hdr.querySelectorAll('.nav > a:not([aria-haspopup]), .logo, .r').forEach(el => el.addEventListener('mouseenter', () => { clearTimeout(tOpen); tClose = setTimeout(close, 120); }));
  }
  wrap.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', e => { if (cur && !hdr.contains(e.target)) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeM(); } });
  addEventListener('scroll', () => { hdr.classList.toggle('scrolled', scrollY > 40); }, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = hdr.querySelector('.burger');
  const m = document.createElement('div'); m.className = 'mnav'; m.setAttribute('aria-hidden', 'true');
  const acc = (t, body) => `<div class="mg"><button>${t}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6l4 4 4-4"/></svg></button><div class="mb"><div>${body}</div></div></div>`;
  const links = (arr) => arr.map(([ic, t, s, h, lead]) => `<a href="${h}"${lead ? ' data-lead' : ''}>${t}</a>`).join('');
  m.innerHTML = `<div class="mn-in">
    ${acc('Product', links([...PRODUCT[0][1], ...PRODUCT[1][1]]))}
    ${acc('Solutions', COMPANY.map(([t, h]) => `<a href="${h}">${t}</a>`).join('') + [...CH1, ...CH2].map(([, t, s]) => `<a href="${I(s)}">${t}</a>`).join(''))}
    <a class="ml1" href="${R}v1/#ai">Admira AI</a><a class="ml1" href="${R}integrations/">Integrations</a><a class="ml1" href="${R}customers/">Customers</a>
    ${acc('Resources', links(RES.flatMap(c => c[1])))}
    <div class="mn-b"><a class="btn lt" href="https://app.getadmira.com">Log in</a><a class="btn dk" href="#demo" data-lead>Book a demo</a></div></div>`;
  hdr.after(m);
  const openM = () => { m.style.top = Math.max(0, hdr.getBoundingClientRect().bottom) + 'px'; m.classList.add('on'); m.setAttribute('aria-hidden', 'false'); burger.classList.add('x'); document.documentElement.style.overflow = 'hidden'; };
  const closeM = () => { if (!m.classList.contains('on')) return; m.classList.remove('on'); m.setAttribute('aria-hidden', 'true'); burger && burger.classList.remove('x'); document.documentElement.style.overflow = ''; };
  if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.addEventListener('click', () => { const o = !m.classList.contains('on'); o ? openM() : closeM(); burger.setAttribute('aria-expanded', o); }); }
  m.querySelectorAll('.mg>button').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('o')));
  m.addEventListener('click', e => { if (e.target.closest('a')) closeM(); });
  addEventListener('resize', () => { if (innerWidth > 767) closeM(); });
  // On Webflow (/v2/ staging) pages live at /v2/<flat-slug>, while assets stay on the static host: map page links (paths ending in /)
  if (window.ADM_LINK) {
    // rewrite every static-host page link to its Webflow URL, including menus built later (hover panels, mobile menu, /es)
    const one = (a) => { const h = a.getAttribute('href'); if (h && h.indexOf(R) === 0 && /\/$/.test(h.split(/[#?]/)[0])) a.setAttribute('href', window.ADM_LINK(h)); };
    const fix = (root) => { if (root.nodeType !== 1) return; if (root.matches('a[href]')) one(root); root.querySelectorAll('a[href]').forEach(one); };
    fix(document.documentElement); document.addEventListener('DOMContentLoaded', () => fix(document.documentElement));
    new MutationObserver((ms) => ms.forEach((m) => { if (m.type === 'attributes') one(m.target); else m.addedNodes.forEach(fix); }))
      .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  }
})();
