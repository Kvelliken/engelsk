// Spredt repetisjon (Leitner-bokser).
// Boks 0 = ikke sett. Et ord kan bare gå opp én boks per dag, slik at
// mange riktige svar i én økt ikke later som om ordet sitter.
import { idag, leggTilDager } from './dato.js';

export const INTERVALL = [0, 1, 2, 4, 7, 14, 30]; // dager til neste repetisjon per boks
export const MAKS_BOKS = INTERVALL.length - 1;

export function status(profil, id) {
  return profil.ord[id] || { boks: 0 };
}

export function erSett(profil, id) {
  return status(profil, id).boks >= 1;
}

export function forfaller(profil, id, dag = idag()) {
  const s = status(profil, id);
  return s.boks >= 1 && (!s.neste || s.neste <= dag);
}

// resultat: 'sett' (introdusert), 'riktig', 'feil' eller 'delvis' (ingen endring)
export function registrer(profil, id, resultat, dag = idag()) {
  const s = profil.ord[id] || (profil.ord[id] = { boks: 0, riktig: 0, feil: 0 });
  if (!s.forst && resultat !== 'delvis') s.forst = dag;
  s.sist = dag;
  if (resultat === 'sett') {
    if (s.boks === 0) {
      s.boks = 1;
      s.neste = leggTilDager(dag, 1);
    }
  } else if (resultat === 'riktig') {
    s.riktig++;
    if (s.opp !== dag) {
      s.boks = Math.min(MAKS_BOKS, s.boks + 1);
      s.opp = dag;
    }
    s.neste = leggTilDager(dag, INTERVALL[s.boks]);
  } else if (resultat === 'feil') {
    s.feil++;
    s.boks = s.boks >= 4 ? 2 : Math.max(1, s.boks - 1);
    s.neste = dag; // kommer igjen i neste økt
  }
  return s;
}

// 0–3 mestringsstjerner for et ord.
export function stjerner(profil, id) {
  const b = status(profil, id).boks;
  if (b >= 5) return 3;
  if (b >= 4) return 2;
  if (b >= 2) return 1;
  return 0;
}
