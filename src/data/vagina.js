export default {
  id: 'vagina',
  name: 'Kanker Vagina',
  shortName: 'Vagina',
  code: 'VG',
  subtitle: 'Karsinoma vagina primer',
  accent: '#0891b2',
  accentSoft: '#ecfeff',
  blurb:
    'Kanker vagina primer jarang. Bila tumor melibatkan serviks atau vulva, lesi diklasifikasikan sebagai primer serviks atau vulva — bukan vagina.',
  staging: {
    system: 'FIGO',
    guidelineNote: 'FIGO untuk kanker vagina TIDAK memakai subdivisi ukuran (tidak ada IA/IB) — subdivisi ukuran hanya pada TNM/AJCC. Sistem FIGO ditegaskan kembali pada pembaruan FIGO Cancer Report 2025 (Adams dkk.).',
    note:
      'Status KGB tidak dikode terpisah pada sistem FIGO klasik (gunakan kategori N pada TNM). Drainase: dua pertiga atas → KGB pelvis; sepertiga bawah → KGB inguinofemoral.',
    reference: 'FIGO Committee on Gynecologic Oncology; lihat juga TNM/AJCC.',
    groups: [
      { stage: 'I', title: 'Karsinoma terbatas pada dinding vagina.' },
      { stage: 'II', title: 'Melibatkan jaringan subvaginal tetapi belum mencapai dinding pelvis.' },
      { stage: 'III', title: 'Meluas ke dinding pelvis.' },
      {
        stage: 'IV',
        title: 'Melewati true pelvis atau invasi mukosa buli/rektum',
        sub: [
          { label: 'IVA', desc: 'Invasi mukosa kandung kemih dan/atau rektum, dan/atau perluasan melewati true pelvis.' },
          { label: 'IVB', desc: 'Penyebaran ke organ jauh.' },
        ],
      },
    ],
  },
  histology: {
    title: 'Catatan klinis',
    items: [
      ['Tipe histologi', 'Karsinoma sel skuamosa (tersering, terkait HPV); adenokarsinoma; melanoma; jarang clear cell (riwayat paparan DES).'],
      ['Tata laksana', 'Mayoritas dengan radioterapi/kemoradiasi berbasis cisplatin; bedah pada kasus terpilih (lesi kecil sepertiga atas).'],
    ],
    note: 'Melanoma vagina dikelola dengan algoritma melanoma (staging AJCC, imunoterapi) — lihat modul “Melanoma Ginekologi”.',
  },
  systemicTherapy: {
    intro: 'Kanker vagina primer sangat langka; bukti sistemik diekstrapolasi dari serviks. Tata laksana utama radioterapi/kemoradiasi.',
    categories: [
      {
        label: 'Kemoradiasi',
        rows: [
          { regimen: 'Cisplatin mingguan konkuren RT', indikasi: 'Standar untuk penyakit lokal lanjut (ekstrapolasi serviks)', bukti: 'Seri retrospektif besar' },
        ],
      },
      {
        label: 'Sistemik (metastatik)',
        rows: [
          { regimen: 'Cisplatin/karboplatin–paklitaksel ± bevacizumab', indikasi: 'Penyakit metastatik/rekuren (pola serviks)', bukti: 'Ekstrapolasi GOG-240' },
        ],
      },
      {
        label: 'Imunoterapi',
        rows: [
          { regimen: 'Pembrolizumab (anti–PD-1)', indikasi: 'PD-L1-positif atau dMMR/MSI-H/TMB-tinggi (agnostik)', bukti: 'KEYNOTE-158 (agnostik)' },
        ],
      },
    ],
  },
  tools: ['chemo-dosing'],
  references: [
    'FIGO Committee on Gynecologic Oncology. Current FIGO staging for cancer of the vagina, fallopian tube, ovary, and gestational trophoblastic neoplasia. Int J Gynaecol Obstet. 2009;105(1):3-4.',
    'Adams TS, dkk. Cancer of the vagina: 2025 update. Int J Gynecol Obstet. 2025.',
    'NCCN Clinical Practice Guidelines in Oncology: Vaginal Cancer (versi terkini).',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
