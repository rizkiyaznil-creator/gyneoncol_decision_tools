import { h } from '../utils/dom.js';
import { num, round, field, selectField, showResult, disclaimerNote, criteriaBox, formula, resultSection } from './shared.js';

// Profilaksis & modifikasi dosis kemoterapi — pendamping kalkulator dosis.
//   1) Antiemetik berdasar emetogenisitas (NCCN Antiemesis / ASCO / MASCC).
//   2) Profilaksis primer G-CSF berdasar risiko neutropenia demam (ASCO/EORTC/NCCN).
//   3) Modifikasi dosis menurut fungsi ginjal/hati untuk agen utama ginekologi onkologi.

const EMETIC = {
  high: {
    label: 'Tinggi (> 90%)', pill: 'risk-high',
    ex: 'Sisplatin · AC (doksorubisin + siklofosfamid) · karboplatin AUC ≥ 4 (NCCN: emetogenik tinggi).',
    regimen: [
      'Hari 1 — regimen 4 obat:',
      'Antagonis NK1: aprepitant 125 mg PO atau fosaprepitant 150 mg IV (atau netupitant).',
      'Antagonis 5-HT3: palonosetron 0,25 mg IV (atau ondansetron 8–16 mg).',
      'Deksametason 12 mg.',
      'Olanzapin 5–10 mg PO.',
      'Hari 2–4: olanzapin 5–10 mg/hari + deksametason 8 mg/hari (bila aprepitant: 80 mg PO hari 2–3).',
    ],
  },
  moderate: {
    label: 'Sedang (30–90%)', pill: 'risk-int',
    ex: 'Karboplatin AUC < 4 · siklofosfamid · doksorubisin · oksaliplatin.',
    regimen: [
      'Hari 1: antagonis 5-HT3 (palonosetron 0,25 mg IV diutamakan) + deksametason 8 mg.',
      'Hari 2–3: deksametason 8 mg/hari pada regimen terpilih.',
      'Tambahkan antagonis NK1 pada kasus risiko lebih tinggi.',
    ],
  },
  low: {
    label: 'Rendah (10–30%)', pill: 'risk-low',
    ex: 'Paklitaksel · dosetaksel · gemsitabin · PLD · topotekan · etoposid.',
    regimen: [
      'Hari 1: satu agen — deksametason 8 mg (atau antagonis 5-HT3, atau metoklopramid/proklorperazin).',
      'Tanpa profilaksis multihari rutin.',
    ],
  },
  minimal: {
    label: 'Minimal (< 10%)', pill: 'risk-low',
    ex: 'Bevacizumab · vinkristin · bleomisin · terapi hormonal · checkpoint inhibitor.',
    regimen: ['Tanpa profilaksis antiemetik rutin; tangani bila timbul gejala.'],
  },
};

const FN_FACTORS = [
  { id: 'age', label: 'Usia > 65 tahun' },
  { id: 'priorfn', label: 'Riwayat neutropenia demam / neutropenia berat' },
  { id: 'priorchemo', label: 'Kemoterapi atau radioterapi ekstensif sebelumnya' },
  { id: 'ps', label: 'Status performa / nutrisi buruk' },
  { id: 'advanced', label: 'Penyakit lanjut / keterlibatan sumsum tulang' },
  { id: 'comorbid', label: 'Komorbiditas signifikan (ginjal/hati/jantung), infeksi aktif, atau luka terbuka' },
];

const DRUGS = [
  { id: 'carboplatin', label: 'Karboplatin' },
  { id: 'cisplatin', label: 'Sisplatin' },
  { id: 'paclitaxel', label: 'Paklitaksel' },
  { id: 'docetaxel', label: 'Dosetaksel' },
  { id: 'gemcitabine', label: 'Gemsitabin' },
  { id: 'pld', label: 'Doksorubisin liposomal (PLD)' },
  { id: 'doxorubicin', label: 'Doksorubisin' },
];

