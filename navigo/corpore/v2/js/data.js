(function () {
  const $ = s => document.querySelector(s);
  // S8 tab panes: 3 cards per front + CTA card
  const fronts = [
    ['i-crane', 'Preventa y obra', 'Preventa / obra', 'PREVENTA', [['Entrega atrasada', ['Contrato', 'Pagos']], ['Cambios al proyecto', ['Folleto', 'Contrato']], ['Devolución de anticipo', ['Recibos', 'Contrato']]]],
    ['i-doc', 'Incumplimiento', 'Incumplimiento contractual', 'CONTRATOS', [['La otra parte no cumplió', ['Contrato', 'Mensajes']], ['Quiero rescindir', ['Contrato', 'Pagos']], ['Penas convencionales', ['Contrato', 'Fechas']]]],
    ['i-pen', 'Escrituración', 'Incumplimiento contractual', 'ESCRITURACIÓN', [['No me escrituran', ['Contrato', 'Pagos']], ['No me entregan', ['Contrato', 'Avisos']], ['Datos con errores', ['Escritura', 'Contrato']]]],
    ['i-key', 'Arrendamiento', 'Arrendamiento / posesión', 'ARRENDAMIENTO', [['Rentas sin pagar', ['Contrato', 'Recibos']], ['No desocupa', ['Contrato', 'Avisos']], ['Contrato vencido', ['Contrato', 'Mensajes']]]],
    ['i-home', 'Posesión', 'Recuperación de inmueble', 'POSESIÓN', [['Inmueble ocupado', ['Título', 'Fotos']], ['Defender la posesión', ['Título', 'Pagos']], ['Recuperar mi propiedad', ['Título', 'Avisos']]]],
    ['i-family', 'Sucesiones', 'Sucesión / adjudicación', 'SUCESIONES', [['Sin testamento', ['Actas', 'Título']], ['Con testamento', ['Testamento', 'Título']], ['Desacuerdo entre herederos', ['Actas', 'Título']]]],
    ['i-question', 'No estoy seguro/a', 'No estoy seguro/a', 'POR DEFINIR', [['Algo no cuadra', ['Lo que tengas']], ['Me llegó una notificación', ['Notificación']], ['Tengo un plazo urgente', ['Fechas']]]],
  ];
  const g = $('#mgrid');
  if (g) {
    g.innerHTML = fronts.map(([ic, lab, tipo, wm, cards], i) => `<div class="mpane${i ? '' : ' on'}">` + cards.map(([n, chips]) => `<div class="mc"><figure><span class="tm"><svg><use href="#${ic}"/></svg><small>${lab}</small><b>${n}</b></span><a class="pc__ov" href="#" data-lead data-ftipo="${tipo}">Revisar esta situación</a></figure><p class="mc__n">${n}</p><p class="ver"><svg><use href="#badge"/></svg><span><strong>Revisión</strong> individual</span></p><p class="role"><svg><use href="#${ic}"/></svg>${lab}</p><p class="lab">Lleva a la cita</p><div class="chips">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div><p class="prev">Frente</p><p class="wm">${wm}</p></div>`).join('') + '</div>').join('') +
      `<div class="mcta"><div class="mcta__deco"></div><img class="mcta__mark" src="img/mark-white-96.png" alt="" width="48" height="48"><p>Cita con reserva de $500 MXN</p><span>Se descuenta de tu cuenta final o se reembolsa si no contratas</span><a class="btn" href="#" data-lead>Solicitar revisión de mi caso</a></div>`;
  }
  // S9 groups (Compradores / Propietarios / Herederos)
  const groups = [
    [['Entrega atrasada en preventa', 'El desarrollador no entrega en la fecha pactada.', 'FRENTE 4', 'Preventa / obra'], ['Cambios a lo prometido', 'Metros, acabados o amenidades distintos a lo pactado.', 'FRENTE 4', 'Preventa / obra'], ['Rescindir y recuperar pagos', 'Quieres terminar el contrato y pedir la devolución.', 'FRENTE 1', 'Incumplimiento contractual'], ['No me escrituran', 'Pagaste el inmueble y la escritura no avanza.', 'FRENTE 1', 'Incumplimiento contractual'], ['Defectos de construcción', 'La obra entregada no corresponde a lo acordado.', 'FRENTE 4', 'Preventa / obra'], ['Apartado sin contrato claro', 'Diste un anticipo y no hay documento firmado.', 'FRENTE 1', 'Incumplimiento contractual']],
    [['Tu inquilino no paga', 'Rentas vencidas y un contrato de arrendamiento vigente.', 'FRENTE 2', 'Arrendamiento / posesión'], ['No desocupa al terminar', 'El contrato terminó y el inmueble sigue ocupado.', 'FRENTE 2', 'Arrendamiento / posesión'], ['Alguien ocupa tu inmueble', 'Una persona sin derecho está en tu propiedad.', 'FRENTE 2', 'Recuperación de inmueble'], ['El comprador no cumplió', 'Vendiste y la otra parte no pagó o no firmó.', 'FRENTE 1', 'Incumplimiento contractual'], ['Compraventa detenida', 'El contrato existe pero la operación no se concreta.', 'FRENTE 1', 'Incumplimiento contractual'], ['Problemas con el título', 'Dudas sobre la titularidad o el registro del inmueble.', 'FRENTE 3', 'Sucesión / adjudicación']],
    [['Falleció el titular sin testamento', 'Hay que definir a quién corresponde el inmueble.', 'FRENTE 3', 'Sucesión / adjudicación'], ['Hay testamento y falta adjudicar', 'El inmueble aún no está a nombre de quien hereda.', 'FRENTE 3', 'Sucesión / adjudicación'], ['Desacuerdo entre herederos', 'No hay acuerdo sobre vender, conservar o dividir.', 'FRENTE 3', 'Sucesión / adjudicación'], ['A nombre de otra persona', 'El inmueble no está a nombre de quien lo ocupa o pagó.', 'FRENTE 3', 'Sucesión / adjudicación'], ['Copropiedad en desacuerdo', 'Varios dueños y decisiones que no se pueden tomar.', 'FRENTE 3', 'Sucesión / adjudicación'], ['¿Sigo a tiempo?', 'No sabes si existe un plazo que ya está corriendo.', 'POR DEFINIR', 'No estoy seguro/a']],
  ];
  document.querySelectorAll('.sgrid[data-group]').forEach(el => {
    el.innerHTML = groups[+el.dataset.group].map(([n, d, m, t]) => `<a class="scard" href="#" data-lead data-ftipo="${t}"><span class="meta">${m}</span><h4>${n}</h4><p>${d}</p><span class="go">Revisar esta situación →</span></a>`).join('');
  });
  // S16 coverage accordion
  const alc = ['Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa', 'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'La Magdalena Contreras', 'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco', 'Estado de México', 'Otra'];
  const row = (n, i) => {
    const label = n === 'Estado de México' ? 'Estado de México · zona metropolitana' : n === 'Otra' ? 'Otra ubicación' : n;
    const body = n === 'Otra'
      ? `<p>Atendemos inmuebles en CDMX y zona metropolitana. Si tu inmueble está en otro estado, primero te confirmamos si podemos revisarlo.</p><a href="#" data-lead data-fubicacion="Otra">Consultar mi caso →</a>`
      : [['Preventa y obra', 'Preventa / obra'], ['Incumplimiento de contrato', 'Incumplimiento contractual'], ['Arrendamiento y posesión', 'Arrendamiento / posesión'], ['Sucesiones y propiedad', 'Sucesión / adjudicación']].map(([l, t]) => `<a href="#" data-lead data-ftipo="${t}" data-fubicacion="${n}">${l}</a>`).join('');
    return `<div class="ci"><button class="ci__b" aria-expanded="false"><h3>${label}</h3><svg><use href="#plus"/></svg></button><div class="ci__c"><div class="ci__l">${body}</div></div></div>`;
  };
  const a = document.querySelector('.cpanel__col[data-cat="a"]'), b = document.querySelector('.cpanel__col[data-cat="b"]');
  if (a && b) { a.innerHTML = alc.slice(0, 9).map(row).join(''); b.innerHTML = alc.slice(9).map(row).join(''); }
  const cov = document.querySelector('.catalog'); if (cov) cov.id = 'cobertura';
  // footer situations (3 cols)
  const f3 = $('#foot3');
  if (f3) { const all = groups.flat().map(x => x[0]); f3.innerHTML = [0, 1, 2].map(k => `<div class="foot__l">${all.slice(k * 6, k * 6 + 6).map(n => `<a href="#" data-lead>${n}</a>`).join('')}</div>`).join(''); }
})();
