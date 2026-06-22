import { h } from '../utils/dom.js';
import { num, round, field, selectField, showResult, disclaimerNote, criteriaBox, formula } from './shared.js';

// Triase massa adneksa pra-operasi — empat model penilaian risiko keganasan.
//   RMI 1/2/3 (Jacobs/Tingulstad) · IOTA Simple Rules · ROMA (HE4+CA-125) · IOTA ADNEX (input + kalkulator resmi).

const RMI_FEATURES = [
  { id: 'multiloc', label: 'Kista multilokular' },
  { id: 'solid', label: 'Area solid (padat)' },
  { id: 'bilateral', label: 'Lesi bilateral' },
  { id: 'ascites', label: 'Asites' },
  { id: 'mets', label: 'Metastasis intra-abdomen' },
];

const SR_B = [
  { id: 'b1', label: 'B1 — Kista unilokular' },
  { id: 'b2', label: 'B2 — Komponen solid, diameter terbesar < 7 mm' },
  { id: 'b3', label: 'B3 — Bayangan akustik (acoustic shadow)' },
  { id: 'b4', label: 'B4 — Tumor multilokular halus, diameter < 100 mm' },
  { id: 'b5', label: 'B5 — Tanpa aliran darah (color score 1)' },
];
const SR_M = [
  { id: 'm1', label: 'M1 — Tumor solid ireguler' },
  { id: 'm2', label: 'M2 — Asites' },
  { id: 'm3', label: 'M3 — ≥ 4 struktur papiler' },
  { id: 'm4', label: 'M4 — Tumor multilokular-solid ireguler, diameter ≥ 100 mm' },
  { id: 'm5', label: 'M5 — Aliran darah sangat kuat (color score 4)' },
];

// Kelompok checkbox sederhana → { el, inputs:{id→input} }.
function checkGroup(prefix, items) {
  const inputs = {};
  const rows = items.map((it) => {
    const inp = h('input', { type: 'checkbox', id: `${prefix}-${it.id}` });
    inputs[it.id] = inp;
    return h('label', { for: `${prefix}-${it.id}` }, inp, h('span', {}, it.label));
  });
  return { el: h('div', { class: 'radio-row' }, ...rows), inputs };
}

const fieldset = (legend, ...body) =>
  h('fieldset', {}, h('legend', {}, legend), ...body);

const pill = (cls, label) =>
  h('div', { style: { marginTop: '10px' } }, h('span', { class: `risk-pill ${cls}` }, label));

const section = (title, items) =>
  h('div', { style: { marginTop: '14px' } },
    h('p', { style: { fontWeight: '600', margin: '0 0 4px' } }, title),
    h('ul', { style: { margin: '0', paddingLeft: '1.2em' } }, ...items.map((t) => h('li', { style: { marginBottom: '6px' } }, t))));

