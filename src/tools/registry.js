// Registry of decision-support tools.
// Menambah alat baru: buat modul di folder ini, import, daftarkan di array.

import chemoDosing from './chemoDosing.js';
import ovarianAdjuvant from './ovarianAdjuvant.js';
import cervicalAdjuvant from './cervicalAdjuvant.js';
import endometrialMolecular from './endometrialMolecular.js';
import gtnScore from './gtnScore.js';

export const tools = [
  chemoDosing,
  ovarianAdjuvant,
  cervicalAdjuvant,
  endometrialMolecular,
  gtnScore,
];

const byId = new Map(tools.map((t) => [t.id, t]));

export function getTool(id) {
  return byId.get(id) || null;
}
