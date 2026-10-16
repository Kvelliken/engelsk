// Felles tilstand for appen: lagrede data og innholdet fra data/*.json.
import { lagre } from './lagring.js';

export const app = {
  data: null,
  ord: [],
  ordMap: {},
  rammer: [],
  temaer: [],
  temaMap: {}
};

export function lagreData() {
  lagre(app.data);
}

export function aktivProfil() {
  return app.data.profiler.find((p) => p.id === app.data.aktivProfil) || null;
}

export function settInnhold(ord, rammer, temaer) {
  app.ord = ord;
  app.rammer = rammer;
  app.temaer = temaer;
  app.ordMap = {};
  ord.forEach((o) => { app.ordMap[o.id] = o; });
  app.temaMap = {};
  temaer.forEach((t) => { app.temaMap[t.id] = t; });
}

// Interessetemaet som hører til det visuelle temaet til profilen.
export function interesseTema(profil) {
  const t = app.temaer.find((x) => x.profiltema === profil.tema);
  return t ? t.id : null;
}

export function settVisueltTema(tema) {
  document.body.setAttribute('data-tema', tema || 'standard');
}
