import { h } from '../utils/dom.js';
import { num, round, field, selectField, stat, showResult, disclaimerNote } from './shared.js';

export default {
  id: 'carboplatin-auc',
  name: 'Dosis Carboplatin (Formula Calvert)',
  short: 'Hitung dosis carboplatin dari target AUC dan GFR (estimasi Cockcroft–Gault atau GFR terukur).',
  category: 'Dosis kemoterapi',
  scope: 'Ovarium, endometrium, dll.',
  render(container) {
    const auc = field({ id: 'cb-auc', label: 'Target AUC', unit: 'mg·min/mL', value: '5', attrs: { min: '1', max: '7', step: '0.5' }, hint: 'Lazim: 5–6 (kombinasi) atau 6–7 (agen tunggal).' });

    const method = selectField({
      id: 'cb-method',
      label: 'Sumber GFR',
      options: [
        { value: 'cg', label: 'Estimasi Cockcroft–Gault' },
        { value: 'direct', label: 'GFR / klirens kreatinin terukur' },
      ],
      value: 'cg',
    });

    const age = field({ id: 'cb-age', label: 'Usia', unit: 'tahun', attrs: { min: '18', max: '110', placeholder: 'mis. 55' } });
    const weight = field({ id: 'cb-w', label: 'Berat badan', unit: 'kg', attrs: { min: '20', placeholder: 'mis. 60' } });
    const scr = field({ id: 'cb-scr', label: 'Kreatinin serum', attrs: { min: '0.1', placeholder: 'mis. 0.9' } });
    const scrUnit = selectField({ id: 'cb-scr-unit', label: 'Satuan kreatinin', options: [{ value: 'mgdl', label: 'mg/dL' }, { value: 'umol', label: 'µmol/L' }], value: 'mgdl' });
    const gfrDirect = field({ id: 'cb-gfr', label: 'GFR / CrCl terukur', unit: 'mL/min', attrs: { min: '5', placeholder: 'mis. 90' } });

    const cap = h('input', { id: 'cb-cap', type: 'checkbox', checked: true });
    const capRow = h('label', { class: 'field--inline', for: 'cb-cap' }, cap,
      h('span', {}, 'Batasi GFR maksimal 125 mL/min (rekomendasi untuk mencegah overdosis pada estimasi CrCl tinggi)'));

    const cgFields = h('div', { class: 'form-grid' }, age.el, weight.el, scr.el, scrUnit.el);
    const directFields = h('div', { class: 'form-grid' }, gfrDirect.el);
    directFields.hidden = true;

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function toggleMethod() {
      const m = method.input.value;
      cgFields.hidden = m !== 'cg';
      directFields.hidden = m !== 'direct';
      calc();
    }

    function computeGFR() {
      if (method.input.value === 'direct') return num(gfrDirect.input.value);
      const a = num(age.input.value);
      const wkg = num(weight.input.value);
      let cr = num(scr.input.value);
      if (scrUnit.input.value === 'umol') cr = cr / 88.4; // µmol/L → mg/dL
      if (!(a > 0) || !(wkg > 0) || !(cr > 0)) return NaN;
      // Cockcroft–Gault, faktor 0.85 untuk perempuan (aplikasi ginekologi).
      return ((140 - a) * wkg * 0.85) / (72 * cr);
    }

    function calc() {
      const targetAuc = num(auc.input.value);
      let gfr = computeGFR();
      if (!(targetAuc > 0) || !(gfr > 0)) { result.hidden = true; return; }

      const rawGfr = gfr;
      const capped = cap.checked && gfr > 125;
      if (capped) gfr = 125;

      const dose = targetAuc * (gfr + 25);
      const doseRounded = Math.round(dose / 10) * 10;

      showResult(result, {
        headline: `${doseRounded} mg`,
        sub: `Carboplatin (dibulatkan ke 10 mg terdekat). Dosis presisi: ${round(dose, 0)} mg.`,
        stats: [
          stat(`${round(rawGfr, 0)}`, 'GFR estimasi (mL/min)'),
          stat(`${round(gfr, 0)}`, capped ? 'GFR dipakai (dibatasi)' : 'GFR dipakai'),
          stat(`${targetAuc}`, 'Target AUC'),
        ],
        extra: [
          h('p', { class: 'muted', style: { fontSize: '.82rem', marginTop: '12px', marginBottom: '0' } },
            'Calvert: Dosis (mg) = AUC × (GFR + 25).' +
            (method.input.value === 'cg' ? ' GFR via Cockcroft–Gault (faktor perempuan 0,85).' : '')),
          capped ? h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } },
            `Catatan: GFR estimasi ${round(rawGfr, 0)} dibatasi menjadi 125 mL/min.`) : null,
        ],
      });
    }

    method.input.addEventListener('change', toggleMethod);
    [auc.input, age.input, weight.input, scr.input, scrUnit.input, gfrDirect.input, cap].forEach((el) =>
      el.addEventListener('input', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Aplikasi ini ditujukan untuk pasien ginekologi (perempuan); faktor jenis kelamin Cockcroft–Gault 0,85 sudah diterapkan.'),
        h('div', { class: 'form-grid' }, auc.el, method.el),
        cgFields,
        directFields,
        h('div', { style: { marginTop: '4px' } }, capRow),
        result,
        disclaimerNote('Perhatikan kreatinin terstandardisasi IDMS, fungsi ginjal yang berfluktuasi, dan kebijakan pembatasan dosis institusi. Verifikasi setiap dosis dengan apoteker onkologi.')
      )
    );

    toggleMethod();
  },
};
