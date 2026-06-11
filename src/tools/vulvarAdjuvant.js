import { h, mount } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';

// Algoritma adjuvant pasca-bedah kanker vulva (karsinoma sel skuamosa).
// Dua sumbu keputusan yang relatif independen:
//   1. KGB inguinofemoral — penilaian (SLN vs limfadenektomi) & indikasi RT nodal.
//        SLN positif: GROINSS-V II — ≤2 mm → RT inguinal (alternatif limfadenektomi); >2 mm → limfadenektomi komplet.
//        Pasca-limfadenektomi: GOG-37 — ≥2 KGB positif atau ECE → RT inguinopelvis (± kemoterapi).
//   2. Lesi primer — margin bedah → re-eksisi vs RT vulva.

const HISTO_LABEL = {
  scc: 'karsinoma sel skuamosa',
  other: 'histologi non-skuamosa',
};

export default {
  id: 'vulvar-adjuvant',
  name: 'Algoritma Adjuvant Kanker Vulva',
  short: 'Pandu manajemen KGB inguinofemoral (SLN GROINSS-V II, indikasi RT pasca-limfadenektomi GOG-37) dan terapi lesi primer (margin) pasca-bedah kanker vulva.',
  category: 'Algoritma terapi',
  scope: 'Vulva',
  render(container) {
    const histo = selectField({
      id: 'va-histo', label: 'Tipe histologi',
      options: [
        { value: 'scc', label: 'Karsinoma sel skuamosa' },
        { value: 'other', label: 'Lainnya (melanoma / Bartholin / BCC)' },
      ], value: 'scc',
    });
    const focality = selectField({
      id: 'va-focality', label: 'Ukuran & fokalitas tumor',
      options: [
        { value: 'small', label: 'Unifokal < 4 cm' },
        { value: 'large', label: '≥ 4 cm atau multifokal' },
      ], value: 'small',
    });
    const location = selectField({
      id: 'va-location', label: 'Lokasi tumor',
      options: [
        { value: 'lateral', label: 'Lateral (≥ 2 cm dari garis tengah)' },
        { value: 'midline', label: 'Medial / garis tengah (< 2 cm)' },
      ], value: 'lateral',
    });
    const margin = selectField({
      id: 'va-margin', label: 'Margin bedah lesi primer',
      options: [
        { value: 'ok', label: '≥ 8 mm (adekuat)' },
        { value: 'close', label: 'Dekat (< 8 mm)' },
        { value: 'pos', label: 'Positif' },
      ], value: 'ok',
    });
    const nodeMethod = selectField({
      id: 'va-nodemethod', label: 'Penilaian KGB inguinofemoral',
      options: [
        { value: 'belum', label: 'Belum dilakukan (cN0)' },
        { value: 'sln', label: 'Biopsi KGB sentinel (SLN)' },
        { value: 'ifl', label: 'Limfadenektomi inguinofemoral' },
      ], value: 'belum',
    });
    const slnResult = selectField({
      id: 'va-sln', label: 'Hasil SLN',
      options: [{ value: 'neg', label: 'Negatif' }, { value: 'pos', label: 'Positif (metastasis)' }], value: 'neg',
    });
    const slnSize = selectField({
      id: 'va-slnsize', label: 'Ukuran metastasis SLN terbesar',
      options: [{ value: 'le2', label: '≤ 2 mm' }, { value: 'gt2', label: '> 2 mm' }], value: 'le2',
    });
    const iflNodes = selectField({
      id: 'va-iflnodes', label: 'Jumlah KGB positif (limfadenektomi)',
      options: [{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2+', label: '≥ 2' }], value: '0',
    });
    const ece = selectField({
      id: 'va-ece', label: 'Ekstensi ekstrakapsular (ECE)',
      options: [{ value: 'no', label: 'Tidak ada' }, { value: 'yes', label: 'Ada' }], value: 'no',
    });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });
    const criteriaWrap = h('div', { style: { marginTop: '18px' } });

    function recommend(i) {
      const groin = [];
      const adjuvant = [];
      const notes = [];
      let nodalCat = 'observe';

      // --- Sumbu 1: KGB inguinofemoral ---
      if (i.nodeMethod === 'belum') {
        nodalCat = 'stagingNeeded';
        if (i.focality === 'small') {
          groin.push('cN0, unifokal < 4 cm: biopsi KGB sentinel (SLN) adalah standar penilaian groin (GROINSS-V, GOG-173).');
        } else {
          groin.push('Tumor ≥ 4 cm atau multifokal: SLN tidak tervalidasi → limfadenektomi inguinofemoral.');
        }
        notes.push(i.location === 'lateral'
          ? 'Tumor lateral (≥ 2 cm dari garis tengah): nilai groin ipsilateral lebih dulu; bila positif, evaluasi kontralateral.'
          : 'Tumor medial / melibatkan garis tengah: penilaian groin bilateral.');
      } else if (i.nodeMethod === 'sln') {
        if (i.slnResult === 'neg') {
          groin.push('SLN negatif: tanpa terapi groin lanjutan — surveilans (risiko rekurensi groin rendah, GROINSS-V).');
        } else if (i.slnSize === 'le2') {
          nodalCat = 'slnLowRT';
          groin.push('SLN positif ≤ 2 mm: radioterapi inguinal adjuvan (≈ 50 Gy) merupakan alternatif yang aman terhadap limfadenektomi inguinofemoral (GROINSS-V II).');
        } else {
          nodalCat = 'completionIFL';
          groin.push('SLN positif > 2 mm: limfadenektomi inguinofemoral komplet dianjurkan — RT saja tidak memadai pada subset ini (GROINSS-V II).');
          groin.push('Setelah limfadenektomi, tentukan RT adjuvan dari patologi final (≥ 2 KGB atau ECE → RT inguinopelvis).');
        }
      } else { // ifl
        if (i.iflNodes === '0') {
          groin.push('Limfadenektomi inguinofemoral: KGB negatif — tanpa radioterapi nodal.');
        } else if (i.iflNodes === '1') {
          if (i.ece === 'yes') {
            nodalCat = 'inguinopelvicRT';
            groin.push('1 KGB positif dengan ekstensi ekstrakapsular (ECE): RT inguinopelvis adjuvan diindikasikan.');
          } else {
            nodalCat = 'nodeSingleIndiv';
            groin.push('1 KGB positif tanpa ECE: individualisasi — observasi atau RT inguinal; pertimbangkan RT bila makrometastasis (> 5 mm) (AGO-CaRE-1).');
          }
        } else { // 2+
          nodalCat = 'inguinopelvicRT';
          groin.push('≥ 2 KGB positif: RT inguinopelvis adjuvan (GOG-37 — RT pelvis + groin lebih unggul dibanding reseksi KGB pelvis).');
          if (i.ece === 'yes') groin.push('ECE memperkuat indikasi RT dan dikaitkan dengan prognosis lebih buruk.');
        }
      }

      // RT/kemoterapi nodal
      if (nodalCat === 'inguinopelvicRT') {
        adjuvant.push('Target RT: groin ± pelvis (inguinopelvis).');
        adjuvant.push('Kemoterapi konkuren berbasis cisplatin makin dipertimbangkan pada penyakit KGB-positif (ekstrapolasi dari serviks/anal; didukung NCCN & data retrospektif). Hitung dosis di alat “Protokol & Dosis Kemoterapi”.');
      } else if (nodalCat === 'slnLowRT') {
        adjuvant.push('Target RT: inguinal (± pelvis sesuai kebijakan); umumnya tanpa kemoterapi konkuren pada metastasis ≤ 2 mm.');
      }

      // --- Sumbu 2: lesi primer / margin ---
      if (i.margin === 'pos') {
        adjuvant.push('Lesi primer — margin positif: re-eksisi adalah pilihan utama; bila tidak memungkinkan secara anatomik/fungsional → RT vulva adjuvan.');
      } else if (i.margin === 'close') {
        adjuvant.push('Lesi primer — margin dekat (< 8 mm): ambang 8 mm masih diperdebatkan; pertimbangkan surveilans ketat atau RT vulva pada kasus terpilih (mis. disertai faktor risiko lain).');
      }

      if (i.histo !== 'scc') {
        notes.push('Algoritma ini untuk karsinoma sel skuamosa. Melanoma vulva, karsinoma sel basal, dan adenokarsinoma (mis. kelenjar Bartholin) memiliki tata laksana berbeda.');
      }

      // --- Headline berdasar prioritas ---
      let headline, pill, pillLabel;
      if (nodalCat === 'inguinopelvicRT') { headline = 'RT inguinopelvis adjuvan ± kemoterapi konkuren'; pill = 'risk-high'; pillLabel = 'KGB positif — RT adjuvan'; }
      else if (nodalCat === 'completionIFL') { headline = 'Limfadenektomi inguinofemoral komplet'; pill = 'risk-high'; pillLabel = 'SLN > 2 mm'; }
      else if (nodalCat === 'slnLowRT') { headline = 'RT inguinal adjuvan (alternatif limfadenektomi)'; pill = 'risk-int'; pillLabel = 'SLN ≤ 2 mm'; }
      else if (i.margin === 'pos') { headline = 'Re-eksisi atau RT vulva adjuvan'; pill = 'risk-int'; pillLabel = 'Margin positif'; }
      else if (nodalCat === 'stagingNeeded') { headline = 'Lakukan penilaian KGB inguinofemoral'; pill = 'risk-int'; pillLabel = 'Perlu staging KGB'; }
      else if (nodalCat === 'nodeSingleIndiv') { headline = 'Individualisasi RT inguinal (1 KGB positif)'; pill = 'risk-int'; pillLabel = '1 KGB, tanpa ECE'; }
      else if (i.margin === 'close') { headline = 'Pertimbangkan RT vulva / surveilans ketat'; pill = 'risk-int'; pillLabel = 'Margin dekat'; }
      else { headline = 'Observasi — tanpa terapi adjuvan'; pill = 'risk-low'; pillLabel = 'Risiko rendah'; }

      return { headline, pill, pillLabel, groin, adjuvant, notes };
    }

    function section(title, items) {
      if (!items.length) return null;
      return h('div', { style: { marginTop: '14px' } },
        h('p', { style: { fontWeight: '600', margin: '0 0 4px' } }, title),
        h('ul', { style: { margin: '0', paddingLeft: '1.2em' } },
          ...items.map((t) => h('li', { style: { marginBottom: '6px' } }, t))));
    }

    function refsNote() {
      return h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '14px 0 0' } },
        'Rujukan: Van der Zee dkk. (GROINSS-V, J Clin Oncol 2008) & Oonk dkk. (GROINSS-V II, J Clin Oncol 2021) — SLN; Homesley dkk. (GOG-37, Obstet Gynecol 1986) — RT inguinopelvis; Levenback dkk. (GOG-173) — validasi SLN; Mahner dkk. (AGO-CaRE-1, JNCI 2015); selaras NCCN Vulvar Cancer & ESGO.');
    }

    // Tabel referensi dengan baris terpenuhi disorot (mirip alat serviks).
    function renderCriteria(i) {
      const tones = { high: 'var(--red-50)', int: 'var(--amber-50)', low: 'var(--green-50)' };
      const hl = (on, tone) => on ? { background: tones[tone], fontWeight: '600' } : null;
      const dot = (on) => h('td', { style: { width: '1.4em', textAlign: 'center' } }, on ? '●' : '');
      const rowsFrom = (defs) => defs.map((d) => h('tr', { style: hl(d.on, d.tone) }, dot(d.on), ...d.cells.map((c) => h('td', {}, c))));

      const slnRows = [
        { cells: ['SLN negatif', 'Observasi groin (tanpa terapi lanjutan)'], on: i.nodeMethod === 'sln' && i.slnResult === 'neg', tone: 'low' },
        { cells: ['SLN positif ≤ 2 mm', 'RT inguinal adjuvan — alternatif aman IFL'], on: i.nodeMethod === 'sln' && i.slnResult === 'pos' && i.slnSize === 'le2', tone: 'int' },
        { cells: ['SLN positif > 2 mm', 'Limfadenektomi inguinofemoral komplet'], on: i.nodeMethod === 'sln' && i.slnResult === 'pos' && i.slnSize === 'gt2', tone: 'high' },
      ];
      const iflRows = [
        { cells: ['0 KGB positif', 'Tanpa RT nodal'], on: i.nodeMethod === 'ifl' && i.iflNodes === '0', tone: 'low' },
        { cells: ['1 KGB positif, tanpa ECE', 'Individualisasi (observasi atau RT)'], on: i.nodeMethod === 'ifl' && i.iflNodes === '1' && i.ece === 'no', tone: 'int' },
        { cells: ['1 KGB + ECE, atau ≥ 2 KGB', 'RT inguinopelvis ± kemoterapi'], on: i.nodeMethod === 'ifl' && ((i.iflNodes === '1' && i.ece === 'yes') || i.iflNodes === '2+'), tone: 'high' },
      ];

      const heading = (t) => h('p', { class: 'muted', style: { margin: '0 0 6px', fontSize: '.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em' } }, t);

      mount(criteriaWrap,
        heading('Manajemen SLN positif (GROINSS-V II)'),
        h('div', { class: 'table-scroll' },
          h('table', { class: 'data-table' },
            h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Temuan SLN'), h('th', {}, 'Tindakan'))),
            h('tbody', {}, ...rowsFrom(slnRows)))),
        heading('Indikasi RT inguinopelvis pasca-limfadenektomi (GOG-37)'),
        h('div', { class: 'table-scroll' },
          h('table', { class: 'data-table' },
            h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Temuan KGB'), h('th', {}, 'Tindakan'))),
            h('tbody', {}, ...rowsFrom(iflRows)))),
        h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.8rem' } },
          'Bullet (●) menandai baris yang terpenuhi oleh masukan saat ini.'));
    }

    function toggleContextual() {
      const m = nodeMethod.input.value;
      const stagingPhase = m === 'belum';
      focality.el.style.display = stagingPhase ? '' : 'none';
      location.el.style.display = stagingPhase ? '' : 'none';
      slnResult.el.style.display = m === 'sln' ? '' : 'none';
      slnSize.el.style.display = m === 'sln' && slnResult.input.value === 'pos' ? '' : 'none';
      iflNodes.el.style.display = m === 'ifl' ? '' : 'none';
      ece.el.style.display = m === 'ifl' && iflNodes.input.value !== '0' ? '' : 'none';
      calc();
    }

    function calc() {
      const inp = {
        histo: histo.input.value, focality: focality.input.value, location: location.input.value,
        margin: margin.input.value, nodeMethod: nodeMethod.input.value,
        slnResult: slnResult.input.value, slnSize: slnSize.input.value,
        iflNodes: iflNodes.input.value, ece: ece.input.value,
      };
      const { headline, pill, pillLabel, groin, adjuvant, notes } = recommend(inp);
      renderCriteria(inp);
      showResult(result, {
        headline,
        sub: `${HISTO_LABEL[inp.histo]} · pasca-bedah vulva`,
        extra: [
          h('div', { style: { marginTop: '10px' } }, h('span', { class: `risk-pill ${pill}` }, pillLabel)),
          section('Manajemen KGB inguinofemoral', groin),
          section('Terapi adjuvan', adjuvant),
          section('Catatan', notes),
          refsNote(),
        ],
      });
    }

    [nodeMethod.input, slnResult.input, iflNodes.input].forEach((el) => el.addEventListener('change', toggleContextual));
    [histo.input, focality.input, location.input, margin.input, slnSize.input, ece.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Untuk kanker vulva yang ditangani dengan eksisi lokal radikal/vulvektomi. Pilihan kolom menyesuaikan metode penilaian KGB.'),
        h('div', { class: 'form-grid' }, histo.el, focality.el, location.el, margin.el, nodeMethod.el, slnResult.el, slnSize.el, iflNodes.el, ece.el),
        result,
        criteriaWrap,
        disclaimerNote('Penyederhanaan GROINSS-V/GROINSS-V II, GOG-37, dan NCCN/ESGO. Keputusan akhir mempertimbangkan histologi, beban faktor, kondisi groin, komorbiditas, dan diskusi tumor board. Verifikasi dosis RT/kemoterapi dengan protokol institusi.')
      )
    );

    toggleContextual();
  },
};
