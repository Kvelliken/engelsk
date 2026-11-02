// Økter: ca. 10 minutter, 12–15 korte oppgaver, avsluttes på en positiv note.
// Typer: dagens økt, øv på ett nivå/tema, snakkeøkt med figuren,
// ett rollespill, og «Test deg ut» for et nivå.
import { el, knapp, visSkjerm, stokk, dialog, tom } from './dom.js';
import { app, aktivProfil, lagreData, interesseTemaer } from './tilstand.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { status, registrer, erSett, forfaller } from './srs.js';
import { smaaordISetning, rammeRiktig, finnRamme, hovedLuke, velgValg, alternativer } from './setninger.js';
import { idag, leggTilDager } from './dato.js';
import { topplinje, effektKnapp, bilde } from './felles.js';
import { effekt, siTekst } from './lyd.js';
import { konfetti, nyttKlistremerke } from './belonning.js';
import { hoyesteApne, ordNivaa, rammeNivaaNr, ordINivaa, settBestatt, nivaaFor } from './nivaa.js';
import * as seOgHor from './aktiviteter/se-og-hor.js';
import * as lyttOgTrykk from './aktiviteter/lytt-og-trykk.js';
import * as siDetHoyt from './aktiviteter/si-det-hoyt.js';
import * as setningsbygger from './aktiviteter/setningsbygger.js';
import * as samtale from './aktiviteter/samtale.js';
import * as beskriv from './aktiviteter/beskriv.js';
import * as rollespill from './aktiviteter/rollespill.js';

const AKTIVITETER = {
  intro: seOgHor, lytt: lyttOgTrykk, si: siDetHoyt, bygg: setningsbygger,
  samtale, beskriv, rollespill
};
// Hvor «lang» hver oppgavetype er, målt i vanlige oppgaver (ca. 40 sek).
const VEKT = { intro: 1, lytt: 1, si: 1, bygg: 1, samtale: 1.5, beskriv: 1.5, rollespill: 3 };
export const MIN_OPPGAVER = 12;
export const MAKS_VEKT = 16;
const INTERESSE_FORSPRANG = 15; // interessetemaene til profilen kommer litt tidligere
const BESTATT_ANDEL = 0.7;

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

const vekt = (liste) => liste.reduce((s, o) => s + VEKT[o.type], 0);

function bildeord() {
  return app.ord.filter((o) => o.bildeoppgave !== false);
}

function lyttOppgave(profil, o, { antall = null, fra = null } = {}) {
  const n = antall || (status(profil, o.id).boks >= 3 ? 4 : 3);
  const kilde = fra || bildeord();
  const sammeTema = kilde.filter((x) => x.tema === o.tema && x.id !== o.id && x.bilde !== o.bilde);
  let andre = stokk(sammeTema);
  if (andre.length < n - 1) {
    andre = andre.concat(stokk(kilde.filter((x) => x.tema !== o.tema && x.bilde !== o.bilde)));
  }
  const valg = stokk([o].concat(andre.slice(0, n - 1))).map((x) => x.id);
  return { type: 'lytt', ord: o.id, valg };
}

// Rammer barnet kan bruke: nivået er åpnet og det finnes kjente ord i hovedluka.
function brukbareRammer(profil, maksNivaa, kjent, { nivaa = null } = {}) {
  const antallKjente = bildeord().filter((o) => kjent(o.id)).length;
  return app.rammer.filter((r) => {
    const n = rammeNivaaNr(r);
    if (nivaa ? n !== nivaa : n > maksNivaa) return false;
    if (antallKjente < (r.laasOpp || 0)) return false;
    return r.slots[hovedLuke(r)].some((id) => app.ordMap[id] && kjent(id));
  });
}

function tilIder(valg) {
  const ut = {};
  Object.keys(valg).forEach((k) => { ut[k] = valg[k].id; });
  return ut;
}

