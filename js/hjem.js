// Hjemskjermen til en profil: dagens økt, snakkeøkt og nivåstien.
import { el, knapp, visSkjerm, toast, dialog } from './dom.js';
import { app, aktivProfil, settVisueltTema, lagreData } from './tilstand.js';
import { avatarHTML, figurHTML } from './bilder.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { topplinje, effektKnapp } from './felles.js';
import { erSett } from './srs.js';
import { idag, dagerMellom } from './dato.js';
import { hoyesteApne, fremdrift, erFullfort, erBestatt, hvordanApne, nivaaFor } from './nivaa.js';
import { konfetti } from './belonning.js';
import { effekt } from './lyd.js';

function hilsen(p) {
  const sist = p.okter.length ? p.okter[p.okter.length - 1].dato : null;
  if (sist === idag()) return 'Du har øvd i dag! 🌟';
  if (sist && dagerMellom(sist, idag()) >= 3) return 'Velkommen tilbake! 👋';
  if (!sist) return 'Klar for engelsk?';
  return 'Klar for en ny økt?';
}

function nivaaKort(p, n, apent) {
  const f = fremdrift(p, n.nr);
  const laast = n.nr > apent;
  const fullfort = erFullfort(p, n.nr);
  const her = n.nr === apent && !fullfort;
  const andel = f.antall ? Math.round((f.medStjerne / f.antall) * 100) : 0;
  const status = laast ? '🔒' : erBestatt(p, n.nr) ? '🏆' : fullfort ? '✓' : '⭐';
  return knapp([
    el('div', { class: 'nivaa-nr' }, laast ? '🔒' : String(n.nr)),
    el('div', { class: 'nivaa-tekst' },
      el('div', { class: 'nivaa-tittel' }, 'Nivå ' + n.nr + ': ' + n.tittel, !laast ? el('span', { class: 'nivaa-status' }, status) : null),
      el('div', { class: 'nivaa-maal' }, laast ? 'Låst' : n.maal),
      !laast ? el('div', { class: 'fremdrift', 'aria-hidden': 'true' },
        el('div', { class: 'fremdrift-fyll', style: { width: andel + '%' } })) : null,
      !laast ? el('div', { class: 'tema-tall' }, f.medStjerne + ' av ' + f.antall + ' ord med ★' + (her ? ' · Du er her!' : '')) : null)
  ], () => {
    if (laast) toast(hvordanApne(p, n.nr), { varighet: 5000 });
    else gaTil('nivaa', n.nr);
  }, 'nivaakort' + (laast ? ' laast' : '') + (her ? ' her' : '') + (fullfort ? ' fullfort' : ''));
}

function visHjem() {
  const p = aktivProfil();
  if (!p) return gaTil('profiler');
  settVisueltTema(p.tema);

  const ferdigIdag = p.okter.some((o) => o.dato === idag() && o.fullfort && (o.modus || 'vanlig') === 'vanlig');
  const antallSett = app.ord.filter((o) => erSett(p, o.id)).length;
  const apent = hoyesteApne(p);

  const start = knapp([
    el('span', { class: 'start-ikon', 'aria-hidden': 'true' }, ferdigIdag ? '➕' : '▶'),
    el('span', null,
      el('span', { class: 'start-tittel' }, ferdigIdag ? 'Øv litt ekstra' : 'Start dagens økt'),
      el('span', { class: 'start-under' }, 'Nivå ' + apent + ' · ca. 10 minutter'))
  ], () => gaTil('okt', {}), ferdigIdag ? 'startknapp ekstra' : 'startknapp');

  const snakk = knapp([
    el('span', { class: 'snakk-figur', html: figurHTML(p.tema) }),
    el('span', null,
      el('span', { class: 'start-tittel liten' }, 'Snakk med Pip'),
      el('span', { class: 'start-under' }, 'Bare snakking · ca. 5 minutter'))
  ], () => gaTil('okt', { modus: 'snakk' }), 'snakkeknapp');

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
        el('div', { class: 'statusboks' }, el('b', null, '🏅 ' + p.klistremerker.length), el('span', null, 'merker')),
        el('div', { class: 'statusboks' }, el('b', null, '🪜 ' + apent), el('span', null, 'nivå'))),
      el('div', { class: 'startrad' }, start, snakk),
      el('h2', { class: 'seksjon' }, 'Nivåene dine'),
      el('div', { class: 'nivaasti' }, app.nivaaer.map((n) => nivaaKort(p, n, apent))),
      el('div', { class: 'knapperad' },
        knapp('📖 Mine ord og merker', () => gaTil('ordliste'), 'knapp sekundar')))));
  meldNyttNivaa(p, apent);
}

// Sier fra når et nivå er åpnet utenfor en økt (f.eks. etter en oppdatering
// med nye nivåer, eller når en voksen har åpnet det).
async function meldNyttNivaa(p, apent) {
  const sist = p.settNivaa || 1;
  p.settNivaa = Math.max(sist, apent);
  if (apent <= sist) return;
  lagreData();
  const n = nivaaFor(apent);
  effekt('ferdig');
  konfetti(100);
  await dialog(el('div', null,
    el('div', { class: 'stort-ikon' }, '🎉'),
    el('p', { class: 'dialog-tekst' }, 'Nivå ' + apent + ' er åpnet!'),
    el('p', null, n.tittel + ' – ' + n.maal)),
  [{ tekst: 'Så gøy!', verdi: true, klasse: 'knapp stor' }]);
}

registrerSkjerm('hjem', visHjem);
