import { h, mount } from '../utils/dom.js';
import { crumbs } from './common.js';

const dataTable = (head, rows) => h('div', { class: 'table-scroll' },
  h('table', { class: 'data-table' },
    head ? h('thead', {}, h('tr', {}, ...head.map((c) => h('th', {}, c)))) : null,
    h('tbody', {}, ...rows.map((r) => h('tr', {}, ...r.map((c, i) => (i === 0 && head ? h('th', { style: { width: '34%' } }, c) : h('td', {}, c))))))));

export function renderPain(root) {
  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: 'Manajemen Nyeri' }]),
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__icon', style: { '--accent': '#b45309', '--accent-soft': '#fffbeb' } }, h('span', { style: { fontSize: '1.3rem' } }, '💊')),
      h('div', {}, h('h1', {}, 'Manajemen Nyeri'), h('p', { class: 'page-head__sub' }, 'Nyeri kanker — esensial ginekologi onkologi'))),

    h('div', { class: 'note note--warn' },
      h('strong', {}, '⚠️ '),
      'Ringkasan praktis pendukung keputusan, bukan pengganti penilaian klinis atau rujukan ke layanan nyeri/paliatif. Sesuaikan dengan kondisi pasien (ginjal/hati, usia), dan verifikasi dosis.'),

    h('div', { class: 'panel', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' } },
      h('span', {}, 'Perlu mengganti/rotasi opioid?'),
      h('a', { class: 'btn btn--primary', href: '#/alat/opioid-conversion', style: { background: '#b45309' } }, '🧮 Kalkulator Konversi Opioid →')),

    h('div', { class: 'panel' },
      h('h2', {}, 'Tangga analgesik WHO'),
      dataTable(['Langkah', 'Intensitas', 'Pilihan'], [
        ['1', 'Ringan', 'Non-opioid: parasetamol, OAINS ± adjuvan.'],
        ['2', 'Sedang', 'Opioid lemah: kodein, tramadol ± non-opioid ± adjuvan.'],
        ['3', 'Sedang–berat', 'Opioid kuat: morfin, oksikodon, hidromorfon, fentanil ± non-opioid ± adjuvan.'],
      ]),
      h('div', { class: 'note' }, h('strong', {}, 'Pendekatan modern: '), 'untuk nyeri sedang–berat banyak panduan langsung memakai opioid kuat dosis rendah (melewati Langkah 2).')),

    h('div', { class: 'panel' },
      h('h2', {}, 'Opioid kuat — prinsip dasar'),
      h('ul', {},
        h('li', {}, h('strong', {}, 'Mulai: '), 'morfin lepas-segera (IR) 5–10 mg PO tiap 4 jam, + dosis breakthrough yang sama PRN. Lansia/gangguan ginjal: mulai lebih rendah; pada gagal ginjal pertimbangkan fentanil atau oksikodon (metabolit morfin terakumulasi).'),
        h('li', {}, h('strong', {}, 'Titrasi: '), 'naikkan ~30–50% per 24–48 jam sesuai kebutuhan; setelah dosis stabil, konversi ke sediaan lepas-lambat (SR) dan sediakan IR untuk breakthrough.'),
        h('li', {}, h('strong', {}, 'Dosis breakthrough: '), '≈ 1/6 dosis harian total (lepas-segera), boleh diulang tiap 1 jam PRN. Kebutuhan breakthrough yang sering → naikkan dosis dasar.'),
        h('li', {}, h('strong', {}, 'Rotasi opioid: '), 'lewat setara morfin oral (OME) dengan pengurangan toleransi-silang 25–50% — gunakan kalkulator di atas.'))),

    h('div', { class: 'panel' },
      h('h2', {}, 'Efek samping — selalu antisipasi'),
      dataTable(null, [
        ['Konstipasi', 'Hampir universal & tanpa toleransi → laksatif stimulan profilaksis SELALU (bisakodil/sennosida) ± pelunak. Refrakter: pertimbangkan PAMORA (mis. metilnaltrekson).'],
        ['Mual', 'Sering di awal, umumnya toleran beberapa hari → antiemetik (metoklopramid atau haloperidol) bila perlu.'],
        ['Sedasi', 'Biasa di awal; bila berlebihan kurangi dosis. Pantau laju napas.'],
        ['Depresi napas', 'Jarang bila dititrasi benar; nalokson untuk yang mengancam jiwa (titrasi kecil agar tak memicu nyeri/withdrawal).'],
        ['Neurotoksisitas', 'Mioklonus, delirium, hiperalgesia → hidrasi + rotasi opioid.'],
      ])),

    h('div', { class: 'panel' },
      h('h2', {}, 'Adjuvan analgesik'),
      dataTable(['Indikasi', 'Pilihan'], [
        ['Nyeri neuropatik', 'Gabapentin, pregabalin, duloksetin, amitriptilin.'],
        ['Kompresi saraf/medula, MBO, nyeri inflamatorik', 'Kortikosteroid (deksametason).'],
        ['Metastasis tulang', 'Bifosfonat (asam zoledronat) / denosumab; pertimbangkan radioterapi paliatif.'],
      ])),

    h('div', { class: 'panel' },
      h('h2', {}, 'Intervensi (nyeri refrakter — rujuk layanan nyeri)'),
      h('ul', {},
        h('li', {}, h('strong', {}, 'Blok pleksus hipogastrik superior: '), 'nyeri visceral pelvis (serviks/uterus/ovarium).'),
        h('li', {}, h('strong', {}, 'Blok ganglion impar (Walther): '), 'nyeri perineum, rektum, vagina distal.'),
        h('li', {}, h('strong', {}, 'Analgesia neuraksial (epidural/intratekal): '), 'nyeri refrakter atau efek samping sistemik berat.'))),

    h('div', { class: 'panel' },
      h('h2', {}, 'Skenario ginekologi onkologi'),
      dataTable(null, [
        ['Nyeri pelvis (infiltrasi tumor)', 'Opioid + adjuvan neuropatik ± blok pleksus hipogastrik superior.'],
        ['Metastasis tulang', 'Opioid + radioterapi paliatif + bifosfonat/denosumab ± kortikosteroid.'],
        ['CIPN (mis. paklitaksel/platinum)', 'Duloksetin (bukti terbaik); gabapentinoid sebagai opsi.'],
        ['Pasca-radiasi (proktitis/sistitis/neuropati)', 'Tata laksana simtomatik + adjuvan neuropatik bila relevan.'],
      ])),

    h('div', { class: 'panel' },
      h('h2', {}, 'Catatan akses opioid (Indonesia)'),
      h('p', {}, 'Morfin oral (IR/SR) tersedia namun akses dapat terbatas antar-fasilitas; peresepan opioid diatur (dokter berwenang, formulir/ketentuan khusus). Pastikan ketersediaan & rencana penebusan sebelum titrasi rawat jalan. Fentanil patch dan oksikodon tersedia di sebagian fasilitas.')),

    h('div', { class: 'panel' },
      h('h2', {}, 'Referensi'),
      h('div', { class: 'refs' }, h('ol', {},
        h('li', {}, 'WHO Guidelines for the pharmacological and radiotherapeutic management of cancer pain in adults and adolescents (2018).'),
        h('li', {}, 'NCCN Clinical Practice Guidelines in Oncology: Adult Cancer Pain; Palliative Care (versi terkini).'),
        h('li', {}, 'Fallon M, dkk. Management of cancer pain in adult patients: ESMO Clinical Practice Guidelines. Ann Oncol. 2018.'),
        h('li', {}, 'Pedoman nasional terkait tata laksana nyeri kanker & penggunaan opioid (Kemenkes RI / perhimpunan terkait) — selalu cek edisi terbaru.'))))
  );
}
