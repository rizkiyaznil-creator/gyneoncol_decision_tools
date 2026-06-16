// GynOnco Decision Tools — bootstrap & hash router.
import { clear } from './utils/dom.js';
import { getCancer } from './data/cancers.js';
import { getTool } from './tools/registry.js';
import { renderHome } from './components/home.js';
import { renderCancerPage } from './components/cancerPage.js';
import { renderToolPage } from './components/toolPage.js';
import { renderToolsIndex } from './components/toolsIndex.js';
import { renderAbout } from './components/about.js';
import { renderSearch } from './components/search.js';
import { renderPain } from './components/painPage.js';
import { renderNotFound } from './components/common.js';
import { initSystemThemeListener } from './utils/theme.js';

const content = document.getElementById('content');

function segments() {
  return location.hash.replace(/^#/, '').replace(/^\/+/, '').split('/').filter(Boolean);
}

// Sorot tab navigasi bawah sesuai rute aktif.
function highlightBottomNav(seg) {
  const key = seg[0] === 'tentang' ? 'about' : seg[0] === 'cari' ? 'search' : seg[0] === 'alat' ? 'tools' : 'home';
  document.querySelectorAll('.bottom-nav a[data-nav]').forEach((a) => {
    if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

// Hitung URL & label tujuan tombol kembali berdasarkan segmen rute.
function getBackTarget(seg) {
  if (seg.length === 0) return null;
  if (seg[0] === 'c' && seg[1]) {
    if ((seg[2] === 'alat' || seg[2] === 'tab') && seg[3]) {
      const cancer = getCancer(seg[1]);
      return { href: '#/c/' + seg[1], label: cancer ? cancer.name : 'Kembali' };
    }
    return { href: '#/', label: 'Beranda' };
  }
  if (seg[0] === 'alat' && seg[1]) return { href: '#/alat', label: 'Alat' };
  if (seg[0] === 'nyeri') return { href: '#/', label: 'Beranda' };
  return null;
}

function updateBackBtn(seg) {
  const btn = document.getElementById('back-btn');
  const lbl = document.getElementById('back-btn-label');
  if (!btn || !lbl) return;
  const target = getBackTarget(seg);
  if (target) {
    btn.hidden = false;
    lbl.textContent = target.label;
    btn.onclick = () => { location.href = target.href; };
  } else {
    btn.hidden = true;
    btn.onclick = null;
  }
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
    } else if (seg[2] === 'tab' && seg[3]) {
      renderCancerPage(content, cancer, seg[3]);
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
  } else if (seg[0] === 'cari') {
    renderSearch(content);
  } else if (seg[0] === 'nyeri') {
    renderPain(content);
  } else if (seg[0] === 'tentang') {
    renderAbout(content);
  } else {
    renderNotFound(content);
  }

  highlightBottomNav(seg);
  updateBackBtn(seg);
  window.scrollTo(0, 0);
  content.focus({ preventScroll: true });
}

window.addEventListener('hashchange', route);

// Tema "ikuti sistem" → ikut berubah saat tema OS berubah (preferensi diterapkan dini di index.html).
initSystemThemeListener();

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

// Gerbang akses tenaga kesehatan (atestasi sekali per perangkat, tanpa akun/verifikasi kredensial).
(function initProGate() {
  const gate = document.getElementById('pro-gate');
  if (!gate) return;
  const KEY = 'gynonco-pro-ack';
  const PATIENT_SITE_URL = ''; // TODO: isi URL situs edukasi pasien bila sudah ada.

  let acked = false;
  try { acked = localStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
  if (acked) { document.documentElement.classList.add('pro-ack'); return; }

  const mainCard = document.getElementById('pro-gate-main');
  const declinedCard = document.getElementById('pro-gate-declined');
  const accept = document.getElementById('pro-gate-accept');
  const decline = document.getElementById('pro-gate-decline');
  const back = document.getElementById('pro-gate-back');

  if (PATIENT_SITE_URL) {
    const span = document.getElementById('pro-gate-patient');
    if (span) {
      const link = document.createElement('a');
      link.href = PATIENT_SITE_URL;
      link.textContent = 'situs edukasi pasien kami';
      span.append(' Atau kunjungi ', link, '.');
    }
  }

  accept.addEventListener('click', () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    document.documentElement.classList.add('pro-ack');
    // Hindari notifikasi ganda: anggap disclaimer banner sudah dipahami.
    try { localStorage.setItem('gynonco-disclaimer-dismissed', '1'); } catch { /* ignore */ }
    const banner = document.getElementById('disclaimer-banner');
    if (banner) banner.hidden = true;
    content.focus({ preventScroll: true });
    window.dispatchEvent(new Event('gynonco-pro-acked'));
  });

  decline.addEventListener('click', () => { mainCard.hidden = true; declinedCard.hidden = false; back.focus(); });
  back.addEventListener('click', () => { declinedCard.hidden = true; mainCard.hidden = false; accept.focus(); });

  // Jaga fokus tetap di dalam gerbang (kunci scroll latar diatur via CSS).
  gate.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const card = mainCard.hidden ? declinedCard : mainCard;
    const f = card.querySelectorAll('button, a[href]');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  accept.focus();
})();

route();

// Analytics kunjungan (GoatCounter) — privacy-first, cookieless, tanpa consent banner.
// Hanya mengirim path rute (mis. /c/endometrium/alat/endometrial-staging) & referrer — TIDAK ada data pasien.
// Aktifkan dengan mengisi kode situs GoatCounter Anda (mis. 'gynonco' → gynonco.goatcounter.com).
const GOATCOUNTER_CODE = 'rizkiyaznil'; // Kode situs GoatCounter (rizkiyaznil.goatcounter.com).
(function initAnalytics() {
  if (!GOATCOUNTER_CODE) return;
  // no_onload: hitung manual agar setiap rute hash (SPA) tercatat konsisten.
  window.goatcounter = { no_onload: true };
  const s = document.createElement('script');
  s.async = true;
  s.src = '//gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', `https://${GOATCOUNTER_CODE}.goatcounter.com/count`);
  document.head.appendChild(s);

  const countView = () => {
    const gc = window.goatcounter;
    if (gc && typeof gc.count === 'function') {
      gc.count({ path: location.hash.replace(/^#/, '') || '/' });
    }
  };
  window.addEventListener('hashchange', countView);
  // Hitung kunjungan awal setelah count.js siap (poll hingga ~5 dtk).
  let tries = 25;
  (function ready() {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') countView();
    else if (tries-- > 0) setTimeout(ready, 200);
  })();
})();

// PWA: service worker (network-first) + tangkap prompt install (Android/Chrome).
(function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* abaikan */ });
    });
  }
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    window.dispatchEvent(new Event('pwa-installable'));
  });
  window.addEventListener('appinstalled', () => { deferred = null; });
  // API ringan dipakai halaman "Tentang" untuk memicu pemasangan.
  window.GynOncoPWA = {
    canInstall: () => !!deferred,
    install: async () => {
      if (!deferred) return false;
      deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      return choice && choice.outcome === 'accepted';
    },
  };
})();

