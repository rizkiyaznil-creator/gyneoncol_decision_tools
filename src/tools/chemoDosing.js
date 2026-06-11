import { h, mount } from '../utils/dom.js';
import { num, round, field, selectField, stat, showResult, disclaimerNote } from './shared.js';

// Regimen & dosis kemoterapi terpadu (menggantikan kalkulator BSA, Carboplatin, dan Cisplatin terpisah).
//
// Jenis dosis tiap obat:
//   'm2'        → total = dosis (mg/m²) × BSA (Mosteller); cap opsional (mg).
//   'auc'       → total = AUC × (GFR + 25), dibulatkan ke 10 mg terdekat (formula Calvert).
//   'mgkg'      → total = dosis (mg/kg) × berat badan (bevacizumab).
//   'flat'      → dosis tetap (oral/IV); ditampilkan sebagai rujukan dosis + rute + frekuensi.
//   'flat-cond' → dosis awal kondisional dari BB & trombosit (niraparib, PRIMA).
//
// Semua angka adalah praset yang dapat diedit pengguna (kecuali 'flat-cond').
const REGIMENS = [
  // ---- Dasar ----
  {
    id: 'bsa', group: 'Dasar', name: 'Hitung BSA saja', bsaOnly: true,
    note: 'Luas permukaan tubuh sebagai dasar dosis kemoterapi per m².', drugs: [],
  },

  // ---- Agen tunggal ----
  {
    id: 'carboplatin', group: 'Agen tunggal', name: 'Carboplatin (AUC / Calvert)',
    schedule: 'Tiap 3 minggu (agen tunggal lazim AUC 6–7).',
    drugs: [{ key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 6, min: 1, max: 7, step: 0.5, hint: 'AUC 5–6 (kombinasi) atau 6–7 (agen tunggal).' }],
  },
  {
    id: 'cisplatin-weekly', group: 'Agen tunggal', name: 'Cisplatin mingguan (kemoradiasi)',
    schedule: 'Mingguan, bersamaan radioterapi.',
    drugs: [{ key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 40, cap: 70, capNote: 'Cisplatin mingguan umumnya dibatasi 70 mg/pemberian pada protokol kemoradiasi', days: 'mingguan' }],
  },
  {
    id: 'cisplatin-50', group: 'Agen tunggal', name: 'Cisplatin 50 mg/m² (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 50, days: 'hari 1' }],
  },
  {
    id: 'cisplatin-75', group: 'Agen tunggal', name: 'Cisplatin 75 mg/m² (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 75, days: 'hari 1' }],
  },
  {
    id: 'paclitaxel', group: 'Agen tunggal', name: 'Paclitaxel (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' }],
  },
  {
    id: 'docetaxel', group: 'Agen tunggal', name: 'Docetaxel (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'doce', name: 'Docetaxel', kind: 'm2', dose: 75, days: 'hari 1' }],
  },
  {
    id: 'gemcitabine', group: 'Agen tunggal', name: 'Gemcitabine (hari 1 & 8)',
    schedule: 'Hari 1 & 8, tiap 3 minggu.',
    drugs: [{ key: 'gem', name: 'Gemcitabine', kind: 'm2', dose: 1000, days: 'hari 1, 8' }],
  },
  {
    id: 'cyclophosphamide', group: 'Agen tunggal', name: 'Siklofosfamid',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'cyclo', name: 'Siklofosfamid', kind: 'm2', dose: 500, days: 'hari 1' }],
  },
  {
    id: 'doxorubicin', group: 'Agen tunggal', name: 'Doksorubisin',
    schedule: 'Tiap 3 minggu.',
    note: 'Perhatikan batas dosis kumulatif (~450–550 mg/m²) untuk kardiotoksisitas.',
    drugs: [{ key: 'dox', name: 'Doksorubisin', kind: 'm2', dose: 50, days: 'hari 1' }],
  },

  // ---- Kombinasi ovarium ----
  {
    id: 'tc', group: 'Kombinasi ovarium', name: 'Paclitaxel–Carboplatin (TC)',
    schedule: 'Hari 1, tiap 3 minggu × 6 siklus.',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, hint: 'AUC 5–6.', days: 'hari 1' },
    ],
  },
  {
    id: 'tc-dd', group: 'Kombinasi ovarium', name: 'Dose-dense TC (paclitaxel mingguan)',
    schedule: 'Carboplatin hari 1; paclitaxel hari 1, 8, 15; tiap 3 minggu (JGOG-3016).',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 80, days: 'hari 1, 8, 15' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 6, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'tc-weekly', group: 'Kombinasi ovarium', name: 'Paclitaxel–Carboplatin mingguan (lansia/frail)',
    schedule: 'Mingguan (MITO-7).',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 60, days: 'mingguan' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 2, min: 1, max: 7, step: 0.5, days: 'mingguan' },
    ],
  },
  {
    id: 'docetaxel-carbo', group: 'Kombinasi ovarium', name: 'Docetaxel–Carboplatin',
    schedule: 'Hari 1, tiap 3 minggu (SCOTROC).',
    drugs: [
      { key: 'doce', name: 'Docetaxel', kind: 'm2', dose: 75, days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'gem-carbo', group: 'Kombinasi ovarium', name: 'Gemcitabine–Carboplatin',
    schedule: 'Gemcitabine hari 1 & 8; carboplatin hari 1; tiap 3 minggu.',
    drugs: [
      { key: 'gem', name: 'Gemcitabine', kind: 'm2', dose: 1000, days: 'hari 1, 8' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 4, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'pld-carbo', group: 'Kombinasi ovarium', name: 'PLD–Carboplatin (CALYPSO)',
    schedule: 'Hari 1, tiap 4 minggu.',
    drugs: [
      { key: 'pld', name: 'Doksorubisin liposomal (PLD)', kind: 'm2', dose: 30, days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'cap', group: 'Kombinasi ovarium', name: 'CAP (Siklofosfamid–Doksorubisin–Cisplatin)',
    schedule: 'Hari 1, tiap 3 minggu.',
    note: 'Perhatikan batas dosis kumulatif doksorubisin (~450–550 mg/m²).',
    drugs: [
      { key: 'cyclo', name: 'Siklofosfamid', kind: 'm2', dose: 500, days: 'hari 1' },
      { key: 'dox', name: 'Doksorubisin', kind: 'm2', dose: 50, days: 'hari 1' },
      { key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 50, days: 'hari 1' },
    ],
  },

  // ---- Terapi target / rumatan (ovarium) ----
  {
    id: 'bevacizumab', group: 'Terapi target / rumatan (ovarium)', name: 'Bevacizumab (anti-VEGF)',
    schedule: 'Hari 1, tiap 3 minggu; rumatan dilanjutkan hingga 15–22 siklus.',
    note: 'Alternatif 7,5 mg/kg (ICON7). Pertimbangkan pada risiko tinggi (stadium IV, residual, stadium III non-optimal). Hindari sekitar operasi (penyembuhan luka).',
    drugs: [{ key: 'bev', name: 'Bevacizumab', kind: 'mgkg', dose: 15, min: 1, max: 15, step: 0.5, hint: '15 mg/kg (GOG-218/PAOLA-1) atau 7,5 mg/kg (ICON7).', days: 'hari 1 (q3mgg)' }],
  },
  {
    id: 'olaparib', group: 'Terapi target / rumatan (ovarium)', name: 'Olaparib (PARP, rumatan)',
    schedule: 'Oral kontinu; rumatan hingga 2 tahun (SOLO-1).',
    note: 'Untuk BRCA1/2 mutasi (SOLO-1) atau dengan bevacizumab pada HRD-positif (PAOLA-1). Mulai setelah respons platinum.',
    drugs: [{ key: 'ola', name: 'Olaparib', kind: 'flat', dose: 300, unit: 'mg', freq: '2×/hari', route: 'PO', days: 'kontinu (≤2 thn)', hint: 'Tablet 2×150 mg, 2×/hari.' }],
  },
  {
    id: 'niraparib', group: 'Terapi target / rumatan (ovarium)', name: 'Niraparib (PARP — dosis individualized)',
    schedule: 'Oral 1×/hari kontinu; rumatan hingga 3 tahun (PRIMA).',
    note: 'Dosis awal individualized (PRIMA): 200 mg/hari bila BB <77 kg atau trombosit <150.000/µL; selain itu 300 mg/hari.',
    drugs: [{ key: 'nira', name: 'Niraparib', kind: 'flat-cond', unit: 'mg', freq: '1×/hari', route: 'PO', days: 'kontinu (≤3 thn)' }],
  },
  {
    id: 'rucaparib', group: 'Terapi target / rumatan (ovarium)', name: 'Rucaparib (PARP, rumatan)',
    schedule: 'Oral kontinu (ATHENA-MONO).',
    note: 'Mulai setelah respons platinum. Dapat diturunkan (mis. 500/300 mg 2×/hari) untuk toksisitas.',
    drugs: [{ key: 'ruca', name: 'Rucaparib', kind: 'flat', dose: 600, unit: 'mg', freq: '2×/hari', route: 'PO', days: 'kontinu', hint: '600 mg 2×/hari.' }],
  },
  {
    id: 'trametinib', group: 'Terapi target / rumatan (ovarium)', name: 'Trametinib (MEK — LGSC)',
    schedule: 'Oral 1×/hari kontinu (GOG-281/LOGS).',
    note: 'Untuk LGSC rekuren/lanjut. Pantau penurunan fraksi ejeksi, ruam, dan retinopati.',
    drugs: [{ key: 'tram', name: 'Trametinib', kind: 'flat', dose: 2, unit: 'mg', freq: '1×/hari', route: 'PO', days: 'kontinu', hint: '2 mg 1×/hari.' }],
  },
  {
    id: 'letrozole', group: 'Terapi target / rumatan (ovarium)', name: 'Letrozol (endokrin — LGSC/endometrioid)',
    schedule: 'Oral 1×/hari kontinu.',
    note: 'Terapi/rumatan endokrin pada tumor ER/PR-positif (LGSC, endometrioid). Alternatif: anastrozol 1 mg, tamoksifen 20 mg.',
    drugs: [{ key: 'letro', name: 'Letrozol', kind: 'flat', dose: 2.5, unit: 'mg', freq: '1×/hari', route: 'PO', days: 'kontinu', hint: '2,5 mg 1×/hari.' }],
  },
  {
    id: 'pembrolizumab', group: 'Terapi target / rumatan (ovarium)', name: 'Pembrolizumab (anti-PD-1 — dMMR/MSI-H)',
    schedule: 'IV tiap 3 minggu (200 mg) atau tiap 6 minggu (400 mg).',
    note: 'Hanya untuk tumor dMMR/MSI-H atau TMB-tinggi (agnostik). Bukan terapi lini-1 rutin pada ovarium.',
    drugs: [{ key: 'pembro', name: 'Pembrolizumab', kind: 'flat', dose: 200, unit: 'mg', freq: 'tiap 3 minggu', route: 'IV', days: '—', hint: '200 mg q3mgg atau 400 mg q6mgg.' }],
  },
  {
    id: 'ola-bev', group: 'Terapi target / rumatan (ovarium)', name: 'Olaparib + Bevacizumab (PAOLA-1)',
    schedule: 'Olaparib oral 2×/hari (≤2 thn) + bevacizumab IV tiap 3 minggu (≤15 bln).',
    note: 'Rumatan HRD-positif (termasuk BRCAm) setelah respons kemoterapi platinum + bevacizumab.',
    drugs: [
      { key: 'ola', name: 'Olaparib', kind: 'flat', dose: 300, unit: 'mg', freq: '2×/hari', route: 'PO', days: 'kontinu (≤2 thn)' },
      { key: 'bev', name: 'Bevacizumab', kind: 'mgkg', dose: 15, min: 1, max: 15, step: 0.5, days: 'hari 1 (q3mgg, ≤15 bln)' },
    ],
  },
  {
    id: 'tc-bev', group: 'Terapi target / rumatan (ovarium)', name: 'TC + Bevacizumab (GOG-218/ICON7)',
    schedule: 'Hari 1, tiap 3 minggu; bevacizumab dilanjutkan sebagai rumatan.',
    note: 'Bevacizumab umumnya dimulai siklus ke-2; hentikan ≥4–6 minggu sebelum/sesudah operasi.',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, hint: 'AUC 5–6.', days: 'hari 1' },
      { key: 'bev', name: 'Bevacizumab', kind: 'mgkg', dose: 15, min: 1, max: 15, step: 0.5, days: 'hari 1 (q3mgg)' },
    ],
  },

  // ---- Serviks ----
  {
    id: 'cervix-cis-5fu', group: 'Serviks', name: 'Cisplatin–5-FU (kemoradiasi)',
    schedule: 'Tiap 3–4 minggu selama radioterapi.',
    note: 'Opsi kemoradiasi konkuren; cisplatin mingguan 40 mg/m² (lihat grup “Agen tunggal”) tetap paling lazim & kurang toksik. 5-FU sebagai infus kontinu hari 1–4.',
    drugs: [
      { key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 75, days: 'hari 1' },
      { key: 'fu', name: '5-Fluorourasil (infus kontinu)', kind: 'm2', dose: 1000, days: 'hari 1–4' },
    ],
  },
  {
    id: 'cervix-tp-bev', group: 'Serviks', name: 'Cisplatin–Paclitaxel ± Bevacizumab (GOG-240)',
    schedule: 'Hari 1, tiap 3 minggu — penyakit persisten/rekuren/metastatik.',
    note: 'GOG-240: penambahan bevacizumab memperbaiki OS. Hilangkan bevacizumab bila kontraindikasi (fistula, hipertensi tak terkontrol, riwayat tromboemboli/perforasi).',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' },
      { key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 50, days: 'hari 1' },
      { key: 'bev', name: 'Bevacizumab', kind: 'mgkg', dose: 15, min: 1, max: 15, step: 0.5, hint: '15 mg/kg (GOG-240).', days: 'hari 1' },
    ],
  },
  {
    id: 'cervix-carbo-pac-bev', group: 'Serviks', name: 'Carboplatin–Paclitaxel ± Bevacizumab (JCOG0505)',
    schedule: 'Hari 1, tiap 3 minggu — penyakit persisten/rekuren/metastatik.',
    note: 'Carboplatin–paclitaxel non-inferior terhadap cisplatin–paclitaxel (JCOG0505), terutama bila pasien sudah pernah cisplatin. Bevacizumab opsional (GOG-240).',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, hint: 'AUC 5.', days: 'hari 1' },
      { key: 'bev', name: 'Bevacizumab', kind: 'mgkg', dose: 15, min: 1, max: 15, step: 0.5, hint: 'Opsional.', days: 'hari 1' },
    ],
  },
  {
    id: 'cervix-pembro', group: 'Serviks', name: 'Pembrolizumab + kemoterapi (KEYNOTE-826)',
    schedule: 'Pembrolizumab + platinum–paclitaxel ± bevacizumab, tiap 3 minggu.',
    note: 'KEYNOTE-826: persisten/rekuren/metastatik dengan PD-L1 CPS ≥ 1. Pembrolizumab 200 mg q3mgg atau 400 mg q6mgg; tulang punggung boleh cisplatin/carboplatin ± bevacizumab.',
    drugs: [
      { key: 'pembro', name: 'Pembrolizumab', kind: 'flat', dose: 200, unit: 'mg', freq: 'tiap 3 minggu', route: 'IV', days: 'hari 1', hint: '200 mg q3mgg atau 400 mg q6mgg.' },
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, hint: 'AUC 5 (atau cisplatin 50 mg/m²).', days: 'hari 1' },
      { key: 'bev', name: 'Bevacizumab', kind: 'mgkg', dose: 15, min: 1, max: 15, step: 0.5, hint: 'Opsional.', days: 'hari 1' },
    ],
  },

  // ---- Trofoblas (GTN) ----
  {
    id: 'gtn-mtx-8day', group: 'Trofoblas (GTN)', name: 'Metotreksat–asam folinat 8 hari (risiko rendah)',
    schedule: 'Siklus 14 hari: MTX hari 1, 3, 5, 7; asam folinat hari 2, 4, 6, 8.',
    note: 'Lini pertama GTN risiko rendah (skor WHO/FIGO ≤ 6). Lanjutkan hingga ≥ 3× β-hCG normal berturut-turut. Tidak untuk PSTT/ETT.',
    drugs: [
      { key: 'mtx', name: 'Metotreksat', kind: 'mgkg', dose: 1, min: 0.1, max: 2, step: 0.1, hint: '1 mg/kg IM, hari 1, 3, 5, 7.', days: 'hari 1,3,5,7' },
      { key: 'fol', name: 'Asam folinat (leucovorin)', kind: 'flat', dose: 15, unit: 'mg', freq: '1×/hari', route: 'PO/IM', days: 'hari 2,4,6,8', hint: '15 mg (atau 0,1 mg/kg), 24 jam setelah tiap dosis MTX.' },
    ],
  },
  {
    id: 'gtn-mtx-weekly', group: 'Trofoblas (GTN)', name: 'Metotreksat mingguan (risiko rendah)',
    schedule: 'IM tiap minggu.',
    note: 'Alternatif risiko rendah yang lebih sederhana; tingkat kegagalan/penggantian regimen lebih tinggi dibanding 8-hari. Eskalasi 30 → 50 mg/m² sesuai respons β-hCG.',
    drugs: [
      { key: 'mtx', name: 'Metotreksat', kind: 'm2', dose: 30, min: 30, max: 50, hint: '30–50 mg/m² IM mingguan.', days: 'mingguan' },
    ],
  },
  {
    id: 'gtn-actd-pulse', group: 'Trofoblas (GTN)', name: 'Aktinomisin-D pulsed (risiko rendah)',
    schedule: 'IV tiap 2 minggu.',
    note: 'Pilihan risiko rendah, khususnya bila MTX kontraindikasi (gangguan hepar/efusi) atau resistan. Regimen 5-hari (0,5 mg IV/hari × 5) adalah alternatif.',
    drugs: [
      { key: 'actd', name: 'Aktinomisin-D (daktinomisin)', kind: 'm2', dose: 1.25, cap: 2, capNote: 'Aktinomisin-D pulsed umumnya dibatasi 2 mg/pemberian', days: 'hari 1 (q2mgg)' },
    ],
  },
  {
    id: 'gtn-emaco', group: 'Trofoblas (GTN)', name: 'EMA-CO (risiko tinggi)',
    schedule: 'Siklus 14 hari — EMA: hari 1–2; CO: hari 8. Ulang hari 15.',
    note: 'Lini pertama GTN risiko tinggi (skor ≥ 7). Asam folinat dimulai 24 jam setelah awal MTX, 15 mg tiap 12 jam × 4 dosis. Lanjutkan ≥ 3 siklus setelah β-hCG normal. Tidak untuk PSTT/ETT.',
    drugs: [
      { key: 'etop', name: 'Etoposid', kind: 'm2', dose: 100, days: 'hari 1, 2' },
      { key: 'actd', name: 'Aktinomisin-D', kind: 'flat', dose: 0.5, unit: 'mg', route: 'IV bolus', days: 'hari 1, 2', hint: '0,5 mg IV bolus.' },
      { key: 'mtxb', name: 'Metotreksat (bolus)', kind: 'm2', dose: 100, days: 'hari 1' },
      { key: 'mtxi', name: 'Metotreksat (infus 12 jam)', kind: 'm2', dose: 200, days: 'hari 1' },
      { key: 'fol', name: 'Asam folinat (leucovorin)', kind: 'flat', dose: 15, unit: 'mg', freq: 'tiap 12 jam × 4', route: 'PO/IM', days: 'mulai hari 2', hint: 'Mulai 24 jam setelah awal MTX.' },
      { key: 'cyclo', name: 'Siklofosfamid', kind: 'm2', dose: 600, days: 'hari 8' },
      { key: 'vcr', name: 'Vinkristin', kind: 'm2', dose: 0.8, cap: 2, capNote: 'Vinkristin umumnya dibatasi 2 mg/pemberian', days: 'hari 8' },
    ],
  },
  {
    id: 'gtn-emaep', group: 'Trofoblas (GTN)', name: 'EMA-EP (salvage)',
    schedule: 'Selang-seling mingguan — EMA (hari 1) & EP (hari 8).',
    note: 'Salvage GTN risiko tinggi yang resistan EMA-CO atau ultra-risiko-tinggi; EP menggantikan CO. Dosis antarprotokol bervariasi (mis. etoposid EP 100–150 mg/m²) — verifikasi dengan protokol institusi.',
    drugs: [
      { key: 'etopa', name: 'Etoposid (EMA)', kind: 'm2', dose: 100, days: 'hari 1' },
      { key: 'actd', name: 'Aktinomisin-D', kind: 'flat', dose: 0.5, unit: 'mg', route: 'IV bolus', days: 'hari 1', hint: '0,5 mg IV bolus.' },
      { key: 'mtxi', name: 'Metotreksat (infus 12 jam)', kind: 'm2', dose: 300, days: 'hari 1' },
      { key: 'fol', name: 'Asam folinat (leucovorin)', kind: 'flat', dose: 15, unit: 'mg', freq: 'tiap 12 jam × 4', route: 'PO/IM', days: 'mulai hari 2', hint: 'Mulai 24 jam setelah awal MTX.' },
      { key: 'etopp', name: 'Etoposid (EP)', kind: 'm2', dose: 100, min: 100, max: 150, hint: '100–150 mg/m² antarprotokol.', days: 'hari 8' },
      { key: 'cis', name: 'Cisplatin (EP)', kind: 'm2', dose: 75, days: 'hari 8' },
    ],
  },
];

