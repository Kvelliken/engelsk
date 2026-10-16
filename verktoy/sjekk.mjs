// Sjekker at innholdet og cache-listen henger sammen. Ingen avhengigheter:
//
//     node verktoy/sjekk.mjs
//
// Kjør før hver commit. Feiler med kode 1 hvis noe er galt.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bildeFinnes } from '../js/bilder.js';

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

// ---- Ord, temaer og rammer ----
const ord = json('data/ord.json');
const temaer = json('data/temaer.json');
const rammer = json('data/rammer.json');
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

for (const r of rammer) {
  if (!Array.isArray(r.mal) || !r.mal.length) feil.push('Ramme ' + r.id + ' mangler mal');
  for (const t of r.mal) {
    if (t[0] === '{') continue;
    if (!ord.some((o) => o.tema === 'smaaord' && o.en.toLowerCase() === t.toLowerCase())) {
      feil.push('Ramme ' + r.id + ' bruker et småord som ikke er i ordlisten: ' + t);
    }
  }
  for (const id of r.ord) {
    const o = ordMap[id];
    if (!o) { feil.push('Ramme ' + r.id + ' viser til ukjent ord: ' + id); continue; }
    if (r.mal.includes('{art}') && !o.art) feil.push('Ramme ' + r.id + ': ' + id + ' mangler art');
    if (r.mal.includes('{liker}') && !o.liker) feil.push('Ramme ' + r.id + ': ' + id + ' mangler liker');
  }
}

const synlige = temaer.filter((t) => !t.skjult).length;
console.log(ord.length + ' ord, ' + synlige + ' temaer, ' + rammer.length + ' rammer, ' + filer.length + ' filer i cachen');
if (feil.length) {
  console.error('\nFEIL:\n- ' + feil.join('\n- '));
  process.exit(1);
}
console.log('Alt i orden ✓');