// Popup ajakan install (saat dibuka di browser & belum terpasang) — muncul setelah gerbang tenaga kesehatan.
(function initInstallPopup() {
  const popup = document.getElementById('install-popup');
  if (!popup) return;
  const KEY = 'gynonco-install-dismissed';
  const standalone = (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  let dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
  if (standalone || dismissed) return;

  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  const goBtn = document.getElementById('install-popup-go');
  const laterBtn = document.getElementById('install-popup-later');
  const tips = document.getElementById('install-popup-tips');

  const close = (remember) => {
    popup.hidden = true;
    if (remember) { try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ } }
  };
  const showTips = () => {
    tips.textContent = isIOS
      ? 'iPhone/iPad (Safari): ketuk tombol Bagikan, lalu pilih “Tambahkan ke Layar Utama”.'
      : 'Buka menu browser (⋮), lalu pilih “Pasang aplikasi” / “Tambahkan ke layar utama”.';
    tips.hidden = false;
  };

  goBtn.addEventListener('click', async () => {
    const pwa = window.GynOncoPWA;
    if (pwa && pwa.canInstall && pwa.canInstall()) {
      const ok = await pwa.install();
      if (ok) close(true); else showTips();
    } else {
      showTips();
    }
  });
  laterBtn.addEventListener('click', () => close(true));
  popup.addEventListener('click', (e) => { if (e.target === popup) close(true); });

  const show = () => { if (popup.hidden) popup.hidden = false; };
  if (document.documentElement.classList.contains('pro-ack')) setTimeout(show, 700);
  else window.addEventListener('gynonco-pro-acked', () => setTimeout(show, 400));
})();
