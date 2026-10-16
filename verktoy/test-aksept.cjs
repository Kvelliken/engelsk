// Nettlesertest (utviklerverktøy, ikke en del av appen). Krever Playwright og en lokal server:
//     npx http-server -p 8080 -c-1 .      (i ett vindu)
//     node verktoy/test-aksept.cjs 
// Skjermbilder lagres i mappen UT (standard: systemets temp-mappe).
const { chromium } = require('playwright');
const fs = require('fs');
const UT = (process.env.UT || require('os').tmpdir()) + '/';
const SW = require('path').join(__dirname, '..', 'sw.js');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 810, height: 1080 }, hasTouch: true });
  const p = await ctx.newPage();
  const feil = [];
  p.on('pageerror', e => feil.push(e.message));
  await p.goto((process.env.ADRESSE || 'http://localhost:8080') + '/');
  await p.fill('.tekstfelt', 'Ola'); await p.click('.verdenkort.tema-blokk'); await p.click('text=Ferdig');
  // Trykkflater
  const sjekkFlater = async (navn) => {
    const sma = await p.$$eval('button, select, input, textarea, a', els => els.filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(x => x.w < 48 || x.h < 48));
    console.log('trykkflater < 48px på ' + navn + ':', JSON.stringify(sma));
  };
  await sjekkFlater('hjem');
  // Voksenport
  await p.click('[aria-label="For voksne"]');
  const sporsmal = await p.textContent('.underhilsen');
  const [a, bb] = sporsmal.match(/(\d+) × (\d+)/).slice(1).map(Number);
  for (const c of String(a * bb)) await p.click(`.tallplate >> text="${c}"`);
  await p.click('.tallplate >> text=OK');
  await p.waitForSelector('text=Ta vare på fremdriften');
  await sjekkFlater('voksen');
  await p.screenshot({ path: UT + 'voksen.png', fullPage: true });
  // Eksport -> import rundtur
  const kode = await p.evaluate(async () => { const m = await import('./js/lagring.js'); const t = await import('./js/tilstand.js'); t.app.data.profiler[0].stjerner = 42; t.lagreData(); return m.eksportKode(t.app.data); });
  await p.evaluate(() => { localStorage.clear(); });
  await p.reload(); await p.waitForSelector('.tekstfelt');
  await p.fill('.tekstfelt', 'X'); await p.click('.verdenkort.tema-scene'); await p.click('text=Ferdig');
  await p.click('[aria-label="For voksne"]');
  const s2 = await p.textContent('.underhilsen'); const [x, y] = s2.match(/(\d+) × (\d+)/).slice(1).map(Number);
  for (const c of String(x * y)) await p.click(`.tallplate >> text="${c}"`);
  await p.click('.tallplate >> text=OK');
  await p.fill('.kodefelt[placeholder]', kode);
  await p.click('text=Hent fra kode');
  await p.click('.dialog button:text-is("Erstatt")');
  await sleep(300);
  await p.screenshot({ path: UT + 'etter-import.png' });
  const etter = await p.evaluate(() => JSON.parse(localStorage.getItem('engelsk-app')).profiler.map(q => q.navn + ':' + q.stjerner));
  console.log('etter import:', etter);
  // Offline
  await p.goto((process.env.ADRESSE || 'http://localhost:8080') + '/');
  await p.evaluate(() => navigator.serviceWorker.ready);
  await sleep(500);
  await ctx.setOffline(true);
  await p.reload();
  await p.waitForSelector('.startknapp, .profilkort', { timeout: 10000 });
  console.log('offline: appen starter ✓');
  await ctx.setOffline(false);
  // Oppdatering
  const orig = fs.readFileSync(SW, 'utf8');
  fs.writeFileSync(SW, orig.replace(/VERSJON = '[^']+'/, "VERSJON = 'test-ny'"));
  try {
    await p.reload();
    await p.evaluate(() => navigator.serviceWorker.getRegistration().then(r => r.update()));
    await p.waitForSelector('.toast.klikkbar:not([hidden])', { timeout: 10000 });
    await p.screenshot({ path: UT + 'oppdatering.png' });
    await p.click('.toast');
    await p.waitForLoadState('load'); await sleep(1500);
    const v = await p.evaluate(() => new Promise(res => { const c = new MessageChannel(); c.port1.onmessage = e => res(e.data.versjon); navigator.serviceWorker.controller.postMessage('versjon', [c.port2]); }));
    console.log('versjon etter oppdatering:', v);
  } finally { fs.writeFileSync(SW, orig); }
  console.log('feil:', feil);
  await b.close();
})();
