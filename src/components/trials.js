import { h, mount } from '../utils/dom.js';
import { crumbs } from './common.js';
import { getCancer } from '../data/cancers.js';
import { TRIALS, TRIAL_THEMES, trialPubmedUrl } from '../data/trials.js';

// Urutan tampil kanker (vagina tak memiliki landmark trial khusus → tidak muncul).
const CANCER_ORDER = ['ovarium', 'serviks', 'endometrium', 'vulva', 'gtn', 'sarkoma', 'melanoma'];

export function renderTrials(root) {
  let fCancer = 'all';
  let fTheme = 'all';
  let query = '';

  const presentCancers = CANCER_ORDER.filter((id) => TRIALS.some((t) => t.cancer === id));
  const presentThemes = Object.keys(TRIAL_THEMES).filter((k) => TRIALS.some((t) => t.theme === k));

  const cancerBar = h('div', { class: 'trial-filter' });
  const themeBar = h('div', { class: 'trial-filter' });
  const search = h('input', {
    type: 'search', class: 'trial-search', placeholder: 'Cari trial, obat, atau temuan…', 'aria-label': 'Cari trial',
  });
  const countEl = h('p', { class: 'trial-count muted' });
  const listWrap = h('div', {});

  function chip(label, active, onClick) {
    return h('button', { type: 'button', class: 'trial-chip' + (active ? ' trial-chip--active' : ''), 'aria-pressed': active ? 'true' : 'false', onClick }, label);
  }

  function rebuildBars() {
    mount(cancerBar,
      chip('Semua kanker', fCancer === 'all', () => { fCancer = 'all'; apply(); }),
      ...presentCancers.map((id) => {
        const c = getCancer(id);
        return chip(c ? (c.shortName || c.name) : id, fCancer === id, () => { fCancer = id; apply(); });
      })
    );
    mount(themeBar,
      chip('Semua tema', fTheme === 'all', () => { fTheme = 'all'; apply(); }),
      ...presentThemes.map((k) => chip(TRIAL_THEMES[k], fTheme === k, () => { fTheme = k; apply(); }))
    );
  }

  function matches(t) {
    if (fCancer !== 'all' && t.cancer !== fCancer) return false;
    if (fTheme !== 'all' && t.theme !== fTheme) return false;
    if (query) {
      const hay = `${t.title} ${t.pop} ${t.design} ${t.result} ${t.impact} ${t.ref}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  }

  function row(k, v) {
    return h('div', { class: 'trial__row' },
      h('span', { class: 'trial__k' }, k),
      h('span', { class: 'trial__v' }, v));
  }

  function trialCard(t) {
    const c = getCancer(t.cancer);
    const negative = /negatif/i.test(t.result);
    return h('details', { class: 'trial' },
      h('summary', { class: 'trial__summary' },
        h('span', { class: 'trial__chev', 'aria-hidden': 'true' }),
        h('span', { class: 'trial__main' },
          h('span', { class: 'trial__titlerow' },
            h('span', { class: 'trial__title' }, t.title),
            h('span', { class: 'trial__year' }, String(t.year)),
            h('span', { class: 'trial__theme' }, TRIAL_THEMES[t.theme]),
            negative ? h('span', { class: 'trial__neg' }, 'Negatif') : null),
          h('span', { class: 'trial__snippet' }, t.impact))
      ),
      h('div', { class: 'trial__body' },
        row('Populasi', t.pop),
        row('Desain', t.design),
        row('Hasil kunci', t.result),
        row('Implikasi', t.impact),
        h('p', { class: 'trial__ref' },
          t.ref, ' · ',
          h('a', { href: trialPubmedUrl(t, c ? c.name : ''), target: '_blank', rel: 'noopener noreferrer' }, 'PubMed ↗'))
      )
    );
  }

  function apply() {
    rebuildBars();
    const groups = [];
    let total = 0;
    for (const id of presentCancers) {
      if (fCancer !== 'all' && fCancer !== id) continue;
      const items = TRIALS.filter((t) => t.cancer === id && matches(t));
      if (!items.length) continue;
      total += items.length;
      const c = getCancer(id);
      groups.push(h('section', { class: 'trial-group' },
        h('h2', { class: 'trial-group__head', style: { '--accent': c ? c.accent : 'var(--teal-600)' } },
          h('span', {}, c ? c.name : id),
          h('span', { class: 'trial-group__count' }, String(items.length))),
        h('div', { class: 'trial-list' }, ...items.map(trialCard))));
    }
    const filtered = fCancer !== 'all' || fTheme !== 'all' || !!query;
    countEl.textContent = `Menampilkan ${total} dari ${TRIALS.length} trial${filtered ? ' (terfilter)' : ''}.`;
    mount(listWrap, groups.length
      ? h('div', { class: 'stack' }, ...groups)
      : h('p', { class: 'empty' }, 'Tidak ada trial yang cocok dengan filter.'));
  }

  search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); apply(); });

  apply();

  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: 'Landmark Clinical Trials' }]),
    h('h1', {}, 'Landmark Clinical Trials'),
    h('p', { class: 'muted', style: { maxWidth: '72ch' } },
      'Uji klinis penting yang membentuk praktik ginekologi onkologi — termasuk trial negatif yang mengubah standar. Ketuk kartu untuk detail populasi, desain, hasil, dan implikasi; rujukan tertaut ke pencarian PubMed.'),
    h('div', { class: 'trial-controls' },
      search,
      h('div', { class: 'trial-filter-group' },
        h('span', { class: 'trial-filter__label' }, 'Kanker'), cancerBar),
      h('div', { class: 'trial-filter-group' },
        h('span', { class: 'trial-filter__label' }, 'Tema'), themeBar)
    ),
    countEl,
    listWrap,
    h('div', { class: 'note note--warn', style: { marginTop: '20px' } },
      h('strong', {}, '⚠️ '),
      'Ringkasan edukatif & disederhanakan — bukan pengganti publikasi primer. Endpoint, populasi, dan kelayakan dapat berbeda; verifikasi ke makalah asli & guideline terbaru (NCCN/ESGO/ASCO) sebelum penerapan klinis.')
  );
}
