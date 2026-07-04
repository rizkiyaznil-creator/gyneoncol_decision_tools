import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote, criteriaBox, flowDisclosure, resultSection } from './shared.js';

// Algoritma tata laksana melanoma mukosa vulvovaginal.
// Sumbu: luas penyakit (lokal/regional/lanjut) + faktor risiko + biomarker (BRAF V600 vs non-V600, KIT).
// Imunoterapi adalah tulang punggung; terapi target hanya bila mutasi pendorong yang relevan.

const SETTING_LABEL = {
  localized: 'lokal terreseksi (stadium I–II)',
  nodal: 'KGB regional terreseksi (stadium III)',
  unresectable: 'lokoregional tidak terreseksi',
  metastatic: 'metastatik (stadium IV)',
};

// Disclosure kriteria: sumbu luas penyakit × biomarker.
function mmCriteria() {
  return criteriaBox(
    h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Luas penyakit → terapi sistemik/adjuvan'),
    h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.86rem' } },
      h('li', {}, 'Lokal IA–IB tipis tanpa ulserasi → eksisi luas + observasi.'),
      h('li', {}, 'Lokal IIB–IIC (tebal dan/atau ulserasi) → pertimbangkan anti–PD-1 adjuvan.'),
      h('li', {}, 'Stadium III terreseksi → anti–PD-1 adjuvan (nivolumab CheckMate-238 / pembrolizumab KEYNOTE-054).'),
      h('li', {}, 'Tidak terreseksi / metastatik → imunoterapi lini-1 (anti–PD-1 atau nivolumab + ipilimumab).')),
    h('p', { style: { margin: '10px 0 4px', fontWeight: '700' } }, 'Terapi target — hanya bila mutasi relevan'),
    h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.84rem' } },
      h('li', {}, 'BRAF V600-mutan → dabrafenib + trametinib (opsi).'),
      h('li', {}, 'KIT-mutan → imatinib (sering pada melanoma mukosa).'),
      h('li', {}, 'BRAF non-V600 → tidak responsif inhibitor BRAF → andalkan imunoterapi.')),
    h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Imunoterapi adalah tulang punggung; respons melanoma mukosa lebih rendah daripada kutaneus. Sebagian bukti diekstrapolasi dari kutaneus. Selaras NCCN Melanoma.')
  );
}

// Diagram alur: luas penyakit → (risiko primer / biomarker) → terapi.
function flowMelanoma(i) {
  const steps = [{
    kind: 'decision', q: 'Luas penyakit',
    branches: [
      { t: 'Lokal (I–II)', on: i.setting === 'localized' },
      { t: 'KGB regional (III)', on: i.setting === 'nodal' },
      { t: 'Tak terreseksi', on: i.setting === 'unresectable' },
      { t: 'Metastatik (IV)', on: i.setting === 'metastatic' },
    ],
  }];
  if (i.setting === 'localized') {
    steps.push({ kind: 'decision', q: 'Faktor risiko primer', branches: [
      { t: 'Tipis tanpa ulserasi', on: i.risk === 'low' }, { t: 'Tebal / ulserasi', on: i.risk === 'high' },
    ] });
    steps.push(i.risk === 'high'
      ? { kind: 'outcome', label: 'Eksisi luas + pertimbangkan anti–PD-1 adjuvan', tone: 'int' }
      : { kind: 'outcome', label: 'Eksisi luas + observasi', tone: 'low' });
  } else if (i.setting === 'nodal') {
    steps.push({ kind: 'outcome', label: 'Anti–PD-1 adjuvan pasca-reseksi (stadium III)', tone: 'high' });
  } else {
    steps.push({ kind: 'decision', q: 'Biomarker', branches: [
      { t: 'BRAF V600', on: i.biomarker === 'braf_v600' },
      { t: 'KIT-mutan', on: i.biomarker === 'kit' },
      { t: 'Lainnya / non-V600', on: !['braf_v600', 'kit'].includes(i.biomarker) },
    ] });
    const label = i.biomarker === 'braf_v600' ? 'Imunoterapi (anti–PD-1 / nivo+ipi); opsi dabrafenib+trametinib'
      : i.biomarker === 'kit' ? 'Imunoterapi; opsi imatinib (inhibitor KIT)'
      : 'Imunoterapi lini-1 (anti–PD-1 atau nivo+ipi)';
    steps.push({ kind: 'outcome', label, tone: 'high' });
  }
  return steps;
}

