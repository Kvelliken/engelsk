// Datoer lagres som lokale datostrenger «ÅÅÅÅ-MM-DD».

function tilStreng(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dag = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + dag;
}

function fraStreng(s) {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d, 12);
}

export function idag() {
  return tilStreng(new Date());
}

export function leggTilDager(dato, n) {
  const d = fraStreng(dato);
  d.setDate(d.getDate() + n);
  return tilStreng(d);
}

export function dagerMellom(fra, til) {
  return Math.round((fraStreng(til) - fraStreng(fra)) / 86400000);
}
