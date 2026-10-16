// Felles byggeklosser for skjermene.
import { el, knapp } from './dom.js';
import { app, lagreData } from './tilstand.js';
import { bildeHTML } from './bilder.js';

export function effektKnapp() {
  const b = knapp('', () => {
    app.data.innstillinger.effekter = !app.data.innstillinger.effekter;
    lagreData();
    oppdater();
  }, 'ikonknapp');
  function oppdater() {
    const pa = app.data.innstillinger.effekter;
    b.textContent = pa ? '🔔' : '🔕';
    b.setAttribute('aria-label', pa ? 'Lyder på' : 'Lyder av');
  }
  oppdater();
  return b;
}

// Topplinje med venstre-, midt- og høyreinnhold.
export function topplinje(venstre, midt, hoyre) {
  return el('header', { class: 'topplinje' },
    el('div', { class: 'topp-venstre' }, venstre),
    el('div', { class: 'topp-midt' }, midt),
    el('div', { class: 'topp-hoyre' }, hoyre));
}

export function bilde(nokkel, klasse) {
  return el('div', { class: 'bilde ' + (klasse || ''), html: bildeHTML(nokkel) });
}

export function stjerneRad(antall, maks = 3) {
  let s = '';
  for (let i = 0; i < maks; i++) s += i < antall ? '★' : '☆';
  return el('span', { class: 'stjerner', 'aria-label': antall + ' av ' + maks + ' stjerner' }, s);
}

// «?»-knapp som viser norsk tekst ved behov.
export function norskHjelp(tekst) {
  const boble = el('span', { class: 'norsk-boble', hidden: true }, tekst);
  const b = knapp('?', () => { boble.hidden = !boble.hidden; }, 'ikonknapp liten hjelp', { 'aria-label': 'Vis på norsk' });
  return el('span', { class: 'norsk-hjelp' }, b, boble);
}
