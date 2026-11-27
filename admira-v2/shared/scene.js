
if (/[?&]shot/.test(location.search)) document.documentElement.classList.add("shot");
(function () {
  const CUR = '<svg class="cur" viewBox="0 0 22 22"><path d="M5 2.5v15.2l3.9-3.7 2.6 6 2.7-1.2-2.6-5.9 5.4-.4z" fill="#15191D" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const sleep = (ms, tok) => new Promise(r => { const t = setTimeout(r, ms); tok && tok.timers.push(t); });

  class Scene {
    constructor(el, def) {
      this.el = el; this.def = def; this.W = def.w || 1440; this.H = def.h || 900;
      el.classList.add('scn');
      el.innerHTML = `<div class="cam">${def.states.map((s, i) => `<img class="st${i ? '' : ' on'}" src="${s}" alt="" decoding="async" ${i ? 'loading="lazy"' : ''}>`).join('')}<div class="ring"></div><div class="typ"></div><div class="rip"></div>${def.overlay || ''}</div>${def.cursor === false ? '' : CUR}`;
      this.cam = el.querySelector('.cam'); this.imgs = [...el.querySelectorAll('.st')];

      Object.entries(def.tall || {}).forEach(([i, h]) => Object.assign(this.imgs[i].style, { height: h + 'px', objectFit: 'fill', willChange: 'transform' }));
      this.cur = el.querySelector('.cur'); this.ring = el.querySelector('.ring'); this.typ = el.querySelector('.typ'); this.rip = el.querySelector('.rip');
      this.cx = this.W * .72; this.cy = this.H * .8; this.cs = 1; this.camx = this.W / 2; this.camy = this.H / 2;
      this.running = false; this.tok = null;
      new ResizeObserver(() => this.layout()).observe(el);
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? this.play() : this.stop()), { threshold: .25 }).observe(el);
      this.layout();
    }
    get k() { return Math.max(this.el.clientWidth / this.W, this.el.clientHeight / this.H); }
    layout() {
      this.cam.style.width = this.W + 'px'; this.cam.style.height = this.H + 'px';
      this.applyCam(0); this.placeCur(0);
    }
    applyCam(d) {
      const k = this.k, s = this.cs;

      let tx = this.W / 2 - this.camx * s, ty = this.H / 2 - this.camy * s;
      tx = Math.min(0, Math.max(this.W - this.W * s, tx)); ty = Math.min(0, Math.max(this.H - this.H * s, ty));
      this.cam.style.transition = d ? `transform ${d}s cubic-bezier(.65,0,.35,1)` : 'none';
      this.cam.style.transform = `scale(${k}) translate(${tx}px,${ty}px) scale(${s})`;
      this._tx = tx; this._ty = ty;
      if (this.cur) this.placeCur(d, 'cubic-bezier(.65,0,.35,1)');
    }
    toScreen(x, y) { const k = this.k; return [(this._tx + x * this.cs) * k, (this._ty + y * this.cs) * k]; }
    placeCur(d, ease = 'cubic-bezier(.4,0,.2,1)') {
      if (!this.cur) return; const [x, y] = this.toScreen(this.cx, this.cy);
      this.cur.style.transition = d ? `transform ${d}s ${ease}` : 'none';
      this.cur.style.transform = `translate(${x - 4}px,${y - 2}px)`;
    }
    reset() {
      this.imgs.forEach((im, i) => { im.classList.toggle('on', i === 0); if (im.style.transform) { im.style.transition = 'none'; im.style.transform = ''; } });
      this.el.querySelectorAll('.pop').forEach(o => o.classList.remove('on'));
      this.ring.classList.remove('on'); this.typ.style.display = 'none';
      this.cs = 1; this.camx = this.W / 2; this.camy = this.H / 2; this.applyCam(0);
      if (!this.looped) { const c = this.def.start || [this.W * .72, this.H * .8]; this.cx = c[0]; this.cy = c[1]; } this.placeCur(0);  // on loop the cursor continues from where it ended
    }
    async run(tok) {
      for (const [si, st] of this.def.steps.entries()) {
        if (tok.dead) return; const [v, ...a] = st; this.el.dataset.step = si;
        if (v === 'show') { this.imgs.forEach((im, i) => im.classList.toggle('on', i === a[0])); await sleep((a[1] ?? .45) * 1000, tok); }
        else if (v === 'cur') { this.cx = a[0]; this.cy = a[1]; this.placeCur(a[2] ?? .8); await sleep((a[2] ?? .8) * 1000 + 60, tok); }
        else if (v === 'click') { const [x, y] = [this.cx, this.cy]; Object.assign(this.rip.style, { left: x + 'px', top: y + 'px' }); this.rip.classList.remove('go'); void this.rip.offsetWidth; this.rip.classList.add('go'); if (this.cur) { const a = this.cur.querySelector('path'); a.style.transformBox = 'view-box'; a.style.transformOrigin = '5px 2.5px'; a.animate([{ transform: 'scale(1)' }, { transform: 'scale(.84)' }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' }); } await sleep(320, tok); }
        else if (v === 'cam') { this.camx = a[0]; this.camy = a[1]; this.cs = a[2]; this.applyCam(a[3] ?? 1); await sleep((a[3] ?? 1) * 1000, tok); }
        else if (v === 'ring') { continue; if (!a.length) this.ring.classList.remove('on'); else { Object.assign(this.ring.style, { left: a[0] - 4 + 'px', top: a[1] - 4 + 'px', width: a[2] + 8 + 'px', height: a[3] + 8 + 'px' }); this.ring.classList.add('on'); } }
        else if (v === 'type') {
          if (!a.length) { this.typ.style.display = 'none'; continue; }
          const [x, y, w, t, fs, h] = a; Object.assign(this.typ.style, { display: 'block', left: x + 'px', top: y + 'px', width: w + 'px', height: (h || 24) + 'px', fontSize: (fs || 14) + 'px', lineHeight: '24px' }); this.typ.textContent = '';
          for (const ch of t) { if (tok.dead) return; this.typ.textContent += ch; await sleep(ch === ' ' ? 55 : 38, tok); }
        }
        else if (v === 'pan') { const im = this.imgs[a[0]]; im.style.transition = `transform ${a[2] ?? 2}s cubic-bezier(.45,.05,.25,1), opacity .45s ease`; im.style.transform = `translateY(${-a[1]}px)`; await sleep((a[2] ?? 2) * 1000, tok); }
        else if (v === 'ov') { this.el.querySelectorAll(a[0]).forEach(o => o.classList.toggle('on', a[1] !== false)); await sleep((a[2] ?? 0) * 1000, tok); }
        else if (v === 'wait') await sleep(a[0] * 1000, tok);
        else if (v === 'fn') a[0](this);
      }
    }
    async play() {
      if (this.running) return; this.running = true;
      const tok = this.tok = { dead: false, timers: [] };
      if (!this.ready) { this.imgs.forEach(im => { im.loading = 'eager'; }); await Promise.all(this.imgs.map(im => im.decode().catch(() => {}))); this.ready = true; }
      while (!tok.dead) { this.reset(); this.looped = true; await sleep(this.looped ? 250 : 150, tok); await this.run(tok); await sleep(900, tok); if (this.def.once) break; }
    }
    stop() { if (!this.tok) return; this.tok.dead = true; this.tok.timers.forEach(clearTimeout); this.running = false; }
    restart() { this.stop(); this.play(); }
  }
  window.AdmScene = Scene;

  
  let MAN = null;

  const viaScript = (url) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = url.replace(/\.json$/, '.js'); s.onload = () => res(window.ADM_MANIFEST); s.onerror = rej; document.head.appendChild(s); });
  Scene.manifest = async (url) => (MAN = MAN || window.ADM_MANIFEST || await fetch(url).then(r => r.json()).catch(() => viaScript(url)));
  Scene.auto = (base, entries, o = {}) => {
    const states = entries.map(e => base + e.file), steps = [];
    const W = o.w || 1440, H = o.h || 900, zoom = o.zoom ?? 1.35;
    entries.forEach((e, i) => {
      const f = (e.focus || [])[o.focusIdx?.[i] ?? 0];
      if (i === 0 && o.typeAt && o.typeAt[0]) steps.push(['wait', .25]);
      else if (f && zoom > 1 && !(o.noZoom || []).includes(i)) {
        steps.push(['cam', f.x + f.w / 2, f.y + f.h / 2, Math.min(zoom, W / Math.max(f.w + 160, 400)), 1.2], ['wait', o.hold ?? 1.3], ['cam', W / 2, H / 2, 1, 1]);
      } else steps.push(['wait', o.hold ?? 1.3]);
      if (i < entries.length - 1) {
        const c = e.clickTo;
        if (c) {
          if (o.typeAt && o.typeAt[i]) { const t = o.typeAt[i]; steps.push(['cur', c.x + 24, c.y + 12, .9], ['wait', .2], ['click'], ['type', c.x - 2, c.y - 1, c.w - 70, t, 14, c.h + 2]); steps.push(['wait', .3]); }
          else steps.push(['cur', c.x + c.w / 2, c.y + c.h / 2, .9], ['wait', .2], ['click']);
        } else steps.push(['wait', .2]);
        steps.push(['show', i + 1, .5]);
        if (c && o.typeAt && o.typeAt[i]) steps.push(['type']);
      }
    });
    steps.push(['wait', o.tail ?? 1.2]);
    return { states, steps, w: W, h: H, start: o.start };
  };

  
  window.AdmUI = {
    reveal() {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.rv').forEach(el => io.observe(el));
    },
    faq() { document.querySelectorAll('.faq .q>button,.faq2 .q>button').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('o'))); },
    header() { const h = document.querySelector('.hdr'); addEventListener('scroll', () => h && h.classList.toggle('scrolled', scrollY > 40), { passive: true }); },
    videos() { // autoplay muted loops only while on screen
      const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
      document.querySelectorAll('video[data-auto]').forEach(v => { v.muted = true; v.playsInline = true; io.observe(v); });
    },
    ugc() { // overlays appear in sequence while a card is visible
      document.querySelectorAll('.ugc .card').forEach(card => {
        const ovs = [...card.querySelectorAll('.ov')]; if (!ovs.length) return; let t = [];
        new IntersectionObserver(es => es.forEach(e => {
          t.forEach(clearTimeout); t = [];
          if (e.isIntersecting) { const loop = () => { ovs.forEach(o => o.classList.remove('on')); ovs.forEach((o, i) => t.push(setTimeout(() => o.classList.add('on'), 900 + i * 1300))); t.push(setTimeout(loop, 900 + ovs.length * 1300 + 4200)); }; loop(); }
          else ovs.forEach(o => o.classList.remove('on'));
        }), { threshold: .3 }).observe(card);
      });
    },
  };
})();


