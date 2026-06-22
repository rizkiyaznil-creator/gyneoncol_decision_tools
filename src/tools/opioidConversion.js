import { h } from '../utils/dom.js';
import { num, round, field, selectField, stat, showResult, disclaimerNote, criteriaBox, formula } from './shared.js';

// Kalkulator konversi/rotasi opioid berbasis setara morfin oral (OME).
// Faktor dikonfirmasi pengguna (gin-onk): oksikodon ×1,5; hidromorfon ×5; kodein/tramadol ×0,1;
// morfin IV/SC ×2; fentanil patch 25 mcg/jam ≈ 60 mg OME/hari. Metadon & buprenorfin DIKECUALIKAN.
const FENT_OME_PER_MCGHR = 60 / 25; // = 2,4 mg OME/hari per (mcg/jam)
const PATCHES = [12, 25, 50, 75, 100]; // kekuatan fentanil patch (mcg/jam)

const DRUGS = [
  { id: 'morf-po', label: 'Morfin — oral', f: 1, mol: 'morfin' },
  { id: 'morf-iv', label: 'Morfin — IV/SC', f: 2, mol: 'morfin' },
  { id: 'oxy-po', label: 'Oksikodon — oral', f: 1.5, mol: 'oksikodon' },
  { id: 'hydro-po', label: 'Hidromorfon — oral', f: 5, mol: 'hidromorfon' },
  { id: 'cod-po', label: 'Kodein — oral', f: 0.1, mol: 'kodein' },
  { id: 'tram-po', label: 'Tramadol — oral', f: 0.1, mol: 'tramadol' },
  { id: 'fent-td', label: 'Fentanil — transdermal (patch)', fentanyl: true, mol: 'fentanil' },
];
const byId = new Map(DRUGS.map((d) => [d.id, d]));

function nearestPatch(v) {
  return PATCHES.reduce((best, p) => (Math.abs(p - v) < Math.abs(best - v) - 1e-9 ? p : best), PATCHES[0]);
}

