// Sjekker at innholdet og cache-listen henger sammen. Ingen avhengigheter:
//
//     node verktoy/sjekk.mjs
//
// Kjør før hver commit. Feiler med kode 1 hvis noe er galt.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bildeFinnes } from '../js/bilder.js';
import { alleTekster } from './tekster.mjs';

const ROT = fileURLToPath(new URL('..', import.meta.url));
const feil = [];
const les = (f) => readFileSync(join(ROT, f), 'utf8');
const json = (f) => JSON.parse(les(f));

// ---- Cache-listen i sw.js ----
const sw = les('sw.js');
const filer = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
for (const f of filer) if (!existsSync(join(ROT, f))) feil.push('sw.js lister en fil som ikke finnes: ' + f);

function alleFiler(mappe) {
  const ut = [];
  for (const navn of readdirSync(join(ROT, mappe))) {
    const sti = join(mappe, navn);
    if (statSync(join(ROT, sti)).isDirectory()) ut.push(...alleFiler(sti));
    else ut.push(relative('.', sti).split('\\').join('/'));
  }
  return ut;
}
const appFiler = ['index.html', 'manifest.webmanifest', ...alleFiler('css'), ...alleFiler('js'), ...alleFiler('data'), ...alleFiler('assets/ikoner')];
for (const f of appFiler) if (!filer.includes(f)) feil.push('Mangler i cache-listen i sw.js: ' + f);

