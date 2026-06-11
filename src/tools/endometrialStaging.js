import { h } from '../utils/dom.js';
import { selectField, showResult, disclaimerNote } from './shared.js';
import endometrium from '../data/endometrium.js';

// Asisten penentuan stadium FIGO 2023 endometrium.
// Langkah 1: derivasi stadium anatomik dari ekstensi tertinggi (prinsip: stadium tertinggi yang berlaku).
// Langkah 2: terapkan modifier molekuler "m" (hanya mengubah Stadium I–II):
//   POLEmut (korpus ± serviks) → IAmPOLEmut (downstage); p53abn + invasi miometrium → IICmp53abn (upstage);
//   p53abn tanpa invasi miometrium TIDAK di-upstage; MMRd/NSMP tidak mengubah stadium anatomik.

const MOL_LABEL = { POLEmut: 'POLEmut (ultramutated)', MMRd: 'MMRd / MSI-H', NSMP: 'NSMP', p53abn: 'p53abn (copy-number high)' };

// Deskripsi kanonik dari modul data (sumber tunggal kebenaran).
function descFor(label) {
  for (const g of endometrium.staging.groups) {
    for (const s of (g.sub || [])) if (s.label === label) return s.desc;
    if (g.stage === label) return g.title;
  }
  return null;
}

function deriveAnatomic(i) {
  // Metastasis (Stadium IV)
  if (i.distant === 'yes') return { stage: 'IVC', rule: 'Metastasis jauh (paru/hepar/tulang/otak atau KGB di atas vasa renalis)' };
  if (i.extraPerit === 'yes') return { stage: 'IVB', rule: 'Metastasis peritoneal ekstrapelvis' };
  if (i.bladderBowel === 'yes') return { stage: 'IVA', rule: 'Invasi mukosa kandung kemih dan/atau usus' };

  // KGB (Stadium IIIC) — ITC tidak menaikkan stadium
  const realNode = i.nodes !== 'none' && i.metSize !== 'itc';
  if (realNode) {
    const macro = i.metSize === 'macro';
    if (i.nodes === 'para') return { stage: macro ? 'IIIC2ii' : 'IIIC2i', rule: `KGB paraaorta — ${macro ? 'makro' : 'mikro'}metastasis` };
    return { stage: macro ? 'IIIC1ii' : 'IIIC1i', rule: `KGB pelvis — ${macro ? 'makro' : 'mikro'}metastasis` };
  }

  // Penyebaran lokoregional lain (Stadium III)
  if (i.pelvicPerit === 'yes') return { stage: 'IIIB2', rule: 'Metastasis ke peritoneum pelvis' };
  if (i.vaginaParam === 'yes') return { stage: 'IIIB1', rule: 'Keterlibatan vagina dan/atau parametrium' };
  if (i.serosa === 'yes') return { stage: 'IIIA2', rule: 'Keterlibatan subserosa atau menembus serosa uteri' };
  if (i.adnexa === 'other') return { stage: 'IIIA1', rule: 'Penyebaran ke ovarium/tuba (tidak memenuhi kriteria IA3)' };

  const hasMyo = i.myo === 'lt50' || i.myo === 'ge50';

  // Stadium II
  if (i.histo === 'aggressive' && (hasMyo || i.cervixStroma === 'yes')) {
    return { stage: 'IIC', rule: 'Histologi agresif dengan invasi miometrium' + (i.cervixStroma === 'yes' && !hasMyo ? '/serviks' : '') };
  }
  if (i.histo === 'nonaggressive' && i.cervixStroma === 'yes') {
    return { stage: 'IIA', rule: 'Histologi non-agresif menginfiltrasi stroma serviks' };
  }
  if (i.histo === 'nonaggressive' && i.lvsi === 'substantial') {
    return { stage: 'IIB', rule: 'Histologi non-agresif dengan LVSI substansial' };
  }

  // IA3 — divalidasi: low-grade endometrioid, invasi < 50%, tanpa LVSI substansial
  if (i.adnexa === 'ia3') {
    if (i.histo === 'nonaggressive' && i.myo !== 'ge50' && i.lvsi !== 'substantial') {
      return { stage: 'IA3', rule: 'Keterlibatan ovarium endometrioid derajat rendah sinkron, memenuhi kriteria prognosis baik' };
    }
    return { stage: 'IIIA1', rule: 'Keterlibatan ovarium/tuba tidak memenuhi kriteria IA3 (perlu non-agresif, invasi < 50%, tanpa LVSI substansial) → IIIA1', flagged: true };
  }

  // Stadium I (terbatas korpus)
  if (i.histo === 'aggressive') return { stage: 'IC', rule: 'Histologi agresif tanpa invasi miometrium (terbatas polip/endometrium)' };
  if (i.myo === 'none') return { stage: 'IA1', rule: 'Non-agresif tanpa invasi miometrium (terbatas polip/endometrium)' };
  if (i.myo === 'lt50') return { stage: 'IA2', rule: 'Non-agresif, invasi miometrium < 50%, tanpa LVSI substansial' };
  return { stage: 'IB', rule: 'Non-agresif, invasi miometrium ≥ 50%, tanpa LVSI substansial' };
}

