// GynOnco Decision Tools — bootstrap & hash router.
import { clear } from './utils/dom.js';
import { getCancer } from './data/cancers.js';
import { getTool } from './tools/registry.js';
import { renderHome } from './components/home.js';
import { renderCancerPage } from './components/cancerPage.js';
import { renderToolPage } from './components/toolPage.js';
import { renderToolsIndex } from './components/toolsIndex.js';
import { renderAbout } from './components/about.js';
import { renderNotFound } from './components/common.js';

const content = document.getElementById('content');

function segments() {
  return location.hash.replace(/^#/, '').replace(/^\/+/, '').split('/').filter(Boolean);
}

function route() {
  const seg = segments();
  clear(content);

  if (seg.length === 0) {
    renderHome(content);
  } else if (seg[0] === 'c' && seg[1]) {
    const cancer = getCancer(seg[1]);
    if (!cancer) { renderNotFound(content); }
    else if (seg[2] === 'alat' && seg[3]) {
      const tool = getTool(seg[3]);
      tool ? renderToolPage(content, { cancer, tool }) : renderNotFound(content);
    } else {
      renderCancerPage(content, cancer);
    }
  } else if (seg[0] === 'alat') {
    if (seg[1]) {
      const tool = getTool(seg[1]);
      tool ? renderToolPage(content, { cancer: null, tool }) : renderNotFound(content);
    } else {
      renderToolsIndex(content);
    }
  } else if (seg[0] === 'tentang') {
    renderAbout(content);
  } else {
    renderNotFound(content);
  }

  window.scrollTo(0, 0);
  content.focus({ preventScroll: true });
}

window.addEventListener('hashchange', route);

// Disclaimer banner (dismissible, remembered per device).
(function initDisclaimer() {
  const banner = document.getElementById('disclaimer-banner');
  const dismiss = document.getElementById('disclaimer-dismiss');
  const KEY = 'gynonco-disclaimer-dismissed';
  let dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
  if (!dismissed) banner.hidden = false;
  dismiss.addEventListener('click', () => {
    banner.hidden = true;
    try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
  });
})();

route();
