/* Percapita activation flow — front-end prototype. No network calls: validation, CURP/RFC derivation and checks are simulated. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = (() => { try { return JSON.parse(sessionStorage.getItem('pc-flow') || '{}'); } catch { return {}; } })();
  const save = () => { try { sessionStorage.setItem('pc-flow', JSON.stringify(store)); } catch {} };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const I = {
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c.7-4 3.4-6.2 7-6.2s6.3 2.2 7 6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 6.5l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    id: '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8.5" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.8 15.5c.5-1.4 1.5-2.1 2.7-2.1s2.2.7 2.7 2.1M14 10h4M14 13h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-6.5 8 6.5M6.5 9.5V19.5h11V9.5M10 19.5v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3.5l7 2.6v5.4c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6.1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="7.8" r="1.1" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 16 16"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    back: '<svg width="14" height="14" viewBox="0 0 16 16"><path d="M13.5 8H3.3M7.3 3.6 2.9 8l4.4 4.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  };

  const ESTADOS = [['Aguascalientes', 'AS'], ['Baja California', 'BC'], ['Baja California Sur', 'BS'], ['Campeche', 'CC'], ['Chiapas', 'CS'], ['Chihuahua', 'CH'], ['Ciudad de México', 'DF'], ['Coahuila', 'CL'], ['Colima', 'CM'], ['Durango', 'DG'], ['Guanajuato', 'GT'], ['Guerrero', 'GR'], ['Hidalgo', 'HG'], ['Jalisco', 'JC'], ['Estado de México', 'MC'], ['Michoacán', 'MN'], ['Morelos', 'MS'], ['Nayarit', 'NT'], ['Nuevo León', 'NL'], ['Oaxaca', 'OC'], ['Puebla', 'PL'], ['Querétaro', 'QT'], ['Quintana Roo', 'QR'], ['San Luis Potosí', 'SP'], ['Sinaloa', 'SL'], ['Sonora', 'SR'], ['Tabasco', 'TC'], ['Tamaulipas', 'TS'], ['Tlaxcala', 'TL'], ['Veracruz', 'VZ'], ['Yucatán', 'YN'], ['Zacatecas', 'ZS'], ['Nací en el extranjero', 'NE']];
  // Example postal-code table for the prototype (Guadalajara metro). Unknown CPs fall back to manual capture.
  const CP = {
    '44': { estado: 'Jalisco', municipio: 'Guadalajara', ciudad: 'Guadalajara', colonias: ['Americana', 'Centro', 'Ladrón de Guevara', 'Lafayette', 'Providencia', 'Santa Teresita', 'Chapalita', 'Jardines del Bosque', 'Oblatos'] },
    '45': { estado: 'Jalisco', municipio: 'Zapopan', ciudad: 'Zapopan', colonias: ['Ciudad Granja', 'Jardines Universidad', 'Las Águilas', 'Puerta de Hierro', 'Seattle', 'Zapopan Centro'] },
  };

  /* ---------- screens ---------- */
  const PHASES = ['Cuenta', 'Datos', 'Verificación', 'Preaprobación'];
  const S = {
    crear:     { phase: 0, img: ['stock/step1.jpg', '12% 50%'], cap: 'Tu crédito con propósito' },
    correo:    { phase: 0, img: ['stock/step1.jpg', '12% 50%'], cap: 'Revisa tu correo' },
    entrar:    { phase: 0, img: ['v3-hero-hand.jpg', '60% 50%'], cap: 'Tu crédito con propósito', noProg: true },
    datos:     { phase: 1, img: ['stock/story1.jpg', '50% 40%'], cap: 'Datos básicos en 5 min' },
    confirma:  { phase: 1, img: ['stock/step2.jpg', '46% 50%'], cap: 'Con tu INE desde el celular' },
    revisando: { phase: 1, img: ['stock/full1.jpg', '38% 50%'], cap: 'Revisando tu información' },
    domicilio: { phase: 1, img: ['stock/story3.jpg', '50% 40%'], cap: 'Tu hogar, tu domicilio' },
    verifica:  { phase: 2, img: ['stock/story2.jpg', '50% 40%'], cap: 'Último paso' },
    listo:     { phase: 3, img: ['stock/step3.jpg', '74% 50%'], cap: 'Tarjeta de Crédito Percapita' },
  };
  const ORDER = ['crear', 'correo', 'entrar', 'datos', 'confirma', 'revisando', 'domicilio', 'verifica', 'listo'];
  const PROG = ['crear', 'correo', 'datos', 'confirma', 'revisando', 'domicilio', 'verifica', 'listo']; // segments (login is a side door)

  const field = (id, label, inner, extra = '') => `<div class="f" data-f="${id}"><label for="${id}">${label}</label>${inner}${extra}</div>`;
  const input = (id, o = {}) => `<div class="in ${o.cls || ''}"><input id="${id}" name="${id}" type="${o.type || 'text'}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} value="${esc(store[id] ?? o.val ?? '')}" ${o.attrs || ''}>${o.after || ''}</div>`;
  const select = (id, opts, ph) => `<div class="in"><select id="${id}" name="${id}" required><option value="" disabled ${store[id] ? '' : 'selected'}>${ph}</option>${opts.map(o => `<option ${store[id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${I.chev}</div>`;
  const msg = t => `<p class="msg">${t}</p>`;
  const back = to => `<button type="button" class="back" data-go="${to}">${I.back}Atrás</button>`;
  const note = (t, cls = '', icon = I.info) => `<div class="note ${cls}">${icon}<div>${t}</div></div>`;
  const SAFE = note('<b>Tu información está siempre segura.</b><br>Estamos supervisados por CONDUSEF y cumplimos con la ley de protección de datos. <a href="https://percapita.mx/aviso-de-privacidad" target="_blank" rel="noopener">Conoce más</a>');

  const VIEW = {
    crear: () => `
      <div class="ico">${I.user}</div>
      <h1><b>Crea tu cuenta</b> para conocer el detalle de tu tarjeta</h1>
      <p class="lead">Consulta tus pagos y protege tu información.</p>
      <form novalidate>
        ${field('email', 'Correo', input('email', { type: 'email', ph: 'nombre@correo.com', attrs: 'autocomplete="email"' }), msg('Escribe un correo válido'))}
        ${field('pass', 'Contraseña', input('pass', { type: 'password', attrs: 'autocomplete="new-password"', after: `<button type="button" class="eye" data-eye="pass" aria-label="Mostrar contraseña">${I.eye}</button>`, val: '' }), msg('Tu contraseña aún no cumple los requisitos'))}
        <div class="rules" id="rules"><p>Debe contener lo siguiente:</p><ul style="list-style:none;margin:0;padding:0">
          <li data-r="len"><i></i>Al menos 8 caracteres</li><li data-r="up"><i></i>Al menos una letra mayúscula</li><li data-r="lo"><i></i>Al menos una letra minúscula</li><li data-r="num"><i></i>Al menos un número</li></ul></div>
        ${field('pass2', 'Confirma tu contraseña', input('pass2', { type: 'password', ph: 'Confirma tu contraseña', attrs: 'autocomplete="new-password"', after: `<button type="button" class="eye" data-eye="pass2" aria-label="Mostrar contraseña">${I.eye}</button>`, val: '' }), msg('Las contraseñas no coinciden'))}
        <p class="fine">Al crear tu cuenta aceptas nuestro <a href="https://percapita.mx/aviso-de-privacidad" target="_blank" rel="noopener">Aviso de Privacidad</a>. Usaremos tus datos solo para gestionar tu solicitud de tarjeta de crédito.</p>
        ${note('Te pediremos tu ubicación para validar tu identidad. Si tu navegador te pregunta, elige “Permitir”.', '', I.pin)}
        <button class="btn" type="submit">Crear mi cuenta</button>
      </form>
      <p class="alt">¿Ya tienes cuenta? <a href="#/entrar">Inicia sesión</a></p>`,

    correo: () => `
      <div class="ico">${I.mail}</div>
      <h1>Revisa tu correo electrónico</h1>
      <p class="lead">Enviamos un correo de confirmación a <span class="mail">${esc(store.email || 'nombre@correo.com')}</span>. Haz clic en el enlace para activar tu cuenta y regresa aquí para iniciar sesión.</p>
      <ol class="steps">
        <li><span>Revisa tu bandeja de entrada en <span class="mail">${esc(store.email || 'nombre@correo.com')}</span></span></li>
        <li><span>Busca el correo con asunto “Confirma tu cuenta”</span></li>
        <li><span>Haz clic en el enlace de activación</span></li>
      </ol>
      ${note('<b>Nota:</b> si no encuentras el correo, revisa tu carpeta de spam o correo no deseado. Puede tardar unos minutos en llegar.', 'warn')}
      <div class="stack"><a class="btn" href="#/entrar">Ya confirmé, iniciar sesión</a><button type="button" class="btn sec" id="resend" aria-disabled="true">Reenviar en <span class="cd">10:00</span></button></div>
      <button type="button" class="back" data-go="entrar">${I.back}Volver al inicio de sesión</button>`,

    entrar: () => `
      <div class="ico">${I.user}</div>
      <h1>Iniciar sesión</h1>
      <p class="lead">Ingresa para continuar con tu solicitud de Tarjeta Percapita.</p>
      <form novalidate>
        ${field('email', 'Correo', input('email', { type: 'email', ph: 'nombre@correo.com', attrs: 'autocomplete="email"' }), msg('Escribe un correo válido'))}
        <div class="f" data-f="lpass"><label for="lpass">Contraseña <a href="#" data-toast="Te enviaremos un enlace para restablecer tu contraseña.">¿Olvidaste tu contraseña?</a></label>${input('lpass', { type: 'password', attrs: 'autocomplete="current-password"', after: `<button type="button" class="eye" data-eye="lpass" aria-label="Mostrar contraseña">${I.eye}</button>`, val: '' })}${msg('Escribe tu contraseña')}</div>
        ${SAFE}
        <button class="btn" type="submit">Iniciar sesión</button>
      </form>
      <p class="alt">¿No tienes cuenta? <a href="#/crear">Regístrate aquí</a></p>`,

    datos: () => `
      <div class="ico">${I.id}</div>
      <h1>Ingresa tu información personal</h1>
      <p class="lead">Asegúrate de que tus datos coincidan con tu INE.</p>
      <form novalidate>
        ${field('nombre', 'Nombre(s)', input('nombre', { cls: 'upper', ph: 'Como aparece en tu INE', attrs: 'autocomplete="given-name"' }), '<p class="hint">Tu(s) nombre(s) completo(s) como aparecen en tu identificación oficial (INE o pasaporte).</p>' + msg('Escribe tu nombre, solo letras'))}
        ${field('ap1', 'Primer apellido', input('ap1', { cls: 'upper', attrs: 'autocomplete="family-name"' }), msg('Escribe tu primer apellido, solo letras'))}
        ${field('ap2', 'Segundo apellido', input('ap2', { cls: 'upper' }), '<p class="hint">Solo letras, espacios, apóstrofo y guion.</p>' + msg('Solo letras, espacios, apóstrofo y guion'))}
        ${field('nac', 'Fecha de nacimiento', input('nac', { type: 'date', attrs: 'autocomplete="bday" max="2008-12-31"' }), '<p class="hint">Debes ser mayor de 18 años.</p>' + msg('Debes ser mayor de 18 años'))}
        ${field('edo', 'Estado donde naciste', select('edo', ESTADOS.map(e => e[0]), 'Selecciona tu estado'), msg('Selecciona tu estado de nacimiento'))}
        <div class="f" data-f="sexo"><span class="lab">Sexo</span><div class="chips">${['Mujer', 'Hombre'].map(v => `<label><input type="radio" name="sexo" value="${v}" ${store.sexo === v ? 'checked' : ''}><span>${v}</span></label>`).join('')}</div>${msg('Selecciona una opción')}</div>
        ${field('civil', 'Estado civil', select('civil', ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)'], 'Selecciona tu estado civil'), msg('Selecciona tu estado civil'))}
        ${SAFE}
        <button class="btn" type="submit">Continuar</button>
      </form>
      ${back('entrar')}`,

    confirma: () => {
      const c = curpBase(); const rfc = store.rfc || c.slice(0, 10);
      return `
      <div class="ico">${I.id}</div>
      <h1>Confirma tu información</h1>
      <p class="lead">Verifica que tu CURP y tu número de INE sean correctos antes de continuar.</p>
      <form novalidate>
        <div class="f" data-f="curp"><span class="lab"><label for="curpb">CURP</label><button type="button" class="lab-act" data-edit="curpb">Editar CURP</button></span>
          <div class="curp"><div class="in mono ro"><input id="curpb" value="${esc(store.curpb || c)}" readonly maxlength="16" aria-label="CURP (primeros 16 caracteres)"></div><div class="in mono tail"><input id="curpt" value="${esc(store.curpt || '')}" maxlength="2" placeholder="00" aria-label="Últimos 2 caracteres de tu CURP" autocomplete="off"></div></div>
          <p class="hint">Captura los <b>últimos 2 caracteres</b> de tu CURP en el recuadro de la derecha.</p>${msg('Captura los 2 caracteres finales de tu CURP')}</div>
        <div class="f" data-f="rfc"><span class="lab"><label for="rfc">RFC</label><button type="button" class="lab-act" data-edit="rfc">Editar RFC</button></span>${input('rfc', { cls: 'mono ro', val: rfc, attrs: 'readonly maxlength="13"' })}${msg('Revisa tu RFC')}</div>
        <div class="f" data-f="ine"><span class="lab"><label for="ine">Número de identificación de INE</label><button type="button" class="lab-act" id="ineq">¿Cuál es?</button></span>
          <div class="pop" id="inepop" hidden>Es el número de identificación que aparece al reverso de tu credencial para votar.</div>
          ${input('ine', { cls: 'mono', ph: '000000000', attrs: 'inputmode="numeric" maxlength="13" autocomplete="off"' })}${msg('Escribe el número de identificación de tu INE (9 a 13 dígitos)')}</div>
        ${note('Puedes encontrar tu CURP en tu INE, acta de nacimiento o comprobante del RENAPO.')}
        <button class="btn" type="submit">Continuar</button>
      </form>
      ${back('datos')}`;
    },

    revisando: () => `
      <div class="big-spin" id="bigst"></div>
      <h1 id="revh">Revisando tu información…</h1>
      <p class="lead">Estamos validando tu información. Esto puede tardar unos segundos.</p>
      <ul class="checks">
        <li><span class="st"></span><div><b>Validando edad</b><small data-d="edad"></small></div></li>
        <li><span class="st"></span><div><b>Validando estructura CURP</b><small data-d="curp"></small></div></li>
        <li><span class="st"></span><div><b>Verificando solicitudes previas</b><small data-d="prev"></small></div></li>
        <li><span class="st"></span><div><b>Validando CURP contra RENAPO</b><small data-d="renapo"></small></div></li>
        <li><span class="st"></span><div><b>Consultando listas de riesgo</b><small data-d="risk"></small></div></li>
      </ul>
      <div style="margin-top:32px"><a class="btn" id="revgo" href="#/domicilio" aria-disabled="true" tabindex="-1">Continuar</a></div>`,

    domicilio: () => `
      <div class="ico">${I.home}</div>
      <h1>¿Dónde vives?</h1>
      <p class="lead">Escribe tu código postal y completamos estado, municipio y ciudad por ti.</p>
      <form novalidate>
        ${field('viv', 'Tipo de vivienda', select('viv', ['Propia', 'Rentada', 'Familiar', 'Hipotecada'], 'Selecciona una opción'), msg('Selecciona el tipo de vivienda'))}
        ${field('cp', 'Código postal', input('cp', { ph: '00000', attrs: 'inputmode="numeric" maxlength="5" autocomplete="postal-code"' }), msg('Escribe un código postal de 5 dígitos'))}
        ${field('est', 'Estado', select('est', ESTADOS.slice(0, -1).map(e => e[0]), 'Selecciona tu estado'), msg('Selecciona tu estado'))}
        <div class="row2">
          ${field('mun', 'Municipio', input('mun', { ph: 'Municipio' }), msg('Requerido'))}
          ${field('ciu', 'Ciudad', input('ciu', { ph: 'Ciudad' }), msg('Requerido'))}
        </div>
        ${field('col', 'Colonia', `<div class="in"><select id="col" name="col"><option value="" disabled selected>Selecciona una colonia</option></select>${I.chev}</div>`, msg('Selecciona tu colonia'))}
        ${field('calle', 'Calle', input('calle', { ph: 'Nombre de la calle', attrs: 'autocomplete="address-line1"' }), msg('Escribe tu calle'))}
        <div class="row2">
          ${field('next', 'Número exterior', input('next', { ph: '123' }), msg('Requerido'))}
          ${field('nint', 'Número interior', input('nint', { ph: 'Opcional' }))}
        </div>
        ${field('ref', 'Referencia (opcional)', input('ref', { ph: 'Casa en la esquina con jardín' }))}
        <button class="btn" type="submit">Continuar</button>
      </form>
      ${back('datos')}`,

    verifica: () => `
      <div class="ico">${I.shield}</div>
      <h1>¡Último paso para conocer tu preaprobación!</h1>
      <p class="lead">Verifica tu identidad con un código que te enviamos por SMS.</p>
      <form novalidate>
        <div class="f" data-f="tel"><label for="tel">Teléfono celular</label><div class="phone">${input('tel', { cls: 'ro', ph: '33 0000 0000', attrs: 'readonly inputmode="tel" maxlength="12" autocomplete="tel-national"' })}<button type="button" class="btn sec" id="editTel">Editar número</button></div>${msg('Escribe un celular de 10 dígitos')}</div>
        <div class="f" data-f="otp"><span class="lab">Código de seguridad</span><div class="otp">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="Dígito ${i + 1}" autocomplete="${i ? 'off' : 'one-time-code'}">`).join('')}</div>${msg('Escribe los 6 dígitos del código')}
          <p class="hint">¿No recibiste el código? <button type="button" class="lab-act" id="otpre" disabled>Reenviar en <span class="cd">0:59</span></button></p></div>
        ${note('Al continuar, autorizas que Percapita realice la validación de tu número de celular.', 'warn')}
        <div class="f" data-f="tyc"><label class="chk"><input type="checkbox" id="tyc" ${store.tyc ? 'checked' : ''}><span>He leído y acepto los Términos y Condiciones del servicio. <a href="https://percapita.mx/terminos-y-condiciones" target="_blank" rel="noopener">Leer Términos y Condiciones</a></span></label>${msg('Acepta los Términos y Condiciones para continuar')}</div>
        <button class="btn" type="submit">Autorizar</button>
        <p class="hint" style="text-align:center;margin-top:12px">Prototipo: usa cualquier código de 6 dígitos.</p>
      </form>
      ${back('domicilio')}`,

    listo: () => `
      <div class="big-ok"></div>
      <h1>${store.nombre ? 'Recibimos tu solicitud, ' + esc(cap(store.nombre)) : 'Recibimos tu solicitud'}</h1>
      <p class="lead">Tu solicitud está en revisión. Te avisaremos por SMS y correo electrónico en cuanto tengamos tu respuesta.</p>
      <div class="res-card"><span class="res-tag">En revisión</span><div class="res-c"></div></div>
      <ul class="sum">
        <li><span>Cuenta</span><b>Creada</b></li>
        <li><span>Datos personales</span><b>Validados</b></li>
        <li><span>Domicilio</span><b>Registrado</b></li>
        <li><span>Celular</span><b>Verificado</b></li>
      </ul>
      <div class="stack"><a class="btn" href="../">Volver a Percapita</a><a class="btn sec" href="tel:+523336168059">Llamar a un asesor</a></div>`,
  };

  /* ---------- helpers ---------- */
  function cap(s) { return (s || '').toLowerCase().split(' ')[0].replace(/^./, c => c.toUpperCase()); }
  function strip(s) { return (s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/Ñ/g, 'X').replace(/[^A-Z ]/g, '').trim(); }
  function curpBase() {
    const skip = w => w.filter(x => !['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'MC', 'MAC', 'VAN', 'VON'].includes(x));
    let n = skip(strip(store.nombre).split(/\s+/)); if (n.length > 1 && ['JOSE', 'J', 'MARIA', 'MA', 'M'].includes(n[0])) n = n.slice(1);
    const a1 = skip(strip(store.ap1).split(/\s+/)).join('') || 'X', a2 = skip(strip(store.ap2).split(/\s+/)).join('') || 'X', nn = (n[0] || 'X');
    const vow = s => (s.slice(1).match(/[AEIOU]/) || ['X'])[0], con = s => (s.slice(1).match(/[^AEIOU]/) || ['X'])[0];
    const d = (store.nac || '2000-01-01').split('-');
    const ed = (ESTADOS.find(e => e[0] === store.edo) || ['', 'NE'])[1];
    return (a1[0] + vow(a1) + a2[0] + nn[0] + d[0].slice(2) + d[1] + d[2] + (store.sexo === 'Mujer' ? 'M' : 'H') + ed + con(a1) + con(a2) + con(nn)).slice(0, 16);
  }
  function setBad(f, bad) { const el = typeof f === 'string' ? $(`[data-f="${f}"]`) : f; if (el) el.classList.toggle('bad', !!bad); return !bad; }
  function toast(t) { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); } el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); }
  function busy(btn, ms, then) { btn.innerHTML = `<span class="spin"></span>${btn.textContent}`; btn.setAttribute('aria-disabled', 'true'); setTimeout(then, ms); }
  let timers = [];
  function countdown(el, secs, onEnd) { const t0 = Date.now(); const tick = () => { const left = Math.max(0, secs - Math.round((Date.now() - t0) / 1000)); el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (left === 0) { clearInterval(id); onEnd(); } }; const id = setInterval(tick, 1000); timers.push(id); tick(); }
  const LETTERS = /^[A-ZÁÉÍÓÚÜÑ' -]+$/i;
  const age = iso => { if (!iso) return -1; const b = new Date(iso + 'T00:00'), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };

  /* ---------- binders ---------- */
  const BIND = {
    crear(root) {
      const pw = $('#pass'), rules = { len: v => v.length >= 8, up: v => /[A-ZÁÉÍÓÚÑ]/.test(v), lo: v => /[a-záéíóúñ]/.test(v), num: v => /\d/.test(v) };
      const paint = (strict) => { const v = pw.value; $$('#rules li').forEach(li => { const ok = rules[li.dataset.r](v); li.classList.toggle('ok', ok); li.classList.toggle('no', strict && !ok); }); };
      pw.addEventListener('input', () => paint(false)); paint(false);
      $('form', root).onsubmit = e => {
        e.preventDefault();
        const email = $('#email').value.trim(), v = pw.value;
        const ok = [setBad('email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)), setBad('pass', !Object.values(rules).every(r => r(v))), setBad('pass2', !$('#pass2').value || $('#pass2').value !== v)].every(Boolean);
        paint(true);
        if (!ok) return ($('.bad input') || {}).focus?.();
        store.email = email; save(); busy($('button[type=submit]', root), 900, () => go('correo'));
      };
    },
    correo(root) { const b = $('#resend'); countdown($('.cd', b), 600, () => { b.removeAttribute('aria-disabled'); b.textContent = 'Reenviar correo'; }); b.onclick = () => { if (b.getAttribute('aria-disabled') === 'true') return; toast('Te reenviamos el correo de confirmación.'); }; },
    entrar(root) {
      $('form', root).onsubmit = e => {
        e.preventDefault(); const email = $('#email').value.trim();
        const ok = [setBad('email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)), setBad('lpass', !$('#lpass').value)].every(Boolean);
        if (!ok) return; store.email = email; save(); busy($('button[type=submit]', root), 900, () => go('datos'));
      };
    },
    datos(root) {
      $$('#nombre, #ap1, #ap2', root).forEach(i => i.addEventListener('input', () => { i.value = i.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g, ''); }));
      $('form', root).onsubmit = e => {
        e.preventDefault(); const v = id => $('#' + id).value.trim();
        const sexo = ($('input[name=sexo]:checked') || {}).value;
        const ok = [setBad('nombre', !LETTERS.test(v('nombre'))), setBad('ap1', !LETTERS.test(v('ap1'))), setBad('ap2', v('ap2') && !LETTERS.test(v('ap2'))), setBad('nac', age(v('nac')) < 18), setBad('edo', !v('edo')), setBad('sexo', !sexo), setBad('civil', !v('civil'))].every(Boolean);
        if (!ok) return ($('.bad input, .bad select') || {}).focus?.();
        Object.assign(store, { nombre: v('nombre').toUpperCase(), ap1: v('ap1').toUpperCase(), ap2: v('ap2').toUpperCase(), nac: v('nac'), edo: v('edo'), sexo, civil: v('civil') }); delete store.curpb; delete store.rfc; save();
        busy($('button[type=submit]', root), 600, () => go('confirma'));
      };
    },
    confirma(root) {
      $$('[data-edit]', root).forEach(b => b.onclick = () => { const i = $('#' + b.dataset.edit); i.readOnly = false; i.closest('.in').classList.remove('ro'); i.focus(); i.select(); });
      $('#ineq').onclick = () => { const p = $('#inepop'); p.hidden = !p.hidden; };
      $('#curpt').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      $('#ine').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
      $('form', root).onsubmit = e => {
        e.preventDefault();
        const ok = [setBad('curp', !/^[A-Z]{4}\d{6}[HM][A-Z]{5}$/.test($('#curpb').value.toUpperCase()) || !/^[A-Z0-9]\d$/.test($('#curpt').value)), setBad('rfc', !/^[A-Z&Ñ]{4}\d{6}([A-Z0-9]{3})?$/.test($('#rfc').value.toUpperCase())), setBad('ine', !/^\d{9,13}$/.test($('#ine').value))].every(Boolean);
        if (!ok) return;
        Object.assign(store, { curpb: $('#curpb').value.toUpperCase(), curpt: $('#curpt').value, rfc: $('#rfc').value.toUpperCase(), ine: $('#ine').value }); save();
        busy($('button[type=submit]', root), 500, () => go('revisando'));
      };
    },
    revisando(root) {
      const li = $$('.checks li', root), curp = (store.curpb || curpBase()) + (store.curpt || '');
      const D = [`Edad: ${Math.max(18, age(store.nac))} años`, `CURP: ${curp}`, 'Sin solicitudes previas con esta CURP', 'CURP encontrada en RENAPO', 'Sin coincidencias'];
      li.forEach((l, i) => {
        timers.push(setTimeout(() => l.classList.add('run'), 300 + i * 950));
        timers.push(setTimeout(() => { l.classList.remove('run'); l.classList.add('ok'); $('small', l).textContent = D[i]; }, 1100 + i * 950));
      });
      timers.push(setTimeout(() => {
        $('#bigst').className = 'big-ok'; $('#revh').textContent = 'Todo en orden';
        const b = $('#revgo'); b.removeAttribute('aria-disabled'); b.removeAttribute('tabindex'); b.focus({ preventScroll: true });
        timers.push(setTimeout(() => { if (location.hash === '#/revisando') go('domicilio'); }, 2200));
      }, 1300 + li.length * 950));
      $('#revgo').onclick = e => { if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault(); };
    },
    domicilio(root) {
      const cp = $('#cp'), col = $('#col');
      const fill = () => {
        cp.value = cp.value.replace(/\D/g, '');
        const hit = cp.value.length === 5 && CP[cp.value.slice(0, 2)];
        col.innerHTML = '<option value="" disabled selected>Selecciona una colonia</option>' + (hit ? hit.colonias : []).map(c => `<option ${store.col === c ? 'selected' : ''}>${c}</option>`).join('') + '<option>Otra colonia</option>';
        if (hit) { $('#est').value = hit.estado; $('#mun').value = hit.municipio; $('#ciu').value = hit.ciudad; }
      };
      cp.addEventListener('input', fill); fill();
      $('form', root).onsubmit = e => {
        e.preventDefault(); const v = id => $('#' + id).value.trim();
        const ok = [setBad('viv', !v('viv')), setBad('cp', !/^\d{5}$/.test(v('cp'))), setBad('est', !v('est')), setBad('mun', !v('mun')), setBad('ciu', !v('ciu')), setBad('col', !v('col')), setBad('calle', !v('calle')), setBad('next', !v('next'))].every(Boolean);
        if (!ok) return ($('.bad input, .bad select') || {}).focus?.();
        ['viv', 'cp', 'est', 'mun', 'ciu', 'col', 'calle', 'next', 'nint', 'ref'].forEach(k => store[k] = v(k)); save();
        busy($('button[type=submit]', root), 700, () => go('verifica'));
      };
    },
    verifica(root) {
      const tel = $('#tel'), boxes = $$('.otp input', root), re = $('#otpre');
      if (!tel.value) tel.value = '33 0000 0000';
      $('#editTel').onclick = () => { tel.readOnly = false; tel.closest('.in').classList.remove('ro'); tel.select(); tel.focus(); };
      tel.addEventListener('input', () => { const d = tel.value.replace(/\D/g, '').slice(0, 10); tel.value = [d.slice(0, 2), d.slice(2, 6), d.slice(6)].filter(Boolean).join(' '); });
      const arm = () => { re.disabled = true; re.innerHTML = 'Reenviar en <span class="cd">0:59</span>'; countdown($('.cd', re), 59, () => { re.disabled = false; re.textContent = 'Reenviar código'; }); };
      re.onclick = () => { toast('Te enviamos un nuevo código por SMS.'); arm(); }; arm();
      boxes.forEach((b, i) => {
        b.addEventListener('input', () => { b.value = b.value.replace(/\D/g, '').slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); });
        b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
        b.addEventListener('paste', e => { const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!d) return; e.preventDefault(); boxes.forEach((x, k) => x.value = d[k] || ''); boxes[Math.min(5, d.length)].focus(); });
      });
      $('form', root).onsubmit = e => {
        e.preventDefault();
        const ok = [setBad('tel', tel.value.replace(/\D/g, '').length !== 10), setBad('otp', boxes.some(b => !b.value)), setBad('tyc', !$('#tyc').checked)].every(Boolean);
        if (!ok) return;
        store.tel = tel.value; store.tyc = true; save(); busy($('button[type=submit]', root), 1200, () => go('listo'));
      };
    },
    listo(root) { $('.res-c', root).innerHTML = PC.card('azur'); },
  };

  /* ---------- router ---------- */
  const screen = $('#screen'), segs = $('.segs'), imgs = $$('.art-img');
  segs.innerHTML = PROG.map((k, i) => `<i data-k="${k}" class="${i && S[k].phase !== S[PROG[i - 1]].phase ? 'gap' : ''}"></i>`).join('');
  let cur = null, shownImg = null;
  function go(name) { location.hash = '#/' + name; }
  function render() {
    const name = (location.hash.match(/^#\/(\w+)/) || [])[1];
    const key = VIEW[name] ? name : 'crear';
    if (key === cur) return;
    timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
    const draw = () => {
      screen.className = 'screen'; screen.innerHTML = VIEW[key](); void screen.offsetWidth;
      $$('[data-go]', screen).forEach(b => b.onclick = () => go(b.dataset.go));
      $$('[data-eye]', screen).forEach(b => b.onclick = () => { const i = $('#' + b.dataset.eye); i.type = i.type === 'password' ? 'text' : 'password'; b.setAttribute('aria-label', i.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña'); });
      $$('[data-toast]', screen).forEach(a => a.onclick = e => { e.preventDefault(); toast(a.dataset.toast); });
      $$('.f input, .f select', screen).forEach(i => i.addEventListener('input', () => { const f = i.closest('.f'); if (f && f.classList.contains('bad')) f.classList.remove('bad'); }));
      BIND[key]?.(screen);
      const first = $('input:not([readonly]), select', screen);
      if (first && matchMedia('(min-width: 861px)').matches && key !== 'revisando') first.focus({ preventScroll: true });
      scrollTo(0, 0);
    };
    if (cur) { screen.classList.add('out'); setTimeout(draw, 200); } else draw();
    cur = key;
    // progress
    const pi = PROG.indexOf(key), ph = S[key].phase;
    $('.prog').style.visibility = S[key].noProg ? 'hidden' : '';
    $$('i', segs).forEach((s, i) => { s.classList.toggle('on', i === pi); s.classList.toggle('done', pi > -1 && i < pi); });
    $('.phase-n').textContent = `Paso ${ph + 1} de 4`; $('.phase-t').textContent = PHASES[ph];
    document.title = `${PHASES[ph]} · Solicita tu Tarjeta Percapita`;
    // art crossfade
    const [src, pos] = S[key].img;
    if (src !== shownImg) {
      const [a, b] = imgs[0].classList.contains('on') ? imgs : [imgs[1], imgs[0]];
      b.style.setProperty('--pos', pos); b.src = `../../assets/img/${src}`;
      const swap = () => { b.classList.add('on'); a.classList.remove('on'); };
      b.complete ? requestAnimationFrame(swap) : (b.onload = swap);
      shownImg = src;
    }
    $('.art-t').textContent = S[key].cap;
    // social proof line per step (real Percapita statements)
    const PF = { crear: 'Supervisados por CONDUSEF · Más de 15 años en México.', correo: 'Más de 15 años acompañando las finanzas de familias en México.',
      entrar: 'Tu información está siempre segura. Estamos supervisados por CONDUSEF.', datos: 'Percapita no te pedirá acceso a tus contactos o fotos.',
      confirma: 'Entidad supervisada por CONDUSEF. Validamos tu CURP contra RENAPO.', revisando: 'Revisamos tu información de forma segura, en segundos.',
      domicilio: 'Percapita únicamente realiza operaciones en México.', verifica: 'Cumplimos con la ley de protección de datos personales.',
      listo: 'Te avisaremos por SMS y correo electrónico en cuanto tengamos tu respuesta.' };
    $('.pf-qt').textContent = '“En el banco siempre me decían que no por no tener historial. Aquí me explicaron todo claro, lo hice desde el celular y hoy tengo mi primera tarjeta de crédito.”';
    $('.pf-who').textContent = 'Daniela R.'; $('.pf-loc').textContent = 'Tarjetahabiente · Guadalajara, Jal.';
    const SHOW = { crear: ['top'], confirma: ['logos', 'line'], verifica: ['q'] };
    const parts = SHOW[key] || [];
    const pf = $('.proof'); pf.hidden = !parts.length;
    pf.querySelector('.pf-top').hidden = !parts.includes('top'); pf.querySelector('.pf-logos').hidden = !parts.includes('logos');
    pf.querySelector('.pf-q').hidden = !parts.includes('q'); pf.querySelector('.pf-line').hidden = !parts.includes('line');
    pf.classList.remove('on'); $('.pf-t').textContent = PF[key] || PF.crear; setTimeout(() => pf.classList.add('on'), 220);
  }
  addEventListener('hashchange', render);
  render();
})();