function applyMolecular(stage, i) {
  const mol = i.molecular;
  if (mol === 'notdone') return null;
  const isEarly = /^I{1,2}[ABC]/.test(stage); // Stadium I & II saja
  if (!isEarly) {
    return { final: `${stage} (m${mol})`, change: 'none', note: 'Modifier molekuler dicatat, tetapi tidak mengubah stadium III–IV.' };
  }
  if (mol === 'POLEmut') {
    return { final: 'IAmPOLEmut', change: 'down', note: 'POLEmut terbatas pada korpus uteri (± serviks) → di-downstage ke IAmPOLEmut — prognosis sangat baik, berapa pun invasi miometrium, LVSI, atau histologi.' };
  }
  if (mol === 'p53abn') {
    const hasMyo = i.myo === 'lt50' || i.myo === 'ge50';
    if (hasMyo) return { final: 'IICmp53abn', change: 'up', note: 'p53abn dengan invasi miometrium terbatas pada korpus (± serviks) → di-upstage ke IICmp53abn.' };
    return { final: `${stage}mp53abn`, change: 'none', note: 'p53abn TANPA invasi miometrium (terbatas polip/endometrium) TIDAK di-upstage.' };
  }
  return { final: `${stage}m${mol}`, change: 'none', note: `${MOL_LABEL[mol]} tidak mengubah stadium anatomik; ditambahkan sebagai modifier molekuler "m".` };
}

