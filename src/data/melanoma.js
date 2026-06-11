export default {
  id: 'melanoma',
  name: 'Melanoma Ginekologi',
  shortName: 'Melanoma',
  code: 'MG',
  subtitle: 'Melanoma mukosa vulva & vagina',
  accent: '#334155',
  accentSoft: '#f1f5f9',
  blurb:
    'Melanoma mukosa vulvovaginal adalah subtipe melanoma tersendiri (biologi berbeda dari kutaneus). Distaging dengan AJCC 8 (TNM melanoma) berbasis ketebalan Breslow — bukan FIGO, yang non-prognostik pada melanoma.',
  staging: {
    system: 'AJCC 8 (melanoma)',
    guidelineNote:
      'FIGO TIDAK dipakai untuk melanoma vulvovaginal (berkorelasi buruk & non-prognostik). Standar saat ini adalah TNM melanoma kutaneus AJCC edisi ke-8 yang diterapkan pada mukosa, dengan keterbatasan yang diakui. Ketebalan Breslow adalah prediktor prognosis terkuat.',
    note:
      'Pengelompokan stadium klinis (cTNM) di bawah. Stadium III patologis dirinci menjadi subkelompok IIIA–IIID berdasarkan beban KGB & status tumor primer (perlu biopsi KGB sentinel/diseksi). Definisi T/N/M & mikrostaging tercantum pada tabel di bawah.',
    reference: 'Gershenwald JE, dkk. Melanoma staging: AJCC 8th edition. CA Cancer J Clin. 2017;67(6):472-492.',
    groups: [
      { stage: '0', title: 'Melanoma in situ (Tis), N0 M0.' },
      {
        stage: 'I',
        title: 'Tumor primer tipis, tanpa keterlibatan KGB atau metastasis',
        sub: [
          { label: 'IA', desc: 'T1a (< 0,8 mm tanpa ulserasi), N0 M0.' },
          { label: 'IB', desc: 'T1b–T2a, N0 M0.' },
        ],
      },
      {
        stage: 'II',
        title: 'Tumor primer lebih tebal dan/atau ulserasi, tanpa keterlibatan KGB',
        sub: [
          { label: 'IIA', desc: 'T2b–T3a, N0 M0.' },
          { label: 'IIB', desc: 'T3b–T4a, N0 M0.' },
          { label: 'IIC', desc: 'T4b (> 4 mm dengan ulserasi), N0 M0.' },
        ],
      },
      { stage: 'III', title: 'Metastasis KGB regional, in-transit, satelit, atau mikrosatelit (M0). Subkelompok patologis IIIA–IIID menurut beban KGB & tumor primer.' },
      { stage: 'IV', title: 'Metastasis jauh: M1a (kulit/jaringan lunak/KGB non-regional), M1b (paru), M1c (viseral lain), M1d (SSP); sufiks LDH.' },
    ],
    defs: [
      ['Ketebalan Breslow', 'Kedalaman tumor vertikal (mm) dari lapisan granular epidermis ke titik invasi terdalam — prediktor prognosis terkuat.'],
      ['Kategori T', 'T1 ≤ 1,0 mm · T2 > 1–2 mm · T3 > 2–4 mm · T4 > 4 mm. Sufiks: a = tanpa ulserasi, b = dengan ulserasi. T1a < 0,8 mm tanpa ulserasi; T1b 0,8–1,0 mm, atau < 0,8 mm dengan ulserasi.'],
      ['Ulserasi', 'Faktor prognostik buruk independen; menaikkan subkategori a → b.'],
      ['Kategori N', 'N1 = 1 KGB; N2 = 2–3 KGB; N3 = ≥ 4 KGB, matted, atau in-transit/satelit dengan KGB. Sufiks a/b/c sesuai cara deteksi & in-transit.'],
      ['Level Chung (vulva)', 'Mikrostaging khusus vulva (analog Clark, disesuaikan mukosa): mengukur kedalaman dalam mm dari lapisan granular karena mukosa tak memiliki batas dermis-retikular jelas.'],
      ['Level Clark', 'Kedalaman anatomik (I–V); kurang prognostik dibanding Breslow dan tidak lagi menjadi kriteria utama AJCC.'],
    ],
  },
  histology: {
    title: 'Catatan klinis & biomarker',
    items: [
      ['Tipe & lokasi', 'Melanoma mukosa vulvovaginal — subtipe melanoma tersendiri. Vulva lebih sering daripada vagina; melanoma vagina cenderung lebih agresif. Sebagian amelanotik.'],
      ['Faktor prognostik', 'Ketebalan Breslow (terkuat), ulserasi, status KGB, dan stadium AJCC. FIGO non-prognostik pada melanoma.'],
      ['Biomarker (VVM)', 'BRAF ~26% (sering varian non-V600 → kurang responsif terhadap inhibitor BRAF), KIT ~22% (tertinggi antar subtipe melanoma), NRAS jarang; PD-L1 (~56%)/PD-1 (~75%) sering positif (Hou dkk. 2017).'],
      ['Bedah', 'Eksisi lokal luas dengan margin sesuai ketebalan; biopsi KGB sentinel dapat dipertimbangkan. Reseksi radikal/eksenterasi tidak terbukti memperbaiki kesintasan dibanding eksisi luas + terapi sistemik.'],
    ],
    note:
      'Uji BRAF, KIT, dan NRAS direkomendasikan pada semua melanoma mukosa — polanya berbeda dari melanoma kutaneus dan memandu pemilihan terapi target.',
  },
  systemicTherapy: {
    intro: 'Imunoterapi adalah tulang punggung; terapi target hanya bila biomarker positif. Respons melanoma mukosa terhadap imunoterapi umumnya lebih rendah dibanding melanoma kutaneus. Uji BRAF/KIT/NRAS wajib.',
    categories: [
      {
        label: 'Imunoterapi (tulang punggung)',
        rows: [
          { regimen: 'Anti–PD-1 (nivolumab atau pembrolizumab)', indikasi: 'Adjuvant pasca-reseksi risiko tinggi & penyakit lanjut/metastatik', bukti: 'CheckMate-238, KEYNOTE-054 (kutaneus; mukosa via subgrup)' },
          { regimen: 'Nivolumab + ipilimumab', indikasi: 'Metastatik — respons lebih tinggi, toksisitas lebih besar (respons mukosa < kutaneus)', bukti: 'CheckMate-067 (subgrup mukosa)' },
        ],
      },
      {
        label: 'Terapi target (bila biomarker positif)',
        note: 'Hanya bila mutasi pendorong terdeteksi. Catatan: VVM sering BRAF non-V600, yang TIDAK responsif terhadap inhibitor BRAF.',
        rows: [
          { regimen: 'Dabrafenib + trametinib (BRAF/MEK)', indikasi: 'Hanya BRAF V600-mutan', bukti: 'COMBI-d/COMBI-v (kutaneus)' },
          { regimen: 'Imatinib (inhibitor KIT)', indikasi: 'KIT-mutan (VVM ~22%)', bukti: 'Fase II (Hodi, Guo dkk.)' },
        ],
      },
      {
        label: 'Kemoterapi (peran terbatas)',
        rows: [
          { regimen: 'Dakarbazin / temozolomid', indikasi: 'Paliatif bila imunoterapi/terapi target tidak tersedia atau gagal; tingkat respons rendah', bukti: 'Historis' },
        ],
      },
    ],
  },
  tools: ['melanoma-staging', 'chemo-dosing'],
  references: [
    'Hou JY, Baptiste C, Hombalegowda RB, dkk. Vulvar and vaginal melanoma: a unique subclass of mucosal melanoma based on a comprehensive molecular analysis of 51 cases. Cancer. 2017;123(8):1333-1344. doi:10.1002/cncr.30473',
    'Gershenwald JE, Scolyer RA, Hess KR, dkk. Melanoma staging: evidence-based changes in the AJCC 8th edition. CA Cancer J Clin. 2017;67(6):472-492. doi:10.3322/caac.21409',
    'NCCN Clinical Practice Guidelines in Oncology: Melanoma — Cutaneous; pertimbangan melanoma mukosa (versi terkini).',
    'Wohlmuth C, Wohlmuth-Wieser I, dkk. Vulvar melanoma: molecular characteristics, diagnosis, surgical management, and medical treatment. Am J Clin Dermatol. 2021.',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
