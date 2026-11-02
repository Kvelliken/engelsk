# Engelsk

En nettapp (PWA) for at to barn skal lære engelsk med bilder, lyd og setninger, ca. 10 minutter om dagen. Se [SPEC.md](SPEC.md) for hele spesifikasjonen.

**Status: Fase 1 og nivå 1–6**
- To (opptil fire) profiler, hver med egen verden: 🧱 Byggeverden eller 🎭 Scenen
- 207 ord i 13 temaer pluss 21 småord, fordelt på 6 nivåer med ett nytt språksteg hvert:

| Nivå | Tittel | Barnet lærer å si | Temaer |
|---|---|---|---|
| 1 | Første ord | *I see a cat. I like pizza.* | Dyr, Mat og drikke, Farger og tall |
| 2 | Meg selv | *I am happy. I have a dog.* | Blokkverden, Dans og følelser |
| 3 | Jeg kan og jeg vil | *I can swim. I want a bike. Can I have an apple, please?* | Ting jeg kan, Fotball og bandy, Leker |
| 4 | Hvor er den? | *This is my hat. Where is my cap? It is under the bed.* | Hjemme, Klær |
| 5 | Hvor mange og hvordan? | *I see three cats. I see a big dog. The soup is hot.* | Hvordan er det?, Kjøretøy |
| 6 | Hva gjør du? | *I am running. The dragon is flying.* | Eventyr og teater, Hva gjør du? |

- Neste nivå åpnes når ¾ av bildeordene i nivået har ★, eller når barnet består **🏆 Test deg ut**. En voksen kan også åpne et nivå i voksenvisningen.
- Aktiviteter: *Se og hør*, *Lytt og trykk*, *Si det høyt* (opptak mot fasit), *Setningsbygger* (trykk eller dra), og for å trene på å snakke: **💬 Snakk med Pip** (figuren spør, barnet svarer med en hel setning), **🖼️ Beskriv bildet** og **🎭 Rollespill** (9 små dialoger, med «bytt roller»)
- Dagens økt blander nye ord, repetisjon, setninger og snakking. **Snakk med Pip** på hjemskjermen gir en kort økt med bare snakking
- Spredt repetisjon, stjerner, merker og konfetti
- Voksenvisning (bak et regnestykke) med fremdrift, eksport/import, profiler og valg av stemme
- Virker uten nett, ingen sporing og ingen tredjeparter

## Publisere på GitHub Pages (én gang)

1. Flett arbeidsgrenen inn i `main`.
2. Gå til **Settings → Pages** i repoet.
3. Under *Build and deployment*: velg **Deploy from a branch**, branch **main** og mappe **/ (root)**. Trykk **Save**.
4. Etter et minutt eller to ligger appen på `https://<brukernavn>.github.io/engelsk/`.

Appen bruker bare relative stier og har ikke noe byggesteg, så den virker direkte fra repoets rot.

## Installere på iPaden

1. Åpne adressen over i **Safari** (ikke Chrome).
2. Trykk **Del** (firkanten med pil) → **Legg til på Hjem-skjerm** → **Legg til**.
3. Åpne appen fra hjemskjermen. Første gang må iPaden være på nett, deretter virker appen uten nett.

**Tips:**
- **Stemme:** alle ord og setninger har ferdige lydfiler med en tydelig stemme (Kokoro, se under). iPadens egen stemme brukes bare som reserve hvis en lydfil mangler.
- **Mikrofon:** første gang barnet trykker 🎙️, viser appen en forklaring, og så spør iPaden om lov. En voksen trykker *Tillat*. Har dere trykket *Ikke tillat*: Innstillinger → Safari → Mikrofon, og deretter «Spør på nytt» i voksenvisningen.
- **Lyd:** sjekk at sideknappen/lydløs-modus ikke er på hvis det ikke kommer lyd.

## Slik tester du på iPaden

