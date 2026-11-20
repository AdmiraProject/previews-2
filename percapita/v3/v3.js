/* v3 — TR-style scroll behaviours: hero image ease-out, sticky media zoom + crossfade, lit pairs, reveal, smooth FAQ. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroImg = document.querySelector('.hero-img img');
  const medias = [...document.querySelectorAll('.sticky-media')];
  const xf = document.querySelector('.xfade');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  function tick() {
    const vh = innerHeight;
    if (heroImg && !reduce) {
      const p = clamp(scrollY / vh);
      heroImg.style.transform = `translateY(${p * 90}px) scale(${1 + p * 0.06})`;
    }
    medias.forEach(m => {
      const sec = m.closest('.split'), r = sec.getBoundingClientRect();
      const p = clamp((vh - r.top) / (r.height + vh));
      if (!reduce) m.style.setProperty('--s', (1.1 - p * 0.1).toFixed(4));
    });
    if (xf) {
      const r = xf.closest('.split').getBoundingClientRect();
      const p = clamp((vh * 0.35 - r.top) / (r.height * 0.45));
      xf.style.setProperty('--x', clamp((p - 0.35) / 0.3).toFixed(3));
    }
    document.querySelectorAll('.pairs li').forEach(li => {
      const r = li.getBoundingClientRect();
      li.classList.toggle('lit', r.top < vh * 0.72 && r.bottom > vh * 0.12);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // reveal
  document.querySelectorAll('.h2, .pairs li, .btn, .strip figure, .faq details, .support, .ftr-risk').forEach((el, i) => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv').forEach((el) => {
    const sib = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(sib, 5) * 70}ms`;
    io.observe(el);
  });

  // smooth details
  document.querySelectorAll('.faq details').forEach(d => {
    const s = d.querySelector('summary'), p = d.querySelector('p');
    s.addEventListener('click', e => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const h = p.offsetHeight;
        p.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0, paddingBottom: '0px' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => d.open = false;
      } else {
        d.open = true;
        const h = p.offsetHeight;
        p.animate([{ height: '0px', opacity: 0, paddingBottom: '0px' }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    });
  });
})();
