// All grafikk lages her som SVG-tekst eller emoji. Ingen bildefiler, ingen DOM,
// slik at modulen også kan brukes av sjekkeskriptet i verktoy/.
//
// Bildenøkler i ord.json:
//   emoji:🐱        en emoji
//   farge:#e53935   en fargeklatt
//   tall:3          et tall med prikker
//   piksel:stein    pikselkunst (blokkverden)
//   svg:scene       egentegnet SVG-figur

// ---- Pikselkunst (12 × 12) ----
const PIKSEL = {
  blokk: {
    p: { G: '#5bbf4a', g: '#3f9a35', D: '#8a5a32', d: '#6d4524' },
    r: [
      'GGGGGGGGGGGG',
      'GgGGgGGGgGGg',
      'gDgGDgGgDgGD',
      'DDDDDDDDDDDD',
      'DdDDDDdDDDdD',
      'DDDDdDDDDDDD',
      'DDdDDDDDdDDD',
      'DDDDDDdDDDDD',
      'DdDDDDDDDDdD',
      'DDDDdDDDDDDD',
      'DDDDDDDdDDDD',
      'DDdDDDDDDDDD'
    ]
  },
  stein: {
    p: { S: '#9e9e9e', s: '#757575', L: '#bdbdbd' },
    r: [
      'SSSSSSSSSSSS',
      'SsSSSLSsSSSS',
      'SSSSsSSSSSsS',
      'SLSSSSSSLSSS',
      'SsSSSSsSSSSS',
      'SSSSSSSSSsSS',
      'SSSsSSLSSSSS',
      'SLSSSSSSsSSS',
      'SsSSSSSSSSLS',
      'SSSSSsSSSSsS',
      'SSLSSSSSSSSS',
      'SSsSSSSSsSSS'
    ]
  },
  sand: {
    p: { Y: '#ecd896', y: '#d4bc6a', L: '#f6e9bd' },
    r: [
      'YYYYYYYYYYYY',
      'YyYYYLYyYYYY',
      'YYYYyYYYYYyY',
      'YLYYYYYYLYYY',
      'YyYYYYyYYYYY',
      'YYYYYYYYYyYY',
      'YYYyYYLYYYYY',
      'YLYYYYYYyYYY',
      'YyYYYYYYYYLY',
      'YYYYYyYYYYyY',
      'YYLYYYYYYYYY',
      'YYyYYYYYyYYY'
    ]
  },
  vann: {
    p: { W: '#4fa3e0', w: '#2f7fc1', L: '#9fd1f5' },
    r: [
      'WWWWWWWWWWWW',
      'WLLWWWWLLWWW',
      'LWWLWWLWWLWW',
      'WWWWwWWWWWwW',
      'WWWWWWWWWWWW',
      'WWwWWWWWwWWW',
      'WLLWWWWLLWWW',
      'LWWLWWLWWLWW',
      'WWWWWWWWWWWW',
      'WWWWwWWWWwWW',
      'WwWWWWwWWWWW',
      'WWWWWWWWWWWW'
    ]
  },
  tre: {
    p: { L: '#4caf50', l: '#2e7d32', T: '#8d5b34', t: '#6b4226' },
    r: [
      '...LLLLLL...',
      '..LLlLLLLL..',
      '.LLLLLLlLLL.',
      '.LlLLLLLLLL.',
      '.LLLLlLLLlL.',
      '.LLLLLLLLLL.',
      '..LLLlLLLL..',
      '....TTTT....',
      '....TttT....',
      '....TTTT....',
      '....TtTT....',
      '....TTTT....'
    ]
  },
  hus: {
    p: { R: '#c0504d', r: '#9e3b38', P: '#d9b38c', B: '#8fd3ff', D: '#7a4a2a' },
    r: [
      '.....RR.....',
      '....RrRR....',
      '...RRRRrR...',
      '..RrRRRRRR..',
      '.RRRRRrRRRR.',
      'RRrRRRRRRrRR',
      '.PPPPPPPPPP.',
      '.PBBPPPPBBP.',
      '.PBBPPPPBBP.',
      '.PPPPDDPPPP.',
      '.PPPPDDPPPP.',
      '.PPPPDDPPPP.'
    ]
  },
  dor: {
    p: { F: '#5e3a1f', D: '#a0663a', d: '#7a4a2a', K: '#f2c94c' },
    r: [
      '..FFFFFFFF..',
      '..FDDDDDDF..',
      '..FDddddDF..',
      '..FDDDDDDF..',
      '..FDddddDF..',
      '..FDDDDDDF..',
      '..FDDDDDKF..',
      '..FDddddDF..',
      '..FDDDDDDF..',
      '..FDddddDF..',
      '..FDDDDDDF..',
      '..FFFFFFFF..'
    ]
  },
  dag: {
    p: { Y: '#ffc83d', O: '#f2a516' },
    r: [
      '.....YY.....',
      '.Y...YY...Y.',
      '..Y......Y..',
      '....YYYY....',
      '...YYYYOY...',
      'YY.YYYYYY.YY',
      'YY.YOYYYY.YY',
      '...YYYYYY...',
      '....YYYY....',
      '..Y......Y..',
      '.Y...YY...Y.',
      '.....YY.....'
    ]
  },
  natt: {
    p: { N: '#233a6b', s: '#ffffff', M: '#fff2a8' },
    r: [
      'NNNNNNNNNNNN',
      'NNsNNMMMMNNN',
      'NNNNMMMNNNNN',
      'NNNMMMNNNNsN',
      'NsNMMMNNNNNN',
      'NNMMMNNNNNNN',
      'NNMMMNNNNNNN',
      'NNNMMMNNNNNN',
      'NNNMMMNNNsNN',
      'NNNNMMMNNNNN',
      'NsNNNMMMMNNN',
      'NNNNNNNNNNNN'
    ]
  },
  hule: {
    p: { S: '#9e9e9e', s: '#757575', K: '#2b2b2b' },
    r: [
      'SSSSSSSSSSSS',
      'SsSSSSSSSsSS',
      'SSSSSSSSSSSS',
      'SSSSKKKKSSSS',
      'SSSKKKKKKSsS',
      'SsKKKKKKKKSS',
      'SSKKKKKKKKSS',
      'SSKKKKKKKKSS',
      'SKKKKKKKKKKS',
      'SKKKKKKKKKKS',
      'sKKKKKKKKKKS',
      'SKKKKKKKKKKs'
    ]
  },
  bygge: {
    p: { H: '#8a8a8a', h: '#6a6a6a', W: '#8d5b34', G: '#5bbf4a', g: '#3f9a35', D: '#8a5a32', d: '#6d4524', '*': '#ffc83d' },
    r: [
      '.HHHHH...*..',
      '.HhhHH..*.*.',
      '...W.....*..',
      '...W........',
      '...W........',
      '...W........',
      '...GGGGGG...',
      '...GgGGgG...',
      '...DDDDDD...',
      '...DdDDDD...',
      '...DDDdDD...',
      '...DDDDDD...'
    ]
  },
  grave: {
    p: { H: '#8d5b34', S: '#b0b0b0', s: '#8a8a8a', D: '#8a5a32', d: '#6d4524' },
    r: [
      '.........HH.',
      '.........HH.',
      '........H...',
      '.......H....',
      '......H.....',
      '.....H......',
      '..SSH.......',
      '.SSSs.......',
      '.SSs........',
      'DDDDDDDDDDDD',
      'DdDDDdDDDDdD',
      'DDDDDDDDdDDD'
    ]
  },
  figurBlokk: {
    p: { A: '#f2c94c', G: '#9fb3c8', g: '#7a8ea3', W: '#ffffff', K: '#1f2a37', M: '#e04848', B: '#3aa0e8', b: '#2b7cc0', L: '#5bbf4a' },
    r: [
      '.....AA.....',
      '.....gg.....',
      '.GGGGGGGGGG.',
      '.GWWGGGGWWG.',
      '.GWKGGGGWKG.',
      '.GGGGGGGGGG.',
      '.GGGMMMMGGG.',
      '..gggggggg..',
      '.BBBBLLBBBB.',
      'GBBBLBBLBBBG',
      'G.BBBBBBBB.G',
      '...bb..bb...'
    ]
  },
  avatarBlokk: {
    p: { H: '#6b4226', S: '#f1c27d', s: '#d9a066', E: '#ffffff', e: '#2b6cb0', M: '#9e3b38', B: '#3aa0e8', b: '#2b7cc0' },
    r: [
      '..HHHHHHHH..',
      '..HHHHHHHH..',
      '..HSSSSSSH..',
      '..SEeSSEeS..',
      '..SSSSSSSS..',
      '..SSSMMSSS..',
      '...ssssss...',
      '.BBBBBBBBBB.',
      '.BbBBBBBBbB.',
      '.SBBBBBBBBS.',
      '.SBBbBBbBBS.',
      '...BB..BB...'
    ]
  }
};

