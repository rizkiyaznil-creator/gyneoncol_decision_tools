import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote, criteriaBox } from './shared.js';

const HISTO_LABEL = {
  lowgrade: 'endometrioid G1',
  lgsc: 'LGSC (serosa derajat rendah)',
  highgrade: 'HGSC / G3',
  clearcell: 'clear cell',
  mucinous: 'musinosa',
};

const GC_LABEL = {
  dysgerminoma: 'disgerminoma',
  immature: 'teratoma imatur',
  yolksac: 'yolk sac / embrional',
  mixed: 'germ cell campuran / lainnya',
};

const SC_LABEL = {
  'adult-granulosa': 'sel granulosa tipe dewasa',
  'juvenile-granulosa': 'sel granulosa tipe juvenil',
  'sertoli-leydig': 'Sertoli–Leydig',
  other: 'sex-cord stromal lainnya',
};

const enDash = (s) => s.replace(/-/g, '–');

// ---------- Karsinoma epitelial (algoritma asli) ----------
function recommendEpithelial(i) {
  const chemo = [];
  const targeted = [];
  const testing = [];
  let headline;

  const indolent = i.histo === 'lowgrade' || i.histo === 'lgsc' || i.histo === 'mucinous';
  const advanced = i.stage === 'III' || i.stage === 'IV';
  const bevYes = i.bev === 'yes';

  // ---------- Kemoterapi / terapi utama ----------
  if (i.stage === 'IA-IB') {
    if (indolent) {
      if (i.staged === 'complete') {
        headline = 'Observasi dapat dipertimbangkan';
        chemo.push('Stadium IA–IB derajat rendah dengan surgical staging komprehensif: observasi tanpa kemoterapi adjuvant adalah pilihan yang diterima.');
      } else {
        headline = 'Lengkapi staging lebih dulu';
        chemo.push('Staging bedah belum lengkap pada penyakit tampak dini: pertimbangkan restaging bedah; bila tidak memungkinkan, kemoterapi berbasis platinum dapat dipertimbangkan.');
      }
    } else {
      headline = 'Kemoterapi adjuvant berbasis platinum';
      chemo.push('Stadium IA–IB high-grade / clear cell: karboplatin–paklitaksel direkomendasikan.');
      chemo.push(i.histo === 'clearcell' ? 'Clear cell: umumnya 6 siklus.' : 'High-grade: 3–6 siklus (banyak protokol menganjurkan 6).');
    }
  } else if (i.stage === 'IC') {
    headline = 'Kemoterapi adjuvant berbasis platinum';
    chemo.push('Stadium IC (apa pun derajat): karboplatin–paklitaksel, 3–6 siklus (high-grade/clear cell cenderung 6 siklus).');
  } else if (i.stage === 'II') {
    headline = 'Kemoterapi adjuvant berbasis platinum';
    chemo.push('Stadium II: karboplatin–paklitaksel 6 siklus.');
  } else {
    headline = 'Kemoterapi sistemik ≥ 6 siklus + pertimbangan rumatan';
    chemo.push('Karboplatin–paklitaksel ≥ 6 siklus merupakan tulang punggung terapi.');
    if (i.stage === 'III' && i.residual === 'R0') {
      chemo.push('Pada interval debulking dengan R0, HIPEC dapat dipertimbangkan sesuai seleksi & protokol.');
    }
  }

  // ---------- Terapi tertarget & rumatan ----------
  // Bevacizumab front-line (semua epitelial lanjut kecuali musinosa).
  if (advanced && i.histo !== 'mucinous') {
    targeted.push('Bevacizumab konkuren + rumatan (GOG-0218 / ICON7) memperbaiki PFS; pertimbangkan terutama pada risiko tinggi: stadium IV, ada residual pascaoperasi, atau stadium III tidak optimal.');
  }

  // Algoritma rumatan PARP — terutama HGSC stadium lanjut, setelah respons platinum.
  if (advanced && i.histo === 'highgrade') {
    if (i.brca === 'brca') {
      targeted.push('BRCA1/2 mutasi: olaparib rumatan 2 tahun (SOLO-1) — manfaat PFS & OS besar; standar pada BRCAm.');
      if (bevYes) targeted.push('Bila bevacizumab dipakai, kombinasi olaparib + bevacizumab (PAOLA-1) juga sesuai.');
    } else if (i.brca === 'hrd') {
      if (bevYes) targeted.push('HRD-positif (BRCA wild-type) + bevacizumab: olaparib + bevacizumab rumatan (PAOLA-1; PFS 22,1 vs 16,6 bln, OS membaik) — pilihan utama.');
      else targeted.push('HRD-positif tanpa bevacizumab: niraparib rumatan (PRIMA). Olaparib + bevacizumab menjadi opsi bila bevacizumab ditambahkan (PAOLA-1).');
    } else if (i.brca === 'neg') {
      if (bevYes) targeted.push('HR-proficient + bevacizumab: lanjutkan bevacizumab rumatan; penambahan PARP tidak dianjurkan (niraparib tidak dikombinasikan dengan bevacizumab).');
      else targeted.push('HR-proficient / HRD-negatif tanpa bevacizumab: niraparib (PRIMA) memberi manfaat PFS terbatas; observasi juga wajar — diskusikan manfaat vs toksisitas.');
    } else {
      if (bevYes) targeted.push('Status BRCA/HRD belum diketahui: lanjutkan bevacizumab rumatan; bila hasil HRD-positif tambahkan olaparib (PAOLA-1).');
      else targeted.push('Status BRCA/HRD belum diketahui: tanpa bevacizumab, niraparib (PRIMA) dapat dipertimbangkan setelah hasil (manfaat terbesar pada HRD-positif).');
    }
    targeted.push('PARP inhibitor diberikan setelah respons (CR/PR) terhadap platinum; durasi umumnya 2–3 tahun. Niraparib disetujui untuk semua status biomarker tetapi tidak dikombinasi dengan bevacizumab; rukaparib (ATHENA-MONO) opsi monoterapi di sebagian wilayah.');
    targeted.push('Berkembang: DUO-O (durvalumab + bevacizumab + olaparib) memperbaiki PFS pada HGSC non-tBRCA — masih dalam evaluasi/akses terbatas.');
  }

  // Stadium II HGSC: rumatan belum standar.
  if (i.stage === 'II' && i.histo === 'highgrade') {
    targeted.push('Rumatan PARP/bevacizumab belum menjadi standar pada stadium II (bukti pivotal pada stadium III–IV); fokuskan kemoterapi adekuat.');
  }

  // Histologi-spesifik (berlaku lintas stadium).
  if (i.histo === 'lgsc') {
    targeted.push('LGSC sering ER/PR-positif & relatif kurang sensitif platinum: rumatan endokrin (letrozol/anastrozol) makin dipertimbangkan setelah kemoterapi (NCCN).');
    targeted.push('Rekuren: inhibitor MEK trametinib = standar (GOG-281/LOGS; PFS 13 vs 7,2 bln). PARP umumnya tidak berperan pada LGSC.');
  } else if (i.histo === 'lowgrade') {
    targeted.push('Endometrioid derajat rendah sering ER/PR-positif: terapi endokrin dapat berperan pada penyakit lanjut/rekuren.');
  } else if (i.histo === 'clearcell') {
    targeted.push('Clear cell: manfaat PARP/bevacizumab belum mapan — pertimbangkan uji klinis. Periksa dMMR/MSI-H → pembrolizumab (agnostik tumor) bila positif.');
  } else if (i.histo === 'mucinous') {
    targeted.push('Musinosa: PARP/bevacizumab tidak diindikasikan; singkirkan metastasis GI, pertimbangkan status HER2 & regimen tipe-GI (mis. 5-FU/oksaliplatin) pada kasus terpilih.');
  }

  // ---------- Biomarker & uji yang dianjurkan ----------
  if (i.histo !== 'mucinous') {
    testing.push('Uji BRCA1/2 germline + somatik dianjurkan untuk semua karsinoma epitelial nonmusinosa (memandu rumatan, prognosis, dan konseling keluarga).');
  }
  if (advanced && i.histo === 'highgrade' && (i.brca === 'unknown' || i.brca === 'hrd' || i.brca === 'neg')) {
    testing.push('Tambahkan uji HRD (skor instabilitas genomik) untuk memilih rumatan PARP ± bevacizumab.');
  }
  if (i.histo === 'clearcell' || i.histo === 'lowgrade') {
    testing.push('Pertimbangkan uji dMMR/MSI (lebih sering pada clear cell & endometrioid) sebagai kandidat pembrolizumab.');
  }
  testing.push('Penyakit rekuren (di luar lingkup alat ini): mirvetuximab soravtansine bila FRα-positif & platinum-resistant (MIRASOL). Checkpoint inhibitor rutin belum menjadi standar lini pertama (IMagyn050, JAVELIN-100 negatif).');

  return {
    headline,
    sub: `Stadium ${enDash(i.stage)} · ${HISTO_LABEL[i.histo]} · karsinoma epitelial ovarium`,
    sections: [
      ['Kemoterapi / terapi utama', chemo],
      ['Terapi tertarget & rumatan', targeted],
      ['Biomarker & uji yang dianjurkan', testing],
    ],
    refs: 'Rujukan utama: SOLO-1 (olaparib, BRCAm), PAOLA-1 (olaparib+bevacizumab, HRD+), PRIMA (niraparib), GOG-0218/ICON7 (bevacizumab), ATHENA-MONO (rukaparib), DUO-O (durvalumab+bev+olaparib), GOG-281/LOGS (trametinib, LGSC); selaras NCCN Ovarian v3.2025.',
  };
}

