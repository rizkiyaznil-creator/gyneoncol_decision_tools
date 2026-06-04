import { h, mount } from '../utils/dom.js';
import { crumbs } from './common.js';

export function renderAbout(root) {
  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: 'Tentang & Disclaimer' }]),
    h('h1', {}, 'Tentang & Disclaimer'),

    h('div', { class: 'note note--warn' },
      h('strong', {}, '⚠️ Bukan pengganti penilaian klinis. '),
      'GynOnco Decision Tools adalah alat bantu edukasi dan pendukung keputusan untuk tenaga medis profesional. ' +
      'Aplikasi ini tidak menggantikan penilaian klinis, pemeriksaan langsung, maupun diskusi tumor board. ' +
      'Verifikasi setiap keluaran terhadap guideline primer terbaru dan kondisi spesifik pasien.'),

    h('div', { class: 'panel' },
      h('h2', {}, 'Ruang lingkup'),
      h('p', {}, 'Tujuh keganasan ginekologi: ovarium, serviks, endometrium, vulva, penyakit trofoblas maligna (GTN), vagina, dan sarkoma uteri.'),
      h('p', {}, 'Setiap modul memuat informasi stadium (FIGO/WHO) dan alat bantu keputusan yang relevan, seperti kalkulator dosis kemoterapi dan algoritma penentuan terapi adjuvant. Cakupan akan terus dikembangkan.')
    ),

    h('div', { class: 'panel' },
      h('h2', {}, 'Sumber guideline yang dirujuk'),
      h('ul', {},
        h('li', {}, 'FIGO (International Federation of Gynecology and Obstetrics) — sistem staging.'),
        h('li', {}, 'NCCN Clinical Practice Guidelines in Oncology.'),
        h('li', {}, 'ESGO / ESMO / ESTRO / ESP — pedoman Eropa.'),
        h('li', {}, 'WHO Classification of Tumours: Female Genital Tumours (5th ed., 2020).')
      ),
      h('p', { class: 'muted', style: { fontSize: '.85rem' } },
        'Versi guideline dapat berubah. Label versi dicantumkan pada tiap modul; selalu periksa edisi terkini.')
    ),

    h('div', { class: 'panel' },
      h('h2', {}, 'Privasi & data'),
      h('p', {}, 'Aplikasi berjalan sepenuhnya di peramban Anda. Tidak ada data pasien yang dikirim ke server atau disimpan, kecuali preferensi tampilan sederhana (mis. status banner) di perangkat Anda.')
    ),

    h('div', { class: 'panel' },
      h('h2', {}, 'Batasan penting'),
      h('ul', {},
        h('li', {}, 'Algoritma terapi disederhanakan dari guideline; tidak mencakup semua skenario, komorbiditas, atau kontraindikasi.'),
        h('li', {}, 'Kalkulator dosis perlu diverifikasi oleh apoteker onkologi dan disesuaikan protokol institusi.'),
        h('li', {}, 'Skor prognostik tertentu memiliki pengecualian (mis. skor GTN tidak berlaku untuk PSTT/ETT).')
      )
    ),

    h('p', { class: 'muted', style: { fontSize: '.82rem' } }, 'Versi aplikasi: v0.1.0 (kerangka awal). Umpan balik dari klinisi sangat membantu pengembangan berikutnya.')
  );
}
