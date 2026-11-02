// Rollespill: en liten dialog med to roller. Figuren sier sine replikker,
// barnet sier sine (med fasit og opptak). Etterpå kan rollene byttes.
import { el, knapp, vent } from '../dom.js';
import { app } from '../tilstand.js';
import { siTekst, stopp, effekt } from '../lyd.js';
import { avatarHTML } from '../bilder.js';
import { bilde, norskHjelp } from '../felles.js';
import { opptaksPanel } from './si-det-hoyt.js';

export function kjor(scene, oppgave, ktx) {
  const d = app.dialoger.find((x) => x.id === oppgave.dialog);
  return new Promise((resolve) => {
    let avbrutt = false;
    let antallSagt = 0;
    ktx.vedAvbrudd(() => { avbrutt = true; });
    const manus = el('div', { class: 'manus' });
    const kontroll = el('div', { class: 'manus-kontroll' });
    const valgte = {}; // indeks → valgt replikk (beholdes når rollene byttes)

    function boble(tekst, r, side, din) {
      const b = el('div', { class: 'replikk ' + side + (din ? ' din' : '') },
        el('div', { class: 'replikk-hvem', html: side === 'venstre' ? bilde(d.figur).outerHTML : avatarHTML(ktx.profil.tema) }),
        el('div', { class: 'replikk-boble' },
          r.bilde ? bilde(r.bilde, 'replikk-bilde') : null,
          el('span', null, tekst),
          r.norsk ? norskHjelp(r.norsk) : null));
      manus.appendChild(b);
      b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return b;
    }

    function velg(r) {
      return new Promise((ok) => {
        kontroll.textContent = '';
        kontroll.append(el('div', { class: 'svar-hint' }, 'Velg hva du vil si:'),
          el('div', { class: 'svarvalg-rad' }, r.valg.map((v) => {
            const b = knapp('', () => ok(v), 'svarvalg bilde', { 'aria-label': v.en });
            b.innerHTML = bilde(v.bilde).innerHTML;
            return b;
          })));
      });
    }

    function dinTur(tekst, figurStemme) {
      return new Promise((ok) => {
        kontroll.textContent = '';
        const panel = opptaksPanel(() => siTekst(tekst, { figur: figurStemme }), ktx);
        kontroll.append(
          el('div', { class: 'din-tur' }, '🗣️ Din tur! Si: «' + tekst + '»'),
          panel,
          knapp('✓ Neste', () => { panel.avslutt(); stopp(); effekt('brikke'); ok(); }, 'knapp stor'));
        siTekst(tekst, { figur: figurStemme });
      });
    }

    async function spill(byttet) {
      manus.textContent = '';
      for (let i = 0; i < d.replikker.length; i++) {
        if (avbrutt || !scene.isConnected) return;
        const r = d.replikker[i];
        const figurensReplikk = r.hvem === 'figur';
        const barnetSier = byttet ? figurensReplikk : !figurensReplikk;
        let linje = r;
        if (r.valg) {
          if (!valgte[i]) valgte[i] = barnetSier ? await velg(r) : r.valg[0];
          linje = Object.assign({}, r, valgte[i]);
        }
        if (avbrutt) return;
        const side = figurensReplikk ? 'venstre' : 'hoyre';
        if (barnetSier) {
          boble(linje.en, linje, side, true);
          await dinTur(linje.en, figurensReplikk);
          antallSagt++;
        } else {
          kontroll.textContent = '';
          boble(linje.en, linje, side, false);
          await siTekst(linje.en, { figur: figurensReplikk });
          await vent(350);
        }
      }
    }

    async function kjorAlt() {
      await spill(false);
      if (avbrutt || !scene.isConnected) return;
      kontroll.textContent = '';
      effekt('riktig');
      kontroll.append(
        el('div', { class: 'din-tur' }, '🎭 Bra spilt! Vil du bytte roller?'),
        el('div', { class: 'knapperad' },
          knapp('🔁 Bytt roller', async () => {
            await spill(true);
            if (avbrutt || !scene.isConnected) return;
            ferdig();
          }, 'knapp sekundar'),
          knapp('Ferdig ➜', ferdig, 'knapp stor')));
    }

    function ferdig() {
      stopp();
      resolve({ sagt: antallSagt });
    }

    scene.append(
      el('div', { class: 'instruks' }, '🎭 Rollespill: ' + d.tittel),
      el('div', { class: 'roller' },
        el('div', { class: 'rolle' }, bilde(d.figur), el('span', null, 'Figuren')),
        el('span', { class: 'mot' }, '+'),
        el('div', { class: 'rolle' }, el('div', { class: 'bilde', html: avatarHTML(ktx.profil.tema) }), el('span', null, 'Deg'))),
      manus,
      kontroll);
    setTimeout(() => { if (scene.isConnected) kjorAlt(); }, 300);
  });
}
