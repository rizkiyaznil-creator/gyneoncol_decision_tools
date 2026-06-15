import { h, mount, route } from '../utils/dom.js';
import { cancers } from '../data/cancers.js';
import { getTool } from '../tools/registry.js';
import { iconBox } from './common.js';

function cancerCard(cancer) {
  const readyTools = cancer.tools.map((id) => getTool(id)).filter(Boolean).length;
  return h('a', { class: 'card', href: route('c', cancer.id), style: { '--accent': cancer.accent, '--accent-soft': cancer.accentSoft } },
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

export function renderHome(root) {
  mount(root,
    h('section', { class: 'hero' },
      h('span', { class: 'hero__eyebrow' }, 'Ginekologi Onkologi · Clinical Decision Support'),
      h('h1', {}, 'GynOnco ', h('span', { class: 'accent' }, 'Decision Tools')),
      h('p', { class: 'hero__lead' },
        'Rujukan stadium FIGO/WHO/AJCC terkini dan alat bantu keputusan klinis — kalkulator dosis kemoterapi serta algoritma terapi adjuvant — lintas keganasan ginekologi.')
    ),

    h('div', { class: 'section-head' },
      h('h2', {}, 'Pilih jenis kanker ginekologi'),
      h('p', {}, 'Tiap modul memuat informasi stadium serta alat bantu keputusan yang relevan.')
    ),
    h('div', { class: 'grid grid--cancers' }, ...cancers.map(cancerCard)),

    h('div', { class: 'section-head' },
      h('h2', {}, 'Mulai cepat'),
      h('p', {}, 'Topik lintas-kanker, alat, dan info aplikasi.')
    ),
    h('div', { class: 'grid grid--tools' },
      h('a', { class: 'card', href: '#/nyeri' },
        h('p', { class: 'card__title' }, '💊 Manajemen Nyeri'),
        h('p', { class: 'card__desc' }, 'Nyeri kanker (tangga WHO, opioid, adjuvan) & kalkulator konversi opioid — esensial gin-onk.'),
        h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, 'Buka →'))
      ),
      h('a', { class: 'card', href: '#/alat' },
        h('p', { class: 'card__title' }, '🧮 Semua alat'),
        h('p', { class: 'card__desc' }, 'Kalkulator dosis, skor prognostik, dan algoritma terapi dalam satu daftar.'),
        h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, 'Buka daftar alat →'))
      ),
      h('a', { class: 'card', href: '#/tentang' },
        h('p', { class: 'card__title' }, 'ℹ️ Tentang & Disclaimer'),
        h('p', { class: 'card__desc' }, 'Ruang lingkup, sumber guideline, batasan, dan catatan keamanan klinis.'),
        h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, 'Baca selengkapnya →'))
      )
    ),

    h('div', { class: 'note note--warn', style: { marginTop: '28px' } },
      h('strong', {}, '⚠️ Alat bantu, bukan pengganti penilaian klinis. '),
      'Konten bersifat edukatif dan dapat menyederhanakan guideline. Verifikasi setiap keluaran terhadap sumber primer dan kondisi pasien sebelum mengambil keputusan.')
  );
}
