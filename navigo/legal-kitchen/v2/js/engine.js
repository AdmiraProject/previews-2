(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqMobile = matchMedia('(max-width: 767px)');

  const bar = $('.bar'), nav = $('.nav');
  $('.bar__x')?.addEventListener('click', () => { bar.classList.add('closed'); onScroll(); });
  function onScroll() {
    const bh = bar && !bar.classList.contains('closed') ? bar.offsetHeight : 0;
    nav.classList.toggle('fixed', scrollY >= bh);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mega menus */
  $$('.nav__item[data-mega]').forEach(it => {
    let t;
    const open = () => { clearTimeout(t); $$('.nav__item.open').forEach(o => o !== it && o.classList.remove('open')); it.classList.add('open'); };
    const close = () => { t = setTimeout(() => it.classList.remove('open'), 120); };
    it.addEventListener('mouseenter', open); it.addEventListener('mouseleave', close);
    it.querySelector('button')?.addEventListener('click', e => { e.stopPropagation(); it.classList.toggle('open'); });
    $$('.mega__cat', it).forEach((c, i) => c.addEventListener('mouseenter', () => {
      $$('.mega__cat', it).forEach(x => x.classList.toggle('on', x === c));
      $$('.mega__panel', it).forEach((p, j) => p.classList.toggle('on', j === i));
    }));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav__item')) $$('.nav__item.open').forEach(o => o.classList.remove('open')); });

  /* mobile menu */
  const burger = $('.nav__burger'), mnav = $('.mnav');
  burger?.addEventListener('click', () => { const on = mnav.classList.toggle('on'); burger.setAttribute('aria-expanded', on); document.body.style.overflow = on ? 'hidden' : ''; });
  $$('.mnav .mh').forEach(b => b.addEventListener('click', () => b.nextElementSibling.classList.toggle('on')));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => { mnav.classList.remove('on'); document.body.style.overflow = ''; }));

  $$('.pill button').forEach((b, i) => b.addEventListener('click', () => {
    $$('.pill button').forEach(x => x.classList.toggle('on', x === b));
    $$('.hero__mode').forEach((m, j) => m.classList.toggle('on', i === j));
  }));

  const car = $('.car');
  if (car) {
    const track = $('.car__track', car), clip = $('.car__clip', car);
    const base = $$('.hc', track);
    const N = base.length;
    for (let k = 0; k < 2; k++) base.forEach(c => track.appendChild(c.cloneNode(true)));
    base.slice().reverse().forEach(c => track.insertBefore(c.cloneNode(true), track.firstChild));
    const cards = $$('.hc', track);
    let idx = N * 1; // middle copy
    const side = $('.side'), vis = $$('.hero__visual .vis');
    const pitch = () => cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    function place(anim) {
      track.style.transition = anim ? '' : 'none';
      const w = cards[0].offsetWidth, cw = clip.offsetWidth;
      track.style.transform = `translateX(${Math.round(cw / 2 - (idx * pitch() + w / 2))}px)`;
      if (!anim) { track.offsetWidth; track.style.transition = ''; }
    }
    function render(anim = true) {
      cards.forEach((c, i) => c.classList.toggle('on', i === idx));
      const c = cards[idx];
      if (side) {
        $('.side__name', side).textContent = c.dataset.name;
        $('.side .ver span').innerHTML = c.dataset.ver;
        $('.side .role span').textContent = c.dataset.role;
        $('.side .role svg')?.replaceWith($('.role svg', c).cloneNode(true));
        $('.side .prev').textContent = c.dataset.prevl;
        $('.side .wm').textContent = c.dataset.wm;
        side.classList.remove('anim'); side.offsetWidth; side.classList.add('anim');
      }
      const v = +c.dataset.vis || 0;
      vis.forEach((el, j) => { el.classList.toggle('on', j === v); if (el.tagName === 'VIDEO') { if (j === v) { el.currentTime = 0; el.play().catch(() => {}); } else el.pause(); } });
      place(anim);
    }
    function go(d) {
      idx += d; render(true);
      if (idx >= N * 2 || idx < N) setTimeout(() => { idx = ((idx - N) % N + N) % N + N; cards.forEach((c, i) => c.classList.toggle('on', i === idx)); place(false); }, 520);
    }
    let timer;
    const loop = () => { clearInterval(timer); timer = setInterval(() => go(1), 5000); };
    $('.car__btn.next-b', car)?.addEventListener('click', () => { go(1); loop(); });
    $('.car__btn.prev-b', car)?.addEventListener('click', () => { go(-1); loop(); });
    cards.forEach((c, i) => c.addEventListener('click', () => { if (i !== idx) { go(i - idx); loop(); } }));
    render(false); loop();
    addEventListener('resize', () => place(false));
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : loop());
  }

  /* S2 logo strip — two sets crossfade, opacity 1s cubic-bezier(.4,0,1,1); captions fade in with 1s delay */
  const sets = $$('.strip__set');
  if (sets.length > 1) { let s = 0; setInterval(() => { sets[s].classList.add('off'); s = (s + 1) % sets.length; sets[s].classList.remove('off'); }, 4500); }

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } }), { threshold: 0.15 });
  $$('.collage, .steps').forEach(el => io.observe(el));
  $$('.steps').forEach(s => {
    $$('.st', s).forEach((st, n) => {
      $('.st__c', st).style.animationDelay = (0.3 + 0.87 * n).toFixed(2) + 's';
      $('.st__t', st).style.animationDelay = (0.45 + 0.87 * n).toFixed(2) + 's';
    });
    $$('.ln', s).forEach((l, n) => { l.style.animationDelay = n === 0 ? '0s' : (0.87 * n).toFixed(2) + 's'; });
  });

  function layLines() {
    $$('.srow').forEach(row => {
      const rr = row.getBoundingClientRect(), cs = $$('.st__c', row).map(c => c.getBoundingClientRect()), ls = $$('.ln', row);
      if (!cs.length || ls.length !== cs.length + 1) return;
      const seg = [[0, cs[0].left - rr.left - 16]];
      for (let i = 0; i < cs.length - 1; i++) seg.push([cs[i].right - rr.left, cs[i + 1].left - rr.left - 16]);
      seg.push([cs[cs.length - 1].right - rr.left, rr.width]);
      ls.forEach((l, i) => { l.style.left = seg[i][0] + 'px'; l.style.width = Math.max(0, seg[i][1] - seg[i][0]) + 'px'; });
    });
  }
  layLines(); addEventListener('resize', layLines);

  /* accordions: grid-template-rows .25s */
  $$('.acc__b, .ci__b').forEach(b => b.addEventListener('click', () => {
    const it = b.parentElement; const on = !it.classList.contains('open');
    if (it.classList.contains('acc__i')) $$('.acc__i', it.parentElement).forEach(x => x.classList.remove('open'));
    it.classList.toggle('open', on); b.setAttribute('aria-expanded', on);
  }));

  /* S8 tabs (color/bg/border .2s) with arrow scroll */
  $$('.tabs').forEach(tb => {
    const lis = $$('li', tb), panes = $$('.mpane', tb.parentElement);
    const ul = $('ul', tb); let off = 0;
    lis.forEach((li, i) => li.addEventListener('click', () => {
      lis.forEach(x => x.classList.toggle('on', x === li)); panes.forEach((p, j) => p.classList.toggle('on', i === j));
      const r = li.getBoundingClientRect(), tr = tb.getBoundingClientRect();
      if (r.right > tr.right - 88) shift(r.right - tr.right + 120); else if (r.left < tr.left + 88) shift(r.left - tr.left - 120);
    }));
    function shift(d) { const max = Math.max(0, ul.scrollWidth - tb.clientWidth); off = Math.min(max, Math.max(0, off + d)); ul.style.transform = `translateX(${-off}px)`; }
    $('.tabs__f.l button', tb)?.addEventListener('click', () => { const i = lis.findIndex(l => l.classList.contains('on')); lis[Math.max(0, i - 1)].click(); });
    $('.tabs__f.r button', tb)?.addEventListener('click', () => { const i = lis.findIndex(l => l.classList.contains('on')); lis[Math.min(lis.length - 1, i + 1)].click(); });
  });

  /* S9 panel tabs (bg .3s) */
  $$('.panel').forEach(p => {
    const tabs = $$('.ptab', p), panes = $$('.ppane', p);
    tabs.forEach((t, i) => t.addEventListener('click', () => { tabs.forEach(x => x.classList.toggle('on', x === t)); panes.forEach((x, j) => x.classList.toggle('on', i === j)); }));
  });

  /* S10 mobile dots */
  $$('.agcards').forEach(g => {
    const dots = $$('.dots i', g.parentElement);
    g.addEventListener('scroll', () => { const i = Math.round(g.scrollLeft / (g.scrollWidth / dots.length)); dots.forEach((d, j) => d.classList.toggle('on', i === j)); }, { passive: true });
  });

  /* below-the-fold looping videos play only while visible (weight + battery) */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  $$('video[data-lazyplay]').forEach(v => { v.muted = true; v.loop = true; vio.observe(v); });

  /* hover-play for card videos */
  $$('[data-hoverplay]').forEach(c => { const v = $('video', c); if (!v) return; c.addEventListener('mouseenter', () => v.play().catch(() => {})); c.addEventListener('mouseleave', () => v.pause()); });

  /* modals */
  const lead = $('#lead'), vm = $('#vmodal');
  function openLead(prefill) {
    if (!lead) return;
    const box = $('.mbox', lead); box.classList.remove('sent');
    if (prefill) Object.entries(prefill).forEach(([k, v]) => { const f = lead.querySelector(`[name="${k}"]`); if (f && v) { const o = [...(f.options || [])].find(o => o.value === v || o.text === v); f.value = o ? o.value : v; } });
    lead.classList.add('on'); document.body.style.overflow = 'hidden';
    setTimeout(() => lead.querySelector('input,select')?.focus(), 60);
  }
  function closeAll() { $$('.modal.on').forEach(m => m.classList.remove('on')); document.body.style.overflow = ''; const v = $('video', vm || document.createElement('i')); if (v) { v.pause(); } }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lead]');
    if (a) { e.preventDefault(); const p = {}; for (const k in a.dataset) if (k.startsWith('f')) p[k.slice(1).toLowerCase()] = a.dataset[k]; openLead(p); return; }
    const v = e.target.closest('[data-video]');
    if (v && vm) { e.preventDefault(); const vid = $('video', vm); vid.src = v.dataset.video; vid.muted = false; vm.classList.add('on'); document.body.style.overflow = 'hidden'; vid.currentTime = 0; vid.play().catch(() => {}); return; }
    if (e.target.closest('.mbox__x') || e.target.classList.contains('modal')) closeAll();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  /* form validation + success state (front-end only) */
  $$('form.lead').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('[required]', f).forEach(i => {
      const bad = i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)) || (i.type === 'tel' && i.value.replace(/\D/g, '').length < 10);
      (i.closest('.fld') || i.closest('.consent')).classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) { f.querySelector('.err input, .err select')?.focus(); return; }
    f.closest('.mbox').classList.add('sent');
  }));
})();
