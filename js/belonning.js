// Små belønninger: konfetti og klistremerker.

const FARGER = ['#f2994a', '#2f80ed', '#27ae60', '#eb5757', '#f2c94c', '#9b51e0'];

export function konfetti(antall = 60) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const boks = document.createElement('div');
  boks.className = 'konfetti';
  for (let i = 0; i < antall; i++) {
    const biten = document.createElement('i');
    biten.style.left = Math.random() * 100 + '%';
    biten.style.background = FARGER[i % FARGER.length];
    biten.style.animationDelay = Math.random() * 0.6 + 's';
    biten.style.animationDuration = 1.8 + Math.random() * 1.2 + 's';
    boks.appendChild(biten);
  }
  document.body.appendChild(boks);
  setTimeout(() => boks.remove(), 3800);
}

const MERKER = {
  blokk: ['🧱', '🌳', '🏠', '💎', '🪵', '🌻', '🍄', '🐑', '🪨', '🏰', '⛏️', '🌙', '☀️', '🚪', '🌋', '🐝', '🥕', '🗺️', '🔦', '🏆'],
  scene: ['🎭', '👑', '🎩', '🩰', '🎤', '🌟', '💃', '🎀', '🪄', '🎻', '🥁', '🎬', '🦄', '🎪', '🌹', '🦋', '🎹', '🪩', '🧚', '🏆']
};

// Gir neste klistremerke i samlingen til profilen.
export function nyttKlistremerke(profil) {
  const liste = MERKER[profil.tema] || MERKER.blokk;
  const merke = liste.find((m) => profil.klistremerker.indexOf(m) === -1) ||
    liste[profil.klistremerker.length % liste.length];
  profil.klistremerker.push(merke);
  return merke;
}
