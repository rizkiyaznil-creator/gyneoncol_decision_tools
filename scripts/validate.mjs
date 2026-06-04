// Pemeriksaan integritas modul (dijalankan di Node, tanpa DOM).
import { cancers, getCancer } from '../src/data/cancers.js';
import { tools, getTool } from '../src/tools/registry.js';

let errors = 0;
const fail = (m) => { console.error('  ✗', m); errors++; };
const ok = (m) => console.log('  ✓', m);

console.log('\n== Kanker ==');
const requiredCancerKeys = ['id', 'name', 'shortName', 'code', 'subtitle', 'accent', 'blurb', 'staging', 'tools', 'references'];
for (const c of cancers) {
  for (const k of requiredCancerKeys) if (!(k in c)) fail(`${c.id || '?'} kehilangan field "${k}"`);
  if (!c.staging?.groups?.length) fail(`${c.id} staging.groups kosong`);
  if (getCancer(c.id) !== c) fail(`getCancer("${c.id}") tidak konsisten`);
  for (const tid of c.tools) if (!getTool(tid)) fail(`${c.id} merujuk alat tidak dikenal "${tid}"`);
  ok(`${c.id} — ${c.name} (${c.staging.system}, ${c.tools.length} alat)`);
}
if (cancers.length !== 7) fail(`harus 7 kanker, ada ${cancers.length}`);

console.log('\n== Alat ==');
for (const t of tools) {
  for (const k of ['id', 'name', 'short', 'category', 'render']) if (!(k in t)) fail(`alat ${t.id || '?'} kehilangan "${k}"`);
  if (typeof t.render !== 'function') fail(`alat ${t.id} render bukan fungsi`);
  ok(`${t.id} — ${t.name}`);
}

console.log(`\n${errors ? '❌ ' + errors + ' masalah' : '✅ Semua pemeriksaan lolos'}\n`);
process.exit(errors ? 1 : 0);
