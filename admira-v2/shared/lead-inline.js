
(function () {
  const CAL = 'https://calendly.com/d/cmqk-k8w-3vs/admira-intro';
  const utm = () => { const q = new URLSearchParams(location.search), o = {}; ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { if (q.get(k)) o[k.replace(/_(.)/g, (_, c) => c.toUpperCase())] = q.get(k); }); return o; };
  const loadCal = () => window.Calendly ? Promise.resolve() : new Promise((res, rej) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  document.querySelectorAll('form[data-lead-inline]').forEach(f => {
    const card = f.parentElement, cal = card.querySelector('.li-cal'), err = f.querySelector('.alm-err'), cc = f.phone_modal_country;
    cc.addEventListener('change', () => { f.querySelector('.alm-fl').textContent = cc.selectedOptions[0].dataset.f; f.querySelector('.alm-dial').textContent = cc.value; });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const email = f['Email-Modal'].value.trim(), ok = [...f.querySelectorAll('[required]')].every(i => i.value.trim()) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      err.hidden = ok; if (!ok) return;
      const name = f['Name-Modal'].value.trim(), phone = cc.value + ' ' + f.phone_modal.value.trim();
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lead_form_submit', form: 'Book Demo', spend: f['Avg-spend'].value });
      f.hidden = true; cal.hidden = false; card.classList.add('cal'); cal.innerHTML = '<div class="alm-load">Loading calendar…</div>';
      try {
        await loadCal(); cal.innerHTML = '';
        Calendly.initInlineWidget({ url: CAL + '?hide_gdpr_banner=1&primary_color=124aff', parentElement: cal, prefill: { name, email, customAnswers: { a1: phone } }, utm: utm() });
      } catch (_) { cal.innerHTML = `<div class="alm-load">Couldn't load the calendar. <a href="${CAL}" target="_blank" rel="noopener">Open it in a new tab</a></div>`; }
    });
  });
})();
