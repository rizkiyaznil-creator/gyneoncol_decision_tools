import { h, mount } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote, flowDisclosure, resultSection } from './shared.js';

// Algoritma adjuvant pasca-histerektomi radikal pada kanker serviks stadium awal.
//   Kriteria Peters (GOG-109) — faktor risiko TINGGI → kemoradiasi konkuren berbasis cisplatin.
//   Kriteria Sedlis (GOG-92) — kombinasi faktor risiko MENENGAH → radioterapi pelvis (EBRT).
// Peters berprioritas: bila faktor risiko tinggi ada, indikasi kemoradiasi mengalahkan jalur Sedlis.

// Ukuran tumor sebagai kategori; nilai = batas bawah (cm) untuk perbandingan ambang Sedlis.
const SIZE_MIN = { lt2: 0, '2to4': 2, '4to5': 4, ge5: 5 };
const sizeAtLeast = (key, cm) => SIZE_MIN[key] >= cm;

const HISTO_LABEL = {
  scc: 'karsinoma sel skuamosa',
  adeno: 'adenokarsinoma',
  adenosquamous: 'adenoskuamosa',
};

// Faktor risiko tinggi (Peters): margin positif, parametrium positif, atau KGB pelvis positif.
function petersFactors(i) {
  const f = [];
  if (i.margin === 'pos') f.push('margin bedah positif');
  if (i.parametrium === 'pos') f.push('keterlibatan parametrium');
  if (i.nodes === 'pos') f.push('KGB pelvis positif');
  return f;
}

// Baris tabel Sedlis (GOG-92) yang sedang terpenuhi (untuk highlight & alasan).
function sedlisRowActive(i, row) {
  switch (row) {
    case 0: return i.lvsi === 'pos' && i.depth === 'deep';
    case 1: return i.lvsi === 'pos' && i.depth === 'middle' && sizeAtLeast(i.size, 2);
    case 2: return i.lvsi === 'pos' && i.depth === 'superficial' && sizeAtLeast(i.size, 5);
    case 3: return i.lvsi === 'neg' && (i.depth === 'middle' || i.depth === 'deep') && sizeAtLeast(i.size, 4);
    default: return false;
  }
}

const SEDLIS_REASON = [
  'LVSI positif + invasi stroma sepertiga dalam (ukuran berapa pun)',
  'LVSI positif + invasi sepertiga tengah + tumor ≥ 2 cm',
  'LVSI positif + invasi sepertiga superfisial + tumor ≥ 5 cm',
  'LVSI negatif + invasi sepertiga tengah/dalam + tumor ≥ 4 cm',
];

function sedlisReason(i) {
  for (let r = 0; r < 4; r++) if (sedlisRowActive(i, r)) return SEDLIS_REASON[r];
  return null;
}

const listText = (arr) => arr.length > 1 ? arr.slice(0, -1).join(', ') + ' dan ' + arr[arr.length - 1] : arr[0];

// Diagram alur: Peters (risiko tinggi) → Sedlis (risiko menengah) → observasi.
function flowCervical(i) {
  const peters = petersFactors(i);
  const reason = sedlisReason(i);
  const steps = [{
    kind: 'decision', q: 'Faktor risiko tinggi (Peters)?',
    branches: [{ t: 'Ada (margin / parametrium / KGB+)', on: peters.length > 0 }, { t: 'Tidak ada', on: peters.length === 0 }],
  }];
  if (peters.length) {
    steps.push({ kind: 'outcome', label: 'Kemoradiasi konkuren berbasis cisplatin', tone: 'high' });
  } else {
    steps.push({
      kind: 'decision', q: 'Kriteria risiko menengah (Sedlis)?',
      branches: [{ t: 'Terpenuhi', on: !!reason }, { t: 'Tidak', on: !reason }],
    });
    steps.push(reason
      ? { kind: 'outcome', label: 'Radioterapi pelvis adjuvant (EBRT)', tone: 'int' }
      : { kind: 'outcome', label: 'Observasi — tanpa terapi adjuvant', tone: 'low' });
  }
  return steps;
}

