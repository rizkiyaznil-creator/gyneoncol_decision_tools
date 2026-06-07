import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';

const HISTO_LABEL = {
  lowgrade: 'endometrioid G1',
  lgsc: 'LGSC (serosa derajat rendah)',
  highgrade: 'HGSC / G3',
  clearcell: 'clear cell',
  mucinous: 'musinosa',
};

export default {
  id: 'ovarian-adjuvant',
  name: 'Algoritma Adjuvant Kanker Ovarium',
  short: 'Saran terapi adjuvant + tertarget/rumatan karsinoma epitelial ovarium berdasarkan stadium, histologi, kelengkapan staging, status BRCA/HRD, dan penggunaan bevacizumab.',
  category: 'Algoritma terapi',
  scope: 'Ovarium (epitelial)',
  render(container) {
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

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function toggleContextual() {
      const s = stage.input.value;
      const early = s === 'IA-IB';
      const advanced = s === 'III' || s === 'IV';
      staged.el.style.display = early ? '' : 'none';
      brca.el.style.display = (s === 'II' || advanced) ? '' : 'none';
      bev.el.style.display = advanced ? '' : 'none';
      residual.el.style.display = advanced ? '' : 'none';
      calc();
    }

    function recommend(i) {
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

      return { headline, chemo, targeted, testing };
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
        'Rujukan utama: SOLO-1 (olaparib, BRCAm), PAOLA-1 (olaparib+bevacizumab, HRD+), PRIMA (niraparib), GOG-0218/ICON7 (bevacizumab), ATHENA-MONO (rukaparib), DUO-O (durvalumab+bev+olaparib), GOG-281/LOGS (trametinib, LGSC); selaras NCCN Ovarian v3.2025.');
    }

    function calc() {
      const inp = {
        stage: stage.input.value, histo: histo.input.value, staged: staged.input.value,
        brca: brca.input.value, bev: bev.input.value, residual: residual.input.value,
      };
      const { headline, chemo, targeted, testing } = recommend(inp);
      showResult(result, {
        headline,
        sub: `Stadium ${inp.stage.replace('-', '–')} · ${HISTO_LABEL[inp.histo]} · karsinoma epitelial ovarium`,
        extra: [
          section('Kemoterapi / terapi utama', chemo),
          section('Terapi tertarget & rumatan', targeted),
          section('Biomarker & uji yang dianjurkan', testing),
          refsNote(),
        ],
      });
    }

    [stage.input].forEach((el) => el.addEventListener('change', toggleContextual));
    [histo.input, staged.input, brca.input, bev.input, residual.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Alat bantu untuk karsinoma epitelial ovarium/tuba/peritoneum. Pilihan kolom menyesuaikan stadium.'),
        h('div', { class: 'form-grid' }, stage.el, histo.el, staged.el, brca.el, bev.el, residual.el),
        result,
        disclaimerNote('Penyederhanaan dari NCCN/ESGO-ESMO. Pilihan terapi tertarget/rumatan bergantung pada respons terhadap platinum, toksisitas, akses obat, komorbiditas, preferensi pasien, dan diskusi tumor board. Tumor non-epitelial memakai algoritma berbeda.')
      )
    );

    toggleContextual();
  },
};
