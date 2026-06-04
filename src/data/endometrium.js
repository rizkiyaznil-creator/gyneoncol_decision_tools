export default {
  id: 'endometrium',
  name: 'Kanker Endometrium',
  shortName: 'Endometrium',
  code: 'EM',
  subtitle: 'Karsinoma endometrium (staging FIGO 2023)',
  accent: '#be185d',
  accentSoft: '#fdf2f8',
  blurb:
    'FIGO 2023 adalah revisi besar yang mengintegrasikan tipe histologi (non-agresif vs agresif), LVSI substansial, dan klasifikasi molekuler ke dalam penentuan stadium.',
  staging: {
    system: 'FIGO 2023',
    note:
      'Histologi "non-agresif" = endometrioid derajat rendah (G1–G2). "Agresif" = endometrioid G3, serous, clear cell, undifferentiated/dedifferentiated, karsinosarkoma, dan campuran. LVSI substansial = fokal-difus (≥ 5 pembuluh).',
    reference: 'Berek JS, dkk. FIGO 2023; Int J Gynecol Obstet. 2023;162(2):383-394.',
    groups: [
      {
        stage: 'I',
        title: 'Terbatas pada korpus uteri dan ovarium',
        sub: [
          { label: 'IA1', desc: 'Histologi non-agresif terbatas pada polip endometrium atau pada endometrium.' },
          { label: 'IA2', desc: 'Histologi non-agresif, invasi miometrium < 50%, dengan LVSI tidak ada/fokal.' },
          { label: 'IA3', desc: 'Endometrioid derajat rendah terbatas pada uterus dan ovarium (sinkron, memenuhi kriteria prognosis baik).' },
          { label: 'IB', desc: 'Histologi non-agresif, invasi miometrium ≥ 50%, dengan LVSI tidak ada/fokal.' },
          { label: 'IC', desc: 'Histologi agresif terbatas pada polip atau pada endometrium (tanpa invasi miometrium).' },
        ],
      },
      {
        stage: 'II',
        title: 'Invasi stroma serviks, atau LVSI substansial, atau histologi agresif dengan invasi miometrium',
        sub: [
          { label: 'IIA', desc: 'Histologi non-agresif dengan invasi stroma serviks.' },
          { label: 'IIB', desc: 'Histologi non-agresif dengan LVSI substansial.' },
          { label: 'IIC', desc: 'Histologi agresif dengan invasi miometrium berapa pun.' },
        ],
      },
      {
        stage: 'III',
        title: 'Penyebaran lokal dan/atau regional',
        sub: [
          { label: 'IIIA1', desc: 'Penyebaran ke ovarium atau tuba falopii (kecuali yang memenuhi IA3).' },
          { label: 'IIIA2', desc: 'Keterlibatan subserosa uteri atau menembus serosa uteri.' },
          { label: 'IIIB1', desc: 'Metastasis/perluasan langsung ke vagina dan/atau parametrium.' },
          { label: 'IIIB2', desc: 'Metastasis ke peritoneum pelvis.' },
          { label: 'IIIC1', desc: 'Metastasis KGB pelvis (i: mikrometastasis; ii: makrometastasis).' },
          { label: 'IIIC2', desc: 'Metastasis KGB paraaorta hingga vasa renalis, ± KGB pelvis.' },
        ],
      },
      {
        stage: 'IV',
        title: 'Invasi mukosa buli/usus dan/atau metastasis jauh',
        sub: [
          { label: 'IVA', desc: 'Invasi mukosa kandung kemih dan/atau mukosa usus.' },
          { label: 'IVB', desc: 'Metastasis peritoneal abdominal di luar pelvis.' },
          { label: 'IVC', desc: 'Metastasis jauh (KGB di atas vasa renalis, paru, hepar, otak, tulang).' },
        ],
      },
    ],
    molecularNote:
      'Penanda molekuler (FIGOmol) dapat mengubah stadium I–II bila diketahui: POLEmut terbatas korpus → Stadium IAmPOLEmut (prognosis sangat baik); p53abn dengan invasi miometrium → Stadium IICmp53abn.',
  },
  histology: {
    title: 'Klasifikasi molekuler (TCGA / ProMisE) — dasar algoritma terapi',
    items: [
      ['POLEmut (POLE ultramutated)', 'Prognosis sangat baik. Pertimbangkan de-eskalasi adjuvant pada stadium awal.'],
      ['MMRd / MSI-H', 'Prognosis menengah. Skrining Lynch syndrome; relevansi imunoterapi (anti–PD-1) pada lanjut/rekuren.'],
      ['NSMP (p53 wild-type)', 'Prognosis menengah; pengelolaan dipandu derajat, invasi, LVSI, dan reseptor hormon.'],
      ['p53abn (copy-number high)', 'Prognosis buruk. Cenderung perlu kemoterapi (± radioterapi) walau stadium dini.'],
    ],
    note:
      'Algoritma adjuvant ESGO/ESMO/ESTRO/ESP 2020 mengelompokkan risiko dengan menggabungkan stadium, derajat, histologi, LVSI, dan kelas molekuler. Lihat alat “Kelas Molekuler & Kelompok Risiko”.',
  },
  tools: ['bsa', 'carboplatin-auc', 'endometrial-molecular'],
  references: [
    'Berek JS, Matias-Guiu X, Creutzberg C, dkk. FIGO staging of endometrial cancer: 2023. Int J Gynecol Obstet. 2023;162(2):383-394.',
    'Concin N, dkk. ESGO/ESTRO/ESP guidelines for the management of patients with endometrial carcinoma. Int J Gynecol Cancer. 2021.',
    'NCCN Clinical Practice Guidelines in Oncology: Uterine Neoplasms (versi terkini).',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
