// Hjemskjermen til en profil: dagens økt, fritt valg av tema og fremdrift.
import { el, knapp, visSkjerm } from './dom.js';
import { app, aktivProfil, interesseTema, settVisueltTema } from './tilstand.js';
import { avatarHTML } from './bilder.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { topplinje, effektKnapp, bilde } from './felles.js';
import { erSett, stjerner } from './srs.js';
import { idag, dagerMellom } from './dato.js';

function hilsen(p) {
  const sist = p.okter.length ? p.okter[p.okter.length - 1].dato : null;
  if (sist === idag()) return 'Du har øvd i dag! 🌟';
  if (sist && dagerMellom(sist, idag()) >= 3) return 'Velkommen tilbake! 👋';
  if (!sist) return 'Klar for engelsk?';
  return 'Klar for en ny økt?';
}

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

function visHjem() {
  const p = aktivProfil();
  if (!p) return gaTil('profiler');
  settVisueltTema(p.tema);

  const ferdigIdag = p.okter.some((o) => o.dato === idag() && o.fullfort);
  const antallSett = app.ord.filter((o) => erSett(p, o.id)).length;
  const interesse = interesseTema(p);
  const temaer = app.temaer.filter((t) => !t.skjult)
    .sort((a, b) => (b.id === interesse) - (a.id === interesse));

  const start = knapp([
    el('span', { class: 'start-ikon', 'aria-hidden': 'true' }, ferdigIdag ? '➕' : '▶'),
    el('span', null,
      el('span', { class: 'start-tittel' }, ferdigIdag ? 'Øv litt ekstra' : 'Start dagens økt'),
      el('span', { class: 'start-under' }, 'ca. 10 minutter'))
  ], () => gaTil('okt', {}), ferdigIdag ? 'startknapp ekstra' : 'startknapp');

  visSkjerm(el('div', { class: 'skjerm hjem' },
    topplinje(
      knapp([el('span', { class: 'avatar liten', html: avatarHTML(p.tema) }), el('span', null, p.navn)],
        () => gaTil('profiler'), 'profilknapp', { 'aria-label': 'Bytt profil' }),
      null,
      [effektKnapp(), knapp('⚙️', () => gaTil('voksen'), 'ikonknapp', { 'aria-label': 'For voksne' })]),
    el('main', { class: 'innhold' },
      el('h1', { class: 'hilsen' }, 'Hei, ' + p.navn + '!'),
      el('p', { class: 'underhilsen' }, hilsen(p)),
      el('div', { class: 'statusrad' },
        el('div', { class: 'statusboks' }, el('b', null, '⭐ ' + p.stjerner), el('span', null, 'stjerner')),
        el('div', { class: 'statusboks' }, el('b', null, '📖 ' + antallSett), el('span', null, 'ord')),
        el('div', { class: 'statusboks' }, el('b', null, '🏅 ' + p.klistremerker.length), el('span', null, 'merker'))),
      start,
      el('h2', { class: 'seksjon' }, 'Eller velg selv:'),
      el('div', { class: 'temagrid' }, temaer.map((t) => temaKort(p, t))),
      el('div', { class: 'knapperad' },
        knapp('📖 Mine ord og merker', () => gaTil('ordliste'), 'knapp sekundar')))));
}

registrerSkjerm('hjem', visHjem);
