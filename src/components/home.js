import { h, mount, route } from '../utils/dom.js';
import { cancers } from '../data/cancers.js';
import { getTool } from '../tools/registry.js';
import { iconBox } from './common.js';

function cancerCard(cancer) {
  const readyTools = cancer.tools.map((id) => getTool(id)).filter(Boolean).length;
  return h('a', { class: 'card card--cancer', href: route('c', cancer.id), style: { '--accent': cancer.accent, '--accent-soft': cancer.accentSoft } },
    h('div', { class: 'card__accent' }),
    iconBox(cancer, 'card'),
    h('p', { class: 'card__title' }, cancer.name),
    h('p', { class: 'card__desc' }, cancer.subtitle),
    h('div', { class: 'card__meta' },
      h('span', { class: 'tag tag--guide' }, cancer.staging.system),
      h('span', { class: 'tag' }, readyTools ? `${readyTools} alat` : 'Stadium')
    )
  );
}

function featuredCard({ icon, title, desc, href, cta }) {
  return h('a', { class: 'card card--featured', href },
    h('span', { class: 'card__badge' }, '★ Unggulan'),
    h('p', { class: 'card__title', style: { fontSize: '1.1rem' } }, `${icon} ${title}`),
    h('p', { class: 'card__desc' }, desc),
    h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, `${cta} →`))
  );
}

function linkCard({ icon, title, desc, href, cta }) {
  return h('a', { class: 'card', href },
    h('p', { class: 'card__title' }, `${icon} ${title}`),
    h('p', { class: 'card__desc' }, desc),
    h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, `${cta} →`))
  );
}

export function renderHome(root) {
  mount(root,
    h('section', { class: 'hero' },
      h('span', { class: 'hero__eyebrow' }, 'Ginekologi Onkologi · Clinical Decision Support'),
      h('h1', {}, 'GynOnco ', h('span', { class: 'accent' }, 'Decision Tools')),
      h('p', { class: 'hero__lead' },
        'Alat bantu keputusan klinis — stadium, algoritma terapi, kalkulator dosis, dan triase — lintas keganasan ginekologi.')
    ),

    // Pintasan alat lintas-kanker yang paling sering dipakai.
    h('div', { class: 'section-head' },
      h('h2', {}, 'Alat unggulan'),
      h('p', {}, 'Yang paling sering dipakai, lintas-kanker.')
    ),
    h('div', { class: 'grid grid--tools' },
      featuredCard({ icon: '🧮', title: 'Protokol & Dosis Kemoterapi', desc: 'BSA, carboplatin (Calvert/AUC), 40+ regimen lintas-kanker.', href: '#/alat/chemo-dosing', cta: 'Buka kalkulator' }),
      featuredCard({ icon: '🔬', title: 'Triase Massa Adneksa', desc: 'RMI · IOTA Simple Rules · ROMA · ADNEX — risiko keganasan pra-operasi.', href: '#/alat/adnexal-triage', cta: 'Buka triase' }),
      featuredCard({ icon: '💊', title: 'Manajemen Nyeri', desc: 'Tangga analgesik WHO, opioid, & kalkulator konversi.', href: '#/nyeri', cta: 'Buka' })
    ),

    // Jalur utama: pilih kanker → stadium, klasifikasi, terapi, alat.
    h('div', { class: 'section-head' },
      h('h2', {}, 'Pilih jenis kanker ginekologi'),
      h('p', {}, 'Tiap modul memuat penentuan stadium, klasifikasi, terapi sistemik, dan alat bantu yang relevan.')
    ),
    h('div', { class: 'grid grid--cancers' }, ...cancers.map(cancerCard)),

    h('div', { class: 'section-head' }, h('h2', {}, 'Lainnya')),
    h('div', { class: 'grid grid--tools' },
      linkCard({ icon: '🧰', title: 'Semua alat bantu keputusan', desc: 'Kalkulator, skor, algoritma terapi & penentuan stadium — daftar lengkap lintas-kanker.', href: '#/alat', cta: 'Lihat semua' }),
      linkCard({ icon: 'ℹ️', title: 'Tentang & Disclaimer', desc: 'Ruang lingkup, sumber guideline, tema & ukuran teks, privasi.', href: '#/tentang', cta: 'Baca' })
    ),

    h('div', { class: 'note note--warn', style: { marginTop: '20px' } },
      h('strong', {}, '⚠️ Alat bantu, bukan pengganti penilaian klinis. '),
      'Konten bersifat edukatif dan dapat menyederhanakan guideline. Verifikasi setiap keluaran terhadap sumber primer dan kondisi pasien sebelum mengambil keputusan.')
  );
}
