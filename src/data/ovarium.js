export default {
  id: 'ovarium',
  name: 'Kanker Ovarium',
  shortName: 'Ovarium',
  code: 'OV',
  subtitle: 'Ovarium · Tuba Falopii · Peritoneum Primer',
  accent: '#0d9488',
  accentSoft: '#f0fdfa',
  blurb:
    'Karsinoma epitelial (tersering high-grade serous), tumor germ cell, dan sex-cord stromal. Staging FIGO 2014 berlaku untuk ovarium, tuba falopii, dan peritoneum primer.',
  staging: {
    system: 'FIGO 2014',
    guidelineNote: 'Dikonfirmasi sebagai sistem FIGO terkini untuk ovarium/tuba/peritoneum — tidak ada revisi FIGO yang lebih baru; NCCN dan ESGO memakai sistem ini.',
    note: 'Berlaku terpadu untuk karsinoma ovarium, tuba falopii, dan peritoneum primer.',
    reference: 'Prat J, FIGO Committee on Gynecologic Oncology (2014)',
    groups: [
      {
        stage: 'I',
        title: 'Tumor terbatas pada ovarium atau tuba falopii',
        sub: [
          { label: 'IA', desc: 'Terbatas pada 1 ovarium (kapsul intak) atau 1 tuba; tidak ada tumor pada permukaan; sitologi/bilasan peritoneum negatif.' },
          { label: 'IB', desc: 'Terbatas pada kedua ovarium/tuba; selebihnya seperti IA.' },
          { label: 'IC', desc: 'Terbatas pada 1 atau 2 ovarium/tuba dengan salah satu fitur berikut:' },
          { label: 'IC1', desc: 'Surgical spill (tumpahan intraoperatif).', child: true },
          { label: 'IC2', desc: 'Kapsul ruptur sebelum operasi atau tumor pada permukaan ovarium/tuba.', child: true },
          { label: 'IC3', desc: 'Sel ganas pada asites atau bilasan peritoneum.', child: true },
        ],
      },
      {
        stage: 'II',
        title: 'Ekstensi pelvis (di bawah pelvic brim) atau kanker peritoneum primer',
        sub: [
          { label: 'IIA', desc: 'Ekstensi dan/atau implan pada uterus dan/atau tuba dan/atau ovarium.' },
          { label: 'IIB', desc: 'Ekstensi ke jaringan intraperitoneal pelvis lainnya.' },
        ],
      },
      {
        stage: 'III',
        title:
          'Penyebaran ke peritoneum di luar pelvis (terkonfirmasi sitologi/histologi) dan/atau metastasis KGB retroperitoneal',
        sub: [
          { label: 'IIIA1', desc: 'Hanya KGB retroperitoneal positif (terbukti).' },
          { label: 'IIIA1(i)', desc: 'Metastasis ≤ 10 mm.', child: true },
          { label: 'IIIA1(ii)', desc: 'Metastasis > 10 mm.', child: true },
          { label: 'IIIA2', desc: 'Keterlibatan peritoneal ekstrapelvis mikroskopik ± KGB retroperitoneal positif.' },
          { label: 'IIIB', desc: 'Metastasis peritoneal makroskopik di luar pelvis ≤ 2 cm ± KGB positif.' },
          { label: 'IIIC', desc: 'Metastasis peritoneal makroskopik di luar pelvis > 2 cm ± KGB positif (termasuk ekstensi ke kapsul hepar/lien tanpa invasi parenkim).' },
        ],
      },
      {
        stage: 'IV',
        title: 'Metastasis jauh (di luar metastasis peritoneal)',
        sub: [
          { label: 'IVA', desc: 'Efusi pleura dengan sitologi positif.' },
          { label: 'IVB', desc: 'Metastasis parenkim dan/atau ke organ ekstra-abdominal (termasuk KGB inguinal dan KGB di luar kavum abdomen).' },
        ],
      },
    ],
  },
  histology: {
    title: 'Subtipe histologi (WHO) & relevansi terapi',
    items: [
      ['High-grade serous (HGSC)', 'Tersering (~70%). Sering BRCA/HRD positif → kandidat terapi rumatan PARP inhibitor.'],
      ['Low-grade serous', 'Indolen, kurang kemosensitif; pertimbangkan terapi hormonal/MEK inhibitor.'],
      ['Endometrioid', 'Sering grade rendah & stadium awal; cek Lynch syndrome (MMR/MSI).'],
      ['Clear cell', 'Kemoresisten relatif; asosiasi endometriosis & tromboemboli.'],
      ['Mucinous', 'Singkirkan metastasis GI (CK7/CK20). Regimen tipe GI dapat dipertimbangkan.'],
      ['Germ cell / Sex-cord stromal', 'Tumor non-epitelial; algoritma terapi tersendiri (mis. BEP).'],
    ],
    note:
      'Uji BRCA1/2 (germline & somatik) dan status HRD direkomendasikan untuk karsinoma epitelial non-musinosa guna memandu terapi rumatan (PARP inhibitor) sesuai NCCN/ESGO.',
  },
  systemicTherapy: {
    intro: 'Untuk karsinoma epitelial ovarium/tuba/peritoneum. Tumor non-epitelial (germ cell, sex-cord stromal) memakai regimen berbeda (mis. BEP).',
    categories: [
      {
        label: 'Kemoterapi lini pertama',
        rows: [
          { regimen: 'Karboplatin–paklitaksel (TC) q3mgg ×6', indikasi: 'Tulang punggung lini-1 stadium lanjut & adjuvant dini', bukti: 'GOG-111/GOG-158' },
          { regimen: 'Dose-dense TC (paklitaksel mingguan)', indikasi: 'Alternatif; manfaat OS terutama populasi Asia', bukti: 'JGOG-3016 (ICON8 tidak konfirmasi)' },
          { regimen: 'TC + bevacizumab → rumatan', indikasi: 'Risiko tinggi: stadium IV, residual, stadium III suboptimal', bukti: 'GOG-218 / ICON7' },
          { regimen: 'Karboplatin–PLD', indikasi: 'Alternatif (neuropati/alopesia jadi pertimbangan)', bukti: 'MITO-2' },
        ],
      },
      {
        label: 'Terapi rumatan (target)',
        note: 'Diberikan setelah respons (CR/PR) terhadap platinum. Uji BRCA1/2 + HRD memandu pilihan.',
        rows: [
          { regimen: 'Olaparib (PARP) 2 tahun', indikasi: 'BRCA1/2 mutasi', bukti: 'SOLO-1 (PFS & OS)' },
          { regimen: 'Olaparib + bevacizumab', indikasi: 'HRD-positif (termasuk BRCAm) + bevacizumab', bukti: 'PAOLA-1' },
          { regimen: 'Niraparib', indikasi: 'Semua status biomarker (manfaat terbesar HRD+); tanpa bevacizumab', bukti: 'PRIMA / NOVA' },
          { regimen: 'Rukaparib', indikasi: 'Monoterapi rumatan', bukti: 'ATHENA-MONO' },
          { regimen: 'Bevacizumab', indikasi: 'Rumatan anti-VEGF (HR-proficient atau lanjutan front-line)', bukti: 'GOG-218 / ICON7' },
        ],
      },
      {
        label: 'Imunoterapi',
        rows: [
          { regimen: 'Pembrolizumab (anti–PD-1)', indikasi: 'Hanya bila dMMR/MSI-H atau TMB-tinggi (agnostik tumor)', bukti: 'KEYNOTE-158' },
          { regimen: 'Checkpoint inhibitor lini-1 rutin', indikasi: 'TIDAK direkomendasikan (negatif)', bukti: 'IMagyn050, JAVELIN-100' },
        ],
      },
      {
        label: 'Terapi hormonal',
        rows: [
          { regimen: 'Inhibitor aromatase (letrozol/anastrozol)', indikasi: 'LGSC & endometrioid ER/PR-positif; rumatan/rekuren indolen', bukti: 'NCCN; seri retrospektif' },
          { regimen: 'Tamoxifen', indikasi: 'Rekuren indolen ER/PR-positif', bukti: 'Seri/fase II' },
        ],
      },
      {
        label: 'Lini berikutnya (rekuren)',
        rows: [
          { regimen: 'Ulang platinum doublet ± bevacizumab', indikasi: 'Platinum-sensitif (interval bebas-platinum ≥ 6 bln)', bukti: 'CALYPSO, OCEANS, GOG-213' },
          { regimen: 'Agen tunggal (PLD, paklitaksel mingguan, topotecan, gemsitabin) ± bevacizumab', indikasi: 'Platinum-resistan', bukti: 'AURELIA' },
          { regimen: 'Mirvetuximab soravtansine (ADC, FRα)', indikasi: 'FRα-tinggi, platinum-resistan', bukti: 'MIRASOL / SORAYA' },
          { regimen: 'Trametinib (MEK)', indikasi: 'LGSC rekuren', bukti: 'GOG-281 / LOGS' },
        ],
      },
    ],
  },
  tools: ['chemo-dosing', 'ovarian-adjuvant'],
  references: [
    'Prat J; FIGO Committee on Gynecologic Oncology. Staging classification for cancer of the ovary, fallopian tube, and peritoneum. Int J Gynaecol Obstet. 2014;124(1):1-5.',
    'NCCN Clinical Practice Guidelines in Oncology: Ovarian Cancer (versi terkini).',
    'Regimen kemoterapi mengacu NCCN/ESGO–ESMO; bukti landmark: GOG-111/GOG-158 (paclitaxel–carboplatin), JGOG-3016 (dose-dense), AGO-OVAR 2.5 (gemcitabine–carboplatin), CALYPSO (PLD–carboplatin), MITO-7 (jadwal mingguan).',
    'ESGO–ESMO consensus & guidelines: epithelial ovarian cancer.',
    'WHO Classification of Tumours: Female Genital Tumours, 5th ed. (2020).',
  ],
};