function byggOppgaver(profil, rammer, nye, kjent, antall, ekstra = {}) {
  if (antall <= 0 || !rammer.length) return [];
  const sortert = rammer.slice().sort((a, b) => rammeRiktig(profil, a.id) - rammeRiktig(profil, b.id));
  const nyeIder = nye.map((o) => o.id);
  const ut = [];
  for (let i = 0; i < antall; i++) {
    const r = sortert[i % sortert.length];
    const ny = r.slots[hovedLuke(r)].find((id) => nyeIder.indexOf(id) !== -1 && !ut.some((o) => o.valg[hovedLuke(r)] === id));
    const valg = velgValg(r, profil, { foretrukket: ny, kjente: kjent });
    if (valg) ut.push(Object.assign({ type: 'bygg', ramme: r.id, valg: tilIder(valg) }, ekstra));
  }
  return ut;
}

function samtaleOppgaver(profil, rammer, antall, kjent, { nivaa = null } = {}) {
  const ider = rammer.map((r) => r.id);
  const brukt = profil.samtalerBrukt || {};
  const kandidater = app.samtaler.samtaler
    .filter((s) => ider.indexOf(s.ramme) !== -1 && (!nivaa || s.nivaa === nivaa))
    .sort((a, b) => (brukt[a.id] || 0) - (brukt[b.id] || 0) || b.nivaa - a.nivaa);
  const ut = [];
  for (const s of kandidater.slice(0, antall)) {
    const r = finnRamme(s.ramme);
    const valg = velgValg(r, profil, { kjente: kjent });
    if (!valg) continue;
    const opp = { type: 'samtale', samtale: s.id, valg: tilIder(valg) };
    if (s.type === 'velg') {
      const h = hovedLuke(r);
      const andre = stokk(alternativer(r, h, [valg[h].id]).filter((o) => kjent(o.id) && o.bilde));
      opp.alternativer = stokk([valg[h].id].concat(andre.slice(0, 2).map((o) => o.id)));
    }
    ut.push(opp);
  }
  return ut;
}

const TALL = { two: 2, three: 3, four: 4, five: 5 };

// En liten bildescene å beskrive: 2–3 ting, fra nivå 5 også antall og størrelse.
function beskrivOppgave(profil, maksNivaa, kjent) {
  const see = finnRamme('see');
  const count = finnRamme('count');
  const erAdj = finnRamme('er-adj');
  const ting = [];
  const brukt = [];
  const ta = (liste) => {
    const id = stokk(liste.filter((x) => app.ordMap[x] && kjent(x) && brukt.indexOf(x) === -1 && app.ordMap[x].bilde))[0];
    if (id) brukt.push(id);
    return id;
  };
  if (maksNivaa >= 5 && count && rammeNivaaNr(count) <= maksNivaa) {
    const id = ta(count.slots.ord);
    if (id) {
      const tall = stokk(Object.keys(TALL))[0];
      ting.push({ ord: id, antall: TALL[tall], tall });
    }
    if (erAdj) {
      const id2 = ta(erAdj.slots.ord.filter((x) => see.slots.ord.indexOf(x) !== -1));
      if (id2) ting.push({ ord: id2, antall: 1, storrelse: Math.random() < 0.5 ? 'big' : 'small' });
    }
  }
  while (ting.length < 3) {
    const id = ta(see.slots.ord);
    if (!id) break;
    ting.push({ ord: id, antall: 1 });
  }
  return ting.length >= 2 ? { type: 'beskriv', ting: stokk(ting) } : null;
}

function rollespillOppgave(profil, maksNivaa, { nivaa = null } = {}) {
  const brukt = profil.dialogerBrukt || {};
  const kandidater = app.dialoger
    .filter((d) => (nivaa ? d.nivaa === nivaa : d.nivaa <= maksNivaa))
    .sort((a, b) => (brukt[a.id] || 0) - (brukt[b.id] || 0) ||
      (b.interesse === profil.tema) - (a.interesse === profil.tema) || b.nivaa - a.nivaa);
  return kandidater.length ? { type: 'rollespill', dialog: kandidater[0].id } : null;
}

