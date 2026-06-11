import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';
import serviks from '../data/serviks.js';

// Asisten penentuan stadium FIGO 2018 serviks (prinsip ekstensi tertinggi).
// KGB positif → IIIC (apa pun ekstensi lokal); ekstensi lokal tetap dicatat.

function descFor(label) {
  for (const g of serviks.staging.groups) {
    for (const s of (g.sub || [])) if (s.label === label) return s.desc;
    if (g.stage === label) return g.title;
  }
  return null;
}

// Ekstensi lokal tumor (mengabaikan KGB) — dipakai sebagai stadium utama atau catatan bila IIIC.
function deriveLocal(i) {
  if (i.bladderRectum === 'yes') return { stage: 'IVA', rule: 'Invasi mukosa kandung kemih/rektum (terbukti biopsi)' };
  if (i.pelvicWall === 'yes') return { stage: 'IIIB', rule: 'Mencapai dinding pelvis dan/atau hidronefrosis/ginjal non-fungsi' };
  if (i.vagina === 'lower') return { stage: 'IIIA', rule: 'Keterlibatan sepertiga bawah vagina' };
  if (i.parametrium === 'yes') return { stage: 'IIB', rule: 'Keterlibatan parametrium, belum mencapai dinding pelvis' };
  if (i.vagina === 'upper') {
    return i.size === 'ge4'
      ? { stage: 'IIA2', rule: 'Dua pertiga atas vagina, tumor ≥ 4 cm, tanpa parametrium' }
      : { stage: 'IIA1', rule: 'Dua pertiga atas vagina, tumor < 4 cm, tanpa parametrium' };
  }
  // Terbatas pada serviks
  if (i.presentation === 'micro') {
    return i.depth === 'lt3'
      ? { stage: 'IA1', rule: 'Mikroskopik, invasi stroma < 3 mm' }
      : { stage: 'IA2', rule: 'Mikroskopik, invasi stroma ≥ 3 mm dan < 5 mm' };
  }
  if (i.size === 'lt2') return { stage: 'IB1', rule: 'Invasi ≥ 5 mm, tumor < 2 cm' };
  if (i.size === '2to4') return { stage: 'IB2', rule: 'Tumor ≥ 2 cm dan < 4 cm' };
  return { stage: 'IB3', rule: 'Tumor ≥ 4 cm' };
}

