// Lagring i localStorage, pluss eksport/import av all fremdrift.
import { idag } from './dato.js';

const NOKKEL = 'engelsk-app';
const PREFIKS = 'ENGELSK1:';

export function tomData() {
  return {
    versjon: 1,
    profiler: [],
    aktivProfil: null,
    innstillinger: {
      effekter: true,
      stemme: null,
      taleTempo: 0.85,
      mik: null // null = ikke spurt ennå, 'ok', 'nektet'
    }
  };
}

function fyllProfil(p) {
  p.ord = p.ord || {};
  p.rammer = p.rammer || {};
  p.okter = p.okter || [];
  p.klistremerker = p.klistremerker || [];
  p.stjerner = p.stjerner || 0;
  return p;
}

function rens(d) {
  if (!d || !Array.isArray(d.profiler)) throw new Error('Ugyldige data');
  const t = tomData();
  d.innstillinger = Object.assign(t.innstillinger, d.innstillinger || {});
  d.profiler.forEach(fyllProfil);
  if (!d.profiler.some((p) => p.id === d.aktivProfil)) d.aktivProfil = null;
  return d;
}

export function lastData() {
  try {
    const r = localStorage.getItem(NOKKEL);
    if (r) return rens(JSON.parse(r));
  } catch (e) {
    console.warn('Kunne ikke lese lagrede data', e);
  }
  return tomData();
}

export function lagre(d) {
  try {
    localStorage.setItem(NOKKEL, JSON.stringify(d));
    return true;
  } catch (e) {
    console.warn('Kunne ikke lagre', e);
    return false;
  }
}

export function nyProfil(navn, tema) {
  const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return fyllProfil({ id, navn, tema, opprettet: idag() });
}

export function tilbakestillProfil(p) {
  p.ord = {};
  p.rammer = {};
  p.okter = [];
  p.klistremerker = [];
  p.stjerner = 0;
}

// Be nettleseren om ikke å slette dataene (støttes ikke overalt).
export function beOmVarigLagring() {
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  } catch (e) { /* ikke støttet */ }
}

// ---- Eksport / import ----

function tilBase64(tekst) {
  const bytes = new TextEncoder().encode(tekst);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function fraBase64(b) {
  const bin = atob(b.replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function eksportJson(d) {
  return JSON.stringify({ app: 'engelsk', laget: new Date().toISOString(), data: d });
}

export function eksportKode(d) {
  return PREFIKS + tilBase64(eksportJson(d));
}

// Godtar både kode (ENGELSK1:...) og innholdet i en eksportert fil.
export function lesImport(tekst) {
  const t = (tekst || '').trim();
  const json = t.indexOf(PREFIKS) === 0 ? fraBase64(t.slice(PREFIKS.length)) : t;
  const o = JSON.parse(json);
  if (!o || o.app !== 'engelsk' || !o.data) throw new Error('Ukjent format');
  return rens(o.data);
}