AdmScene.people = (P, size = '@hero') => {
  const W = size === '@panel' ? 1088 : 1200, H = size === '@panel' ? 570 : 600, d = `person${size}/`;
  const feedMax = 1754 - H, jMax = 908 - H;
  return {
    w: W, h: H, start: [W * .7, H * .85],
    states: ['01-users', '02b-feed-tall', '05b-journey-tall', '05-journey-right'].map(f => P + d + f + '.webp'),
    tall: { 1: 1754, 2: 908 },
    steps: [
      ['wait', .7], ['cam', W / 2, 260, 1.1, 1], ['cur', 360, 240, .9], ['wait', .35], ['click'],
      ['cam', W / 2, H / 2, 1, .5], ['show', 1, .5], ['cur', W * .62, H * .62, .8], ['wait', .7],
      ['pan', 1, Math.round(feedMax * .45), 2.6], ['wait', .7], ['pan', 1, feedMax, 2.6], ['wait', 1], ['pan', 1, 0, 1.5],
      ['cur', 351, 117, .8], ['click'], ['show', 2, .5], ['wait', .9],
      ['pan', 2, jMax, 2.2], ['wait', 1.1], ['pan', 2, 0, 1.2],
      ['show', 3, .7], ['cam', W * .7, H * .62, 1.3, 1.2], ['cur', W * .72, H * .6, .9], ['wait', 2], ['cam', W / 2, H / 2, 1, 1], ['wait', .6],
    ],
  };
};


