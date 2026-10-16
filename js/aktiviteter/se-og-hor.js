// Trinn 1 (Montessori): se og hør. Bildet og lyden kommer først, teksten etterpå.
import { el, knapp } from '../dom.js';
import { app } from '../tilstand.js';
import { siOrd } from '../lyd.js';
import { bilde, norskHjelp } from '../felles.js';

export function kjor(scene, oppgave) {
  const ord = app.ordMap[oppgave.ord];
  return new Promise((resolve) => {
    const tekst = el('div', { class: 'engelsk-ord', style: { visibility: 'hidden' } }, ord.en, norskHjelp(ord.norsk));
    const hor = () => siOrd(ord).then(() => { tekst.style.visibility = 'visible'; });
    const stortBilde = bilde(ord.bilde, 'stort-bilde');
    stortBilde.addEventListener('click', hor);

    scene.append(
      el('div', { class: 'instruks' }, '👀 Se og hør'),
      stortBilde,
      tekst,
      el('div', { class: 'lydknapper' },
        knapp('🔊 Hør igjen', hor, 'knapp sekundar hor-knapp'),
        knapp('Neste ➜', () => resolve('sett'), 'knapp stor')));

    setTimeout(() => { if (scene.isConnected) hor(); }, 350);
  });
}