### Milepæl 1: Skjelett
- [ ] Appen kan legges til på Hjem-skjerm og åpnes uten Safari-menyer
- [ ] Lag to profiler med hver sin verden. Farger og pynt skifter (gress nederst / sceneteppe øverst)
- [ ] Bytt profil med navneknappen øverst til venstre
- [ ] Snu iPaden: alt skal se riktig ut både stående og liggende
- [ ] Slå på flymodus, lukk appen helt (sveip opp) og åpne den igjen: appen skal starte

### Milepæl 2: Aktiviteter og økter
- [ ] **Start dagens økt**: ordet sies høyt med en gang på *Se og hør* (første trykk «låser opp» lyden på iOS)
- [ ] *Lytt og trykk*: feil bilde blir grått og ordet sies igjen; etter to bom lyser riktig bilde svakt
- [ ] *Si det høyt*: forklaringen om mikrofonen vises én gang. Ta opp, hør deg selv og så fasit
- [ ] *Setningsbygger*: trykk på en brikke, eller dra den til luken. Setningen leses opp når den er riktig
- [ ] Økten slutter etter 12–15 oppgaver med merke, stjerner og «vi ses i morgen»
- [ ] ✕ midt i en økt spør om du vil stoppe; det du har lært, er lagret
- [ ] Trykk på et tema-kort for å øve på bare det temaet
- [ ] **Mine ord og merker** viser ordene med 0–3 stjerner; trykk på et ord for å høre det

### Milepæl 3: Voksenvisning
- [ ] ⚙️ → regnestykket slipper deg inn
- [ ] **Lagre som fil** åpner Del-arket (lagre i Filer). **Kopier kode** legger en kode på utklippstavlen
- [ ] **Hent fremdrift**: lim inn koden eller velg filen, og fremdriften kommer tilbake
- [ ] Velg stemme og tempo, og trykk 🔊 Test

### Milepæl 4: Nivåer og snakking
- [ ] Hjemskjermen viser **Nivåene dine**. Barn som har vært gjennom alt fra før, skal ha nivå 1–2 ✓ og stå på nivå 3
- [ ] Trykk på et låst nivå: en melding forteller hva som skal til for å åpne det
- [ ] Trykk på et åpent nivå: «Dette lærer du å si» (trykk for å høre), *Øv på nivået*, *Test deg ut*, rollespill og temaer
- [ ] **Snakk med Pip**: figuren spør med egen stemme. Velg et bilde (eller trykk 💡 Vis svaret), si setningen høyt og trykk «Jeg svarte!»
- [ ] **Beskriv bildet**: si det du ser, og trykk 💡 Hjelp for å høre setningene
- [ ] **Rollespill**: figuren sier sine replikker, barnet sier sine. Til slutt kan rollene byttes
- [ ] **Test deg ut**: 8 korte oppgaver. Klarer barnet nesten alle, åpnes neste nivå med feiring

### Oppdateringer
Når en ny versjon er publisert, vises **«Ny versjon klar! Trykk her for å oppdatere»** nederst neste gang appen åpnes (med nett). Trykk på meldingen.

## For utviklere

Ingen avhengigheter og ingen byggesteg: vanlig JavaScript (ES-moduler) som virker i Safari 15 og nyere.

```
index.html, manifest.webmanifest, sw.js
css/app.css
js/app.js            oppstart
js/tilstand.js       felles tilstand
js/lagring.js        localStorage, eksport/import
js/srs.js            spredt repetisjon (Leitner-bokser)
js/okt.js            setter sammen og kjører økter (dagens økt, snakkeøkt, rollespill, Test deg ut)
js/nivaa.js          nivåer og opplåsing
js/setninger.js      setningsrammer med luker
js/aktiviteter/      se-og-hor, lytt-og-trykk, si-det-hoyt, setningsbygger, samtale, beskriv, rollespill
js/scene.js          bildescener (svarbilder og «beskriv bildet»)
js/lyd.js, opptak.js tale, effekter og lydopptak
js/bilder.js         all grafikk (pikselkunst, SVG, emoji)
data/                ord.json, rammer.json, temaer.json, nivaaer.json, samtaler.json, dialoger.json, lyd.json
verktoy/             sjekk-, simulerings- og testskript (ikke en del av appen)
```