// ---- Vanlig økt (dagens økt, eller fokus på tema/nivå) ----
export function byggOkt(profil, { fokusTema = null, fokusNivaa = null, dag = idag() } = {}) {
  const apent = hoyesteApne(profil);
  const interesser = interesseTemaer(profil);
  let kandidater = bildeord().filter((o) => ordNivaa(o) <= apent);
  if (fokusTema) kandidater = bildeord().filter((o) => o.tema === fokusTema);
  if (fokusNivaa) kandidater = bildeord().filter((o) => ordNivaa(o) === fokusNivaa);
  const boks = (o) => status(profil, o.id).boks;
  const poeng = (o) => ordNivaa(o) * 1000 + o.frekvensrang - (interesser.indexOf(o.tema) !== -1 ? INTERESSE_FORSPRANG : 0);

  const forfalte = kandidater.filter((o) => forfaller(profil, o.id, dag))
    .sort((a, b) => boks(a) - boks(b) || poeng(a) - poeng(b));
  const ukjente = kandidater.filter((o) => boks(o) === 0).sort((a, b) => poeng(a) - poeng(b));

  const forsteGang = Object.keys(profil.ord).length === 0;
  let antallNye = forsteGang ? 4 : forfalte.length >= 12 ? 2 : 3;
  const repetisjon = forfalte.slice(0, 5);
  if (repetisjon.length < 4) {
    const ekstra = kandidater
      .filter((o) => boks(o) >= 1 && repetisjon.indexOf(o) === -1)
      .sort((a, b) => boks(a) - boks(b));
    repetisjon.push(...stokk(ekstra.slice(0, 8)).slice(0, 4 - repetisjon.length));
  }
  if (repetisjon.length < 2) antallNye = Math.max(antallNye, 4);
  const nye = ukjente.slice(0, antallNye);
  const nyeIder = nye.map((o) => o.id);
  const kjent = (id) => erSett(profil, id) || nyeIder.indexOf(id) !== -1;

  const intro = nye.map((o) => ({ type: 'intro', ord: o.id }));
  const lyttNye = nye.map((o) => lyttOppgave(profil, o));
  const siNye = nye.map((o) => ({ type: 'si', ord: o.id }));
  const rep = repetisjon.map((o) => {
    if (boks(o) <= 2) return lyttOppgave(profil, o);
    return Math.random() < 0.6 ? { type: 'si', ord: o.id } : lyttOppgave(profil, o);
  });

  // Setninger og snakking
  let rammer = brukbareRammer(profil, apent, kjent, { nivaa: fokusNivaa });
  if (fokusTema) rammer = rammer.filter((r) => r.slots[hovedLuke(r)].some((id) => app.ordMap[id] && app.ordMap[id].tema === fokusTema));
  const bygg = byggOppgaver(profil, rammer, nye, kjent, 2);
  const hoyNok = fokusNivaa || apent;
  const samtaler = samtaleOppgaver(profil, rammer, hoyNok >= 3 ? 2 : 1, kjent, { nivaa: fokusNivaa });
  const snakk = [];
  if (!fokusTema && hoyNok >= 2) {
    const b = beskrivOppgave(profil, hoyNok, kjent);
    if (b) snakk.push(b);
  }
  let spill = null;
  if (!fokusTema && hoyNok >= 3 && (fokusNivaa || profil.okter.length % 2 === 0)) {
    spill = rollespillOppgave(profil, apent, { nivaa: fokusNivaa });
  }

  // Tre trinn: se og hør → vis meg (ett steg senere) → si det selv, med repetisjon imellom.
  const igjen = rep.slice();
  let liste = [];
  nye.forEach((o, i) => {
    liste.push(intro[i]);
    if (i > 0) liste.push(lyttNye[i - 1]);
    if (igjen.length) liste.push(igjen.shift());
  });
  if (nye.length) liste.push(lyttNye[nye.length - 1]);
  liste = liste.concat(flett(flett(siNye, bygg), flett(samtaler, snakk)), igjen);

  // For lang: ta bort repetisjon bakfra, men aldri oppgaver for nye ord.
  const erRepetisjon = (o) => (o.type === 'lytt' || o.type === 'si') && nyeIder.indexOf(o.ord) === -1;
  const plassTil = MAKS_VEKT - (spill ? VEKT.rollespill : 0);
  while (vekt(liste) > plassTil) {
    let idx = liste.length - 1;
    while (idx >= 0 && !erRepetisjon(liste[idx])) idx--;
    if (idx < 0) break;
    liste.splice(idx, 1);
  }
  // For kort: fyll opp med lytting og «si det» på ordene i økten.
  const iOkten = nye.concat(repetisjon);
  let i = 0;
  while (vekt(liste) + (spill ? VEKT.rollespill : 0) < MIN_OPPGAVER && iOkten.length && i < 20) {
    const o = iOkten[i % iOkten.length];
    liste.push(i % 2 ? { type: 'si', ord: o.id } : lyttOppgave(profil, o));
    i++;
  }
  // Rollespillet kommer mot slutten, men økten slutter med noe kort og lett.
  if (spill) liste.splice(Math.max(0, liste.length - 1), 0, spill);
  return liste;
}

