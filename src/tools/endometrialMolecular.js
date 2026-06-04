import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';

const GROUPS = {
  low: { label: 'Risiko Rendah', pill: 'risk-low', adj: 'Tanpa terapi adjuvant.' },
  intermediate: { label: 'Risiko Menengah', pill: 'risk-int', adj: 'Brakiterapi vagina (VBT) untuk menurunkan kekambuhan vaginal; observasi dapat dipertimbangkan pada kasus terpilih (mis. usia < 60 tahun, LVSI negatif).' },
  highInt: { label: 'Risiko Menengah-Tinggi', pill: 'risk-int', adj: 'VBT direkomendasikan. Bila LVSI substansial atau stadium II, pertimbangkan EBRT; kemoterapi pada kasus terpilih. Penilaian KGB (SLN) membantu stratifikasi.' },
  high: { label: 'Risiko Tinggi', pill: 'risk-high', adj: 'EBRT ± kemoterapi (sekuensial/konkuren). Kemoterapi terutama untuk p53abn, serous, dan karsinosarkoma.' },
  advanced: { label: 'Lanjut / Metastatik', pill: 'risk-high', adj: 'Kemoterapi sistemik (karboplatin–paklitaksel) sebagai tata laksana utama ± radioterapi. Pertimbangkan imunoterapi (anti–PD-1) pada penyakit MMRd/dMMR lanjut/rekuren.' },
};

// Algoritma klasifikasi molekuler ProMisE/TCGA — sekuensial: POLE → MMR → p53 → NSMP.
// Multiple classifier diselesaikan dengan hierarki POLEmut > MMRd > p53abn.
// Mengembalikan { cls, label, tone, note }; `cls` cocok dengan kunci yang dipakai classify().
function deriveMolecular({ pole, mmr, p53 }) {
  const poleMut = pole === 'mutated';
  const dmmr = mmr === 'deficient';
  const p53abn = p53 === 'abnormal';
  const poleAssessed = pole !== 'notdone';
  const mmrAssessed = mmr !== 'notdone';
  const p53Assessed = p53 !== 'notdone';
  const multi = [poleMut, dmmr, p53abn].filter(Boolean).length >= 2;

  // 1. POLEmut — prioritas tertinggi
  if (poleMut) {
    return {
      cls: 'POLEmut', label: 'POLEmut (POLE ultramutated)', tone: 'good',
      note: multi
        ? 'Multiple classifier: ada ≥ 1 penanda lain positif, tetapi POLEmut berprioritas tertinggi → diklasifikasikan POLEmut (prognosis sangat baik).'
        : 'Mutasi patogenik domain eksonuklease POLE → prognosis sangat baik.',
    };
  }

  // 2. MMRd — bila POLE tidak bermutasi
  if (dmmr) {
    let note = p53abn
      ? 'Multiple classifier: dMMR + p53 abnormal → diklasifikasikan MMRd; abnormalitas p53 dianggap sekunder/subklonal.'
      : 'Defisiensi MMR (dMMR / MSI-H). Pertimbangkan skrining sindrom Lynch.';
    if (!poleAssessed) note += ' POLE belum diperiksa — POLEmut (langka) tidak dapat disingkirkan.';
    return { cls: 'MMRd', label: 'MMRd / MSI-H', tone: 'neutral', note };
  }

  // 3. p53abn — bila POLE & MMR tidak positif
  if (p53abn) {
    let note = 'p53 abnormal (mutant-pattern) → p53abn / copy-number high.';
    const pending = [];
    if (!poleAssessed) pending.push('POLE');
    if (!mmrAssessed) pending.push('MMR');
    if (pending.length) note += ` ${pending.join(' & ')} belum diperiksa — kemungkinan multiple classifier belum sepenuhnya tersingkir.`;
    return { cls: 'p53abn', label: 'p53abn (copy-number high)', tone: 'bad', note };
  }

  // 4. NSMP — hanya bila ketiga penanda eksplisit negatif
  if (poleAssessed && mmrAssessed && p53Assessed) {
    return { cls: 'NSMP', label: 'NSMP (no specific molecular profile)', tone: 'neutral', note: 'POLE wild-type, MMR proficient, p53 wild-type → NSMP.' };
  }

  // 5. Data belum cukup untuk menyimpulkan
  return {
    cls: 'unknown', label: 'Indeterminate — data belum lengkap', tone: 'neutral',
    note: 'Penanda belum cukup untuk menyimpulkan subtipe molekuler; kelompok risiko memakai pengelompokan klinikopatologis.',
  };
}