**Kjøre lokalt:** `npx http-server -p 8080 -c-1 .` og åpne http://localhost:8080.

**Før hver commit:**
1. `node verktoy/sjekk.mjs` sjekker ordlisten, rammene, at alle filer står i cache-listen i `sw.js`, og at det ikke finnes eksterne adresser.
2. Bytt `VERSJON` øverst i `sw.js` (f.eks. `2026-10-17.1`), ellers får ikke iPaden oppdateringen.

**Nettlesertester** (krever Playwright og lokal server): `node verktoy/test-okt.cjs Ola blokk` kjører en hel økt, og `node verktoy/test-aksept.cjs` sjekker trykkflater, eksport/import, offline-start og oppdatering. `node verktoy/test-nivaa.cjs scene 6` tester nivåsti, snakkeøkt, rollespill, Test deg ut og dagens økt for en profil på nivå 6. `node verktoy/simuler.mjs 70 scene` simulerer ti uker med økter og viser når nivåene åpnes.

### Legge til ord
Legg til en linje i `data/ord.json`:

```json
{ "id": "car", "en": "car", "norsk": "bil", "tema": "hjemme", "frekvensrang": 95, "bilde": "emoji:🚗",
  "lyd": null, "nivå": 2, "ordklasse": "substantiv", "art": "a", "liker": "cars" }
```

- `bilde`: `emoji:🚗`, `farge:#e53935`, `tall:3`, `piksel:<navn>` eller `svg:<navn>` (de to siste tegnes i `js/bilder.js`)
- `art` (a/an) trengs for `I see a` / `I have a`; `liker` er formen i `I like ___` (cars, pizza, dancing)
- Ta med ordet i lukene (`slots`) til rammene det passer i (`data/rammer.json`). En ramme som `["I", "see", "{tall}", "{ord.flertall}"]` har lukene `tall` og `ord`; `{ord.flertall}` betyr flertallsformen (`flertall`), `{ord.art}` artikkelen og `{verb.ing}` `ing`-formen
- Temaet bestemmer nivået (`nivaa` i `data/temaer.json`), og `data/nivaaer.json` sier hvilke temaer og rammer hvert nivå har
- Nye spørsmål til Pip legges i `data/samtaler.json`, nye rollespill i `data/dialoger.json`
- `lyd`: (valgfritt) sti til en egen innspilt lydfil, f.eks. `./assets/egen-lyd/car.mp3`
- Nytt tema: legg det til i `data/temaer.json`
- Lag lydfiler for nye ord og setninger (se under). Uten lydfil brukes iPadens stemme.

### Lydfiler
Ord, ordbrikker, setninger, figurens spørsmål og replikkene i rollespill spilles fra `assets/lyd/*.mp3` (ca. 1000 filer, ca. 8 MB). Fasit-stemmen er `af_heart`, figuren har en egen stemme (`am_michael`, filer med «f-» foran). Filene er laget med stemmemodellen [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (Apache 2.0, kjører lokalt). `data/lyd.json` lister filene, og service workeren lagrer dem for bruk uten nett. Etter at du har lagt til ord eller rammer:

```
python3 -m venv .tts && .tts/bin/pip install kokoro-onnx soundfile      # én gang
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
.tts/bin/python verktoy/lag-lyd.py --modell kokoro-v1.0.int8.onnx --stemmer voices-v1.0.bin
```

Tekstene hentes fra `verktoy/tekster.mjs`, som bruker samme setningskode som appen. Bare nye tekster lages. Stemmen (`STEMME`) og tempoet står øverst i skriptet; bruk `--alle` for å lage alt på nytt. `node verktoy/sjekk.mjs` sier fra om tekster som mangler lydfil.

## Personvern
Ingen innlogging, ingen sporing, ingen analyse, ingen eksterne lenker og ingen tredjepartsskript. En Content-Security-Policy i `index.html` stopper alle nettverkskall til andre domener. Alt lagres lokalt på iPaden. Lydopptak lagres ikke, de forsvinner når oppgaven er ferdig.