export default {
  id: 'chemo-dosing',
  name: 'Protokol & Dosis Kemoterapi',
  short: 'Hitung BSA, carboplatin (Calvert/AUC), dosis m²/mg-kg, terapi target (bevacizumab, PARP, MEK, endokrin, anti-PD-1), serta regimen kombinasi ginekologi onkologi — termasuk serviks (GOG-240/JCOG0505/KEYNOTE-826) dan trofoblas/GTN (EMA-CO, EMA-EP, metotreksat–folinat).',
  category: 'Dosis kemoterapi',
  scope: 'Umum (lintas-kanker)',
  render(container) {
    const byId = new Map(REGIMENS.map((r) => [r.id, r]));

    // ----- Pemilih regimen (dikelompokkan) -----
    const groups = [];
    for (const r of REGIMENS) {
      let g = groups.find((x) => x.label === r.group);
      if (!g) { g = { label: r.group, items: [] }; groups.push(g); }
      g.items.push(r);
    }
    const regimenInput = h('select', { id: 'cx-regimen' },
      ...groups.map((g) => h('optgroup', { label: g.label },
        ...g.items.map((r) => h('option', { value: r.id, selected: r.id === 'bsa' ? true : null }, r.name))))
    );
    const regimenField = h('div', { class: 'field' },
      h('label', { for: 'cx-regimen' }, 'Regimen / mode'),
      regimenInput
    );

    // ----- Data pasien (BSA) -----
    const height = field({ id: 'cx-h', label: 'Tinggi badan', unit: 'cm', attrs: { min: '100', placeholder: 'mis. 158' } });
    const weight = field({ id: 'cx-w', label: 'Berat badan', unit: 'kg', attrs: { min: '20', placeholder: 'mis. 60' } });
    const patientGrid = h('div', { class: 'form-grid' }, height.el, weight.el);

    // ----- Trombosit (untuk dosis awal niraparib) -----
    const platelet = field({ id: 'cx-plt', label: 'Trombosit', unit: '×10³/µL', attrs: { min: '1', placeholder: 'mis. 250' } });
    const plateletGrid = h('div', { class: 'form-grid' }, platelet.el);

    // ----- Blok GFR (untuk carboplatin / Calvert) -----
    const method = selectField({
      id: 'cx-method', label: 'Sumber GFR',
      options: [{ value: 'cg', label: 'Estimasi Cockcroft–Gault' }, { value: 'direct', label: 'GFR / klirens kreatinin terukur' }],
      value: 'cg',
    });
    const age = field({ id: 'cx-age', label: 'Usia', unit: 'tahun', attrs: { min: '18', max: '110', placeholder: 'mis. 55' } });
    const scr = field({ id: 'cx-scr', label: 'Kreatinin serum', attrs: { min: '0.1', placeholder: 'mis. 0.9' } });
    const scrUnit = selectField({ id: 'cx-scr-unit', label: 'Satuan kreatinin', options: [{ value: 'mgdl', label: 'mg/dL' }, { value: 'umol', label: 'µmol/L' }], value: 'mgdl' });
    const gfrDirect = field({ id: 'cx-gfr', label: 'GFR / CrCl terukur', unit: 'mL/min', attrs: { min: '5', placeholder: 'mis. 90' } });
    const capCarbo = h('input', { id: 'cx-cap', type: 'checkbox', checked: true });
    const capCarboRow = h('label', { class: 'field--inline', for: 'cx-cap' }, capCarbo,
      h('span', {}, 'Batasi GFR maksimal 125 mL/min (mencegah overdosis pada estimasi CrCl tinggi)'));

    const cgGrid = h('div', { class: 'form-grid' }, age.el, scr.el, scrUnit.el);
    const directGrid = h('div', { class: 'form-grid' }, gfrDirect.el);
    const gfrBlock = h('div', { class: 'stack', style: { marginTop: '4px' } },
      h('p', { class: 'muted', style: { margin: '0' } }, 'Carboplatin (Calvert): GFR via Cockcroft–Gault (faktor perempuan 0,85) atau nilai terukur.'),
      h('div', { class: 'form-grid' }, method.el),
      cgGrid, directGrid,
      h('div', {}, capCarboRow)
    );

    // ----- Input dosis (dinamis per regimen) -----
    const doseWrap = h('div', {});
    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    let doseInputs = []; // [{ drug, input }]

    const currentRegimen = () => byId.get(regimenInput.value) || REGIMENS[0];

    function bsaVal() {
      const hcm = num(height.input.value);
      const wkg = num(weight.input.value);
      if (!(hcm > 0) || !(wkg > 0)) return NaN;
      return Math.sqrt((hcm * wkg) / 3600);
    }

    function gfrRaw() {
      if (method.input.value === 'direct') return num(gfrDirect.input.value);
      const a = num(age.input.value);
      const wkg = num(weight.input.value);
      let cr = num(scr.input.value);
      if (scrUnit.input.value === 'umol') cr = cr / 88.4; // µmol/L → mg/dL
      if (!(a > 0) || !(wkg > 0) || !(cr > 0)) return NaN;
      return ((140 - a) * wkg * 0.85) / (72 * cr); // Cockcroft–Gault, faktor perempuan 0,85
    }

    function updateVisibility() {
      const r = currentRegimen();
      const needGFR = r.drugs.some((d) => d.kind === 'auc');
      const needBSA = r.bsaOnly || r.drugs.some((d) => d.kind === 'm2');
      const needMgkg = r.drugs.some((d) => d.kind === 'mgkg');
      const needPlatelet = r.drugs.some((d) => d.kind === 'flat-cond');
      const direct = method.input.value === 'direct';
      const needWeight = needBSA || (needGFR && !direct) || needMgkg || needPlatelet;
      height.el.style.display = needBSA ? '' : 'none';
      weight.el.style.display = needWeight ? '' : 'none';
      patientGrid.style.display = needWeight ? '' : 'none';
      plateletGrid.style.display = needPlatelet ? '' : 'none';
      gfrBlock.style.display = needGFR ? '' : 'none';
      cgGrid.style.display = needGFR && !direct ? '' : 'none';
      directGrid.style.display = needGFR && direct ? '' : 'none';
    }

    function rebuild() {
      const r = currentRegimen();
      doseInputs = [];
      const fields = r.drugs.map((d) => {
        // Niraparib: dosis awal dihitung dari BB & trombosit — tanpa input dosis.
        if (d.kind === 'flat-cond') {
          doseInputs.push({ drug: d, input: null, rangeChk: null });
          return h('div', { class: 'field' },
            h('label', {}, d.name),
            h('p', { class: 'muted', style: { margin: '4px 0 0', fontSize: '.85rem' } },
              'Dosis awal otomatis dari berat badan & trombosit (200 atau 300 mg/hari).'));
        }
        const isAuc = d.kind === 'auc';
        const unit = isAuc ? 'mg·min/mL'
          : d.kind === 'mgkg' ? 'mg/kg'
          : d.kind === 'flat' ? (d.unit || 'mg')
          : 'mg/m²';
        const f = field({
          id: `cx-dose-${d.key}`,
          label: isAuc ? `${d.name} — target AUC` : d.name,
          unit,
          value: String(d.dose),
          hint: d.hint || null,
          attrs: {
            min: d.min != null ? String(d.min) : (d.kind === 'flat' ? '0.1' : '1'),
            ...(d.max != null ? { max: String(d.max) } : isAuc ? { max: '7' } : {}),
            ...(d.step != null ? { step: String(d.step) } : {}),
          },
        });
        let rangeChk = null;
        if (d.range && d.kind === 'm2') {
          rangeChk = h('input', { id: `cx-range-${d.key}`, type: 'checkbox', checked: true });
          f.el.appendChild(h('label', { class: 'field--inline', for: `cx-range-${d.key}`, style: { marginTop: '6px' } },
            rangeChk, h('span', {}, `Hitung sebagai rentang ${d.min}–${d.max} mg/m²`)));
          rangeChk.addEventListener('change', calc);
        }
        // Mengetik nilai spesifik otomatis menonaktifkan mode rentang.
        f.input.addEventListener('input', () => { if (rangeChk) rangeChk.checked = false; calc(); });
        doseInputs.push({ drug: d, input: f.input, rangeChk });
        return f.el;
      });
      mount(doseWrap, fields.length
        ? h('div', { class: 'stack' },
            h('p', { class: 'muted', style: { margin: '0' } }, 'Dosis praset (dapat diedit):'),
            h('div', { class: 'form-grid' }, ...fields))
        : null);
      updateVisibility();
      calc();
    }

    function calc() {
      const r = currentRegimen();

      // --- Mode BSA saja ---
      if (r.bsaOnly) {
        const bsa = bsaVal();
        if (!(bsa > 0)) { result.hidden = true; return; }
        const hcm = num(height.input.value);
        const wkg = num(weight.input.value);
        const dubois = 0.007184 * hcm ** 0.725 * wkg ** 0.425;
        showResult(result, {
          headline: `${round(bsa, 2)} m²`,
          sub: 'BSA Mosteller — dasar dosis kemoterapi per m².',
          stats: [stat(`${round(bsa, 2)} m²`, 'Mosteller'), stat(`${round(dubois, 2)} m²`, 'DuBois & DuBois')],
          extra: [h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '12px 0 0' } },
            'Mosteller: √(TB × BB / 3600). DuBois: 0,007184 × TB^0,725 × BB^0,425.')],
        });
        return;
      }

      const needGFR = r.drugs.some((d) => d.kind === 'auc');
      const needBSA = r.drugs.some((d) => d.kind === 'm2');
      const needMgkg = r.drugs.some((d) => d.kind === 'mgkg');
      const needPlatelet = r.drugs.some((d) => d.kind === 'flat-cond');
      const bsa = needBSA ? bsaVal() : NaN;
      let gfr = needGFR ? gfrRaw() : NaN;
      const wkg = num(weight.input.value);
      const plt = num(platelet.input.value);

      if (needBSA && !(bsa > 0)) { result.hidden = true; return; }
      if (needGFR && !(gfr > 0)) { result.hidden = true; return; }
      if (needMgkg && !(wkg > 0)) { result.hidden = true; return; }
      if (needPlatelet && (!(wkg > 0) || !(plt > 0))) { result.hidden = true; return; }

      const rawGfr = gfr;
      let gfrCapped = false;
      if (needGFR && capCarbo.checked && gfr > 125) { gfr = 125; gfrCapped = true; }

      const rows = [];
      const notes = [];
      for (const { drug, input, rangeChk } of doseInputs) {
        if (drug.kind === 'auc') {
          const v = num(input.value);
          if (!(v > 0)) { result.hidden = true; return; }
          const exact = v * (gfr + 25);
          const rounded = Math.round(exact / 10) * 10;
          rows.push({ name: drug.name, spec: `AUC ${v}`, total: `${rounded} mg`, head: `${rounded} mg`, days: drug.days || '—' });
        } else if (drug.kind === 'mgkg') {
          const v = num(input.value);
          if (!(v > 0)) { result.hidden = true; return; }
          const total = Math.round(v * wkg);
          rows.push({ name: drug.name, spec: `${v} mg/kg`, total: `${total} mg`, head: `${total} mg`, days: drug.days || '—' });
        } else if (drug.kind === 'flat') {
          const v = num(input.value);
          if (!(v > 0)) { result.hidden = true; return; }
          const u = drug.unit || 'mg';
          const adm = [drug.freq, drug.route].filter(Boolean).join(', ');
          rows.push({ name: drug.name, spec: `${v} ${u}`, total: adm || '—', head: `${v} ${u}`, days: drug.days || '—' });
        } else if (drug.kind === 'flat-cond') {
          const reduced = wkg < 77 || plt < 150;
          const dose = reduced ? 200 : 300;
          const adm = [drug.freq, drug.route].filter(Boolean).join(', ');
          rows.push({ name: drug.name, spec: `${dose} mg/hari`, total: adm || '—', head: `${dose} mg/hari`, days: drug.days || '—' });
          notes.push(reduced
            ? 'Niraparib 200 mg/hari (dosis awal individualized): BB <77 kg atau trombosit <150.000/µL.'
            : 'Niraparib 300 mg/hari: BB ≥77 kg dan trombosit ≥150.000/µL.');
        } else if (rangeChk && rangeChk.checked) {
          const lo = Math.round(drug.min * bsa);
          const hi = Math.round(drug.max * bsa);
          rows.push({ name: drug.name, spec: `${drug.min}–${drug.max} mg/m²`, total: `${lo}–${hi} mg`, head: `${lo}–${hi} mg`, days: drug.days || '—' });
        } else {
          const v = num(input.value);
          if (!(v > 0)) { result.hidden = true; return; }
          let total = v * bsa;
          let capApplied = false;
          if (drug.cap != null && total > drug.cap) { total = drug.cap; capApplied = true; }
          rows.push({ name: drug.name, spec: `${v} mg/m²`, total: `${round(total, 0)} mg${capApplied ? ' *' : ''}`, head: `${round(total, 0)} mg${capApplied ? ' *' : ''}`, days: drug.days || '—' });
          if (capApplied && drug.capNote) notes.push(`${drug.capNote} (dibatasi ${drug.cap} mg).`);
        }
      }

      const stats = [];
      if (needBSA) stats.push(stat(`${round(bsa, 2)} m²`, 'BSA (Mosteller)'));
      if (needGFR) stats.push(stat(`${round(gfr, 0)}`, gfrCapped ? `GFR dipakai (dibatasi dari ${round(rawGfr, 0)})` : 'GFR dipakai (mL/min)'));

      const table = h('div', { class: 'table-scroll', style: { marginTop: '14px' } },
        h('table', { class: 'data-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'Obat'), h('th', {}, 'Dosis'), h('th', {}, 'Total / pemberian'), h('th', {}, 'Hari'))),
          h('tbody', {}, ...rows.map((row) => h('tr', {},
            h('td', {}, row.name), h('td', {}, row.spec), h('td', {}, h('strong', {}, row.total)), h('td', {}, row.days))))
        )
      );

      const extra = [table];
      if (r.schedule) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '10px 0 0' } }, `Jadwal: ${r.schedule}`));
      if (r.note) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } }, r.note));
      for (const n of notes) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } }, `* ${n}`));
      if (needGFR) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } }, 'Carboplatin (Calvert): Dosis = AUC × (GFR + 25), dibulatkan ke 10 mg.'));

      const single = rows.length === 1;
      showResult(result, {
        headline: single ? rows[0].head.replace(' *', '') : r.name,
        sub: single ? `${rows[0].name} · ${rows[0].spec}` : 'Dosis per obat (lihat tabel).',
        stats,
        extra,
      });
    }

    regimenInput.addEventListener('change', rebuild);
    method.input.addEventListener('change', () => { updateVisibility(); calc(); });
    [height.input, weight.input, age.input, scr.input, scrUnit.input, gfrDirect.input, capCarbo, platelet.input].forEach((el) =>
      el.addEventListener('input', calc));
    scrUnit.input.addEventListener('change', calc);

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Pilih regimen atau mode, lalu masukkan data pasien. Semua dosis praset dapat disesuaikan; hasil diperbarui otomatis.'),
        regimenField,
        patientGrid,
        plateletGrid,
        gfrBlock,
        doseWrap,
        result,
        disclaimerNote('Kalkulator pendukung — bukan resep. Sesuaikan dengan fungsi ginjal, antiemetik, modifikasi/penundaan dosis, batas kumulatif, dan kebijakan institusi. Verifikasi setiap dosis dengan apoteker onkologi.')
      )
    );

    rebuild();
  },
};