function classify(i) {
  // Penyakit lanjut/metastatik lebih dulu
  if (i.stage === 'IVB') return GROUPS.advanced;
  if (i.stage === 'III-IVA' && i.residual === 'present') return GROUPS.advanced;

  // POLEmut (stadium I–II tanpa residual → prognosis sangat baik)
  if (i.molecular === 'POLEmut') {
    if (i.stage === 'IA' || i.stage === 'IB' || i.stage === 'II') return GROUPS.low;
    if (i.stage === 'III-IVA') return GROUPS.high; // data terbatas pada stadium lanjut
  }

  const myoInvasion = i.myo !== 'none';
  const aggressiveHisto = i.histo !== 'endometrioid'; // serous / clear cell / undiff / karsinosarkoma
  const p53 = i.molecular === 'p53abn';

  // p53abn atau histologi agresif non-endometrioid
  if (p53 || aggressiveHisto) {
    return myoInvasion ? GROUPS.high : GROUPS.intermediate; // IA tanpa invasi miometrium → menengah
  }

  // Sisanya: MMRd / NSMP / unknown, histologi endometrioid
  if (i.stage === 'III-IVA') return GROUPS.high;
  if (i.stage === 'II') return GROUPS.highInt;

  const substantialLVSI = i.lvsi === 'substantial';
  const highGrade = i.grade === 'high';

  if (i.stage === 'IB') {
    if (highGrade || substantialLVSI) return GROUPS.highInt;
    return GROUPS.intermediate; // IB low-grade, LVSI tidak ada/fokal
  }
  // Stadium IA
  if (substantialLVSI) return GROUPS.highInt;
  if (highGrade) return GROUPS.intermediate;
  return GROUPS.low;
}

// Badge subtipe molekuler — warna mengikuti arah prognosis, neutral memakai gaya inline.
function molBadge({ label, tone }) {
  const toneCls = tone === 'good' ? 'risk-low' : tone === 'bad' ? 'risk-high' : '';
  return h('span', {
    class: `risk-pill ${toneCls}`.trim(),
    style: toneCls ? null : { background: 'var(--slate-100)', color: 'var(--slate-700)' },
  }, label);
}

