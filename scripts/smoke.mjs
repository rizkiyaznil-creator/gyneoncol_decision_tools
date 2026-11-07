// Smoke test render di DOM tiruan (jsdom). Menangkap error runtime di komponen & alat.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><main id="content"></main></body>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node; // global di peramban, perlu di-expose untuk jsdom
dom.window.Element.prototype.scrollIntoView = () => {};

const { cancers } = await import('../src/data/cancers.js');
const { tools, getTool } = await import('../src/tools/registry.js');
const { renderHome } = await import('../src/components/home.js');
const { renderCancerPage } = await import('../src/components/cancerPage.js');
const { renderToolPage } = await import('../src/components/toolPage.js');
const { renderToolsIndex } = await import('../src/components/toolsIndex.js');
const { renderAbout } = await import('../src/components/about.js');
const { renderSearch } = await import('../src/components/search.js');
const { renderPain } = await import('../src/components/painPage.js');
const { renderTrials } = await import('../src/components/trials.js');

let errors = 0;
const fail = (m, e) => { console.error('  ✗', m, '→', e?.message || e); errors++; };
const ok = (m) => console.log('  ✓', m);
const content = document.getElementById('content');
const fresh = () => { content.innerHTML = ''; return content; };

function exercise(container) {
  container.querySelectorAll('input').forEach((inp) => {
    if (inp.type === 'number' || inp.getAttribute('inputmode') === 'decimal') inp.value = '60';
    inp.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    inp.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
  container.querySelectorAll('select').forEach((sel) => {
    sel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
}

console.log('\n== Halaman umum ==');
try { renderHome(fresh()); const n = content.querySelectorAll('.card').length; if (n < 7) throw new Error(`hanya ${n} kartu`); ok(`home (${n} kartu)`); } catch (e) { fail('home', e); }
try { renderToolsIndex(fresh()); ok('daftar alat'); } catch (e) { fail('daftar alat', e); }
try { renderAbout(fresh()); ok('tentang'); } catch (e) { fail('tentang', e); }
try {
  const b = fresh(); renderSearch(b);
  const inp = b.querySelector('.search-box__input');
  const query = (q) => { inp.value = q; inp.dispatchEvent(new dom.window.Event('input', { bubbles: true })); return [...b.querySelectorAll('.search-result')]; };
  if (!query('serv').length) throw new Error('tak ada hasil untuk "serv"');
  // Pencarian obat: niraparib → harus menemukan tab Terapi Sistemik (ovarium) + alat dosis.
  const drug = query('niraparib');
  if (!drug.length) throw new Error('obat "niraparib" tak ditemukan');
  if (!drug.some((r) => /Terapi sistemik/i.test(r.textContent))) throw new Error('niraparib tak mengarah ke Terapi Sistemik');
  if (!query('durvalumab').some((r) => /Terapi sistemik|Dosis/i.test(r.textContent))) throw new Error('durvalumab tak ditemukan');
  ok('cari (menu, kanker, alat, obat/regimen, trial)');
} catch (e) { fail('cari', e); }
try { const b = fresh(); renderPain(b); if (!b.querySelector('.data-table')) throw new Error('konten nyeri tak render'); ok('manajemen nyeri'); } catch (e) { fail('manajemen nyeri', e); }
try {
  const b = fresh(); renderTrials(b);
  const all = b.querySelectorAll('.trial').length;
  if (all < 80) throw new Error(`hanya ${all} kartu trial`);
  if (!b.querySelector('.trial__ref a[href*="pubmed.ncbi.nlm.nih.gov/3"]')) throw new Error('tautan PubMed PMID langsung tak ada');
  if (!b.querySelector('.trial__ref a[href*="doi.org/"]')) throw new Error('tautan DOI tak ada');
  const ovChip = [...b.querySelectorAll('.trial-chip')].find((c) => /^Ovarium/i.test(c.textContent));
  if (!ovChip) throw new Error('chip filter kanker tak ada');
  ovChip.click();
  const nOv = b.querySelectorAll('.trial').length;
  if (!(nOv > 0 && nOv < all)) throw new Error('filter kanker tak mempersempit');
  const semua = [...b.querySelectorAll('.trial-chip')].find((c) => /Semua kanker/i.test(c.textContent));
  semua.click();
  const s = b.querySelector('.trial-search'); s.value = 'pembrolizumab';
  s.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  const nQ = b.querySelectorAll('.trial').length;
  if (!(nQ > 0 && nQ < all)) throw new Error('pencarian tak mempersempit');
  ok(`landmark trials (${all} trial, filter & cari)`);
} catch (e) { fail('landmark trials', e); }

console.log('\n== Halaman kanker (semua tab) ==');
for (const c of cancers) {
  try {
    renderCancerPage(fresh(), c);
    const tabBtns = [...content.querySelectorAll('.tabs button')];
    if (!content.querySelector('.stage-group')) throw new Error('tab stadium tak punya stage-group');
    tabBtns.forEach((b) => b.click()); // klik tiap tab → render histo/tools/refs
    if (!content.querySelector('.refs')) throw new Error('tab referensi gagal render');
    ok(`${c.id} (${tabBtns.length} tab)`);
  } catch (e) { fail(c.id, e); }
}

console.log('\n== Alat (render + simulasi input) ==');
for (const t of tools) {
  try {
    const box = fresh();
    t.render(box);
    exercise(box);
    // Kalkulator dosis: render & uji tiap regimen pada pemilih (menangkap error per-regimen).
    const regimenSel = box.querySelector('#cx-regimen');
    if (regimenSel) {
      const opts = [...regimenSel.options];
      for (const opt of opts) {
        regimenSel.value = opt.value;
        regimenSel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
        exercise(box);
      }
      ok(`${t.id} (${opts.length} regimen)`);
    } else {
      ok(`${t.id}`);
    }
  } catch (e) { fail(t.id, e); }
}

console.log('\n== Halaman alat dalam konteks kanker ==');
for (const c of cancers) {
  for (const tid of c.tools) {
    const tool = getTool(tid);
    if (!tool) continue;
    try { renderToolPage(fresh(), { cancer: c, tool }); exercise(content); } catch (e) { fail(`${c.id}/${tid}`, e); }
  }
}
ok('semua kombinasi kanker × alat dirender');

console.log('\n== ADNEX (validasi numerik contoh resmi BMJ) ==');
try {
  const box = fresh();
  getTool('adnexal-triage').render(box);
  const setN = (id, v) => { const e = box.querySelector('#' + id); e.value = v; e.dispatchEvent(new dom.window.Event('input', { bubbles: true })); };
  const setS = (id, v) => { const e = box.querySelector('#' + id); e.value = v; e.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  const msel = [...box.querySelectorAll('select')].find((s) => [...s.options].some((o) => o.value === 'adnex'));
  msel.value = 'adnex'; msel.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  // Contoh resmi BMJ 2014: usia 55, lesi 120 mm, solid 20 mm, >10 lokulus, 0 papiler, tanpa bayangan, asites, senter onkologi.
  setN('adx-age', '55'); setN('adx-lesion', '120'); setN('adx-solid', '20');
  setS('adx-loc', 'yes'); setS('adx-pap', '0'); setS('adx-shadow', 'no'); setS('adx-asc', 'yes'); setS('adx-center', 'onco');
  const txt = () => box.querySelector('.result').textContent.replace(/\s+/g, ' ');
  setN('adx-ca125', '42');
  const w = txt();
  if (!(w.includes('67.6%') && w.includes('37.4%') && w.includes('8.4%') && w.includes('dengan CA-125'))) throw new Error('dengan CA-125 ≠ contoh BMJ: ' + w.slice(0, 160));
  setN('adx-ca125', '');
  const wo = txt();
  if (!(wo.includes('80.9%') && wo.includes('25.2%') && wo.includes('35.8%') && wo.includes('tanpa CA-125'))) throw new Error('tanpa CA-125 ≠ contoh BMJ: ' + wo.slice(0, 160));
  ok('ADNEX dengan & tanpa CA-125 cocok contoh resmi BMJ (67,6% / 80,9%)');
} catch (e) { fail('ADNEX validasi numerik', e); }

console.log(`\n${errors ? '❌ ' + errors + ' masalah' : '✅ Smoke test lolos'}\n`);
process.exit(errors ? 1 : 0);
