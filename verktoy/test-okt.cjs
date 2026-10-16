// Nettlesertest (utviklerverktøy, ikke en del av appen). Krever Playwright og en lokal server:
//     npx http-server -p 8080 -c-1 .      (i ett vindu)
//     node verktoy/test-okt.cjs [navn] [blokk|scene]
// Skjermbilder lagres i mappen UT (standard: systemets temp-mappe).
const { chromium } = require('playwright');
const UT = (process.env.UT || require('os').tmpdir()) + '/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 810, height: 1080 }, hasTouch: true, permissions: ['microphone'] });
  const p = await ctx.newPage();
  const feil = [], eksterne = [];
  p.on('pageerror', e => feil.push(e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') feil.push(m.text()); });
  p.on('request', r => { if (!r.url().startsWith(process.env.ADRESSE || 'http://localhost:8080') && !r.url().startsWith('blob:')) eksterne.push(r.url()); });
  await p.goto((process.env.ADRESSE || 'http://localhost:8080') + '/');
  await p.fill('.tekstfelt', process.argv[2] || 'Ola');
  await p.click('.verdenkort.tema-' + (process.argv[3] || 'blokk'));
  await p.click('text=Ferdig');
  await p.click('.startknapp');
  const sett = {};
  for (let steg = 0; steg < 40; steg++) {
    await sleep(500);
    if (await p.$('.ferdig-merke')) break;
    const instruks = await p.textContent('.instruks').catch(() => '');
    const type = instruks.includes('Se og hør') ? 'intro' : instruks.includes('Hør og trykk') ? 'lytt' : instruks.includes('Si det') ? 'si' : instruks.includes('Lag') ? 'bygg' : '?';
    const ori = steg % 2 ? 'ligg' : 'staa';
    if (!sett[type + ori]) {
      sett[type + ori] = 1;
      await p.setViewportSize(ori === 'ligg' ? { width: 1080, height: 810 } : { width: 810, height: 1080 });
      await sleep(900);
      await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-' + type + '-' + ori + '.png' });
    }
    console.log(steg, type);
    if (type === 'intro') await p.click('text=Neste ➜');
    else if (type === 'lytt') {
      const kort = await p.$$('.valgkort');
      for (const k of kort) { if (await k.isDisabled()) continue; await k.click(); await sleep(300); if (await p.$('.valgkort.riktig')) break; }
      await p.waitForSelector('.valgkort.riktig', { state: 'detached', timeout: 15000 });
    } else if (type === 'si') {
      await p.click('.opptak-knapp'); await sleep(400); if (await p.$('.dialog')) { await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-mikdialog.png' }); await p.click('.dialog .knapp'); } await sleep(1200); await p.click('.opptak-knapp');
      await sleep(1500);
      await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-si-etter-' + ori + '.png' });
      await p.click('text=Jeg sa det!');
    } else if (type === 'bygg') {
      let forsok = 0;
      while (!(await p.$('text=Neste ➜')) && forsok++ < 10) {
        const brikke = await p.$('.brikkebrett .brikke');
        const luke = await p.$('.luke:empty');
        if (brikke && luke && forsok === 1) { const a = await brikke.boundingBox(), l = await luke.boundingBox(); await p.mouse.move(a.x + a.width/2, a.y + a.height/2); await p.mouse.down(); for (let k = 1; k <= 10; k++) { await p.mouse.move(a.x + a.width/2 + (l.x + l.width/2 - a.x - a.width/2) * k/10, a.y + a.height/2 + (l.y + l.height/2 - a.y - a.height/2) * k/10); } await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-dra.png' }); await p.mouse.up(); } else if (brikke) await brikke.click();
        await sleep(1200);
      }
      await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-bygg-ferdig-' + ori + '.png' });
      await p.click('text=Neste ➜');
    } else { await p.screenshot({ path: UT + 'ukjent.png' }); break; }
  }
  await sleep(800);
  await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-ferdig.png' });
  await p.click('text=Til start');
  await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-hjem-etter.png', fullPage: true });
  await p.click('text=Mine ord');
  await p.screenshot({ path: UT + (process.argv[3]||'blokk') + '-ordliste.png', fullPage: true });
  const data = await p.evaluate(() => localStorage.getItem('engelsk-app'));
  console.log('data', data.slice(0, 600));
  console.log('feil:', feil, 'eksterne:', eksterne);
  await b.close();
})();
