import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';

const GROUPS = {
  low: { label: 'Risiko Rendah', pill: 'risk-low', adj: 'Tanpa terapi adjuvant.' },
  intermediate: { label: 'Risiko Menengah', pill: 'risk-int', adj: 'Brakiterapi vagina (VBT) untuk menurunkan kekambuhan vaginal; observasi dapat dipertimbangkan pada kasus terpilih (mis. usia < 60 tahun, LVSI negatif).' },
  highInt: { label: 'Risiko Menengah-Tinggi', pill: 'risk-int', adj: 'VBT direkomendasikan. Bila LVSI substansial atau stadium II, pertimbangkan EBRT; kemoterapi pada kasus terpilih. Penilaian KGB (SLN) membantu stratifikasi.' },
  high: { label: 'Risiko Tinggi', pill: 'risk-high', adj: 'EBRT ± kemoterapi (sekuensial/konkuren). Kemoterapi terutama untuk p53abn, serous, dan karsinosarkoma.' },
  advanced: { label: 'Lanjut / Metastatik', pill: 'risk-high', adj: 'Kemoterapi sistemik (karboplatin–paklitaksel) sebagai tata laksana utama ± radioterapi. Pertimbangkan imunoterapi (anti–PD-1) pada penyakit MMRd/dMMR lanjut/rekuren.' },
};

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

export default {
  id: 'endometrial-molecular',
  name: 'Kelas Molekuler & Kelompok Risiko Endometrium',
  short: 'Tentukan kelompok risiko ESGO/ESMO/ESTRO/ESP 2020 (integrasi molekuler) dan saran adjuvant.',
  category: 'Algoritma terapi',
  scope: 'Endometrium',
  render(container) {
    const molecular = selectField({
      id: 'em-mol', label: 'Kelas molekuler',
      options: [
        { value: 'unknown', label: 'Belum diperiksa (klinikopatologis)' },
        { value: 'POLEmut', label: 'POLEmut' },
        { value: 'MMRd', label: 'MMRd / MSI-H' },
        { value: 'NSMP', label: 'NSMP (p53 wild-type)' },
        { value: 'p53abn', label: 'p53abn' },
      ], value: 'unknown',
    });
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

    function toggleContextual() {
      const endo = histo.input.value === 'endometrioid';
      grade.el.style.display = endo ? '' : 'none';
      lvsi.el.style.display = endo ? '' : 'none';
      myo.el.style.display = !endo || stage.input.value === 'IA' ? '' : 'none';
      residual.el.style.display = stage.input.value === 'III-IVA' ? '' : 'none';
      calc();
    }

    function calc() {
      const inp = {
        molecular: molecular.input.value,
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
        headline: '',
        sub: '',
        extra: [
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } },
            h('span', { class: `risk-pill ${g.pill}` }, g.label),
            molecular.input.value === 'unknown'
              ? h('span', { class: 'muted', style: { fontSize: '.82rem' } }, 'Tanpa data molekuler — pengelompokan klinikopatologis.')
              : null),
          h('p', { style: { margin: '14px 0 0', fontWeight: '600' } }, 'Saran adjuvant:'),
          h('p', { style: { margin: '4px 0 0' } }, g.adj),
        ],
      });
    }

    [histo.input, stage.input].forEach((el) => el.addEventListener('change', toggleContextual));
    [molecular.input, grade.input, myo.input, lvsi.input, residual.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Mengikuti kerangka kelompok risiko ESGO/ESMO/ESTRO/ESP 2020 yang mengintegrasikan kelas molekuler. Kolom menyesuaikan pilihan.'),
        h('div', { class: 'form-grid' }, molecular.el, stage.el, histo.el, grade.el, myo.el, lvsi.el, residual.el),
        result,
        disclaimerNote('Penyederhanaan; tabel risiko asli memiliki nuansa tambahan (mis. status KGB, "no residual"). Selalu cek dokumen ESGO 2020 dan diskusi tumor board.')
      )
    );

    toggleContextual();
  },
};
