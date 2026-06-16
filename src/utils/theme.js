// Tema aplikasi: 'light' | 'dark' | 'system'. Disimpan per perangkat, diterapkan
// ke atribut data-theme pada <html>. "system" mengikuti prefers-color-scheme.
export const THEME_KEY = 'gynonco-theme';

export function resolveTheme(pref) {
  if (pref === 'light' || pref === 'dark') return pref;
  return (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

export function getThemePref() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}

export function applyTheme(pref) {
  const resolved = resolveTheme(pref);
  document.documentElement.dataset.theme = resolved;
  try { localStorage.setItem(THEME_KEY, pref); } catch { /* ignore */ }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0b1220' : '#0f766e');
}

// Bila preferensi = 'system', ikut berubah saat tema OS berubah.
export function initSystemThemeListener() {
  if (typeof window.matchMedia !== 'function') return;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => { if (getThemePref() === 'system') applyTheme('system'); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
}
