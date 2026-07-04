import { h, mount } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote, flowDisclosure, resultSection } from './shared.js';

// Algoritma adjuvant sarkoma uteri. Keputusan terutama digerakkan oleh SUBTIPE:
//   LMS              → observasi (stadium I); kemoterapi dipertimbangkan bila lanjut/terreseksi.
//   LG-ESS           → terapi endokrin (anti-estrogen); hindari estrogen.
//   HG-ESS / UUS     → kemoterapi ± RT (agresif).
//   Adenosarkoma     → observasi; kemoterapi bila sarcomatous overgrowth / lanjut.
//   Karsinosarkoma   → diarahkan ke jalur karsinoma endometrium (karboplatin–paklitaksel).
// Sumbu tambahan: stadium, reseptor hormon (ER/PR), dan flag morselasi.

const SUBTYPE_LABEL = {
  lms: 'leiomiosarkoma',
  lgess: 'endometrial stromal sarcoma derajat rendah',
  hgess: 'HG-ESS / sarkoma uterus tak berdiferensiasi',
  adenosarcoma: 'adenosarkoma',
  carcinosarcoma: 'karsinosarkoma',
};

// Diagram alur berbasis subtipe sarkoma uteri.
function flowSarcoma(i) {
  const steps = [{
    kind: 'decision', q: 'Subtipe histologi',
    branches: [
      { t: 'LMS', on: i.subtype === 'lms' },
      { t: 'LG-ESS', on: i.subtype === 'lgess' },
      { t: 'HG-ESS / UUS', on: i.subtype === 'hgess' },
      { t: 'Adenosarkoma', on: i.subtype === 'adenosarcoma' },
      { t: 'Karsinosarkoma', on: i.subtype === 'carcinosarcoma' },
    ],
  }];
  if (i.subtype === 'carcinosarcoma') {
    steps.push({ kind: 'outcome', label: 'Jalur karsinoma endometrium (karbo–paklitaksel ± RT)', tone: 'high' });
  } else if (i.subtype === 'lms') {
    steps.push({ kind: 'decision', q: 'Stadium', branches: [
      { t: 'I', on: i.stage === 'I' }, { t: 'II–III', on: i.stage === 'II-III' }, { t: 'IV', on: i.stage === 'IV' },
    ] });
    steps.push(i.stage === 'I'
      ? { kind: 'outcome', label: 'Observasi (surveilans)', tone: 'low' }
      : i.stage === 'II-III'
        ? { kind: 'outcome', label: 'Pertimbangkan kemoterapi sistemik ± RT', tone: 'int' }
        : { kind: 'outcome', label: 'Terapi sistemik (penyakit lanjut)', tone: 'high' });
  } else if (i.subtype === 'lgess') {
    steps.push({ kind: 'decision', q: 'Stadium', branches: [
      { t: 'I', on: i.stage === 'I' }, { t: 'Lanjut (II–IV)', on: i.stage !== 'I' },
    ] });
    steps.push({ kind: 'outcome', label: i.stage === 'I' ? 'Observasi atau terapi endokrin' : 'Terapi endokrin (anti-estrogen)', tone: 'int' });
  } else if (i.subtype === 'hgess') {
    steps.push({ kind: 'outcome', label: 'Kemoterapi sistemik ± RT (agresif)', tone: 'high' });
  } else {
    const aggressive = i.overgrowth === 'yes' || i.stage === 'IV';
    steps.push({ kind: 'decision', q: 'Sarcomatous overgrowth / stadium lanjut?', branches: [
      { t: 'Tidak', on: !aggressive }, { t: 'Ya', on: aggressive },
    ] });
    steps.push(aggressive
      ? { kind: 'outcome', label: 'Pertimbangkan kemoterapi ± RT', tone: 'high' }
      : { kind: 'outcome', label: 'Observasi (surveilans)', tone: 'low' });
  }
  return steps;
}