export default {
  id: 'cervical-staging',
  name: 'Asisten Staging FIGO 2018 Serviks',
  short: 'Tentukan stadium FIGO 2018 serviks dari temuan klinis/pencitraan/patologi, termasuk status KGB (IIIC) dengan ekstensi lokal tetap dicatat.',
  category: 'Penentuan stadium',
  scope: 'Serviks',
  render(container) {
    const presentation = selectField({
      id: 'cs-presentation', label: 'Cara terdiagnosis',
      options: [
        { value: 'micro', label: 'Mikroskopik saja (kandidat IA)' },
        { value: 'macro', label: 'Lesi makroskopik / terukur' },
      ], value: 'macro',
    });
    const depth = selectField({
      id: 'cs-depth', label: 'Kedalaman invasi stroma (mikroskopik)',
      options: [{ value: 'lt3', label: '< 3 mm (IA1)' }, { value: '3to5', label: '≥ 3 – < 5 mm (IA2)' }], value: 'lt3',
    });
    const size = selectField({
      id: 'cs-size', label: 'Ukuran tumor (diameter terbesar)',
      options: [
        { value: 'lt2', label: '< 2 cm' },
        { value: '2to4', label: '2 – < 4 cm' },
        { value: 'ge4', label: '≥ 4 cm' },
      ], value: 'lt2',
    });
    const vagina = selectField({
      id: 'cs-vagina', label: 'Keterlibatan vagina',
      options: [
        { value: 'none', label: 'Tidak ada' },
        { value: 'upper', label: 'Dua pertiga atas' },
        { value: 'lower', label: 'Sepertiga bawah (→ IIIA)' },
      ], value: 'none',
    });
    const parametrium = selectField({
      id: 'cs-param', label: 'Keterlibatan parametrium',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya, belum dinding pelvis (→ IIB)' }], value: 'no',
    });
    const pelvicWall = selectField({
      id: 'cs-pelvicwall', label: 'Dinding pelvis / hidronefrosis',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IIIB)' }], value: 'no',
    });
    const nodes = selectField({
      id: 'cs-nodes', label: 'KGB regional',
      options: [
        { value: 'none', label: 'Negatif / tidak ada' },
        { value: 'pelvic', label: 'KGB pelvis positif (→ IIIC1)' },
        { value: 'para', label: 'KGB paraaorta positif (→ IIIC2)' },
      ], value: 'none',
    });
    const bladderRectum = selectField({
      id: 'cs-bladderrectum', label: 'Mukosa kandung kemih / rektum',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya, terbukti biopsi (→ IVA)' }], value: 'no',
    });
    const distant = selectField({
      id: 'cs-distant', label: 'Metastasis jauh',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IVB)' }], value: 'no',
    });

    const fields = [presentation, depth, size, vagina, parametrium, pelvicWall, nodes, bladderRectum, distant];
    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function toggleContextual() {
      const micro = presentation.input.value === 'micro';
      depth.el.style.display = micro ? '' : 'none';
      // Ukuran tumor tetap relevan untuk IB/IIA; pada mode mikroskopik (IA) tak terpakai kecuali lesi melebihi IA.
      size.el.style.display = micro ? 'none' : '';
      calc();
    }

    function calc() {
      const i = Object.fromEntries(fields.map((f, idx) => [
        ['presentation', 'depth', 'size', 'vagina', 'parametrium', 'pelvicWall', 'nodes', 'bladderRectum', 'distant'][idx],
        f.input.value,
      ]));

      const local = deriveLocal(i);
      let finalStage = local.stage;
      let rule = local.rule;
      let nodeNote = null;

      // Stadium IV (jauh) mengalahkan IIIC; IVA lokal sudah dari deriveLocal.
      if (i.distant === 'yes') {
        finalStage = 'IVB'; rule = 'Metastasis ke organ jauh';
      } else if (local.stage !== 'IVA' && i.nodes !== 'none') {
        finalStage = i.nodes === 'para' ? 'IIIC2' : 'IIIC1';
        rule = i.nodes === 'para' ? 'KGB paraaorta positif' : 'KGB pelvis positif';
        nodeNote = `Ekstensi lokal tumor: ${local.stage} (${local.rule}). FIGO 2018 menambahkan notasi, mis. ${finalStage}r (pencitraan) atau ${finalStage}p (patologi).`;
      }

      const desc = descFor(finalStage);
      const extra = [
        h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.84rem' } }, `Penentu: ${rule}.`),
        desc ? h('p', { class: 'muted', style: { margin: '6px 0 0', fontSize: '.84rem' } }, `Definisi ${finalStage}: ${desc}`) : null,
        nodeNote ? h('div', { class: 'note', style: { marginTop: '10px' } }, nodeNote) : null,
      ];

      showResult(result, {
        headline: `Stadium ${finalStage}`,
        sub: 'Karsinoma serviks · FIGO 2018',
        extra,
      });
    }

    presentation.input.addEventListener('change', toggleContextual);
    fields.filter((f) => f !== presentation).forEach((f) => f.input.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'FIGO 2018 boleh memakai temuan klinis, pencitraan, dan patologi. Alat menderivasi stadium dengan prinsip ekstensi tertinggi; KGB positif → IIIC dengan ekstensi lokal tetap dicatat.'),
        h('div', { class: 'form-grid' }, ...fields.map((f) => f.el)),
        result,
        disclaimerNote('Penyederhanaan FIGO 2018 (Bhatla dkk.). Tambahkan notasi r/p sesuai sumber temuan (pencitraan/patologi). Korelasikan dengan pemeriksaan menyeluruh & diskusi tumor board.')
      )
    );

    toggleContextual();
  },
};
