// Ketersediaan obat onkologi ginekologi di Indonesia (BPOM / Fornas).
// Model BINER: hanya menandai regimen yang agen kuncinya SUDAH beredar di Indonesia.
// Data dikonfirmasi pengguna (dr. Muhammad Rizki Yaznil) per November 2026.
//
// Semantik therapyAvailable(text):
//   1. Bila ADA agen yang dikonfirmasi BELUM tersedia  → false
//      (regimen tak dapat diberikan sesuai tulisan, mis. "Dostarlimab + karbo–paklitaksel").
//   2. Selain itu, bila ADA agen yang dikonfirmasi tersedia → true.
//   3. Bila tak ada yang cocok (modalitas/strategi atau agen belum terlacak) → false (konservatif).
//
// Pencocokan berbasis nama-substring huruf kecil (ejaan Indonesia & Inggris).

import { h } from '../utils/dom.js';

/** Agen yang dikonfirmasi BELUM tersedia di Indonesia (per Nov 2026). */
export const UNAVAILABLE = [
  'rukaparib', 'rucaparib',
  'dostarlimab',
  'cemiplimab',
  'trametinib',
  'dabrafenib',
  'mirvetuximab',
  'tisotumab',
];

/** Agen (atau akronim regimen) yang dikonfirmasi tersedia di Indonesia (BPOM/Fornas). */
export const AVAILABLE = [
  // --- Sitotoksik klasik ---
  'karboplatin', 'carboplatin', 'karbo',
  'paklitaksel', 'paclitaxel',
  'cisplatin', 'sisplatin',
  'doksorubisin', 'doxorubicin', 'doxorubisin',
  'pld', // doksorubisin liposomal pegilasi
  'gemsitabin', 'gemcitabine', 'gemcitabin',
  'dosetaksel', 'docetaxel',
  'etoposid', 'etoposide',
  'dakarbazin', 'dacarbazine',
  'temozolomid', 'temozolomide',
  'ifosfamid', 'ifosfamide',
  'bleomisin', 'bleomycin',
  'vinkristin', 'vincristine',
  'vinblastin', 'vinblastine',
  'vinorelbin', 'vinorelbine',
  'topotekan', 'topotecan',
  'irinotekan', 'irinotecan',
  'pemetreksed', 'pemetrexed',
  'siklofosfamid', 'cyclophosphamide',
  '5-fu', 'fluorourasil', 'fluorouracil',
  'mitomisin', 'mitomycin',
  'metotreksat', 'methotrexate',
  'aktinomisin', 'actinomycin', 'daktinomisin', 'dactinomycin',
  'asam folinat', 'leucovorin',
  'platinum',
  'ema-co', 'ema-ep',
  // --- Target & biologik ---
  'bevacizumab',
  'niraparib',
  'olaparib',
  'pembrolizumab',
  'nivolumab',
  'ipilimumab',
  'atezolizumab',
  'durvalumab',
  'lenvatinib',
  'trastuzumab',
  'imatinib',
  'everolimus',
  'ribociclib',
  'erlotinib',
  'pazopanib',
  // --- Hormonal / endokrin ---
  'letrozol', 'letrozole',
  'anastrozol', 'anastrozole',
  'tamoxifen', 'tamoksifen',
  'megestrol',
  'progestin',
  'aromatase',
];

/**
 * Apakah regimen/agen (berdasarkan teks namanya) tersedia di Indonesia?
 * UNAVAILABLE diperiksa lebih dulu agar kombinasi dengan agen belum-tersedia
 * (mis. "Dostarlimab + karbo–paklitaksel") dikembalikan false.
 * @param {string} text  Nama regimen/agen.
 * @returns {boolean}
 */
export function therapyAvailable(text) {
  if (!text) return false;
  const s = String(text).toLowerCase();
  if (UNAVAILABLE.some((n) => s.includes(n))) return false;
  return AVAILABLE.some((n) => s.includes(n));
}

/** Badge kecil "🇮🇩 Tersedia" untuk disematkan di sebelah nama regimen. */
export function availBadge() {
  return h('span', {
    class: 'avail-badge',
    title: 'Agen kunci regimen ini sudah beredar di Indonesia (BPOM/Fornas, per Nov 2026).',
  },
    h('span', { class: 'avail-badge__flag', 'aria-hidden': 'true' }, '🇮🇩'),
    'Tersedia');
}

/** Daftar nama agen yang belum tersedia — dipakai pada legenda. */
export const UNAVAILABLE_LABELS =
  'rukaparib, dostarlimab, cemiplimab, trametinib, dabrafenib, mirvetuximab soravtansine, tisotumab vedotin';

/** Teks legenda untuk ditempatkan di bawah tabel/hasil. */
export const AVAIL_LEGEND =
  '🇮🇩 Tersedia di Indonesia = agen kunci regimen sudah beredar (BPOM/Fornas, per Nov 2026). ' +
  `Belum tersedia: ${UNAVAILABLE_LABELS}. ` +
  'Badge menandai peredaran obat — bukan jaminan penjaminan BPJS/Fornas atau akses lokal; ' +
  'verifikasi formularium rumah sakit & status terkini.';