// ---------- Tumor germ cell ganas (MOGCT) ----------
function recommendGermCell(i) {
  const surgery = [];
  const chemo = [];
  const markers = [];
  const notes = [];
  let headline;

  surgery.push('Bedah fertility-sparing (salpingo-ooforektomi unilateral + staging bedah) adalah standar pada perempuan usia reproduktif — MOGCT sangat kemosensitif dan sering kuratif meski stadium lanjut, sehingga uterus & ovarium kontralateral umumnya dapat dipertahankan.');

  const stageIA = i.stage === 'IA';
  const advanced = i.stage === 'II-IV';

  // Surveilans hanya untuk dua skenario risiko-terendah.
  const surveil =
    (i.histo === 'dysgerminoma' && stageIA) ||
    (i.histo === 'immature' && stageIA && i.grade === 'G1');

  if (surveil) {
    headline = 'Surveilans — tanpa kemoterapi adjuvant';
    chemo.push(i.histo === 'dysgerminoma'
      ? 'Disgerminoma stadium IA (reseksi lengkap, staging memadai): surveilans ketat tanpa kemoterapi adjuvant — kemoterapi disimpan untuk relaps dan tetap sangat kuratif.'
      : 'Teratoma imatur stadium IA grade 1: surveilans tanpa kemoterapi adjuvant.');
    chemo.push('Surveilans: pemeriksaan klinis, penanda tumor serial, dan pencitraan berkala sesuai protokol.');
  } else {
    headline = 'Kemoterapi adjuvant BEP';
    const cycles = advanced
      ? '3–4 siklus (penyakit lanjut / reseksi tak lengkap cenderung 4 siklus)'
      : '3 siklus (stadium I reseksi lengkap, prognosis baik)';
    chemo.push(`Kemoterapi BEP (bleomisin + etoposid + cisplatin) adalah standar: ${cycles}.`);
    if (i.histo === 'dysgerminoma') {
      chemo.push('Disgerminoma: karboplatin + etoposid dapat menjadi alternatif untuk mengurangi toksisitas bleomisin pada kasus terpilih (mis. stadium IB–III).');
    }
    if (i.histo === 'immature') {
      chemo.push('Teratoma imatur grade 2–3 atau stadium > IA: BEP adjuvant. Waspadai "growing teratoma syndrome" (massa teratoma matur membesar dengan penanda normal) saat pemantauan pasca-kemoterapi → reseksi bedah.');
    }
    if (i.histo === 'yolksac' || i.histo === 'mixed') {
      chemo.push('Yolk sac / embrional / campuran: hampir selalu memerlukan BEP adjuvant berapa pun stadium (surveilans tidak dianjurkan).');
    }
  }

  markers.push('Pantau penanda sesuai subtipe: AFP (yolk sac, embrional, sebagian teratoma imatur), β-hCG (koriokarsinoma, embrional, sebagian disgerminoma), LDH (disgerminoma). Penanda yang awalnya meningkat berguna untuk menilai respons & deteksi relaps.');

  notes.push('MOGCT umumnya menyerang perempuan muda dan sangat kemosensitif; rujukan ke senter berpengalaman dianjurkan. Hindari penundaan kemoterapi pada penyakit dengan penanda yang naik cepat.');

  const gradeTxt = i.histo === 'immature' ? ` grade ${i.grade === 'G1' ? '1' : '2–3'}` : '';
  return {
    headline,
    sub: `Stadium ${enDash(i.stage)}${gradeTxt} · ${GC_LABEL[i.histo]} · tumor germ cell ovarium`,
    sections: [
      ['Bedah', surgery],
      ['Kemoterapi adjuvant', chemo],
      ['Penanda tumor & pemantauan', markers],
      ['Catatan', notes],
    ],
    refs: 'Rujukan: NCCN Ovarian — Germ Cell Tumors; GOG-78 (surveilans stadium I), GOG-90, regimen BEP (Williams dkk.); selaras ESGO/ESMO tumor ovarium non-epitelial.',
  };
}

