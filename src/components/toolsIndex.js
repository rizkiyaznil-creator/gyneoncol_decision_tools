import { h, mount } from '../utils/dom.js';
import { tools } from '../tools/registry.js';
import { crumbs } from './common.js';

function toolCard(tool) {
  return h('a', { class: 'card', href: `#/alat/${tool.id}` },
    h('p', { class: 'card__title' }, tool.name),
    h('div', { class: 'card__meta' },
      h('span', { class: 'tag' }, tool.scope || 'Umum')
    )
  );
}

export function renderToolsIndex(root) {
  // Kelompokkan berdasarkan kategori
  const byCat = new Map();
  for (const t of tools) {
    if (!byCat.has(t.category)) byCat.set(t.category, []);
    byCat.get(t.category).push(t);
  }

  const sections = [];
  for (const [cat, list] of byCat) {
    sections.push(h('div', { class: 'section-head' }, h('h2', {}, cat)));
    sections.push(h('div', { class: 'grid grid--tools' }, ...list.map(toolCard)));
  }

  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: 'Alat' }]),
    h('h1', {}, 'Semua alat bantu keputusan'),
    h('p', { class: 'muted', style: { maxWidth: '70ch' } },
      'Alat dapat dibuka dari sini secara lintas-kanker, atau dari modul kanker terkait. Daftar akan terus bertambah.'),
    ...sections
  );
}
