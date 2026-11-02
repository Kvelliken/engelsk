// Nivåer (data/nivaaer.json). Nivå 1 er alltid åpent. Neste nivå åpnes når
// barnet har ★ på minst tre av fire bildeord i nivået, eller har bestått
// «Test deg ut». Alle åpne nivåer kan velges fritt.
import { app } from './tilstand.js';
import { stjerner, erSett } from './srs.js';

export const ANDEL_FOR_FULLFORT = 0.75;

export function nivaaFor(nr) {
  return app.nivaaer.find((n) => n.nr === nr);
}

export function temaNivaa(temaId) {
  const t = app.temaMap[temaId];
  return (t && t.nivaa) || 1;
}

export function ordNivaa(ord) {
  return temaNivaa(ord.tema);
}

export function rammeNivaaNr(ramme) {
  return ramme.nivaa || 1;
}

// Bildeordene som hører til et nivå.
export function ordINivaa(nr) {
  return app.ord.filter((o) => o.bildeoppgave !== false && ordNivaa(o) === nr);
}

export function fremdrift(profil, nr) {
  const ord = ordINivaa(nr);
  const medStjerne = ord.filter((o) => stjerner(profil, o.id) >= 1).length;
  const sett = ord.filter((o) => erSett(profil, o.id)).length;
  return { antall: ord.length, medStjerne, sett, andel: ord.length ? medStjerne / ord.length : 1 };
}

function lagret(profil, nr) {
  return (profil.nivaaer && profil.nivaaer[nr]) || {};
}

export function erBestatt(profil, nr) {
  return !!lagret(profil, nr).bestatt;
}

export function erFullfort(profil, nr) {
  return erBestatt(profil, nr) || fremdrift(profil, nr).andel >= ANDEL_FOR_FULLFORT;
}

export function maksNivaa() {
  return app.nivaaer.length ? app.nivaaer[app.nivaaer.length - 1].nr : 1;
}

// Det høyeste nivået barnet har åpnet (der det «er» nå).
export function hoyesteApne(profil) {
  let n = 1;
  while (n < maksNivaa() && erFullfort(profil, n)) n++;
  return n;
}

export function erApent(profil, nr) {
  return nr <= hoyesteApne(profil);
}

export function settBestatt(profil, nr, dato) {
  if (!profil.nivaaer) profil.nivaaer = {};
  profil.nivaaer[nr] = Object.assign({}, profil.nivaaer[nr], { bestatt: true, dato });
}

// Tekst som forklarer hvordan et låst nivå åpnes.
export function hvordanApne(profil, nr) {
  const forrige = nr - 1;
  const f = fremdrift(profil, forrige);
  const trengs = Math.ceil(f.antall * ANDEL_FOR_FULLFORT);
  return 'Få ★ på ' + trengs + ' ord i nivå ' + forrige + ' (du har ' + f.medStjerne + '), eller klar «Test deg ut» der.';
}