// ---- Snakkeøkt: bare samtaler, beskriv og rollespill ----
export function byggSnakkeokt(profil) {
  const apent = hoyesteApne(profil);
  const kjent = (id) => erSett(profil, id);
  const rammer = brukbareRammer(profil, apent, kjent);
  const liste = samtaleOppgaver(profil, rammer, 4, kjent);
  const b = beskrivOppgave(profil, apent, kjent);
  if (b) liste.splice(2, 0, b);
  const spill = apent >= 3 ? rollespillOppgave(profil, apent) : null;
  if (spill) liste.push(spill);
  return liste;
}

// ---- Test deg ut: kort utfordring på ett nivå ----
export function byggTest(profil, nr) {
  const ord = ordINivaa(nr);
  const alle = (id) => !!app.ordMap[id];
  const lytt = stokk(ord).slice(0, 5).map((o) => lyttOppgave(profil, o, { antall: 4, fra: ord }));
  const rammer = app.rammer.filter((r) => rammeNivaaNr(r) === nr);
  const bygg = byggOppgaver(profil, rammer, [], alle, 2, { proveNivaa: 2 });
  const samtaler = samtaleOppgaver(profil, rammer, 1, alle, { nivaa: nr });
  return flett(lytt, bygg.concat(samtaler)).map((o) => Object.assign(o, { test: true }));
}

// ---- Kjøring ----