// Modifikasi dosis per agen menurut CrCl (mL/min) & bilirubin (kelipatan ULN).
// Mengembalikan { tone, renal, hepatic } — tone: 'ok' | 'caution' | 'avoid'.
function doseMod(drug, crcl, bili) {
  const hasR = crcl > 0, hasB = bili > 0;
  let renal = 'Tidak ada penyesuaian ginjal khusus.';
  let hepatic = 'Tidak ada penyesuaian hati khusus.';
  let tone = 'ok';
  const worse = (t) => { const r = { ok: 0, caution: 1, avoid: 2 }; if (r[t] > r[tone]) tone = t; };

  switch (drug) {
    case 'carboplatin':
      renal = 'Dosis sudah ditentukan fungsi ginjal lewat formula Calvert (AUC × (GFR + 25)) — lihat alat “Protokol & Dosis Kemoterapi”. Tidak ada penurunan terpisah.';
      hepatic = 'Tidak ada penyesuaian hati.';
      break;
    case 'cisplatin':
      if (hasR) {
        if (crcl >= 60) renal = 'CrCl ≥ 60: dosis penuh dengan hidrasi adekuat + antiemetik emetogenik tinggi.';
        else if (crcl >= 45) { renal = 'CrCl 45–59: pertimbangkan penurunan dosis atau ganti ke karboplatin; hidrasi & pantau ginjal/elektrolit.'; worse('caution'); }
        else { renal = 'CrCl < 45: hindari sisplatin → ganti karboplatin (dosis via Calvert).'; worse('avoid'); }
      }
      hepatic = 'Minimal; umumnya tanpa penyesuaian hati.';
      break;
    case 'paclitaxel':
      if (hasB) {
        if (bili <= 1.25) hepatic = 'Bilirubin ≤ 1,25× ULN (AST < 10× ULN): dosis penuh (mis. 175 mg/m², infus 3 jam).';
        else if (bili <= 2.0) { hepatic = 'Bilirubin > 1,25–2× ULN: turunkan ke 135 mg/m².'; worse('caution'); }
        else if (bili <= 5.0) { hepatic = 'Bilirubin > 2–5× ULN: turunkan ke 90 mg/m².'; worse('caution'); }
        else { hepatic = 'Bilirubin > 5× ULN: jangan diberikan.'; worse('avoid'); }
      }
      renal = 'Tidak ada penyesuaian ginjal bermakna.';
      break;
    case 'docetaxel':
      if (hasB) {
        if (bili <= 1.0) hepatic = 'Bilirubin ≤ ULN dan transaminase normal: dosis penuh. (Cek AST/ALT & ALP.)';
        else { hepatic = 'Bilirubin > ULN (atau AST/ALT > 1,5× ULN dengan ALP > 2,5× ULN): TIDAK direkomendasikan — risiko toksisitas/mortalitas meningkat; pilih agen alternatif.'; worse('avoid'); }
      }
      renal = 'Tidak ada penyesuaian ginjal bermakna.';
      break;
    case 'gemcitabine':
      if (hasR && crcl < 30) { renal = 'CrCl < 30: data terbatas — gunakan sangat hati-hati; pantau tanda TMA/HUS.'; worse('caution'); }
      else renal = 'Penyesuaian ginjal tidak terstandar; hati-hati pada gangguan ginjal bermakna (risiko TMA/HUS).';
      if (hasB && bili > 1.5) { hepatic = 'Bilirubin > 1,5× ULN: pertimbangkan penurunan dosis awal & pantau.'; worse('caution'); }
      else hepatic = 'Disfungsi hati ringan: lanjutkan dengan kewaspadaan & pantau.';
      break;
    case 'pld':
      if (hasB) {
        if (bili <= 1.0) hepatic = 'Bilirubin ≤ ULN (≈ ≤ 1,2 mg/dL): dosis penuh.';
        else if (bili <= 2.5) { hepatic = 'Bilirubin ~1,2–3,0 mg/dL (≈ 1–2,5× ULN): 50% dosis.'; worse('caution'); }
        else { hepatic = 'Bilirubin > 3,0 mg/dL (≈ > 2,5× ULN): 25% dosis.'; worse('caution'); }
      }
      renal = 'Tidak ada penyesuaian ginjal. Perhatikan batas kumulatif antrasiklin (kardiotoksisitas).';
      break;
    case 'doxorubicin':
      if (hasB) {
        if (bili <= 1.0) hepatic = 'Bilirubin ≤ ULN: dosis penuh.';
        else if (bili <= 2.5) { hepatic = 'Bilirubin ~1,2–3,0 mg/dL (≈ 1–2,5× ULN): 50% dosis.'; worse('caution'); }
        else if (bili <= 4.2) { hepatic = 'Bilirubin ~3,1–5,0 mg/dL (≈ 2,5–4× ULN): 25% dosis.'; worse('caution'); }
        else { hepatic = 'Bilirubin > 5,0 mg/dL: hindari.'; worse('avoid'); }
      }
      renal = 'Tidak ada penyesuaian ginjal. Perhatikan batas kumulatif (~450–550 mg/m²).';
      break;
    default: break;
  }
  return { tone, renal, hepatic };
}

