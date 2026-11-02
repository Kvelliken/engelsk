// Nettlesertest for nivåer og snakke-aktiviteter (utviklerverktøy, ikke en del av appen).
// Krever Playwright og en lokal server:
//     npx http-server -p 8080 -c-1 .      (i ett vindu)
//     node verktoy/test-nivaa.cjs [blokk|scene] [nivå]
// Lager en profil som har åpnet et gitt nivå, og kjører snakkeøkt, rollespill,
// «Test deg ut» og dagens økt. Skjermbilder lagres i mappen UT (standard: temp-mappen).
const { chromium } = require('playwright');
const UT = (process.env.UT || require('os').tmpdir()) + '/';
const ADRESSE = process.env.ADRESSE || 'http://localhost:8080';
const TEMA = process.argv[2] || 'scene';
const NIVAA = Number(process.argv[3] || 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 810, height: 1080 }, hasTouch: true, permissions: ['microphone'] });
  const p = await ctx.newPage();
  const feil = [];
  const eksterne = [];
  p.on('pageerror', (e) => feil.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') feil.push(m.text()); });
  p.on('request', (r) => { if (!r.url().startsWith(ADRESSE) && !r.url().startsWith('blob:')) eksterne.push(r.url()); });
  await p.addInitScript(() => {
    window.__tale = [];
    const o = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { if (u.text.trim()) window.__tale.push(u.text); return o(u); };
  });

  await p.goto(ADRESSE + '/');
  await p.fill('.tekstfelt', 'Testbarn');
  await p.click('.verdenkort.tema-' + TEMA);
  await p.click('text=Ferdig');
  await p.waitForSelector('.startknapp');

  // Gi profilen ★ på alle ord i nivåene under NIVAA, så NIVAA er åpent.
  await p.evaluate(async (nivaa) => {
    const t = await import('./js/tilstand.js');
    const n = await import('./js/nivaa.js');
    const prof = t.aktivProfil();
    t.app.ord.forEach((o) => {
      if (n.ordNivaa(o) < nivaa || o.tema === 'smaaord') prof.ord[o.id] = { boks: 3, riktig: 3, feil: 0, neste: '2099-01-01', sist: '2026-01-01' };
    });
    t.lagreData();
  }, NIVAA);
  await p.reload();
  await p.waitForSelector('.nivaakort');
  await p.waitForSelector('.dialog', { timeout: 5000 });
  await p.screenshot({ path: UT + 'n-nytt-nivaa.png' });
  await p.click('.dialog .knapp');
  await p.screenshot({ path: UT + 'n-hjem.png', fullPage: true });
  console.log('åpent nivå:', await p.textContent('.nivaakort.her .nivaa-tittel').catch(() => '?'));

  // Nivåskjerm
  await p.click('.nivaakort.her');
  await p.waitForSelector('.eksempler');
  await p.screenshot({ path: UT + 'n-nivaaskjerm.png', fullPage: true });
  await p.click('.eksempel');
  await p.click('text=← Tilbake');

  const sett = {};
  async function bilde(navn) {
    if (sett[navn]) return;
    sett[navn] = 1;
    await sleep(700);
    await p.screenshot({ path: UT + 'n-' + navn + '.png' });
  }

  async function lukkMikDialog() {
    await sleep(300);
    if (await p.$('.dialog')) await p.click('.dialog .knapp');
  }

  // Spiller gjennom en økt uansett oppgavetype.
  async function kjorOkt(navn) {
    const typer = [];
    for (let steg = 0; steg < 40; steg++) {
      await sleep(500);
      if (await p.$('.ferdig-merke')) break;
      const instruks = await p.textContent('.instruks').catch(() => '');
      let type = '?';
      if (instruks.includes('Se og hør')) type = 'intro';
      else if (instruks.includes('Hør og trykk')) type = 'lytt';
      else if (instruks.includes('Si det')) type = 'si';
      else if (instruks.includes('Lag setningen')) type = 'bygg';
      else if (instruks.includes('Snakk med')) type = 'samtale';
      else if (instruks.includes('Hva ser du')) type = 'beskriv';
      else if (instruks.includes('Rollespill')) type = 'rollespill';
      typer.push(type);
      if (type === 'intro') await p.click('text=Neste ➜');
      else if (type === 'lytt') {
        for (const k of await p.$$('.valgkort')) {
          if (await k.isDisabled()) continue;
          await k.click();
          await sleep(300);
          if (await p.$('.valgkort.riktig')) break;
        }
        await p.waitForSelector('.valgkort.riktig', { state: 'detached', timeout: 15000 });
      } else if (type === 'si') {
        await p.click('text=Jeg sa det!');
      } else if (type === 'bygg') {
        let forsok = 0;
        while (!(await p.$('text=Neste ➜')) && forsok++ < 30) {
          const brikke = await p.$('.brikkebrett .brikke');
          if (brikke) await brikke.click();
          await sleep(900);
        }
        await bilde('bygg-' + navn);
        await p.click('text=Neste ➜');
      } else if (type === 'samtale') {
        const velg = await p.$('.svarvalg');
        if (velg) await velg.click();
        else await p.click('text=💡 Vis svaret');
        await bilde('samtale-' + (velg ? 'velg' : 'vis') + '-' + steg);
        const knapp = await p.$('text=Jeg svarte!');
        await knapp.click();
        await p.waitForFunction((el) => !el.isConnected, knapp, { timeout: 15000 });
      } else if (type === 'beskriv') {
        await p.click('.opptak-knapp');
        await lukkMikDialog();
        await sleep(800);
        await p.click('.opptak-knapp');
        await sleep(2500);
        await bilde('beskriv');
        await p.click('text=👍 Ferdig');
      } else if (type === 'rollespill') {
        let runder = 0;
        while (runder++ < 40) {
          await sleep(600);
          if (await p.$('text=Bytt roller')) {
            await bilde('rollespill-slutt');
            await p.click('text=Ferdig ➜');
            break;
          }
          if (await p.$('.manus-kontroll .svarvalg')) {
            await bilde('rollespill-valg');
            await p.click('.manus-kontroll .svarvalg');
          } else if (await p.$('text=✓ Neste')) {
            await bilde('rollespill-din-tur');
            await p.click('text=✓ Neste');
          }
        }
      } else {
        await p.screenshot({ path: UT + 'n-ukjent.png' });
        throw new Error('Ukjent oppgave: ' + instruks);
      }
    }
    await sleep(800);
    await p.screenshot({ path: UT + 'n-ferdig-' + navn + '.png' });
    const tittel = await p.textContent('.stor-tittel').catch(() => '?');
    await p.click('text=Til start');
    await p.waitForSelector('.nivaakort');
    return { typer, tittel };
  }

  await p.click('.snakkeknapp');
  console.log('snakkeøkt:', JSON.stringify(await kjorOkt('snakk')));

  await p.click('.nivaakort.her');
  await p.click('.temagrid .temakort');
  console.log('rollespill:', JSON.stringify(await kjorOkt('rollespill')));

  await p.click('.nivaakort.her');
  await p.click('text=Test deg ut');
  console.log('test:', JSON.stringify(await kjorOkt('test')));

  await p.click('.startknapp');
  console.log('dagens økt:', JSON.stringify(await kjorOkt('dagens')));

  await p.setViewportSize({ width: 1080, height: 810 });
  await p.screenshot({ path: UT + 'n-hjem-ligg.png', fullPage: true });
  console.log('iPad-stemme brukt for:', JSON.stringify(await p.evaluate(() => window.__tale)));
  console.log('feil:', feil, 'eksterne:', eksterne);
  await b.close();
})();
