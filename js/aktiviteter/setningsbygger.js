// Setningsbygger: legg ordbrikker inn i en setningsramme.
// Trykk på en brikke for å legge den i neste ledige luke, eller dra den dit.
// Feil brikker hopper rolig tilbake; riktige blir liggende.
import { el, knapp, stokk } from '../dom.js';
import { app } from '../tilstand.js';
import { siTekst, effekt, stopp } from '../lyd.js';
import { bilde, norskHjelp } from '../felles.js';
import { finnRamme, lagSetning, rammeNivaa } from '../setninger.js';
import { erSett } from '../srs.js';
import { opptaksPanel } from './si-det-hoyt.js';
import { konfetti } from '../belonning.js';

function distraktorer(ramme, ord, fasit, antall, profil) {
  const kandidater = ramme.ord
    .filter((id) => id !== ord.id)
    .map((id) => app.ordMap[id])
    .filter(Boolean);
  // Kjente ord først, så barnet kan skille på lyd og bilde.
  const kjente = stokk(kandidater.filter((o) => erSett(profil, o.id)));
  const andre = stokk(kandidater.filter((o) => !erSett(profil, o.id)));
  const ut = [];
  for (const o of kjente.concat(andre)) {
    const brikke = lagSetning(ramme, o).slice(-1)[0];
    if (fasit.indexOf(brikke) === -1 && ut.indexOf(brikke) === -1) ut.push(brikke);
    if (ut.length >= antall) break;
  }
  return ut;
}

