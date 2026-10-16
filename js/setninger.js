// Hjelpere for setningsrammer (rammer.json).
import { app } from './tilstand.js';

export function finnRamme(id) {
  return app.rammer.find((r) => r.id === id);
}

// Ordbrikkene i en setning, f.eks. ["I", "see", "a", "cat"].
export function lagSetning(ramme, ord) {
  return ramme.mal.map((t) => {
    if (t === '{art}') return ord.art;
    if (t === '{ord}') return ord.en;
    if (t === '{liker}') return ord.liker;
    return t;
  });
}

// Småordene i en setning (I, see, a …) som ord-id-er.
export function smaaordISetning(brikker) {
  const ider = [];
  brikker.forEach((b) => {
    const o = app.ord.find((x) => x.tema === 'smaaord' && x.en.toLowerCase() === b.toLowerCase());
    if (o) ider.push(o.id);
  });
  return ider;
}

export function rammeRiktig(profil, id) {
  return (profil.rammer[id] && profil.rammer[id].riktig) || 0;
}

// Nivå 1: bare ordet mangler. Nivå 2: de to siste mangler. Nivå 3: hele setningen.
export function rammeNivaa(profil, id) {
  const r = rammeRiktig(profil, id);
  if (r < 2) return 1;
  if (r < 5) return 2;
  return 3;
}