AdmScene.fig = (key, base = '../assets/fig2x/') => {
  const S = (d, a) => a.map(n => `${base}${d}/${n}.webp`);
  const F = {
    launch: { states: S('launch', ['launch-selected', 'launch', 'launch-optimize-for', 'launch-audience', 'launch-budget', 'launch-destination-url', 'launch-loading', 'launch-success', 'launch-live-hover', 'launch-iterate-winner', 'launch-iterate-winner-created']),
      start: [820, 720], steps: [
        ['wait', .5], ['cur', 531, 321, 1.1], ['wait', .25], ['click'], ['show', 1, .35], ['wait', .3],
        ['cam', 1200, 420, 1.3, 1.1], ['cur', 1356, 414, 1], ['wait', .25], ['click'], ['show', 2, .3], ['wait', .35],
        ['cur', 1254, 582, .9], ['wait', .25], ['click'], ['show', 1, .3], ['wait', .3],
        ['cur', 1356, 462, .9], ['wait', .25], ['click'], ['show', 3, .3], ['wait', .35],
        ['cur', 1260, 510, .8], ['wait', .25], ['click'], ['show', 4, .3], ['wait', .4],
        ['cur', 1305, 558, .8], ['wait', .25], ['click'], ['show', 5, .3], ['wait', .35],
        ['cur', 1359, 678, .9], ['wait', .25], ['click'], ['wait', .2],
        ['cur', 1206, 627, .9], ['wait', .25], ['click'], ['show', 6, .3], ['wait', .8], ['show', 7, .4], ['wait', 1.2],
        ['cur', 1212, 384, 1.1], ['wait', .25], ['click'], ['cam', 720, 435, 1, 1.1], ['show', 8, .35], ['wait', .3],
        ['cur', 480, 525, 1.2], ['wait', 1.2], ['show', 9, .35], ['wait', .3],
        ['cur', 651, 321, 1], ['wait', .25], ['click'], ['show', 10, .35], ['wait', 1.6]] },
    creative: { states: S('creative', ['canvas-empty', 'canvas-add-right-click', 'image-generation', 'image-generation-selected', 'image-generation-set', 'canvas-default', 'canvas-selected']),
      start: [980, 720], steps: [
        ['wait', .5], ['cur', 690, 495, 1.1], ['wait', .25], ['click'], ['show', 1, .3], ['wait', .3],
        ['cur', 789, 558, .8], ['wait', .25], ['click'], ['show', 2, .35], ['wait', .35],
        ['cur', 750, 375, .9], ['wait', .25], ['click'], ['show', 3, .3], ['wait', .3],
        ['cam', 1100, 330, 1.3, 1.1], ['cur', 1060, 162, 1], ['wait', .25], ['click'],
        ['type', 1038, 150, 360, 'Ad for Admira: One brain runs every channel', 13, 26],
        ['cur', 1200, 561, 1], ['wait', .25], ['click'], ['type'], ['show', 4, .4], ['wait', 1.5],
        ['cam', 720, 435, 1, 1.1], ['show', 5, .45], ['wait', 1],
        ['cur', 531, 321, 1.3], ['wait', .25], ['click'], ['show', 6, .35], ['wait', 1.5]] },
    workflow: { states: S('workflow', ['workflows', 'workflows-1', 'workflows-2', 'workflows-10', 'workflows-11', 'workflows-3', 'whatsapp', 'add-content-2', 'multi-split-branch']),
      start: [1100, 300], steps: [
        ['wait', .5], ['cur', 1327, 112, 1], ['wait', .25], ['click'], ['show', 1, .35], ['wait', .3],
        ['cur', 704, 435, 1.1], ['wait', .25], ['click'], ['show', 2, .3], ['wait', .4],
        ['cur', 1024, 207, 1], ['wait', .25], ['click'], ['show', 3, .3], ['wait', .35],
        ['cur', 1048, 257, .8], ['wait', .25], ['click'], ['show', 4, .3], ['wait', .4],
        ['cur', 1338, 340, .9], ['wait', .25], ['click'], ['show', 5, .35], ['wait', .4],
        ['cur', 1234, 423, 1], ['wait', .25], ['click'], ['show', 6, .35], ['wait', .6],
        ['cur', 1145, 265, 1], ['wait', .25], ['click'], ['show', 7, .35], ['wait', .4],
        ['cur', 1066, 423, 1], ['wait', .25], ['click'], ['show', 8, .4],
        ['cam', 720, 435, 1.08, 1.4], ['cur', 900, 560, 1.2], ['wait', 1.2], ['cam', 720, 435, 1, .8]] },
  };
  return { w: 1440, h: 870, ...F[key] };
};


