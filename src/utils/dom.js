// Minimal DOM helpers — no framework, no build step.

/**
 * Hyperscript-style element builder.
 * @param {string} tag
 * @param {object} [attrs] - attributes; special keys: class, html, dataset, on<Event>
 * @param {...(Node|string|number|Array|null|false)} children
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, val] of Object.entries(value)) {
        if (val == null) continue;
        if (prop.startsWith('--')) el.style.setProperty(prop, val);
        else el.style[prop] = val;
      }
    }
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, value);
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false || child === true) continue;
    el.appendChild(
      child instanceof Node ? child : document.createTextNode(String(child))
    );
  }
  return el;
}

/** Remove all children from a node. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Replace the contents of a node with new children. */
export function mount(node, ...children) {
  clear(node);
  appendChildren(node, children);
  return node;
}

/** Build a hash link href from path segments. */
export function route(...segments) {
  return '#/' + segments.map((s) => String(s).replace(/^#?\/?/, '')).filter(Boolean).join('/');
}
