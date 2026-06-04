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
    guidelineNote:
      'FIGO 2023 adalah revisi FIGO terbaru. Namun NCCN (Uterine Neoplasms v3.2025) MASIH mempertahankan FIGO 2009 karena pertimbangan kompleksitas, ketersediaan uji molekuler, dan keberlakuan global; banyak senter melaporkan kedua sistem. Sistem FIGO 2009 tersedia di bawah.',
    note:
      'FIGO 2023 mengintegrasikan tipe histologi (agresif vs non-agresif), LVSI substansial, dan klasifikasi molekuler ke dalam penentuan stadium. Definisi istilah kunci tercantum pada tabel di bawah daftar stadium.',
    reference: 'Berek JS, dkk. FIGO staging of endometrial cancer: 2023. Int J Gynecol Obstet. 2023;162(2):383-394. doi:10.1002/ijgo.14923',
    groups: [
      {
        stage: 'I',
        title: 'Terbatas pada korpus uteri dan ovarium',
        sub: [
          { label: 'IA1', desc: 'Histologi non-agresif terbatas pada polip endometrium atau terbatas pada endometrium (tanpa invasi miometrium).' },
          { label: 'IA2', desc: 'Histologi non-agresif dengan invasi miometrium < 50%, tanpa LVSI atau LVSI fokal.' },
          { label: 'IA3', desc: 'Karsinoma endometrioid derajat rendah terbatas pada uterus disertai keterlibatan ovarium endometrioid derajat rendah yang sinkron, memenuhi kriteria prognosis baik (lihat definisi di bawah).' },
          { label: 'IB', desc: 'Histologi non-agresif dengan invasi miometrium ≥ 50%, tanpa LVSI atau LVSI fokal.' },
          { label: 'IC', desc: 'Histologi agresif tanpa invasi miometrium (terbatas pada polip atau pada endometrium).' },
        ],
      },
      {
        stage: 'II',
        title: 'Invasi stroma serviks, atau LVSI substansial, atau histologi agresif dengan invasi miometrium',
        sub: [
          { label: 'IIA', desc: 'Histologi non-agresif yang menginfiltrasi stroma serviks.' },
          { label: 'IIB', desc: 'Histologi non-agresif dengan LVSI substansial.' },
          { label: 'IIC', desc: 'Histologi agresif dengan invasi miometrium berapa pun.' },
        ],
      },
      {
        stage: 'III',
        title: 'Penyebaran lokal dan/atau regional (semua subtipe histologi)',
        sub: [
          { label: 'IIIA1', desc: 'Penyebaran ke ovarium atau tuba falopii (kecuali bila memenuhi kriteria IA3).' },
          { label: 'IIIA2', desc: 'Keterlibatan subserosa uteri atau menembus serosa uteri.' },
          { label: 'IIIB1', desc: 'Metastasis atau perluasan langsung ke vagina dan/atau parametrium.' },
          { label: 'IIIB2', desc: 'Metastasis ke peritoneum pelvis.' },
          { label: 'IIIC1', desc: 'Metastasis ke kelenjar getah bening (KGB) pelvis.' },
          { label: 'IIIC1i', desc: 'KGB pelvis dengan mikrometastasis.', child: true },
          { label: 'IIIC1ii', desc: 'KGB pelvis dengan makrometastasis.', child: true },
          { label: 'IIIC2', desc: 'Metastasis ke KGB paraaorta hingga setinggi vasa renalis, dengan atau tanpa keterlibatan KGB pelvis.' },
          { label: 'IIIC2i', desc: 'KGB paraaorta dengan mikrometastasis.', child: true },
          { label: 'IIIC2ii', desc: 'KGB paraaorta dengan makrometastasis.', child: true },
        ],
      },
      {
        stage: 'IV',
        title: 'Invasi mukosa buli/usus dan/atau metastasis jauh',
        sub: [
          { label: 'IVA', desc: 'Invasi mukosa kandung kemih dan/atau mukosa usus (rektum).' },
          { label: 'IVB', desc: 'Metastasis peritoneal ekstrapelvis (intra-abdomen di luar pelvis).' },
          { label: 'IVC', desc: 'Metastasis jauh, termasuk KGB ekstra-/intra-abdomen di atas vasa renalis, paru, hepar, otak, atau tulang.' },
        ],
      },
    ],
    defs: [
      ['Histologi non-agresif', 'Karsinoma endometrioid derajat rendah (G1–G2).'],
      ['Histologi agresif', 'Endometrioid derajat tinggi (G3), serosa, sel jernih, tak berdiferensiasi/dediferensiasi, karsinosarkoma, campuran, dan tipe tak lazim lain.'],
      ['LVSI substansial', 'Pola fokal–difus, ≥ 5 pembuluh terlibat (kriteria WHO). LVSI fokal atau tidak ada tidak memenuhi.'],
      ['Sel tumor terisolasi (ITC)', '≤ 0,2 mm dan/atau ≤ 200 sel; dicatat sebagai N0(i+) dan TIDAK menaikkan stadium ke IIIC.'],
      ['Mikrometastasis', '> 0,2 mm hingga ≤ 2,0 mm dan/atau > 200 sel → subkelas "i" (IIIC1i / IIIC2i).'],
      ['Makrometastasis', '> 2,0 mm → subkelas "ii" (IIIC1ii / IIIC2ii).'],
      ['Kriteria IA3 (prognosis baik)', 'Endometrioid G1–G2; invasi miometrium uterus ≤ IA; tumor ovarium unilateral, terbatas di ovarium, tanpa invasi permukaan/ruptur; tanpa LVSI; tanpa metastasis di tempat lain.'],
      ['Modifier molekuler "m"', 'Klasifikasi molekuler lengkap dianjurkan pada SEMUA kasus; bila diketahui, ditambahkan huruf "m" dan subskrip subtipe pada stadium (mis. IAmPOLEmut, IICmp53abn).'],
    ],
    molecularNote:
      'Klasifikasi molekuler (POLEmut, MMRd, NSMP, p53abn) dianjurkan pada semua karsinoma endometrium. Bila diketahui, hasilnya mengubah Stadium I–II: POLEmut terbatas pada korpus uteri (± perluasan serviks) → Stadium IAmPOLEmut — di-downstage, prognosis sangat baik, berapa pun derajat LVSI, histologi, atau invasi miometrium. p53abn dengan invasi miometrium yang terbatas pada korpus (± invasi serviks) → Stadium IICmp53abn — di-upstage. p53abn tanpa invasi miometrium (terbatas polip/endometrium) TIDAK di-upstage. MMRd dan NSMP tidak mengubah stadium anatomik.',
  },
  stagingAlt: {
    system: 'FIGO 2009 (sistem yang masih dipakai NCCN v3.2025)',
    note: 'Sistem anatomik murni. Karsinosarkoma uterus di-staging dengan sistem karsinoma endometrium ini.',
    reference: 'Pecorelli S. FIGO 2009; Int J Gynaecol Obstet. 2009;105(2):103-104.',
    groups: [
      {
        stage: 'I',
        title: 'Terbatas pada korpus uteri',
        sub: [
          { label: 'IA', desc: 'Tanpa invasi atau invasi miometrium < 50%.' },
          { label: 'IB', desc: 'Invasi miometrium ≥ 50%.' },
        ],
      },
      { stage: 'II', title: 'Invasi stroma serviks, tanpa perluasan ekstrauterin.' },
      {
        stage: 'III',
        title: 'Penyebaran lokal dan/atau regional',
        sub: [
          { label: 'IIIA', desc: 'Invasi serosa korpus uteri dan/atau adneksa.' },
          { label: 'IIIB', desc: 'Keterlibatan vagina dan/atau parametrium.' },
          { label: 'IIIC', desc: 'Metastasis KGB pelvis dan/atau paraaorta.' },
          { label: 'IIIC1', desc: 'KGB pelvis positif.', child: true },
          { label: 'IIIC2', desc: 'KGB paraaorta positif ± KGB pelvis.', child: true },
        ],
      },
      {
        stage: 'IV',
        title: 'Invasi buli/usus atau metastasis jauh',
        sub: [
          { label: 'IVA', desc: 'Invasi mukosa kandung kemih dan/atau usus.' },
          { label: 'IVB', desc: 'Metastasis jauh, termasuk metastasis intra-abdomen dan/atau KGB inguinal.' },
        ],
      },
    ],
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
    'Berek JS, Matias-Guiu X, Creutzberg C, dkk. FIGO staging of endometrial cancer: 2023. Int J Gynecol Obstet. 2023;162(2):383-394. doi:10.1002/ijgo.14923',
    'Matias-Guiu X, dkk. FIGO 2023 staging for endometrial cancer, when, if it is not now? Eur J Cancer. 2024;213:115115. doi:10.1016/j.ejca.2024.115115',
    'Gaffney D, dkk. 2023 FIGO staging system for endometrial cancer: the evolution of the revolution. Gynecol Oncol. 2024.',
    'NCCN Guidelines Insights: Uterine Neoplasms, Version 3.2025 — panel mempertahankan FIGO 2009. J Natl Compr Canc Netw. 2025;23(8).',
    'Concin N, dkk. ESGO/ESTRO/ESP guidelines for the management of patients with endometrial carcinoma. Int J Gynecol Cancer. 2021.',
    'Talhouk A, dkk. Confirmation of ProMisE: a simple, genomics-based clinical classifier for endometrial cancer. Cancer. 2017;123(5):802-813. doi:10.1002/cncr.30496',
    'León-Castillo A, dkk. Molecular classification of the PORTEC-3 trial for high-risk endometrial cancer: impact on prognosis and benefit from adjuvant therapy. J Clin Oncol. 2020;38(29):3388-3397. doi:10.1200/JCO.20.00549',
    'Pecorelli S. Revised FIGO staging for carcinoma of the vulva, cervix, and endometrium. Int J Gynaecol Obstet. 2009;105(2):103-104.',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
