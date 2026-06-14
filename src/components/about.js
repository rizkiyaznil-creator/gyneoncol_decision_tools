import { h, mount } from '../utils/dom.js';
import { crumbs } from './common.js';
import { cancers } from '../data/cancers.js';

// Panel "Pasang aplikasi" (PWA). Android/Chrome memakai prompt native (via window.GynOncoPWA);
// iOS Safari & fallback menampilkan instruksi manual. Semua akses window/navigator dijaga aman.
function installPanel() {
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  const standalone = (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

  if (standalone) {
    return h('div', { class: 'panel' },
      h('h2', {}, 'Pasang sebagai aplikasi'),
      h('p', { class: 'muted' }, '✓ Aplikasi sudah terpasang di perangkat ini.'));
  }

  const tips = h('div', { class: 'note', hidden: true });
  const showTips = () => {
    tips.hidden = false;
    mount(tips,
      h('p', { style: { margin: '0 0 6px' } }, h('strong', {}, 'Android (Chrome): '), 'buka menu ⋮ → “Pasang aplikasi” / “Tambahkan ke layar utama”.'),
      h('p', { style: { margin: '0' } }, h('strong', {}, 'iPhone/iPad (Safari): '), 'ketuk tombol Bagikan → “Tambahkan ke Layar Utama”.'));
  };

  const btn = h('button', {
    class: 'btn btn--primary', type: 'button',
    onClick: async () => {
      const pwa = window.GynOncoPWA;
      if (pwa && pwa.canInstall && pwa.canInstall()) {
        const ok = await pwa.install();
        if (!ok) showTips();
      } else {
        showTips();
      }
    },
  }, '📲 Pasang aplikasi');

  return h('div', { class: 'panel' },
    h('h2', {}, 'Pasang sebagai aplikasi'),
    h('p', {}, 'Pasang GynOnco Decision Tools ke layar utama untuk akses cepat, tampilan layar penuh, dan penggunaan offline — gratis, tanpa app store.'),
    h('div', { class: 'btn-row' }, btn),
    isIOS
      ? h('p', { class: 'muted', style: { fontSize: '.85rem', marginTop: '8px' } }, 'Di iPhone/iPad, pemasangan lewat Safari: tombol Bagikan → “Tambahkan ke Layar Utama”.')
      : null,
    tips
  );
}

// Panel "Bagikan aplikasi". Pakai Web Share API (share sheet native HP);
// fallback: salin tautan ke clipboard, atau tampilkan tautan untuk disalin manual.
function sharePanel() {
  const url = window.location.origin + window.location.pathname; // URL dasar app (tanpa hash)
  const shareData = {
    title: 'GynOnco Decision Tools',
    text: 'GynOnco Decision Tools — alat bantu keputusan klinis ginekologi onkologi (stadium FIGO/WHO/AJCC, dosis kemoterapi, algoritma terapi). Khusus tenaga kesehatan.',
    url,
  };
  const status = h('span', { class: 'muted', style: { marginLeft: '10px', fontSize: '.9rem' }, hidden: true });
  const linkBox = h('div', { class: 'note', hidden: true });
  const flash = (msg) => { status.hidden = false; status.textContent = msg; };
  const showLink = () => {
    linkBox.hidden = false;
    mount(linkBox,
      h('p', { style: { margin: '0 0 6px' } }, 'Salin & bagikan tautan ini:'),
      h('code', { style: { wordBreak: 'break-all' } }, url));
  };

  const btn = h('button', {
    class: 'btn btn--primary', type: 'button',
    onClick: async () => {
      if (navigator.share) {
        try { await navigator.share(shareData); } catch { /* dibatalkan pengguna */ }
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        try { await navigator.clipboard.writeText(url); flash('Tautan disalin ✓'); } catch { showLink(); }
      } else {
        showLink();
      }
    },
  }, '📤 Bagikan aplikasi');

  return h('div', { class: 'panel' },
    h('h2', {}, 'Bagikan aplikasi'),
    h('p', {}, 'Sebarkan GynOnco Decision Tools kepada sejawat atau tenaga kesehatan lain yang memerlukan.'),
    h('div', { class: 'btn-row' }, btn, status),
    linkBox
  );
}

export function renderAbout(root) {
  const sites = cancers.map((c) => c.shortName);
  const siteList = sites.length > 1 ? sites.slice(0, -1).join(', ') + ', dan ' + sites[sites.length - 1] : sites[0];
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
      h('p', {}, 'Keganasan ginekologi yang dicakup: ' + siteList + '.'),
      h('p', {}, 'Setiap modul memuat informasi stadium (FIGO/WHO) dan alat bantu keputusan yang relevan, seperti kalkulator dosis kemoterapi dan algoritma penentuan terapi adjuvant. Cakupan akan terus dikembangkan.')
    ),

    installPanel(),

    sharePanel(),

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
      h('h2', {}, 'Status kebaruan staging (diverifikasi Juni 2026)'),
      h('p', {}, 'Seluruh sistem stadium telah dicocokkan dengan literatur terkini (Consensus/PubMed) dan guideline:'),
      h('ul', {},
        h('li', {}, 'Ovarium FIGO 2014 · Serviks FIGO 2018 · Vulva FIGO 2021 · Sarkoma uteri FIGO 2009 · Vagina (FIGO) · GTN (anatomik FIGO 2000 + skor WHO/FIGO) — semuanya masih versi FIGO terkini.'),
        h('li', {}, 'Endometrium: FIGO 2023 adalah revisi terbaru, namun NCCN (Uterine Neoplasms v3.2025) masih mempertahankan FIGO 2009 — kedua sistem kini ditampilkan pada modul endometrium.')
      ),
      h('p', { class: 'muted', style: { fontSize: '.85rem' } },
        'Beberapa sistem ditegaskan kembali pada pembaruan FIGO Cancer Report 2025 (serviks, vagina, korpus uteri, GTN).')
    ),

    h('div', { class: 'panel' },
      h('h2', {}, 'Privasi & data'),
      h('p', {}, 'Aplikasi berjalan sepenuhnya di peramban Anda. Tidak ada data pasien yang dikirim ke server atau disimpan, kecuali preferensi tampilan sederhana (mis. status banner) di perangkat Anda.'),
      h('p', {}, 'Untuk mengukur jumlah kunjungan, aplikasi memakai analytics yang menghormati privasi (GoatCounter): tanpa cookie, tanpa pelacakan lintas-situs, tanpa menyimpan alamat IP atau identitas, dan tanpa banner persetujuan. Hanya path rute (mis. /c/endometrium) dan sumber rujukan yang dicatat — tidak pernah masukan formulir atau data pasien.')
    ),

    h('div', { class: 'panel' },
      h('h2', {}, 'Batasan penting'),
      h('ul', {},
        h('li', {}, 'Algoritma terapi disederhanakan dari guideline; tidak mencakup semua skenario, komorbiditas, atau kontraindikasi.'),
        h('li', {}, 'Kalkulator dosis perlu diverifikasi oleh apoteker onkologi dan disesuaikan protokol institusi.'),
        h('li', {}, 'Skor prognostik tertentu memiliki pengecualian (mis. skor GTN tidak berlaku untuk PSTT/ETT).')
      )
    ),

    h('div', { class: 'panel', style: { textAlign: 'center' } },
      h('p', { style: { fontWeight: '700', margin: '0' } }, 'Didesain oleh Muhammad Rizki Yaznil'),
      h('p', { class: 'muted', style: { fontSize: '.82rem', margin: '6px 0 0' } }, 'Umpan balik dari klinisi sangat membantu pengembangan berikutnya.')
    )
  );
}
