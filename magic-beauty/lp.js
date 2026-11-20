// Landings SKAG de producto: el contenido viene en el HTML (relevancia para Google); aquí solo lo dinámico.
(() => {
  const D = window.MB, C = window.MB_CAT, $ = s => document.querySelector(s);
  // une el catálogo para que "Cotizar" muestre nombre e imagen de cualquiera de los 74 equipos
  C.items.forEach(it => { if (!D.products.some(p => p.id === it.id)) D.products.push({ id: it.id, name: it.name, cats: it.cats, img: it.img, ext: it.url }); });
  const love = $('#lpLove'); if (love) love.outerHTML = window.MBS.love();
  // galería: miniaturas cambian la foto principal
  const img = $('#skImg');
  document.querySelectorAll('.sk-th button').forEach(b => b.addEventListener('click', () => {
    img.src = b.dataset.i; document.querySelectorAll('.sk-th button').forEach(x => x.removeAttribute('aria-current')); b.setAttribute('aria-current', 'true');
  }));
  // barra fija con el CTA cuando el botón principal sale de pantalla
  const bar = $('#skBar'), main = $('.sk-b');
  if (bar && main) new IntersectionObserver(([e]) => bar.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(main);
})();
