// Trinn 3: si det selv. Barnet tar opp seg selv og hører opptaket mot fasit.
// Ingen talegjenkjenning: barnet vurderer selv og trykker «Jeg sa det!».
import { el, knapp, dialog, vent } from '../dom.js';
import { app, lagreData } from '../tilstand.js';
import { siOrd, spillFil, stopp, effekt } from '../lyd.js';
import { kanTaOpp, startOpptak } from '../opptak.js';
import { bilde, norskHjelp } from '../felles.js';

const MAKS_OPPTAK_MS = 5000;

async function forklarMikrofon() {
  await dialog(el('div', null,
    el('div', { class: 'stort-ikon' }, '🎙️'),
    el('p', { class: 'dialog-tekst' }, 'Nå skal du snakke engelsk!'),
    el('p', null, 'iPaden spør om lov til å bruke mikrofonen. Be en voksen trykke «Tillat».')),
  [{ tekst: 'OK', verdi: true, klasse: 'knapp stor' }]);
}

// Panel med «Hør», «Snakk» og «Meg». fasit() spiller riktig uttale.
// Brukes både her og i setningsbyggeren.
export function opptaksPanel(fasit, ktx) {
  const inst = app.data.innstillinger;
  let opptak = null;
  let minUrl = null;
  let tidsfrist = null;
  const tips = el('p', { class: 'si-tips' }, '');

  const horKnapp = knapp('🔊 Hør', () => { tips.textContent = ''; fasit(); }, 'knapp sekundar hor-knapp');
  const megKnapp = knapp('▶ Meg', () => spillMeg(), 'knapp sekundar hor-knapp', { disabled: true });
  const snakkKnapp = knapp('🎙️ Snakk', () => (opptak ? stoppOpptak() : start()), 'knapp opptak-knapp');

  async function start() {
    stopp();
    if (inst.mik === null) await forklarMikrofon();
    try {
      opptak = await startOpptak();
      inst.mik = 'ok';
      lagreData();
    } catch (e) {
      opptak = null;
      if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) {
        inst.mik = 'nektet';
        lagreData();
      }
      visUtenMikrofon();
      return;
    }
    snakkKnapp.textContent = '⏹ Stopp';
    snakkKnapp.classList.add('tar-opp');
    tips.textContent = 'Si det nå! 🗣️';
    tidsfrist = setTimeout(stoppOpptak, MAKS_OPPTAK_MS);
  }

  async function stoppOpptak() {
    clearTimeout(tidsfrist);
    if (!opptak) return;
    const o = opptak;
    opptak = null;
    snakkKnapp.textContent = '🎙️ Snakk';
    snakkKnapp.classList.remove('tar-opp');
    if (minUrl) URL.revokeObjectURL(minUrl);
    minUrl = await o.stopp();
    megKnapp.disabled = false;
    await spillMeg();
    if (!panel.isConnected) return;
    tips.textContent = '🔊 Og slik sier vi det:';
    await vent(250);
    await fasit();
    if (panel.isConnected) tips.textContent = 'Likt? Trykk «Jeg sa det!» – eller prøv igjen.';
  }

  async function spillMeg() {
    if (!minUrl) return;
    tips.textContent = '▶ Slik sa du det:';
    try { await spillFil(minUrl); } catch (e) { /* ignorer */ }
  }

  function visUtenMikrofon() {
    snakkKnapp.hidden = true;
    megKnapp.hidden = true;
    tips.textContent = 'Si det høyt nå! 🗣️';
  }

  if (!kanTaOpp() || inst.mik === 'nektet') visUtenMikrofon();

  if (ktx) ktx.vedAvbrudd(() => { if (opptak) opptak.stopp(); });

  const panel = el('div', { class: 'opptakspanel' },
    el('div', { class: 'lydknapper' }, horKnapp, snakkKnapp, megKnapp),
    tips);
  panel.avslutt = () => {
    clearTimeout(tidsfrist);
    if (opptak) { opptak.stopp(); opptak = null; }
    if (minUrl) { URL.revokeObjectURL(minUrl); minUrl = null; }
  };
  return panel;
}

export function kjor(scene, oppgave, ktx) {
  const ord = app.ordMap[oppgave.ord];
  return new Promise((resolve) => {
    const panel = opptaksPanel(() => siOrd(ord), ktx);
    const stortBilde = bilde(ord.bilde, 'stort-bilde');
    stortBilde.addEventListener('click', () => siOrd(ord));

    scene.append(
      el('div', { class: 'instruks' }, '🗣️ Si det høyt!'),
      stortBilde,
      el('div', { class: 'engelsk-ord' }, ord.en, norskHjelp(ord.norsk)),
      panel,
      knapp('👍 Jeg sa det!', () => {
        panel.avslutt();
        stopp();
        effekt('riktig');
        resolve('riktig');
      }, 'knapp stor riktig-knapp'));

    setTimeout(() => { if (scene.isConnected) siOrd(ord); }, 350);
  });
}
