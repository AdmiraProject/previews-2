// Catálogo "Equipos": los 74 equipos de magic-beauty.com.mx/equipos con filtro por categoría (categorías reales del sitio).
(() => {
  const D = window.MB, C = window.MB_CAT, S = window.MBS;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // une el catálogo con los 21 equipos que ya tienen página de producto propia
  C.items.forEach(it => {
    const p = D.products.find(x => x.id === it.id);
    if (p) Object.assign(p, { cats: it.cats, desc: it.desc });
    else D.products.push({ id: it.id, name: it.name, cats: it.cats, desc: it.desc, img: it.img, ext: it.url });
  });
  const FEAT = ['hypercare', 'hypercare-duo', 'cryo4d', 'hairmax-4k'];
  const all = C.items.map(it => D.products.find(p => p.id === it.id));
  const dest = [...FEAT.map(id => all.find(p => p.id === id)), ...all.filter(p => !p.ext && !FEAT.includes(p.id)), ...all.filter(p => p.ext)];
  const N = all.length;
  const chip = (id, label, n) => `<button class="eq-chip" data-f="${id}" aria-pressed="false">${esc(label)}<small>${n}</small></button>`;
  const ICO = {
    inst: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.4-.4-2.6 2.4-2.4Z"/></svg>',
    msi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M2.5 10h19M6 14.5h4"/></svg>',
    sup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 13v-2a7 7 0 0 1 14 0v2"/><rect x="3" y="12.5" width="4" height="6" rx="1.5"/><rect x="17" y="12.5" width="4" height="6" rx="1.5"/></svg>'
  };

  $('#catalog').innerHTML = `
  <section class="wrap eq-hero" aria-labelledby="eq-h">
    <nav class="crumb" aria-label="Ruta"><a href="index.html">Inicio</a><span aria-hidden="true">/</span><span aria-current="page">Equipos</span></nav>
    <div class="eq-hd">
      <div><h1 id="eq-h">Todos los equipos</h1>
        <p class="sub">${N} equipos médico-estéticos para clínicas, spas y consultorios. Cotiza cualquiera y agenda una llamada con un especialista Magic.</p></div>
      <ul class="eq-usp"><li>${ICO.inst}<span><b>Instalación incluida*</b>Y capacitación en tu clínica</span></li><li>${ICO.msi}<span><b>Hasta 24 MSI*</b>O financiamiento a 48 meses</span></li><li>${ICO.sup}<span><b>Soporte de por vida</b>Taller propio en Cuernavaca</span></li></ul>
    </div>
  </section>
  <div class="eq-bar" id="eqBar">
    <div class="wrap eq-bar-in">
      <div class="eq-chips" id="eqChips" role="group" aria-label="Filtrar por categoría">${chip('all', 'Todos', N)}${C.cats.map(c => chip(c.id, c.short, c.n)).join('')}</div><button class="eq-nx" id="eqNx" aria-label="Más categorías">›</button>
      <div class="eq-tools"><span id="eqCount" aria-live="polite"></span>
        <label class="eq-sort"><span class="sr">Ordenar</span><select id="eqSort"><option value="dest">Destacados</option><option value="az">Nombre A–Z</option></select></label></div>
    </div>
  </div>
  <section class="deals eq-list" aria-label="Equipos">
    <div class="wrap">
      <div class="eq-cap" id="eqCap"></div>
      <div class="fd-row all" id="eqGrid">${dest.map(window.fdCard).join('')}</div>
      <p class="legal">*Meses sin intereses con tarjetas participantes. Financiamiento hasta 48 meses con enganche desde 10%, sujeto a aprobación (buró de crédito e ingresos comprobables); deducible de IVA/ISR excepto RESICO. *Apartado con 30%: congela el precio hasta 90 días. *Instalación sin costo, solo viáticos. Calificación 4.8 con 182 reseñas de Magic Beauty en Google. Catálogo y fotografías de producto reales de magic-beauty.com.mx.</p>
    </div>
  </section>
  ${S.banner()}${S.garantias()}${S.amb()}${S.love()}${S.detalle()}${S.split()}`;

  /* ---------- filtro + orden ---------- */
  const grid = $('#eqGrid'), cards = id => $('#p-' + CSS.escape(id), grid);
  const qs = new URLSearchParams(location.search);
  let cur = C.cats.some(c => c.id === qs.get('cat')) ? qs.get('cat') : 'all';
  function apply(scroll) {
    const list = cur === 'all' ? all : all.filter(p => p.cats.includes(cur));
    all.forEach(p => { cards(p.id).hidden = !list.includes(p); });
    $$('.eq-chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === cur));
    const c = C.cats.find(x => x.id === cur);
    $('#eqCount').textContent = `${list.length} equipo${list.length === 1 ? '' : 's'}`;
    $('#eqCap').innerHTML = c ? `<h2>${esc(c.name)}</h2><button class="eq-clear" data-f="all">Ver todos los equipos</button>` : '';
    const on = $(`.eq-chip[data-f="${cur}"]`); on.parentNode.scrollTo({ left: Math.max(0, on.offsetLeft - 40), behavior: scroll ? 'smooth' : 'auto' });
    const u = new URL(location.href); cur === 'all' ? u.searchParams.delete('cat') : u.searchParams.set('cat', cur); history.replaceState(null, '', u);
    if (scroll) {
      // primero recalcula los triggers (la altura cambió) y luego sube a la rejilla
      window.ScrollTrigger && ScrollTrigger.refresh();
      const off = innerWidth < 768 ? -150 : -112;
      if ($('.eq-list').getBoundingClientRect().top < -off) window.MBQ.goTo($('.eq-list'), off);
      if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo($$('.fd:not([hidden])', grid).slice(0, 12), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .45, stagger: .03, ease: 'power2.out', clearProps: 'all' });
    }
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { cur = b.dataset.f; apply(true); } });
  $('#eqSort').onchange = e => {
    const by = e.target.value === 'az' ? [...all].sort((a, b) => S.nice(a.name).localeCompare(S.nice(b.name), 'es')) : dest;
    by.forEach(p => grid.appendChild(cards(p.id)));
  };
  const ch = $('#eqChips'), nx = $('#eqNx');
  const edge = () => nx.classList.toggle('end', ch.scrollLeft + ch.clientWidth >= ch.scrollWidth - 4);
  nx.onclick = () => ch.scrollBy({ left: nx.classList.contains('end') ? -ch.scrollWidth : 320, behavior: 'smooth' });
  ch.addEventListener('scroll', edge, { passive: true });
  apply(false);
  edge();
  const bar = $('#eqBar'); new IntersectionObserver(([e]) => bar.classList.toggle('stuck', e.intersectionRatio < 1), { rootMargin: '-49px 0px 0px 0px', threshold: 1 }).observe(bar);
})();
