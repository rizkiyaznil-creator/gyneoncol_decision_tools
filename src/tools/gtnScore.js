import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';

// Faktor & skor sistem prognostik WHO/FIGO yang dimodifikasi (FIGO 2000).
const FACTORS = [
  { id: 'age', label: 'Usia', options: [['< 40 tahun', 0], ['≥ 40 tahun', 1]] },
  { id: 'preg', label: 'Kehamilan antecedent', options: [['Mola', 0], ['Abortus', 1], ['Aterm', 2]] },
  { id: 'interval', label: 'Interval sejak kehamilan indeks', options: [['< 4 bulan', 0], ['4 – < 7 bulan', 1], ['7 – < 13 bulan', 2], ['≥ 13 bulan', 4]] },
  { id: 'hcg', label: 'β-hCG pra-terapi (IU/L)', options: [['< 10³', 0], ['10³ – < 10⁴', 1], ['10⁴ – < 10⁵', 2], ['≥ 10⁵', 4]] },
  { id: 'size', label: 'Ukuran tumor terbesar (termasuk uterus)', options: [['< 3 cm', 0], ['3 – < 5 cm', 1], ['≥ 5 cm', 2]] },
  { id: 'site', label: 'Lokasi metastasis', options: [['Paru', 0], ['Limpa / ginjal', 1], ['Saluran cerna', 2], ['Hepar / otak', 4]] },
  { id: 'number', label: 'Jumlah metastasis', options: [['0', 0], ['1 – 4', 1], ['5 – 8', 2], ['> 8', 4]] },
  { id: 'prior', label: 'Kemoterapi sebelumnya yang gagal', options: [['Tidak ada', 0], ['Agen tunggal', 2], ['≥ 2 agen', 4]] },
];

export default {
  id: 'gtn-score',
  name: 'Skor Prognostik GTN (WHO/FIGO)',
  short: 'Hitung skor prognostik WHO/FIGO untuk membedakan GTN risiko rendah vs tinggi dan memandu pemilihan regimen.',
  category: 'Skor prognostik',
  scope: 'Trofoblas maligna (GTN)',
  render(container) {
    const fields = FACTORS.map((f) =>
      selectField({
        id: `gtn-${f.id}`,
        label: f.label,
        options: f.options.map(([lab, sc]) => ({ value: sc, label: `${lab} (${sc})` })),
        value: f.options[0][1],
      })
    );

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: false });

    function calc() {
      const total = fields.reduce((sum, fld) => sum + Number(fld.input.value), 0);
      const high = total >= 7;
      showResult(result, {
        headline: `Skor total: ${total}`,
        sub: high
          ? 'Skor ≥ 7 — GTN RISIKO TINGGI'
          : 'Skor ≤ 6 — GTN risiko rendah',
        extra: [
          h('div', { style: { marginTop: '10px' } },
            h('span', { class: `risk-pill ${high ? 'risk-high' : 'risk-low'}` }, high ? 'Risiko Tinggi' : 'Risiko Rendah')),
          h('p', { style: { margin: '14px 0 0', fontWeight: '600' } }, 'Implikasi regimen (umum):'),
          h('p', { style: { margin: '4px 0 0' } }, high
            ? 'Kemoterapi multiagen — mis. EMA-CO (etoposid, metotreksat, aktinomisin-D, siklofosfamid, vinkristin).'
            : 'Kemoterapi agen tunggal — metotreksat atau aktinomisin-D.'),
        ],
      });
    }

    fields.forEach((f) => f.input.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Pilih kategori tiap faktor (angka dalam kurung = skor). Total dihitung otomatis. Tidak berlaku untuk PSTT/ETT.'),
        h('div', { class: 'form-grid' }, ...fields.map((f) => f.el)),
        result,
        disclaimerNote('Skor ini tidak diterapkan pada PSTT/ETT (dikelola berbeda). Konfirmasi diagnosis GTN dan kategori metastasis sebelum memutuskan regimen.')
      )
    );

    calc();
  },
};