// ---------- Tumor sex-cord stromal (SCST) ----------
function recommendSCST(i) {
  const surgery = [];
  const chemo = [];
  const markers = [];
  const notes = [];
  let headline;

  surgery.push('Bedah adalah tata laksana utama. Pada stadium IA perempuan muda, salpingo-ooforektomi unilateral (fertility-sparing) dapat dipertimbangkan; pada penyakit lanjut atau pasien selesai berkeluarga: histerektomi + salpingo-ooforektomi bilateral + staging (biopsi/omentektomi sesuai temuan).');

  const advanced = i.stage === 'II-IV';
  const slPoor = i.histo === 'sertoli-leydig' && i.diff === 'poor';
  const highRisk = i.risk === 'present' || slPoor;

  if (advanced) {
    headline = 'Kemoterapi sistemik berbasis platinum';
    chemo.push('Stadium II–IV: kemoterapi berbasis platinum direkomendasikan. BEP (bleomisin–etoposid–cisplatin) secara historis menjadi standar; karboplatin–paklitaksel makin dipakai karena toleransi lebih baik dengan efikasi yang tampak sebanding (bukti sebagian besar observasional).');
  } else if (i.stage === 'IA-IB' && !highRisk) {
    headline = 'Observasi — tanpa terapi adjuvant';
    chemo.push('Stadium IA–IB tanpa fitur risiko tinggi: observasi/surveilans tanpa kemoterapi adjuvant adalah standar — mayoritas SCST stadium I berprognosis sangat baik.');
  } else {
    headline = 'Observasi vs pertimbangan kemoterapi (individual)';
    chemo.push('Stadium IC atau stadium I dengan fitur risiko tinggi (ruptur intraoperatif, indeks mitotik tinggi, ukuran besar, atau diferensiasi buruk): observasi maupun kemoterapi berbasis platinum sama-sama dapat dibenarkan — bukti lemah; putuskan bersama tumor board.');
  }

  if (slPoor) {
    chemo.push('Sertoli–Leydig berdiferensiasi buruk atau dengan elemen heterolog bersifat lebih agresif → kemoterapi berbasis platinum dipertimbangkan bahkan pada stadium I.');
  }

  notes.push('Radioterapi: peran terbatas; dapat dipertimbangkan untuk penyakit lokal/rekuren terbatas atau paliatif.');
  if (i.histo === 'adult-granulosa') {
    notes.push('Tumor sel granulosa dewasa dapat relaps lambat (bahkan > 5–10 tahun) → perlu pemantauan jangka panjang. Pada rekuren, terapi endokrin (inhibitor aromatase) dapat berperan; bevacizumab merupakan opsi pada kasus terpilih.');
  }

  markers.push('Pantau penanda: inhibin B & AMH (tumor sel granulosa); estradiol dapat meningkat. Pada Sertoli–Leydig dengan virilisasi, testosteron/androgen dapat berguna untuk pemantauan.');

  return {
    headline,
    sub: `Stadium ${enDash(i.stage)} · tumor ${SC_LABEL[i.histo]}${slPoor ? ' (diferensiasi buruk)' : ''} · sex-cord stromal ovarium`,
    sections: [
      ['Bedah', surgery],
      ['Terapi adjuvant', chemo],
      ['Penanda tumor & pemantauan', markers],
      ['Catatan', notes],
    ],
    refs: 'Rujukan: NCCN Ovarian — Sex Cord-Stromal Tumors; bukti sebagian besar retrospektif/observasional (tanpa RCT besar). Pertimbangkan diskusi tumor board & rujukan senter berpengalaman.',
  };
}

