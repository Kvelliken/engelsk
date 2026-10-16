// Små hjelpere for å lage DOM uten rammeverk.

export function el(tag, attrs, ...barn) {
  const e = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
  }
  leggTil(e, barn);
  return e;
}

function leggTil(e, barn) {
  for (const b of barn) {
    if (b == null || b === false) continue;
    if (Array.isArray(b)) leggTil(e, b);
    else e.appendChild(typeof b === 'object' ? b : document.createTextNode(String(b)));
  }
}

export function knapp(innhold, vedTrykk, klasse = 'knapp', attrs = {}) {
  return el('button', Object.assign({ type: 'button', class: klasse, onclick: vedTrykk }, attrs), innhold);
}

export function tom(e) {
  while (e.firstChild) e.removeChild(e.firstChild);
}

export function visSkjerm(node) {
  const rot = document.getElementById('app');
  tom(rot);
  rot.appendChild(node);
  window.scrollTo(0, 0);
}

export const vent = (ms) => new Promise((r) => setTimeout(r, ms));

export function stokk(liste) {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

let toastTimer = null;
export function toast(tekst, { vedTrykk = null, varighet = 3000 } = {}) {
  const t = document.getElementById('toast');
  tom(t);
  t.appendChild(document.createTextNode(tekst));
  t.hidden = false;
  t.classList.toggle('klikkbar', !!vedTrykk);
  t.onclick = vedTrykk;
  clearTimeout(toastTimer);
  if (varighet) toastTimer = setTimeout(() => { t.hidden = true; }, varighet);
}

// Enkel dialog som løses med verdien til knappen som trykkes.
export function dialog(innhold, knapper) {
  return new Promise((resolve) => {
    const bakgrunn = el('div', { class: 'dialog-bakgrunn' });
    const boks = el('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true' });
    boks.appendChild(typeof innhold === 'string' ? el('p', { class: 'dialog-tekst' }, innhold) : innhold);
    const rad = el('div', { class: 'dialog-knapper' });
    for (const k of knapper) {
      rad.appendChild(knapp(k.tekst, () => {
        bakgrunn.remove();
        resolve(k.verdi);
      }, k.klasse || 'knapp'));
    }
    boks.appendChild(rad);
    bakgrunn.appendChild(boks);
    document.body.appendChild(bakgrunn);
  });
}
