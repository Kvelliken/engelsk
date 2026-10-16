// Voksenvisning bak en enkel voksenport (et regnestykke):
// fremdrift, eksport/import, profiler, stemme og versjon.
import { el, knapp, visSkjerm, dialog, toast } from './dom.js';
import { app, aktivProfil, lagreData, settVisueltTema } from './tilstand.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { topplinje } from './felles.js';
import { eksportKode, eksportJson, lesImport, tilbakestillProfil } from './lagring.js';
import { erSett, stjerner, status } from './srs.js';
import { engelskeStemmer, siTekst } from './lyd.js';
import { hentVersjon, sjekkOppdatering } from './oppdatering.js';
import { idag, leggTilDager } from './dato.js';
import { VERDENER } from './profiler.js';

function tilbake() {
  gaTil(aktivProfil() ? 'hjem' : 'profiler');
}

// ---- Voksenport ----
function visPort() {
  settVisueltTema('standard');
  const a = 11 + Math.floor(Math.random() * 9);
  const b = 3 + Math.floor(Math.random() * 7);
  let svar = '';
  const felt = el('div', { class: 'svarfelt' }, '');
  const melding = el('p', { class: 'si-tips' }, '');
  const trykk = (t) => {
    if (t === '⌫') svar = svar.slice(0, -1);
    else if (svar.length < 4) svar += t;
    felt.textContent = svar;
    melding.textContent = '';
  };
  const sjekk = () => {
    if (Number(svar) === a * b) visVoksen();
    else {
      svar = '';
      felt.textContent = '';
      melding.textContent = 'Ikke riktig. Prøv igjen.';
    }
  };
  const taster = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK']
    .map((t) => knapp(t, () => (t === 'OK' ? sjekk() : trykk(t)), t === 'OK' ? 'knapp' : 'knapp sekundar'));

  visSkjerm(el('div', { class: 'skjerm' },
    topplinje(knapp('← Tilbake', tilbake, 'knapp sekundar'), null, null),
    el('main', { class: 'innhold midt' },
      el('h1', { class: 'stor-tittel' }, 'For voksne'),
      el('p', { class: 'underhilsen' }, 'Hva er ' + a + ' × ' + b + '?'),
      felt,
      el('div', { class: 'tallplate' }, taster),
      melding)));
}

// ---- Voksenvisning ----
function seksjon(tittel, ...innhold) {
  return el('section', { class: 'voksen-seksjon' }, el('h2', null, tittel), innhold);
}

function fremdrift() {
  if (!app.data.profiler.length) return seksjon('Fremdrift', el('p', null, 'Ingen profiler ennå.'));
  const rader = app.data.profiler.map((p) => {
    const sett = app.ord.filter((o) => erSett(p, o.id));
    const mestret = sett.filter((o) => stjerner(p, o.id) === 3).length;
    const sist = p.okter.length ? p.okter[p.okter.length - 1].dato : '–';
    const siste7 = p.okter.filter((o) => o.dato >= leggTilDager(idag(), -7)).length;
    return el('tr', null,
      el('td', null, p.navn),
      el('td', null, String(sett.length)),
      el('td', null, String(mestret)),
      el('td', null, String(p.okter.length) + ' (' + siste7 + ' siste uke)'),
      el('td', null, sist));
  });
  const vanskelige = app.data.profiler.map((p) => {
    const ord = app.ord
      .filter((o) => status(p, o.id).feil > 0)
      .sort((a, b) => status(p, b.id).feil - status(p, a.id).feil)
      .slice(0, 6)
      .map((o) => o.en);
    return ord.length ? el('p', null, p.navn + ' øver mest på: ' + ord.join(', ')) : null;
  });
  return seksjon('Fremdrift',
    el('table', { class: 'tabell' },
      el('thead', null, el('tr', null, ['Navn', 'Ord møtt', 'Ord med ★★★', 'Økter', 'Sist'].map((t) => el('th', null, t)))),
      el('tbody', null, rader)),
    vanskelige);
}

