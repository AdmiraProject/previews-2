(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: transparent at scrollY 0, solid as soon as scrollY > 0 (bench: bg at 5px) */
  const hdr = $('.hdr');
  const onScroll = () => { hdr.classList.toggle('is-solid', scrollY > 0); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mega menu (desktop): hover/click/keyboard; Esc closes; dim backdrop */
  const dim = $('.dim');
  let openDD = null, ddTimer;
  const closeDD = () => { if (!openDD) return; openDD.btn.setAttribute('aria-expanded', 'false'); openDD.panel.classList.remove('is-on'); dim && dim.classList.remove('is-on'); hdr.classList.remove('is-open'); openDD = null; };
  const openPanel = (btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (openDD && openDD.panel === panel) return;
    closeDD();
    btn.setAttribute('aria-expanded', 'true'); panel.classList.add('is-on'); dim && dim.classList.add('is-on'); hdr.classList.add('is-open');
    openDD = { btn, panel, t: performance.now() };
  };
  $$('[data-dd]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    /* click toggles, but a click right after hover-open (<400ms) keeps it open (no open→close flicker) */
    btn.addEventListener('click', () => (openDD && openDD.btn === btn) ? (performance.now() - openDD.t > 400 && closeDD()) : openPanel(btn));
    /* open on real pointer movement only (mousemove), so scrolling under a resting cursor never opens it */
    btn.addEventListener('mousemove', () => { clearTimeout(ddTimer); openPanel(btn); });
    btn.addEventListener('mouseleave', () => { ddTimer = setTimeout(() => { if (!panel.matches(':hover')) closeDD(); }, 160); });
    panel.addEventListener('mouseenter', () => clearTimeout(ddTimer));
    panel.addEventListener('mouseleave', () => { ddTimer = setTimeout(closeDD, 160); });
  });
  $$('.nav__a:not([data-dd])').forEach(a => a.addEventListener('mouseenter', closeDD));
  dim && dim.addEventListener('click', closeDD);
  let ddY = 0; addEventListener('scroll', () => { if (openDD && Math.abs(scrollY - ddY) > 40) closeDD(); if (!openDD) ddY = scrollY; }, { passive: true });
  $$('.mega a').forEach(a => a.addEventListener('click', closeDD));

  /* Mobile drawer + accordions */
  const burger = $('.burger'), mnav = $('.mnav');
  const setDrawer = (on) => { mnav.classList.toggle('is-on', on); hdr.classList.toggle('is-open', on); burger.setAttribute('aria-expanded', on); document.body.style.overflow = on ? 'hidden' : ''; };
  burger && burger.addEventListener('click', () => setDrawer(!mnav.classList.contains('is-on')));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
  $$('.mnav__a[aria-controls]').forEach(b => b.addEventListener('click', () => {
    const p = document.getElementById(b.getAttribute('aria-controls')); const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', on); p.classList.toggle('is-on', on);
  }));

  /* Accordions (FAQ): aria-expanded + grid-rows height transition (300ms) */
  $$('.faq__q').forEach(b => b.addEventListener('click', () => {
    const p = document.getElementById(b.getAttribute('aria-controls')); const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', on); p.classList.toggle('is-on', on);
  }));

  /* Hero columns: 25 px/s (bench), CSS keyframes duration = half track height / 25 */


  /* Scroll coupling (bench: marquees speed up with scroll velocity, ~2.7x at 1.5px/ms, decay ~1s,
     and reverse direction while/after scrolling up; measured with research/tools/ss-dir.mjs) */
  const SC = { dir: 1, boost: 0 }; let lastY = scrollY, lastT = performance.now();
  addEventListener('scroll', () => { const t = performance.now(), dy = scrollY - lastY, dt = Math.max(8, t - lastT); if (dy) { SC.dir = dy > 0 ? 1 : -1; SC.boost = Math.min(2.6, Math.max(SC.boost, Math.abs(dy) / dt * 2.1)); } lastY = scrollY; lastT = t; }, { passive: true });
  let scT = performance.now(); const scLoop = t => { const dt = Math.min(64, t - scT) / 1000; scT = t; SC.boost *= Math.exp(-dt / .42); requestAnimationFrame(scLoop); }; requestAnimationFrame(scLoop);

  /* Hero columns: 25 px/s base (bench), col1/3 down, col2 up; JS-driven so scroll velocity/direction couple in */
  $$('.hcol__trk').forEach(t => {
    t.innerHTML += t.innerHTML; t.style.animation = 'none';
    const sign = t.parentElement.classList.contains('hcol--dn') ? 1 : -1; let pos = null, last = performance.now(), vis = true;
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(t.parentElement);
    const loop = now => {
      const dt = Math.min(64, now - last) / 1000; last = now;
      const horiz = getComputedStyle(t).display === 'flex'; const half = (horiz ? t.scrollWidth : t.scrollHeight) / 2;
      if (pos === null) pos = -half / 2;
      if (vis && !RM && half > 0) {
        pos += sign * SC.dir * 25 * (1 + SC.boost) * dt;
        if (pos > 0) pos -= half; if (pos < -half) pos += half;
        t.style.transform = horiz ? `translate3d(${pos}px,0,0)` : `translate3d(0,${pos}px,0)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  /* Marquees (logo rows 30 px/s, testimonial rows 30 px/s, hover slows to 30%) */
  $$('[data-mq]').forEach(m => {
    const trk = $('.mq__trk', m); const dir = m.dataset.dir === 'r' ? 1 : -1; const speed = +(m.dataset.speed || 30);
    trk.innerHTML += trk.innerHTML; $$('.mq__trk > *', m).slice(trk.children.length / 2).forEach(n => n.setAttribute('aria-hidden', 'true'));
    let x = 0, last = performance.now(), k = 1, kt = 1, vis = true;
    if (m.hasAttribute('data-slow')) { m.addEventListener('mouseenter', () => kt = .3); m.addEventListener('mouseleave', () => kt = 1); }
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(m);
    const loop = (t) => {
      const dt = Math.min(64, t - last) / 1000; last = t;
      if (vis && !RM) {
        k += (kt - k) * Math.min(1, dt * 6);
        const half = trk.scrollWidth / 2; x += dir * SC.dir * speed * k * (1 + SC.boost) * dt;
        if (x <= -half) x += half; if (x > 0) x -= half;
        trk.style.transform = `translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(loop);
    };
    if (dir > 0) x = -trk.scrollWidth / 4;
    requestAnimationFrame(loop);
  });

  /* Odometer counters (bench: NumberFlow digit roll on enter, ~900ms) */
  $$('[data-odo]').forEach(el => {
    const val = el.dataset.odo;
    el.innerHTML = [...val].map(ch => /\d/.test(ch)
      ? `<span class="odo__d"><span class="odo__c" data-to="${ch}">${'0123456789'.split('').map(d => `<span>${d}</span>`).join('')}</span></span>`
      : `<span>${ch}</span>`).join('');
    el.setAttribute('aria-label', val);
    /* NumberFlow-style: each digit column is as wide as its current digit (starts at "0") */
    const measure = () => $$('.odo__c', el).forEach(c => { [...c.children].forEach(s => { s.dataset.w = s.getBoundingClientRect().width.toFixed(1); }); const d = c.parentElement; d.style.width = c.children[c.style.transform ? +c.dataset.to : 0].dataset.w + 'px'; });
    measure(); document.fonts && document.fonts.ready.then(measure); addEventListener('resize', measure);
  });
  const odoIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.odo__c', e.target).forEach((c, i) => { const h = c.firstElementChild.getBoundingClientRect().height; const d = c.parentElement; c.style.transitionDelay = d.style.transitionDelay = (i * 60) + 'ms'; c.style.transform = `translateY(${-h * +c.dataset.to}px)`; d.style.width = c.children[+c.dataset.to].dataset.w + 'px'; });
    odoIO.unobserve(e.target);
  }), { threshold: .4 });
  $$('.nums').forEach(n => odoIO.observe(n));
  addEventListener('resize', () => $$('.odo__c').forEach(c => { if (c.style.transform) { const h = c.firstElementChild.getBoundingClientRect().height; c.style.transform = `translateY(${-h * +c.dataset.to}px)`; } }));

  /* Lazy video autoplay when visible (muted loops) */
  const vIO = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!RM) v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  $$('video[data-auto]').forEach(v => vIO.observe(v));

  /* Story cards custom cursor (bench: lg:cursor-none + follower) */
  const cur = $('.cursor');
  if (cur && matchMedia('(hover:hover)').matches) {
    $$('.story').forEach(s => {
      s.addEventListener('mousemove', e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
      s.addEventListener('mouseenter', e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; cur.classList.add('is-on'); });
      s.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    });
  }

  /* Modals: forms + video; focus trap, Esc, return focus */
  let lastFocus = null;
  const openModal = (id) => {
    const m = document.getElementById(id); if (!m) return;
    lastFocus = document.activeElement; m.classList.add('is-on'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    const v = $('video', m); if (v) { v.currentTime = 0; v.muted = false; v.play().catch(() => {}); }
    setTimeout(() => { const f = $('input,select,textarea,button:not(.modal__x)', m) || $('.modal__x', m); f && f.focus(); }, 60);
  };
  const closeModal = (m) => { m.classList.remove('is-on'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; const v = $('video', m); v && v.pause(); lastFocus && lastFocus.focus(); };
  $$('[data-open]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const sel = b.dataset.pick; if (sel) { const s = $(`#${b.dataset.open} select[data-pick]`); if (s) s.value = sel; } openModal(b.dataset.open); }));
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('.modal__x')) closeModal(m); });
    m.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal(m);
      if (e.key === 'Tab') { const f = $$('a,button,input,select,textarea,video[controls]', m).filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeDD(); mnav && mnav.classList.contains('is-on') && setDrawer(false); } });

  /* Forms: client validation + success state (front-end only) */
  $$('form[data-lead]').forEach(f => {
    f.setAttribute('novalidate', '');
    f.addEventListener('submit', e => {
      e.preventDefault(); let ok = true;
      $$('[required]', f).forEach(i => {
        const wrap = i.closest('.fld') || i.closest('.chk');
        let good = i.type === 'checkbox' ? i.checked : i.value.trim() !== '';
        if (good && i.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim());
        if (good && i.type === 'tel') good = i.value.replace(/\D/g, '').length >= 10;
        wrap && wrap.classList.toggle('bad', !good); if (!good && ok) { i.focus(); ok = false; }
      });
      if (!ok) return;
      const box = f.closest('.frm'); box.classList.add('is-ok'); const okEl = $('.ok', box); okEl && okEl.setAttribute('tabindex', '-1'); okEl && okEl.focus();
    });
    $$('input,select,textarea', f).forEach(i => i.addEventListener('input', () => { const w = i.closest('.fld') || i.closest('.chk'); w && w.classList.remove('bad'); }));
  });

  /* Advantage video: play button = unmute + restart (bench: wistia player with play + sound) */
  $$('.vid').forEach(v => {
    const vid = $('video', v), play = $('.vid__play', v), snd = $('.vid__snd', v);
    const go = () => { vid.muted = false; vid.loop = false; vid.currentTime = 0; vid.play(); play.hidden = true; snd && snd.setAttribute('aria-pressed', 'true'); };
    play && play.addEventListener('click', go);
    snd && snd.addEventListener('click', () => { vid.muted = !vid.muted; snd.setAttribute('aria-pressed', String(!vid.muted)); if (!vid.muted) { vid.play(); play.hidden = true; } });
    vid && vid.addEventListener('ended', () => { vid.muted = true; vid.loop = true; vid.play(); play.hidden = false; });
  });

  /* Services stage: pills cascade in (80ms stagger), hot pill cycles, nodes pop (bench: looping video) */
  $$('.stage').forEach(st => {
    const pills = $$('.pill', st), nodes = $$('.node', st); let started = false;
    const run = () => {
      if (started) return; started = true;
      pills.forEach((p, i) => setTimeout(() => p.classList.add('on'), RM ? 0 : 120 + i * 80));
      nodes.forEach((n, i) => setTimeout(() => n.classList.add('on'), RM ? 0 : 900 + i * 220));
      if (RM) return;
      let h = 0; setInterval(() => { pills.forEach(p => p.classList.remove('hot')); pills[h % pills.length].classList.add('hot'); pills[(h + 5) % pills.length].classList.add('hot'); h++; }, 900);
    };
    new IntersectionObserver(e => { if (e[0].isIntersecting) run(); }, { threshold: .25 }).observe(st);
  });

  /* Bento: typing input loop + flow steps cycle (bench: animated product UI) */
  $$('[data-typer]').forEach(t => {
    const lines = JSON.parse(t.dataset.typer); const out = $('.typer__t', t); let li = 0, ci = 0, del = false;
    if (RM) { out.textContent = lines[0]; return; }
    const tick = () => {
      const s = lines[li];
      if (!del) { ci++; out.textContent = s.slice(0, ci); if (ci >= s.length) { del = true; return setTimeout(tick, 2200); } return setTimeout(tick, 38 + Math.random() * 40); }
      ci -= 2; out.textContent = s.slice(0, Math.max(0, ci)); if (ci <= 0) { del = false; li = (li + 1) % lines.length; return setTimeout(tick, 400); } setTimeout(tick, 18);
    };
    new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); setTimeout(tick, 400); } }).observe(t);
  });
  $$('.flow').forEach(fl => {
    const steps = $$('.flow__s', fl); if (RM) { steps.forEach(s => s.classList.add('done')); return; }
    const chk = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="6.5"/><path d="m5.2 8.2 1.9 1.9 3.8-4"/></svg>';
    const spn = '<svg class="spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>';
    let i = 0;
    const step = () => { steps.forEach((s, k) => { s.classList.toggle('done', k < i); const ic = $('i', s); ic.innerHTML = k < i ? chk : (k === i ? spn : ''); }); i = (i + 1) % (steps.length + 1); };
    step(); setInterval(step, 1300);
  });

  /* Footer accordions on mobile (bench @390: Services / Navigation collapse) */
  $$('.ftr__col>h2').forEach(h => {
    h.setAttribute('tabindex', '0'); h.setAttribute('role', 'button'); h.setAttribute('aria-expanded', 'false');
    const t = () => { if (innerWidth >= 768) return; const c = h.parentElement; const on = !c.classList.contains('is-open'); c.classList.toggle('is-open', on); h.setAttribute('aria-expanded', on); };
    h.addEventListener('click', t); h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
  });

  /* Promo bar (bench: fixed bottom bar) — appears after leaving the hero, dismissible */
  const promo = $('.promo');
  if (promo) {
    let closed = false; try { closed = sessionStorage.getItem('promo-x') === '1'; } catch (e) {}
    const chk = () => { if (!closed) promo.classList.toggle('is-on', scrollY > 600); };
    addEventListener('scroll', chk, { passive: true });
    $('.promo__x', promo).addEventListener('click', () => { closed = true; promo.classList.remove('is-on'); try { sessionStorage.setItem('promo-x', '1'); } catch (e) {} });
  }
})();
