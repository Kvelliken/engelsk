// Ett nivå: hva barnet lærer å si, temaer, rollespill og «Test deg ut».
// Barnet velger fritt hva det vil gjøre (Montessori: fritt valg innenfor rammer).
import { el, knapp, visSkjerm } from './dom.js';
import { app, aktivProfil, settVisueltTema } from './tilstand.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { topplinje, effektKnapp, bilde } from './felles.js';
import { erSett, stjerner } from './srs.js';
import { siTekst } from './lyd.js';
import { finnRamme, setningsTekst } from './setninger.js';
import { nivaaFor, erApent, erBestatt, erFullfort, fremdrift } from './nivaa.js';

function temaKort(p, tema) {
  const ordITema = app.ord.filter((o) => o.tema === tema.id);
  const sett = ordITema.filter((o) => erSett(p, o.id)).length;
  const sum = ordITema.reduce((s, o) => s + stjerner(p, o.id), 0);
  const andel = ordITema.length ? Math.round((sett / ordITema.length) * 100) : 0;
  return knapp([
    bilde(tema.ikon, 'tema-ikon'),
    el('div', { class: 'tema-navn' }, tema.navn),
    el('div', { class: 'fremdrift', 'aria-hidden': 'true' },
      el('div', { class: 'fremdrift-fyll', style: { width: andel + '%', background: tema.farge } })),
    el('div', { class: 'tema-tall' }, sett + ' av ' + ordITema.length + ' ord · ' + sum + ' ★')
  ], () => gaTil('okt', { fokusTema: tema.id }), 'temakort');
}

function visNivaa(nr) {
  const p = aktivProfil();
  const n = nivaaFor(nr);
  if (!p || !n || !erApent(p, nr)) return gaTil('hjem');
  settVisueltTema(p.tema);
  const f = fremdrift(p, nr);

  const eksempler = n.rammer.map(finnRamme).filter(Boolean).map((r) => {
    const tekst = setningsTekst(r.eksempel.split(' '), r);
    return knapp([bilde(r.ikon, 'eksempel-ikon'), el('span', null, tekst), el('span', { class: 'hor-tegn' }, '🔊')],
      () => siTekst(tekst), 'eksempel');
  });
  const dialoger = app.dialoger.filter((d) => d.nivaa === nr).map((d) =>
    knapp([bilde(d.ikon, 'tema-ikon'), el('div', { class: 'tema-navn' }, d.tittel), el('div', { class: 'tema-tall' }, 'Rollespill')],
      () => gaTil('okt', { modus: 'rollespill', dialogId: d.id }), 'temakort'));
  const temaer = n.temaer.map((id) => app.temaMap[id]).filter(Boolean);
  const bestatt = erBestatt(p, nr);

  visSkjerm(el('div', { class: 'skjerm' },
    topplinje(knapp('← Tilbake', () => gaTil('hjem'), 'knapp sekundar'), null, effektKnapp()),
    el('main', { class: 'innhold' },
      el('h1', { class: 'stor-tittel' }, 'Nivå ' + nr + ': ' + n.tittel),
      el('p', { class: 'underhilsen' }, n.maal + ' · ' + f.medStjerne + ' av ' + f.antall + ' ord med ★'),
      el('h2', { class: 'seksjon' }, 'Dette lærer du å si:'),
      el('div', { class: 'eksempler' }, eksempler),
      el('div', { class: 'knapperad venstre' },
        knapp('▶ Øv på nivå ' + nr, () => gaTil('okt', { fokusNivaa: nr }), 'knapp stor'),
        knapp(bestatt ? '🏆 Bestått – prøv igjen' : '🏆 Test deg ut', () => gaTil('okt', { modus: 'test', testNivaa: nr }), 'knapp sekundar stor')),
      !bestatt && !erFullfort(p, nr) ? el('p', { class: 'tom-tekst' }, 'Klarer du «Test deg ut», åpnes neste nivå med en gang.') : null,
      dialoger.length ? el('h2', { class: 'seksjon' }, '🎭 Rollespill') : null,
      dialoger.length ? el('div', { class: 'temagrid' }, dialoger) : null,
      el('h2', { class: 'seksjon' }, 'Temaer'),
      el('div', { class: 'temagrid' }, temaer.map((t) => temaKort(p, t))))));
}

registrerSkjerm('nivaa', visNivaa);
