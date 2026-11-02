// Felles tilstand for appen: lagrede data og innholdet fra data/*.json.
import { lagre } from './lagring.js';

export const app = {
  data: null,
  ord: [],
  ordMap: {},
  rammer: [],
  temaer: [],
  temaMap: {},
  nivaaer: [],
  samtaler: { kommentarer: [], samtaler: [] },
  dialoger: []
};

export function lagreData() {
  lagre(app.data);
}

export function aktivProfil() {
  return app.data.profiler.find((p) => p.id === app.data.aktivProfil) || null;
}

export function settInnhold(ord, rammer, temaer, nivaaer = [], samtaler = null, dialoger = []) {
  app.nivaaer = nivaaer;
  if (samtaler) app.samtaler = samtaler;
  app.dialoger = dialoger;
  app.ord = ord;
  app.rammer = rammer;
  app.temaer = temaer;
  app.ordMap = {};
  ord.forEach((o) => { app.ordMap[o.id] = o; });
  app.temaMap = {};
  temaer.forEach((t) => { app.temaMap[t.id] = t; });
}

// Interessetemaene som hører til det visuelle temaet til profilen
// (Byggeverden: blokker, sport, kjøretøy; Scenen: dans, klær, eventyr).
export function interesseTemaer(profil) {
  return app.temaer.filter((x) => x.profiltema === profil.tema).map((x) => x.id);
}

export function settVisueltTema(tema) {
  document.body.setAttribute('data-tema', tema || 'standard');
}