// Disclosure kriteria/logika keputusan, menyesuaikan tipe tumor.
function ovarianCriteria(ttype) {
  if (ttype === 'germcell') {
    return criteriaBox(
      h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Surveilans vs kemoterapi (tumor germ cell)'),
      h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.86rem' } },
        h('li', {}, 'Surveilans (tanpa adjuvant): disgerminoma stadium IA; teratoma imatur stadium IA grade 1.'),
        h('li', {}, 'Selebihnya → BEP: 3 siklus (stadium I reseksi lengkap) atau 3–4 siklus (lanjut / reseksi tak lengkap).'),
        h('li', {}, 'Yolk sac / embrional / campuran → hampir selalu BEP berapa pun stadium.')),
      h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Bedah fertility-sparing adalah standar. Penanda: AFP (yolk sac/embrional), β-hCG (koriokarsinoma/embrional), LDH (disgerminoma). Rujukan: NCCN — Germ Cell; GOG-78/90; regimen BEP (Williams).')
    );
  }
  if (ttype === 'scst') {
    return criteriaBox(
      h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Observasi vs kemoterapi (sex-cord stromal)'),
      h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.86rem' } },
        h('li', {}, 'Stadium IA–IB tanpa fitur risiko → observasi.'),
        h('li', {}, 'Stadium IC atau fitur risiko (ruptur, indeks mitotik tinggi, ukuran besar) → observasi vs kemo platinum (individual).'),
        h('li', {}, 'Stadium II–IV → kemoterapi berbasis platinum (BEP atau karbo–paklitaksel).'),
        h('li', {}, 'Sertoli–Leydig diferensiasi buruk / elemen heterolog → pertimbangkan kemo bahkan stadium I.')),
      h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Penanda: inhibin B & AMH. Bukti sebagian besar retrospektif. Rujukan: NCCN — Sex Cord-Stromal Tumors.')
    );
  }
  return criteriaBox(
    h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Logika keputusan (karsinoma epitelial)'),
    h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.86rem' } },
      h('li', {}, 'IA–IB derajat rendah + staging komprehensif → observasi dapat diterima; high-grade / clear cell → kemo platinum.'),
      h('li', {}, 'IC / II / III–IV → karboplatin–paklitaksel (≥ 6 siklus pada penyakit lanjut).'),
      h('li', {}, 'Rumatan PARP terutama HGSC lanjut setelah respons platinum: BRCAm → olaparib (SOLO-1); HRD+ → +bevacizumab (PAOLA-1) atau niraparib (PRIMA).'),
      h('li', {}, 'Bevacizumab front-line pada risiko tinggi (stadium IV, residual, III suboptimal).'),
      h('li', {}, 'Histologi-spesifik: LGSC → endokrin / MEK (trametinib); musinosa → singkirkan GI; clear cell → cek dMMR/MSI.')),
    h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Pilihan rumatan bergantung respons platinum, status BRCA/HRD, & bevacizumab. Selaras NCCN Ovarian.')
  );
}

