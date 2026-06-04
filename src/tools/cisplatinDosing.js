import { h } from '../utils/dom.js';
import { num, round, field, selectField, stat, showResult, disclaimerNote } from './shared.js';

export default {
  id: 'cisplatin-dosing',
  name: 'Dosis Berbasis BSA (Cisplatin & lainnya)',
  short: 'Hitung dosis total dari dosis per m² dan BSA. Praset cisplatin mingguan & 3-mingguan.',
  category: 'Dosis kemoterapi',
  scope: 'Serviks, vagina, dll.',
  render(container) {
    const preset = selectField({
      id: 'cp-preset',
      label: 'Praset regimen',
      options: [
        { value: '40', label: 'Cisplatin mingguan 40 mg/m² (kemoradiasi, cap 70 mg)' },
        { value: '50', label: 'Cisplatin 50 mg/m² (q3 minggu)' },
        { value: '75', label: 'Cisplatin 75 mg/m² (q3 minggu)' },
        { value: 'custom', label: 'Kustom (isi sendiri)' },
      ],
      value: '40',
    });
    const dosePerM2 = field({ id: 'cp-dose', label: 'Dosis', unit: 'mg/m²', value: '40', attrs: { min: '1' } });
    const weight = field({ id: 'cp-w', label: 'Berat badan', unit: 'kg', attrs: { min: '20', placeholder: 'mis. 60' } });
    const height = field({ id: 'cp-h', label: 'Tinggi badan', unit: 'cm', attrs: { min: '100', placeholder: 'mis. 158' } });
    const capWeekly = h('input', { id: 'cp-cap', type: 'checkbox', checked: true });
    const capRow = h('label', { class: 'field--inline', for: 'cp-cap' }, capWeekly,
      h('span', {}, 'Terapkan batas 70 mg untuk cisplatin mingguan'));

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function applyPreset() {
      const v = preset.input.value;
      if (v !== 'custom') dosePerM2.input.value = v;
      capWeekly.parentElement.style.display = v === '40' ? '' : 'none';
      calc();
    }

    function calc() {
      const dpm = num(dosePerM2.input.value);
      const wkg = num(weight.input.value);
      const hcm = num(height.input.value);
      if (!(dpm > 0) || !(wkg > 0) || !(hcm > 0)) { result.hidden = true; return; }
      const bsa = Math.sqrt((hcm * wkg) / 3600);
      let dose = dpm * bsa;
      const isWeekly = preset.input.value === '40';
      const capApplied = isWeekly && capWeekly.checked && dose > 70;
      if (capApplied) dose = 70;

      showResult(result, {
        headline: `${round(dose, 0)} mg`,
        sub: `Dosis total per pemberian${capApplied ? ' (dibatasi 70 mg)' : ''}.`,
        stats: [
          stat(`${round(bsa, 2)} m²`, 'BSA (Mosteller)'),
          stat(`${dpm} mg/m²`, 'Dosis per m²'),
          stat(`${round(dpm * bsa, 0)} mg`, 'Sebelum batas'),
        ],
        extra: [
          capApplied ? h('p', { class: 'muted', style: { fontSize: '.82rem', marginTop: '12px', marginBottom: '0' } },
            'Cisplatin mingguan umumnya dibatasi 70 mg/pemberian pada protokol kemoradiasi.') : null,
        ],
      });
    }

    preset.input.addEventListener('change', applyPreset);
    [dosePerM2.input, weight.input, height.input, capWeekly].forEach((el) => el.addEventListener('input', () => {
      if (el === dosePerM2.input) preset.input.value = 'custom';
      calc();
    }));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Dosis total = dosis per m² × BSA (Mosteller). Cocok untuk cisplatin dan obat berbasis mg/m² lainnya.'),
        h('div', { class: 'form-grid' }, preset.el, dosePerM2.el, weight.el, height.el),
        h('div', { style: { marginTop: '4px' } }, capRow),
        result,
        disclaimerNote('Sesuaikan dengan fungsi ginjal, hidrasi, antiemetik, dan modifikasi dosis per protokol. Verifikasi dengan apoteker onkologi.')
      )
    );

    applyPreset();
  },
};
