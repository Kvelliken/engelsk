// En økt: ca. 10 minutter, 12–15 korte oppgaver, avsluttes på en positiv note.
import { el, knapp, visSkjerm, stokk, dialog, tom } from './dom.js';
import { app, aktivProfil, lagreData, interesseTema } from './tilstand.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { status, registrer, erSett, forfaller } from './srs.js';
import { smaaordISetning, rammeRiktig } from './setninger.js';
import { idag } from './dato.js';
import { topplinje, effektKnapp, bilde } from './felles.js';
import { effekt, siTekst } from './lyd.js';
import { konfetti, nyttKlistremerke } from './belonning.js';
import * as seOgHor from './aktiviteter/se-og-hor.js';
import * as lyttOgTrykk from './aktiviteter/lytt-og-trykk.js';
import * as siDetHoyt from './aktiviteter/si-det-hoyt.js';
import * as setningsbygger from './aktiviteter/setningsbygger.js';

const AKTIVITETER = { intro: seOgHor, lytt: lyttOgTrykk, si: siDetHoyt, bygg: setningsbygger };
export const MIN_OPPGAVER = 12;
export const MAKS_OPPGAVER = 15;
const INTERESSE_FORSPRANG = 15; // interessetemaet til profilen kommer litt tidligere

// Fletter to lister: a1 b1 a2 b2 …
function flett(a, b) {
  const ut = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (i < a.length) ut.push(a[i]);
    if (i < b.length) ut.push(b[i]);
  }
  return ut;
}

function bildeord() {
  return app.ord.filter((o) => o.bildeoppgave !== false);
}

function lyttOppgave(profil, o) {
  const antall = status(profil, o.id).boks >= 3 ? 4 : 3;
  const sammeTema = bildeord().filter((x) => x.tema === o.tema && x.id !== o.id && x.bilde !== o.bilde);
  let andre = stokk(sammeTema);
  if (andre.length < antall - 1) {
    andre = andre.concat(stokk(bildeord().filter((x) => x.tema !== o.tema)));
  }
  const valg = stokk([o].concat(andre.slice(0, antall - 1))).map((x) => x.id);
  return { type: 'lytt', ord: o.id, valg };
}

function byggOppgaver(profil, nye, antall) {
  if (antall <= 0) return [];
  const nyeIder = nye.map((o) => o.id);
  const tilgjengelig = (id) => erSett(profil, id) || nyeIder.indexOf(id) !== -1;
  const antallKjente = bildeord().filter((o) => erSett(profil, o.id)).length + nye.length;
  const rammer = app.rammer
    .filter((r) => antallKjente >= r.laasOpp)
    .map((r) => ({ r, ord: r.ord.filter((id) => app.ordMap[id] && tilgjengelig(id)) }))
    .filter((x) => x.ord.length)
    .sort((a, b) => rammeRiktig(profil, a.r.id) - rammeRiktig(profil, b.r.id));
  const ut = [];
  for (let i = 0; i < antall && rammer.length; i++) {
    const x = rammer[i % rammer.length];
    const brukt = ut.map((o) => o.ord);
    const kandidater = x.ord.filter((id) => brukt.indexOf(id) === -1);
    if (!kandidater.length) continue;
    const ny = kandidater.find((id) => nyeIder.indexOf(id) !== -1);
    ut.push({ type: 'bygg', ramme: x.r.id, ord: ny || stokk(kandidater)[0] });
  }
  return ut;
}

