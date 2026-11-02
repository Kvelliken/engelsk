// Beskriv bildet: barnet ser en liten scene og sier så mye det kan.
// Hjelpesetningene vises bare når barnet ber om dem (eller etter opptak).
import { el, knapp, vent } from '../dom.js';
import { app } from '../tilstand.js';
import { siTekst, stopp, effekt } from '../lyd.js';
import { finnRamme, lagSetning, setningsTekst } from '../setninger.js';
import { beskrivBilde } from '../scene.js';
import { opptaksPanel } from './si-det-hoyt.js';

// Setningene som beskriver scenen, laget med rammene see, count og er-adj.
function setninger(ting) {
  const ut = [];
  ting.forEach((t) => {
    const o = app.ordMap[t.ord];
    if (t.antall > 1) {
      const r = finnRamme('count');
      ut.push({ r, valg: { tall: app.ordMap[t.tall], ord: o } });
    } else {
      const r = finnRamme('see');
      ut.push({ r, valg: { ord: o } });
      if (t.storrelse) ut.push({ r: finnRamme('er-adj'), valg: { ord: o, adj: app.ordMap[t.storrelse] } });
    }
  });
  return ut.map((x) => ({ brikker: lagSetning(x.r, x.valg), tekst: setningsTekst(lagSetning(x.r, x.valg), x.r) }));
}

export function kjor(scene, oppgave, ktx) {
  const liste = setninger(oppgave.ting);
  return new Promise((resolve) => {
    let hjelpForOpptak = false;
    let harTattOpp = false;
    let avbrutt = false;
    const hjelp = el('div', { class: 'hjelpesetninger', hidden: true },
      liste.map((s) => knapp(['🔊 ', s.tekst], () => siTekst(s.tekst), 'hjelpesetning')));

    async function spillAlle() {
      hjelp.hidden = false;
      hjelpKnapp.hidden = true;
      for (const s of liste) {
        if (avbrutt || !scene.isConnected) return;
        await siTekst(s.tekst);
        await vent(250);
      }
    }
    const hjelpKnapp = knapp('💡 Hjelp', () => {
      if (!harTattOpp) hjelpForOpptak = true;
      spillAlle();
    }, 'knapp sekundar');
    const panel = opptaksPanel(spillAlle, ktx, { vedOpptak: () => { harTattOpp = true; } });

    scene.append(
      el('div', { class: 'instruks' }, '🖼️ Hva ser du? Si så mye du kan!'),
      beskrivBilde(oppgave.ting, app.ordMap),
      el('p', { class: 'si-tips' }, 'Begynn med «I see …»'),
      hjelpKnapp,
      hjelp,
      panel,
      knapp('👍 Ferdig', () => {
        avbrutt = true;
        panel.avslutt();
        stopp();
        effekt('riktig');
        const ord = oppgave.ting.map((t) => t.ord).concat(oppgave.ting.filter((t) => t.storrelse).map((t) => t.storrelse))
          .concat(oppgave.ting.filter((t) => t.tall).map((t) => t.tall));
        resolve({
          resultat: hjelpForOpptak ? 'delvis' : 'riktig',
          ord,
          brikker: [].concat(...liste.map((s) => s.brikker))
        });
      }, 'knapp stor riktig-knapp'));
  });
}
