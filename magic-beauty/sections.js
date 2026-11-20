(() => {
  const D = window.MB;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const catName = id => (D.categories.find(c => c.id === id) || {}).name || '';
  const G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-label="Google"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.6-4.2-13.5-10l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
  const ICON = {
    msi: '<svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="1.6"><rect x="3" y="8" width="26" height="16" rx="2"/><path d="M3 13h26M8 19h6"/></svg>',
    shield: '<svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="1.6"><path d="M16 4l10 4v7c0 6.5-4.3 10.6-10 13-5.7-2.4-10-6.5-10-13V8l10-4Z"/><path d="m11.5 16 3.2 3.2 6-6.4"/></svg>',
    support: '<svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="1.6"><path d="M7 18v-3a9 9 0 0 1 18 0v3"/><rect x="4" y="17" width="5" height="8" rx="2"/><rect x="23" y="17" width="5" height="8" rx="2"/><path d="M25 25c0 2-2 3-5 3h-3"/></svg>',
    truck: '<svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="1.6"><path d="M3 9h16v13H3zM19 13h5l4 4v5h-9"/><circle cx="8" cy="24" r="2.2"/><circle cx="23" cy="24" r="2.2"/></svg>'
  };

  const cats = () => `
  <section class="wrap sec" aria-labelledby="cat-h">
    <h2 id="cat-h" class="h2" style="margin-bottom:16px">Equipa cada espacio.</h2>
    <div class="cats">${D.categories.slice(0, 4).map(c => `
      <a class="cat rvl" href="#equipos" data-cat="${c.id}">
        <div class="cat-img"><img src="${MBU(`media/cat/${c.id}.webp`)}" alt="${esc(c.name)}" loading="lazy"><span class="cat-l">${c.short}<i>Hasta 24 MSI</i></span></div>
        <p>${c.line}</p>
      </a>`).join('')}
    </div>
  </section>`;

  const launch = () => `
  <section class="launch" id="lanzamiento" aria-labelledby="launch-h">
    <div class="wrap">
      <span class="pill-o">NUEVO LANZAMIENTO</span>
      <div class="launch-r">
        <div><h2 id="launch-h" class="launch-t"><img src="media/logo-white.png" alt="Magic Beauty"><span>Hypercare 2.0 ATA</span></h2>
          <p class="launch-s">Sentado o semiacostado. Oxígeno sin tanques.</p></div>
        <div class="launch-p"><div><small>Financiamiento:</small><b>24 MSI*</b></div>
          <a class="btn btn-blue" href="${MBL.product('hypercare')}">Conocer más</a></div>
      </div>
      <div class="launch-v"><video src="media/launch.mp4" poster="media/launch.jpg" muted loop playsinline autoplay preload="metadata" aria-label="Enfermera prepara una cámara SMART OHB Hypercare"></video></div>
    </div>
  </section>`;

  const KEEP = /^(OHB|ATA|CO2|4D|4K|9D|HIFU|RF|DPL|IPL|SHR|LED|PDT|ND-YAG|IR|PRO|DUO|AI|IA|EU|II)$/i;
  const nice = n => /[a-z]/.test(n.replace(/[^A-Za-z]/g, '').slice(1)) && !/^[A-Z0-9 .\-]+$/.test(n) ? n.replace(/\bSmart\b/, 'Smart') : n.split(' ').map(w => KEEP.test(w) || /\d/.test(w) ? w.toUpperCase() : w.charAt(0) + w.slice(1).toLowerCase()).join(' ').replace(/\bOhb\b/, 'OHB').replace(/^Picolaser\b/, 'PicoLáser');
  const TAG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>';
  window.fdCard = p => `
        <article class="fd" id="p-${p.id}">
          <a class="fd-lk" href="${p.ext || MBL.product(p.id)}" ${p.ext ? 'target="_blank" rel="noopener"' : ''} aria-label="${esc(p.name)}">
            <div class="fd-i">${p.tag ? `<span class="fd-tag">${p.tag}</span>` : ''}<img src="${MBU(p.img || `media/p/${p.id}.webp`)}" alt="" loading="lazy"><span class="fd-chip">Instalación incluida*</span></div>
            <h3>${esc(nice(p.name))}</h3></a>
          <div class="fd-rt"><span class="st" aria-hidden="true">★★★★★</span><b>4.8</b><small>182 reseñas de Magic</small></div>
          <div class="fd-from">Inversión:</div>
          <div class="fd-pr"><b>A cotizar*</b><span class="fd-off">24 MSI</span></div>
          <span class="fd-cup">${TAG}*Aparta con 30% y congela tu precio</span>
          <div class="fd-msi">Paga a <b>24 MSI</b> o hasta <b>48 meses</b></div>
          <button class="fd-btn" data-add="${p.id}">Cotizar</button>
        </article>`;
  const FEAT = ['hypercare', 'hypercare-duo', 'cryo4d', 'hairmax-4k'];
  const deals = () => `
  <section class="deals" id="equipos" aria-labelledby="deals-h">
    <div class="wrap">
      <div class="sec-h"><h2 id="deals-h" class="h2">Equipos destacados</h2><button class="more" id="dealsAll" aria-expanded="false" aria-controls="dealsRow">Ver los ${D.products.length} equipos</button></div>
      <div class="fd-row" id="dealsRow">${[...FEAT.map(id => D.products.find(p => p.id === id)), ...D.products.filter(p => !FEAT.includes(p.id))].map(window.fdCard).join('')}</div>
      <p class="legal">*Meses sin intereses con tarjetas participantes. Financiamiento hasta 48 meses con enganche desde 10%, sujeto a aprobación (buró de crédito e ingresos comprobables); deducible de IVA/ISR excepto RESICO. *Apartado con 30%: congela el precio hasta 90 días. *Instalación sin costo, solo viáticos. Calificación 4.8 con 182 reseñas de Magic Beauty en Google. Fotografías de producto reales.</p>
    </div>
  </section>`;

  const banner = () => `
  <section class="wrap sec">
    <div class="banner rvl">
      <video src="media/banner.mp4" poster="media/banner.jpg" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>
      <div class="in"><h2>Una gran clínica empieza antes del primer paciente.</h2>
        <p>Planeamos tu espacio, instalamos tu equipo y capacitamos a todo tu equipo.</p>
        <button class="btn btn-blue" data-reel="proceso">Ver el proceso</button></div>
    </div>
  </section>`;

  const garantias = () => `
  <section class="wrap sec" id="garantias" aria-label="Garantías y cobertura">
    <div class="tiles">
      <div class="tile rvl">${ICON.msi}<h3>Hasta 24 Meses Sin Intereses</h3><p>Con tarjetas participantes, o financiamiento hasta 48 meses deducible de impuestos.*</p></div>
      <div class="tile rvl">${ICON.shield}<h3>5 años de garantía</h3><p>En la estructura de tus cámaras hiperbáricas, con garantía extendida disponible.</p></div>
      <div class="tile rvl">${ICON.support}<h3>Soporte de por vida</h3><p>Call Medical Center, ingeniero de servicio y refacciones en 24 h hábiles.</p></div>
      <div class="tile rvl">${ICON.truck}<h3>Entrega e instalación</h3><p>De 7 a 12 días hábiles si tu equipo ya está fabricado. Lo instalamos en tu clínica.*</p></div>
    </div>
    <div class="stats rvl">
      <h2 class="h2">Miles de clínicas ya trabajan con Magic.</h2>
      <p class="sub">Los datos hablan por sí solos: fabricantes sin intermediarios, equipos en México, USA, Centro y Sudamérica.</p>
      <div class="stats-g">
        <div class="stat"><b data-count="8200" data-prefix="+">+8,200</b><span>Equipos instalados en clínicas</span></div>
        <div class="stat"><b data-count="80" data-prefix="+">+80</b><span>Equipos para cada tratamiento</span></div>
        <div class="stat"><b data-count="45" data-prefix="+">+45</b><span>Especialistas en ingeniería, calidad y marketing</span></div>
        <div class="stat"><div class="ribbon">Calificación<b>4.8★</b>En Google<br>182 reseñas</div></div>
      </div>
    </div>
  </section>`;

  const amb = () => `
  <section class="wrap sec" id="reels" aria-labelledby="amb-h">
    <h2 id="amb-h" class="h2">Magic en tu feed</h2>
    <p class="sub" style="font-size:16px;font-weight:500;margin-bottom:28px">Equipos reales. Clínicas reales. Toca para ver con sonido.</p>
    <div class="amb">${D.ambassadors.map((a, i) => `
      <button class="ab ${i === 0 ? 'big' : ''}" data-reel="${a.reel}" data-hover="${a.reel}" aria-label="Ver: ${esc(a.name)}">
        <img src="${MBU(`media/reels/${a.reel}.jpg`)}" alt="" loading="lazy"><span class="pl" aria-hidden="true"></span>
        <span class="nm"><b>${esc(a.name)}</b><small>${esc(a.role)}</small></span></button>`).join('')}
    </div>
  </section>`;

  const coverflow = () => `
  <section class="wrap sec" aria-labelledby="cf-h">
    <div class="sec-h" style="margin-bottom:8px"><h2 id="cf-h" class="h2">Lo que sienten quienes ya trabajan con Magic.</h2><a class="more" href="#resenas">Ver reseñas</a></div>
    <div class="cf" id="cf">
      ${D.videoReviews.map((v, i) => `<div class="cf-c" data-i="${i}" data-reel="${v.reel}" role="button" tabindex="0" aria-label="Testimonio de ${esc(v.name)}"><img src="${MBU(`media/reels/${v.reel}.jpg`)}" alt="" loading="lazy"><span class="pb"></span><span class="nm">${esc(v.name)}<br><small>${esc(v.role)}</small></span></div>`).join('')}
      <button class="cf-a l" aria-label="Anterior">‹</button><button class="cf-a r" aria-label="Siguiente">›</button>
    </div>
  </section>`;

  const PAL = ['#0047bb', '#0f9d58', '#db4437', '#e09a00', '#7b1fa2', '#00838f', '#c2185b', '#5d4037', '#3949ab', '#ef6c00'];
  const ini = n => n.replace(/^(Lic\.|Dr\.|Dra\.)\s*/i, '').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const gCard = ([n, w, t], i) => `<article class="rv"><div class="rv-h"><span class="av" style="background:${PAL[i % PAL.length]}" aria-hidden="true">${ini(n)}</span><div><b>${esc(n)}</b><small>${w}</small></div>${G}</div><div class="st" aria-label="5 de 5 estrellas">★★★★★</div><p>${esc(t)}</p></article>`;
  const vCard = v => `<article class="rv vid" data-reel="${v.reel}" role="button" tabindex="0" aria-label="Ver testimonio de ${esc(v.name)}"><div class="vi"><img src="${MBU(`media/reels/${v.reel}.jpg`)}" alt="" loading="lazy"><span class="pb">▶ Testimonio en video</span></div><div class="rb"><div class="rv-h"><img class="av" src="${MBU(`media/faces/${v.face}.jpg`)}" alt="${esc(v.name)}" loading="lazy"><div><b>${esc(v.name)}</b><small>${esc(v.role)}</small></div></div><div class="st" aria-hidden="true">★★★★★</div><p>“${esc(v.text)}”</p></div></article>`;
  const love = () => {
    const NC = innerWidth < 768 ? 1 : innerWidth < 1025 ? 3 : 4, cols = Array.from({ length: NC }, () => []), wt = c => c.reduce((s, x) => s + x.w, 0);
    D.videoReviews.forEach((v, i) => cols[i % NC].push({ h: vCard(v), w: 3.2 }));
    D.reviews.forEach((r, i) => { const c = cols.reduce((m, col, j) => wt(col) < wt(cols[m]) ? j : m, 0); cols[c].splice(i % 2 ? cols[c].length : Math.min(1, cols[c].length), 0, { h: gCard(r, i), w: 1 + r[2].length / 170 }); });
    return `
  <section class="wrap sec" id="resenas" aria-labelledby="love-h">
    <div class="love-h"><span class="g-badge">${G}<b>4.8</b><span class="st">★★★★★</span>182 reseñas</span>
      <h2 id="love-h" class="h2">Más de 180 clínicas nos califican con 5 estrellas.</h2>
      <p class="sub" style="font-size:16px;margin-top:6px">Reseñas reales de Google y testimonios en video de médicos y spas en todo México.</p></div>
    <div class="love">${cols.map((col, i) => { const h = col.map(x => x.h).join(''); return `<div class="love-col ${i % 2 ? 'dn' : ''}"><div class="love-tr" style="--d:${64 + i * 8}s"><div style="display:flex;flex-direction:column;gap:12px">${h}</div><div aria-hidden="true" style="display:flex;flex-direction:column;gap:12px">${h}</div></div></div>`; }).join('')}</div>
    <div style="text-align:center;margin-top:20px"><a class="more" target="_blank" rel="noopener" href="https://www.google.com/maps/place/Magic+Beauty+Mexico/data=!4m2!3m1!1s0x85cde099646589d9:0x116491de9ffad5f9">Ver todas las reseñas en Google</a></div>
  </section>`;
  };

  const detalle = () => `
  <section class="wrap sec" aria-labelledby="det-h">
    <h2 id="det-h" class="h2" style="margin-bottom:16px">Cada detalle diseñado para la clínica que quieres.</h2>
    <div class="det">
      <div class="dc rvl"><video src="media/det/oxygen.mp4" poster="media/det/oxygen.jpg" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video><div class="in"><h3>Oxígeno sin tanques. Todo el día.</h3><p>Generador de oxígeno integrado y NANOE™ X: un ambiente 99.9% libre de virus y patógenos.</p></div></div>
      <div class="dc rvl"><video src="media/det/ai.mp4" poster="media/det/ai.jpg" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video><div class="in"><h3>Inteligencia artificial donde la necesitas.</h3><p>Escáner con IA que define la depilación adecuada y analiza la piel para elegir el mejor tratamiento.</p></div></div>
      <div class="dc rvl"><video src="media/det/taller.mp4" poster="media/det/taller.jpg" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video><div class="in"><h3>Ensamblado y probado en México.</h3><p>Taller propio de diagnóstico y reparación. Cada equipo pasa pruebas de funcionamiento antes de enviarse.</p></div></div>
    </div>
  </section>`;

  const split = () => `
  <section class="wrap sec" id="demo" aria-label="Showroom y asesoría">
    <div class="split">
      <div class="sp blk rvl"><span class="k">Showroom</span><h2>Tócalo.<br>Pruébalo.<br>Decide.</h2><p>Visita nuestro showroom y taller en Cuernavaca, a unos 50 minutos de CDMX, y prueba cada equipo antes de llevarlo a tu clínica.</p><a class="btn btn-white" href="#" data-wa="Hola Magic Beauty, quiero agendar una visita a su showroom en Cuernavaca.">Agenda tu visita</a></div>
      <div class="sp gr rvl"><span class="k">Asesoría</span><h2>Alguien que sabe de clínicas, listo para ayudarte.</h2><p>Cuéntanos tu especialidad y tu espacio. Te decimos qué equipo Magic es para ti.</p><a class="btn btn-white" href="#" data-wa="Hola Magic Beauty, quiero asesoría para elegir el equipo ideal para mi clínica.">Chatear con un experto</a></div>
    </div>
    <div class="news rvl">
      <div><h2>Magic newsletter</h2><p>Suscríbete y entérate primero de promociones, lanzamientos y protocolos para hacer crecer tu clínica.</p></div>
      <form id="newsForm" novalidate><label class="sr" for="newsEmail">Email</label><input id="newsEmail" type="email" placeholder="Email" autocomplete="email" required><button type="submit">Suscribirme</button><p class="form-msg" role="status" aria-live="polite"></p></form>
    </div>
  </section>`;

  const footer = () => `
  <footer class="foot">
    <div class="wrap">
      <div class="foot-g">
        <div><img class="logo" src="media/logo-white.png" alt="Magic Beauty México">
          <p>Magic Beauty México. Showroom y taller en Cuernavaca, Morelos.</p>
          <a class="fpill" href="tel:+527772633238">Llámanos 777 263 3238</a>
          <p>Lunes a viernes de 9:30 a 18:30 h. Sábados de 9:30 a 14:00 h. WhatsApp 777 192 6310 · <a href="mailto:primercontacto@magic-beauty.com.mx">primercontacto@magic-beauty.com.mx</a></p>
          <div class="lbl">Síguenos</div>
          <a class="fpill" href="https://www.facebook.com/magicbeauty.mx" target="_blank" rel="noopener">Facebook</a><a class="fpill" href="https://www.instagram.com/magicbeauty_mx/" target="_blank" rel="noopener">Instagram</a>
          <div class="lbl">Formas de pago</div>
          <span class="fpill" style="cursor:default">Contado</span><span class="fpill" style="cursor:default">MSI*</span><span class="fpill" style="cursor:default">Crédito deducible</span>
        </div>
        <div><h4>Equipos</h4><ul>${D.categories.map(c => `<li><a href="${MBL.cat(c.cc)}">${c.name}</a></li>`).join('')}<li><a href="${MBL.equipos}">Todos los equipos</a></li></ul></div>
        <div><h4>Magic</h4><ul><li><a href="#lanzamiento">Lanzamiento</a></li><li><a href="#reels">Reels</a></li><li><a href="#resenas">Reseñas</a></li><li><a href="https://www.magic-beauty.com.mx/blog" target="_blank" rel="noopener">Blog</a></li></ul></div>
        <div><h4>Ayuda</h4><ul><li><a href="#garantias">Garantía y soporte</a></li><li><a href="#garantias">Financiamiento</a></li><li><a href="#demo">Showroom</a></li><li><a href="#" data-wa="Hola Magic Beauty, necesito soporte con mi equipo.">Soporte técnico</a></li></ul></div>
        <div><h4>Legales</h4><ul><li><a href="https://www.magic-beauty.com.mx/" target="_blank" rel="noopener">Aviso de privacidad</a></li><li><a href="https://www.magic-beauty.com.mx/" target="_blank" rel="noopener">Términos y condiciones</a></li></ul></div>
      </div>
      <div class="leg">Legales<br>¹ +8,200 equipos instalados y +80 equipos disponibles según magic-beauty.com.mx. ² Calificación 4.8 con 182 reseñas en Google Maps, consultada en noviembre de 2026; reseñas citadas textualmente. ³ Testimonios en video publicados por Magic Beauty México en YouTube. *Meses sin intereses con tarjetas participantes; financiamiento sujeto a aprobación. © Magic Beauty México.</div>
    </div>
  </footer>`;

  window.MBS = { cats, launch, deals, banner, garantias, amb, coverflow, love, detalle, split, nice };
  window.renderFooter = el => { el.outerHTML = footer(); };
  window.renderSections = el => { el.innerHTML = cats() + launch() + deals() + banner() + garantias() + amb() + coverflow() + love() + detalle() + split(); el.insertAdjacentHTML('afterend', footer()); };
})();