function piksel(navn) {
  const b = PIKSEL[navn];
  if (!b) return null;
  let rekt = '';
  b.r.forEach((rad, y) => {
    for (let x = 0; x < rad.length; x++) {
      const f = b.p[rad[x]];
      if (f) rekt += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + f + '"/>';
    }
  });
  return '<svg class="piksel" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">' + rekt + '</svg>';
}

// ---- Egentegnede SVG-figurer ----
const HODE = '#f1c27d';
const KROPP = '#8e44ad';

const SVG = {
  scene:
    '<rect x="4" y="80" width="92" height="14" rx="2" fill="#8a5a32"/>' +
    '<rect x="4" y="6" width="92" height="10" fill="#7a1f2b"/>' +
    '<path d="M4 16 h28 q-6 30 4 64 h-32 z" fill="#c0392b"/>' +
    '<path d="M96 16 h-28 q6 30 -4 64 h32 z" fill="#c0392b"/>' +
    '<path d="M50 20 l30 60 h-60 z" fill="#fff6c8" opacity=".75"/>' +
    '<circle cx="50" cy="58" r="5" fill="' + HODE + '"/>' +
    '<path d="M50 63 v12 M50 66 l-7 -4 M50 66 l7 -4 M50 75 l-4 5 M50 75 l4 5" stroke="' + KROPP + '" stroke-width="3" stroke-linecap="round" fill="none"/>',
  hoppe:
    '<path d="M18 92 h64" stroke="#8a5a32" stroke-width="4" stroke-linecap="round"/>' +
    '<ellipse cx="50" cy="90" rx="14" ry="3" fill="#000" opacity=".12"/>' +
    '<circle cx="50" cy="20" r="9" fill="' + HODE + '"/>' +
    '<path d="M50 30 v26 M50 36 l-16 -14 M50 36 l16 -14 M50 56 l-12 10 l2 8 M50 56 l12 10 l-2 8" stroke="' + KROPP + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<path d="M26 74 v10 M74 74 v10 M38 80 v8 M62 80 v8" stroke="#3aa0e8" stroke-width="3" stroke-linecap="round"/>',
  snurre:
    '<path d="M18 50 a32 32 0 1 1 10 23" stroke="#3aa0e8" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M18 64 l10 10 l4 -14" stroke="#3aa0e8" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="50" cy="28" r="8" fill="' + HODE + '"/>' +
    '<path d="M50 37 v24 M50 44 l-18 -4 M50 44 l18 -4 M50 61 l-8 14 M50 61 l8 14" stroke="' + KROPP + '" stroke-width="6" stroke-linecap="round" fill="none"/>',
  bevege:
    '<circle cx="44" cy="22" r="9" fill="' + HODE + '"/>' +
    '<path d="M44 32 l2 26 M45 40 l-14 12 M45 40 l14 10 M46 58 l-14 22 M46 58 l12 22" stroke="' + KROPP + '" stroke-width="6" stroke-linecap="round" fill="none"/>' +
    '<path d="M66 46 h22 M80 38 l8 8 l-8 8" stroke="#3aa0e8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<path d="M10 40 h12 M6 52 h14 M10 64 h12" stroke="#3aa0e8" stroke-width="4" stroke-linecap="round" opacity=".6"/>',
  sparke:
    '<path d="M10 92 h80" stroke="#8a5a32" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="36" cy="18" r="9" fill="' + HODE + '"/>' +
    '<path d="M36 28 v26 M36 36 l-14 10 M36 36 l14 -6 M36 54 l-4 34 M36 54 l24 14" stroke="' + KROPP + '" stroke-width="6" stroke-linecap="round" fill="none"/>' +
    '<circle cx="74" cy="76" r="11" fill="#fff" stroke="#1f2a37" stroke-width="3"/>' +
    '<path d="M70 70 l8 0 l3 6 l-7 5 l-7 -5 z" fill="#1f2a37"/>' +
    '<path d="M88 62 l6 -4 M90 72 h7 M88 82 l6 4" stroke="#3aa0e8" stroke-width="3" stroke-linecap="round"/>',
  fange:
    '<circle cx="50" cy="42" r="9" fill="' + HODE + '"/>' +
    '<path d="M50 52 v24 M50 58 l-16 -16 M50 58 l16 -16 M50 76 l-10 16 M50 76 l10 16" stroke="' + KROPP + '" stroke-width="6" stroke-linecap="round" fill="none"/>' +
    '<circle cx="50" cy="16" r="10" fill="#f2994a" stroke="#c46f22" stroke-width="2"/>' +
    '<path d="M50 6 v20 M40 16 h20" stroke="#c46f22" stroke-width="2"/>' +
    '<path d="M24 10 l8 4 M20 20 h9 M76 10 l-8 4 M80 20 h-9" stroke="#3aa0e8" stroke-width="3" stroke-linecap="round"/>',
  bord:
    '<rect x="12" y="40" width="76" height="10" rx="3" fill="#a0663a"/>' +
    '<rect x="18" y="50" width="7" height="38" fill="#7a4a2a"/><rect x="75" y="50" width="7" height="38" fill="#7a4a2a"/>' +
    '<rect x="12" y="40" width="76" height="4" rx="2" fill="#c08454"/>',
  inni:
    '<path d="M20 44 l30 -10 l30 10 z" fill="#b8844e"/>' +
    '<circle cx="50" cy="44" r="13" fill="#e53935"/><ellipse cx="45" cy="39" rx="4" ry="2.5" fill="#fff" opacity=".5"/>' +
    '<rect x="20" y="44" width="60" height="42" fill="#d9a066" stroke="#a0663a" stroke-width="3"/>' +
    '<path d="M20 44 l-8 -12 M80 44 l8 -12" stroke="#a0663a" stroke-width="4" stroke-linecap="round"/>',
  paa:
    '<rect x="12" y="52" width="76" height="9" rx="3" fill="#a0663a"/>' +
    '<rect x="18" y="61" width="7" height="30" fill="#7a4a2a"/><rect x="75" y="61" width="7" height="30" fill="#7a4a2a"/>' +
    '<circle cx="50" cy="39" r="13" fill="#e53935"/><ellipse cx="45" cy="34" rx="4" ry="2.5" fill="#fff" opacity=".5"/>',
  under:
    '<rect x="12" y="30" width="76" height="9" rx="3" fill="#a0663a"/>' +
    '<rect x="18" y="39" width="7" height="52" fill="#7a4a2a"/><rect x="75" y="39" width="7" height="52" fill="#7a4a2a"/>' +
    '<circle cx="50" cy="78" r="13" fill="#e53935"/><ellipse cx="45" cy="73" rx="4" ry="2.5" fill="#fff" opacity=".5"/>',
  stor:
    '<circle cx="44" cy="54" r="36" fill="#2f80ed"/><circle cx="88" cy="82" r="7" fill="#c9d3df"/>' +
    '<circle cx="32" cy="44" r="5" fill="#fff"/><circle cx="56" cy="44" r="5" fill="#fff"/>',
  liten:
    '<circle cx="44" cy="54" r="36" fill="none" stroke="#c9d3df" stroke-width="3" stroke-dasharray="6 6"/>' +
    '<circle cx="44" cy="70" r="11" fill="#2f80ed"/><circle cx="40" cy="67" r="2" fill="#fff"/><circle cx="48" cy="67" r="2" fill="#fff"/>',
  sitte:
    '<rect x="44" y="58" width="36" height="8" rx="2" fill="#a0663a"/>' +
    '<rect x="48" y="66" width="6" height="26" fill="#7a4a2a"/><rect x="70" y="66" width="6" height="26" fill="#7a4a2a"/>' +
    '<circle cx="56" cy="20" r="9" fill="' + HODE + '"/>' +
    '<path d="M56 30 v26 M56 38 l-14 10 M56 38 l14 10 M56 56 l-22 0 l0 30" stroke="' + KROPP + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  figurScene:
    '<path d="M50 6 l12 26 l28 3 l-21 19 l6 28 l-25 -14 l-25 14 l6 -28 l-21 -19 l28 -3 z" fill="#f2c94c" stroke="#e0a100" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="41" cy="44" r="4.5" fill="#1f2a37"/><circle cx="59" cy="44" r="4.5" fill="#1f2a37"/>' +
    '<circle cx="42.5" cy="42.5" r="1.5" fill="#fff"/><circle cx="60.5" cy="42.5" r="1.5" fill="#fff"/>' +
    '<path d="M42 54 q8 8 16 0" stroke="#9e3b38" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="34" cy="53" r="4" fill="#f4a3a3" opacity=".7"/><circle cx="66" cy="53" r="4" fill="#f4a3a3" opacity=".7"/>' +
    '<path d="M38 14 l12 -8 l12 8 z" fill="#8e44ad"/>',
  avatarScene:
    '<circle cx="50" cy="50" r="46" fill="#fff6c8"/>' +
    '<path d="M50 8 l6 12 l13 2 l-9 9 l2 13 l-12 -6 l-12 6 l2 -13 l-9 -9 l13 -2 z" fill="#e0a100"/>' +
    '<circle cx="50" cy="56" r="20" fill="' + HODE + '"/>' +
    '<circle cx="43" cy="53" r="2.6" fill="#2b2b2b"/><circle cx="57" cy="53" r="2.6" fill="#2b2b2b"/>' +
    '<path d="M42 62 q8 7 16 0" stroke="#9e3b38" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M30 92 q20 -22 40 0" fill="' + KROPP + '"/>'
};

