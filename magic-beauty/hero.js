// Capas: before (consultorio actual) → room (mismo cuarto renovado, misma geometría) + equipos reales recortados.
window.HeroScene = function (canvas, opts) {
  const o = Object.assign({ base: 'media/hero/', focusX: 0.5, focusY: 0.5 }, opts);
  const ctx = canvas.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const L = {}; let meta = null, ready = false;
  const st = { s: 0, light: 0, zoom: 1.06, t: 0 };
  const load = src => new Promise(res => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => res(null); i.src = MBU(o.base + src); });
  const p = (window.MB_HERO_META ? Promise.resolve(window.MB_HERO_META) : fetch(MBU(o.base + 'meta.json')).then(r => r.json())).then(async m => {
    meta = m;
    const [b, r] = await Promise.all([load('before.webp'), load('room.webp')]);
    L.before = b; L.room = r;
    L.m = await Promise.all(m.machines.map(x => load(`m-${x.id}.webp`)));
    ready = true; resize(); draw();
    o.onReady && o.onReady();
  });
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  let geo = { k: 1, dx: 0, dy: 0, dpr: 1 };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = off.width = Math.round(w * dpr); canvas.height = off.height = Math.round(h * dpr);
    geo.dpr = dpr; draw();
  }
  // posición del scan en px de imagen
  const scanX = () => meta ? (-0.12 + 1.24 * st.s) * meta.w : 0;
  function itemT(m) { const sx = scanX(), c = m.x + m.w * 0.5; return clamp((sx - (c - m.w * 0.35)) / (m.w * 1.1)); }
  function draw() {
    if (!ready) return;
    const W = canvas.width, H = canvas.height, iw = meta.w, ih = meta.h;
    const k = Math.max(W / iw, H / ih) * st.zoom;
    const dx = (W - iw * k) * o.focusX, dy = (H - ih * k) * o.focusY;
    geo = { k, dx, dy, dpr: geo.dpr };
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(L.before, dx, dy, iw * k, ih * k);
    const sx = dx + scanX() * k;
    if (st.s > 0) {
      // cuarto renovado revelado por la línea de luz
      octx.globalCompositeOperation = 'source-over'; octx.clearRect(0, 0, W, H);
      octx.drawImage(L.room, dx, dy, iw * k, ih * k);
      const edge = Math.max(40, W * 0.07);
      const g = octx.createLinearGradient(sx - edge, 0, sx + edge * 0.15, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      octx.globalCompositeOperation = 'destination-in'; octx.fillStyle = st.s >= 1 ? '#000' : g; octx.fillRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0);
      // equipos reales: aparecen exactamente donde estaba cada equipo viejo
      meta.machines.forEach((m, i) => {
        const t = itemT(m); if (t <= 0 || !L.m[i]) return;
        const e = ease(t), lift = (1 - e) * 46 * k * (ih / 1520);
        ctx.globalAlpha = e;
        ctx.drawImage(L.m[i], dx + m.x * k, dy + m.y * k + lift, m.w * k, m.h * k);
        const bloom = Math.sin(Math.PI * t) * 0.55;
        if (bloom > 0.01) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = bloom * 0.45; ctx.drawImage(L.m[i], dx + m.x * k, dy + m.y * k + lift, m.w * k, m.h * k); ctx.globalCompositeOperation = 'source-over'; }
        ctx.globalAlpha = 1;
      });
    }
    // línea de luz
    if (st.s > 0 && st.s < 1) {
      ctx.globalCompositeOperation = 'lighter';
      const gw = W * 0.12, g2 = ctx.createLinearGradient(sx - gw, 0, sx + gw * 0.4, 0);
      g2.addColorStop(0, 'rgba(120,110,255,0)'); g2.addColorStop(0.75, 'rgba(150,140,255,.22)'); g2.addColorStop(0.97, 'rgba(255,240,220,.55)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g2; ctx.fillRect(sx - gw, 0, gw * 1.4, H);
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fillRect(sx - 1 * geo.dpr, 0, 2 * geo.dpr, H);
      // chispas
      const n = 22;
      for (let j = 0; j < n; j++) {
        const r = Math.sin(j * 91.7 + st.t * 0.004 * (1 + (j % 3))) * 0.5 + 0.5;
        const y = ((j * 0.61803 + st.t * 0.00006 * (j % 5 + 1)) % 1) * H;
        const a = 0.25 + 0.6 * r;
        ctx.fillStyle = `rgba(255,248,235,${a})`;
        ctx.beginPath(); ctx.arc(sx - r * 26 * geo.dpr, y, (0.8 + r * 1.8) * geo.dpr, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    // encendido cálido final
    if (st.light > 0.001) {
      ctx.globalCompositeOperation = 'soft-light';
      const rg = ctx.createRadialGradient(W * 0.5, H * 0.05, 0, W * 0.5, H * 0.3, Math.max(W, H) * 0.8);
      rg.addColorStop(0, `rgba(255,214,160,${0.55 * st.light})`); rg.addColorStop(1, 'rgba(255,214,160,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  addEventListener('resize', resize);
  return {
    ready: p,
    set(v) { Object.assign(st, v); draw(); },
    get state() { return st; },
    // posiciones en CSS px de cada equipo (para etiquetas)
    items() {
      if (!meta) return [];
      return meta.machines.map(m => ({ id: m.id, t: itemT(m), x: (geo.dx + (m.x + m.w / 2) * geo.k) / geo.dpr, y: (geo.dy + (m.y + m.h * 0.08) * geo.k) / geo.dpr }));
    },
    resize
  };
};

window.HERO_LABELS = {
  'hairmax-4k': { old: 'IPL de hace 10 años', neo: 'Hairmax Ultra 4K', sub: 'Depilación con IA' },
  'cryo4d': { old: 'Carrito de cavitación', neo: 'Avantgarde Cryo 4D', sub: 'Criolipólisis 4D' },
  'pico-arrow': { old: 'Lámpara lupa', neo: 'PicoLáser Arrow Elite', sub: '690 ps reales' }
};
