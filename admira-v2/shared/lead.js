
(function () {
  const CAL = 'https://calendly.com/d/cmqk-k8w-3vs/admira-intro';
  const SPEND = ['$0 - $1,999 USD', '$2,000 - $4,999 USD', '$5,000 - $24,999 USD', '$25,000 - $99,999 USD', '$100,000 - $249,999 USD', '$250,000 - $499,999 USD', '$500,000+ USD'];
  const CC = [['🇲🇽', '+52'], ['🇺🇸', '+1'], ['🇨🇴', '+57'], ['🇨🇱', '+56'], ['🇵🇪', '+51'], ['🇦🇷', '+54'], ['🇪🇸', '+34'], ['🇧🇷', '+55']];
  const BASE = new URL('..', document.currentScript ? document.currentScript.src : location.href).href; // site root, works at any depth
  const ICON = `<img src="${BASE}assets/brand/admira-icon-gradient.svg" alt="" width="32" height="32">`;

  const el = document.createElement('dialog'); el.className = 'alm'; el.id = 'booking-dialog';
  el.setAttribute('aria-labelledby', 'alm-t'); el.setAttribute('aria-describedby', 'alm-s');
  el.innerHTML = `<div class="alm-box">
    <div class="alm-hd">${ICON}<div><h2 id="alm-t">Ready to try Admira?</h2><p id="alm-s">Meet with a product expert</p></div><button type="button" class="alm-x" data-x aria-label="Close booking"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>
    <form class="alm-f" id="wf-form-Modal-Form" name="wf-form-Modal-Form" data-name="Modal Form" novalidate>
      <div class="alm-fd"><label for="alm-n">Full name</label><input id="alm-n" name="Name-Modal" autocomplete="name" placeholder="Full name" required></div>
      <div class="alm-grp">
        <div class="alm-fd"><label for="alm-e">Business Email</label><input id="alm-e" name="Email-Modal" type="email" autocomplete="email" placeholder="Email" required></div>
        <div class="alm-fd"><label for="alm-p">Phone number</label><div class="alm-ph"><span class="alm-cc"><span class="alm-fl">${CC[0][0]}</span><i></i><select name="phone_modal_country" aria-label="Country code">${CC.map(([f, c]) => `<option value="${c}" data-f="${f}">${f} ${c}</option>`).join('')}</select></span><span class="alm-dial">${CC[0][1]}</span><input id="alm-p" name="phone_modal" type="tel" autocomplete="tel-national" placeholder="Phone number" required></div></div>
        <div class="alm-fd"><label for="alm-w">Website URL</label><input id="alm-w" name="Domain-Modal" placeholder="mywebsite.com" autocomplete="url" required></div>
        <div class="alm-fd"><label for="alm-s2">What is your Average Monthly Ad Spend?</label><select id="alm-s2" name="Avg-spend" required><option value="">Select an option</option>${SPEND.map(s => `<option>${s}</option>`).join('')}</select></div>
      </div>
      <p class="alm-err" hidden>Please fill in every field with a valid business email.</p>
      <input type="submit" class="alm-go" value="Continue">
    </form>
    <div class="alm-cal" hidden></div>
  </div>`;
  document.body.appendChild(el);


  const native = document.querySelector('#nh-form-holder .main-form-wrapper, .main-form-wrapper');
  if (native) { el.classList.add('native'); el.querySelector('.alm-f').replaceWith(native); el.querySelector('.alm-cal').remove(); }
  const f = native ? null : el.querySelector('form'), cal = el.querySelector('.alm-cal'), err = el.querySelector('.alm-err');
  const ccSel = f && f.phone_modal_country; if (ccSel) ccSel.addEventListener('change', () => { el.querySelector('.alm-fl').textContent = ccSel.selectedOptions[0].dataset.f; el.querySelector('.alm-dial').textContent = ccSel.value; });
  let last = null;
  const isOpen = () => el.open;
  const open = (pre) => {
    if (el.open) return; last = document.activeElement;
    if (f && pre && pre.site) f['Domain-Modal'].value = pre.site;
    el.showModal(); document.documentElement.classList.add('alm-lock');
    el.querySelector('.alm-x').focus({ preventScroll: true });
  };
  const close = () => { if (el.open) el.close(); };
  el.addEventListener('close', () => {
    document.documentElement.classList.remove('alm-lock'); el.scrollTop = 0;
    if (f) { cal.hidden = true; cal.innerHTML = ''; f.hidden = false; }
    last && last.isConnected && last.focus && last.focus({ preventScroll: true });
  });
  el.addEventListener('click', e => { if (e.target === el) close(); }); // click on backdrop
  el.querySelectorAll('[data-x]').forEach(b => b.addEventListener('click', close));
  const utm = () => { const q = new URLSearchParams(location.search), o = {}; ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { if (q.get(k)) o[k.replace(/_(.)/g, (_, c) => c.toUpperCase())] = q.get(k); }); return o; };
  const loadCal = () => window.Calendly ? Promise.resolve() : new Promise((res, rej) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  if (f) f.addEventListener('submit', async e => {
    e.preventDefault();
    const email = f['Email-Modal'].value.trim(), ok = [...f.querySelectorAll('[required]')].every(i => i.value.trim()) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    err.hidden = ok; if (!ok) return;
    const name = f['Name-Modal'].value.trim(), phone = ccSel.value + ' ' + f.phone_modal.value.trim();
    window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lead_form_submit', form: 'Modal Form', spend: f['Avg-spend'].value });
    f.hidden = true; cal.hidden = false; cal.innerHTML = '<div class="alm-load">Loading calendar…</div>';
    try {
      await loadCal(); cal.innerHTML = '';
      Calendly.initInlineWidget({ url: CAL + '?hide_gdpr_banner=1&primary_color=124aff', parentElement: cal, prefill: { name, email, customAnswers: { a1: phone } }, utm: utm() });
    } catch (_) { cal.innerHTML = `<div class="alm-load">Couldn't load the calendar. <a href="${CAL}" target="_blank" rel="noopener">Open it in a new tab</a></div>`; }
  });

  document.addEventListener('click', e => {
    const a = e.target.closest('a,button,.mcp .core,#mcp .core'); if (!a || el.contains(a)) return;
    if (a.matches('.core,[data-lead],[data-book-demo]') || /^(get started|book a demo|book a live demo|schedule your demo|talk to sales)\b/i.test(a.textContent.trim())) {
      if (a.type === 'submit' && a.form) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); open();
    }
  });

  document.querySelectorAll('.mcp .core,#mcp .core').forEach(c => { c.setAttribute('role', 'button'); c.tabIndex = 0; c.setAttribute('aria-label', 'Book a demo'); c.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); } }); });
  document.querySelectorAll('form.ask').forEach(fm => fm.addEventListener('submit', e => { e.preventDefault(); e.stopImmediatePropagation(); open(); }, true));
  window.AdmLead = { open, close, isOpen };
})();
