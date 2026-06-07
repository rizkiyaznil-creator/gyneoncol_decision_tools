import { h, mount } from '../utils/dom.js';
import { num, round, field, selectField, stat, showResult, disclaimerNote } from './shared.js';

// Regimen & dosis kemoterapi terpadu (menggantikan kalkulator BSA, Carboplatin, dan Cisplatin terpisah).
//
// Jenis dosis tiap obat:
//   'm2'  → total = dosis (mg/m²) × BSA (Mosteller); cap opsional (mg).
//   'auc' → total = AUC × (GFR + 25), dibulatkan ke 10 mg terdekat (formula Calvert).
//
// Semua angka adalah praset yang dapat diedit pengguna.
const REGIMENS = [
  // ---- Dasar ----
  {
    id: 'bsa', group: 'Dasar', name: 'Hitung BSA saja', bsaOnly: true,
    note: 'Luas permukaan tubuh sebagai dasar dosis kemoterapi per m².', drugs: [],
  },

  // ---- Agen tunggal ----
  {
    id: 'carboplatin', group: 'Agen tunggal', name: 'Carboplatin (AUC / Calvert)',
    schedule: 'Tiap 3 minggu (agen tunggal lazim AUC 6–7).',
    drugs: [{ key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 6, min: 1, max: 7, step: 0.5, hint: 'AUC 5–6 (kombinasi) atau 6–7 (agen tunggal).' }],
  },
  {
    id: 'cisplatin-weekly', group: 'Agen tunggal', name: 'Cisplatin mingguan (kemoradiasi)',
    schedule: 'Mingguan, bersamaan radioterapi.',
    drugs: [{ key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 40, cap: 70, capNote: 'Cisplatin mingguan umumnya dibatasi 70 mg/pemberian pada protokol kemoradiasi', days: 'mingguan' }],
  },
  {
    id: 'cisplatin-50', group: 'Agen tunggal', name: 'Cisplatin 50 mg/m² (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 50, days: 'hari 1' }],
  },
  {
    id: 'cisplatin-75', group: 'Agen tunggal', name: 'Cisplatin 75 mg/m² (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 75, days: 'hari 1' }],
  },
  {
    id: 'paclitaxel', group: 'Agen tunggal', name: 'Paclitaxel (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' }],
  },
  {
    id: 'docetaxel', group: 'Agen tunggal', name: 'Docetaxel (q3 minggu)',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'doce', name: 'Docetaxel', kind: 'm2', dose: 75, days: 'hari 1' }],
  },
  {
    id: 'gemcitabine', group: 'Agen tunggal', name: 'Gemcitabine (hari 1 & 8)',
    schedule: 'Hari 1 & 8, tiap 3 minggu.',
    drugs: [{ key: 'gem', name: 'Gemcitabine', kind: 'm2', dose: 1000, days: 'hari 1, 8' }],
  },
  {
    id: 'cyclophosphamide', group: 'Agen tunggal', name: 'Siklofosfamid',
    schedule: 'Tiap 3 minggu.',
    drugs: [{ key: 'cyclo', name: 'Siklofosfamid', kind: 'm2', dose: 500, days: 'hari 1' }],
  },
  {
    id: 'doxorubicin', group: 'Agen tunggal', name: 'Doksorubisin',
    schedule: 'Tiap 3 minggu.',
    note: 'Perhatikan batas dosis kumulatif (~450–550 mg/m²) untuk kardiotoksisitas.',
    drugs: [{ key: 'dox', name: 'Doksorubisin', kind: 'm2', dose: 50, days: 'hari 1' }],
  },

  // ---- Kombinasi ovarium ----
  {
    id: 'tc', group: 'Kombinasi ovarium', name: 'Paclitaxel–Carboplatin (TC)',
    schedule: 'Hari 1, tiap 3 minggu × 6 siklus.',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 175, min: 135, max: 175, range: true, hint: 'Interval 135–175 mg/m².', days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, hint: 'AUC 5–6.', days: 'hari 1' },
    ],
  },
  {
    id: 'tc-dd', group: 'Kombinasi ovarium', name: 'Dose-dense TC (paclitaxel mingguan)',
    schedule: 'Carboplatin hari 1; paclitaxel hari 1, 8, 15; tiap 3 minggu (JGOG-3016).',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 80, days: 'hari 1, 8, 15' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 6, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'tc-weekly', group: 'Kombinasi ovarium', name: 'Paclitaxel–Carboplatin mingguan (lansia/frail)',
    schedule: 'Mingguan (MITO-7).',
    drugs: [
      { key: 'pac', name: 'Paclitaxel', kind: 'm2', dose: 60, days: 'mingguan' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 2, min: 1, max: 7, step: 0.5, days: 'mingguan' },
    ],
  },
  {
    id: 'docetaxel-carbo', group: 'Kombinasi ovarium', name: 'Docetaxel–Carboplatin',
    schedule: 'Hari 1, tiap 3 minggu (SCOTROC).',
    drugs: [
      { key: 'doce', name: 'Docetaxel', kind: 'm2', dose: 75, days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'gem-carbo', group: 'Kombinasi ovarium', name: 'Gemcitabine–Carboplatin',
    schedule: 'Gemcitabine hari 1 & 8; carboplatin hari 1; tiap 3 minggu.',
    drugs: [
      { key: 'gem', name: 'Gemcitabine', kind: 'm2', dose: 1000, days: 'hari 1, 8' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 4, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'pld-carbo', group: 'Kombinasi ovarium', name: 'PLD–Carboplatin (CALYPSO)',
    schedule: 'Hari 1, tiap 4 minggu.',
    drugs: [
      { key: 'pld', name: 'Doksorubisin liposomal (PLD)', kind: 'm2', dose: 30, days: 'hari 1' },
      { key: 'carbo', name: 'Carboplatin', kind: 'auc', dose: 5, min: 1, max: 7, step: 0.5, days: 'hari 1' },
    ],
  },
  {
    id: 'cap', group: 'Kombinasi ovarium', name: 'CAP (Siklofosfamid–Doksorubisin–Cisplatin)',
    schedule: 'Hari 1, tiap 3 minggu.',
    note: 'Perhatikan batas dosis kumulatif doksorubisin (~450–550 mg/m²).',
    drugs: [
      { key: 'cyclo', name: 'Siklofosfamid', kind: 'm2', dose: 500, days: 'hari 1' },
      { key: 'dox', name: 'Doksorubisin', kind: 'm2', dose: 50, days: 'hari 1' },
      { key: 'cis', name: 'Cisplatin', kind: 'm2', dose: 50, days: 'hari 1' },
    ],
  },
];

export default {
  id: 'chemo-dosing',
  name: 'Protokol & Dosis Kemoterapi',
  short: 'Hitung BSA, carboplatin (Calvert/AUC), dosis berbasis m², dan regimen kombinasi ginekologi onkologi.',
  category: 'Dosis kemoterapi',
  scope: 'Umum (lintas-kanker)',
  render(container) {
    const byId = new Map(REGIMENS.map((r) => [r.id, r]));

    // ----- Pemilih regimen (dikelompokkan) -----
    const groups = [];
    for (const r of REGIMENS) {
      let g = groups.find((x) => x.label === r.group);
      if (!g) { g = { label: r.group, items: [] }; groups.push(g); }
      g.items.push(r);
    }
    const regimenInput = h('select', { id: 'cx-regimen' },
      ...groups.map((g) => h('optgroup', { label: g.label },
        ...g.items.map((r) => h('option', { value: r.id, selected: r.id === 'bsa' ? true : null }, r.name))))
    );
    const regimenField = h('div', { class: 'field' },
      h('label', { for: 'cx-regimen' }, 'Regimen / mode'),
      regimenInput
    );

    // ----- Data pasien (BSA) -----
    const height = field({ id: 'cx-h', label: 'Tinggi badan', unit: 'cm', attrs: { min: '100', placeholder: 'mis. 158' } });
    const weight = field({ id: 'cx-w', label: 'Berat badan', unit: 'kg', attrs: { min: '20', placeholder: 'mis. 60' } });
    const patientGrid = h('div', { class: 'form-grid' }, height.el, weight.el);

    // ----- Blok GFR (untuk carboplatin / Calvert) -----
    const method = selectField({
      id: 'cx-method', label: 'Sumber GFR',
      options: [{ value: 'cg', label: 'Estimasi Cockcroft–Gault' }, { value: 'direct', label: 'GFR / klirens kreatinin terukur' }],
      value: 'cg',
    });
    const age = field({ id: 'cx-age', label: 'Usia', unit: 'tahun', attrs: { min: '18', max: '110', placeholder: 'mis. 55' } });
    const scr = field({ id: 'cx-scr', label: 'Kreatinin serum', attrs: { min: '0.1', placeholder: 'mis. 0.9' } });
    const scrUnit = selectField({ id: 'cx-scr-unit', label: 'Satuan kreatinin', options: [{ value: 'mgdl', label: 'mg/dL' }, { value: 'umol', label: 'µmol/L' }], value: 'mgdl' });
    const gfrDirect = field({ id: 'cx-gfr', label: 'GFR / CrCl terukur', unit: 'mL/min', attrs: { min: '5', placeholder: 'mis. 90' } });
    const capCarbo = h('input', { id: 'cx-cap', type: 'checkbox', checked: true });
    const capCarboRow = h('label', { class: 'field--inline', for: 'cx-cap' }, capCarbo,
      h('span', {}, 'Batasi GFR maksimal 125 mL/min (mencegah overdosis pada estimasi CrCl tinggi)'));

    const cgGrid = h('div', { class: 'form-grid' }, age.el, scr.el, scrUnit.el);
    const directGrid = h('div', { class: 'form-grid' }, gfrDirect.el);
    const gfrBlock = h('div', { class: 'stack', style: { marginTop: '4px' } },
      h('p', { class: 'muted', style: { margin: '0' } }, 'Carboplatin (Calvert): GFR via Cockcroft–Gault (faktor perempuan 0,85) atau nilai terukur.'),
      h('div', { class: 'form-grid' }, method.el),
      cgGrid, directGrid,
      h('div', {}, capCarboRow)
    );

    // ----- Input dosis (dinamis per regimen) -----
    const doseWrap = h('div', {});
    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    let doseInputs = []; // [{ drug, input }]

    const currentRegimen = () => byId.get(regimenInput.value) || REGIMENS[0];

    function bsaVal() {
      const hcm = num(height.input.value);
      const wkg = num(weight.input.value);
      if (!(hcm > 0) || !(wkg > 0)) return NaN;
      return Math.sqrt((hcm * wkg) / 3600);
    }

    function gfrRaw() {
      if (method.input.value === 'direct') return num(gfrDirect.input.value);
      const a = num(age.input.value);
      const wkg = num(weight.input.value);
      let cr = num(scr.input.value);
      if (scrUnit.input.value === 'umol') cr = cr / 88.4; // µmol/L → mg/dL
      if (!(a > 0) || !(wkg > 0) || !(cr > 0)) return NaN;
      return ((140 - a) * wkg * 0.85) / (72 * cr); // Cockcroft–Gault, faktor perempuan 0,85
    }

    function updateVisibility() {
      const r = currentRegimen();
      const needGFR = r.drugs.some((d) => d.kind === 'auc');
      const needBSA = r.bsaOnly || r.drugs.some((d) => d.kind === 'm2');
      const direct = method.input.value === 'direct';
      height.el.style.display = needBSA ? '' : 'none';
      weight.el.style.display = needBSA || (needGFR && !direct) ? '' : 'none';
      patientGrid.style.display = needBSA || (needGFR && !direct) ? '' : 'none';
      gfrBlock.style.display = needGFR ? '' : 'none';
      cgGrid.style.display = needGFR && !direct ? '' : 'none';
      directGrid.style.display = needGFR && direct ? '' : 'none';
    }

    function rebuild() {
      const r = currentRegimen();
      doseInputs = [];
      const fields = r.drugs.map((d) => {
        const isAuc = d.kind === 'auc';
        const f = field({
          id: `cx-dose-${d.key}`,
          label: isAuc ? `${d.name} — target AUC` : d.name,
          unit: isAuc ? 'mg·min/mL' : 'mg/m²',
          value: String(d.dose),
          hint: d.hint || null,
          attrs: {
            min: d.min != null ? String(d.min) : '1',
            ...(d.max != null ? { max: String(d.max) } : isAuc ? { max: '7' } : {}),
            ...(d.step != null ? { step: String(d.step) } : {}),
          },
        });
        let rangeChk = null;
        if (d.range && d.kind === 'm2') {
          rangeChk = h('input', { id: `cx-range-${d.key}`, type: 'checkbox', checked: true });
          f.el.appendChild(h('label', { class: 'field--inline', for: `cx-range-${d.key}`, style: { marginTop: '6px' } },
            rangeChk, h('span', {}, `Hitung sebagai rentang ${d.min}–${d.max} mg/m²`)));
          rangeChk.addEventListener('change', calc);
        }
        // Mengetik nilai spesifik otomatis menonaktifkan mode rentang.
        f.input.addEventListener('input', () => { if (rangeChk) rangeChk.checked = false; calc(); });
        doseInputs.push({ drug: d, input: f.input, rangeChk });
        return f.el;
      });
      mount(doseWrap, fields.length
        ? h('div', { class: 'stack' },
            h('p', { class: 'muted', style: { margin: '0' } }, 'Dosis praset (dapat diedit):'),
            h('div', { class: 'form-grid' }, ...fields))
        : null);
      updateVisibility();
      calc();
    }

    function calc() {
      const r = currentRegimen();

      // --- Mode BSA saja ---
      if (r.bsaOnly) {
        const bsa = bsaVal();
        if (!(bsa > 0)) { result.hidden = true; return; }
        const hcm = num(height.input.value);
        const wkg = num(weight.input.value);
        const dubois = 0.007184 * hcm ** 0.725 * wkg ** 0.425;
        showResult(result, {
          headline: `${round(bsa, 2)} m²`,
          sub: 'BSA Mosteller — dasar dosis kemoterapi per m².',
          stats: [stat(`${round(bsa, 2)} m²`, 'Mosteller'), stat(`${round(dubois, 2)} m²`, 'DuBois & DuBois')],
          extra: [h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '12px 0 0' } },
            'Mosteller: √(TB × BB / 3600). DuBois: 0,007184 × TB^0,725 × BB^0,425.')],
        });
        return;
      }

      const needGFR = r.drugs.some((d) => d.kind === 'auc');
      const needBSA = r.drugs.some((d) => d.kind === 'm2');
      const bsa = needBSA ? bsaVal() : NaN;
      let gfr = needGFR ? gfrRaw() : NaN;

      if (needBSA && !(bsa > 0)) { result.hidden = true; return; }
      if (needGFR && !(gfr > 0)) { result.hidden = true; return; }

      const rawGfr = gfr;
      let gfrCapped = false;
      if (needGFR && capCarbo.checked && gfr > 125) { gfr = 125; gfrCapped = true; }

      const rows = [];
      const notes = [];
      for (const { drug, input, rangeChk } of doseInputs) {
        if (drug.kind === 'auc') {
          const v = num(input.value);
          if (!(v > 0)) { result.hidden = true; return; }
          const exact = v * (gfr + 25);
          const rounded = Math.round(exact / 10) * 10;
          rows.push({ name: drug.name, spec: `AUC ${v}`, total: `${rounded} mg`, days: drug.days || '—' });
        } else if (rangeChk && rangeChk.checked) {
          const lo = Math.round(drug.min * bsa);
          const hi = Math.round(drug.max * bsa);
          rows.push({ name: drug.name, spec: `${drug.min}–${drug.max} mg/m²`, total: `${lo}–${hi} mg`, days: drug.days || '—' });
        } else {
          const v = num(input.value);
          if (!(v > 0)) { result.hidden = true; return; }
          let total = v * bsa;
          let capApplied = false;
          if (drug.cap != null && total > drug.cap) { total = drug.cap; capApplied = true; }
          rows.push({ name: drug.name, spec: `${v} mg/m²`, total: `${round(total, 0)} mg${capApplied ? ' *' : ''}`, days: drug.days || '—' });
          if (capApplied && drug.capNote) notes.push(`${drug.capNote} (dibatasi ${drug.cap} mg).`);
        }
      }

      const stats = [];
      if (needBSA) stats.push(stat(`${round(bsa, 2)} m²`, 'BSA (Mosteller)'));
      if (needGFR) stats.push(stat(`${round(gfr, 0)}`, gfrCapped ? `GFR dipakai (dibatasi dari ${round(rawGfr, 0)})` : 'GFR dipakai (mL/min)'));

      const table = h('div', { class: 'table-scroll', style: { marginTop: '14px' } },
        h('table', { class: 'data-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'Obat'), h('th', {}, 'Dosis'), h('th', {}, 'Total / pemberian'), h('th', {}, 'Hari'))),
          h('tbody', {}, ...rows.map((row) => h('tr', {},
            h('td', {}, row.name), h('td', {}, row.spec), h('td', {}, h('strong', {}, row.total)), h('td', {}, row.days))))
        )
      );

      const extra = [table];
      if (r.schedule) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '10px 0 0' } }, `Jadwal: ${r.schedule}`));
      if (r.note) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } }, r.note));
      for (const n of notes) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } }, `* ${n}`));
      if (needGFR) extra.push(h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '4px 0 0' } }, 'Carboplatin (Calvert): Dosis = AUC × (GFR + 25), dibulatkan ke 10 mg.'));

      const single = rows.length === 1;
      showResult(result, {
        headline: single ? rows[0].total.replace(' *', '') : r.name,
        sub: single ? `${rows[0].name} · ${rows[0].spec}` : 'Dosis total per pemberian (per obat).',
        stats,
        extra,
      });
    }

    regimenInput.addEventListener('change', rebuild);
    method.input.addEventListener('change', () => { updateVisibility(); calc(); });
    [height.input, weight.input, age.input, scr.input, scrUnit.input, gfrDirect.input, capCarbo].forEach((el) =>
      el.addEventListener('input', calc));
    scrUnit.input.addEventListener('change', calc);

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Pilih regimen atau mode, lalu masukkan data pasien. Semua dosis praset dapat disesuaikan; hasil diperbarui otomatis.'),
        regimenField,
        patientGrid,
        gfrBlock,
        doseWrap,
        result,
        disclaimerNote('Kalkulator pendukung — bukan resep. Sesuaikan dengan fungsi ginjal, antiemetik, modifikasi/penundaan dosis, batas kumulatif, dan kebijakan institusi. Verifikasi setiap dosis dengan apoteker onkologi.')
      )
    );

    rebuild();
  },
};