function behandle(profil, oppgave, svar, oppsummering) {
  const t = oppgave.type;
  if (t === 'intro') {
    registrer(profil, oppgave.ord, 'sett');
    oppsummering.nyeOrd.push(oppgave.ord);
  } else if (t === 'lytt') {
    registrer(profil, oppgave.ord, svar);
    if (svar === 'riktig') oppsummering.riktige++;
    if (oppgave.test) { oppsummering.testMulig++; if (svar === 'riktig') oppsummering.testRiktig++; }
  } else if (t === 'si') {
    registrer(profil, oppgave.ord, svar === 'riktig' ? 'riktig' : 'delvis');
    if (svar === 'riktig') oppsummering.riktige++;
  } else if (t === 'bygg') {
    svar.ord.forEach((id) => registrer(profil, id, svar.riktig ? 'riktig' : 'delvis'));
    smaaordISetning(svar.brikker).forEach((id) => registrer(profil, id, svar.riktig ? 'riktig' : 'sett'));
    const r = profil.rammer[oppgave.ramme] || (profil.rammer[oppgave.ramme] = { riktig: 0, forsok: 0 });
    r.forsok++;
    if (svar.riktig) {
      r.riktig++;
      oppsummering.riktige++;
    }
    if (oppgave.test) { oppsummering.testMulig++; if (svar.riktig) oppsummering.testRiktig++; }
  } else if (t === 'samtale' || t === 'beskriv') {
    (svar.ord || []).forEach((id) => registrer(profil, id, svar.resultat));
    smaaordISetning(svar.brikker || []).forEach((id) => registrer(profil, id, svar.resultat === 'riktig' ? 'riktig' : 'sett'));
    oppsummering.riktige++;
    if (t === 'samtale') {
      profil.samtalerBrukt = profil.samtalerBrukt || {};
      profil.samtalerBrukt[oppgave.samtale] = (profil.samtalerBrukt[oppgave.samtale] || 0) + 1;
    }
  } else if (t === 'rollespill') {
    profil.dialogerBrukt = profil.dialogerBrukt || {};
    profil.dialogerBrukt[oppgave.dialog] = (profil.dialogerBrukt[oppgave.dialog] || 0) + 1;
    oppsummering.riktige += 2;
  }
}

// Bestått test: nivået markeres, og ordene legges inn i repetisjonen.
function bestaTest(profil, nr) {
  const dag = idag();
  settBestatt(profil, nr, dag);
  ordINivaa(nr).forEach((o) => {
    const s = profil.ord[o.id] || (profil.ord[o.id] = { boks: 0, riktig: 0, feil: 0 });
    if (s.boks < 2) {
      s.boks = 2;
      s.forst = s.forst || dag;
      s.sist = dag;
      s.neste = leggTilDager(dag, 1);
    }
  });
}

async function kjorOkt(valg = {}) {
  const profil = aktivProfil();
  if (!profil) return gaTil('profiler');
  const { fokusTema = null, fokusNivaa = null, modus = 'vanlig', dialogId = null, testNivaa = null } = valg;
  let oppgaver;
  if (modus === 'snakk') oppgaver = byggSnakkeokt(profil);
  else if (modus === 'rollespill') oppgaver = [{ type: 'rollespill', dialog: dialogId }];
  else if (modus === 'test') oppgaver = byggTest(profil, testNivaa);
  else oppgaver = byggOkt(profil, { fokusTema, fokusNivaa });
  if (!oppgaver.length) {
    await dialog('Her er det ingen oppgaver akkurat nå. Velg noe annet!', [{ tekst: 'OK', verdi: true }]);
    return gaTil('hjem');
  }

  const apentFor = hoyesteApne(profil);
  const oppsummering = { riktige: 0, nyeOrd: [], start: Date.now(), testRiktig: 0, testMulig: 0 };
  const avbruddsfunksjoner = [];
  let avbrutt = false;
  let avbryt;
  const avbruddet = new Promise((r) => { avbryt = r; });
  const ktx = { profil, vedAvbrudd: (fn) => avbruddsfunksjoner.push(fn) };

  const prikker = oppgaver.map((o) => el('span', { class: 'prikk' + (o.type === 'rollespill' ? ' stor-prikk' : '') }));
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

  if (fullforte) {
    profil.okter.push({
      dato: idag(),
      oppgaver: fullforte,
      riktige: oppsummering.riktige,
      minutter: Math.round((Date.now() - oppsummering.start) / 60000),
      fokus: fokusTema || (fokusNivaa ? 'nivaa-' + fokusNivaa : null),
      modus,
      fullfort: !avbrutt
    });
  }
  profil.stjerner += oppsummering.riktige;
  if (avbrutt) {
    lagreData();
    return gaTil('hjem');
  }

  let testResultat = null;
  if (modus === 'test') {
    const krav = Math.ceil(oppsummering.testMulig * BESTATT_ANDEL);
    testResultat = { nr: testNivaa, riktig: oppsummering.testRiktig, mulig: oppsummering.testMulig, bestatt: oppsummering.testRiktig >= krav };
    if (testResultat.bestatt) bestaTest(profil, testNivaa);
  }
  const apentEtter = hoyesteApne(profil);
  const nyttNivaa = apentEtter > apentFor ? apentEtter : null;
  if (nyttNivaa) profil.settNivaa = Math.max(profil.settNivaa || 1, apentEtter); // feires på ferdig-skjermen
  const merke = (modus === 'rollespill' && !nyttNivaa) || (testResultat && !testResultat.bestatt) ? null : nyttKlistremerke(profil);
  lagreData();
  visFerdig(profil, oppsummering, { merke, modus, testResultat, nyttNivaa });
}

