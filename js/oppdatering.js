// Service worker: registrering, «ny versjon klar»-melding og versjonsnummer.
import { toast } from './dom.js';

export function registrerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const haddeKontroller = !!navigator.serviceWorker.controller;
  let lastetPaNytt = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Første installasjon skal ikke laste siden på nytt, bare oppdateringer.
    if (!haddeKontroller || lastetPaNytt) return;
    lastetPaNytt = true;
    location.reload();
  });

  navigator.serviceWorker.register('./sw.js').then((reg) => {
    const visMelding = () => {
      toast('Ny versjon klar! Trykk her for å oppdatere.', {
        varighet: 0,
        vedTrykk: () => { if (reg.waiting) reg.waiting.postMessage('hoppOver'); }
      });
    };
    if (reg.waiting && navigator.serviceWorker.controller) visMelding();
    reg.addEventListener('updatefound', () => {
      const ny = reg.installing;
      if (!ny) return;
      ny.addEventListener('statechange', () => {
        if (ny.state === 'installed' && navigator.serviceWorker.controller) visMelding();
      });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch((e) => console.warn('Service worker ble ikke registrert', e));
}

export function sjekkOppdatering() {
  if (!('serviceWorker' in navigator)) return Promise.resolve();
  return navigator.serviceWorker.getRegistration().then((reg) => reg && reg.update());
}

export function hentVersjon() {
  return new Promise((resolve) => {
    const k = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (!k) return resolve('ikke installert ennå');
    const kanal = new MessageChannel();
    kanal.port1.onmessage = (e) => resolve(e.data && e.data.versjon);
    k.postMessage('versjon', [kanal.port2]);
    setTimeout(() => resolve('ukjent'), 1500);
  });
}
