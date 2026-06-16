import { h, mount, route } from '../utils/dom.js';
import { cancers } from '../data/cancers.js';
import { getTool, tools } from '../tools/registry.js';
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

function toolCard(tool) {
  return h('a', { class: 'card', href: `#/alat/${tool.id}` },
    h('p', { class: 'card__title' }, tool.name),
    h('div', { class: 'card__meta' }, h('span', { class: 'tag' }, tool.scope || tool.category || 'Alat'))
  );
}

export function renderHome(root) {
  const featured = getTool('chemo-dosing');
  const others = tools.filter((t) => t.id !== 'chemo-dosing');

  mount(root,
    h('section', { class: 'hero' },
      h('span', { class: 'hero__eyebrow' }, 'Ginekologi Onkologi · Clinical Decision Support'),
      h('h1', {}, 'GynOnco ', h('span', { class: 'accent' }, 'Decision Tools')),
      h('p', { class: 'hero__lead' },
        'Alat bantu keputusan klinis — kalkulator dosis kemoterapi, algoritma terapi, dan penentuan stadium — lintas keganasan ginekologi.')
    ),

    // Alat di atas — kalkulator dosis kemoterapi sebagai highlight
    featured
      ? h('a', { class: 'card card--featured', href: `#/alat/${featured.id}` },
          h('span', { class: 'card__badge' }, '★ Alat unggulan'),
          h('p', { class: 'card__title', style: { fontSize: '1.25rem' } }, '🧮 ' + featured.name),
          h('p', { class: 'card__desc' }, 'Hitung BSA, carboplatin (Calvert/AUC), dosis m²/mg-kg, terapi target & imunoterapi, plus 40+ regimen lintas-kanker (ovarium, serviks, GTN, melanoma).'),
          h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, 'Buka kalkulator →')))
      : null,

    h('div', { class: 'section-head' },
      h('h2', {}, 'Alat bantu keputusan'),
      h('p', {}, 'Kalkulator, skor prognostik, algoritma terapi, dan penentuan stadium.')
    ),
    h('div', { class: 'grid grid--tools' }, ...others.map(toolCard)),

    h('div', { class: 'section-head' },
      h('h2', {}, 'Pilih jenis kanker ginekologi'),
      h('p', {}, 'Tiap modul memuat informasi stadium serta alat bantu keputusan yang relevan.')
    ),
    h('div', { class: 'grid grid--cancers' }, ...cancers.map(cancerCard)),

    h('div', { class: 'section-head' },
      h('h2', {}, 'Lainnya'),
      h('p', {}, 'Topik lintas-kanker & informasi aplikasi.')
    ),
    h('div', { class: 'grid grid--tools' },
      h('a', { class: 'card', href: '#/nyeri' },
        h('p', { class: 'card__title' }, '💊 Manajemen Nyeri'),
        h('p', { class: 'card__desc' }, 'Nyeri kanker (tangga WHO, opioid, adjuvan) & kalkulator konversi opioid.'),
        h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, 'Buka →'))
      ),
      h('a', { class: 'card', href: '#/tentang' },
        h('p', { class: 'card__title' }, 'ℹ️ Tentang & Disclaimer'),
        h('p', { class: 'card__desc' }, 'Ruang lingkup, sumber guideline, tema & ukuran teks, privasi.'),
        h('div', { class: 'card__meta' }, h('span', { class: 'card__cta' }, 'Baca →'))
      )
    ),

    h('div', { class: 'note note--warn', style: { marginTop: '20px' } },
      h('strong', {}, '⚠️ Alat bantu, bukan pengganti penilaian klinis. '),
      'Konten bersifat edukatif dan dapat menyederhanakan guideline. Verifikasi setiap keluaran terhadap sumber primer dan kondisi pasien sebelum mengambil keputusan.')
  );
}
