// «Mine ord og merker»: klistremerker og ordene barnet har møtt, med stjerner.
import { el, knapp, visSkjerm } from './dom.js';
import { app, aktivProfil } from './tilstand.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { topplinje, bilde, stjerneRad } from './felles.js';
import { erSett, stjerner } from './srs.js';
import { siOrd } from './lyd.js';

function visOrdliste() {
  const p = aktivProfil();
  if (!p) return gaTil('profiler');
  let visNorsk = false;
  const norskKnapp = knapp('Vis norsk', () => {
    visNorsk = !visNorsk;
    norskKnapp.textContent = visNorsk ? 'Skjul norsk' : 'Vis norsk';
    document.querySelectorAll('.ord-no').forEach((e) => { e.hidden = !visNorsk; });
  }, 'knapp sekundar');

  const seksjoner = app.temaer.map((t) => {
    const ord = app.ord.filter((o) => o.tema === t.id && erSett(p, o.id));
    if (!ord.length) return null;
    return el('section', null,
      el('h2', { class: 'seksjon' }, t.navn),
      el('div', { class: 'ordgrid' }, ord.map((o) => knapp([
        o.bilde ? bilde(o.bilde) : el('div', { class: 'bilde' }, '💬'),
        el('span', { class: 'ord-en' }, o.en),
        el('span', { class: 'ord-no', hidden: true }, o.norsk),
        stjerneRad(stjerner(p, o.id))
      ], () => siOrd(o), 'ordkort'))));
  });
  const antall = app.ord.filter((o) => erSett(p, o.id)).length;

  visSkjerm(el('div', { class: 'skjerm' },
    topplinje(knapp('← Tilbake', () => gaTil('hjem'), 'knapp sekundar'), null, norskKnapp),
    el('main', { class: 'innhold' },
      el('h1', { class: 'stor-tittel' }, 'Mine merker'),
      el('div', { class: 'merkehylle' }, p.klistremerker.length
        ? p.klistremerker.map((m) => el('span', null, m))
        : el('span', { class: 'tom-tekst' }, 'Fullfør en økt for å få ditt første merke!')),
      el('h1', { class: 'stor-tittel', style: { marginTop: '28px' } }, 'Mine ord (' + antall + ' av ' + app.ord.length + ')'),
      antall ? null : el('p', { class: 'tom-tekst' }, 'Ordene du lærer, kommer her.'),
      seksjoner)));
}

registrerSkjerm('ordliste', visOrdliste);