function visFerdig(profil, oppsummering, { merke, modus, testResultat, nyttNivaa }) {
  const nye = oppsummering.nyeOrd.map((id) => app.ordMap[id]);
  const forsteIdag = profil.okter.filter((o) => o.dato === idag() && o.fullfort && o.modus === 'vanlig').length === 1;
  let tittel = 'Bra jobba, ' + profil.navn + '!';
  let tekst = 'Du fikk ⭐ ' + oppsummering.riktige + ' stjerner' + (merke ? ' og et nytt merke!' : '!');
  let avslutning = forsteIdag && modus === 'vanlig'
    ? 'Dagens økt er ferdig. Godt jobba – vi ses i morgen! 😊'
    : 'Godt øvd! Nå kan du ta en pause. 😊';
  let stortIkon = merke || '🎭';
  if (modus === 'rollespill') tittel = 'Bra spilt, ' + profil.navn + '! 🎭';
  if (modus === 'snakk') tittel = 'Du snakket engelsk, ' + profil.navn + '! 🗣️';
  if (testResultat) {
    if (testResultat.bestatt) {
      stortIkon = '🏆';
      tittel = 'Du klarte nivå ' + testResultat.nr + '!';
      tekst = testResultat.riktig + ' av ' + testResultat.mulig + ' riktige. Ordene er lagt inn i repetisjonen.';
    } else {
      stortIkon = '💪';
      tittel = 'Godt forsøkt!';
      tekst = 'Du fikk ' + testResultat.riktig + ' av ' + testResultat.mulig + '. Øv litt mer på nivået, så kan du prøve igjen når du vil.';
    }
    avslutning = '';
  }
  const nivaaInfo = nyttNivaa ? nivaaFor(nyttNivaa) : null;

  visSkjerm(el('div', { class: 'skjerm' },
    el('main', { class: 'innhold midt' },
      el('div', { class: 'ferdig-merke', 'aria-hidden': 'true' }, stortIkon),
      el('h1', { class: 'stor-tittel' }, tittel),
      el('p', { class: 'ferdig-tekst' }, tekst),
      nivaaInfo ? el('div', { class: 'nytt-nivaa' },
        el('div', { class: 'nytt-nivaa-tittel' }, '🎉 Nivå ' + nivaaInfo.nr + ' er åpnet!'),
        el('div', null, nivaaInfo.tittel + ': ' + nivaaInfo.maal)) : null,
      nye.length ? el('div', null,
        el('h2', { class: 'seksjon' }, 'Nye ord i dag:'),
        el('div', { class: 'nye-ord' }, nye.map((o) => knapp([bilde(o.bilde), o.en], () => siTekst(o.en), 'nytt-ord')))) : null,
      avslutning ? el('p', { class: 'ferdig-tekst' }, avslutning) : null,
      knapp('Til start 🏠', () => gaTil('hjem'), 'knapp stor'))));
  effekt('ferdig');
  if (!testResultat || testResultat.bestatt) konfetti(nyttNivaa ? 120 : 60);
}

registrerSkjerm('okt', kjorOkt);
