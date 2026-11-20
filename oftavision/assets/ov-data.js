/* Oftavisión — shared data for every version. Source: BRIEF.md (Slack #oftavision + Drive + oftavision.com.mx).
   RULES: Clínica brand only (no Fundación / Dr. Jairo), no prices, no LASIK / no jóvenes, symptoms-first copy,
   no outcome promises, real testimonials only. VALIDAR = pending client confirmation. */

window.OV_CONFIG = {
  brand: 'Oftavisión',
  logo: '../brand/logo-instituto-oftavision-blue.webp',
  wa: '528120025252', // 81 2002 5252 — línea principal Clínica (call center)
  defaultCase: 'consulta',
  /* WhatsApp de Ads por sede: VALIDAR (solo Mexicali confirmado). Mientras, todas rutean a la línea principal con la sede en el mensaje. */
  sedes: [
    { key: 'victoria', name: 'Cd. Victoria, Tamps.', city: 'Cd. Victoria', state: 'Tamaulipas', tel: '834 106 0473', addr: 'Pedro María Anaya 398, Col. San Francisco', ll: [23.7369, -99.1411] },
    { key: 'madero', name: 'Cd. Madero / Tampico, Tamps.', city: 'Cd. Madero', state: 'Tamaulipas', tel: '833 529 0029', addr: 'Blvd. Adolfo López Mateos 121 Sur, Unidad Nacional', ll: [22.2766, -97.832] },
    { key: 'valles', name: 'Cd. Valles, S.L.P.', city: 'Cd. Valles', state: 'San Luis Potosí', tel: '481 103 5745', addr: 'Progreso 101, Col. San Francisco', ll: [21.9931, -99.0108] },
    { key: 'tuxpan', name: 'Tuxpan, Ver.', city: 'Tuxpan', state: 'Veracruz', tel: '783 110 2268', addr: 'Frente a Plaza Liverpool', ll: [20.9572, -97.4006] },
    { key: 'merida', name: 'Mérida, Yuc.', city: 'Mérida', state: 'Yucatán', tel: '999 273 7697', addr: '', ll: [20.9674, -89.5926] },
    { key: 'matamoros', name: 'Matamoros, Tamps.', city: 'Matamoros', state: 'Tamaulipas', tel: '868 302 8845', addr: 'A minutos de los puentes a Brownsville', ll: [25.869, -97.5027] },
    { key: 'mexicali', name: 'Mexicali, B.C.', city: 'Mexicali', state: 'Baja California', tel: '686 192 0203', addr: '', wa: '526861920203', ll: [32.6245, -115.4523] }
  ],
  hours: 'Lunes a jueves 8:00 a 18:00 · Viernes 8:00 a 15:00', // VALIDAR (minuta 11 nov dice L–J hasta 19:00)
  cases: {
    consulta: {
      label: 'Consulta oftalmológica', chip: 'Consulta oftalmológica',
      title: 'Agenda tu consulta', sub: 'Déjanos tus datos y te escribimos por WhatsApp con los horarios de tu sede.',
      q: { label: '¿Qué notas en tu vista?', options: ['Veo borroso o nublado', 'Manchas o sombras', 'Carnosidad o ardor', 'Revisión general'] },
      msg: 'Quiero agendar una consulta oftalmológica', img: '../img/landing-clinica-hero-1.webp', match: 'consulta|agendar|cita'
    },
    catarata: {
      label: 'Cirugía de catarata', chip: 'Cirugía de catarata',
      title: '¿Ves borroso o nublado?', sub: 'Son síntomas de catarata. Agenda tu consulta y un asesor te escribe por WhatsApp con horarios en tu sede.',
      q: { label: 'La consulta es para:', options: ['Para mí', 'Para un familiar'] },
      msg: 'Quiero agendar mi consulta de catarata', img: '../img/foto-victoria-quirofano-cirugia-microscopio-zeiss-DSC08191.jpg', match: 'catarata'
    },
    lentes: {
      label: 'Lentes intraoculares', chip: 'Lente intraocular para catarata',
      title: 'Elige tu lente intraocular con tu médico', sub: 'Te explicamos las opciones de lente ZEISS, Alcon, Johnson & Johnson y Bausch + Lomb para tu cirugía de catarata.',
      q: { label: '¿Ya te diagnosticaron catarata?', options: ['Sí', 'Todavía no'] },
      msg: 'Quiero información sobre lentes intraoculares para cirugía de catarata', img: '../img/foto-victoria-quirofano-cirugia-microscopio-zeiss-DSC08191.jpg', match: 'lente'
    },
    retina: {
      label: 'Retina', chip: 'Retina',
      title: '¿Ves manchas o una tela en tu vista?', sub: 'Son síntomas que revisa un especialista en retina. Agenda tu consulta por WhatsApp.',
      q: { label: '¿Qué notas?', options: ['Manchas o moscas', 'Una tela o sombra', 'Bajó mi vista de repente', 'Ya tengo diagnóstico'] },
      msg: 'Quiero agendar una consulta de retina', img: '../img/foto-victoria-medico-lampara-hendidura-DSC08066.jpg', match: 'retina'
    },
    glaucoma: {
      label: 'Glaucoma', chip: 'Glaucoma',
      title: 'Revisa tu presión ocular', sub: 'El glaucoma casi no da síntomas al inicio. Agenda tu revisión por WhatsApp.',
      q: { label: '¿Ya te diagnosticaron glaucoma?', options: ['Sí, quiero seguimiento', 'No, quiero revisarme'] },
      msg: 'Quiero agendar una revisión de glaucoma', img: '../img/foto-victoria-medico-lampara-hendidura-DSC08066.jpg', match: 'glaucoma'
    },
    pterigion: {
      label: 'Pterigión (carnosidad)', chip: 'Pterigión · carnosidad',
      title: '¿Tienes una carnosidad en el ojo?', sub: 'Se llama pterigión. Agenda tu consulta y revisamos qué tratamiento necesitas.',
      q: { label: '¿Desde cuándo la notas?', options: ['Menos de 1 año', '1 a 5 años', 'Más de 5 años'] },
      msg: 'Quiero agendar una consulta por pterigión (carnosidad)', img: '../img/landing-clinica-hero-3.webp', match: 'pterigi|carnosidad'
    },
    presbicia: {
      label: 'Vista cansada', chip: 'Vista cansada · presbicia',
      title: '¿Ya no ves bien de cerca?', sub: 'Agenda tu consulta y tu médico te explica tus opciones.',
      q: { label: '¿Usas lentes para leer?', options: ['Sí', 'No'] },
      msg: 'Quiero agendar una consulta por vista cansada', img: '../img/landing-clinica-hero-1.webp', match: 'cansada|presbicia'
    },
    estudios: {
      label: 'Estudios diagnósticos', chip: 'Estudios diagnósticos',
      title: 'Agenda tus estudios', sub: 'OCT, campimetría, topografía, cálculo de lente intraocular y más, en tu sede.',
      q: { label: '¿Qué estudio necesitas?', options: ['OCT', 'Campimetría', 'Cálculo de lente', 'Me lo pidió mi médico'] },
      msg: 'Quiero agendar estudios oftalmológicos', img: '../img/foto-victoria-medico-lampara-hendidura-DSC08066.jpg', match: 'estudio'
    },
    optica: {
      label: 'Óptica', chip: 'Óptica',
      title: 'Lentes y armazones en tu sede', sub: 'Gradúa tu vista con optometría y elige tus lentes en la óptica Oftavisión.',
      q: { label: '¿Qué buscas?', options: ['Examen de la vista', 'Lentes nuevos', 'Lentes de sol'] },
      msg: 'Quiero información de la óptica', img: '../img/landing-clinica-hero-2.webp', match: 'óptica|optica'
    }
  }
};

