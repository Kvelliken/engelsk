// Trinn 2: hør ordet og trykk på riktig bilde. Feil gir rolig tilbakemelding
// og nytt forsøk. Etter to bom lyser det riktige bildet svakt opp.
import { el, knapp, vent } from '../dom.js';
import { app } from '../tilstand.js';
import { siOrd, effekt } from '../lyd.js';
import { bildeHTML } from '../bilder.js';

export function kjor(scene, oppgave) {
  const ord = app.ordMap[oppgave.ord];
  const valg = oppgave.valg.map((id) => app.ordMap[id]);

  return new Promise((resolve) => {
    let bom = 0;
    let ferdig = false;
    const hor = () => siOrd(ord);
    const melding = el('p', { class: 'si-tips' }, '');
    const ordTekst = el('div', { class: 'engelsk-ord', style: { visibility: 'hidden' } }, ord.en);

    const kort = valg.map((o) => {
      const b = knapp('', () => trykk(o, b), 'valgkort bilde', { 'aria-label': 'Bilde ' + (valg.indexOf(o) + 1) });
      b.innerHTML = bildeHTML(o.bilde);
      return b;
    });

    function trykk(o, b) {
      if (ferdig || b.disabled) return;
      if (o.id === ord.id) {
        ferdig = true;
        b.classList.remove('hint');
        b.classList.add('riktig');
        kort.forEach((k) => { if (k !== b) k.disabled = true; });
        effekt('riktig');
        melding.textContent = 'Riktig! 🎉';
        ordTekst.style.visibility = 'visible';
        siOrd(ord).then(() => vent(450)).then(() => resolve(bom ? 'feil' : 'riktig'));
      } else {
        bom++;
        b.classList.add('feil');
        b.disabled = true;
        effekt('prov');
        melding.textContent = 'Nesten! Hør en gang til.';
        if (bom >= 2) kort[valg.indexOf(ord)].classList.add('hint');
        setTimeout(() => { if (scene.isConnected && !ferdig) hor(); }, 450);
      }
    }

    scene.append(
      el('div', { class: 'instruks' }, '👂 Hør og trykk på riktig bilde'),
      knapp('🔊 Hør', hor, 'knapp sekundar hor-knapp'),
      el('div', { class: 'valggrid ' + (valg.length === 4 ? 'fire' : 'tre') }, kort),
      ordTekst,
      melding);

    setTimeout(() => { if (scene.isConnected) hor(); }, 350);
  });
}