export function byggOkt(profil, { fokusTema = null, dag = idag() } = {}) {
  const interesse = interesseTema(profil);
  const kandidater = bildeord().filter((o) => !fokusTema || o.tema === fokusTema);
  const boks = (o) => status(profil, o.id).boks;
  const poeng = (o) => o.frekvensrang - (o.tema === interesse ? INTERESSE_FORSPRANG : 0);

  const forfalte = kandidater.filter((o) => forfaller(profil, o.id, dag))
    .sort((a, b) => boks(a) - boks(b) || poeng(a) - poeng(b));
  const ukjente = kandidater.filter((o) => boks(o) === 0).sort((a, b) => poeng(a) - poeng(b));

  const forsteGang = Object.keys(profil.ord).length === 0;
  let antallNye = forsteGang ? 4 : forfalte.length >= 8 ? 1 : forfalte.length >= 4 ? 2 : 3;
  const repetisjon = forfalte.slice(0, 7);

  // For få ord å repetere: ta med øvde ord som ikke har forfalt, svakest først.
  if (repetisjon.length < 4) {
    const ekstra = kandidater
      .filter((o) => boks(o) >= 1 && repetisjon.indexOf(o) === -1)
      .sort((a, b) => boks(a) - boks(b));
    repetisjon.push(...stokk(ekstra.slice(0, 8)).slice(0, 4 - repetisjon.length));
  }
  if (repetisjon.length < 2) antallNye = Math.max(antallNye, 4);
  const nye = ukjente.slice(0, antallNye);

  const intro = nye.map((o) => ({ type: 'intro', ord: o.id }));
  const lyttNye = nye.map((o) => lyttOppgave(profil, o));
  const siNye = nye.map((o) => ({ type: 'si', ord: o.id }));
  const rep = repetisjon.map((o) => {
    const b = boks(o);
    if (b <= 2) return lyttOppgave(profil, o);
    return Math.random() < 0.6 ? { type: 'si', ord: o.id } : lyttOppgave(profil, o);
  });
  const antallBygg = fokusTema && !app.rammer.some((r) => r.ord.some((id) => app.ordMap[id] && app.ordMap[id].tema === fokusTema))
    ? 0
    : (nye.length + repetisjon.length >= 6 ? 3 : 2);
  const bygg = byggOppgaver(profil, nye, antallBygg);

  // Tre trinn: se og hør → vis meg (ett steg senere) → si det selv, med repetisjon imellom.
  const igjen = rep.slice();
  let liste = [];
  nye.forEach((o, i) => {
    liste.push(intro[i]);
    if (i > 0) liste.push(lyttNye[i - 1]);
    if (igjen.length) liste.push(igjen.shift());
  });
  if (nye.length) liste.push(lyttNye[nye.length - 1]);
  liste = liste.concat(flett(flett(siNye, bygg), igjen));

  // Fyll opp til minst 12 med ekstra lytteoppgaver på ordene i økten.
  const iOkten = nye.concat(repetisjon);
  let i = 0;
  while (liste.length < MIN_OPPGAVER && iOkten.length && i < 20) {
    const o = iOkten[i % iOkten.length];
    liste.push(i % 2 ? { type: 'si', ord: o.id } : lyttOppgave(profil, o));
    i++;
  }
  // For mange: ta bort repetisjon bakfra, men aldri oppgaver for nye ord.
  const erRepetisjon = (o) => (o.type === 'lytt' || o.type === 'si') && nye.every((n) => n.id !== o.ord);
  while (liste.length > MAKS_OPPGAVER) {
    let idx = liste.length - 1;
    while (idx >= 0 && !erRepetisjon(liste[idx])) idx--;
    liste.splice(idx >= 0 ? idx : liste.length - 1, 1);
  }
  return liste;
}

// ---- Kjøring ----

function behandle(profil, oppgave, svar, oppsummering) {
  if (oppgave.type === 'intro') {
    registrer(profil, oppgave.ord, 'sett');
    oppsummering.nyeOrd.push(oppgave.ord);
  } else if (oppgave.type === 'lytt') {
    registrer(profil, oppgave.ord, svar);
    if (svar === 'riktig') oppsummering.riktige++;
  } else if (oppgave.type === 'si') {
    registrer(profil, oppgave.ord, svar === 'riktig' ? 'riktig' : 'delvis');
    if (svar === 'riktig') oppsummering.riktige++;
  } else if (oppgave.type === 'bygg') {
    registrer(profil, oppgave.ord, svar.riktig ? 'riktig' : 'delvis');
    smaaordISetning(svar.brikker).forEach((id) => registrer(profil, id, svar.riktig ? 'riktig' : 'sett'));
    const r = profil.rammer[oppgave.ramme] || (profil.rammer[oppgave.ramme] = { riktig: 0, forsok: 0 });
    r.forsok++;
    if (svar.riktig) {
      r.riktig++;
      oppsummering.riktige++;
    }
  }
}

