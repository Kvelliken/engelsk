// Tale (lydfil eller tekst-til-tale) og små lydeffekter.
// iOS krever et trykk før lyd kan spilles, så lasOpp() kalles ved første trykk.
import { app } from './tilstand.js';

let ctx = null;
let taleLastOpp = false;
let aktivYtring = null; // holdes på så iOS ikke rydder den bort midt i
let lydElement = null;

const harTale = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function lasOpp() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* ingen Web Audio */ }
  if (harTale && !taleLastOpp) {
    taleLastOpp = true;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}

export function engelskeStemmer() {
  if (!harTale) return [];
  return speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
}

// iPadOS har mange engelske stemmer, også robotaktige «Eloquence»-stemmer og
// morostemmer. Vi rangerer dem slik at den tydeligste stemmen velges.
const DARLIGE = /eloquence|speech\.synthesis\.voice|novelty|^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i;
const GODE = /\b(serena|daniel|kate|arthur|martha|stephanie|oliver|malcolm|jamie|samantha|ava|allison|susan|tom|zoe|nathan|evan|joelle|karen|moira|tessa)\b/i;

export function stemmeKvalitet(v) {
  const id = (v.voiceURI || '') + ' ' + v.name;
  if (DARLIGE.test(v.name) || DARLIGE.test(v.voiceURI || '')) return 0;
  let p = 10;
  if (/premium/i.test(id)) p += 40;
  else if (/enhanced|forbedret|siri/i.test(id)) p += 30;
  if (GODE.test(v.name)) p += 10;
  if (/en[-_]GB/i.test(v.lang)) p += 4;
  else if (/en[-_]US/i.test(v.lang)) p += 3;
  else if (/en[-_](AU|IE)/i.test(v.lang)) p += 1;
  if (v.localService) p += 1;
  return p;
}

// Engelske stemmer, beste først.
export function rangerteStemmer() {
  return engelskeStemmer().slice().sort((a, b) => stemmeKvalitet(b) - stemmeKvalitet(a));
}

function velgStemme() {
  const stemmer = rangerteStemmer();
  const lagret = app.data && app.data.innstillinger.stemme;
  if (lagret) {
    const v = stemmer.find((s) => s.voiceURI === lagret);
    if (v) return v;
  }
  return stemmer[0] || null;
}

export function siTekst(tekst, tempo) {
  return new Promise((resolve) => {
    if (!harTale) return resolve();
    // iOS kan miste en ytring som startes rett etter cancel(), så vent litt da.
    const opptatt = speechSynthesis.speaking || speechSynthesis.pending;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(/[.!?]$/.test(tekst) ? tekst : tekst + '.');
    const v = velgStemme();
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-GB'; }
    u.rate = tempo || (app.data && app.data.innstillinger.taleTempo) || 0.85;
    let ferdig = false;
    const slutt = () => {
      if (ferdig) return;
      ferdig = true;
      clearTimeout(tidsfrist);
      resolve();
    };
    // Reserve i tilfelle nettleseren aldri sier fra at den er ferdig.
    const tidsfrist = setTimeout(slutt, 2000 + tekst.length * 160);
    u.onend = slutt;
    u.onerror = slutt;
    aktivYtring = u;
    if (opptatt) setTimeout(() => { if (aktivYtring === u) speechSynthesis.speak(u); }, 80);
    else speechSynthesis.speak(u);
  });
}

// Si et ord: bruk lydfil hvis den finnes, ellers tekst-til-tale.
export function siOrd(ord) {
  if (ord.lyd) return spillFil(ord.lyd).catch(() => siTekst(ord.en));
  return siTekst(ord.en);
}

export function spillFil(src) {
  return new Promise((resolve, reject) => {
    stopp();
    const a = new Audio(src);
    lydElement = a;
    a.onended = () => resolve();
    a.onerror = () => reject(new Error('Kunne ikke spille ' + src));
    const p = a.play();
    if (p && p.catch) p.catch(reject);
  });
}

export function stopp() {
  if (harTale) speechSynthesis.cancel();
  aktivYtring = null;
  if (lydElement) {
    lydElement.pause();
    lydElement = null;
  }
}

function tone(frekvens, start, varighet, volum, type) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = frekvens;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(volum, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + varighet);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + varighet + 0.05);
}

// Lav standardvolum. Effektene kan slås av med knappen i hjørnet.
export function effekt(navn) {
  if (!ctx || !app.data || !app.data.innstillinger.effekter) return;
  try {
    const t = ctx.currentTime;
    if (navn === 'riktig') {
      tone(660, t, 0.14, 0.06);
      tone(880, t + 0.1, 0.22, 0.06);
    } else if (navn === 'prov') {
      tone(330, t, 0.18, 0.035, 'triangle');
    } else if (navn === 'ferdig') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.13, 0.3, 0.06));
    } else if (navn === 'brikke') {
      tone(520, t, 0.06, 0.03, 'triangle');
    }
  } catch (e) { /* ignorer */ }
}
