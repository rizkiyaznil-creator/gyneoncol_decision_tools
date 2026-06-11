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

console.log(`\n${errors ? '❌ ' + errors + ' masalah' : '✅ Smoke test lolos'}\n`);
process.exit(errors ? 1 : 0);
