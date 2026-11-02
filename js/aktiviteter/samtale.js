// Snakk med figuren: figuren spør, barnet svarer høyt med en hel setning.
// «velg»: barnet velger selv hva svaret skal handle om (What do you like?).
// «vis»: svaret står i bildet (Where is the ball?). Barnet prøver først;
// svaret vises når barnet ber om hjelp eller har tatt opp seg selv.
import { el, knapp, vent, stokk } from '../dom.js';
import { app } from '../tilstand.js';
import { siTekst, stopp, effekt } from '../lyd.js';
import { figurHTML } from '../bilder.js';
import { bilde, norskHjelp } from '../felles.js';
import { finnRamme, hovedLuke, lagSetning, setningsTekst, fyllInn, valgteOrd, brikkeLuker } from '../setninger.js';
import { svarBilde } from '../scene.js';
import { opptaksPanel } from './si-det-hoyt.js';

export function figur(tema) {
  return el('div', { class: 'figur', html: figurHTML(tema) });
}

// «It is ___ the ___.»: setningen med tomme luker, som hint.
function rammeHint(ramme) {
  const info = brikkeLuker(ramme);
  const brikker = ramme.mal.map((t, i) => (info[i] ? '___' : t));
  return setningsTekst(brikker, ramme);
}

export function kjor(scene, oppgave, ktx) {
  const s = app.samtaler.samtaler.find((x) => x.id === oppgave.samtale);
  const ramme = finnRamme(s.ramme);
  const hoved = hovedLuke(ramme);
  const valg = {};
  Object.keys(oppgave.valg).forEach((k) => { valg[k] = app.ordMap[oppgave.valg[k]]; });
  const sporsmal = fyllInn(s.sporsmal, valg);

  return new Promise((resolve) => {
    let svarVist = false;
    let hjelpForOpptak = false;
    let harTattOpp = false;
    const svarTekst = () => setningsTekst(lagSetning(ramme, valg), ramme);
    const spor = () => siTekst(sporsmal, { figur: true });

    const svarLinje = el('div', { class: 'svar-linje', hidden: true });
    const hint = el('div', { class: 'svar-hint' }, s.type === 'vis' ? rammeHint(ramme) : 'Velg svaret ditt:');

    function visSvar(spill) {
      svarVist = true;
      svarLinje.textContent = svarTekst();
      svarLinje.hidden = false;
      hint.hidden = true;
      if (hjelpKnapp) hjelpKnapp.hidden = true;
      if (spill) return siTekst(svarTekst());
      return Promise.resolve();
    }

    // Fasit i opptakspanelet: svaret hvis det er valgt/vist, ellers spørsmålet.
    const panel = opptaksPanel(() => {
      if (s.type === 'velg' && !svarVist) return spor();
      return visSvar(true);
    }, ktx, { vedOpptak: () => { harTattOpp = true; } });

    let valgRad = null;
    let hjelpKnapp = null;
    if (s.type === 'velg') {
      const knapper = (oppgave.alternativer || [valg[hoved].id]).map((id) => {
        const o = app.ordMap[id];
        const b = knapp('', () => {
          valg[hoved] = o;
          knapper.forEach((k) => k.classList.toggle('valgt', k === b));
          visSvar(true);
        }, 'svarvalg bilde', { 'aria-label': o.en });
        b.innerHTML = bilde(o.bilde).innerHTML;
        return b;
      });
      valgRad = el('div', { class: 'svarvalg-rad' }, knapper);
    } else {
      hjelpKnapp = knapp('💡 Vis svaret', () => {
        if (!harTattOpp) hjelpForOpptak = true;
        visSvar(true);
      }, 'knapp sekundar');
    }

    const boble = el('div', { class: 'snakkeboble' },
      el('span', { class: 'boble-tekst' }, sporsmal),
      knapp('🔊', spor, 'ikonknapp liten', { 'aria-label': 'Hør spørsmålet' }),
      norskHjelp(s.norsk));

    // (append() gjør null om til teksten «null», så tomme deler filtreres bort.)
    scene.append(...[
      el('div', { class: 'instruks' }, '💬 Snakk med Pip'),
      el('div', { class: 'samtale-topp' }, figur(ktx.profil.tema), boble),
      s.type === 'vis' ? svarBilde(ramme, valg) : null,
      valgRad,
      hint,
      svarLinje,
      hjelpKnapp,
      panel,
      knapp('👍 Jeg svarte!', async () => {
        panel.avslutt();
        stopp();
        if (!svarVist) await visSvar(false);
        effekt('riktig');
        const kommentar = stokk(app.samtaler.kommentarer)[0];
        boble.querySelector('.boble-tekst').textContent = kommentar;
        await siTekst(kommentar, { figur: true });
        await vent(300);
        resolve({
          resultat: s.type === 'vis' && hjelpForOpptak ? 'delvis' : 'riktig',
          ord: valgteOrd(ramme, valg),
          brikker: lagSetning(ramme, valg)
        });
      }, 'knapp stor riktig-knapp')].filter(Boolean));

    setTimeout(() => { if (scene.isConnected) spor(); }, 350);
  });
}