function svg(navn) {
  const innhold = SVG[navn];
  if (!innhold) return null;
  return '<svg class="tegning" viewBox="0 0 100 100" aria-hidden="true">' + innhold + '</svg>';
}

function farge(hex) {
  const kant = /^#f{3,6}$/i.test(hex) ? '#c9c9c9' : 'rgba(0,0,0,.12)';
  return '<svg class="tegning" viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M50 10 C72 8 92 24 90 46 C94 64 82 88 58 90 C36 94 12 80 10 58 C6 36 26 12 50 10 Z" fill="' + hex + '" stroke="' + kant + '" stroke-width="3"/>' +
    '<ellipse cx="36" cy="32" rx="10" ry="6" fill="#fff" opacity=".35"/></svg>';
}

function tall(n) {
  const prikker = [];
  const perRad = 5;
  for (let i = 0; i < n; i++) {
    const rad = Math.floor(i / perRad);
    const iRad = i % perRad;
    const antallIRad = Math.min(perRad, n - rad * perRad);
    const x = 50 + (iRad - (antallIRad - 1) / 2) * 16;
    const y = (n > perRad ? 72 : 80) + rad * 16;
    prikker.push('<circle cx="' + x + '" cy="' + y + '" r="6" fill="#f2994a"/>');
  }
  return '<svg class="tegning" viewBox="0 0 100 100" aria-hidden="true">' +
    '<text x="50" y="' + (n > perRad ? 56 : 62) + '" text-anchor="middle" font-size="56" font-weight="800" fill="#2f80ed" font-family="ui-rounded, system-ui, sans-serif">' + n + '</text>' +
    prikker.join('') + '</svg>';
}

