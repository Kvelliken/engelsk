// Alle engelske tekster appen kan si høyt, fra data/*.json. Brukes av
// sjekk.mjs (finnes det lydfil for alt?) og lag-lyd.py (lag lydfilene).
// Setningene lages med den samme koden som appen bruker (js/setninger.js).
//
//     node verktoy/tekster.mjs     skriver { modell: [...], figur: [...] } som JSON
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lagSetning, setningsTekst, fyllInn } from '../js/setninger.js';

const ROT = fileURLToPath(new URL('..', import.meta.url));
const json = (f) => JSON.parse(readFileSync(join(ROT, f), 'utf8'));

// Tekster appen sier i tillegg (testknappen i voksenvisningen).
const EKSTRA = ['Hello! I like pizza. I see a cat.'];

// Alle kombinasjoner av ord i lukene til en ramme.
export function kombinasjoner(ramme, ordMap, bare = null) {
  const luker = Object.keys(ramme.slots).filter((l) => !bare || bare.indexOf(l) !== -1);
  let ut = [{}];
  for (const l of luker) {
    const neste = [];
    for (const delvis of ut) {
      for (const id of ramme.slots[l]) {
        if (ordMap[id]) neste.push(Object.assign({}, delvis, { [l]: ordMap[id] }));
      }
    }
    ut = neste;
  }
  return ut;
}

export function alleTekster() {
  const ord = json('data/ord.json');
  const rammer = json('data/rammer.json');
  const samtaler = json('data/samtaler.json');
  const dialoger = json('data/dialoger.json');
  const ordMap = {};
  ord.forEach((o) => { ordMap[o.id] = o; });

  const modell = new Set(EKSTRA);
  const figur = new Set(samtaler.kommentarer);
  ord.forEach((o) => modell.add(o.en));
  for (const r of rammer) {
    for (const valg of kombinasjoner(r, ordMap)) {
      const brikker = lagSetning(r, valg);
      brikker.forEach((b) => modell.add(b)); // brikkene sies når de legges i luka
      modell.add(setningsTekst(brikker, r));
    }
  }
  for (const s of samtaler.samtaler) {
    const r = rammer.find((x) => x.id === s.ramme);
    const luker = [...s.sporsmal.matchAll(/\{(\w+)/g)].map((m) => m[1]);
    if (!luker.length) figur.add(s.sporsmal);
    else kombinasjoner(r, ordMap, luker).forEach((valg) => figur.add(fyllInn(s.sporsmal, valg)));
  }
  for (const d of dialoger) {
    for (const rep of d.replikker) {
      const linjer = rep.valg ? rep.valg.map((v) => v.en) : [rep.en];
      linjer.forEach((t) => (rep.hvem === 'figur' ? figur : modell).add(t));
    }
  }
  return { modell: [...modell].sort(), figur: [...figur].sort() };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.stdout.write(JSON.stringify(alleTekster()));
}
