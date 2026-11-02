// Små bildescener: svaret på et spørsmål («Where is the ball?»), eller
// en scene å beskrive. Alt bygges av bildene i js/bilder.js.
import { el } from './dom.js';
import { bildeHTML } from './bilder.js';
import { hovedLuke } from './setninger.js';

const TALL = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const FARGE = /^farge:/;

function ting(nokkel, klasse) {
  return el('div', { class: 'scene-ting ' + (klasse || ''), html: bildeHTML(nokkel) });
}

function flere(nokkel, antall, klasse) {
  const ut = [];
  for (let i = 0; i < antall; i++) ut.push(ting(nokkel, klasse));
  return el('div', { class: 'scene-gruppe' }, ut);
}

// Ballen i, på eller under en ting.
function plassering(prep, sted) {
  return el('div', { class: 'plassering ' + prep.id + ' sted-' + sted.id },
    ting(sted.bilde, 'sted'),
    el('div', { class: 'ball', html: bildeHTML('emoji:🔴') }));
}

// Bildet som viser svaret for en ramme og et valg.
export function svarBilde(ramme, valg) {
  const hoved = valg[hovedLuke(ramme)];
  let innhold;
  if (ramme.id === 'prep') {
    innhold = plassering(valg.prep, valg.sted);
  } else if (valg.tall) {
    innhold = flere(hoved.bilde, TALL[valg.tall.en] || 2, 'liten-ting');
  } else if (valg.adj && (valg.adj.id === 'big' || valg.adj.id === 'small')) {
    innhold = ting(hoved.bilde, valg.adj.id === 'big' ? 'kjempe' : 'mini');
  } else if (valg.adj && FARGE.test(valg.adj.bilde || '')) {
    innhold = el('div', { class: 'scene-gruppe' }, ting(valg.adj.bilde, 'merke-ting'), ting(hoved.bilde));
  } else {
    const andre = Object.keys(valg).filter((k) => k !== hovedLuke(ramme)).map((k) => valg[k]).filter((o) => o.bilde);
    innhold = el('div', { class: 'scene-gruppe' }, ting(hoved.bilde), andre.map((o) => ting(o.bilde, 'merke-ting')));
  }
  return el('div', { class: 'scenebilde' }, innhold);
}

// Scene med flere ting: [{ ord, antall, storrelse }]
export function beskrivBilde(liste, ordMap) {
  return el('div', { class: 'scenebilde beskriv' },
    liste.map((t) => {
      const o = ordMap[t.ord];
      if (t.antall > 1) return flere(o.bilde, t.antall, 'liten-ting');
      return ting(o.bilde, t.storrelse === 'big' ? 'kjempe' : t.storrelse === 'small' ? 'mini' : '');
    }));
}
