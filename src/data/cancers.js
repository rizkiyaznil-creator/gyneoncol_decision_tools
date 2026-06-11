// Registry of gynecologic cancer modules.
// Menambah kanker baru: buat file data, import di sini, tambahkan ke array.

import ovarium from './ovarium.js';
import serviks from './serviks.js';
import endometrium from './endometrium.js';
import vulva from './vulva.js';
import gtn from './gtn.js';
import vagina from './vagina.js';
import sarkoma from './sarkoma.js';
import melanoma from './melanoma.js';

export const cancers = [ovarium, serviks, endometrium, vulva, gtn, vagina, sarkoma, melanoma];

const byId = new Map(cancers.map((c) => [c.id, c]));

export function getCancer(id) {
  return byId.get(id) || null;
}
