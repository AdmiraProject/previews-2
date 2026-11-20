(() => {
  const D = window.MB, P = window.MB_PDP, Q = window.MBQ;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const id = new URLSearchParams(location.search).get('id') || 'hypercare';
  const base = D.products.find(p => p.id === id) || D.products[0];
  const d = P[base.id];
  const cat = D.categories.find(c => c.id === base.cat) || {};
  const OHB = base.cat === 'ohb';
  document.title = `${d.title} · Magic Beauty México`;
  const md = document.querySelector('meta[name=description]'); if (md) md.content = (d.paras[0] || '').slice(0, 155);

  /* ---------- galería ---------- */
  // fotos de ambiente reales del sitio (equipos reales en escena) para los productos que aparecen en el hero
  const LIFE = {
    hypercare: [{ img: 'media/launch.jpg', video: 'media/launch.mp4', t: 'Llega instalada. Sin tanques.', s: 'Sentado o semiacostado, con generador de oxígeno integrado.' }, { img: 'media/suite.webp', t: 'Tu suite de recuperación.', s: 'Diseñada para pacientes post-operatorios y de baja movilidad.' }],
    'hairmax-4k': [{ img: 'media/cat/hair.webp', t: 'Depilación con IA.', s: 'Análisis de vello con microscopio de alta definición.' }],
    cryo4d: [{ img: 'media/cat/body.webp', t: 'Criolipólisis 4D.', s: 'Cuatro manerales por sesión, en operación continua.' }],
    'pico-arrow': [{ img: 'media/cat/laser.webp', t: '690 picosegundos reales.', s: 'Spot regulable y cambio de filtros automático.' }]
  };
  const life = LIFE[base.id] || [];
  const shots = d.gallery;
  const specCap = i => { const s = d.specs[i]; return s ? { t: s[0], s: s[1].split('\n')[0].replace(/^•/, '').slice(0, 90) } : { t: d.title, s: cat.name }; };
  const tiles = [];
  if (life[0]) tiles.push({ ...life[0], wide: true, dark: true, life: true });
  else tiles.push({ img: shots[0], wide: true, prod: true, tag: base.tag });
  const rest = (life[0] ? shots : shots.slice(1));
  life.slice(1).forEach(l => tiles.push({ ...l, dark: true, life: true }));
  rest.slice(0, life.length > 1 ? 3 : 4).forEach((img, i) => tiles.push({ img, prod: true, cap: specCap(i) }));
  const lbList = [...tiles.map(t => t.img)];
  const tileHTML = (t, i) => `<div class="gt ${t.wide ? 'wide' : ''} ${t.prod ? 'prod' : ''} ${t.dark ? 'dark' : ''}" data-lb="${i}" role="button" tabindex="0" aria-label="Ampliar imagen">
      ${t.video ? `<video src="${t.video}" poster="${t.img}" muted loop playsinline preload="metadata" aria-hidden="true"></video>` : `<img src="${t.img}" alt="${esc(d.title)}" ${i ? 'loading="lazy"' : ''}>`}
      ${t.tag ? `<span class="tagl">${t.tag}</span>` : ''}
      ${t.t || t.cap ? `<div class="cap"><b>${esc(t.t || t.cap.t)}</b><small>${esc(t.s || t.cap.s)}</small></div>` : ''}
      <span class="${t.video ? 'pl' : 'zm'}" aria-hidden="true">${t.video ? '' : '+'}</span></div>`;
  const gal = `<div class="gal">${tiles.map(tileHTML).join('')}
      <div class="gcar"><div class="gcar-t" id="gcarT">${shots.map(s => `<img src="${s}" alt="" loading="lazy">`).join('')}</div>
        <b>Mira cada ángulo.</b><small>Fotografías reales de ${esc(d.title)}.</small>
        <div class="gdots" id="gdots">${shots.map((_, i) => `<button aria-label="Foto ${i + 1}" ${i ? '' : 'aria-current="true"'}></button>`).join('')}</div></div>
    </div>`;

  /* ---------- caja de compra ---------- */
  const PAY = ['Contado', 'Hasta 24 MSI*', 'Financiamiento 48 meses*'];
  const PAYH = ['Pregunta por el precio especial de contado vigente.', 'Con tarjetas participantes.', 'Enganche desde 10%, sujeto a aprobación. Deducible de IVA/ISR (excepto RESICO).'];
  const st = { opts: [], pay: 1, qty: 1 };
  const pkg = ['Certificados de capacitación para todo tu equipo', 'Nube con toda la información digital de tu equipo', 'Contratos, garantías y formatos de consentimiento', 'Material de marketing y listas de precios personalizadas', 'Manuales, documentos técnicos y protocolos', 'Un video promocional para tu clínica'];
  const ICO = {
    card: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003590" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><path d="M2 7h12v9H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    tool: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2.1-.6-.6-2.1 2.3-2.9Z"/></svg>'
  };
  const buy = `<aside class="bbox" aria-label="Cotizar ${esc(d.title)}">
      <a class="crumb" href="index.html#equipos" data-cat="${base.cat}">${esc(cat.name || '')}</a>
      <h1>${esc(d.title)}</h1>
      <div class="b-rate"><span class="st" aria-hidden="true">★★★★★</span><span>4.8</span><a href="#resenas">Ver 182 reseñas de Magic</a></div>
      <div class="b-price"><small>Inversión:</small><b>Cotización personalizada</b><span class="off">Hasta 24 MSI*</span></div>
      ${d.opts.length ? `<div class="b-lab">Personalización : <em id="optLab">Elige lo que quieras sumar</em></div>
      <div class="b-opts" id="optsB">${d.opts.map((o, i) => `<button class="b-opt" data-o="${i}" aria-pressed="false">${esc(o[0])}</button>`).join('')}</div>
      <p class="b-hint" id="optHint"></p>` : ''}
      <div class="b-lab">Esquema de pago : <em id="payLab">${PAY[1]}</em></div>
      <div class="b-opts" id="payB">${PAY.map((p, i) => `<button class="b-opt" data-p="${i}" aria-pressed="${i === 1}">${p}</button>`).join('')}</div>
      <p class="b-hint" id="payHint">${PAYH[1]}</p>
      <div class="b-lab">Cantidad <em>(equipa más de una cabina)</em></div>
      <div class="b-qty"><span id="qtyLab">1 equipo</span><span class="stp"><button id="qm" aria-label="Menos">−</button><b id="qn">1</b><button id="qp" aria-label="Más">+</button></span></div>
      <button class="b-add" id="bAdd">Cotizar y agendar llamada</button>
      <div class="b-line">${ICO.card}<span>Llévate tu equipo con <a href="index.html#garantias">hasta 24 meses sin intereses*</a></span></div>
      <div class="b-line">${ICO.truck}<span>Entrega de 7 a 12 días hábiles si tu equipo ya está fabricado.</span></div>
      <div class="b-line">${ICO.tool}<span>Instalación y capacitación en tu clínica. Sin costo, solo viáticos.</span></div>
      <details class="acc" open><summary>Descripción</summary><div class="ac">${d.paras.map(p => `<p>${esc(p)}</p>`).join('')}</div></details>
      <details class="acc"><summary>Ficha técnica</summary><div class="ac"><table class="spec"><tbody>${d.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v.replace(/^•/gm, '· '))}</td></tr>`).join('')}</tbody></table></div></details>
      ${d.opts.length ? `<details class="acc"><summary>Personaliza tu ${esc(d.title)}</summary><div class="ac"><ul class="chk">${d.opts.map(o => `<li><span><b>${esc(o[0])}.</b> ${esc(o[1])}</span></li>`).join('')}</ul></div></details>` : ''}
      <details class="acc"><summary>Tu proyecto integral incluye</summary><div class="ac"><ul class="chk">${pkg.map(x => `<li>${x}</li>`).join('')}</ul></div></details>
      <details class="acc"><summary>Garantía y soporte</summary><div class="ac"><ul class="chk">${OHB ? '<li>5 años de garantía en la estructura de tu cámara</li>' : ''}<li>Soporte de por vida: Call Medical Center e ingeniero de servicio</li><li>Respuesta en menos de 1 hora y refacciones originales en 24 h hábiles</li><li>Mantenimiento anual recomendado, con recolección de tu equipo</li><li>Garantía extendida disponible</li></ul></div></details>
      <details class="acc"><summary>Envío, instalación y capacitación</summary><div class="ac"><p>Si el equipo ya está fabricado, la entrega toma de 7 a 12 días hábiles. Para equipos personalizados, tu asesor te da el plazo estimado.</p><p>Instalamos el equipo en tu clínica y capacitamos a todo tu equipo de trabajo. La instalación no tiene costo; solo se cubren viáticos.</p>${OHB ? '<p>Antes de la entrega revisamos contigo las medidas del espacio y del acceso.</p>' : ''}</div></details>
      <div class="help"><h2>¿Necesitas ayuda?</h2><p>Nuestros especialistas están disponibles para responder tus dudas.</p>
        <div class="hb"><a href="tel:+527772633238"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1Z"/></svg>Llámanos</a>
        <a href="#" data-wa="Hola Magic Beauty, tengo dudas sobre ${esc(d.title)}."><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>Escríbenos</a></div></div>
    </aside>`;
  $('#pdp').innerHTML = gal + buy;
  $('#sbName').textContent = d.title;

  // opciones
  const optB = $('#optsB');
  if (optB) optB.addEventListener('click', e => {
    const b = e.target.closest('.b-opt'); if (!b) return; const i = +b.dataset.o;
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
    st.opts = $$('.b-opt', optB).filter(x => x.getAttribute('aria-pressed') === 'true').map(x => d.opts[+x.dataset.o][0]);
    $('#optLab').textContent = st.opts.length ? st.opts.join(' + ') : 'Elige lo que quieras sumar';
    $('#optHint').textContent = on ? d.opts[i][1] : '';
  });
  $('#payB').addEventListener('click', e => {
    const b = e.target.closest('.b-opt'); if (!b) return; st.pay = +b.dataset.p;
    $$('.b-opt', $('#payB')).forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#payLab').textContent = PAY[st.pay]; $('#payHint').textContent = PAYH[st.pay];
  });
  const setQty = n => { st.qty = Math.max(1, Math.min(10, n)); $('#qn').textContent = st.qty; $('#qtyLab').textContent = st.qty === 1 ? '1 equipo' : `${st.qty} equipos`; };
  $('#qm').onclick = () => setQty(st.qty - 1); $('#qp').onclick = () => setQty(st.qty + 1);
  const add = () => Q.add(base.id, { qty: st.qty, pay: PAY[st.pay].replace('*', ''), opts: st.opts });
  $('#bAdd').onclick = add; $('#sbAdd').onclick = add;

  // barra fija al pasar el botón
  const sb = $('#stickyBuy');
  new IntersectionObserver(([en]) => { const on = !en.isIntersecting && en.boundingClientRect.top < 0; sb.classList.toggle('on', on); sb.setAttribute('aria-hidden', !on); }).observe($('#bAdd'));

  // video en mosaico
  $$('.gt video').forEach(v => new IntersectionObserver(([en]) => en.isIntersecting ? v.play().catch(() => {}) : v.pause(), { threshold: .3 }).observe(v));

  // carrusel
  const ct = $('#gcarT'), dots = $$('#gdots button');
  if (ct) {
    ct.addEventListener('scroll', () => { const i = Math.round(ct.scrollLeft / ct.clientWidth); dots.forEach((b, j) => b.setAttribute('aria-current', j === i)); }, { passive: true });
    dots.forEach((b, j) => b.onclick = () => ct.scrollTo({ left: j * ct.clientWidth, behavior: 'smooth' }));
  }

  // lightbox
  const all = [...new Set([...lbList, ...shots])];
  const lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Galería');
  lb.innerHTML = '<img alt=""><button class="x" aria-label="Cerrar">✕</button><button class="p" aria-label="Anterior">‹</button><button class="n" aria-label="Siguiente">›</button><span class="c"></span>';
  document.body.appendChild(lb);
  let li = 0; const show = i => { li = (i + all.length) % all.length; $('img', lb).src = all[li]; $('.c', lb).textContent = `${li + 1} / ${all.length}`; };
  const openLb = src => { show(Math.max(0, all.indexOf(src))); lb.hidden = false; };
  $('.x', lb).onclick = () => lb.hidden = true; $('.p', lb).onclick = () => show(li - 1); $('.n', lb).onclick = () => show(li + 1);
  lb.addEventListener('click', e => { if (e.target === lb) lb.hidden = true; });
  document.addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowRight') show(li + 1); if (e.key === 'ArrowLeft') show(li - 1); });
  $('#pdp').addEventListener('click', e => { const t = e.target.closest('[data-lb]'); if (t) openLb(tiles[+t.dataset.lb].img); const c = e.target.closest('.gcar-t img'); if (c) openLb(c.getAttribute('src')); });
  $('#pdp').addEventListener('keydown', e => { const t = e.target.closest('[data-lb]'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLb(tiles[+t.dataset.lb].img); } });

  /* ---------- reseñas (Google, textuales) ---------- */
  const TOP = { 'Capacitación': /capacit|curso|explic|enseñ|entrenador/i, 'Entrega e instalación': /entreg|envío|instal|tiempo y forma/i, 'Atención': /atenci|atent|amable|pacien|seguimiento|asesor/i, 'Equipo': /equipo|máquina|tecnolog|producto/i };
  const vids = D.videoReviews;
  const ini = n => n.replace(/^(Lic\.|Dr\.|Dra\.)\s*/i, '').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  $('#resenas').innerHTML = `<h2 id="rv-h" class="rv-title">Reseñas de clientes Magic</h2>
    <div class="rv-sum"><div style="text-align:center"><div class="big">4.8</div><div class="st" aria-label="4.8 de 5">★★★★★</div><small>182 reseñas en Google</small></div></div>
    <div class="rv-vids">${vids.map(v => `<button class="rv-v" data-v="${v.reel}" aria-label="Ver testimonio de ${esc(v.name)}"><img src="media/reels/${v.reel}.jpg" alt="" loading="lazy"><span class="pl" aria-hidden="true"></span><span>${esc(v.name)}<small>${esc(v.role)} · Testimonio en video</small></span></button>`).join('')}</div>
    <div class="rv-tools"><label class="rv-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="sr">Buscar en reseñas</span><input id="rvQ" placeholder="Buscar en reseñas"></label>
      <select class="rv-sort" id="rvSort" aria-label="Ordenar reseñas"><option value="r">Más recientes</option><option value="l">Más detalladas</option></select></div>
    <div class="rv-chips" id="rvChips">${Object.keys(TOP).map(k => `<button class="rv-chip" aria-pressed="false">${k}</button>`).join('')}</div>
    <div class="rv-list" id="rvList"></div><nav class="pag" id="rvPag" aria-label="Páginas de reseñas"></nav>
    <p style="text-align:center;margin-top:14px"><a class="more" href="https://www.google.com/maps/place/Magic+Beauty+Mexico/data=!4m2!3m1!1s0x85cde099646589d9:0x116491de9ffad5f9" target="_blank" rel="noopener">Ver todas en Google</a></p>`;
  $('#resenas').addEventListener('click', e => { const v = e.target.closest('[data-v]'); if (v) Q.openVideo(v.dataset.v); });
  const ord = [...D.reviews];
  const age = w => { const m = w.match(/(\d+|un|una)\s+(semana|mes|año)/i); if (!m) return 0; const n = /^un/i.test(m[1]) ? 1 : +m[1]; return n * { semana: 7, mes: 30, año: 365 }[m[2].toLowerCase()]; };
  let page = 0, topic = '', q = '', sort = 'r';
  const renderRv = () => {
    let list = ord.filter(r => (!topic || TOP[topic].test(r[2])) && (!q || (r[0] + ' ' + r[2]).toLowerCase().includes(q)));
    list.sort(sort === 'r' ? (a, b) => age(a[1]) - age(b[1]) : (a, b) => b[2].length - a[2].length);
    const per = 5, pages = Math.max(1, Math.ceil(list.length / per)); page = Math.min(page, pages - 1);
    $('#rvList').innerHTML = list.length ? list.slice(page * per, page * per + per).map(([n, w, t]) => `<article class="ri"><span class="av" aria-hidden="true">${ini(n)}</span><div><div class="ri-h">${esc(n)} <small>${w}</small></div><div class="st" aria-label="5 de 5 estrellas">★★★★★</div><p>${esc(t)}</p><span class="ver">✓ Reseña de Google</span></div></article>`).join('') : '<p class="rv-empty">No hay reseñas con ese filtro.</p>';
    $('#rvPag').innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button aria-current="${i === page}" data-pg="${i}">${i + 1}</button>`).join('') : '';
  };
  $('#rvQ').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); page = 0; renderRv(); });
  $('#rvSort').addEventListener('change', e => { sort = e.target.value; page = 0; renderRv(); });
  $('#rvChips').addEventListener('click', e => { const b = e.target.closest('.rv-chip'); if (!b) return; const on = b.getAttribute('aria-pressed') !== 'true'; $$('.rv-chip').forEach(x => x.setAttribute('aria-pressed', false)); b.setAttribute('aria-pressed', on); topic = on ? b.textContent : ''; page = 0; renderRv(); });
  $('#rvPag').addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (b) { page = +b.dataset.pg; renderRv(); Q.goTo('#resenas'); } });
  renderRv();

  /* ---------- relacionados ---------- */
  const rel = [...D.products.filter(p => p.cat === base.cat && p.id !== base.id), ...D.products.filter(p => p.cat !== base.cat && p.tag)].slice(0, 8);
  $('.pdp-rel').innerHTML = `<div class="sec-h"><h2 id="rel-h" class="h2">Equipa tu clínica completa</h2><a class="more" href="index.html#equipos">Ver todos los equipos</a></div>
    <div class="fd-row rel">${rel.map(window.fdCard).join('')}</div>`;

  const w = vids[0];
  $('.pdp-amb').innerHTML = `<div class="am-l"><h2>“Yo equipé mi clínica con Magic”</h2><b>${esc(w.name)}</b><small>${esc(w.role)}</small><button data-v2="${w.reel}">Ver más</button><img src="media/logo-white.png" alt="Magic Beauty"></div>
    <div class="am-r" data-v2="${w.reel}" role="button" tabindex="0" aria-label="Ver testimonio de ${esc(w.name)}"><img src="media/reels/${w.reel}.jpg" alt=""></div>`;
  $('.pdp-amb').addEventListener('click', e => { const v = e.target.closest('[data-v2]'); if (v) Q.openVideo(v.dataset.v2); });
})();
