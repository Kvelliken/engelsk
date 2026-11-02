// Simulerer daglige økter for å sjekke repetisjon og nivåer (uten nettleser):
//
//     node verktoy/simuler.mjs [dager] [blokk|scene] [andel-riktig]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { app, settInnhold } from '../js/tilstand.js';
import { tomData, nyProfil } from '../js/lagring.js';
import { byggOkt } from '../js/okt.js';
import { registrer, erSett } from '../js/srs.js';
import { hoyesteApne } from '../js/nivaa.js';
import { leggTilDager } from '../js/dato.js';

const rot = fileURLToPath(new URL('..', import.meta.url));
const json = (f) => JSON.parse(readFileSync(rot + f, 'utf8'));
settInnhold(json('data/ord.json'), json('data/rammer.json'), json('data/temaer.json'),
  json('data/nivaaer.json'), json('data/samtaler.json'), json('data/dialoger.json'));

const dager = Number(process.argv[2] || 21);
const tema = process.argv[3] || 'blokk';
const andel = Number(process.argv[4] || 0.85);
app.data = tomData();
const p = nyProfil('Test', tema);
app.data.profiler.push(p);

let dag = '2026-01-05';
for (let d = 0; d < dager; d++) {
  const oppgaver = byggOkt(p, { dag });
  const typer = {};
  oppgaver.forEach((o) => {
    typer[o.type] = (typer[o.type] || 0) + 1;
    const svar = Math.random() < andel ? 'riktig' : 'feil';
    if (o.type === 'intro') registrer(p, o.ord, 'sett', dag);
    else if (o.type === 'bygg') {
      Object.values(o.valg).forEach((id) => registrer(p, id, svar === 'riktig' ? 'riktig' : 'delvis', dag));
      const r = p.rammer[o.ramme] || (p.rammer[o.ramme] = { riktig: 0 });
      if (svar === 'riktig') r.riktig++;
    } else if (o.type === 'samtale') {
      Object.values(o.valg).forEach((id) => registrer(p, id, 'riktig', dag));
    } else if (o.type === 'beskriv') {
      o.ting.forEach((t) => registrer(p, t.ord, 'riktig', dag));
    } else if (o.type === 'lytt' || o.type === 'si') registrer(p, o.ord, svar, dag);
  });
  p.okter.push({ dato: dag, fullfort: true, modus: 'vanlig' });
  const sett = app.ord.filter((o) => o.bildeoppgave !== false && erSett(p, o.id)).length;
  console.log(dag, 'nivå', hoyesteApne(p), String(oppgaver.length).padStart(2), JSON.stringify(typer), 'ord sett:', sett);
  dag = leggTilDager(dag, 1);
}
