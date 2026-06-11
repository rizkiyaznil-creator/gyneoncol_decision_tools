import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';
import melanoma from '../data/melanoma.js';

// Asisten staging klinis AJCC 8 untuk melanoma (vulvovaginal mukosa).
// Derivasi kategori T dari ketebalan Breslow + ulserasi, lalu pengelompokan stadium klinis (cTNM).
// Stadium III patologis (IIIA–IIID) perlu detail KGB/SLN — di luar lingkup pengelompokan klinis ini.

function descFor(label) {
  for (const g of melanoma.staging.groups) {
    for (const s of (g.sub || [])) if (s.label === label) return s.desc;
    if (g.stage === label) return g.title;
  }
  return null;
}

// Kategori T (AJCC 8) dari ketebalan Breslow & ulserasi.
function tCategory(breslow, ulcer) {
  const u = ulcer === 'yes';
  switch (breslow) {
    case 'insitu': return 'Tis';
    case 'lt08': return u ? 'T1b' : 'T1a';     // < 0,8 mm: ulserasi → T1b
    case '08to1': return 'T1b';                // 0,8–1,0 mm → T1b (apa pun ulserasi)
    case '1to2': return u ? 'T2b' : 'T2a';
    case '2to4': return u ? 'T3b' : 'T3a';
    default: return u ? 'T4b' : 'T4a';         // > 4 mm
  }
}

// Pengelompokan stadium klinis dari T/N/M.
function stageGroup(t, nodes, mets) {
  if (mets !== 'M0') return 'IV';
  if (nodes !== 'N0') return 'III';
  switch (t) {
    case 'Tis': return '0';
    case 'T1a': return 'IA';
    case 'T1b': case 'T2a': return 'IB';
    case 'T2b': case 'T3a': return 'IIA';
    case 'T3b': case 'T4a': return 'IIB';
    case 'T4b': return 'IIC';
    default: return '0';
  }
}

export default {
  id: 'melanoma-staging',
  name: 'Asisten Staging AJCC Melanoma',
  short: 'Tentukan stadium klinis AJCC 8 melanoma vulvovaginal dari ketebalan Breslow, ulserasi, status KGB, dan metastasis (FIGO tidak dipakai pada melanoma).',
  category: 'Penentuan stadium',
  scope: 'Melanoma ginekologi',
  render(container) {
    const breslow = selectField({
      id: 'ms-breslow', label: 'Ketebalan Breslow',
      options: [
        { value: 'insitu', label: 'In situ (intraepitelial)' },
        { value: 'lt08', label: '< 0,8 mm' },
        { value: '08to1', label: '0,8 – 1,0 mm' },
        { value: '1to2', label: '> 1,0 – 2,0 mm' },
        { value: '2to4', label: '> 2,0 – 4,0 mm' },
        { value: 'gt4', label: '> 4,0 mm' },
      ], value: '1to2',
    });
    const ulcer = selectField({
      id: 'ms-ulcer', label: 'Ulserasi',
      options: [{ value: 'no', label: 'Tidak ada' }, { value: 'yes', label: 'Ada' }], value: 'no',
    });
    const nodes = selectField({
      id: 'ms-nodes', label: 'KGB regional / in-transit',
      options: [
        { value: 'N0', label: 'N0 — tidak ada' },
        { value: 'N1', label: 'N1 — 1 KGB atau in-transit/satelit tanpa KGB' },
        { value: 'N2', label: 'N2 — 2–3 KGB' },
        { value: 'N3', label: 'N3 — ≥ 4 KGB, matted, atau in-transit dengan KGB' },
      ], value: 'N0',
    });
    const mets = selectField({
      id: 'ms-mets', label: 'Metastasis jauh',
      options: [
        { value: 'M0', label: 'M0 — tidak ada' },
        { value: 'M1a', label: 'M1a — kulit/jaringan lunak/KGB non-regional' },
        { value: 'M1b', label: 'M1b — paru' },
        { value: 'M1c', label: 'M1c — viseral lain' },
        { value: 'M1d', label: 'M1d — SSP' },
      ], value: 'M0',
    });

    const fields = [breslow, ulcer, nodes, mets];
    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function toggleContextual() {
      // Ulserasi tidak relevan untuk in situ.
      ulcer.el.style.display = breslow.input.value === 'insitu' ? 'none' : '';
      calc();
    }

    function calc() {
      const t = tCategory(breslow.input.value, ulcer.input.value);
      const n = nodes.input.value;
      const m = mets.input.value;
      const stage = stageGroup(t, n, m);
      const tnm = `${t} ${n} ${m}`;
      const desc = descFor(stage);

      const extra = [
        h('p', { style: { margin: '10px 0 0' } },
          h('span', { class: 'muted' }, 'Klasifikasi klinis (cTNM): '),
          h('strong', {}, tnm)),
        desc ? h('p', { class: 'muted', style: { margin: '6px 0 0', fontSize: '.84rem' } }, `Definisi stadium ${stage}: ${desc}`) : null,
      ];
      if (stage === 'III') {
        extra.push(h('div', { class: 'note', style: { marginTop: '10px' } },
          'Stadium III patologis dirinci IIIA–IIID berdasarkan beban KGB & tumor primer — perlu biopsi KGB sentinel/diseksi untuk subkelompok pastinya.'));
      }

      showResult(result, {
        headline: `Stadium AJCC ${stage}`,
        sub: `Melanoma vulvovaginal · AJCC 8 · ${tnm}`,
        extra,
      });
    }

    breslow.input.addEventListener('change', toggleContextual);
    [ulcer.input, nodes.input, mets.input].forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Masukkan temuan patologi & klinis; alat menderivasi kategori T dari ketebalan Breslow + ulserasi, lalu mengelompokkan stadium klinis AJCC 8. FIGO tidak dipakai pada melanoma.'),
        h('div', { class: 'form-grid' }, ...fields.map((f) => f.el)),
        result,
        disclaimerNote('Penyederhanaan pengelompokan stadium KLINIS AJCC 8 (melanoma kutaneus, diterapkan pada mukosa). Stadium patologis (terutama subkelompok III) memerlukan korelasi KGB sentinel/diseksi & patologi lengkap. Mitotic rate, LDH, dan mikrosatelit turut dinilai. Korelasikan dengan diskusi tumor board.')
      )
    );

    toggleContextual();
  },
};