export default {
  id: 'adnexal-triage',
  name: 'Triase Massa Adneksa Pra-operasi',
  short: 'Penilaian risiko keganasan massa adneksa sebelum operasi: RMI (1/2/3), IOTA Simple Rules, ROMA (HE4+CA-125), dan input model IOTA ADNEX — untuk memutuskan rujukan ke ginekologi onkologi.',
  category: 'Triase pra-operasi',
  scope: 'Ovarium / adneksa',
  render(container) {
    const model = selectField({
      id: 'adx-model', label: 'Model penilaian',
      options: [
        { value: 'rmi', label: 'RMI — Risk of Malignancy Index' },
        { value: 'sr', label: 'IOTA Simple Rules' },
        { value: 'roma', label: 'ROMA — HE4 + CA-125' },
        { value: 'adnex', label: 'IOTA ADNEX (input + kalkulator resmi)' },
      ], value: 'rmi',
    });

    // ----- Input bersama (RMI / ROMA / ADNEX) -----
    const menopause = selectField({
      id: 'adx-meno', label: 'Status menopause',
      options: [{ value: 'pre', label: 'Pramenopause' }, { value: 'post', label: 'Pascamenopause' }], value: 'pre',
    });
    const ca125 = field({ id: 'adx-ca125', label: 'CA-125', unit: 'U/mL', attrs: { min: '0', placeholder: 'mis. 35' } });

    // ----- RMI -----
    const rmiVersion = selectField({
      id: 'adx-rmiver', label: 'Versi RMI',
      options: [
        { value: '1', label: 'RMI 1 (Jacobs 1990)' },
        { value: '2', label: 'RMI 2 (Tingulstad 1996)' },
        { value: '3', label: 'RMI 3 (Tingulstad 1999)' },
      ], value: '1',
    });
    const rmiFeat = checkGroup('adx-rmi', RMI_FEATURES);
    const rmiBlock = fieldset('Fitur USG (1 poin/fitur)', rmiFeat.el);

    // ----- Simple Rules -----
    const srBFeat = checkGroup('adx-srb', SR_B);
    const srMFeat = checkGroup('adx-srm', SR_M);
    const srBlock = h('div', { class: 'stack' },
      fieldset('Fitur jinak (B)', srBFeat.el),
      fieldset('Fitur ganas (M)', srMFeat.el));

    // ----- ROMA -----
    const he4 = field({ id: 'adx-he4', label: 'HE4', unit: 'pmol/L', attrs: { min: '0', placeholder: 'mis. 70' } });

    // ----- ADNEX -----
    const adxAge = field({ id: 'adx-age', label: 'Usia', unit: 'tahun', attrs: { min: '14', max: '110', placeholder: 'mis. 52' } });
    const adxCenter = selectField({
      id: 'adx-center', label: 'Tipe senter',
      options: [{ value: 'onco', label: 'Senter rujukan onkologi' }, { value: 'other', label: 'Rumah sakit umum' }], value: 'onco',
    });
    const adxLesion = field({ id: 'adx-lesion', label: 'Diameter lesi maksimal', unit: 'mm', attrs: { min: '1', placeholder: 'mis. 80' } });
    const adxSolid = field({ id: 'adx-solid', label: 'Diameter komponen solid maksimal', unit: 'mm', attrs: { min: '0', placeholder: 'mis. 20' }, hint: '0 bila tidak ada komponen solid.' });
    const adxLoc = selectField({ id: 'adx-loc', label: '> 10 lokulus?', options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya' }], value: 'no' });
    const adxPap = selectField({
      id: 'adx-pap', label: 'Jumlah proyeksi papiler',
      options: [{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '> 3' }], value: '0',
    });
    const adxShadow = selectField({ id: 'adx-shadow', label: 'Bayangan akustik?', options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya' }], value: 'no' });
    const adxAsc = selectField({ id: 'adx-asc', label: 'Asites?', options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya' }], value: 'no' });
    const adnexBlock = h('div', { class: 'form-grid' }, adxAge.el, adxCenter.el, adxLesion.el, adxSolid.el, adxLoc.el, adxPap.el, adxShadow.el, adxAsc.el);

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    const show = (el, on) => { el.style.display = on ? '' : 'none'; };
    function toggle() {
      const m = model.input.value;
      show(menopause.el, m === 'rmi' || m === 'roma');
      show(ca125.el, m === 'rmi' || m === 'roma' || m === 'adnex');
      show(rmiVersion.el, m === 'rmi');
      show(rmiBlock, m === 'rmi');
      show(srBlock, m === 'sr');
      show(he4.el, m === 'roma');
      show(adnexBlock, m === 'adnex');
      calc();
    }

    // ---------- Kriteria & rumus per model ----------
    function rmiCriteria() {
      return criteriaBox(
        formula('RMI = U × M × CA-125 (U/mL)'),
        h('p', { style: { margin: '10px 0 4px', fontWeight: '700' } }, 'Skor USG (U) = jumlah fitur (0–5)'),
        h('p', { class: 'muted', style: { margin: '0', fontSize: '.82rem' } }, 'Fitur: multilokular · area solid · bilateral · asites · metastasis intra-abdomen.'),
        h('div', { class: 'table-scroll', style: { marginTop: '8px' } },
          h('table', { class: 'data-table' },
            h('thead', {}, h('tr', {}, h('th', {}, 'Versi'), h('th', {}, 'U (skor 0)'), h('th', {}, 'U (skor 1)'), h('th', {}, 'U (skor 2–5)'), h('th', {}, 'M pra/pasca'))),
            h('tbody', {},
              h('tr', {}, h('td', {}, 'RMI 1'), h('td', {}, '0'), h('td', {}, '1'), h('td', {}, '3'), h('td', {}, '1 / 3')),
              h('tr', {}, h('td', {}, 'RMI 2'), h('td', {}, '1'), h('td', {}, '1'), h('td', {}, '4'), h('td', {}, '1 / 4')),
              h('tr', {}, h('td', {}, 'RMI 3'), h('td', {}, '1'), h('td', {}, '1'), h('td', {}, '3'), h('td', {}, '1 / 3'))))),
        h('p', { style: { margin: '10px 0 0', fontSize: '.86rem' } }, h('strong', {}, 'Ambang: '), 'RMI ≥ 200 → risiko tinggi (rujuk ginekologi onkologi). Sensitivitas ~78%, spesifisitas ~87% pada ambang 200.')
      );
    }
    function srCriteria() {
      return criteriaBox(
        h('p', { style: { margin: '0 0 6px', fontWeight: '700' } }, 'Aturan IOTA Simple Rules'),
        h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.86rem' } },
          h('li', {}, '≥ 1 fitur M dan tidak ada B → ganas.'),
          h('li', {}, '≥ 1 fitur B dan tidak ada M → jinak.'),
          h('li', {}, 'Keduanya ada, atau tidak ada fitur → inkonklusif (~20%) → lanjut model ADNEX / penilaian subjektif ahli.')),
        h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Validasi IOTA: sensitivitas ~93%, spesifisitas ~81% (pada kasus yang terklasifikasi).')
      );
    }
    function romaCriteria(post) {
      return criteriaBox(
        h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Predictive Index (PI) — assay Architect (Abbott)' + (post ? ' · pascamenopause' : ' · pramenopause')),
        formula(post
          ? 'PI = −8,09 + 1,04·ln(HE4) + 0,732·ln(CA-125)'
          : 'PI = −12,0 + 2,38·ln(HE4) + 0,0626·ln(CA-125)'),
        formula('ROMA (%) = 100 × e^PI / (1 + e^PI)'),
        h('p', { style: { margin: '10px 0 0', fontSize: '.86rem' } }, h('strong', {}, 'Ambang (Architect): '), 'pramenopause ≥ 11,4% · pascamenopause ≥ 29,9% → risiko tinggi.'),
        h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.82rem' } }, 'Koefisien & cutoff bergantung jenis assay HE4/CA-125 (Roche Elecsys memakai nilai berbeda). Verifikasi dengan laboratorium Anda.')
      );
    }
    function adnexCriteria() {
      return criteriaBox(
        h('p', { style: { margin: '0 0 6px', fontWeight: '700' } }, '9 prediktor ADNEX'),
        h('p', { class: 'muted', style: { margin: '0', fontSize: '.84rem' } }, 'Usia · CA-125 (opsional) · tipe senter · diameter lesi maks · proporsi jaringan solid (solid maks ÷ lesi maks) · > 10 lokulus · jumlah proyeksi papiler (0/1/2/3/>3) · bayangan akustik · asites.'),
        h('p', { style: { margin: '10px 0 4px', fontWeight: '700' } }, 'Keluaran model'),
        h('p', { class: 'muted', style: { margin: '0', fontSize: '.84rem' } }, 'Probabilitas 5 kategori: jinak · borderline · invasif stadium I · invasif stadium II–IV · metastasis sekunder. Ambang rujukan yang lazim: risiko keganasan total ≥ 10%.'),
        h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Alat ini TIDAK menghitung % ADNEX sendiri: regresi multinomialnya memakai suku polinomial & interaksi yang koefisiennya harus persis. Untuk menjamin akurasi, gunakan kalkulator IOTA resmi (tertaut di atas).')
      );
    }

    // ---------- Perhitungan per model ----------
    function calcRMI() {
      const ca = num(ca125.input.value);
      if (!(ca > 0)) { result.hidden = true; return; }
      const score = RMI_FEATURES.reduce((n, f) => n + (rmiFeat.inputs[f.id].checked ? 1 : 0), 0);
      const post = menopause.input.value === 'post';
      const ver = rmiVersion.input.value;
      let U, M;
      if (ver === '1') { U = score === 0 ? 0 : score === 1 ? 1 : 3; M = post ? 3 : 1; }
      else if (ver === '2') { U = score <= 1 ? 1 : 4; M = post ? 4 : 1; }
      else { U = score <= 1 ? 1 : 3; M = post ? 3 : 1; }
      const rmi = U * M * ca;
      const high = rmi >= 200;
      showResult(result, {
        headline: `RMI ${round(rmi, 0)}`,
        sub: `U ${U} × M ${M} × CA-125 ${round(ca, 0)} · ${post ? 'pascamenopause' : 'pramenopause'} · RMI ${ver} · skor USG ${score}/5`,
        extra: [
          pill(high ? 'risk-high' : 'risk-low', high ? 'Risiko tinggi (≥ 200)' : 'Risiko rendah (< 200)'),
          section('Interpretasi', [high
            ? 'RMI ≥ 200: risiko keganasan tinggi → rujuk ginekologi onkologi untuk staging & operasi di senter rujukan.'
            : 'RMI < 200: risiko keganasan rendah → dapat dikelola sesuai protokol massa adneksa risiko rendah; tetap korelasikan dengan klinis & USG.']),
          rmiCriteria(),
        ],
      });
    }
    function calcSR() {
      const b = SR_B.reduce((n, f) => n + (srBFeat.inputs[f.id].checked ? 1 : 0), 0);
      const m = SR_M.reduce((n, f) => n + (srMFeat.inputs[f.id].checked ? 1 : 0), 0);
      let cls, label, interp;
      if (m > 0 && b === 0) { cls = 'risk-high'; label = 'Ganas (malignant)'; interp = 'Ada fitur M tanpa fitur B → klasifikasi ganas. Rujuk ginekologi onkologi.'; }
      else if (b > 0 && m === 0) { cls = 'risk-low'; label = 'Jinak (benign)'; interp = 'Ada fitur B tanpa fitur M → klasifikasi jinak.'; }
      else { cls = 'risk-int'; label = 'Inkonklusif'; interp = 'Fitur B dan M bersamaan, atau tidak ada fitur sama sekali → tidak terklasifikasi (~20% kasus). Lanjut model ADNEX atau penilaian subjektif ahli USG.'; }
      showResult(result, {
        headline: label,
        sub: `Fitur B: ${b}/5 · Fitur M: ${m}/5`,
        extra: [pill(cls, label), section('Interpretasi', [interp]), srCriteria()],
      });
    }
    function calcROMA() {
      const ca = num(ca125.input.value);
      const he = num(he4.input.value);
      if (!(ca > 0) || !(he > 0)) { result.hidden = true; return; }
      const post = menopause.input.value === 'post';
      const pi = post
        ? -8.09 + 1.04 * Math.log(he) + 0.732 * Math.log(ca)
        : -12.0 + 2.38 * Math.log(he) + 0.0626 * Math.log(ca);
      const roma = 100 * Math.exp(pi) / (1 + Math.exp(pi));
      const cutoff = post ? 29.9 : 11.4;
      const high = roma >= cutoff;
      showResult(result, {
        headline: `ROMA ${round(roma, 1)}%`,
        sub: `HE4 ${round(he, 0)} pmol/L · CA-125 ${round(ca, 0)} U/mL · ${post ? 'pascamenopause' : 'pramenopause'} (ambang ${String(cutoff).replace('.', ',')}%)`,
        extra: [
          pill(high ? 'risk-high' : 'risk-low', high ? `Risiko tinggi (≥ ${String(cutoff).replace('.', ',')}%)` : `Risiko rendah (< ${String(cutoff).replace('.', ',')}%)`),
          section('Interpretasi', [high
            ? 'ROMA di atas ambang → risiko kanker ovarium epitelial tinggi; rujuk ginekologi onkologi.'
            : 'ROMA di bawah ambang → risiko rendah; korelasikan dengan USG & klinis.']),
          romaCriteria(post),
        ],
      });
    }
    function calcADNEX() {
      const lesion = num(adxLesion.input.value);
      const solid = num(adxSolid.input.value);
      const prop = lesion > 0 && solid >= 0 && !Number.isNaN(solid) ? Math.min(solid / lesion, 1) : NaN;
      const caV = num(ca125.input.value);
      const rows = [
        ['Usia', num(adxAge.input.value) > 0 ? `${round(num(adxAge.input.value), 0)} thn` : '—'],
        ['CA-125', caV > 0 ? `${round(caV, 0)} U/mL` : 'tidak dipakai'],
        ['Tipe senter', adxCenter.input.value === 'onco' ? 'Onkologi' : 'Umum'],
        ['Diameter lesi maks', lesion > 0 ? `${round(lesion, 0)} mm` : '—'],
        ['Komponen solid maks', !Number.isNaN(solid) ? `${round(solid, 0)} mm` : '—'],
        ['Proporsi jaringan solid', Number.isFinite(prop) ? `${round(prop * 100, 0)}%` : '—'],
        ['> 10 lokulus', adxLoc.input.value === 'yes' ? 'Ya' : 'Tidak'],
        ['Proyeksi papiler', adxPap.input.value === '4' ? '> 3' : adxPap.input.value],
        ['Bayangan akustik', adxShadow.input.value === 'yes' ? 'Ya' : 'Tidak'],
        ['Asites', adxAsc.input.value === 'yes' ? 'Ya' : 'Tidak'],
      ];
      showResult(result, {
        headline: 'ADNEX — lanjut ke kalkulator resmi',
        sub: 'Prediktor lengkap di bawah; probabilitas dihitung oleh kalkulator IOTA tervalidasi agar koefisien akurat.',
        extra: [
          h('div', { class: 'table-scroll', style: { marginTop: '12px' } },
            h('table', { class: 'data-table' },
              h('tbody', {}, ...rows.map(([k, v]) => h('tr', {}, h('td', {}, k), h('td', {}, h('strong', {}, v))))))),
          h('p', { style: { margin: '14px 0 0' } },
            h('a', { class: 'btn btn--primary', href: 'https://www.evidencio.com/models/show/945', target: '_blank', rel: 'noopener' }, 'Buka kalkulator ADNEX resmi (Evidencio) →')),
          adnexCriteria(),
        ],
      });
    }
    function calc() {
      const m = model.input.value;
      if (m === 'sr') calcSR();
      else if (m === 'roma') calcROMA();
      else if (m === 'adnex') calcADNEX();
      else calcRMI();
    }

    // Semua kontrol → re-evaluasi (toggle menyesuaikan visibilitas lalu menghitung).
    [model.input, menopause.input, rmiVersion.input, adxCenter.input, adxLoc.input, adxPap.input, adxShadow.input, adxAsc.input].forEach((el) => el.addEventListener('change', toggle));
    [ca125.input, he4.input, adxAge.input, adxLesion.input, adxSolid.input].forEach((el) => el.addEventListener('input', calc));
    [...Object.values(rmiFeat.inputs), ...Object.values(srBFeat.inputs), ...Object.values(srMFeat.inputs)].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Penilaian risiko keganasan massa adneksa sebelum operasi untuk memandu rujukan. Pilih model — input menyesuaikan. Hasil bukan diagnosis; korelasikan dengan klinis, USG, dan tumor board.'),
        h('div', { class: 'form-grid' }, model.el, menopause.el, ca125.el, rmiVersion.el, he4.el),
        rmiBlock,
        srBlock,
        adnexBlock,
        result,
        disclaimerNote('Alat triase pendukung, bukan pengganti penilaian klinis/ahli USG. RMI/Simple Rules/ROMA disederhanakan; ambang & performa bervariasi antarpopulasi. ROMA bergantung jenis assay. ADNEX dihitung oleh kalkulator IOTA resmi. Keputusan operasi/rujukan mempertimbangkan keseluruhan konteks pasien.')
      )
    );

    toggle();
  },
};
