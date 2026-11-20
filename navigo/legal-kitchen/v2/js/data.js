/* Legal Kitchen — real services/prices from legalkitchen.com.mx "Menú Legal" (MXN + IVA). */
(function () {
  const credit = [
    ['Incidentes laborales', 'Estrategia de contención de 45 minutos ante un incidente con tu personal.', 0.5],
    ['Revisión de contratos', 'Revisión de un contrato con 2 rondas incluidas por documento.', 0.5],
    ['Actas administrativas', 'Acta para documentar una falta o un incidente laboral.', 1],
    ['Bajas de personal', 'Baja ordenada: aviso, convenio y finiquito según el caso.', 2],
    ['Contratos comerciales', 'Redacción con proveedores, socios o arrendadores; de 2.5 a 8 créditos.', 2.5],
    ['Conciliación', 'Acompañamiento en audiencias de conciliación laboral.', 4],
  ];
  const fmt = n => (n % 1 ? n.toFixed(1) : n.toFixed(1));
  document.querySelectorAll('.sgrid[data-credits]').forEach(g => {
    const C = +g.dataset.credits, plan = C === 6 ? 'BASE' : C === 10 ? 'MEDIO' : 'PRO';
    g.innerHTML = credit.map(([n, d, c]) => {
      const k = Math.floor(C / c);
      const label = n === 'Contratos comerciales' ? `${fmt(c)}–8 CRÉD.` : `${fmt(c)} CRÉD.`;
      return `<a class="scard" href="#" data-lead data-fservicio="Especialidades"><span class="meta">${label}</span><h4>${n}</h4><p>${d}</p><span class="go">Con ${plan}: ${n === 'Contratos comerciales' ? 'hasta ' + k + ' contratos' : 'alcanza para ' + k} →</span></a>`;
    }).join('');
  });
  const cat = {
    a: [
      ['Registro de marca', 'Entradas · Trámites', '$4,500 + IVA', 'Ante el IMPI'],
      ['Aviso COFEPRIS', 'Entradas · Trámites', '$3,500 + IVA', 'Aviso de funcionamiento'],
      ['Impacto vecinal (SIAPEM)', 'Entradas · Trámites', '$8,500 + IVA', 'Trámite de apertura'],
      ['Manifestación ambiental', 'Entradas · Trámites', '$8,500 + IVA', 'Trámite de apertura'],
      ['Paquete Apertura', 'Entradas · Trámites', '15% OFF', 'Registro + COFEPRIS + SIAPEM + Ambiental'],
      ['Contratos laborales', 'Entradas · Personal', '$3,900 + IVA', 'Documentación del personal'],
      ['Reglamento Interior de Trabajo', 'Entradas · Personal', '$10,200 + IVA', 'Documentación del personal'],
      ['Aviso de privacidad', 'Entradas · Personal', '$1,500 + IVA', 'Documentación del personal'],
      ['Confidencialidad (NDA)', 'Entradas · Personal', '$1,500 + IVA', 'Documentación del personal'],
      ['Paquete Ad hoc', 'Entradas · Personal', '$13,900 + IVA', 'Incluye Vigilancia Light'],
    ],
    b: [
      ['Inspección', 'Platos fuertes · Preparación legal', 'Cotización', 'Se cotiza según el caso'],
      ['Comisión mixta de utilidades', 'Platos fuertes · Preparación legal', '$2,180 + IVA', 'Preparación legal'],
      ['Cuadro de antigüedades', 'Platos fuertes · Preparación legal', '$2,900 + IVA', 'Preparación legal'],
      ['Alimentación del personal y Ley Silla', 'Platos fuertes · Preparación legal', '$600 + IVA c/u', 'Constancias'],
      ['Política de propinas', 'Platos fuertes · Preparación legal', '$3,180 + IVA', 'Preparación legal'],
      ['Terminación laboral', 'Platos fuertes · Preparación legal', 'Cotización', 'Aviso de rescisión, convenio, finiquito y acta'],
      ['Servicios premium', 'Platos fuertes', 'Medio Ambiente $3,500 + IVA', 'Protección Civil · Sanidad · Seguridad e Higiene · Capacitación · Defensa · PROFECO'],
      ['Bolsas de horas', 'Especialidades', 'Desde $5,900 + IVA', 'BASE 6 · MEDIO 10 · PRO 15 créditos'],
      ['Servicios por crédito', 'Especialidades', 'Hora hombre $1,100 + IVA', 'Urgencias ×1.5 créditos'],
      ['Contención inmediata', 'La especialidad de la casa', 'Desde 0.5 créditos', 'Sea cual sea la contingencia'],
    ],
  };
  Object.entries(cat).forEach(([k, rows]) => {
    const col = document.querySelector(`.cpanel__col[data-cat="${k}"]`); if (!col) return;
    col.innerHTML = rows.map(([n, c, p, d], i) => `<div class="ci"><button class="ci__b" aria-expanded="false"><h3>${n}</h3><svg><use href="#plus"/></svg></button><div class="ci__c"><div class="ci__l"><a href="#" data-lead data-fservicio="${c.split(' · ')[0] === 'Entradas' ? c : c.startsWith('Platos') ? 'Platos fuertes' : 'Especialidades'}">Precio <em>${p}</em></a><a href="#" data-lead>${c}</a><p>${d}</p><a href="#" data-lead>Solicitar este servicio →</a></div></div></div>`).join('');
  });
})();