export default {
  id: 'uterine-sarcoma-adjuvant',
  name: 'Algoritma Adjuvant Sarkoma Uteri',
  short: 'Pandu terapi adjuvant sarkoma uteri menurut subtipe (LMS, LG-ESS, HG-ESS/UUS, adenosarkoma) — observasi, terapi endokrin, atau kemoterapi ± RT; karsinosarkoma diarahkan ke jalur karsinoma endometrium.',
  category: 'Algoritma terapi',
  scope: 'Sarkoma uteri',
  render(container) {
    const subtype = selectField({
      id: 'us-subtype', label: 'Subtipe histologi',
      options: [
        { value: 'lms', label: 'Leiomiosarkoma (LMS)' },
        { value: 'lgess', label: 'ESS derajat rendah (LG-ESS)' },
        { value: 'hgess', label: 'HG-ESS / sarkoma tak berdiferensiasi (UUS)' },
        { value: 'adenosarcoma', label: 'Adenosarkoma' },
        { value: 'carcinosarcoma', label: 'Karsinosarkoma (MMMT)' },
      ], value: 'lms',
    });
    const stage = selectField({
      id: 'us-stage', label: 'Stadium (FIGO sarkoma)',
      options: [
        { value: 'I', label: 'I — terbatas pada uterus' },
        { value: 'II-III', label: 'II–III — meluas (terreseksi)' },
        { value: 'IV', label: 'IV — invasi organ panggul / metastasis jauh' },
      ], value: 'I',
    });
    const erpr = selectField({
      id: 'us-erpr', label: 'Status reseptor hormon (ER/PR)',
      options: [
        { value: 'unknown', label: 'Belum diperiksa' },
        { value: 'positive', label: 'Positif' },
        { value: 'negative', label: 'Negatif' },
      ], value: 'unknown',
    });
    const overgrowth = selectField({
      id: 'us-overgrowth', label: 'Sarcomatous overgrowth (adenosarkoma)',
      options: [{ value: 'no', label: 'Tidak ada' }, { value: 'yes', label: 'Ada' }], value: 'no',
    });
    const morcellation = selectField({
      id: 'us-morcellation', label: 'Cara pengangkatan tumor',
      options: [{ value: 'no', label: 'Utuh (en bloc)' }, { value: 'yes', label: 'Morselasi' }], value: 'no',
    });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });
    const criteriaWrap = h('div', { style: { marginTop: '18px' } });

    function recommend(i) {
      const surgery = [];
      const main = [];
      const notes = [];

      // --- Karsinosarkoma: diarahkan ke jalur karsinoma endometrium ---
      if (i.subtype === 'carcinosarcoma') {
        main.push('Karsinosarkoma (MMMT) kini diklasifikasikan & di-staging sebagai karsinoma endometrium agresif (memakai FIGO endometrium), bukan sistem sarkoma.');
        main.push('Adjuvant: kemoterapi berbasis platinum — karboplatin–paklitaksel (GOG-261, non-inferior terhadap ifosfamid–paklitaksel) ± radioterapi/brakiterapi sesuai risiko.');
        main.push('Gunakan alat “Kelas Molekuler & Kelompok Risiko Endometrium” dan “Protokol & Dosis Kemoterapi”.');
        return { headline: 'Dikelola sebagai karsinoma endometrium agresif', pill: 'risk-high', pillLabel: 'Jalur karsinoma endometrium', surgery, main, notes };
      }

      // --- Prinsip bedah (semua sarkoma sejati) ---
      surgery.push('Histerektomi total dengan reseksi en bloc; hindari morselasi.');
      surgery.push(i.subtype === 'lgess'
        ? 'Salpingo-ooforektomi bilateral dianjurkan (tumor estrogen-dependent); hindari sumber/terapi estrogen.'
        : 'Salpingo-ooforektomi diindividualisasi (status menopause & reseptor hormon).');
      if (i.morcellation === 'yes') {
        notes.push('Morselasi tumor (terutama tak terduga) memperburuk prognosis akibat diseminasi peritoneal & upstaging — pertimbangkan bedah eksplorasi/penentuan-ulang stadium dan diskusi tumor board.');
      }

      const advanced = i.stage === 'IV';
      const beyond = i.stage === 'II-III';
      let headline, pill, pillLabel;

      if (i.subtype === 'lms') {
        if (i.stage === 'I') {
          headline = 'Observasi (surveilans)'; pill = 'risk-low'; pillLabel = 'Stadium I — observasi';
          main.push('Stadium I LMS: observasi adalah standar. Kemoterapi adjuvant belum terbukti memperbaiki kesintasan (GOG-277 ditutup dini karena akrual buruk; tanpa manfaat OS).');
          main.push('Radioterapi adjuvant tidak memperbaiki kesintasan (EORTC-55874) dan tidak rutin; dapat dipertimbangkan untuk kontrol lokal pada kasus terpilih.');
        } else if (beyond) {
          headline = 'Pertimbangkan kemoterapi sistemik ± RT'; pill = 'risk-int'; pillLabel = 'Stadium II–III — individualisasi';
          main.push('Stadium II–III terreseksi: kemoterapi sistemik adjuvant dapat dipertimbangkan (doksorubisin ± dakarbazin, atau gemsitabin–dosetaksel) — manfaat belum pasti; timbang rasio risiko-manfaat & diskusi tumor board.');
          main.push('RT dapat dipertimbangkan untuk kontrol lokal pada kasus terpilih (bukan untuk kesintasan).');
        } else {
          headline = 'Terapi sistemik (penyakit lanjut)'; pill = 'risk-high'; pillLabel = 'Stadium IV — sistemik';
          main.push('Penyakit lanjut/metastatik: terapi sistemik lini pertama — doksorubisin (± dakarbazin) atau gemsitabin–dosetaksel. Metastasektomi dapat dipertimbangkan pada oligometastasis terpilih.');
          main.push('Lini berikutnya: trabektedin, pazopanib, atau dakarbazin.');
        }
        if (i.erpr === 'positive') {
          main.push('LMS ER/PR-positif: terapi endokrin (inhibitor aromatase) merupakan opsi pada penyakit indolen/lanjut — bukan adjuvant rutin pada stadium dini.');
        }
      } else if (i.subtype === 'lgess') {
        if (i.stage === 'I') {
          headline = 'Observasi atau terapi endokrin'; pill = 'risk-int'; pillLabel = 'LG-ESS stadium I';
          main.push('Stadium I LG-ESS pasca-TH+BSO: observasi atau terapi endokrin adjuvant (inhibitor aromatase; progestin sebagai alternatif). Hindari estrogen.');
        } else {
          headline = 'Terapi endokrin'; pill = 'risk-int'; pillLabel = 'LG-ESS lanjut';
          main.push('LG-ESS lanjut/terreseksi: terapi endokrin (inhibitor aromatase lini pertama; progestin alternatif). Hindari estrogen.');
          main.push('RT dapat dipertimbangkan untuk kontrol lokal pada kasus terpilih.');
        }
        main.push('Kemoterapi sitotoksik umumnya tidak efektif pada LG-ESS (indolen). Dosis letrozol tersedia di alat “Protokol & Dosis Kemoterapi”.');
        if (i.erpr === 'negative') notes.push('LG-ESS umumnya ER/PR-positif; bila dilaporkan negatif, tinjau ulang patologi (singkirkan HG-ESS/UUS).');
      } else if (i.subtype === 'hgess') {
        headline = 'Kemoterapi sistemik ± RT'; pill = 'risk-high'; pillLabel = 'HG-ESS / UUS — agresif';
        main.push('HG-ESS / sarkoma uterus tak berdiferensiasi: agresif & prognosis buruk. Pertimbangkan kemoterapi sistemik (berbasis doksorubisin atau gemsitabin–dosetaksel) ± RT untuk kontrol lokal.');
        if (i.stage === 'I') main.push('Walau stadium I, perilaku agresif → adjuvant sering dipertimbangkan (individualisasi).');
        main.push('Umumnya reseptor hormon negatif → terapi endokrin tidak berperan (HG-ESS dengan rearrangemen YWHAE-NUTM2 atau BCOR).');
      } else { // adenosarcoma
        if (i.overgrowth === 'yes' || advanced) {
          headline = 'Pertimbangkan kemoterapi ± RT'; pill = 'risk-high'; pillLabel = advanced ? 'Adenosarkoma lanjut' : 'Sarcomatous overgrowth';
          main.push('Adenosarkoma dengan sarcomatous overgrowth atau stadium lanjut: perilaku seperti sarkoma derajat tinggi — pertimbangkan kemoterapi sistemik ± RT (terutama bila invasi miometrium dalam).');
        } else {
          headline = 'Observasi (surveilans)'; pill = 'risk-low'; pillLabel = 'Adenosarkoma indolen';
          main.push('Adenosarkoma tanpa sarcomatous overgrowth (stadium I): umumnya indolen — observasi pasca-histerektomi.');
        }
      }

      return { headline, pill, pillLabel, surgery, main, notes };
    }

    const section = resultSection;

    function refsNote() {
      return h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '14px 0 0' } },
        'Rujukan: Reed dkk. (EORTC-55874, Eur J Cancer 2008) — RT adjuvant; Hensley dkk. (GOG-277) — kemoterapi adjuvant LMS stadium I; Powell/Wolfson (GOG-261/GOG-150) — karsinosarkoma; selaras NCCN Uterine Neoplasms & ESGO/EURACAN/GCIG uterine sarcoma.');
    }

    // Tabel ringkasan pendekatan per subtipe; subtipe aktif disorot.
    function renderCriteria(i) {
      const rows = [
        { key: 'lms', cells: ['Leiomiosarkoma (LMS)', 'Observasi (std I); kemoterapi dipertimbangkan bila lanjut/terreseksi'] },
        { key: 'lgess', cells: ['LG-ESS', 'Terapi endokrin (anti-estrogen); hindari estrogen'] },
        { key: 'hgess', cells: ['HG-ESS / tak berdiferensiasi', 'Kemoterapi ± RT (agresif)'] },
        { key: 'adenosarcoma', cells: ['Adenosarkoma', 'Observasi; kemoterapi bila sarcomatous overgrowth / lanjut'] },
        { key: 'carcinosarcoma', cells: ['Karsinosarkoma (MMMT)', 'Jalur karsinoma endometrium (karboplatin–paklitaksel)'] },
      ].map((r) => {
        const on = r.key === i.subtype;
        return h('tr', { style: on ? { background: 'var(--teal-50)', fontWeight: '600' } : null },
          h('td', { style: { width: '1.4em', textAlign: 'center' } }, on ? '▶' : ''),
          ...r.cells.map((c) => h('td', {}, c)));
      });
      mount(criteriaWrap,
        h('p', { class: 'muted', style: { margin: '0 0 6px', fontSize: '.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.05em' } },
          'Ringkasan pendekatan adjuvant per subtipe'),
        h('div', { class: 'table-scroll' },
          h('table', { class: 'data-table' },
            h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Subtipe'), h('th', {}, 'Pendekatan adjuvant utama'))),
            h('tbody', {}, ...rows))),
        h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.8rem' } }, 'Penanda (▶) = subtipe terpilih saat ini.'));
    }

    function toggleContextual() {
      const st = subtype.input.value;
      const isCarcino = st === 'carcinosarcoma';
      const showErpr = st === 'lms' || st === 'lgess' || st === 'hgess';
      stage.el.style.display = isCarcino ? 'none' : '';
      erpr.el.style.display = showErpr ? '' : 'none';
      overgrowth.el.style.display = st === 'adenosarcoma' ? '' : 'none';
      morcellation.el.style.display = isCarcino ? 'none' : '';
      calc();
    }

    function calc() {
      const inp = {
        subtype: subtype.input.value, stage: stage.input.value, erpr: erpr.input.value,
        overgrowth: overgrowth.input.value, morcellation: morcellation.input.value,
      };
      const { headline, pill, pillLabel, surgery, main, notes } = recommend(inp);
      renderCriteria(inp);
      showResult(result, {
        headline,
        sub: `${SUBTYPE_LABEL[inp.subtype]} · pasca-bedah sarkoma uteri`,
        extra: [
          h('div', { style: { marginTop: '10px' } }, h('span', { class: `risk-pill ${pill}` }, pillLabel)),
          flowDisclosure(flowSarcoma(inp)),
          section('Prinsip bedah', surgery),
          section('Terapi adjuvan / sistemik', main),
          section('Catatan', notes),
          refsNote(),
        ],
      });
    }

    subtype.input.addEventListener('change', toggleContextual);
    [stage.input, erpr.input, overgrowth.input, morcellation.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Subtipe histologi menentukan jalur terapi. Pilihan kolom menyesuaikan subtipe. Karsinosarkoma diarahkan ke algoritma karsinoma endometrium.'),
        h('div', { class: 'form-grid' }, subtype.el, stage.el, erpr.el, overgrowth.el, morcellation.el),
        result,
        criteriaWrap,
        disclaimerNote('Penyederhanaan NCCN Uterine Neoplasms & ESGO/EURACAN/GCIG. Bukti adjuvant pada sarkoma uteri terbatas; keputusan mempertimbangkan subtipe pasti, derajat, status reseptor, kondisi pasien, dan diskusi tumor board. Verifikasi dosis kemoterapi/RT dengan protokol institusi.')
      )
    );

    toggleContextual();
  },
};
