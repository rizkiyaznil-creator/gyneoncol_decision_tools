export default {
  id: 'sarkoma',
  name: 'Sarkoma Uteri',
  shortName: 'Sarkoma Uteri',
  code: 'SU',
  subtitle: 'Leiomiosarkoma · ESS · Adenosarkoma',
  accent: '#4d7c0f',
  accentSoft: '#f7fee7',
  blurb:
    'FIGO 2009 menyediakan dua sistem: satu untuk leiomiosarkoma (LMS) & endometrial stromal sarcoma (ESS), satu untuk adenosarkoma. Karsinosarkoma di-staging sebagai karsinoma endometrium.',
  staging: {
    system: 'FIGO 2009 — Leiomiosarkoma & ESS',
    reference: 'Prat J. FIGO staging for uterine sarcomas. Int J Gynaecol Obstet. 2009;104(3):177-178.',
    groups: [
      {
        stage: 'I',
        title: 'Tumor terbatas pada uterus',
        sub: [
          { label: 'IA', desc: 'Ukuran ≤ 5 cm.' },
          { label: 'IB', desc: 'Ukuran > 5 cm.' },
        ],
      },
      {
        stage: 'II',
        title: 'Meluas ke luar uterus, di dalam pelvis',
        sub: [
          { label: 'IIA', desc: 'Keterlibatan adneksa.' },
          { label: 'IIB', desc: 'Keterlibatan jaringan pelvis lain.' },
        ],
      },
      {
        stage: 'III',
        title: 'Menginvasi jaringan abdomen (bukan sekadar menonjol ke abdomen)',
        sub: [
          { label: 'IIIA', desc: 'Satu lokasi.' },
          { label: 'IIIB', desc: 'Lebih dari satu lokasi.' },
          { label: 'IIIC', desc: 'Metastasis KGB pelvis dan/atau paraaorta.' },
        ],
      },
      {
        stage: 'IV',
        title: 'Invasi organ panggul atau metastasis jauh',
        sub: [
          { label: 'IVA', desc: 'Invasi kandung kemih dan/atau rektum.' },
          { label: 'IVB', desc: 'Metastasis jauh.' },
        ],
      },
    ],
  },
  stagingAlt: {
    system: 'FIGO 2009 — Adenosarkoma',
    note: 'Stadium II–IV identik dengan sistem LMS/ESS; perbedaan hanya pada stadium I.',
    reference: 'Prat J. FIGO staging for uterine sarcomas. Int J Gynaecol Obstet. 2009;104(3):177-178.',
    groups: [
      {
        stage: 'I',
        title: 'Tumor terbatas pada uterus',
        sub: [
          { label: 'IA', desc: 'Terbatas pada endometrium/endoserviks tanpa invasi miometrium.' },
          { label: 'IB', desc: 'Invasi miometrium ≤ 50%.' },
          { label: 'IC', desc: 'Invasi miometrium > 50%.' },
        ],
      },
      { stage: 'II', title: 'Meluas ke pelvis (IIA adneksa; IIB jaringan pelvis lain).' },
      { stage: 'III', title: 'Menginvasi jaringan abdomen (IIIA 1 lokasi; IIIB >1 lokasi; IIIC KGB pelvis/paraaorta).' },
      { stage: 'IV', title: 'IVA invasi buli/rektum; IVB metastasis jauh.' },
    ],
  },
  histology: {
    title: 'Catatan klinis',
    items: [
      ['Leiomiosarkoma (LMS)', 'Agresif; reseksi en bloc, hindari morselasi. Peran kemoterapi adjuvant masih kontroversial.'],
      ['Low-grade ESS', 'Sering ER/PR positif → terapi hormonal berperan; hindari estrogen.'],
      ['High-grade ESS / undifferentiated', 'Agresif, prognosis buruk.'],
      ['Karsinosarkoma (MMMT)', 'Kini dipandang karsinoma metaplastik agresif → di-staging & dikelola sebagai karsinoma endometrium agresif (memakai FIGO endometrium, bukan sistem sarkoma).'],
    ],
  },
  tools: ['bsa'],
  references: [
    'Prat J. FIGO staging for uterine sarcomas. Int J Gynaecol Obstet. 2009;104(3):177-178.',
    'NCCN Clinical Practice Guidelines in Oncology: Uterine Neoplasms (versi terkini).',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