/* Testimonios: SOLO pacientes reales de Clínica Oftavisión (Drive "Testimonios/Clínicas" + landing actual).
   Frases literales del archivo/video. Rating de Google: NO encontrado → no se muestra (VALIDAR ficha GBP). */
window.OV_REVIEWS = {
  title: 'Historias de pacientes',
  intro: 'Escucha a pacientes reales de nuestras clínicas. Creemos que su experiencia es la mejor forma de que conozcas quiénes somos, qué hacemos y por qué puedes confiar en nosotros.',
  sumTitle: 'Pacientes reales',
  sumBig: '+25,000',
  sumSub: 'cirugías al año en nuestra red',
  reviews: [
    { name: 'Elizabeth Castillo', when: 'Cd. Madero', tag: 'Cirugía de catarata', title: 'Ya puedo manejar sin lentes', text: 'Gracias a esta clínica hoy mi visión cambió, ya puedo manejar sin lentes y apenas llevo una semana.' },
    { name: 'Mario Alberto Rodríguez', when: 'Cd. Valles', tag: 'Cirugía de catarata', title: 'Me han atendido de maravilla', text: 'Ya no veía casi nada… No veía a mis nietos… Me han atendido de maravilla, desde el que barre hasta el que opera.' },
    { name: 'María de los Ángeles Chávez', when: 'Paciente Oftavisión', tag: 'Testimonio en video', title: 'Me inspiró muchísima confianza', text: 'Me inspiró muchísima confianza.' },
    { name: 'María Romero Casas', when: 'Cd. Victoria', tag: 'Cirugía de catarata', title: 'Mejor que nunca', text: 'Estaba totalmente ciega… Mi ojo está funcionando mejor que nunca.' },
    { name: 'Epifanio Vázquez', when: 'Paciente Oftavisión', tag: 'Testimonio en video', title: 'Me siento perfectamente bien', text: 'Me siento perfectamente bien.' },
    { name: 'Sra. Hernández', when: 'Cd. Valles', tag: 'Testimonio en video', title: 'Ya puedo hacer tortillas', text: 'Ya no me ando cayendo… Ya puedo hacer tortillas.' },
    { name: 'Lorena Pérez Reyes', when: 'Cd. Madero', tag: 'Testimonio en video', title: 'Volví a ver', text: 'Gracias a Dios volví a ver… Ya no miraba.' }
  ],
  note: 'Testimonios de pacientes reales de Clínica Oftavisión.',
  videos: [
    { name: 'Elizabeth Castillo', caption: 'Cd. Madero · catarata', poster: '../assets/video/testimonio-video-elizabeth-castillo-poster.jpg', src: '../assets/video/testimonio-video-elizabeth-castillo.mp4' },
    { name: 'Mario Alberto Rodríguez', caption: 'Cd. Valles · catarata', poster: '../assets/img/paciente-valles-mario-alberto-rodriguez-retrato.jpg', quote: 'Ya no veía casi nada… No veía a mis nietos… Me han atendido de maravilla, desde el que barre hasta el que opera.' },
    { name: 'Epifanio Vázquez', caption: 'Paciente Oftavisión', poster: '../assets/video/testimonio-video-epifanio-vazquez-poster.jpg', src: '../assets/video/testimonio-video-epifanio-vazquez.mp4' },
    { name: 'María Antonia Andrade', caption: 'Cd. Madero · catarata, 83 años', poster: '../assets/img/paciente-madero-maria-antonia-andrade-retrato.jpg', quote: 'Paciente de cirugía de catarata en Cd. Madero, a sus 83 años.' },
    { name: 'María de los Ángeles Chávez', caption: 'Paciente Oftavisión', poster: '../assets/video/testimonio-video-maria-de-los-angeles-chavez-poster.jpg', src: '../assets/video/testimonio-video-maria-de-los-angeles-chavez.mp4' },
    { name: 'Sra. Hernández', caption: 'Cd. Valles', poster: '../assets/img/paciente-valles-hernandez-retrato.jpg', quote: 'Ya no me ando cayendo… Ya puedo hacer tortillas.' }
  ]
};