AdmScene.aidash = (P, size = '@hero') => {
  const d = `aidash${size}/`, f = ['01-empty-dashboard', '02-ask-admira', '03-typed', '04-building', '05-built', '06-refined', '07-saved'];
  return {
    w: 1200, h: 600, start: [980, 470], states: f.map(x => P + d + x + '.webp'),
    steps: [
      ['wait', .3], ['cur', 707, 511, .75], ['click'], ['show', 1, .3],
      ['cam', 290, 270, 1.45, .8], ['cur', 190, 240, .8], ['click'],
      ['type', 113, 227, 330, 'Paid leads and spend by day for the last 30 days', 13.5, 24],
      ['show', 2, .15], ['type'], ['cur', 443, 318, .75], ['click'], ['show', 3, .25], ['cam', 300, 240, 1.3, .6], ['wait', .5],
      ['show', 4, .35], ['cam', 930, 390, 1.32, 1.1], ['cur', 1010, 330, 1.1], ['wait', .5],
      ['cam', 300, 300, 1.35, .9], ['cur', 196, 353, .8], ['click'], ['show', 5, .3],
      ['cam', 840, 420, 1.25, 1], ['cur', 900, 470, .8], ['wait', .5], ['cam', 600, 300, 1, .7],
      ['cur', 1023, 54, .9], ['click'], ['show', 6, .35],
      ['cam', 520, 400, 1.22, .9], ['cur', 760, 575, .8], ['wait', 1.4], ['cam', 600, 300, 1, .7], ['wait', .3],
    ],
  };
};
