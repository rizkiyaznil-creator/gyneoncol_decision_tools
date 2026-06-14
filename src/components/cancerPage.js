import { h, mount, route } from '../utils/dom.js';
import { getTool } from '../tools/registry.js';
import { crumbs, iconBox, renderStaging, renderHistology, referencesList, renderSystemicTherapy, tabStrip } from './common.js';

function toolCard(cancer, tool) {
  return h('a', { class: 'card', href: route('c', cancer.id, 'alat', tool.id), style: { '--accent': cancer.accent } },
    h('div', { class: 'card__accent' }),
    h('p', { class: 'card__title' }, tool.name),
    h('p', { class: 'card__desc' }, tool.short),
    h('div', { class: 'card__meta' },
      h('span', { class: 'tag' }, tool.category)
    )
  );
}

function stagingTab(cancer) {
  // Tampilkan tombol ke asisten staging interaktif bila kanker punya alat kategori "Penentuan stadium".
  const stager = cancer.tools.map((id) => getTool(id)).find((t) => t && t.category === 'Penentuan stadium');
  return h('div', { class: 'panel' },
    h('h2', {}, 'Stadium ' + cancer.staging.system.split(' ')[0]),
    stager
      ? h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', margin: '0 0 18px', padding: '12px 16px', background: cancer.accentSoft || 'var(--slate-50)', borderRadius: '12px' } },
          h('span', { style: { fontSize: '.9rem', color: 'var(--slate-700)' } }, 'Tentukan stadium dari temuan pasien dengan kalkulator interaktif.'),
          h('a', { class: 'btn btn--primary', href: route('c', cancer.id, 'alat', stager.id), style: { background: cancer.accent } },
            '🧮 Buka asisten staging interaktif →'))
      : null,
    renderStaging(cancer.staging, cancer.accent),
    cancer.stagingAlt
      ? h('div', { style: { marginTop: '22px', paddingTop: '6px', borderTop: '1px dashed var(--border)' } },
          h('h2', { style: { marginTop: '16px' } }, cancer.stagingAlt.system),
          renderStaging(cancer.stagingAlt, cancer.accent))
      : null
  );
}

function toolsTab(cancer) {
  const tools = cancer.tools.map((id) => getTool(id)).filter(Boolean);
  return h('div', {},
    tools.length
      ? h('div', { class: 'grid grid--tools' }, ...tools.map((t) => toolCard(cancer, t)))
      : h('p', { class: 'muted' }, 'Belum ada alat khusus untuk modul ini.'),
    h('p', { class: 'muted', style: { marginTop: '16px', fontSize: '.85rem' } },
      '🔧 Alat tambahan (mis. kalkulator & algoritma lain) akan ditambahkan seiring waktu.')
  );
}

export function renderCancerPage(root, cancer, initialTab) {
  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: cancer.shortName }]),
    h('div', { class: 'page-head' },
      iconBox(cancer, 'page'),
      h('div', {},
        h('h1', {}, cancer.name),
        h('p', { class: 'page-head__sub' }, cancer.subtitle)
      )
    ),
    h('p', { class: 'muted', style: { maxWidth: '70ch' } }, cancer.blurb),
    tabStrip([
      { id: 'staging', label: 'Stadium FIGO/WHO', render: () => stagingTab(cancer) },
      { id: 'histo', label: 'Histologi & Catatan', render: () => h('div', { class: 'panel' }, renderHistology(cancer.histology)) },
      cancer.systemicTherapy
        ? { id: 'therapy', label: 'Terapi Sistemik', render: () => h('div', { class: 'panel' }, renderSystemicTherapy(cancer.systemicTherapy)) }
        : null,
      { id: 'tools', label: 'Alat Bantu Keputusan', render: () => toolsTab(cancer) },
      { id: 'refs', label: 'Referensi', render: () => h('div', { class: 'panel' }, h('h2', {}, 'Referensi'), referencesList(cancer.references)) },
    ].filter(Boolean), initialTab)
  );
}