const pill = (cls, label) => h('div', { style: { marginTop: '10px' } }, h('span', { class: `risk-pill ${cls}` }, label));
const lines = resultSection;

function checkGroup(prefix, items) {
  const inputs = {};
  const rows = items.map((it) => {
    const inp = h('input', { type: 'checkbox', id: `${prefix}-${it.id}` });
    inputs[it.id] = inp;
    return h('label', { for: `${prefix}-${it.id}` }, inp, h('span', {}, it.label));
  });
  return { el: h('div', { class: 'radio-row' }, ...rows), inputs };
}

export default {
  id: 'chemo-support',
  name: 'Profilaksis & Modifikasi Dosis Kemoterapi',
  short: 'Pendamping kalkulator dosis: profilaksis antiemetik (berdasar emetogenisitas), profilaksis primer G-CSF (risiko neutropenia demam), dan modifikasi dosis menurut fungsi ginjal/hati untuk agen utama.',
  category: 'Dosis kemoterapi',
  scope: 'Umum (lintas-kanker)',
  render(container) {
    const mode = selectField({
      id: 'cs-mode', label: 'Modul',
      options: [
        { value: 'antiemetic', label: 'Profilaksis antiemetik' },
        { value: 'gcsf', label: 'Profilaksis G-CSF (neutropenia)' },
        { value: 'dose', label: 'Modifikasi dosis (ginjal/hati)' },
      ], value: 'antiemetic',
    });

    // --- Antiemetik ---
    const emetLevel = selectField({
      id: 'cs-emet', label: 'Tingkat emetogenisitas regimen',
      options: [
        { value: 'high', label: 'Tinggi (> 90%)' },
        { value: 'moderate', label: 'Sedang (30–90%)' },
        { value: 'low', label: 'Rendah (10–30%)' },
        { value: 'minimal', label: 'Minimal (< 10%)' },
      ], value: 'high',
    });

    // --- G-CSF ---
    const fnRisk = selectField({
      id: 'cs-fnrisk', label: 'Risiko neutropenia demam regimen',
      options: [
        { value: 'high', label: 'Tinggi (≥ 20%)' },
        { value: 'intermediate', label: 'Menengah (10–20%)' },
        { value: 'low', label: 'Rendah (< 10%)' },
      ], value: 'intermediate',
    });
    const fnFactors = checkGroup('cs-fn', FN_FACTORS);
    const fnBlock = h('fieldset', {}, h('legend', {}, 'Faktor risiko pasien'), fnFactors.el);

    // --- Modifikasi dosis ---
    const drug = selectField({ id: 'cs-drug', label: 'Agen', options: DRUGS.map((d) => ({ value: d.id, label: d.label })), value: 'carboplatin' });
    const crcl = field({ id: 'cs-crcl', label: 'Klirens kreatinin (CrCl)', unit: 'mL/min', attrs: { min: '0', placeholder: 'mis. 80' } });
    const bili = field({ id: 'cs-bili', label: 'Bilirubin (× batas atas normal)', unit: '× ULN', value: '1', attrs: { min: '0', placeholder: 'mis. 1.0' }, hint: '1 = normal; 2 = 2× ULN.' });

    const result = h('div', { class: 'result', role: 'status', 'aria-live': 'polite', hidden: true });

    const show = (el, on) => { el.style.display = on ? '' : 'none'; };
    function toggle() {
      const m = mode.input.value;
      show(emetLevel.el, m === 'antiemetic');
      show(fnRisk.el, m === 'gcsf');
      show(fnBlock, m === 'gcsf');
      show(drug.el, m === 'dose');
      show(crcl.el, m === 'dose');
      show(bili.el, m === 'dose');
      calc();
    }

    function antiemeticCriteria() {
      return criteriaBox(
        h('div', { class: 'table-scroll' },
          h('table', { class: 'data-table' },
            h('thead', {}, h('tr', {}, h('th', {}, 'Tingkat'), h('th', {}, 'Risiko muntah'), h('th', {}, 'Inti regimen'))),
            h('tbody', {},
              h('tr', {}, h('td', {}, 'Tinggi'), h('td', {}, '> 90%'), h('td', {}, 'NK1 + 5-HT3 + deksametason + olanzapin')),
              h('tr', {}, h('td', {}, 'Sedang'), h('td', {}, '30–90%'), h('td', {}, '5-HT3 + deksametason (± NK1)')),
              h('tr', {}, h('td', {}, 'Rendah'), h('td', {}, '10–30%'), h('td', {}, 'Satu agen (deksametason / 5-HT3)')),
              h('tr', {}, h('td', {}, 'Minimal'), h('td', {}, '< 10%'), h('td', {}, 'Tanpa profilaksis rutin'))))),
        h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Karboplatin AUC ≥ 4 diklasifikasikan emetogenik tinggi (NCCN) → tambahkan NK1. Olanzapin juga efektif untuk mual terobosan. Rujukan: NCCN Antiemesis; ASCO 2020; MASCC/ESMO.')
      );
    }
    function gcsfCriteria() {
      return criteriaBox(
        h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Logika profilaksis primer G-CSF'),
        h('ul', { style: { margin: '0', paddingLeft: '1.2em', fontSize: '.86rem' } },
          h('li', {}, 'Risiko FN ≥ 20% → profilaksis primer direkomendasikan.'),
          h('li', {}, 'Risiko FN 10–20% → nilai faktor pasien; bila ada ≥ 1 → berikan.'),
          h('li', {}, 'Risiko FN < 10% → tidak rutin.')),
        h('p', { style: { margin: '10px 0 4px', fontWeight: '700' } }, 'Agen & waktu'),
        h('p', { class: 'muted', style: { margin: '0', fontSize: '.84rem' } }, 'Pegfilgrastim 6 mg SC sekali/siklus, atau filgrastim 5 µg/kg/hari SC hingga pemulihan ANC. Mulai ~24–72 jam pasca-kemoterapi; jangan dalam 24 jam sekitar pemberian sitotoksik. Regimen dose-dense (mis. paklitaksel mingguan/q2mgg) memerlukan dukungan G-CSF.'),
        h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Rujukan: ASCO 2015; EORTC; NCCN Hematopoietic Growth Factors.')
      );
    }
    function doseCriteria() {
      return criteriaBox(
        h('p', { style: { margin: '0 0 4px', fontWeight: '700' } }, 'Modifikasi hematologik (berbasis nadir)'),
        h('p', { class: 'muted', style: { margin: '0', fontSize: '.84rem' } }, 'Syarat tiap siklus: ANC ≥ 1,5 dan trombosit ≥ 100 ×10⁹/L; bila belum tercapai, tunda ~1 minggu. Setelah neutropenia demam, neutropenia grade 4 berkepanjangan, atau trombositopenia grade 4: turunkan dosis (mis. karboplatin AUC 6→5, paklitaksel 175→135) dan/atau tambah G-CSF.'),
        h('p', { class: 'muted', style: { margin: '10px 0 0', fontSize: '.82rem' } }, 'Ambang organ mengacu ringkasan label/NCCN; ULN bilirubin ≈ 1,2 mg/dL. Variasi antarprotokol & komorbiditas — selalu verifikasi dengan protokol institusi & apoteker onkologi.')
      );
    }

    function calcAntiemetic() {
      const e = EMETIC[emetLevel.input.value];
      showResult(result, {
        headline: `Emetogenisitas ${e.label}`,
        sub: 'Profilaksis antiemetik yang dianjurkan',
        extra: [
          pill(e.pill, e.label),
          lines('Regimen profilaksis', e.regimen),
          h('p', { class: 'muted', style: { margin: '12px 0 0', fontSize: '.84rem' } }, 'Contoh regimen: ' + e.ex),
          antiemeticCriteria(),
        ],
      });
    }
    function calcGCSF() {
      const risk = fnRisk.input.value;
      const factors = FN_FACTORS.filter((f) => fnFactors.inputs[f.id].checked);
      let tone, headline, rec;
      if (risk === 'high') {
        tone = 'risk-high'; headline = 'Profilaksis primer G-CSF direkomendasikan';
        rec = 'Risiko neutropenia demam regimen ≥ 20%: berikan G-CSF profilaksis primer tanpa memandang faktor pasien.';
      } else if (risk === 'intermediate') {
        if (factors.length) {
          tone = 'risk-high'; headline = 'Profilaksis primer G-CSF direkomendasikan';
          rec = `Risiko FN 10–20% dengan faktor risiko pasien (${factors.map((f) => f.label.toLowerCase()).join('; ')}): berikan G-CSF profilaksis primer.`;
        } else {
          tone = 'risk-int'; headline = 'G-CSF tidak rutin — pertimbangkan individual';
          rec = 'Risiko FN 10–20% tanpa faktor risiko pasien: G-CSF profilaksis primer belum rutin; pertimbangkan bila konsekuensi neutropenia demam berat atau tujuan kuratif.';
        }
      } else {
        tone = 'risk-low'; headline = 'Profilaksis primer G-CSF tidak dianjurkan';
        rec = 'Risiko FN < 10%: G-CSF profilaksis primer tidak rutin diberikan.';
      }
      showResult(result, {
        headline,
        sub: `Risiko FN regimen: ${risk === 'high' ? '≥ 20%' : risk === 'intermediate' ? '10–20%' : '< 10%'} · faktor pasien: ${factors.length}`,
        extra: [
          pill(tone, headline.includes('direkomendasikan') ? 'Berikan G-CSF' : headline.includes('tidak dianjurkan') ? 'Tidak rutin' : 'Individual'),
          lines('Rekomendasi', [rec]),
          gcsfCriteria(),
        ],
      });
    }
    function calcDose() {
      const d = DRUGS.find((x) => x.id === drug.input.value);
      const r = doseMod(drug.input.value, num(crcl.input.value), num(bili.input.value));
      const toneCls = r.tone === 'avoid' ? 'risk-high' : r.tone === 'caution' ? 'risk-int' : 'risk-low';
      const toneLabel = r.tone === 'avoid' ? 'Hindari / ganti agen' : r.tone === 'caution' ? 'Perlu penyesuaian' : 'Dosis penuh';
      showResult(result, {
        headline: d.label,
        sub: `CrCl ${num(crcl.input.value) > 0 ? round(num(crcl.input.value), 0) + ' mL/min' : '—'} · bilirubin ${num(bili.input.value) > 0 ? round(num(bili.input.value), 2) + '× ULN' : '—'}`,
        extra: [
          pill(toneCls, toneLabel),
          lines('Fungsi ginjal', [r.renal]),
          lines('Fungsi hati', [r.hepatic]),
          doseCriteria(),
        ],
      });
    }
    function calc() {
      const m = mode.input.value;
      if (m === 'gcsf') calcGCSF();
      else if (m === 'dose') calcDose();
      else calcAntiemetic();
    }

    [mode.input, emetLevel.input, fnRisk.input, drug.input].forEach((el) => el.addEventListener('change', toggle));
    [crcl.input, bili.input].forEach((el) => el.addEventListener('input', calc));
    Object.values(fnFactors.inputs).forEach((el) => el.addEventListener('change', calc));

    container.appendChild(
      h('div', { class: 'stack' },
        h('p', { class: 'muted' }, 'Pendamping kalkulator dosis. Pilih modul — kolom menyesuaikan. Bukan resep; verifikasi dengan protokol institusi & apoteker onkologi.'),
        h('div', { class: 'form-grid' }, mode.el, emetLevel.el, fnRisk.el, drug.el, crcl.el, bili.el),
        fnBlock,
        result,
        disclaimerNote('Penyederhanaan guideline (NCCN/ASCO/EORTC/MASCC). Dosis, ambang organ, dan klasifikasi risiko bervariasi antarprotokol, assay, dan komorbiditas. Selalu verifikasi terhadap protokol institusi, label obat, dan penilaian klinis.')
      )
    );

    toggle();
  },
};