// Returnerer HTML-tekst for en bildenøkkel.
export function bildeHTML(nokkel) {
  if (!nokkel) return '';
  const i = nokkel.indexOf(':');
  const type = nokkel.slice(0, i);
  const verdi = nokkel.slice(i + 1);
  if (type === 'emoji') return '<span class="emoji" aria-hidden="true">' + verdi + '</span>';
  if (type === 'farge') return farge(verdi);
  if (type === 'tall') return tall(Number(verdi));
  if (type === 'piksel') return piksel(verdi) || '';
  if (type === 'svg') return svg(verdi) || '';
  return '';
}

export function bildeFinnes(nokkel) {
  if (!nokkel) return false;
  const i = nokkel.indexOf(':');
  const type = nokkel.slice(0, i);
  const verdi = nokkel.slice(i + 1);
  if (type === 'emoji') return verdi.length > 0;
  if (type === 'farge') return /^#[0-9a-f]{3,6}$/i.test(verdi);
  if (type === 'tall') return Number(verdi) >= 1 && Number(verdi) <= 10;
  if (type === 'piksel') return !!PIKSEL[verdi];
  if (type === 'svg') return !!SVG[verdi];
  return false;
}

export function avatarHTML(tema) {
  return tema === 'scene' ? svg('avatarScene') : piksel('avatarBlokk');
}

// Figuren barnet snakker med («Pip»).
export function figurHTML(tema) {
  return tema === 'scene' ? svg('figurScene') : piksel('figurBlokk');
}
