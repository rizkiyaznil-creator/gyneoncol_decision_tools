// Registry of decision-support tools.
// Menambah alat baru: buat modul di folder ini, import, daftarkan di array.
// Urutan array menentukan urutan tampil di Beranda & halaman "Alat".
// Kalkulator dosis (lintas-kanker) sengaja paling atas sebagai alat unggulan;
// alat Endometrium diprioritaskan memimpin alat spesifik-kanker (sebelum Ovarium).

import chemoDosing from './chemoDosing.js';
import endometrialMolecular from './endometrialMolecular.js';
import endometrialStaging from './endometrialStaging.js';
import adnexalTriage from './adnexalTriage.js';
import ovarianAdjuvant from './ovarianAdjuvant.js';
import cervicalAdjuvant from './cervicalAdjuvant.js';
import cervicalStaging from './cervicalStaging.js';
import vulvarAdjuvant from './vulvarAdjuvant.js';
import uterineSarcomaAdjuvant from './uterineSarcomaAdjuvant.js';
import melanomaStaging from './melanomaStaging.js';
import melanomaManagement from './melanomaManagement.js';
import opioidConversion from './opioidConversion.js';
import gtnScore from './gtnScore.js';

export const tools = [
  chemoDosing,
  endometrialMolecular,
  endometrialStaging,
  adnexalTriage,
  ovarianAdjuvant,
  cervicalAdjuvant,
  cervicalStaging,
  vulvarAdjuvant,
  uterineSarcomaAdjuvant,
  melanomaStaging,
  melanomaManagement,
  opioidConversion,
  gtnScore,
];

const byId = new Map(tools.map((t) => [t.id, t]));

export function getTool(id) {
  return byId.get(id) || null;
}
