import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';

export default {
  id: 'ovarian-adjuvant',
  name: 'Algoritma Adjuvant Kanker Ovarium',
  short: 'Saran terapi adjuvant karsinoma epitelial ovarium berdasarkan stadium, histologi, kelengkapan staging, dan status BRCA/HRD.',
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
        { value: 'lowgrade', label: 'Derajat rendah (G1 endometrioid / LGSC / musinosa)' },
        { value: 'highgrade', label: 'High-grade (HGSC / G3)' },
        { value: 'clearcell', label: 'Clear cell' },
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
      residual.el.style.display = advanced ? '' : 'none';
      calc();
    }

    function recommend(i) {
      const lines = [];
      let headline;
      if (i.stage === 'IA-IB') {
        if (i.histo === 'lowgrade') {
          if (i.staged === 'complete') {
            headline = 'Observasi dapat dipertimbangkan';
            lines.push('Stadium IA–IB derajat rendah dengan surgical staging komprehensif: observasi tanpa kemoterapi adjuvant adalah pilihan yang diterima.');
          } else {
            headline = 'Lengkapi staging lebih dulu';
            lines.push('Staging bedah belum lengkap pada penyakit tampak dini: pertimbangkan restaging bedah; bila tidak memungkinkan, kemoterapi adjuvant berbasis platinum dapat dipertimbangkan.');
          }
        } else {
          headline = 'Kemoterapi adjuvant berbasis platinum';
          lines.push('Stadium IA–IB high-grade / clear cell: karboplatin–paklitaksel direkomendasikan.');
          lines.push(i.histo === 'clearcell' ? 'Clear cell: umumnya 6 siklus.' : 'High-grade: 3–6 siklus (banyak protokol menganjurkan 6).');
        }
      } else if (i.stage === 'IC') {
        headline = 'Kemoterapi adjuvant berbasis platinum';
        lines.push('Stadium IC (apa pun derajat): karboplatin–paklitaksel direkomendasikan, 3–6 siklus (high-grade/clear cell cenderung 6 siklus).');
      } else {
        headline = 'Kemoterapi sistemik ≥ 6 siklus';
        lines.push('Karboplatin–paklitaksel ≥ 6 siklus merupakan tulang punggung terapi.');
        if (i.stage === 'III' || i.stage === 'IV') {
          lines.push('Pertimbangkan penambahan bevacizumab (terutama penyakit volume besar, residual, atau stadium IV).');
          if (i.stage === 'III' && i.residual === 'R0') {
            lines.push('Pada interval debulking dengan R0, HIPEC dapat dipertimbangkan sesuai seleksi & protokol.');
          }
        }
        if (i.brca === 'brca') lines.push('Rumatan PARP inhibitor (mis. olaparib) direkomendasikan pada mutasi BRCA1/2 setelah respons terhadap platinum.');
        else if (i.brca === 'hrd') lines.push('HRD-positif: rumatan PARP inhibitor (± bevacizumab) dapat dipertimbangkan.');
        else if (i.brca === 'neg') lines.push('HRD-negatif/proficient: niraparib rumatan dapat dipertimbangkan (manfaat lebih kecil).');
        else lines.push('Lakukan uji BRCA1/2 (germline + somatik) dan HRD untuk menentukan kandidat rumatan PARP inhibitor.');
      }
      return { headline, lines };
    }

    function calc() {
      const inp = {
        stage: stage.input.value, histo: histo.input.value,
        staged: staged.input.value, brca: brca.input.value, residual: residual.input.value,
      };
      const { headline, lines } = recommend(inp);
      showResult(result, {
        headline,
        sub: `Stadium ${inp.stage.replace('-', '–')} · karsinoma epitelial ovarium`,
        extra: [
          h('ul', { style: { margin: '12px 0 0', paddingLeft: '1.2em' } }, ...lines.map((l) => h('li', { style: { marginBottom: '6px' } }, l))),
        ],
      });
    }

    [stage.input].forEach((el) => el.addEventListener('change', toggleContextual));
    [histo.input, staged.input, brca.input, residual.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Alat bantu untuk karsinoma epitelial ovarium/tuba/peritoneum. Pilihan kolom menyesuaikan stadium.'),
        h('div', { class: 'form-grid' }, stage.el, histo.el, staged.el, brca.el, residual.el),
        result,
        disclaimerNote('Penyederhanaan dari NCCN/ESGO. Keputusan akhir mempertimbangkan komorbiditas, preferensi pasien, tumor non-epitelial (algoritma berbeda), dan diskusi tumor board.')
      )
    );

    toggleContextual();
  },
};