export default {
  id: 'opioid-conversion',
  name: 'Kalkulator Konversi Opioid',
  short: 'Konversi/rotasi opioid via setara morfin oral (OME), dengan pengurangan toleransi-silang & dosis breakthrough. Metadon/buprenorfin dikecualikan.',
  category: 'Manajemen nyeri',
  scope: 'Nyeri / paliatif',
  render(container) {
    const fromDrug = selectField({
      id: 'op-from', label: 'Opioid asal', options: DRUGS.map((d) => ({ value: d.id, label: d.label })), value: 'morf-po',
    });
    const doseDaily = field({ id: 'op-dose', label: 'Total dosis harian', unit: 'mg/hari', attrs: { min: '1', placeholder: 'mis. 60' }, hint: 'Mis. morfin 10 mg tiap 4 jam = 60 mg/hari.' });
    const patch = field({ id: 'op-patch', label: 'Kekuatan patch fentanil', unit: 'mcg/jam', attrs: { min: '1', placeholder: 'mis. 25' } });
    const toDrug = selectField({
      id: 'op-to', label: 'Opioid tujuan', options: DRUGS.map((d) => ({ value: d.id, label: d.label })), value: 'oxy-po',
    });
    const reduction = selectField({
      id: 'op-red', label: 'Pengurangan toleransi-silang',
      options: [
        { value: '0', label: 'Tanpa (0%) — mis. rute sama' },
        { value: '25', label: '25%' },
        { value: '33', label: '33% (disarankan, ganti jenis)' },
        { value: '50', label: '50% (dosis tinggi / lansia / frail)' },
      ], value: '33',
    });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function updateVisibility() {
      const fent = byId.get(fromDrug.input.value).fentanyl;
      doseDaily.el.style.display = fent ? 'none' : '';
      patch.el.style.display = fent ? '' : 'none';
    }

    function calc() {
      const src = byId.get(fromDrug.input.value);
      const tgt = byId.get(toDrug.input.value);

      // OME harian dari obat asal
      let omeDay;
      if (src.fentanyl) {
        const mcg = num(patch.input.value);
        if (!(mcg > 0)) { result.hidden = true; return; }
        omeDay = mcg * FENT_OME_PER_MCGHR;
      } else {
        const d = num(doseDaily.input.value);
        if (!(d > 0)) { result.hidden = true; return; }
        omeDay = d * src.f;
      }

      const redPct = num(reduction.input.value) || 0;
      const sameMol = src.mol === tgt.mol;
      const finalOme = omeDay * (1 - redPct / 100);

      const notes = [];
      let targetHead, targetSub, breakthrough;

      if (tgt.fentanyl) {
        const mcg = finalOme / FENT_OME_PER_MCGHR;
        const near = nearestPatch(mcg);
        targetHead = `${near} mcg/jam`;
        targetSub = `Fentanil patch — hitung ≈ ${round(mcg, 1)} mcg/jam → kekuatan terdekat ${near} mcg/jam`;
        breakthrough = `Breakthrough: pakai opioid lepas-segera (mis. morfin oral) ≈ ${round(finalOme / 6, 0)} mg PRN — fentanil patch tidak dipakai untuk breakthrough.`;
        notes.push('Konversi ke fentanil patch sudah konservatif; sebagian klinisi memilih pengurangan 0% untuk fentanil lalu titrasi.');
      } else {
        const tgtDaily = finalOme / tgt.f;
        targetHead = `${round(tgtDaily, 0)} mg/hari`;
        const perDoseQ4 = tgt.mol === 'morfin' ? ` (≈ ${round(tgtDaily / 6, 0)} mg tiap 4 jam bila lepas-segera)` : '';
        targetSub = `${tgt.label} ≈ ${round(tgtDaily, 0)} mg/hari${perDoseQ4}`;
        breakthrough = `Breakthrough (lepas-segera): ≈ ${round(tgtDaily / 6, 0)} mg ${tgt.mol} PRN (1/6 dosis harian).`;
      }

      if (sameMol && redPct > 0) notes.push('Obat asal & tujuan molekul sama (ganti rute) — banyak panduan TIDAK menerapkan pengurangan; pertimbangkan pilih 0%.');
      notes.push('Bulatkan ke sediaan yang tersedia, mulai dari dosis lebih rendah bila ragu, lalu titrasi sesuai respons & efek samping.');

      showResult(result, {
        headline: targetHead,
        sub: targetSub,
        stats: [
          stat(`${round(omeDay, 0)} mg`, 'OME/hari (asal)'),
          stat(`−${redPct}%`, 'Toleransi-silang'),
          stat(`${round(finalOme, 0)} mg`, 'OME/hari (disesuaikan)'),
        ],
        extra: [
          h('p', { style: { margin: '12px 0 0', fontWeight: '600' } }, 'Dosis tujuan & breakthrough'),
          h('p', { style: { margin: '4px 0 0' } }, breakthrough),
          h('ul', { class: 'muted', style: { margin: '10px 0 0', paddingLeft: '1.2em', fontSize: '.85rem' } },
            ...notes.map((n) => h('li', { style: { marginBottom: '4px' } }, n))),
          h('p', { class: 'muted', style: { fontSize: '.8rem', margin: '10px 0 0' } },
            'Setara morfin oral (OME): morfin oral ×1 · morfin IV/SC ×2 · oksikodon oral ×1,5 · hidromorfon oral ×5 · kodein/tramadol oral ×0,1 · fentanil 25 mcg/jam ≈ 60 mg OME/hari.'),
        ],
      });
    }

    fromDrug.input.addEventListener('change', () => { updateVisibility(); calc(); });
    [toDrug.input, reduction.input].forEach((el) => el.addEventListener('change', calc));
    [doseDaily.input, patch.input].forEach((el) => el.addEventListener('input', calc));

    // Tabel faktor OME (disusun dari DRUGS agar sinkron dengan perhitungan).
    const omeRows = DRUGS.map((d) => d.fentanyl
      ? ['Fentanil transdermal', '25 mcg/jam ≈ 60 mg OME/hari']
      : [d.label, '× ' + String(d.f).replace('.', ',')]);
    const omeTable = h('div', { class: 'table-scroll' },
      h('table', { class: 'data-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Opioid'), h('th', {}, 'Faktor ke OME'))),
        h('tbody', {}, ...omeRows.map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, b))))
      )
    );
    const criteria = criteriaBox(
      h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Setara morfin oral (OME)'),
      omeTable,
      h('p', { style: { margin: '12px 0 4px', fontWeight: '700' } }, 'Langkah konversi'),
      formula('1) OME/hari = dosis harian × faktor asal\n   (fentanil: mcg/jam × 2,4)\n2) Sesuaikan: OME × (1 − reduksi%)\n3) Dosis tujuan = OME ÷ faktor tujuan\n   (fentanil: OME ÷ 2,4 → patch terdekat)'),
      h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.82rem' } }, 'Patch fentanil tersedia: 12 · 25 · 50 · 75 · 100 mcg/jam. Breakthrough ≈ 1/6 dosis harian tujuan, PRN.'),
      h('p', { style: { margin: '12px 0 4px', fontWeight: '700' } }, 'Pengurangan toleransi-silang'),
      h('p', { style: { margin: '0', fontSize: '.86rem' } }, '0% bila rute sama (molekul sama) · 25–33% bila ganti jenis (disarankan 33%) · 50% pada dosis tinggi / lansia / frail.'),
      h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Metadon & buprenorfin dikecualikan (perlu konversi khusus).')
    );

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Konversi antar-opioid melalui setara morfin oral. Masukkan total dosis harian opioid asal, pilih opioid tujuan, lalu sesuaikan pengurangan toleransi-silang.'),
        h('div', { class: 'form-grid' }, fromDrug.el, doseDaily.el, patch.el, toDrug.el, reduction.el),
        result,
        criteria,
        disclaimerNote('Kalkulator pendukung — BUKAN resep. Konversi opioid berisiko tinggi & rasio antar-sumber bervariasi. Selalu mulai konservatif, sediakan dosis breakthrough, pantau sedasi/depresi napas, dan verifikasi dengan apoteker/layanan nyeri. Metadon & buprenorfin memerlukan konversi khusus (rujuk spesialis) dan tidak dihitung di sini. Hati-hati pada gangguan ginjal/hati & lansia.')
      )
    );

    updateVisibility();
    calc();
  },
};