async function kjorOkt({ fokusTema = null } = {}) {
  const profil = aktivProfil();
  if (!profil) return gaTil('profiler');
  const oppgaver = byggOkt(profil, { fokusTema });
  if (!oppgaver.length) {
    await dialog('Her er det ingen oppgaver akkurat nå. Velg et annet tema!', [{ tekst: 'OK', verdi: true }]);
    return gaTil('hjem');
  }

  const oppsummering = { riktige: 0, nyeOrd: [], start: Date.now(), fokusTema };
  const avbruddsfunksjoner = [];
  let avbrutt = false;
  let avbryt;
  const avbruddet = new Promise((r) => { avbryt = r; });
  const ktx = { profil, vedAvbrudd: (fn) => avbruddsfunksjoner.push(fn) };

  const prikker = oppgaver.map(() => el('span', { class: 'prikk' }));
  const scene = el('main', { class: 'innhold scene-omraade' });
  const stoppKnapp = knapp('✕', async () => {
    const svar = await dialog('Vil du stoppe nå? Det du har lært, er lagret.', [
      { tekst: 'Fortsett', verdi: false, klasse: 'knapp' },
      { tekst: 'Stopp', verdi: true, klasse: 'knapp sekundar' }
    ]);
    if (svar) {
      avbrutt = true;
      avbruddsfunksjoner.forEach((fn) => { try { fn(); } catch (e) { /* ignorer */ } });
      avbryt();
    }
  }, 'ikonknapp', { 'aria-label': 'Stopp økten' });

  visSkjerm(el('div', { class: 'skjerm okt' },
    topplinje(stoppKnapp, el('div', { class: 'okt-prikker', 'aria-hidden': 'true' }, prikker), effektKnapp()),
    scene));

  let fullforte = 0;
  for (let i = 0; i < oppgaver.length; i++) {
    prikker.forEach((p, j) => {
      p.classList.toggle('ferdig', j < i);
      p.classList.toggle('na', j === i);
    });
    tom(scene);
    const oppgave = oppgaver[i];
    const svar = await Promise.race([AKTIVITETER[oppgave.type].kjor(scene, oppgave, ktx), avbruddet]);
    if (avbrutt) break;
    behandle(profil, oppgave, svar, oppsummering);
    fullforte++;
    lagreData();
    avbruddsfunksjoner.length = 0;
  }

  const okt = {
    dato: idag(),
    oppgaver: fullforte,
    riktige: oppsummering.riktige,
    minutter: Math.round((Date.now() - oppsummering.start) / 60000),
    fokus: fokusTema,
    fullfort: !avbrutt
  };
  if (fullforte) profil.okter.push(okt);
  profil.stjerner += oppsummering.riktige;
  if (avbrutt) {
    lagreData();
    return gaTil('hjem');
  }
  const merke = nyttKlistremerke(profil);
  lagreData();
  visFerdig(profil, oppsummering, merke);
}

function visFerdig(profil, oppsummering, merke) {
  const nye = oppsummering.nyeOrd.map((id) => app.ordMap[id]);
  const forsteIdag = profil.okter.filter((o) => o.dato === idag() && o.fullfort).length === 1;

  visSkjerm(el('div', { class: 'skjerm' },
    el('main', { class: 'innhold midt' },
      el('div', { class: 'ferdig-merke', 'aria-hidden': 'true' }, merke),
      el('h1', { class: 'stor-tittel' }, 'Bra jobba, ' + profil.navn + '!'),
      el('p', { class: 'ferdig-tekst' }, 'Du fikk ⭐ ' + oppsummering.riktige + ' stjerner og et nytt merke!'),
      nye.length ? el('div', null,
        el('h2', { class: 'seksjon' }, 'Nye ord i dag:'),
        el('div', { class: 'nye-ord' }, nye.map((o) => knapp([bilde(o.bilde), o.en], () => siTekst(o.en), 'nytt-ord')))) : null,
      el('p', { class: 'ferdig-tekst' }, forsteIdag
        ? 'Dagens økt er ferdig. Godt jobba – vi ses i morgen! 😊'
        : 'Godt øvd! Nå kan du ta en pause. 😊'),
      knapp('Til start 🏠', () => gaTil('hjem'), 'knapp stor'))));
  effekt('ferdig');
  konfetti();
}

registrerSkjerm('okt', kjorOkt);
