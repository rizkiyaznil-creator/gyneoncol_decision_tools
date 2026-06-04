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
  const input = h('input', {
    id,
    type,
    value,
    inputmode: type === 'number' ? 'decimal' : null,
    step: type === 'number' ? 'any' : null,
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
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Standard warning callout reused across tools. */
export function disclaimerNote(text) {
  return h('div', { class: 'note note--warn' },
    h('strong', {}, '⚠️ Verifikasi klinis: '),
    text
  );
}
