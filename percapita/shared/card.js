/* Percapita card component — shared by v1/v2/v3.
   PC.card(finish, {face:'front'|'back'|'both'}) returns an HTML string.
   Finishes are concept designs (see BRIEF.md · VALIDAR). Network mark = Mastercard (from Percapita's own card art). */
(function () {
  const MARK = `<svg class="pc-mark" viewBox="-1 -1 52 49" aria-hidden="true">
    <path class="m1" d="M30.4658 47L49.9826 35.5756L19.1217 18.0674C19.1217 18.0674 17.3846 17.6108 15.7615 18.6584C14.1348 19.7025 0.683438 27.5983 0.683438 27.5983C0.683438 27.5983 -0.498317 28.5893 0.252739 29.6935L30.4658 47Z"/>
    <path class="m2" d="M49.979 35.5756C49.979 35.5756 49.6658 2.31815 49.6052 1.04051C49.5483 -0.237123 47.5692 0.0212349 47.5692 0.0212349C47.5692 0.0212349 31.8042 9.28321 30.9606 9.71145C30.2202 10.0866 30.0351 11.4633 30.0351 11.4633L30.1276 24.3211"/>
    <path class="m3" d="M30.1312 24.3211L30.4658 47L49.979 35.5756L30.1312 24.3211Z"/></svg>`;
  const CHIP = `<svg class="pc-chip" viewBox="0 0 50 38" aria-hidden="true"><defs>
    <linearGradient id="chipg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f1e4"/><stop offset=".35" stop-color="#cfc6b0"/><stop offset=".6" stop-color="#efe8d6"/><stop offset="1" stop-color="#a99f88"/></linearGradient></defs>
    <rect x=".5" y=".5" width="49" height="37" rx="7" fill="url(#chipg)" stroke="rgba(0,0,0,.18)"/>
    <path d="M17 .5v11.5a4 4 0 0 1-4 4H.5M33 .5v11.5a4 4 0 0 0 4 4h12.5M17 37.5V26a4 4 0 0 0-4-4H.5M33 37.5V26a4 4 0 0 1 4-4h12.5M17 16h16v6H17z" fill="none" stroke="rgba(60,50,30,.35)" stroke-width="1"/></svg>`;
  const NFC = `<svg class="pc-nfc" viewBox="0 0 20 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8.5a6 6 0 0 1 0 7"/><path d="M7.5 5.5a11 11 0 0 1 0 13"/><path d="M12 2.5a16 16 0 0 1 0 19"/></g></svg>`;
  const MC = `<span class="pc-mc" aria-label="Mastercard"><i></i><i></i></span>`;

  const FINISHES = {
    abismo:  { n: '01', name: 'Abismo',  desc: 'Negro azulado mate, grabado láser' },
    glaciar: { n: '02', name: 'Glaciar', desc: 'Blanco porcelana, mate suave' },
    cobalto: { n: '03', name: 'Cobalto', desc: 'Azul Percapita, brillo anodizado' },
    cielo:   { n: '04', name: 'Cielo',   desc: 'Cian líquido, degradado iridiscente' },
    titanio: { n: '05', name: 'Titanio', desc: 'Espejo cepillado, acero pulido' },
    aurora:  { n: '06', name: 'Aurora',  desc: 'Amanecer: azul noche a coral' },
  };

  function front(f) {
    return `<div class="pc-face pc-front">
      <span class="pc-tex"></span><span class="pc-sheen"></span>
      <span class="pc-brand">${MARK}<span class="pc-word"></span></span>
      ${CHIP}${NFC}
      <span class="pc-last">•••• 0414</span>
      ${MC}
    </div>`;
  }
  function back(f) {
    return `<div class="pc-face pc-back">
      <span class="pc-tex"></span><span class="pc-sheen"></span>
      <span class="pc-name">MARIANA LÓPEZ</span>
      <span class="pc-tap">${NFC}<b>TOCA PARA PAGAR</b></span>
      <span class="pc-num">5427 0921 8830 0414</span>
      <span class="pc-meta"><span>CVV •••</span><span>VENCE 11/30</span></span>
      <span class="pc-fine">Emitida por Probenso Group, S.A., SOFOM, E.N.R. Esta tarjeta es propiedad del emisor — si la encuentras, llama al 33 3616 8059.</span>
      <span class="pc-kind">CRÉDITO</span>${MC}
    </div>`;
  }
  function card(finish, opts = {}) {
    const face = opts.face || 'front';
    const cls = `pc-card f-${finish} ${opts.cls || ''}`;
    if (face === 'both') return `<div class="${cls} pc-3d">${front(finish)}${back(finish)}</div>`;
    return `<div class="${cls}">${face === 'back' ? back(finish) : front(finish)}</div>`;
  }
  window.PC = { card, FINISHES, MARK, ORDER: Object.keys(FINISHES) };
  // auto-mount: <div data-pc-card="abismo" data-face="both"></div>
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-pc-card]').forEach(el => {
      el.outerHTML = card(el.dataset.pcCard, { face: el.dataset.face, cls: el.className });
    });
  });
})();