export default {
  id: 'endometrial-staging',
  name: 'Asisten Staging FIGO 2023 Endometrium',
  short: 'Tentukan stadium FIGO 2023 endometrium dari temuan klinikopatologis, termasuk integrasi modifier molekuler (POLEmut/MMRd/NSMP/p53abn).',
  category: 'Penentuan stadium',
  scope: 'Endometrium',
  render(container) {
    const histo = selectField({
      id: 'es-histo', label: 'Tipe histologi',
      options: [
        { value: 'nonaggressive', label: 'Non-agresif (endometrioid G1–G2)' },
        { value: 'aggressive', label: 'Agresif (G3 / serosa / sel jernih / undiff / karsinosarkoma)' },
      ], value: 'nonaggressive',
    });
    const myo = selectField({
      id: 'es-myo', label: 'Invasi miometrium',
      options: [
        { value: 'none', label: 'Tidak ada (terbatas polip/endometrium)' },
        { value: 'lt50', label: '< 50%' },
        { value: 'ge50', label: '≥ 50%' },
      ], value: 'none',
    });
    const lvsi = selectField({
      id: 'es-lvsi', label: 'LVSI',
      options: [{ value: 'none-focal', label: 'Tidak ada / fokal' }, { value: 'substantial', label: 'Substansial (≥ 5 pembuluh)' }], value: 'none-focal',
    });
    const cervixStroma = selectField({
      id: 'es-cervix', label: 'Invasi stroma serviks',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya' }], value: 'no',
    });
    const adnexa = selectField({
      id: 'es-adnexa', label: 'Keterlibatan ovarium / tuba',
      options: [
        { value: 'none', label: 'Tidak ada' },
        { value: 'ia3', label: 'Ya — memenuhi kriteria IA3 (sinkron, prognosis baik)' },
        { value: 'other', label: 'Ya — lainnya (→ IIIA1)' },
      ], value: 'none',
    });
    const serosa = selectField({
      id: 'es-serosa', label: 'Subserosa / menembus serosa uteri',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IIIA2)' }], value: 'no',
    });
    const vaginaParam = selectField({
      id: 'es-vaginaparam', label: 'Vagina / parametrium',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IIIB1)' }], value: 'no',
    });
    const pelvicPerit = selectField({
      id: 'es-pelvicperit', label: 'Peritoneum pelvis',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IIIB2)' }], value: 'no',
    });
    const nodes = selectField({
      id: 'es-nodes', label: 'KGB regional',
      options: [
        { value: 'none', label: 'Negatif / tidak ada' },
        { value: 'pelvic', label: 'KGB pelvis positif' },
        { value: 'para', label: 'KGB paraaorta positif' },
      ], value: 'none',
    });
    const metSize = selectField({
      id: 'es-metsize', label: 'Ukuran metastasis KGB',
      options: [
        { value: 'itc', label: 'ITC ≤ 0,2 mm — N0(i+), tidak menaikkan stadium' },
        { value: 'micro', label: 'Mikrometastasis (> 0,2–2,0 mm) → i' },
        { value: 'macro', label: 'Makrometastasis (> 2,0 mm) → ii' },
      ], value: 'macro',
    });
    const bladderBowel = selectField({
      id: 'es-bladderbowel', label: 'Mukosa kandung kemih / usus',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IVA)' }], value: 'no',
    });
    const extraPerit = selectField({
      id: 'es-extraperit', label: 'Metastasis peritoneal ekstrapelvis',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IVB)' }], value: 'no',
    });
    const distant = selectField({
      id: 'es-distant', label: 'Metastasis jauh',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya (→ IVC)' }], value: 'no',
    });
    const molecular = selectField({
      id: 'es-molecular', label: 'Klasifikasi molekuler',
      options: [
        { value: 'notdone', label: 'Belum diketahui' },
        { value: 'POLEmut', label: 'POLEmut' },
        { value: 'MMRd', label: 'MMRd / MSI-H' },
        { value: 'NSMP', label: 'NSMP' },
        { value: 'p53abn', label: 'p53abn' },
      ], value: 'notdone',
    });

    const fields = [histo, myo, lvsi, cervixStroma, adnexa, serosa, vaginaParam, pelvicPerit, nodes, metSize, bladderBowel, extraPerit, distant, molecular];
    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    function toggleContextual() {
      lvsi.el.style.display = histo.input.value === 'nonaggressive' ? '' : 'none';
      metSize.el.style.display = nodes.input.value !== 'none' ? '' : 'none';
      calc();
    }

    function stageLine(labelText, value, strong) {
      return h('p', { style: { margin: '4px 0 0' } },
        h('span', { class: 'muted' }, labelText + ': '),
        strong ? h('strong', { style: { fontSize: '1.05rem' } }, value) : h('span', {}, value));
    }

    function calc() {
      const i = Object.fromEntries(
        [['histo', histo], ['myo', myo], ['lvsi', lvsi], ['cervixStroma', cervixStroma], ['adnexa', adnexa],
         ['serosa', serosa], ['vaginaParam', vaginaParam], ['pelvicPerit', pelvicPerit], ['nodes', nodes],
         ['metSize', metSize], ['bladderBowel', bladderBowel], ['extraPerit', extraPerit], ['distant', distant],
         ['molecular', molecular]].map(([k, f]) => [k, f.input.value])
      );

      const anatomic = deriveAnatomic(i);
      const mol = applyMolecular(anatomic.stage, i);
      const finalStage = mol ? mol.final : anatomic.stage;
      const desc = descFor(anatomic.stage);

      const extra = [
        h('div', { style: { marginTop: '12px' } },
          stageLine('Stadium anatomik', anatomic.stage, !mol),
          h('p', { class: 'muted', style: { margin: '2px 0 0', fontSize: '.84rem' } }, `Penentu: ${anatomic.rule}.`),
          anatomic.flagged ? h('div', { class: 'note note--warn', style: { marginTop: '8px' } }, h('strong', {}, '⚠️ '), 'Kriteria IA3 tidak terpenuhi — diklasifikasikan IIIA1.') : null),
        desc ? h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.84rem' } }, `Definisi ${anatomic.stage}: ${desc}`) : null,
      ];

      if (mol) {
        const tone = mol.change === 'down' ? 'risk-low' : mol.change === 'up' ? 'risk-high' : '';
        extra.push(h('hr', { style: { border: 'none', borderTop: '1px solid var(--teal-100)', margin: '14px 0' } }));
        extra.push(h('div', {},
          h('p', { style: { margin: '0 0 6px', fontWeight: '600' } }, 'Stadium FIGO 2023 terintegrasi molekuler:'),
          h('span', { class: `risk-pill ${tone}`.trim(), style: tone ? null : { background: 'var(--slate-100)', color: 'var(--slate-700)' } }, finalStage),
          mol.change !== 'none' ? h('span', { class: 'muted', style: { marginLeft: '8px', fontSize: '.84rem' } }, mol.change === 'down' ? '(di-downstage)' : '(di-upstage)') : null,
          h('p', { class: 'muted', style: { margin: '8px 0 0', fontSize: '.84rem' } }, mol.note)));
      } else {
        extra.push(h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.84rem' } }, 'Klasifikasi molekuler dianjurkan pada semua kasus; bila diketahui, modifier "m" dapat mengubah Stadium I–II.'));
      }

      showResult(result, {
        headline: `Stadium ${finalStage}`,
        sub: `Karsinoma endometrium · FIGO 2023${i.molecular !== 'notdone' ? ` · ${MOL_LABEL[i.molecular]}` : ''}`,
        extra,
      });
    }

    [histo.input, nodes.input].forEach((el) => el.addEventListener('change', toggleContextual));
    fields.filter((f) => f !== histo && f !== nodes).forEach((f) => f.input.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Masukkan temuan klinikopatologis; alat menderivasi stadium FIGO 2023 (prinsip ekstensi tertinggi) lalu mengintegrasikan modifier molekuler. Kolom menyesuaikan pilihan.'),
        h('div', { class: 'form-grid' }, ...fields.map((f) => f.el)),
        result,
        disclaimerNote('Penyederhanaan FIGO 2023 (Berek dkk. 2023). Stadium definitif memerlukan korelasi patologi lengkap (kedalaman invasi, LVSI terkuantifikasi, status KGB/SLN) dan diskusi tumor board. Sebagian senter masih melaporkan FIGO 2009 (dipertahankan NCCN). ITC dicatat N0(i+) dan tidak menaikkan stadium.')
      )
    );

    toggleContextual();
  },
};