export default {
  id: 'melanoma-management',
  name: 'Algoritma Tata Laksana Melanoma',
  short: 'Pandu bedah dan terapi sistemik/adjuvan melanoma vulvovaginal menurut luas penyakit dan biomarker (imunoterapi sebagai tulang punggung; target hanya bila BRAF V600 atau KIT-mutan).',
  category: 'Algoritma terapi',
  scope: 'Melanoma ginekologi',
  render(container) {
    const setting = selectField({
      id: 'mm-setting', label: 'Luas penyakit',
      options: [
        { value: 'localized', label: 'Lokal terreseksi (stadium I–II)' },
        { value: 'nodal', label: 'KGB regional terreseksi (stadium III)' },
        { value: 'unresectable', label: 'Lokoregional tidak terreseksi' },
        { value: 'metastatic', label: 'Metastatik (stadium IV)' },
      ], value: 'localized',
    });
    const risk = selectField({
      id: 'mm-risk', label: 'Faktor risiko tumor primer',
      options: [
        { value: 'low', label: 'Tipis tanpa ulserasi (mis. T1, IA–IB)' },
        { value: 'high', label: 'Tebal dan/atau ulserasi (mis. T3–T4, IIB–IIC)' },
      ], value: 'low',
    });
    const biomarker = selectField({
      id: 'mm-biomarker', label: 'Status biomarker',
      options: [
        { value: 'untested', label: 'Belum diuji' },
        { value: 'braf_v600', label: 'BRAF V600-mutan' },
        { value: 'braf_nonv600', label: 'BRAF non-V600' },
        { value: 'kit', label: 'KIT-mutan' },
        { value: 'none', label: 'Tanpa mutasi pendorong (BRAF/KIT/NRAS wt)' },
      ], value: 'untested',
    });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function recommend(i) {
      const surgery = [];
      const systemic = [];
      const notes = [];
      let headline, pill, pillLabel;

      // --- Bedah & lokal ---
      if (i.setting === 'localized') {
        surgery.push('Eksisi lokal luas dengan margin sesuai ketebalan Breslow; biopsi KGB sentinel dipertimbangkan (umumnya Breslow ≥ 0,8–1,0 mm atau ulserasi).');
      } else if (i.setting === 'nodal') {
        surgery.push('Eksisi lokal luas tumor primer + diseksi KGB regional terapeutik pada KGB klinis/positif.');
      } else {
        surgery.push('Reseksi bukan tata laksana utama; pertimbangkan bedah paliatif (perdarahan/obstruksi) atau metastasektomi pada oligometastasis terpilih.');
      }
      if (i.setting !== 'metastatic') {
        notes.push('Radioterapi adjuvan dapat dipertimbangkan untuk kontrol lokal (margin dekat/positif yang tak dapat dieksisi ulang, atau beban KGB tinggi) — bukan untuk kesintasan.');
      }

      // --- Sistemik / adjuvan ---
      if (i.setting === 'localized') {
        if (i.risk === 'high') {
          headline = 'Eksisi luas + pertimbangkan imunoterapi adjuvan';
          pill = 'risk-int'; pillLabel = 'Lokal risiko tinggi';
          systemic.push('Stadium IIB–IIC (tebal dan/atau ulserasi): pertimbangkan imunoterapi adjuvan anti–PD-1 (nivolumab atau pembrolizumab).');
          if (i.biomarker === 'braf_v600') systemic.push('BRAF V600-mutan: dabrafenib + trametinib adjuvan adalah alternatif (data kutaneus COMBI-AD).');
        } else {
          headline = 'Eksisi luas + observasi';
          pill = 'risk-low'; pillLabel = 'Lokal risiko rendah';
          systemic.push('Stadium IA–IB tipis tanpa ulserasi: surveilans; terapi adjuvan tidak rutin.');
        }
      } else if (i.setting === 'nodal') {
        headline = 'Imunoterapi adjuvan pasca-reseksi (stadium III)';
        pill = 'risk-high'; pillLabel = 'KGB regional (III)';
        systemic.push('Stadium III terreseksi: imunoterapi adjuvan anti–PD-1 (nivolumab — CheckMate-238; pembrolizumab — KEYNOTE-054).');
        if (i.biomarker === 'braf_v600') systemic.push('BRAF V600-mutan: dabrafenib + trametinib adjuvan adalah alternatif (COMBI-AD).');
      } else {
        headline = 'Terapi sistemik lini pertama';
        pill = 'risk-high'; pillLabel = SETTING_LABEL[i.setting];
        systemic.push('Tulang punggung imunoterapi: anti–PD-1 (nivolumab/pembrolizumab), atau nivolumab + ipilimumab (respons lebih tinggi, toksisitas lebih besar). Respons melanoma mukosa umumnya lebih rendah dari kutaneus.');
        if (i.biomarker === 'braf_v600') {
          systemic.push('BRAF V600-mutan: inhibitor BRAF/MEK (dabrafenib + trametinib) adalah opsi — terutama bila perlu respons cepat/beban tumor besar; urutan terhadap imunoterapi sesuai diskusi tumor board.');
        } else if (i.biomarker === 'kit') {
          systemic.push('KIT-mutan: inhibitor KIT (imatinib) adalah opsi, terutama bila imunoterapi gagal/kontraindikasi (data fase II).');
        } else if (i.biomarker === 'braf_nonv600') {
          systemic.push('BRAF non-V600: TIDAK responsif terhadap inhibitor BRAF — andalkan imunoterapi.');
        } else if (i.biomarker === 'none') {
          systemic.push('Tanpa mutasi pendorong: imunoterapi adalah pilihan utama.');
        }
        systemic.push('Kemoterapi (dakarbazin/temozolomid) hanya paliatif bila imunoterapi & terapi target tidak tersedia atau gagal.');
      }

      if (i.biomarker === 'untested') {
        notes.push('Uji BRAF, KIT, dan NRAS belum dilakukan — lakukan pada semua melanoma mukosa karena memandu terapi target (VVM sering KIT-mutan & BRAF non-V600, berbeda dari kutaneus).');
      }

      return { headline, pill, pillLabel, surgery, systemic, notes };
    }

    const section = resultSection;

    function refsNote() {
      return h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '14px 0 0' } },
        'Rujukan: CheckMate-238 (nivolumab adjuvan), KEYNOTE-054 (pembrolizumab adjuvan), CheckMate-067 (nivolumab+ipilimumab), COMBI-AD/COMBI-d/v (BRAF/MEK), fase II inhibitor KIT; biomarker VVM dari Hou dkk. (Cancer 2017). Sebagian bukti diekstrapolasi dari melanoma kutaneus; selaras NCCN Melanoma.');
    }

    function toggleContextual() {
      risk.el.style.display = setting.input.value === 'localized' ? '' : 'none';
      calc();
    }

    function calc() {
      const inp = { setting: setting.input.value, risk: risk.input.value, biomarker: biomarker.input.value };
      const { headline, pill, pillLabel, surgery, systemic, notes } = recommend(inp);
      showResult(result, {
        headline,
        sub: `Melanoma vulvovaginal · ${SETTING_LABEL[inp.setting]}`,
        extra: [
          h('div', { style: { marginTop: '10px' } }, h('span', { class: `risk-pill ${pill}` }, pillLabel)),
          flowDisclosure(flowMelanoma(inp)),
          section('Bedah & lokal', surgery),
          section('Terapi sistemik / adjuvan', systemic),
          section('Catatan', notes),
          refsNote(),
          mmCriteria(),
        ],
      });
    }

    setting.input.addEventListener('change', toggleContextual);
    [risk.input, biomarker.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Melanoma mukosa vulvovaginal. Pilih luas penyakit dan biomarker; imunoterapi adalah tulang punggung, terapi target hanya bila mutasi pendorong relevan terdeteksi.'),
        h('div', { class: 'form-grid' }, setting.el, risk.el, biomarker.el),
        result,
        disclaimerNote('Penyederhanaan NCCN Melanoma; banyak bukti diekstrapolasi dari melanoma kutaneus (subgrup mukosa berespons lebih rendah). Pemilihan & urutan terapi bergantung pada biomarker, beban tumor, toksisitas, akses obat, dan diskusi tumor board.')
      )
    );

    toggleContextual();
  },
};
