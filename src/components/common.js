import { h, mount } from '../utils/dom.js';

/** Breadcrumb nav. items: [{label, href?}] — last item without href = current. */
export function crumbs(items) {
  const nodes = [];
  items.forEach((it, i) => {
    if (i) nodes.push(h('span', { 'aria-hidden': 'true' }, '›'));
    nodes.push(
      it.href ? h('a', { href: it.href }, it.label) : h('span', { class: 'crumbs__current' }, it.label)
    );
  });
  return h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, ...nodes);
}

/** Coloured code badge for a cancer. variant: 'card' | 'page'. */
export function iconBox(cancer, variant = 'card') {
  const cls = variant === 'page' ? 'page-head__icon' : 'card__icon';
  return h('div', { class: cls, style: { '--accent': cancer.accent, '--accent-soft': cancer.accentSoft } },
    h('span', { style: { fontSize: variant === 'page' ? '1.2rem' : '1rem', fontWeight: '800', letterSpacing: '.03em' } }, cancer.code)
  );
}

/** Render a FIGO/WHO staging system block. */
export function renderStaging(staging, accent) {
  const groups = staging.groups.map((g) => {
    const subs = (g.sub || []).map((s) =>
      h('div', { class: 'stage-sub', style: s.child ? { paddingLeft: '34px' } : null },
        h('div', { class: 'stage-sub__label' }, s.label),
        h('div', { class: 'stage-sub__desc' }, s.desc)
      )
    );
    return h('div', { class: 'stage-group' },
      h('div', { class: 'stage-group__head' },
        h('span', { class: 'stage-badge' }, g.stage),
        h('span', { class: 'stage-group__title' }, g.title)
      ),
      ...subs
    );
  });

  return h('div', { style: { '--accent': accent } },
    h('p', { class: 'staging-system' }, 'Sistem staging: ', h('strong', {}, staging.system)),
    staging.guidelineNote
      ? h('div', { class: 'note note--warn' }, h('strong', {}, 'Catatan guideline — '), staging.guidelineNote)
      : null,
    staging.note ? h('div', { class: 'note' }, staging.note) : null,
    ...groups,
    staging.defs && staging.defs.length
      ? h('div', { class: 'staging-defs', style: { margin: '16px 0 0' } },
          h('p', { style: { fontWeight: '700', fontSize: '.9rem', margin: '0 0 8px', color: 'var(--slate-700)' } }, 'Definisi & kriteria kunci'),
          h('dl', { class: 'kv' },
            staging.defs.map(([term, def]) => [h('dt', {}, term), h('dd', {}, def)])))
      : null,
    staging.molecularNote
      ? h('div', { class: 'note' }, h('strong', {}, 'Modifier molekuler — '), staging.molecularNote)
      : null,
    h('p', { class: 'refs', style: { marginTop: '12px', marginBottom: '0' } }, 'Referensi: ', staging.reference)
  );
}

/** Histology / clinical notes section. */
export function renderHistology(hist) {
  if (!hist) return h('p', { class: 'muted' }, 'Belum tersedia.');
  return h('div', {},
    h('h3', { style: { marginTop: '0' } }, hist.title),
    h('div', { class: 'table-scroll' },
      h('table', { class: 'data-table' },
        h('tbody', {}, ...hist.items.map(([k, v]) =>
          h('tr', {}, h('th', { style: { width: '32%' } }, k), h('td', {}, v))))
      )
    ),
    hist.note ? h('div', { class: 'note' }, hist.note) : null
  );
}

/** Numbered references list. */
export function referencesList(refs) {
  return h('div', { class: 'refs' }, h('ol', {}, ...refs.map((r) => h('li', {}, r))));
}

/** Simple tab strip. tabDefs: [{id,label,render:()=>Node}]. */
export function tabStrip(tabDefs) {
  const panel = h('div', {});
  const buttons = [];
  function select(id) {
    buttons.forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'));
    mount(panel, tabDefs.find((t) => t.id === id).render());
  }
  const bar = h('div', { class: 'tabs', role: 'tablist' },
    ...tabDefs.map((t) => {
      const b = h('button', { type: 'button', role: 'tab', dataset: { tab: t.id }, onClick: () => select(t.id) }, t.label);
      buttons.push(b);
      return b;
    })
  );
  const root = h('div', {}, bar, panel);
  select(tabDefs[0].id);
  return root;
}

/** 404 / unknown route. */
export function renderNotFound(root) {
  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: 'Tidak ditemukan' }]),
    h('div', { class: 'empty' },
      h('h1', {}, 'Halaman tidak ditemukan'),
      h('p', { class: 'muted' }, 'Tautan mungkin keliru atau konten belum tersedia.'),
      h('p', {}, h('a', { class: 'btn btn--primary', href: '#/' }, 'Kembali ke beranda'))
    )
  );
}