// ---- Ingen eksterne adresser i appens kode ----
for (const f of appFiler.filter((x) => /\.(js|css|html|json|webmanifest)$/.test(x))) {
  const treff = les(f).match(/https?:\/\/[^\s'")]+/g);
  if (treff) feil.push('Ekstern adresse i ' + f + ': ' + treff.join(', '));
}

// ---- Ord, temaer, nivåer og rammer ----
const ord = json('data/ord.json');
const temaer = json('data/temaer.json');
const rammer = json('data/rammer.json');
const nivaaer = json('data/nivaaer.json');
const samtaler = json('data/samtaler.json');
const dialoger = json('data/dialoger.json');
const temaIder = new Set(temaer.map((t) => t.id));
const ordMap = {};
const PAKREVD = ['id', 'en', 'norsk', 'tema', 'frekvensrang', 'nivå', 'ordklasse'];

for (const o of ord) {
  for (const k of PAKREVD) if (o[k] === undefined || o[k] === '') feil.push('Ord ' + (o.id || '?') + ' mangler ' + k);
  if (ordMap[o.id]) feil.push('Dobbel id: ' + o.id);
  ordMap[o.id] = o;
  if (!temaIder.has(o.tema)) feil.push('Ukjent tema for ' + o.id + ': ' + o.tema);
  if (o.bildeoppgave !== false && !bildeFinnes(o.bilde)) feil.push('Ugyldig bilde for ' + o.id + ': ' + o.bilde);
  if (o.bilde && !bildeFinnes(o.bilde)) feil.push('Ugyldig bilde for ' + o.id + ': ' + o.bilde);
  if (o.art && o.art !== 'a' && o.art !== 'an') feil.push('Ugyldig artikkel for ' + o.id);
}
// Like bilder i samme tema gjør «Lytt og trykk» umulig.
for (const t of temaer) {
  const sett = {};
  ord.filter((o) => o.tema === t.id && o.bildeoppgave !== false).forEach((o) => {
    if (sett[o.bilde]) feil.push('Samme bilde for ' + sett[o.bilde] + ' og ' + o.id + ' i tema ' + t.id);
    sett[o.bilde] = o.id;
  });
}

const rammeIder = new Set(rammer.map((r) => r.id));
for (const r of rammer) {
  if (!Array.isArray(r.mal) || !r.mal.length) feil.push('Ramme ' + r.id + ' mangler mal');
  if (!r.slots) { feil.push('Ramme ' + r.id + ' mangler slots'); continue; }
  for (const t of r.mal) {
    const m = /^\{(\w+)(?:\.(\w+))?\}$/.exec(t);
    if (m) {
      if (!r.slots[m[1]]) { feil.push('Ramme ' + r.id + ' bruker ukjent luke: ' + t); continue; }
      for (const id of r.slots[m[1]]) {
        const o = ordMap[id];
        if (!o) feil.push('Ramme ' + r.id + ' viser til ukjent ord: ' + id);
        else if (m[2] && m[2] !== 'flertall' && !o[m[2]]) feil.push('Ramme ' + r.id + ': ' + id + ' mangler ' + m[2]);
        else if (m[2] === 'flertall' && !o.flertall && !o.liker) feil.push('Ramme ' + r.id + ': ' + id + ' mangler flertall');
      }
    } else if (!ord.some((o) => o.tema === 'smaaord' && o.en.toLowerCase() === t.toLowerCase())) {
      feil.push('Ramme ' + r.id + ' bruker et småord som ikke er i ordlisten: ' + t);
    }
  }
}
for (const n of nivaaer) {
  n.rammer.forEach((id) => { if (!rammeIder.has(id)) feil.push('Nivå ' + n.nr + ' viser til ukjent ramme: ' + id); });
  n.temaer.forEach((id) => { if (!temaIder.has(id)) feil.push('Nivå ' + n.nr + ' viser til ukjent tema: ' + id); });
}
for (const s of samtaler.samtaler) {
  if (!rammeIder.has(s.ramme)) feil.push('Samtale ' + s.id + ' viser til ukjent ramme: ' + s.ramme);
  if (s.type !== 'vis' && s.type !== 'velg') feil.push('Samtale ' + s.id + ' har ukjent type');
}
for (const d of dialoger) {
  if (!bildeFinnes(d.figur) || !bildeFinnes(d.ikon)) feil.push('Dialog ' + d.id + ' har ugyldig bilde');
  d.replikker.forEach((r, i) => {
    if (r.hvem !== 'figur' && r.hvem !== 'barn') feil.push('Dialog ' + d.id + ' replikk ' + i + ': ukjent «hvem»');
    if (!r.en && !r.valg) feil.push('Dialog ' + d.id + ' replikk ' + i + ' mangler tekst');
    if (r.bilde && !bildeFinnes(r.bilde)) feil.push('Dialog ' + d.id + ' replikk ' + i + ': ugyldig bilde ' + r.bilde);
    (r.valg || []).forEach((v) => { if (!bildeFinnes(v.bilde)) feil.push('Dialog ' + d.id + ': ugyldig bilde ' + v.bilde); });
  });
}

// ---- Lydfiler ----
const lyd = json('data/lyd.json');
const lydSett = new Set(lyd.filer);
const nokkel = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
for (const n of lyd.filer) if (!existsSync(join(ROT, 'assets/lyd', n + '.mp3'))) feil.push('data/lyd.json lister en lydfil som mangler: ' + n);
const tekster = alleTekster();
const mangler = tekster.modell.filter((t) => !lydSett.has(nokkel(t)))
  .concat(tekster.figur.filter((t) => !lydSett.has('f-' + nokkel(t))).map((t) => '(figur) ' + t));
if (mangler.length) {
  console.warn(mangler.length + ' tekster uten lydfil (iPad-stemmen brukes): ' + mangler.slice(0, 12).join(', ') + (mangler.length > 12 ? ' …' : ''));
  console.warn('Lag dem med: verktoy/lag-lyd.py (se README)');
}

const synlige = temaer.filter((t) => !t.skjult).length;
console.log(ord.length + ' ord, ' + synlige + ' temaer, ' + nivaaer.length + ' nivåer, ' + rammer.length + ' rammer, ' +
  samtaler.samtaler.length + ' samtaler, ' + dialoger.length + ' rollespill, ' + filer.length + ' filer i cachen, ' + lyd.filer.length + ' lydfiler');
if (feil.length) {
  console.error('\nFEIL:\n- ' + feil.join('\n- '));
  process.exit(1);
}
console.log('Alt i orden ✓');