export function kjor(scene, oppgave, ktx) {
  const ramme = finnRamme(oppgave.ramme);
  const ord = app.ordMap[oppgave.ord];
  const fasit = lagSetning(ramme, ord);
  const nivaa = rammeNivaa(ktx.profil, ramme.id);
  const antallLuker = nivaa === 1 ? 1 : nivaa === 2 ? 2 : fasit.length;
  const forsteLuke = fasit.length - antallLuker;
  const ekstra = distraktorer(ramme, ord, fasit, nivaa === 1 ? 2 : 1, ktx.profil);
  const setning = fasit.join(' ');

  return new Promise((resolve) => {
    let bom = false;
    let ferdig = false;
    let sistDratt = 0;
    const plass = []; // plass[i] = brikke i luke i

    const rad = el('div', { class: 'setningsrad' });
    const brett = el('div', { class: 'brikkebrett' });
    const luker = [];
    fasit.forEach((tekst, i) => {
      if (i < forsteLuke) {
        rad.appendChild(el('span', { class: 'brikke fast' }, tekst));
      } else {
        const luke = el('div', { class: 'luke', 'data-i': String(i) });
        luker.push(luke);
        rad.appendChild(luke);
      }
    });

    const brikker = stokk(fasit.slice(forsteLuke).concat(ekstra)).map((tekst) => {
      const b = knapp(tekst, () => {
        if (Date.now() - sistDratt < 350) return; // klikket som følger etter en dra
        trykk(b);
      }, 'brikke');
      b.dataset.tekst = tekst;
      gjorFlyttbar(b);
      brett.appendChild(b);
      return b;
    });

    function lukeFor(b) {
      return luker.find((l) => plass[l.dataset.i] === b) || null;
    }

    function trykk(b) {
      if (ferdig || b.disabled) return;
      const iLuke = lukeFor(b);
      if (iLuke) {
        tilbake(b);
      } else {
        const ledig = luker.find((l) => !plass[l.dataset.i]);
        if (ledig) plasser(b, ledig);
      }
    }

    function plasser(b, luke) {
      const gammel = lukeFor(b);
      if (gammel) plass[gammel.dataset.i] = null;
      plass[luke.dataset.i] = b;
      luke.appendChild(b);
      effekt('brikke');
      siTekst(b.dataset.tekst);
      if (luker.every((l) => plass[l.dataset.i])) setTimeout(sjekk, 500);
    }

    function tilbake(b) {
      const luke = lukeFor(b);
      if (luke) plass[luke.dataset.i] = null;
      brett.appendChild(b);
    }

    function sjekk() {
      if (ferdig || !luker.every((l) => plass[l.dataset.i])) return;
      let alleRiktige = true;
      luker.forEach((l) => {
        const b = plass[l.dataset.i];
        if (b.dataset.tekst === fasit[Number(l.dataset.i)]) {
          b.classList.add('riktig');
          b.disabled = true;
        } else {
          alleRiktige = false;
          tilbake(b);
          b.classList.remove('feil-plass');
          void b.offsetWidth; // start animasjonen på nytt
          b.classList.add('feil-plass');
        }
      });
      if (alleRiktige) return lykkes();
      bom = true;
      effekt('prov');
      tips.textContent = 'Nesten! Prøv en gang til.';
    }

    function lykkes() {
      ferdig = true;
      brikker.forEach((b) => { b.disabled = true; });
      rad.querySelectorAll('.brikke.fast').forEach((b) => b.classList.add('riktig'));
      effekt('riktig');
      konfetti(30);
      tips.textContent = 'Riktig! Si setningen høyt du også. 🗣️';
      brett.hidden = true;
      siTekst(setning);
      const panel = opptaksPanel(() => siTekst(setning), ktx);
      scene.append(panel, knapp('Neste ➜', () => {
        panel.avslutt();
        stopp();
        resolve({ riktig: !bom, brikker: fasit });
      }, 'knapp stor'));
    }

    // ---- Dra og slipp med pekerhendelser ----
    function gjorFlyttbar(b) {
      b.addEventListener('pointerdown', (e) => {
        if (ferdig || b.disabled) return;
        const startX = e.clientX;
        const startY = e.clientY;
        let klon = null;
        let over = null;
        const flytt = (ev) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (!klon && Math.sqrt(dx * dx + dy * dy) > 12) {
            const r = b.getBoundingClientRect();
            klon = b.cloneNode(true);
            klon.classList.add('drar');
            klon.style.width = r.width + 'px';
            klon.style.left = r.left + 'px';
            klon.style.top = r.top + 'px';
            klon.startLeft = r.left;
            klon.startTop = r.top;
            document.body.appendChild(klon);
            b.classList.add('plassholder');
          }
          if (klon) {
            ev.preventDefault();
            klon.style.left = (klon.startLeft + dx) + 'px';
            klon.style.top = (klon.startTop + dy) + 'px';
            const mal = lukeUnder(ev.clientX, ev.clientY);
            if (over !== mal) {
              if (over) over.classList.remove('over');
              over = mal;
              if (over) over.classList.add('over');
            }
          }
        };
        const slipp = (ev) => {
          document.removeEventListener('pointermove', flytt);
          document.removeEventListener('pointerup', slipp);
          document.removeEventListener('pointercancel', slipp);
          if (!klon) return;
          sistDratt = Date.now();
          klon.remove();
          b.classList.remove('plassholder');
          if (over) over.classList.remove('over');
          const mal = ev.type === 'pointerup' ? lukeUnder(ev.clientX, ev.clientY) : null;
          if (mal) {
            const opptatt = plass[mal.dataset.i];
            if (opptatt && opptatt !== b) {
              if (opptatt.disabled) return;
              tilbake(opptatt);
            }
            plasser(b, mal);
          } else if (lukeFor(b) && brett.contains(document.elementFromPoint(ev.clientX, ev.clientY))) {
            tilbake(b);
          }
        };
        document.addEventListener('pointermove', flytt, { passive: false });
        document.addEventListener('pointerup', slipp);
        document.addEventListener('pointercancel', slipp);
      });
    }

    function lukeUnder(x, y) {
      return luker.find((l) => {
        const r = l.getBoundingClientRect();
        return x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10;
      }) || null;
    }

    const tips = el('p', { class: 'si-tips' }, nivaa === 1 ? 'Trykk på ordet som mangler.' : 'Trykk på ordene i riktig rekkefølge.');

    scene.append(
      el('div', { class: 'instruks' }, '🧩 Lag setningen', norskHjelp(ramme.norsk + ' (' + ord.norsk + ')')),
      el('div', { class: 'setning-hint' },
        bilde(ramme.ikon),
        el('span', { class: 'pluss-tegn' }, '+'),
        bilde(ord.bilde)),
      knapp('🔊 Hør setningen', () => siTekst(setning), 'knapp sekundar hor-knapp'),
      rad,
      brett,
      tips);
  });
}
