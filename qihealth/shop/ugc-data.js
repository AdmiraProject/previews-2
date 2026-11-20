/* QiHealth UGC wall — data (shared by v1/v2/v3 + PDPs). Rendered by ugc.js.
 * Clip paths are relative to assets/video/ugc/ (resolved from ugc.js's own URL).
 * Sources / in-out / transcripts: research/ugc/ (encode.sh, transcripts/, NOTES.md).
 * RULES: only real client footage; quotes = words actually spoken (whisper transcript, lightly trimmed;
 *        "Key Health"/"Key Score" = whisper mis-hearing of "QiHealth"/"Qi Score");
 *        no Band/Ring medical claims; QiTrax shows its legal line.
 */
(function () {
  var LEGAL_QITRAX = 'Sensor CGM · Reg. SSA 2370E2025 · Permiso de publicidad 263300201B2529';

  var items = {
    /* ---- video cards ---- */
    ana_banda: {
      type: 'video', product: 'band', pill: 'UGC',
      name: 'Ana Belén',                 // [VALIDAR nombre] — first name taken from file name ugc_anabelen_new.mp4
      sub: 'QiHealth Band · en su rutina',
      src: 'ana_banda.mp4', poster: 'ana_banda.jpg', ratio: '9/16', pos: '50% 40%'
      // source: research/footage/ugc_anabelen_new.mp4 09.6–17.4 s (unboxing QiHealth Band box → app screens)
    },
    ring_habla: {
      type: 'video', product: 'ring', pill: 'UGC',
      name: 'QiHealth Ring', sub: 'Creadora QiHealth',
      src: 'ring_habla.mp4', poster: 'ring_habla.jpg', ratio: '9/16', pos: '50% 30%'
      // source: research/footage/ugc3_v2.mp4 00.0–04.8 s (person to camera, before the CGI ring shots)
    },
    qitrax_brazo: {
      type: 'video', product: 'qitrax',
      name: 'QiTrax', sub: 'Sensor CGM · 15 días por sensor', legal: LEGAL_QITRAX,
      src: 'qitrax_brazo.mp4', noaudio: true, poster: 'qitrax_brazo.jpg', ratio: '9/16', pos: '50% 50%'
      // source: site/assets/img/store/qi-hero-bg.mp4 (official QiTrax film) 07.0–16.0 s, 9:16 crop x=736
    },
    jose_habla: {
      type: 'video', product: 'band', pill: 'UGC',
      name: 'José Daniel',               // [VALIDAR nombre] — first name taken from file name ugc_josedaniel_new.mp4
      sub: 'Creador QiHealth',
      src: 'jose_habla.mp4', poster: 'jose_habla.jpg', ratio: '9/16', pos: '50% 38%'
      // source: research/footage/ugc_josedaniel_new.mp4 20.3–25.0 s (talking head only; his older nylon band is NOT in frame)
    },
    qitrax_app: {
      type: 'video', product: 'qitrax',
      name: 'QiTrax + app', sub: '1,440 lecturas al día', legal: LEGAL_QITRAX,
      src: 'qitrax_app.mp4', noaudio: true, poster: 'qitrax_app.jpg', ratio: '16/9', pos: '62% 50%'
      // source: site/assets/img/store/qi-hero-bg.mp4 02.5–07.0 s (phone with QiTrax app)
    },
    ring_uso: {
      type: 'video', product: 'ring', pill: 'UGC',
      name: 'QiHealth Ring', sub: 'Día y noche, en tu mano',
      src: 'ring_uso.mp4', hd: 'ring_uso_1080.mp4', poster: 'ring_uso.jpg', ratio: '9/16', pos: '50% 50%'
      // source: research/footage/qihealth_ajustes.mp4 14.0–21.0 s (ring box → putting it on → case → sleeping with ring)
    },
    qitrax_caja: {
      type: 'video', product: 'qitrax',
      name: 'QiTrax', sub: 'Sensor + aplicador', legal: LEGAL_QITRAX,
      src: 'qitrax_caja.mp4', poster: 'qitrax_caja.jpg', ratio: '9/16', pos: '50% 62%'
      // source: research/footage/motion1_glucosa.mp4 12.4–15.9 s (hands with sensor → box + applicator)
    },

    /* ---- quote cards (spoken lines only) ---- */
    q_ana: {
      type: 'quote', product: 'band',
      quote: 'Ahora puedo ver mi sueño, mi estrés, mi recuperación y mi Qi Score en un solo lugar.',
      name: 'Ana Belén',                 // [VALIDAR nombre]
      sub: 'Creadora QiHealth',
      clip: 'ana_banda', at: 2.56
      // spoken: ugc_anabelen_new.mp4 12.16–17.40 s
    },
    q_ring: {
      type: 'quote', product: 'ring',
      quote: 'Lo que más me gusta es que no solo te dan números, te ayuda a hacer cambios que sí se sienten.',
      name: 'QiHealth Ring', sub: 'Creadora QiHealth'
      // spoken: qihealth_ajustes.mp4 28.40–33.40 s
    }
    /* q_jose ("Durante tres meses ni una sola vez me pude despertar con la primera alarma...", 00.0–05.0 s)
       intentionally NOT used: reads as a sleep-improvement claim for the band (never-say list). */
  };

  var orders = {
    'home':     ['ana_banda', 'ring_habla', 'q_ana', 'qitrax_brazo', 'q_ring', 'jose_habla', 'qitrax_app', 'ring_uso', 'qitrax_caja'],
    'band-pro': ['ana_banda', 'jose_habla', 'q_ana', 'ring_uso', 'q_ring', 'ring_habla', 'qitrax_app', 'qitrax_brazo', 'qitrax_caja'],
    'ring-pro': ['ring_uso', 'ring_habla', 'q_ring', 'ana_banda', 'q_ana', 'jose_habla', 'qitrax_app', 'qitrax_brazo', 'qitrax_caja'],
    'qitrax':   ['qitrax_brazo', 'qitrax_caja', 'q_ana', 'ana_banda', 'q_ring', 'qitrax_app', 'jose_habla', 'ring_uso', 'ring_habla']
  };
  var slots = ['T', 'S', 'Q', 'T', 'Q', 'S', 'S', 'P', 'S'];

  var copy = {
    'home': {
      h: 'Datos claros, personas reales',
      sub: 'Ya sea tu día 1 o tu mejor marca, QiHealth te ayuda a entender tu sueño, tu energía y tu día a día.',
      buy: 'band-pro'
    },
    'band-pro': {
      h: 'Hecha para tu día, usada por personas reales',
      sub: 'Sueño, estrés y recuperación en un solo lugar. Así lo viven los creadores QiHealth en su rutina.',
      buy: 'band-pro'
    },
    'ring-pro': {
      h: 'Discreto en tu mano, claro en tus datos',
      sub: 'Así usan QiHealth Ring nuestros creadores, de día y de noche. Ring Pro, muy pronto.',
      buy: 'ring-pro'
    },
    'qitrax': {
      h: 'Validado en clínica, usado en la vida real',
      sub: 'QiTrax se validó en un ensayo clínico multicéntrico y aleatorizado (2022) con 87 pacientes: 8.66% MARD.',
      buy: 'qitrax'
    }
  };

  window.QI_UGC = { items: items, orders: orders, slots: slots, copy: copy, cta: 'Comprar', legal: LEGAL_QITRAX };
})();
