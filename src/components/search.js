import { h, mount, route } from '../utils/dom.js';
import { crumbs } from './common.js';
import { cancers } from '../data/cancers.js';
import { tools } from '../tools/registry.js';

const MIN = 3; // saran muncul setelah ≥ 3 huruf

// Indeks pencarian: menu utama + modul kanker + alat.
function buildIndex() {
  const e = [];
  e.push({ label: 'Beranda', sub: 'Halaman utama', type: 'Menu', href: '#/', text: 'beranda home utama awal' });
  e.push({ label: 'Semua alat', sub: 'Daftar alat bantu keputusan', type: 'Menu', href: '#/alat', text: 'alat tools daftar kalkulator algoritma' });
  e.push({ label: 'Tentang & Disclaimer', sub: 'Ruang lingkup, privasi, ukuran teks, bagikan', type: 'Menu', href: '#/tentang', text: 'tentang disclaimer privasi ukuran teks bagikan pasang aplikasi' });
  for (const c of cancers) {
    e.push({
      label: c.name, sub: c.subtitle, type: 'Kanker', href: route('c', c.id),
      text: [c.name, c.shortName, c.subtitle, c.blurb, c.code, c.staging && c.staging.system].filter(Boolean).join(' ').toLowerCase(),
    });
  }
  for (const t of tools) {
    e.push({
      label: t.name, sub: t.short, type: 'Alat', href: '#/alat/' + t.id,
      text: [t.name, t.short, t.category, t.scope].filter(Boolean).join(' ').toLowerCase(),
    });
  }
  return e;
}

function score(entry, q) {
  const label = entry.label.toLowerCase();
  if (label.startsWith(q)) return 4;
  if (label.includes(q)) return 3;
  if ((entry.sub || '').toLowerCase().includes(q)) return 2;
  if (entry.text.includes(q)) return 1;
  return 0;
}

export function renderSearch(root) {
  const index = buildIndex();
  const input = h('input', {
    type: 'search', class: 'search-box__input', placeholder: 'Cari modul kanker, alat, atau menu…',
    autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Kata kunci pencarian',
  });
  const results = h('div', { class: 'search-results', role: 'listbox', 'aria-label': 'Hasil pencarian' });
  const hint = h('p', { class: 'muted', style: { margin: '12px 2px 0', fontSize: '.9rem' } }, `Ketik minimal ${MIN} huruf untuk melihat saran.`);

  let items = [];
  let sel = -1;

  const go = (href) => { window.location.hash = href; };

  function row(entry, i) {
    return h('a', {
      class: 'search-result', href: entry.href, role: 'option', dataset: { i: String(i) },
      onMouseenter: () => { sel = i; paint(); },
    },
      h('span', { class: 'search-result__type' }, entry.type),
      h('span', { class: 'search-result__main' },
        h('span', { class: 'search-result__title' }, entry.label),
        entry.sub ? h('span', { class: 'search-result__sub' }, entry.sub) : null));
  }

  function paint() {
    const rows = results.querySelectorAll('.search-result');
    rows.forEach((el, i) => el.classList.toggle('is-active', i === sel));
    if (sel >= 0 && rows[sel]) rows[sel].scrollIntoView({ block: 'nearest' });
  }

  function update() {
    const q = input.value.trim().toLowerCase();
    sel = -1;
    if (q.length < MIN) { items = []; mount(results); hint.hidden = false; return; }
    hint.hidden = true;
    items = index.map((e) => [score(e, q), e]).filter((x) => x[0] > 0)
      .sort((a, b) => b[0] - a[0]).slice(0, 12).map((x) => x[1]);
    if (!items.length) { mount(results, h('p', { class: 'muted', style: { margin: '4px 2px' } }, `Tidak ada hasil untuk “${input.value.trim()}”.`)); return; }
    mount(results, ...items.map(row));
  }

  input.addEventListener('input', update);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown' && items.length) { ev.preventDefault(); sel = (sel + 1) % items.length; paint(); }
    else if (ev.key === 'ArrowUp' && items.length) { ev.preventDefault(); sel = (sel - 1 + items.length) % items.length; paint(); }
    else if (ev.key === 'Enter') { const t = items[sel >= 0 ? sel : 0]; if (t) go(t.href); }
    else if (ev.key === 'Escape') { input.value = ''; update(); }
  });

  mount(root,
    crumbs([{ label: 'Beranda', href: '#/' }, { label: 'Cari' }]),
    h('h1', { style: { marginBottom: '12px' } }, 'Cari'),
    h('div', { class: 'search-box' },
      h('span', { class: 'search-box__icon', 'aria-hidden': 'true' }, '🔍'),
      input),
    hint,
    results
  );
  input.focus();
}