/* "Por qué nos eligen" cards (v1). Quotes + photos = real patients.
   rating/source = MOCKUP placeholders requested for the proposal (4.7–4.9) → VALIDAR with the real Google/Facebook reviews before launch. */
window.OV_LOVE = [
  { name: 'Mario Alberto Rodríguez', when: 'Cd. Valles', photo: '../assets/img/hd/hero-mario.jpg', pos: '50% 45%', rating: 4.9, source: 'google', text: 'Ya no veía casi nada… No veía a mis nietos… Lo mejor que he visto. Me han atendido de maravilla, desde el que barre hasta el que opera.' },
  { name: 'Elizabeth Castillo', when: 'Cd. Madero', photo: '../assets/img/hd/pac-elizabeth.jpg', pos: '50% 18%', rating: 4.8, source: 'facebook', text: 'Gracias a Dios vine aquí. No solo es graduarnos los ojos… Gracias a esta clínica hoy mi visión cambió, ya puedo manejar sin lentes y apenas llevo una semana.' },
  { name: 'Sra. Hernández', when: 'Cd. Valles', photo: '../assets/img/hd/pac-hernandez.jpg', pos: '50% 22%', rating: 4.9, source: 'google', text: 'Ya no me ando cayendo… Ya puedo hacer tortillas.' },
  { name: 'María de los Ángeles Chávez', when: 'Paciente Oftavisión', photo: '../assets/video/testimonio-video-maria-de-los-angeles-chavez-poster.jpg', pos: '50% 28%', rating: 4.7, source: 'google', text: 'Me inspiró muchísima confianza.' },
  { name: 'Epifanio Vázquez', when: 'Paciente Oftavisión', photo: '../assets/video/testimonio-video-epifanio-vazquez-poster.jpg', pos: '50% 30%', rating: 4.8, source: 'facebook', text: 'Me siento perfectamente bien.' }
];
window.OV_TRUST = { rating: 4.5, patients: '+200,000' }; // per Andre (Nov 14) — VALIDAR fuente con el cliente
