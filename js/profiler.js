// Velg profil og lag ny profil.
import { el, knapp, visSkjerm } from './dom.js';
import { app, lagreData, settVisueltTema } from './tilstand.js';
import { nyProfil } from './lagring.js';
import { avatarHTML } from './bilder.js';
import { registrerSkjerm, gaTil } from './nav.js';
import { topplinje } from './felles.js';

const MAKS_PROFILER = 4;

export const VERDENER = [
  { id: 'blokk', navn: 'Byggeverden', ikon: '🧱', tekst: 'Bygg med klosser' },
  { id: 'scene', navn: 'Scenen', ikon: '🎭', tekst: 'Dans og teater' }
];

function velg(p) {
  app.data.aktivProfil = p.id;
  lagreData();
  settVisueltTema(p.tema);
  gaTil('hjem');
}

function visProfiler() {
  settVisueltTema('standard');
  const profiler = app.data.profiler;
  if (!profiler.length) return visNyProfil();

  const kort = profiler.map((p) => knapp([
    el('div', { class: 'avatar stor', html: avatarHTML(p.tema) }),
    el('div', { class: 'profil-navn' }, p.navn)
  ], () => velg(p), 'profilkort tema-' + p.tema));

  if (profiler.length < MAKS_PROFILER) {
    kort.push(knapp([el('div', { class: 'pluss' }, '+'), el('div', { class: 'profil-navn' }, 'Ny')],
      () => gaTil('nyProfil'), 'profilkort ny'));
  }

  visSkjerm(el('div', { class: 'skjerm' },
    topplinje(null, null, knapp('⚙️', () => gaTil('voksen'), 'ikonknapp', { 'aria-label': 'For voksne' })),
    el('main', { class: 'innhold midt' },
      el('h1', { class: 'stor-tittel' }, 'Hei! Hvem skal øve?'),
      el('div', { class: 'profilrad' }, kort))));
}

function visNyProfil() {
  settVisueltTema('standard');
  let valgt = null;
  const input = el('input', {
    class: 'tekstfelt', type: 'text', maxlength: '20', autocomplete: 'off',
    autocapitalize: 'words', spellcheck: 'false', placeholder: 'Navn', 'aria-label': 'Navn'
  });
  const lagreKnapp = knapp('Ferdig ✓', lagre, 'knapp stor');
  const valg = VERDENER.map((v) => {
    const b = knapp([
      el('div', { class: 'avatar', html: avatarHTML(v.id) }),
      el('div', { class: 'verden-navn' }, v.ikon + ' ' + v.navn),
      el('div', { class: 'verden-tekst' }, v.tekst)
    ], () => {
      valgt = v.id;
      valg.forEach((x) => x.classList.toggle('valgt', x === b));
      settVisueltTema(v.id);
      oppdater();
    }, 'verdenkort tema-' + v.id);
    return b;
  });

  function oppdater() {
    lagreKnapp.disabled = !(input.value.trim() && valgt);
  }
  input.addEventListener('input', oppdater);
  oppdater();

  function lagre() {
    const navn = input.value.trim();
    if (!navn || !valgt) return;
    const p = nyProfil(navn, valgt);
    app.data.profiler.push(p);
    velg(p);
  }

  const tilbake = app.data.profiler.length
    ? knapp('← Tilbake', () => gaTil('profiler'), 'knapp sekundar')
    : null;

  visSkjerm(el('div', { class: 'skjerm' },
    topplinje(tilbake, null, null),
    el('main', { class: 'innhold midt' },
      el('h1', { class: 'stor-tittel' }, 'Ny profil'),
      el('label', { class: 'felt-tittel' }, 'Hva heter du?'),
      input,
      el('div', { class: 'felt-tittel' }, 'Velg din verden:'),
      el('div', { class: 'verdenrad' }, valg),
      lagreKnapp)));
}

registrerSkjerm('profiler', visProfiler);
registrerSkjerm('nyProfil', visNyProfil);