export default {
  id: 'cervical-adjuvant',
  name: 'Algoritma Adjuvant Kanker Serviks',
  short: 'Tentukan terapi adjuvant pasca-histerektomi radikal — kriteria Peters (risiko tinggi → kemoradiasi konkuren cisplatin) & Sedlis (risiko menengah → radioterapi pelvis).',
  category: 'Algoritma terapi',
  scope: 'Serviks',
  render(container) {
    const histo = selectField({
      id: 'ca-histo', label: 'Tipe histologi',
      options: [
        { value: 'scc', label: 'Karsinoma sel skuamosa' },
        { value: 'adeno', label: 'Adenokarsinoma' },
        { value: 'adenosquamous', label: 'Adenoskuamosa' },
      ], value: 'scc',
    });
    const margin = selectField({
      id: 'ca-margin', label: 'Margin bedah',
      options: [{ value: 'neg', label: 'Negatif' }, { value: 'pos', label: 'Positif / dekat' }], value: 'neg',
    });
    const parametrium = selectField({
      id: 'ca-param', label: 'Keterlibatan parametrium',
      options: [{ value: 'neg', label: 'Negatif' }, { value: 'pos', label: 'Positif' }], value: 'neg',
    });
    const nodes = selectField({
      id: 'ca-nodes', label: 'KGB pelvis',
      options: [{ value: 'neg', label: 'Negatif' }, { value: 'pos', label: 'Positif' }], value: 'neg',
    });
    const lvsi = selectField({
      id: 'ca-lvsi', label: 'LVSI',
      options: [{ value: 'neg', label: 'Negatif' }, { value: 'pos', label: 'Positif' }], value: 'neg',
    });
    const depth = selectField({
      id: 'ca-depth', label: 'Kedalaman invasi stroma',
      options: [
        { value: 'superficial', label: 'Sepertiga superfisial (luar)' },
        { value: 'middle', label: 'Sepertiga tengah' },
        { value: 'deep', label: 'Sepertiga dalam' },
      ], value: 'superficial',
    });
    const size = selectField({
      id: 'ca-size', label: 'Ukuran tumor (diameter terbesar)',
      options: [
        { value: 'lt2', label: '< 2 cm' },
        { value: '2to4', label: '2 – < 4 cm' },
        { value: '4to5', label: '4 – < 5 cm' },
        { value: 'ge5', label: '≥ 5 cm' },
      ], value: 'lt2',
    });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });
    const criteriaWrap = h('div', { style: { marginTop: '18px' } });

    function recommend(i) {
      const peters = petersFactors(i);
      const reason = sedlisReason(i);
      const main = [];
      const notes = [];
      let headline, pill, pillLabel;

      if (peters.length) {
        headline = 'Kemoradiasi konkuren berbasis cisplatin';
        pill = 'risk-high'; pillLabel = 'Risiko Tinggi (Peters)';
        main.push(`Faktor risiko tinggi (kriteria Peters / GOG-109) terpenuhi: ${listText(peters)}.`);
        main.push('Kemoradiasi pelvis konkuren berbasis cisplatin (mis. cisplatin mingguan 40 mg/m²) memperbaiki kontrol lokal & kesintasan dibanding radioterapi saja (Peters/GOG-109).');
        if (i.margin === 'pos') main.push('Margin (terutama vaginal) positif/dekat → pertimbangkan boost brakiterapi vaginal.');
        if (i.nodes === 'pos') main.push('KGB pelvis positif → lapangan EBRT mencakup pelvis; pertimbangkan perluasan paraaorta bila KGB paraaorta dicurigai/positif.');
        main.push('Dosis cisplatin dapat dihitung di alat “Protokol & Dosis Kemoterapi”.');
        if (reason) notes.push('Faktor risiko menengah (Sedlis) juga terpenuhi, tetapi sudah tercakup oleh indikasi kemoradiasi di atas.');
      } else if (reason) {
        headline = 'Radioterapi pelvis adjuvant (EBRT)';
        pill = 'risk-int'; pillLabel = 'Risiko Menengah (Sedlis)';
        main.push(`Faktor risiko menengah (kriteria Sedlis / GOG-92) terpenuhi: ${reason}.`);
        main.push('EBRT pelvis adjuvant menurunkan rekurensi lokal pada kelompok ini (GOG-92); brakiterapi vaginal dapat ditambahkan pada kasus terpilih.');
        notes.push('Penambahan kemoterapi konkuren pada risiko menengah masih diteliti (GOG-0263) dan belum menjadi standar; sebagian pusat mempertimbangkannya berdasarkan beban faktor.');
      } else {
        headline = 'Observasi — tanpa terapi adjuvant';
        pill = 'risk-low'; pillLabel = 'Risiko Rendah';
        main.push('Tidak memenuhi kriteria Peters (risiko tinggi) maupun Sedlis (risiko menengah): surveilans tanpa terapi adjuvant adalah pilihan standar.');
        main.push('Pemantauan berkala: pemeriksaan klinis ± sitologi/HPV sesuai protokol, serta edukasi gejala rekurensi.');
      }

      if (i.histo !== 'scc') {
        notes.push('Kriteria Sedlis berasal dari kohort yang didominasi karsinoma sel skuamosa; pada adenokarsinoma/adenoskuamosa ambang untuk adjuvant kadang lebih rendah — pertimbangkan diskusi tumor board.');
      }

      return { headline, pill, pillLabel, main, notes };
    }

    const section = resultSection;

    function refsNote() {
      return h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '14px 0 0' } },
        'Rujukan: Sedlis dkk. (GOG-92, Gynecol Oncol 1999) — faktor risiko menengah; Peters dkk. (GOG-109, J Clin Oncol 2000) — faktor risiko tinggi; selaras NCCN Cervical Cancer & ESGO/ESTRO/ESP.');
    }

    // Tabel referensi kriteria dengan baris terpenuhi disorot.
    function renderCriteria(i) {
      const active = (on, tone) => on ? { background: tone === 'high' ? 'var(--red-50)' : 'var(--amber-50)', fontWeight: '600' } : null;
      const dot = (on) => h('td', { style: { width: '1.4em', textAlign: 'center' } }, on ? '●' : '');

      const sedlisRows = [
        ['Positif', 'Sepertiga dalam', 'Berapa pun'],
        ['Positif', 'Sepertiga tengah', '≥ 2 cm'],
        ['Positif', 'Sepertiga superfisial', '≥ 5 cm'],
        ['Negatif', 'Tengah / dalam', '≥ 4 cm'],
      ].map((cells, r) => {
        const on = sedlisRowActive(i, r);
        return h('tr', { style: active(on, 'int') }, dot(on), ...cells.map((c) => h('td', {}, c)));
      });

      const petersDefs = [
        ['Margin bedah positif', i.margin === 'pos'],
        ['Keterlibatan parametrium', i.parametrium === 'pos'],
        ['KGB pelvis positif', i.nodes === 'pos'],
      ].map(([label, on]) => h('tr', { style: active(on, 'high') }, dot(on), h('td', {}, label)));

      mount(criteriaWrap,
        h('p', { class: 'muted', style: { margin: '0 0 6px', fontSize: '.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em' } },
          'Kriteria Sedlis (GOG-92) — risiko menengah → EBRT pelvis'),
        h('div', { class: 'table-scroll' },
          h('table', { class: 'data-table' },
            h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'LVSI'), h('th', {}, 'Invasi stroma'), h('th', {}, 'Ukuran tumor'))),
            h('tbody', {}, ...sedlisRows))),
        h('p', { class: 'muted', style: { margin: '16px 0 6px', fontSize: '.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em' } },
          'Kriteria Peters (GOG-109) — risiko tinggi → kemoradiasi konkuren cisplatin'),
        h('div', { class: 'table-scroll' },
          h('table', { class: 'data-table' },
            h('tbody', {}, ...petersDefs))),
        h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.8rem' } },
          'Bullet (●) menandai faktor/baris yang terpenuhi oleh masukan saat ini. Satu faktor Peters sudah cukup untuk indikasi kemoradiasi.'));
    }

    function calc() {
      const inp = {
        histo: histo.input.value, margin: margin.input.value, parametrium: parametrium.input.value,
        nodes: nodes.input.value, lvsi: lvsi.input.value, depth: depth.input.value, size: size.input.value,
      };
      const { headline, pill, pillLabel, main, notes } = recommend(inp);
      renderCriteria(inp);
      showResult(result, {
        headline,
        sub: `${HISTO_LABEL[inp.histo]} · pasca-histerektomi radikal`,
        extra: [
          h('div', { style: { marginTop: '10px' } }, h('span', { class: `risk-pill ${pill}` }, pillLabel)),
          flowDisclosure(flowCervical(inp)),
          section('Tata laksana', main),
          section('Catatan', notes),
          refsNote(),
        ],
      });
    }

    [histo, margin, parametrium, nodes, lvsi, depth, size].forEach((f) => f.input.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Untuk kanker serviks stadium awal yang ditangani dengan histerektomi radikal + limfadenektomi pelvis. Bukan untuk pasien yang menjalani kemoradiasi definitif primer.'),
        h('div', { class: 'form-grid' }, histo.el, margin.el, parametrium.el, nodes.el, lvsi.el, depth.el, size.el),
        result,
        criteriaWrap,
        disclaimerNote('Penyederhanaan kriteria Sedlis/Peters & NCCN/ESGO. Keputusan akhir mempertimbangkan tipe histologi, beban faktor, status paraaorta, komorbiditas, dan diskusi tumor board. Verifikasi dosis kemoterapi/radioterapi dengan protokol institusi.')
      )
    );

    calc();
  },
};