function eksport() {
  const kode = el('textarea', { class: 'kodefelt', readonly: true, 'aria-label': 'Fremdriftskode' });
  kode.hidden = true;
  return seksjon('Ta vare på fremdriften',
    el('p', null, 'iPaden kan slette lagrede data hvis appen ikke brukes på en stund. Lagre en kopi innimellom, f.eks. i Filer eller som et notat.'),
    el('div', { class: 'knapperad' },
      knapp('💾 Lagre som fil', lagreFil, 'knapp'),
      knapp('📋 Kopier kode', () => kopierKode(kode), 'knapp sekundar')),
    kode);
}

async function lagreFil() {
  const navn = 'engelsk-fremdrift-' + idag() + '.json';
  const blob = new Blob([eksportJson(app.data)], { type: 'application/json' });
  try {
    const fil = new File([blob], navn, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [fil] })) {
      await navigator.share({ files: [fil], title: navn });
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: navn });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function kopierKode(felt) {
  const kode = eksportKode(app.data);
  felt.value = kode;
  felt.hidden = false;
  try {
    await navigator.clipboard.writeText(kode);
    toast('Koden er kopiert. Lim den inn i et notat.');
  } catch (e) {
    felt.focus();
    felt.select();
    toast('Merk teksten og velg «Kopier».');
  }
}

function importSeksjon() {
  const felt = el('textarea', { class: 'kodefelt', placeholder: 'Lim inn koden her …', 'aria-label': 'Lim inn kode' });
  const filvelger = el('input', { type: 'file', accept: '.json,application/json,text/plain', hidden: true });
  filvelger.addEventListener('change', () => {
    const fil = filvelger.files && filvelger.files[0];
    if (!fil) return;
    const leser = new FileReader();
    leser.onload = () => hentInn(String(leser.result));
    leser.readAsText(fil);
    filvelger.value = '';
  });
  return seksjon('Hent fremdrift',
    el('p', null, 'Henter inn en lagret kopi. Det som ligger i appen nå, blir erstattet.'),
    felt,
    el('div', { class: 'knapperad' },
      knapp('Hent fra kode', () => hentInn(felt.value), 'knapp'),
      knapp('📂 Velg fil', () => filvelger.click(), 'knapp sekundar')),
    filvelger);
}

async function hentInn(tekst) {
  let data;
  try {
    data = lesImport(tekst);
  } catch (e) {
    await dialog('Fant ikke gyldig fremdrift i koden eller filen.', [{ tekst: 'OK', verdi: true }]);
    return;
  }
  const navn = data.profiler.map((p) => p.navn).join(', ') || 'ingen profiler';
  const ok = await dialog('Erstatte alt med kopien? Den inneholder: ' + navn + '.', [
    { tekst: 'Avbryt', verdi: false, klasse: 'knapp sekundar' },
    { tekst: 'Erstatt', verdi: true, klasse: 'knapp fare' }
  ]);
  if (!ok) return;
  app.data = data;
  lagreData();
  toast('Fremdriften er hentet inn.');
  visVoksen();
}

function profilSeksjon() {
  const profiler = app.data.profiler.map((p) => {
    const navnFelt = el('input', { class: 'tekstfelt', type: 'text', value: p.navn, maxlength: '20', 'aria-label': 'Navn' });
    navnFelt.style.fontSize = '1.2rem';
    navnFelt.style.minHeight = '52px';
    const verden = el('select', { class: 'velger', 'aria-label': 'Verden' },
      VERDENER.map((v) => el('option', { value: v.id, selected: v.id === p.tema }, v.ikon + ' ' + v.navn)));
    return el('div', { style: { borderTop: '1px solid var(--linje)', paddingTop: '12px', marginTop: '12px' } },
      el('div', { class: 'knapperad' }, navnFelt, verden,
        knapp('Lagre', () => {
          const n = navnFelt.value.trim();
          if (n) p.navn = n;
          p.tema = verden.value;
          lagreData();
          toast('Lagret.');
        }, 'knapp')),
      el('div', { class: 'knapperad' },
        knapp('Nullstill fremdrift', async () => {
          const ok = await dialog('Nullstille all fremdrift for ' + p.navn + '? Dette kan ikke angres.', [
            { tekst: 'Avbryt', verdi: false, klasse: 'knapp sekundar' },
            { tekst: 'Nullstill', verdi: true, klasse: 'knapp fare' }]);
          if (!ok) return;
          tilbakestillProfil(p);
          lagreData();
          visVoksen();
        }, 'knapp sekundar'),
        knapp('Slett profil', async () => {
          const ok = await dialog('Slette profilen ' + p.navn + '? Dette kan ikke angres.', [
            { tekst: 'Avbryt', verdi: false, klasse: 'knapp sekundar' },
            { tekst: 'Slett', verdi: true, klasse: 'knapp fare' }]);
          if (!ok) return;
          app.data.profiler = app.data.profiler.filter((x) => x !== p);
          if (app.data.aktivProfil === p.id) app.data.aktivProfil = null;
          lagreData();
          visVoksen();
        }, 'knapp sekundar')));
  });
  return seksjon('Profiler', profiler.length ? profiler : el('p', null, 'Ingen profiler ennå.'));
}