export default {
  id: 'endometrial-molecular',
  name: 'Kelas Molekuler & Kelompok Risiko Endometrium',
  short: 'Turunkan subtipe molekuler (algoritma ProMisE: POLE→MMR→p53) lalu petakan kelompok risiko ESGO 2020 & saran adjuvant.',
  category: 'Algoritma terapi',
  scope: 'Endometrium',
  render(container) {
    // --- Penanda molekuler individual (input algoritma ProMisE) ---
    const pole = selectField({
      id: 'em-pole', label: 'POLE (domain eksonuklease)',
      options: [
        { value: 'notdone', label: 'Tidak diperiksa' },
        { value: 'mutated', label: 'Mutasi patogenik (EDM)' },
        { value: 'wt', label: 'Wild-type' },
      ], value: 'notdone',
    });
    const mmr = selectField({
      id: 'em-mmr', label: 'MMR IHC (MLH1/PMS2/MSH2/MSH6) / MSI',
      options: [
        { value: 'notdone', label: 'Tidak diperiksa' },
        { value: 'deficient', label: 'dMMR / MSI-H (ekspresi hilang)' },
        { value: 'proficient', label: 'pMMR / MSS (utuh)' },
      ], value: 'notdone',
    });
    const p53 = selectField({
      id: 'em-p53', label: 'p53 IHC',
      options: [
        { value: 'notdone', label: 'Tidak diperiksa' },
        { value: 'abnormal', label: 'Abnormal (mutant-pattern)' },
        { value: 'wt', label: 'Wild-type' },
      ], value: 'notdone',
    });

    // --- Faktor klinikopatologis ---
    const stage = selectField({
      id: 'em-stage', label: 'Stadium (anatomik)',
      options: [
        { value: 'IA', label: 'IA (invasi < 50%)' },
        { value: 'IB', label: 'IB (invasi ≥ 50%)' },
        { value: 'II', label: 'II (stroma serviks)' },
        { value: 'III-IVA', label: 'III – IVA' },
        { value: 'IVB', label: 'IVB' },
      ], value: 'IA',
    });
    const histo = selectField({
      id: 'em-histo', label: 'Tipe histologi',
      options: [
        { value: 'endometrioid', label: 'Endometrioid' },
        { value: 'aggressive', label: 'Serous / clear cell / undiff / karsinosarkoma' },
      ], value: 'endometrioid',
    });
    const grade = selectField({
      id: 'em-grade', label: 'Derajat (endometrioid)',
      options: [{ value: 'low', label: 'Derajat rendah (G1–G2)' }, { value: 'high', label: 'Derajat tinggi (G3)' }],
      value: 'low',
    });
    const myo = selectField({
      id: 'em-myo', label: 'Invasi miometrium',
      options: [{ value: 'none', label: 'Tidak ada' }, { value: 'any', label: 'Ada (< 50% atau ≥ 50%)' }],
      value: 'any',
    });
    const lvsi = selectField({
      id: 'em-lvsi', label: 'LVSI',
      options: [{ value: 'none-focal', label: 'Tidak ada / fokal' }, { value: 'substantial', label: 'Substansial' }],
      value: 'none-focal',
    });
    const residual = selectField({
      id: 'em-residual', label: 'Penyakit residual (stadium III–IVA)',
      options: [{ value: 'none', label: 'Tanpa residual' }, { value: 'present', label: 'Ada residual' }],
      value: 'none',
    });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    const sectionLabel = (t) => h('p', { class: 'muted', style: { margin: '0 0 8px', fontSize: '.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em' } }, t);

    function toggleContextual() {
      const endo = histo.input.value === 'endometrioid';
      grade.el.style.display = endo ? '' : 'none';
      lvsi.el.style.display = endo ? '' : 'none';
      myo.el.style.display = !endo || stage.input.value === 'IA' ? '' : 'none';
      residual.el.style.display = stage.input.value === 'III-IVA' ? '' : 'none';
      calc();
    }

    function calc() {
      // Langkah 1: turunkan subtipe molekuler dari penanda individual.
      const mol = deriveMolecular({ pole: pole.input.value, mmr: mmr.input.value, p53: p53.input.value });
      // Langkah 2: petakan ke kelompok risiko ESGO memakai subtipe hasil algoritma.
      const inp = {
        molecular: mol.cls,
        stage: stage.input.value,
        histo: histo.input.value === 'endometrioid' ? 'endometrioid' : 'aggressive',
        grade: grade.input.value,
        // untuk stadium selain IA, anggap ada invasi miometrium kecuali histologi agresif IA dipilih "tidak ada"
        myo: stage.input.value === 'IA' || histo.input.value !== 'endometrioid' ? myo.input.value : 'any',
        lvsi: lvsi.input.value,
        residual: residual.input.value,
      };
      const g = classify(inp);
      showResult(result, {
        extra: [
          sectionLabel('Subtipe molekuler — algoritma ProMisE/TCGA'),
          molBadge(mol),
          mol.note ? h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.84rem' } }, mol.note) : null,
          h('hr', { style: { border: 'none', borderTop: '1px solid var(--teal-100)', margin: '16px 0' } }),
          sectionLabel('Kelompok risiko ESGO/ESMO/ESTRO/ESP 2020'),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } },
            h('span', { class: `risk-pill ${g.pill}` }, g.label),
            mol.cls === 'unknown'
              ? h('span', { class: 'muted', style: { fontSize: '.82rem' } }, 'Tanpa data molekuler lengkap — pengelompokan klinikopatologis.')
              : null),
          h('p', { style: { margin: '14px 0 0', fontWeight: '600' } }, 'Saran adjuvant:'),
          h('p', { style: { margin: '4px 0 0' } }, g.adj),
        ],
      });
    }

    [histo.input, stage.input].forEach((el) => el.addEventListener('change', toggleContextual));
    [pole.input, mmr.input, p53.input, grade.input, myo.input, lvsi.input, residual.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Masukkan hasil penanda molekuler individual — alat menurunkan subtipe (POLEmut / MMRd / p53abn / NSMP) lewat algoritma ProMisE, lalu memetakan kelompok risiko ESGO/ESMO/ESTRO/ESP 2020 dan saran adjuvant. Kolom klinikopatologis menyesuaikan pilihan.'),
        h('div', { class: 'form-grid' }, pole.el, mmr.el, p53.el, stage.el, histo.el, grade.el, myo.el, lvsi.el, residual.el),
        result,
        disclaimerNote('Algoritma molekuler surrogate (ProMisE): POLE → MMR → p53 → NSMP, dengan hierarki POLEmut > MMRd > p53abn untuk multiple classifier. Sekuensing POLE diperlukan untuk memastikan POLEmut/NSMP; pola p53 subklonal & kasus multiple-classifier perlu konfirmasi patologi. Tabel risiko ESGO 2020 disederhanakan (status KGB/SLN, residual, dll.). Selalu cek dokumen asli & diskusi tumor board.')
      )
    );

    toggleContextual();
  },
};
