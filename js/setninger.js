// Hjelpere for setningsrammer (rammer.json).
//
// En ramme har en mal med faste ord og luker, f.eks.
//   mal:   ["I", "see", "{tall}", "{ord.flertall}"]
//   slots: { tall: ["two", "three"], ord: ["cat", "dog"] }
// «{ord.flertall}» betyr flertallsformen av ordet i luka «ord».
// Et valg er ett ord per luke: { tall: <ord>, ord: <ord> }.
import { app } from './tilstand.js';
import { erSett } from './srs.js';
import { stokk } from './dom.js';

const LUKE = /^\{(\w+)(?:\.(\w+))?\}$/;

export function finnRamme(id) {
  return app.rammer.find((r) => r.id === id);
}

// Hovedluka er den som bestemmer om setningen er «kjent» for barnet.
export function hovedLuke(ramme) {
  return ramme.hoved || (ramme.slots.ord ? 'ord' : Object.keys(ramme.slots)[0]);
}

export function form(ord, navn) {
  if (!navn || navn === 'en') return ord.en;
  if (navn === 'flertall') return ord.flertall || ord.liker || ord.en;
  return ord[navn];
}

// Ordbrikkene i en setning, f.eks. ["I", "see", "two", "cats"].
export function lagSetning(ramme, valg) {
  return ramme.mal.map((t) => {
    const m = LUKE.exec(t);
    return m ? form(valg[m[1]], m[2]) : t;
  });
}

// Hvilken luke hver brikke kommer fra (null for faste ord).
export function brikkeLuker(ramme) {
  return ramme.mal.map((t) => {
    const m = LUKE.exec(t);
    return m ? { luke: m[1], form: m[2] } : null;
  });
}

// Setningen som tekst med tegnsetting: «Can I have an apple, please?»
export function setningsTekst(brikker, ramme) {
  const t = brikker.join(' ').replace(/ please$/, ', please');
  return t + ((ramme && ramme.slutt) || '.');
}

// Fyll inn {luke.form} i en tekst (brukes for spørsmål som «How many {ord.flertall} do you see?»).
export function fyllInn(tekst, valg) {
  return tekst.replace(/\{(\w+)(?:\.(\w+))?\}/g, (_, luke, f) => form(valg[luke], f));
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

// Ordene som er valgt i lukene (id-er), hovedluka først.
export function valgteOrd(ramme, valg) {
  const hoved = hovedLuke(ramme);
  return [valg[hoved].id].concat(Object.keys(valg).filter((k) => k !== hoved).map((k) => valg[k].id));
}

// Velg ord til alle luker. Hovedluka bruker et kjent ord (eller et foretrukket),
// de andre lukene velges fritt, kjente ord først.
export function velgValg(ramme, profil, { foretrukket = null, kjente = null } = {}) {
  const hoved = hovedLuke(ramme);
  const erKjent = kjente || ((id) => erSett(profil, id));
  const valg = {};
  for (const luke of Object.keys(ramme.slots)) {
    const liste = ramme.slots[luke].filter((id) => app.ordMap[id]);
    let id;
    if (luke === hoved) {
      if (foretrukket && liste.indexOf(foretrukket) !== -1) id = foretrukket;
      else {
        const kjenteHer = liste.filter(erKjent);
        if (!kjenteHer.length) return null;
        id = stokk(kjenteHer)[0];
      }
    } else {
      const kjenteHer = liste.filter(erKjent);
      id = stokk(kjenteHer.length && Math.random() < 0.7 ? kjenteHer : liste)[0];
    }
    valg[luke] = app.ordMap[id];
  }
  return valg;
}

// Andre ord som kan stå i samme luke (til distraktorbrikker og svarvalg).
export function alternativer(ramme, luke, unntatt) {
  return ramme.slots[luke].filter((id) => app.ordMap[id] && unntatt.indexOf(id) === -1).map((id) => app.ordMap[id]);
}

export function rammeRiktig(profil, id) {
  return (profil.rammer[id] && profil.rammer[id].riktig) || 0;
}

// Nivå 1: bare det siste ordet mangler. Nivå 2: de to siste mangler. Nivå 3: hele setningen.
export function rammeNivaa(profil, id) {
  const r = rammeRiktig(profil, id);
  if (r < 2) return 1;
  if (r < 5) return 2;
  return 3;
}
