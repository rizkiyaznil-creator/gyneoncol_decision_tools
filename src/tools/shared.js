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
 * Tooltip "ⓘ" yang dapat di-hover (desktop) & di-tap (mobile).
 * label = teks aria untuk tombol; children = isi balon penjelasan.
 */
export function infoTip(label, ...children) {
  const bubble = h('span', { class: 'tip__bubble', role: 'tooltip' }, ...children.filter(Boolean));
  const btn = h('button', { type: 'button', class: 'tip__btn', 'aria-label': label || 'Info', 'aria-expanded': 'false' }, 'ⓘ');
  const wrap = h('span', { class: 'tip' }, btn, bubble);
  let bound = false;
  const onDoc = (e) => { if (!wrap.contains(e.target)) setOpen(false); };
  // Geser balon agar tidak keluar tepi layar (penting di HP: pemicu bisa di tengah baris).
  function reposition() {
    bubble.style.left = '0'; bubble.style.right = 'auto';
    const r = bubble.getBoundingClientRect();
    const pad = 8, vw = window.innerWidth || document.documentElement.clientWidth;
    if (r.right > vw - pad) {
      let shift = r.right - (vw - pad);
      if (r.left - shift < pad) shift -= (pad - (r.left - shift));
      bubble.style.left = `${-shift}px`;
    }
  }
  function setOpen(open) {
    wrap.classList.toggle('tip--open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && typeof requestAnimationFrame === 'function') requestAnimationFrame(reposition);
    if (open && !bound) { bound = true; setTimeout(() => document.addEventListener('click', onDoc), 0); }
    if (!open && bound) { bound = false; document.removeEventListener('click', onDoc); }
  }
  btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setOpen(!wrap.classList.contains('tip--open')); });
  btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); btn.blur(); } });
  // Desktop: hover juga memposisikan ulang balon (dibuka via CSS :hover).
  wrap.addEventListener('mouseenter', () => { if (typeof requestAnimationFrame === 'function') requestAnimationFrame(reposition); });
  return wrap;
}

/**
 * Seksi hasil: judul ber-aksen + daftar butir (kelas ber-gaya, mudah dibaca).
 * Menggantikan helper `section(title, items)` inline yang tersebar di alat.
 */
export function resultSection(title, items, opts = {}) {
  if (!items || !items.length) return null;
  return h('div', { class: 'result-section' },
    h('p', { class: 'result-section__title' }, opts.icon ? `${opts.icon} ${title}` : title),
    h('ul', { class: 'result-section__list' }, ...items.map((t) => h('li', {}, t))));
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
  nodes.push(h('p', { class: 'flow__legend' },
    'Kotak teal = pilihan sesuai input. Hasil: hijau (risiko rendah) · amber (menengah) · merah (tinggi).'));
  return h('div', { class: 'flow' }, ...nodes);
}

/** Disclosure "diagram alur" — terbuka secara default. */
export function flowDisclosure(steps) {
  const d = disclosure('diagram alur', renderFlow(steps));
  d.open = true;
  return d;
}
