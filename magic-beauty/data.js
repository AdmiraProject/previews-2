// Todo el contenido sale de magic-beauty.com.mx, sus videos de YouTube y sus reseñas públicas de Google.
// No hay precios públicos: cada equipo se cotiza (inversión estimada personalizada).
// Ganchos para exportar a Webflow (webflow-kit): MB_ASSETS = rutas → URLs del CDN de Webflow,
// MB_VIDEO = id de video → { yt } o { mp4 } o { img }, MB_LINKS = rutas de páginas. En local no existen y todo queda igual.
window.MBU = p => (window.MB_ASSETS && window.MB_ASSETS[p]) || p;
window.MBL = Object.assign({
  home: 'index.html', equipos: 'equipos.html',
  cat: c => `equipos.html?cat=${c}`, product: id => `product.html?id=${id}`, landing: s => `${s}.html`
}, window.MB_LINKS || {});
window.MB = {
  wa: '527771926310',
  waLabel: '777 192 6310',
  email: 'primercontacto@magic-beauty.com.mx',

  categories: [
    { id: 'ohb', cc: 'camaras-hiperbaricas', short: 'Cámaras hiperbáricas', name: 'Cámaras hiperbáricas', line: 'Oxígeno sin tanques.<br>Recuperación en tu clínica.', img: 'hypercare' },
    { id: 'body', cc: 'moldeamiento-corporal', short: 'Corporal', name: 'Moldeamiento corporal', line: 'Criolipólisis y RF<br>en un solo espacio.', img: 'cryo4d' },
    { id: 'hair', cc: 'depilacion-definitiva', short: 'Depilación', name: 'Depilación definitiva', line: 'IA que analiza el vello<br>antes de cada disparo.', img: 'hairmax-4k' },
    { id: 'laser', cc: 'laseres-de-especialidad', short: 'Láser', name: 'Láseres de especialidad', line: 'Pigmentos, tatuajes<br>y Hollywood Peel.', img: 'pico-arrow' },
    { id: 'face', cc: 'rejuvenecimiento-de-la-piel', short: 'Facial', name: 'Rejuvenecimiento', line: 'HIFU, RF e<br>hidrodermoabrasión.', img: 'hifu-9d' }
  ],

  // Grid tipo "Embajadores" con reels reales de Magic
  ambassadors: [
    { reel: 'ugc-smart-ohb', name: 'Smart OHB en clínica', role: 'Cámaras hiperbáricas' },
    { reel: 'proceso', name: 'Así trabajamos', role: 'Detrás de cámaras' },
    { reel: 'motion-sept-2', name: 'El error más caro', role: 'De una clínica' },
    { reel: 'motion-sept-1', name: 'Dejaste de crecer', role: 'Magic Motion' },
    { reel: 'motion-oct-2', name: 'Más allá de la estética', role: 'Magic Motion' },
    { reel: 'motion-oct-1', name: 'Magic Beauty México', role: 'Magic Motion' },
    { reel: 't-cynthia', name: 'Smart Molding', role: 'Demo en spa' }
  ],

  products: [
    { id: 'hypercare', cat: 'ohb', name: 'SMART OHB HYPERCARE 2.0 ATA', tag: 'Más vendido', specs: ['Reposet electrónico', 'Sentado o semiacostado', 'NANOE™ X', 'Oxígeno sin tanques'], url: 'https://www.magic-beauty.com.mx/productos/smart-ohb-hypercare-2-0ata' },
    { id: 'hypercare-duo', cat: 'ohb', name: 'SMART OHB HYPERCARE DUO 2.0 ATA', tag: 'Nuevo', specs: ['Dos pacientes a la vez', 'Doble reposet electrónico', '2.0 ATA'] },
    { id: 'pro-16-easy', cat: 'ohb', name: 'SMART OHB PRO 1.6 ATA', specs: ['1.3 · 1.4 · 1.5 · 1.6 ATA', 'Posición vertical', 'ALL IN ONE'], url: 'https://www.magic-beauty.com.mx/productos/smart-ohb-pro-1-6-ata' },
    { id: 'karbon-one', cat: 'ohb', name: 'SMART OHB KARBON ONE 2.0 ATA', specs: ['2.0 ATA', 'Cámara hiperbárica'] },
    { id: 'ohb-confort', cat: 'ohb', name: 'SMART OHB CONFORT', specs: ['Cámara hiperbárica', 'Oxigenación integral'] },
    { id: 'cryo4d', cat: 'body', name: 'Avantgarde Cryo 4D Shadow Edition', tag: 'Destacado', specs: ['Criolipólisis 4D', 'No invasivo', 'Abdomen, flancos, papada'] },
    { id: 'zeus', cat: 'body', name: 'Zeus Body Shape', specs: ['Luz infrarroja', 'RF multipolar y bipolar', 'Vacuum + rodillos', 'Cavitación', 'Android'] },
    { id: 'smart-molding', cat: 'body', name: 'SMART MOLDING 8000', specs: ['Multifuncional corporal'] },
    { id: 'cavicool', cat: 'body', name: 'CAVICOOL PRO', specs: ['Moldeamiento corporal'] },
    { id: 'endo-contour', cat: 'body', name: 'ENDO CONTOUR', specs: ['Moldeamiento corporal'] },
    { id: 'hairmax-4k', cat: 'hair', name: 'Hairmax Ultra 4K', tag: 'IA integrada', specs: ['Android + IA', 'Microscopio HD de vello', 'Enfriamiento 4K AAA', '3 puntas magnéticas'] },
    { id: 'hairmax-platinum', cat: 'hair', name: 'HAIRMAX PLATINUM', specs: ['Depilación definitiva'] },
    { id: 'apolo-dpl', cat: 'hair', name: 'APOLO DPL ULTRA', specs: ['Depilación definitiva'] },
    { id: 'pico-arrow', cat: 'laser', name: 'PicoLáser Arrow Elite', tag: 'Destacado', specs: ['690 picosegundos reales', 'Spot regulable', 'Cambio de filtros automático'] },
    { id: 'pico-active', cat: 'laser', name: 'PICOLASER ACTIVE PLATINUM', specs: ['Láser de picosegundos'] },
    { id: 'fraxel-co2', cat: 'laser', name: 'Magic Fraxel CO2', specs: ['Láser CO2 fraccionado'] },
    { id: 'erbium-aura', cat: 'laser', name: 'ERBIUM AURA LÁSER', specs: ['Láser de erbio'] },
    { id: 'hifu-9d', cat: 'face', name: 'ALFA HIFU 9D 4K Android', specs: ['HIFU', 'Android'] },
    { id: 'uthera', cat: 'face', name: 'Uthera Platinum', specs: ['Rejuvenecimiento facial'] },
    { id: 'aquapeel', cat: 'face', name: 'FACIAL AQUAPEEL PRO', specs: ['Hidrodermoabrasión'] },
    { id: 'venus-rf', cat: 'face', name: 'SMART VENUS RF', specs: ['Radiofrecuencia'] }
  ],

  reels: [
    { id: 'ugc-smart-ohb', title: 'Smart OHB en una clínica real', tag: 'Cámaras hiperbáricas' },
    { id: 't-wendolyne', title: 'Dra. Wendolyne V.', tag: 'Testimonio' },
    { id: 'motion-sept-1', title: 'Dejaste de crecer', tag: 'Magic Motion' },
    { id: 't-luis', title: 'Dr. Luis Francisco B.', tag: 'Testimonio' },
    { id: 'proceso', title: 'Así es nuestro proceso', tag: 'Detrás de cámaras' },
    { id: 'motion-sept-2', title: 'El error más caro de una clínica', tag: 'Magic Motion' },
    { id: 't-marcos', title: 'Marcos C.', tag: 'Testimonio' },
    { id: 'motion-oct-1', title: 'Magic Beauty México', tag: 'Magic Motion' },
    { id: 't-cynthia', title: 'Cynthia · Smart Molding', tag: 'Testimonio' },
    { id: 'motion-oct-2', title: 'Más allá de la estética', tag: 'Magic Motion' }
  ],

  // Testimonios en video (citas textuales de sus videos en YouTube)
  videoReviews: [
    { face: 'wendolyne', name: 'Dra. Wendolyne Villanueva', role: 'Médico estético', reel: 't-wendolyne',
      text: 'Inicié comprando el láser CO2 fraccionado y después les compré el hidrafacial Aquapeel y el IPL SHR. Me hizo posicionarme como una clínica que ofrece más opciones de tratamiento y mejores servicios.' },
    { face: 'luis', name: 'Dr. Luis Francisco B.', role: 'Médico', reel: 't-luis',
      text: 'La calidad de los aparatos, la calidad de los productos principalmente. Tienen un ensamblaje en México y piezas de muy alta calidad. Se nota desde los resultados del tratamiento hasta ver el aparato en sí.' },
    { face: 'marcos', name: 'Marcos C.', role: 'Spa', reel: 't-marcos',
      text: 'Nuestro spa se ha posicionado rápidamente en un año. Soporte técnico excelente. Desde el primer equipo, la capacitación fue excelente: todas las dudas se disiparon.' },
    { face: 'cynthia', name: 'Cynthia', role: 'Nutrióloga y cosmetóloga', reel: 't-cynthia',
      text: 'Es un equipo multifuncional: cavitación, radiofrecuencia bipolar, tripolar, depilación. Básicamente puedes tener un spa completo tan solo con este equipo.' }
  ],

  // Reseñas públicas de Google Maps (Magic Beauty Mexico · 4.8 · 182 reseñas)
  google: { rating: '4.8', count: 182 },
  reviews: [
    ['Software Adquisición', 'Hace 9 meses', 'Excelente empresa: seguimiento, asesoría, financiamiento, entrega y capacitación, todo muy bien. La entrega del equipo en tiempo y forma; la capacitación del manejo, excelente. ¡Esto es el inicio de un nuevo y extenso proyecto!'],
    ['Memo GR', 'Hace 6 meses', 'Excelente servicio de información de preventa. Me dieron el tour en la fábrica. El envío sin problema alguno. La instalación muy rápida y bien explicada. La capacitación muy buena y con mucha información y consejos.'],
    ['Priscila Quezada', 'Hace 2 meses', 'Desde el primer contacto resolvieron todas las preguntas de forma clara y veloz. Por mucho superó nuestras expectativas al conocer sus instalaciones y todos los equipos y tecnología que manejan.'],
    ['Roberto Carlos Alarcon Ordoñez', 'Hace un año', 'Asesoría muy profesional, nos dieron opciones de pago, cumplieron el tiempo y forma de entrega. Su gente conoce de lo que está hablando y sabe transmitirlo. Gran ayuda para abrir mi primer negocio de este tipo.'],
    ['gabriel jacome', 'Hace 9 meses', 'Christian vino a entregarnos nuestros equipos, llegó más temprano de lo esperado. Excelente atención, muy buena disposición para resolver todas nuestras dudas, nos explicó muy claro cómo funcionan.'],
    ['Eliezer Amaya', 'Hace 3 meses', 'Excelente servicio por parte de Magic Beauty. Se recibió capacitación muy clara para el uso y mantenimiento del equipo, equipo con buen tiempo de entrega y atención rápida.'],
    ['Raúl Herrera', 'Hace 4 meses', 'Excelente. Muy profesionales, llevan el proceso muy individualizado y acorde a lo que necesito.'],
    ['ILEANA AGUILAR', 'Hace 9 meses', 'Muy profesionales, le dan seguimiento a todas las dudas. ¡El equipo es increíble! Los recomiendo.'],
    ['Daisy Navarro', 'Hace 5 meses', 'Nos encanta nuestro equipo. Todo el personal que trabaja en Magic Beauty es sumamente atento. Especial agradecimiento a nuestro capacitador Christian Santuario por su paciencia y gran entrega ✨'],
    ['Lessly Anaya R', 'Hace 8 meses', '¡Increíble experiencia! Los entrenadores saben de lo que hablan, te explican a detalle y jamás te hacen sentir mal por preguntar. Un ambiente muy bonito en todo sentido ❤️'],
    ['jenny gallego', 'Hace 9 meses', 'Me gustó mucho el seguimiento que me dieron en todo el proceso de compra de mi máquina; la capacitación y entrega excelente, en tiempo y hora. Están siempre atentos a tus dudas.'],
    ['Teresa Gutiérrez', 'Hace 2 meses', 'La atención que tienen es muy buena, resolvieron todas las dudas y entregaron los equipos en tiempo y forma.'],
    ['Paula Jazmin Galvez', 'Hace 5 meses', 'En general todo el proceso y el acompañamiento estuvo excelente. La información muy detallada, la formalidad y la entrega excelente.'],
    ['Adilene Soto Diaz', 'Hace 5 meses', 'Muy profesional, paciente y muy amable el Lic. Christian Santuario. En la capacitación nos explicó a detalle cada paso. Siempre con la disposición de ayudar.'],
    ['Lic. Maribel Vázquez Reyna', 'Hace 2 meses', 'Excelente capacitación, equipo fácil de utilizar y súper funcional 🤩'],
    ['Amanda Ramirez', 'Hace 2 meses', 'Todo muy bien desde el inicio de la capacitación, todo claro y preciso. La verdad me pareció muy profesional todo 👌'],
    ['Maryfer Ramírez', 'Hace 2 meses', 'Me pareció una experiencia súper agradable y diferente. ¡Me pareció impresionante lo puntual que es la máquina!'],
    ['Lupita Herrera', 'Hace 2 meses', 'La capacitación excelente, todo muy bien explicado y fácil de entender, resolvió todas las dudas.'],
    ['Alicia Lopez', 'Hace 10 meses', 'Miguel es un excelente capacitador: amplio conocimiento y paciencia.'],
    ['Valeria González', 'Hace 5 meses', 'Capacitación muy clara y completa; la persona muy amable, contestó todas nuestras dudas.'],
    ['Fernanda Sanchez', 'Hace 2 meses', '¡Muy completo el curso y excelente explicación de parte del equipo!'],
    ['María Fernanda Colorado', 'Hace 4 semanas', 'Demasiada paciencia, gran atención y datos personalizados. Recomiendo ampliamente.'],
    ['yakelin perez', 'Hace 3 meses', 'Excelente servicio, muy profesionales y excelente capacitación.'],
    ['Ale Flores', 'Hace 2 meses', 'Muy buena atención y me encantó la variedad de productos.'],
    ['ea hizterik', 'Hace un mes', 'Excelente atención y siempre puntuales para resolver tus dudas, totalmente recomendable 🤝'],
    ['Sindy Gonzalez', 'Hace 3 meses', 'Excelente capacitación y explicación muy buena.'],
    ['Sofía Michelle', 'Hace 2 meses', 'Es una experiencia muy padre, explican súper bien.'],
    ['Jaime Gomez', 'Hace 8 años', 'El mejor servicio al cliente, excelentes precios. Lo recomiendo.']
  ]
};