function lydSeksjon() {
  const inst = app.data.innstillinger;
  const velger = el('select', { class: 'velger', 'aria-label': 'Stemme' });
  function fyll() {
    while (velger.firstChild) velger.removeChild(velger.firstChild);
    velger.appendChild(el('option', { value: '' }, 'Automatisk (britisk engelsk)'));
    engelskeStemmer().forEach((v) => {
      velger.appendChild(el('option', { value: v.voiceURI, selected: v.voiceURI === inst.stemme }, v.name + ' (' + v.lang + ')'));
    });
  }
  fyll();
  if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', fyll);
  velger.addEventListener('change', () => {
    inst.stemme = velger.value || null;
    lagreData();
  });
  const tempo = el('select', { class: 'velger', 'aria-label': 'Tempo' },
    [[0.7, 'Sakte'], [0.85, 'Litt sakte'], [1, 'Normal']].map(([v, t]) =>
      el('option', { value: String(v), selected: inst.taleTempo === v }, t)));
  tempo.addEventListener('change', () => {
    inst.taleTempo = Number(tempo.value);
    lagreData();
  });
  const mikTekst = inst.mik === 'nektet'
    ? 'Mikrofonen er avslått. Slå den på i Innstillinger → Safari → Mikrofon, og trykk «Spør på nytt».'
    : inst.mik === 'ok' ? 'Mikrofonen er i bruk.' : 'Appen har ikke spurt om mikrofonen ennå.';
  return seksjon('Lyd og mikrofon',
    el('p', null, 'Stemmen er iPadens egen tekst-til-tale. Flere stemmer kan lastes ned i Innstillinger → Tilgjengelighet → Opplest innhold → Stemmer → Engelsk.'),
    el('div', { class: 'knapperad' }, velger, tempo,
      knapp('🔊 Test', () => siTekst('Hello! I like pizza. I see a cat.'), 'knapp sekundar')),
    el('p', null, mikTekst),
    inst.mik === 'nektet' ? knapp('Spør på nytt', () => { inst.mik = null; lagreData(); visVoksen(); }, 'knapp sekundar') : null);
}

function omSeksjon() {
  const versjon = el('span', null, '…');
  hentVersjon().then((v) => { versjon.textContent = v; });
  return seksjon('Om appen',
    el('p', null, 'Versjon: ', versjon),
    el('p', null, 'Ingen innlogging, ingen sporing og ingen nettverkskall til andre. Alt lagres bare på denne iPaden.'),
    knapp('Se etter oppdatering', () => {
      sjekkOppdatering().then(() => toast('Ser etter ny versjon …'));
    }, 'knapp sekundar'));
}

function visVoksen() {
  settVisueltTema('standard');
  visSkjerm(el('div', { class: 'skjerm' },
    topplinje(knapp('← Ferdig', tilbake, 'knapp sekundar'), null, null),
    el('main', { class: 'innhold' },
      el('h1', { class: 'stor-tittel', style: { marginBottom: '16px' } }, 'For voksne'),
      fremdrift(),
      eksport(),
      importSeksjon(),
      profilSeksjon(),
      lydSeksjon(),
      omSeksjon())));
}

registrerSkjerm('voksen', visPort);
