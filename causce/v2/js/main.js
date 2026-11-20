(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  const seenIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.setAttribute('data-seen', '');
        e.target.dispatchEvent(new CustomEvent('seen'));
        seenIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  $$('[data-observe]').forEach((el) => seenIO.observe(el));

  /* ---------- hero loop: play only on screen ---------- */
  const hv = $('.hero__video');
  if (hv) {
    if (reduce) { hv.removeAttribute('autoplay'); hv.pause(); }
    else {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) hv.play().catch(() => {}); else hv.pause();
      }, { threshold: 0.05 }).observe(hv);
    }
  }

  /* ---------- founder film (play with sound) ---------- */
  const vframe = $('#vframe'), vplay = $('#vplay'), founder = $('#founder');
  if (vplay && founder) {
    vplay.addEventListener('click', () => {
      founder.hidden = false;
      vframe.classList.add('is-playing');
      founder.muted = false;
      founder.play().catch(() => {});
      founder.focus({ preventScroll: true });
    });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !founder.paused) founder.pause(); }, { threshold: 0.1 }).observe(vframe);
  }

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), mmenu = $('#mmenu'), mclose = $('#mclose');
  const openMenu = () => {
    mmenu.hidden = false;
    requestAnimationFrame(() => mmenu.classList.add('is-open'));
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    mclose.focus();
  };
  const closeMenu = () => {
    mmenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!mmenu.classList.contains('is-open')) mmenu.hidden = true; }, 260);
  };
  burger && burger.addEventListener('click', openMenu);
  mclose && mclose.addEventListener('click', () => { closeMenu(); burger.focus(); });
  mmenu && mmenu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mmenu.classList.contains('is-open')) { closeMenu(); burger.focus(); } });
  matchMedia('(min-width: 64rem)').addEventListener('change', (m) => { if (m.matches) closeMenu(); });

  /* ---------- stats: gauge + count-up ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 144.5, CY = 144.6, R0 = 72, R1 = 144, N = 17, TH = 3.75; // 17 bars, 11.25° apart (Brightline geometry)
  const pt = (r, a) => [CX + r * Math.cos(a), CY - r * Math.sin(a)];
  const sectorPath = (deg) => {
    const a0 = Math.PI, a1 = Math.PI - (deg * Math.PI) / 180;
    const [x0, y0] = pt(R1, a0), [x1, y1] = pt(R1, a1), [x2, y2] = pt(R0, a1), [x3, y3] = pt(R0, a0);
    const big = deg > 180 ? 1 : 0;
    return `M${x0} ${y0} A${R1} ${R1} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${R0} ${R0} 0 ${big} 0 ${x3} ${y3} Z`;
  };
  $$('.gauge').forEach((svg) => {
    svg.setAttribute('viewBox', '-2 0 293 152');
    const sec = document.createElementNS(NS, 'path');
    sec.setAttribute('class', 'sector'); sec.setAttribute('d', sectorPath(0.001));
    svg.appendChild(sec);
    for (let i = 0; i < N; i++) {
      const a = Math.PI - (i * Math.PI) / (N - 1);
      const nx = -Math.sin(a), ny = -Math.cos(a); // perpendicular (svg y down)
      const [ax, ay] = pt(R0, a), [bx, by] = pt(R1, a);
      const ox = nx * TH, oy = ny * TH;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', 'bar' + (i === 0 ? ' on' : ''));
      p.setAttribute('d', `M${ax + ox} ${ay + oy}L${bx + ox} ${by + oy}L${bx - ox} ${by - oy}L${ax - ox} ${ay - oy}Z`);
      svg.appendChild(p);
    }
  });
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const runStat = (stat) => {
    if (stat.dataset.done) return; stat.dataset.done = '1';
    const to = +stat.dataset.to, v = $('.stat__v', stat), svg = $('.gauge', stat);
    const bars = $$('.bar', svg), sec = $('.sector', svg);
    if (reduce) { v.textContent = to.toLocaleString('es-MX'); bars.forEach((b) => b.classList.add('col')); sec.setAttribute('d', sectorPath(180)); return; }
    // phase 1: bars sweep to dark
    bars.forEach((b, i) => setTimeout(() => b.classList.add('on'), 30 + i * 28));
    // phase 2: colour fill + count-up
    const start = performance.now() + 520, dur = 1700;
    const tick = (now) => {
      const t = Math.max(0, Math.min(1, (now - start) / dur)), k = ease(t);
      v.textContent = Math.round(to * k).toLocaleString('es-MX');
      sec.setAttribute('d', sectorPath(Math.max(0.001, 180 * k)));
      const lim = k * (N - 1) + 0.0001;
      bars.forEach((b, i) => b.classList.toggle('col', i <= lim && k > 0));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statsSec = $('.stats');
  if (statsSec) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runStat(e.target); statIO.unobserve(e.target); } });
    }, { threshold: 0.45 });
    $$('.stat', statsSec).forEach((s) => statIO.observe(s));
    // mobile carousel dots
    const track = $('#statsTrack'), dots = $$('#statsDots button');
    dots.forEach((d, i) => d.addEventListener('click', () => track.scrollTo({ left: i * (track.clientWidth + 16), behavior: reduce ? 'auto' : 'smooth' })));
    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / (track.clientWidth + 16));
        dots.forEach((d, j) => d.setAttribute('aria-selected', String(i === j)));
        const s = $$('.stat', track)[i]; if (s) runStat(s);
      });
    }, { passive: true });
  }

  /* ---------- testimonial slider ---------- */
  const tTrack = $('#tTrack');
  if (tTrack) {
    const slides = $$('.slide', tTrack), vp = tTrack.parentElement;
    let i = 0;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      tTrack.style.transform = `translate3d(${-i * (vp.clientWidth + 16)}px,0,0)`;
      slides.forEach((s, j) => s.setAttribute('aria-hidden', String(j !== i)));
    };
    $('#tPrev').addEventListener('click', () => go(i - 1));
    $('#tNext').addEventListener('click', () => go(i + 1));
    addEventListener('resize', () => { tTrack.style.transition = 'none'; go(i); requestAnimationFrame(() => (tTrack.style.transition = '')); });
    // swipe / drag
    let x0 = null, dx = 0;
    vp.addEventListener('pointerdown', (e) => { x0 = e.clientX; dx = 0; tTrack.style.transition = 'none'; });
    vp.addEventListener('pointermove', (e) => {
      if (x0 === null) return; dx = e.clientX - x0;
      if (Math.abs(dx) > 4) tTrack.style.transform = `translate3d(${-i * (vp.clientWidth + 16) + dx}px,0,0)`;
    });
    const end = () => {
      if (x0 === null) return; tTrack.style.transition = '';
      if (dx < -50) go(i + 1); else if (dx > 50) go(i - 1); else go(i);
      x0 = null;
    };
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end); vp.addEventListener('pointerleave', end);
    vp.tabIndex = 0;
    vp.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    go(0);
  }

  /* ---------- FAQ expand / collapse all ---------- */
  const qas = $$('.qa');
  $('#faqOpen') && $('#faqOpen').addEventListener('click', () => qas.forEach((d) => (d.open = true)));
  $('#faqClose') && $('#faqClose').addEventListener('click', () => qas.forEach((d) => (d.open = false)));

  /* ---------- floating helper: typed bubble ---------- */
  const bubble = $('#hbubble'), htext = $('#htext');
  if (bubble && htext) {
    const txt = htext.dataset.text;
    if (store.get('causce-helper-closed')) bubble.classList.add('is-hidden');
    else if (reduce) htext.textContent = txt;
    else {
      let k = 0;
      setTimeout(function type() { htext.textContent = txt.slice(0, ++k); if (k < txt.length) setTimeout(type, 26); }, 1200);
    }
    $('#hclose').addEventListener('click', () => { bubble.classList.add('is-hidden'); store.set('causce-helper-closed', '1'); });
  }
})();
