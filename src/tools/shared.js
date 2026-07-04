// Shared helpers for interactive tools.
import { h, mount } from '../utils/dom.js';

/** Parse a localized number (accepts comma decimals). NaN if invalid. */
export function num(value) {
  if (value == null) return NaN;
  const n = parseFloat(String(value).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

/** Round to n decimals and return a Number. */
export function round(value, n = 2) {
  const f = 10 ** n;
  return Math.round(value * f) / f;
}

/** A labelled input field. Returns { el, input }. */
export function field({ id, label, hint, unit, type = 'number', value = '', attrs = {} }) {
  // Field numerik dirender sebagai type="text" + inputmode="decimal".
  // Pada keyboard iOS dengan locale koma (mis. Indonesia), <input type="number">
  // menolak pemisah desimal koma sehingga "0,8" terbaca "08" dan dosis jadi salah.
  // num() menerima koma maupun titik, jadi type="text" tetap akurat & aman.
  const numeric = type === 'number';
  const input = h('input', {
    id,
    type: numeric ? 'text' : type,
    value,
    inputmode: numeric ? 'decimal' : null,
    ...(numeric ? { autocomplete: 'off', autocorrect: 'off', spellcheck: 'false' } : {}),
    ...attrs,
  });
  const control = unit
    ? h('div', { class: 'input-group' }, input, h('span', { class: 'unit' }, unit))
    : input;
  const el = h('div', { class: 'field' },
    h('label', { for: id }, label),
    control,
    hint ? h('span', { class: 'field__hint' }, hint) : null
  );
  return { el, input };
}

/** A labelled <select>. options: [{value,label}]. Returns { el, input }. */
export function selectField({ id, label, hint, options, value }) {
  const input = h('select', { id },
    ...options.map((o) =>
      h('option', { value: String(o.value), selected: String(o.value) === String(value) ? true : null }, o.label)
    )
  );
  const el = h('div', { class: 'field' },
    h('label', { for: id }, label),
    input,
    hint ? h('span', { class: 'field__hint' }, hint) : null
  );
  return { el, input };
}

/** A stat tile for result boxes. */
export function stat(value, key) {
  return h('div', { class: 'result__stat' },
    h('div', { class: 'v' }, value),
    h('div', { class: 'k' }, key)
  );
}

/** Render a headline result into a container element. */
export function showResult(container, { headline, sub, stats = [], extra = [] } = {}) {
  mount(container,
    headline ? h('p', { class: 'result__headline' }, headline) : null,
    sub ? h('p', { class: 'result__sub' }, sub) : null,
    stats.length ? h('div', { class: 'result__grid' }, ...stats) : null,
    ...extra
  );
  container.hidden = false;
}

/** Standard warning callout reused across tools. */
export function disclaimerNote(text) {
  return h('div', { class: 'note note--warn' },
    h('strong', {}, '⚠️ Verifikasi klinis: '),
    text
  );
}

/** Blok rumus monospace untuk dipakai di dalam disclosure kriteria. */
export function formula(text) {
  return h('div', { class: 'criteria__formula' }, text);
}

/**
 * Disclosure <details> generik dengan label "Tampilkan/Sembunyikan <label>".
 */
export function disclosure(label, ...children) {
  return h('details', { class: 'criteria' },
    h('summary', { class: 'criteria__summary' },
      h('span', { class: 'criteria__chev', 'aria-hidden': 'true' }),
      h('span', { class: 'criteria__verb criteria__verb--show' }, 'Tampilkan '),
      h('span', { class: 'criteria__verb criteria__verb--hide' }, 'Sembunyikan '),
      h('span', {}, label)
    ),
    h('div', { class: 'criteria__body' }, ...children.filter(Boolean))
  );
}

/**
 * Disclosure "Tampilkan kriteria & rumus" yang dapat dibuka-tutup (native <details>).
 * Memperlihatkan dasar perhitungan/kriteria agar hasil alat transparan & dapat diverifikasi.
 */
export function criteriaBox(...children) {
  return disclosure('kriteria & rumus', ...children);
}

/**
 * Render node diagram alur dinamis.
 * steps: [{ kind:'decision', q, branches:[{t,on}] } | { kind:'outcome', label, tone:'low'|'int'|'high' }]
 * Cabang aktif (on:true) disorot; alternatif tampil redup.
 */
export function renderFlow(steps) {
  const nodes = [];
  steps.forEach((s, idx) => {
    if (idx > 0) nodes.push(h('div', { class: 'flow__arrow', 'aria-hidden': 'true' }, '↓'));
    if (s.kind === 'decision') {
      nodes.push(h('div', { class: 'flow__node flow__node--decision' },
        h('p', { class: 'flow__q' }, s.q),
        h('div', { class: 'flow__branches' }, ...s.branches.map((b) =>
          h('span', { class: 'flow__branch' + (b.on ? ' flow__branch--active' : '') }, b.t)))));
    } else {
      nodes.push(h('div', { class: `flow__node flow__outcome flow__outcome--${s.tone}` }, `✓ ${s.label}`));
    }
  });
  return h('div', { class: 'flow' }, ...nodes);
}

/** Disclosure "diagram alur" — terbuka secara default. */
export function flowDisclosure(steps) {
  const d = disclosure('diagram alur', renderFlow(steps));
  d.open = true;
  return d;
}
