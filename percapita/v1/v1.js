/* v1 — Apple-style interactions: hero phone rise, fade-up tiles, metal parallax, ⊕ overlays, local-nav section state. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = document.querySelector('.hero-phone .iphone');
  const metal = document.querySelector('.t-metal');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  function tick() {
    if (!reduce && phone) phone.style.setProperty('--py', `${-clamp(scrollY / 700) * 230}px`);
    if (metal) {
      const r = metal.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height));
      metal.style.setProperty('--ms', (1.16 - p * 0.16).toFixed(4));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.18 });
  document.querySelectorAll('.fade').forEach(el => io.observe(el));

  // ⊕ overlay
  const modal = document.querySelector('.modal'), body = modal.querySelector('.modal-body');
  const open = id => { const t = document.getElementById(id); if (!t) return; body.innerHTML = ''; body.appendChild(t.content.cloneNode(true)); modal.hidden = false; document.body.style.overflow = 'hidden'; modal.querySelector('.modal-x').focus(); };
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('.tile[data-modal]').forEach(t => t.addEventListener('click', () => open(t.dataset.modal)));
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.modal-x')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });

  // local nav active section
  const links = [...document.querySelectorAll('.lnav-links a:not(.lnav-cta)')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  addEventListener('scroll', () => {
    let k = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 120) k = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === k));
  }, { passive: true });
})();
