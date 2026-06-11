export default {
  id: 'gtn',
  name: 'Penyakit Trofoblas Maligna (GTN)',
  shortName: 'Trofoblas (GTN)',
  code: 'TG',
  subtitle: 'Gestational Trophoblastic Neoplasia',
  accent: '#2563eb',
  accentSoft: '#eff6ff',
  blurb:
    'Mencakup mola invasif, koriokarsinoma, PSTT, dan ETT. Manajemen ditentukan oleh stadium anatomik FIGO dan skor prognostik WHO/FIGO yang memisahkan risiko rendah vs tinggi.',
  staging: {
    system: 'FIGO Anatomic Staging (2000)',
    guidelineNote: 'Stadium anatomik FIGO dan skor prognostik FIGO/WHO 2000 tetap menjadi standar (ditegaskan kembali pada pembaruan FIGO 2025, Ngan dkk.). Skor belum direvisi >20 tahun dan memiliki keterbatasan yang diketahui.',
    note:
      'Stadium anatomik dilengkapi skor prognostik WHO/FIGO yang dimodifikasi. Catatan: PSTT dan ETT TIDAK dinilai dengan skor prognostik ini dan umumnya dikelola secara bedah karena relatif kemoresisten.',
    reference: 'FIGO Oncology Committee (2000); Ngan HYS, dkk. FIGO Cancer Report.',
    groups: [
      { stage: 'I', title: 'Penyakit terbatas pada uterus.' },
      { stage: 'II', title: 'Meluas ke luar uterus tetapi terbatas pada struktur genital (adneksa, vagina, ligamentum latum).' },
      { stage: 'III', title: 'Meluas ke paru, dengan atau tanpa keterlibatan traktus genital.' },
      { stage: 'IV', title: 'Semua lokasi metastasis lain (otak, hepar, ginjal, saluran cerna).' },
    ],
  },
  histology: {
    title: 'Skor prognostik WHO/FIGO (ringkas)',
    items: [
      ['Skor ≤ 6', 'Risiko rendah → kemoterapi agen tunggal (metotreksat atau aktinomisin-D).'],
      ['Skor ≥ 7', 'Risiko tinggi → kemoterapi multiagen (mis. EMA-CO).'],
      ['Hitung otomatis', 'Gunakan alat “Skor Prognostik GTN (WHO/FIGO)” untuk menghitung dari 8 faktor.'],
    ],
    note:
      'Diagnosis GTN pasca-mola umumnya berdasarkan kriteria β-hCG (plateau ≥ 3 minggu, kenaikan ≥ 2 minggu, atau persistensi ≥ 6 bulan) atau histologi koriokarsinoma.',
  },
  systemicTherapy: {
    intro: 'GTN sangat kemosensitif & umumnya kuratif. Pilihan regimen ditentukan oleh skor prognostik WHO/FIGO. PSTT/ETT dikelola berbeda (relatif kemoresisten, andalkan bedah).',
    categories: [
      {
        label: 'Risiko rendah (skor ≤ 6)',
        rows: [
          { regimen: 'Metotreksat ± asam folinat', indikasi: 'Agen tunggal lini-1; angka kuratif tinggi', bukti: 'Standar (Cochrane)' },
          { regimen: 'Aktinomisin-D (pulsed/5-hari)', indikasi: 'Alternatif; bila MTX gagal/kontraindikasi', bukti: 'GOG-174 (lebih superior dari MTX mingguan)' },
        ],
      },
      {
        label: 'Risiko tinggi (skor ≥ 7)',
        rows: [
          { regimen: 'EMA-CO', indikasi: 'Multiagen lini-1 risiko tinggi', bukti: 'Standar; kuratif tinggi' },
          { regimen: 'EMA-EP', indikasi: 'Salvage resistan EMA-CO atau metastasis luas', bukti: 'Charing Cross' },
          { regimen: 'Induksi etoposid–cisplatin dosis rendah', indikasi: 'Ultra-risiko tinggi: cegah kematian dini/hemoragik', bukti: 'Seri Charing Cross' },
        ],
      },
      {
        label: 'Imunoterapi (refrakter)',
        note: 'Trofoblas mengekspresikan PD-L1 tinggi → checkpoint inhibitor menjadi terobosan pada penyakit multidrug-resistan.',
        rows: [
          { regimen: 'Avelumab (anti–PD-L1)', indikasi: 'GTN resistan kemoterapi agen tunggal', bukti: 'TROPHIMMUN' },
          { regimen: 'Pembrolizumab (anti–PD-1)', indikasi: 'GTN multidrug-resistan (termasuk PSTT/ETT)', bukti: 'Seri (Ghorani dkk.)' },
        ],
      },
    ],
  },
  tools: ['gtn-score', 'chemo-dosing'],
  references: [
    'FIGO Oncology Committee. FIGO staging for gestational trophoblastic neoplasia 2000. Int J Gynaecol Obstet. 2002;77(3):285-287.',
    'Ngan HYS, Seckl MJ, Berkowitz RS, dkk. Diagnosis and management of gestational trophoblastic disease: 2025 update. Int J Gynecol Obstet. 2025.',
    'NCCN Clinical Practice Guidelines in Oncology: Gestational Trophoblastic Neoplasia (versi terkini).',
  ],
};
