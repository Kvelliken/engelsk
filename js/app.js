// Inngangspunkt: laster data og innhold, og viser første skjerm.
import { app, settInnhold, aktivProfil } from './tilstand.js';
import { lastData, beOmVarigLagring } from './lagring.js';
import { lasOpp } from './lyd.js';
import { gaTil } from './nav.js';
import { registrerServiceWorker } from './oppdatering.js';
import './profiler.js';
import './hjem.js';

async function hentJson(sti) {
  const svar = await fetch(sti);
  if (!svar.ok) throw new Error('Fant ikke ' + sti);
  return svar.json();
}

async function start() {
  app.data = lastData();
  const [ord, rammer, temaer] = await Promise.all([
    hentJson('./data/ord.json'),
    hentJson('./data/rammer.json'),
    hentJson('./data/temaer.json')
  ]);
  settInnhold(ord, rammer, temaer);

  // iOS: lyd kan først starte etter et trykk.
  document.addEventListener('touchend', lasOpp, { passive: true });
  document.addEventListener('click', lasOpp);

  beOmVarigLagring();
  registrerServiceWorker();
  gaTil(aktivProfil() ? 'hjem' : 'profiler');
}

start().catch((e) => {
  console.error(e);
  document.getElementById('app').textContent = 'Noe gikk galt. Lukk appen og prøv igjen.';
});
