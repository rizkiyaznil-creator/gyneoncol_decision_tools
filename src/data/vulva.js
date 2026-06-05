export default {
  id: 'vulva',
  name: 'Kanker Vulva',
  shortName: 'Vulva',
  code: 'VU',
  subtitle: 'Karsinoma vulva (staging FIGO 2021)',
  accent: '#c2410c',
  accentSoft: '#fff7ed',
  blurb:
    'Mayoritas karsinoma sel skuamosa. Revisi FIGO 2021 memperjelas perluasan ke struktur perineal serta ukuran metastasis KGB (≤ 5 mm vs > 5 mm) dan extracapsular spread.',
  staging: {
    system: 'FIGO 2021',
    note: 'Kedalaman invasi diukur dari batas epitel-stroma papila dermal superfisial terdekat hingga titik invasi terdalam.',
    reference: 'Olawaiye AB, dkk. FIGO 2021; Int J Gynaecol Obstet. 2021;155(1):43-47.',
    groups: [
      {
        stage: 'I',
        title: 'Tumor terbatas pada vulva',
        sub: [
          { label: 'IA', desc: 'Ukuran ≤ 2 cm dengan invasi stroma ≤ 1,0 mm.' },
          { label: 'IB', desc: 'Ukuran > 2 cm ATAU invasi stroma > 1,0 mm.' },
        ],
      },
      {
        stage: 'II',
        title:
          'Tumor ukuran berapa pun dengan perluasan ke sepertiga bawah uretra, sepertiga bawah vagina, atau sepertiga bawah anus; KGB negatif.',
      },
      {
        stage: 'III',
        title:
          'Perluasan ke bagian atas struktur perineal berdekatan, atau KGB regional yang tidak terfiksir & tidak ulserasi',
        sub: [
          { label: 'IIIA', desc: 'Perluasan ke dua pertiga atas uretra/vagina, mukosa buli, atau mukosa rektum; ATAU metastasis KGB regional ≤ 5 mm.' },
          { label: 'IIIB', desc: 'Metastasis KGB regional > 5 mm.' },
          { label: 'IIIC', desc: 'Metastasis KGB regional dengan penyebaran ekstrakapsular (extracapsular spread).' },
        ],
      },
      {
        stage: 'IV',
        title: 'Terfiksir ke tulang atau metastasis jauh',
        sub: [
          { label: 'IVA', desc: 'Penyakit terfiksir ke tulang panggul, ATAU KGB regional terfiksir/ulserasi.' },
          { label: 'IVB', desc: 'Metastasis jauh.' },
        ],
      },
    ],
  },
  histology: {
    title: 'Catatan klinis',
    items: [
      ['Tipe histologi', 'Karsinoma sel skuamosa (tersering): jalur HPV-associated vs HPV-independent (sering p53-mutated, prognosis lebih buruk).'],
      ['Sentinel node', 'Biopsi KGB sentinel sesuai untuk tumor unifokal < 4 cm dengan KGB klinis negatif.'],
      ['Margin', 'Target margin bedah bebas tumor; margin dekat/positif meningkatkan risiko kekambuhan lokal.'],
    ],
  },
  tools: ['chemo-dosing'],
  references: [
    'Olawaiye AB, Cuello MA, Rogers LJ. Cancer of the vulva: 2021 update. Int J Gynaecol Obstet. 2021;155(Suppl 1):7-18; staging Int J Gynaecol Obstet. 2021;155(1):43-47.',
    'NCCN Clinical Practice Guidelines in Oncology: Vulvar Cancer (versi terkini).',
    'Oonk MHM, dkk. ESGO guidelines for the management of patients with vulvar cancer.',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
