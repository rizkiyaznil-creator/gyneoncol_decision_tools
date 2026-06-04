export default {
  id: 'serviks',
  name: 'Kanker Serviks',
  shortName: 'Serviks',
  code: 'CX',
  subtitle: 'Karsinoma sel skuamosa & adenokarsinoma serviks',
  accent: '#7c3aed',
  accentSoft: '#f5f3ff',
  blurb:
    'Staging FIGO 2018 — revisi penting: pencitraan & temuan patologi boleh dipakai, ukuran tumor (IB1–IB3) diperjelas, dan status KGB dimasukkan sebagai stadium IIIC.',
  staging: {
    system: 'FIGO 2018',
    guidelineNote: 'FIGO 2018 tetap menjadi sistem terkini dan ditegaskan kembali pada pembaruan FIGO Cancer Report 2025 (Bhatla dkk.); NCCN memakai sistem ini.',
    note: 'Pencitraan (USG/MRI/CT/PET) dan patologi boleh digunakan untuk melengkapi temuan klinis. Notasi r (imaging) atau p (patologi) dapat ditambahkan, mis. IIIC1r / IIIC1p.',
    reference: 'Bhatla N, dkk. FIGO 2018; Int J Gynaecol Obstet. 2019.',
    groups: [
      {
        stage: 'I',
        title: 'Karsinoma terbatas pada serviks (ekstensi ke korpus diabaikan)',
        sub: [
          { label: 'IA', desc: 'Karsinoma invasif hanya terdiagnosis mikroskopik; kedalaman invasi maksimal < 5 mm.' },
          { label: 'IA1', desc: 'Invasi stroma < 3 mm.', child: true },
          { label: 'IA2', desc: 'Invasi stroma ≥ 3 mm dan < 5 mm.', child: true },
          { label: 'IB', desc: 'Invasi terukur ≥ 5 mm (melebihi IA), lesi terbatas pada serviks.' },
          { label: 'IB1', desc: 'Invasi ≥ 5 mm dan diameter tumor < 2 cm.', child: true },
          { label: 'IB2', desc: 'Diameter tumor ≥ 2 cm dan < 4 cm.', child: true },
          { label: 'IB3', desc: 'Diameter tumor ≥ 4 cm.', child: true },
        ],
      },
      {
        stage: 'II',
        title: 'Melewati uterus, belum mencapai dinding pelvis atau sepertiga bawah vagina',
        sub: [
          { label: 'IIA', desc: 'Keterlibatan dua pertiga atas vagina tanpa keterlibatan parametrium.' },
          { label: 'IIA1', desc: 'Tumor < 4 cm.', child: true },
          { label: 'IIA2', desc: 'Tumor ≥ 4 cm.', child: true },
          { label: 'IIB', desc: 'Keterlibatan parametrium, belum mencapai dinding pelvis.' },
        ],
      },
      {
        stage: 'III',
        title:
          'Mencapai dinding pelvis dan/atau sepertiga bawah vagina dan/atau hidronefrosis/ginjal non-fungsi dan/atau KGB',
        sub: [
          { label: 'IIIA', desc: 'Sepertiga bawah vagina, tanpa perluasan ke dinding pelvis.' },
          { label: 'IIIB', desc: 'Mencapai dinding pelvis dan/atau hidronefrosis atau ginjal non-fungsi.' },
          { label: 'IIIC', desc: 'Keterlibatan KGB pelvis dan/atau paraaorta (apa pun ukuran & luas tumor).' },
          { label: 'IIIC1', desc: 'Hanya KGB pelvis.', child: true },
          { label: 'IIIC2', desc: 'KGB paraaorta.', child: true },
        ],
      },
      {
        stage: 'IV',
        title: 'Melewati true pelvis atau invasi mukosa buli/rektum (terbukti biopsi)',
        sub: [
          { label: 'IVA', desc: 'Penyebaran ke organ panggul yang berdekatan (mukosa buli/rektum).' },
          { label: 'IVB', desc: 'Penyebaran ke organ jauh.' },
        ],
      },
    ],
  },
  histology: {
    title: 'Catatan klinis',
    items: [
      ['Tipe histologi', 'Karsinoma sel skuamosa (tersering), adenokarsinoma, adenoskuamosa. Pertimbangkan klasifikasi HPV-associated vs HPV-independent (WHO 2020).'],
      ['Faktor risiko kekambuhan', 'Ukuran tumor, kedalaman invasi stroma, dan LVSI → kriteria Sedlis untuk radioterapi adjuvant.'],
      ['Indikasi kemoradiasi', 'Kriteria Peters (margin positif, parametrium positif, atau KGB positif) → kemoradiasi berbasis cisplatin.'],
    ],
  },
  tools: ['bsa', 'cisplatin-dosing'],
  references: [
    'Bhatla N, Berek JS, Cuello Fredes M, dkk. Revised FIGO staging for carcinoma of the cervix uteri. Int J Gynaecol Obstet. 2019;145(1):129-135.',
    'Bhatla N, dkk. Cancer of the cervix uteri: 2025 update. Int J Gynecol Obstet. 2025 (menegaskan kembali FIGO 2018).',
    'NCCN Clinical Practice Guidelines in Oncology: Cervical Cancer (versi terkini).',
    'Cibula D, dkk. ESGO/ESTRO/ESP guidelines for the management of patients with cervical cancer.',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
