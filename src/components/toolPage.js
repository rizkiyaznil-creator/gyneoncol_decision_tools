import { h, mount, route } from '../utils/dom.js';
import { crumbs } from './common.js';

export function renderToolPage(root, { cancer, tool }) {
  const trail = [{ label: 'Beranda', href: '#/' }];
  if (cancer) trail.push({ label: cancer.shortName, href: route('c', cancer.id) });
  else trail.push({ label: 'Alat', href: '#/alat' });
  trail.push({ label: tool.name });

  const accent = cancer ? cancer.accent : '#0f766e';
  const toolBody = h('div', { class: 'panel', style: { '--accent': accent } });
  tool.render(toolBody);

  mount(root,
    crumbs(trail),
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__icon', style: { '--accent': accent, '--accent-soft': cancer ? cancer.accentSoft : '#f0fdfa' } },
        h('span', { style: { fontSize: '1.3rem' } }, '🧮')),
      h('div', {},
        h('h1', {}, tool.name),
        h('p', { class: 'page-head__sub' }, tool.category + (tool.scope ? ' · ' + tool.scope : ''))
      )
    ),
    h('p', { class: 'muted', style: { maxWidth: '70ch' } }, tool.short),
    cancer && cancer.systemicTherapy
      ? h('p', { class: 'muted', style: { margin: '0 0 4px', fontSize: '.9rem' } },
          '💊 ',
          h('a', { href: route('c', cancer.id, 'tab', 'therapy'), style: { color: accent, fontWeight: '600' } },
            `Pilihan terapi sistemik ${cancer.shortName} (lini-1/2, target, imuno, hormonal) →`))
      : null,
    toolBody,
    h('p', {}, h('a', { class: 'back-link', href: cancer ? route('c', cancer.id) : '#/alat' },
      '← Kembali ke ', cancer ? cancer.shortName : 'daftar alat'))
  );
}
