// Simulerer daglige økter for å sjekke repetisjonssystemet (uten nettleser):
//
//     node verktoy/simuler.mjs [dager] [blokk|scene] [andel-riktig]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { app, settInnhold } from '../js/tilstand.js';
import { tomData, nyProfil } from '../js/lagring.js';
import { byggOkt } from '../js/okt.js';
import { registrer, erSett, stjerner } from '../js/srs.js';
import { leggTilDager } from '../js/dato.js';

const rot = fileURLToPath(new URL('..', import.meta.url));
const json = (f) => JSON.parse(readFileSync(rot + f, 'utf8'));
settInnhold(json('data/ord.json'), json('data/rammer.json'), json('data/temaer.json'));

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
      registrer(p, o.ord, svar === 'riktig' ? 'riktig' : 'delvis', dag);
      const r = p.rammer[o.ramme] || (p.rammer[o.ramme] = { riktig: 0 });
      if (svar === 'riktig') r.riktig++;
    } else registrer(p, o.ord, svar, dag);
  });
  const sett = app.ord.filter((o) => erSett(p, o.id)).length;
  const tre = app.ord.filter((o) => stjerner(p, o.id) === 3).length;
  const rammer = [...new Set(oppgaver.filter((o) => o.type === 'bygg').map((o) => o.ramme))].join(',');
  console.log(dag, String(oppgaver.length).padStart(2), JSON.stringify(typer), 'sett:', sett, '★★★:', tre, rammer ? 'rammer: ' + rammer : '');
  dag = leggTilDager(dag, 1);
}