export default {
  id: 'ovarian-adjuvant',
  name: 'Algoritma Adjuvant Kanker Ovarium',
  short: 'Saran terapi adjuvant kanker ovarium berdasarkan tipe tumor: karsinoma epitelial (kemoterapi + tertarget/rumatan), tumor germ cell ganas, dan tumor sex-cord stromal (bedah, BEP/platinum, surveilans).',
  category: 'Algoritma terapi',
  scope: 'Ovarium (epitelial & non-epitelial)',
  render(container) {
    // Pemilih tipe tumor — menentukan algoritma & kolom yang ditampilkan.
    const ttype = selectField({
      id: 'oa-ttype', label: 'Tipe tumor ovarium',
      options: [
        { value: 'epithelial', label: 'Karsinoma epitelial' },
        { value: 'germcell', label: 'Tumor germ cell ganas' },
        { value: 'scst', label: 'Tumor sex-cord stromal' },
      ], value: 'epithelial',
    });

    // --- Kolom epitelial (algoritma asli) ---
    const stage = selectField({
      id: 'oa-stage', label: 'Stadium FIGO',
      options: [
        { value: 'IA-IB', label: 'IA – IB' },
        { value: 'IC', label: 'IC' },
        { value: 'II', label: 'II' },
        { value: 'III', label: 'III' },
        { value: 'IV', label: 'IV' },
      ], value: 'IA-IB',
    });
    const histo = selectField({
      id: 'oa-histo', label: 'Histologi / derajat',
      options: [
        { value: 'lowgrade', label: 'Endometrioid derajat rendah (G1)' },
        { value: 'lgsc', label: 'Serosa derajat rendah (LGSC)' },
        { value: 'highgrade', label: 'High-grade serosa / G3 (HGSC)' },
        { value: 'clearcell', label: 'Clear cell' },
        { value: 'mucinous', label: 'Musinosa' },
      ], value: 'highgrade',
    });
    const staged = selectField({
      id: 'oa-staged', label: 'Surgical staging lengkap?',
      options: [{ value: 'complete', label: 'Ya — komprehensif' }, { value: 'incomplete', label: 'Tidak / tidak yakin' }],
      value: 'complete',
    });
    const brca = selectField({
      id: 'oa-brca', label: 'Status BRCA / HRD',
      options: [
        { value: 'unknown', label: 'Belum diperiksa' },
        { value: 'brca', label: 'BRCA1/2 mutasi' },
        { value: 'hrd', label: 'HRD-positif (BRCA wild-type)' },
        { value: 'neg', label: 'HRD-negatif / proficient' },
      ], value: 'unknown',
    });
    const bev = selectField({
      id: 'oa-bev', label: 'Bevacizumab pada kemoterapi lini-1?',
      options: [
        { value: 'undecided', label: 'Belum diputuskan' },
        { value: 'yes', label: 'Ya — diberikan bersama kemoterapi' },
        { value: 'no', label: 'Tidak' },
      ], value: 'undecided',
    });
    const residual = selectField({
      id: 'oa-residual', label: 'Penyakit residual pasca-sitoreduksi',
      options: [{ value: 'R0', label: 'R0 (tanpa residual makroskopik)' }, { value: 'residual', label: 'Ada residual' }],
      value: 'R0',
    });

    // --- Kolom germ cell ---
    const gcHisto = selectField({
      id: 'oa-gc-histo', label: 'Subtipe germ cell',
      options: [
        { value: 'dysgerminoma', label: 'Disgerminoma' },
        { value: 'immature', label: 'Teratoma imatur' },
        { value: 'yolksac', label: 'Yolk sac / embrional' },
        { value: 'mixed', label: 'Campuran / lainnya' },
      ], value: 'dysgerminoma',
    });
    const gcStage = selectField({
      id: 'oa-gc-stage', label: 'Stadium FIGO',
      options: [
        { value: 'IA', label: 'IA' },
        { value: 'IB-IC', label: 'IB – IC' },
        { value: 'II-IV', label: 'II – IV' },
      ], value: 'IA',
    });
    const gcGrade = selectField({
      id: 'oa-gc-grade', label: 'Grade (teratoma imatur)',
      options: [{ value: 'G1', label: 'Grade 1' }, { value: 'G23', label: 'Grade 2 – 3' }],
      value: 'G1',
    });

    // --- Kolom sex-cord stromal ---
    const scHisto = selectField({
      id: 'oa-sc-histo', label: 'Subtipe sex-cord stromal',
      options: [
        { value: 'adult-granulosa', label: 'Sel granulosa tipe dewasa' },
        { value: 'juvenile-granulosa', label: 'Sel granulosa tipe juvenil' },
        { value: 'sertoli-leydig', label: 'Sertoli–Leydig' },
        { value: 'other', label: 'Lainnya' },
      ], value: 'adult-granulosa',
    });
    const scStage = selectField({
      id: 'oa-sc-stage', label: 'Stadium FIGO',
      options: [
        { value: 'IA-IB', label: 'IA – IB' },
        { value: 'IC', label: 'IC' },
        { value: 'II-IV', label: 'II – IV' },
      ], value: 'IA-IB',
    });
    const scDiff = selectField({
      id: 'oa-sc-diff', label: 'Diferensiasi (Sertoli–Leydig)',
      options: [
        { value: 'well', label: 'Baik' },
        { value: 'intermediate', label: 'Sedang' },
        { value: 'poor', label: 'Buruk / elemen heterolog' },
      ], value: 'well',
    });
    const scRisk = selectField({
      id: 'oa-sc-risk', label: 'Fitur risiko tinggi (stadium I)',
      options: [
        { value: 'none', label: 'Tidak ada' },
        { value: 'present', label: 'Ada (ruptur / mitotik tinggi / ukuran besar)' },
      ], value: 'none',
    });

    const epiFields = [stage, histo, staged, brca, bev, residual];
    const gcFields = [gcHisto, gcStage, gcGrade];
    const scFields = [scHisto, scStage, scDiff, scRisk];
    const allFields = [ttype, ...epiFields, ...gcFields, ...scFields];

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function show(field, on) { field.el.style.display = on ? '' : 'none'; }

    function toggleContextual() {
      const t = ttype.input.value;
      const isEpi = t === 'epithelial', isGC = t === 'germcell', isSC = t === 'scst';

      epiFields.forEach((f) => show(f, isEpi));
      gcFields.forEach((f) => show(f, isGC));
      scFields.forEach((f) => show(f, isSC));

      if (isEpi) {
        // Kolom epitelial menyesuaikan stadium (perilaku asli).
        const s = stage.input.value;
        const early = s === 'IA-IB';
        const advanced = s === 'III' || s === 'IV';
        show(staged, early);
        show(brca, s === 'II' || advanced);
        show(bev, advanced);
        show(residual, advanced);
      } else if (isGC) {
        show(gcGrade, gcHisto.input.value === 'immature' && gcStage.input.value === 'IA');
      } else if (isSC) {
        show(scDiff, scHisto.input.value === 'sertoli-leydig');
        show(scRisk, scStage.input.value !== 'II-IV');
      }
      calc();
    }

    function section(title, items) {
      if (!items.length) return null;
      return h('div', { style: { marginTop: '14px' } },
        h('p', { style: { fontWeight: '600', margin: '0 0 4px' } }, title),
        h('ul', { style: { margin: '0', paddingLeft: '1.2em' } },
          ...items.map((t) => h('li', { style: { marginBottom: '6px' } }, t))));
    }

    function refsNote(text) {
      return h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '14px 0 0' } }, text);
    }

    function calc() {
      const t = ttype.input.value;
      let res;
      if (t === 'germcell') {
        res = recommendGermCell({ histo: gcHisto.input.value, stage: gcStage.input.value, grade: gcGrade.input.value });
      } else if (t === 'scst') {
        res = recommendSCST({ histo: scHisto.input.value, stage: scStage.input.value, diff: scDiff.input.value, risk: scRisk.input.value });
      } else {
        res = recommendEpithelial({
          stage: stage.input.value, histo: histo.input.value, staged: staged.input.value,
          brca: brca.input.value, bev: bev.input.value, residual: residual.input.value,
        });
      }
      showResult(result, {
        headline: res.headline,
        sub: res.sub,
        extra: [
          ...res.sections.map(([title, items]) => section(title, items)),
          refsNote(res.refs),
          ovarianCriteria(t),
        ],
      });
    }

    allFields.forEach((f) => f.input.addEventListener('change', toggleContextual));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Pilih tipe tumor — kolom & algoritma menyesuaikan. Epitelial: stadium, histologi, BRCA/HRD, bevacizumab. Germ cell & sex-cord stromal: subtipe & stadium (tumor non-epitelial, relatif jarang).'),
        h('div', { class: 'form-grid' }, ...allFields.map((f) => f.el)),
        result,
        disclaimerNote('Penyederhanaan dari NCCN/ESGO–ESMO. Pada karsinoma epitelial, pilihan tertarget/rumatan bergantung pada respons platinum, toksisitas, akses obat, dan tumor board. Rekomendasi tumor germ cell & sex-cord stromal bersandar pada bukti yang lebih terbatas (terutama observasional pada sex-cord stromal) — kelola di senter berpengalaman.')
      )
    );

    toggleContextual();
  },
};
