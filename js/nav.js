// Enkel navigasjon mellom skjermer. Hver skjerm registrerer seg selv,
// slik at modulene ikke trenger å importere hverandre.
import { stopp } from './lyd.js';

const skjermer = {};

export function registrerSkjerm(navn, fn) {
  skjermer[navn] = fn;
}

export function gaTil(navn, ...args) {
  stopp();
  return skjermer[navn](...args);
}
