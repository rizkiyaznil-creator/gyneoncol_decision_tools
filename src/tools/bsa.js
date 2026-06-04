import { h } from '../utils/dom.js';
import { num, round, field, stat, showResult, disclaimerNote } from './shared.js';

export default {
  id: 'bsa',
  name: 'Kalkulator Luas Permukaan Tubuh (BSA)',
  short: 'Hitung BSA (Mosteller & DuBois) sebagai dasar dosis kemoterapi per m².',
  category: 'Dosis kemoterapi',
  scope: 'Umum',
  render(container) {
    const w = field({ id: 'bsa-w', label: 'Berat badan', unit: 'kg', attrs: { min: '1', placeholder: 'mis. 60' } });
    const ht = field({ id: 'bsa-h', label: 'Tinggi badan', unit: 'cm', attrs: { min: '30', placeholder: 'mis. 158' } });
    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function calc() {
      const weight = num(w.input.value);
      const height = num(ht.input.value);
      if (!(weight > 0) || !(height > 0)) {
        result.hidden = true;
        return;
      }
      const mosteller = Math.sqrt((height * weight) / 3600);
      const dubois = 0.007184 * height ** 0.725 * weight ** 0.425;
      showResult(result, {
        headline: `${round(mosteller, 2)} m²`,
        sub: 'BSA Mosteller — paling lazim dipakai untuk perhitungan dosis kemoterapi.',
        stats: [
          stat(`${round(mosteller, 2)} m²`, 'Mosteller'),
          stat(`${round(dubois, 2)} m²`, 'DuBois & DuBois'),
        ],
        extra: [
          h('p', { class: 'muted', style: { fontSize: '.82rem', marginTop: '12px', marginBottom: '0' } },
            'Mosteller: √(TB × BB / 3600). DuBois: 0,007184 × TB^0,725 × BB^0,425.'),
        ],
      });
    }

    w.input.addEventListener('input', calc);
    ht.input.addEventListener('input', calc);

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Masukkan berat dan tinggi badan untuk menghitung BSA. Hasil diperbarui otomatis.'),
        h('div', { class: 'form-grid' }, w.el, ht.el),
        result,
        disclaimerNote('Untuk obat dengan dosis "capped BSA" (mis. dibatasi 2,0 m²) atau pasien obesitas, ikuti kebijakan protokol institusi.')
      )
    );
  },
};
