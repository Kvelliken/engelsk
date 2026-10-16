# SPEC: Engelsk-appen for barna (nettapp / PWA)

> Dette dokumentet beskriver hva som skal bygges. Det er skrevet for å gis til Claude Code i et tomt GitHub-repo. Del 9 er en ferdig startinstruksjon.

## 1. Mål
To barn skal lære mest mulig engelsk på kortest mulig tid, ha det gøy, og tørre å snakke.

- **Hovedmål:** klare å lage og si enkle setninger, og tørre å snakke høyt.
- **Hovedprinsipp:** mest brukte ord først, og setningsrammer («chunks») fra dag én.
- **Rammer:** maks 10 minutter per barn per dag. En voksen er med omtrent 2 ganger i uka.

## 2. Brukere
| | Barn A | Barn B |
|---|---|---|
| Alder | 7 | 9 |
| Engelsk nå | nesten nybegynner | noe ordforråd, klarer ikke lage setninger |
| Interesser | gaming (blokkverden-bygging), fotball, bandy | dans, drama/teater |
| Norsk | leser flytende, men **enkle norske ord** i alt brukergrensesnitt | leser flytende |

Det finnes også en **voksenrolle** (forelder) som spiller sammen med barna i «Slå en voksen»-modus.

Appens eget grensesnitt (knapper, instruksjoner) skal være på **enkelt norsk** for barn A. All øvingsinnhold skal være på engelsk. Norsk oversettelse vises bare ved behov (trykk på «?»).

## 3. Plattform og tekniske rammer
- **Nettapp (PWA)** hostet på **GitHub Pages**, installert via Safari → Del → «Legg til på Hjem-skjerm».
- **Målenhet: iPad (2021, 9. generasjon).** Skjerm ca. 10,2" (810 × 1080 pt portrett, brukes i begge retninger). Bruk konservativ JavaScript som fungerer i Safari 15 eller nyere, og unngå helt nye nettleser-API-er uten fallback.
- **Ingen byggesteg som krever Mac.** Foretrekk vanilla JS (ES-moduler) eller et lite rammeverk uten tung toolchain. Alt skal kunne deles fra repoets rot. Bruk **relative stier** (`./`), siden siden ligger under `/<repo-navn>/`.
- **Offline:** service worker som cacher alt, med versjonert cache-nøkkel slik at oppdateringer kommer frem. Vis en liten «ny versjon klar, trykk for å oppdatere»-melding.
- **Lagring:** `localStorage`/IndexedDB per profil. Bygg inn **eksport/import av fremdrift** (fil eller kopier/lim-inn-kode), fordi iOS kan slette lokal data hvis appen ikke brukes på en stund.
- **Ingen innlogging, ingen sporing, ingen tredjepartsskript, ingen analyse, ingen eksterne lenker.** Dette er en barneapp.
- **Lyd:**
  - Avspilling: ferdige lydfiler hvis de finnes, ellers `speechSynthesis` med engelsk stemme som reserve.
  - Husk at iOS krever en brukerhandling (trykk) før lyd kan starte.
  - Innspilling («si det høyt»): `MediaRecorder` hvis støttet i Safari-versjonen, ellers `getUserMedia` + Web Audio-fallback. Barnet hører sin egen innspilling opp mot fasit. **Ikke avhengig av talegjenkjenning** (upålitelig i PWA på iOS). Kan testes som valgfri bonus, men skal aldri være påkrevd.
  - Be om mikrofontilgang på en rolig, tydelig måte første gang, forklart av en voksen.
- **Grafikk:** alt tegnes som SVG/CSS/emoji. **Ingen opphavsrettsbeskyttede figurer eller varemerker** (ikke bruk Minecraft-navn eller -figurer, ikke klubblogoer eller lag-/spillernavn). Lag egne originale figurer i samme *stil* (blokk/pikselkunst).
- **Tilgjengelighet/touch:** minst 48 px trykkflater, ingen hover-avhengighet, ingen avhengighet av dobbelttrykk eller langt trykk, støtt både stående og liggende.

## 4. Læringsdesign

### 4.1 Prinsipper
- **Konkret før abstrakt:** bilde + lyd først, tekst sist.
- **Tre-trinn (Montessori):** (1) *Se og hør*, (2) *Vis meg* (gjenkjenn), (3) *Si det selv*.
- **Barnet velger selv** hvilken øy/aktivitet det vil gjøre (fritt valg), men appen anbefaler et «neste stopp».
- **Kontroll av feil:** feil gir rolig, nøytral tilbakemelding og nytt forsøk. Ingen straff, ingen «game over», ingen poengtrekk. Barnet skal se selv hva som er riktig.
- **Spredt repetisjon:** Leitner-/SM-2-lignende system. Ord som sitter kommer sjeldnere, ord som glipper kommer oftere.
- **Frekvens først:** ordforrådet bygges på de mest brukte ordene (se 5).
- **Setningsrammer tidlig:** `I like ___`, `I have a ___`, `I see a ___`, `Can I have ___?`, `I want ___`, `This is my ___`, `I can ___`, `Where is the ___?`.
- **Økt:** én økt = ca. 10 minutter = 12–15 korte oppgaver. Appen foreslår slutt på en positiv note etter en økt og blir ikke «endeløs».

### 4.2 Nivåhopp
- **Plasseringstest** første gang: starter lett og går raskt oppover til barnet bommer, og setter startnivå per tema. Kan hoppes over av en voksen.
- **Kart med åpne øyer:** alle områder kan åpnes fra start.
- **«Test deg ut»** på hver øy: en kort test. Klarer barnet den, markeres øya som mestret og barnet hopper videre, og ordene legges i repetisjonssystemet.
- Hvert barn har **egen profil, eget kart og egen fremdrift.**

### 4.3 Aktivitetstyper (stigende vanskelighet)
1. **Lytt og trykk:** hør ordet, velg riktig bilde av 3–4.
2. **Si det høyt:** vis bilde, barnet sier ordet og spiller av egen innspilling mot fasit.
3. **Ordkamp/match:** raske, enkle matchespill (bilde ↔ lyd ↔ ord).
4. **Setningsbygger:** dra ordbrikker inn i en ramme. Setningen leses opp når den er riktig.
5. **Bytt ut et ord:** rammen er gitt, barnet velger nytt ord og sier hele setningen høyt.
6. **Snakke med en figur:** figuren spør et enkelt spørsmål (`What do you like?`), og barnet velger eller sier svar fra en rammesetning.
7. **Rollespill/replikker** (særlig barn B): små dialoger med to roller der barnet spiller den ene og figuren den andre.

## 5. Innhold
### 5.1 Ordliste
- Start med **ca. 150 ord** (utvides senere til 300–500), valgt på frekvens for barn.
- Lagres som data (JSON), **ikke hardkodet i koden**, slik at det er lett å legge til ord.
- Hvert ord: `id`, `en`, `norsk` (enkelt), `tema`, `frekvensrang`, `bilde` (SVG/emoji-nøkkel), `lyd` (valgfri filsti), `nivå`, `ordklasse`.
- **Funksjonsord må være med tidlig** (I, you, a, the, is, have, like, want, can, go, this, my, it, yes, no, please, thanks), siden de gjør setninger mulige.
- Temaer (felles): dyr, mat og drikke, farger, tall, kropp, familie, hjemme, skole, klær, verb i hverdagen.
- **Temaer for barn A:** blokkverden (bygge, grave, hus, tre, stein, vann, natt/dag), fotball, bandy.
- **Temaer for barn B:** dans (move, jump, spin, fast, slow, music), drama og følelser (happy, sad, angry, scared, surprised), rollespill-fraser.
- Hver tema-øy har ordlista sin pluss 2–3 setningsrammer som passer temaet.

### 5.2 Setninger
- Samlet `rammer.json` med rammer, lovlige ord per slot og eksempler. Rammer introduseres gradvis.
- Mål for barn B: raskt komme fra enkeltord til 3–5-ords setninger.
- Mål for barn A: først ord og `I see a ___`, deretter `I like ___` og `I have a ___`.

## 6. Gamification (støtter læringen, dominerer ikke)
- **Hver profil har en maskot/figur** som vokser og får utstyr når barnet lærer. Barn A: blokkverden-bygger og «bygg basen din». Barn B: scene, kostymer og kulisser.
- **Samleobjekter** (stjerner, klistremerker, byggeklosser/kulisser) for gjennomførte økter og mestrede ord.
- **Mestringsstjerner per ord** (0–3) som viser hvor godt ordet sitter.
- **Milde streaks:** «3 dager på rad». Aldri skam eller tap ved en tapt dag. Vis heller «velkommen tilbake».
- **Ingen konkurranse mellom søsknene.** Fremdrift og belønninger er personlige.
- **Raske, taktile belønninger** (animasjon, lyd, konfetti) ved mestring.
- **Unngå mørke mønstre:** ingen tidspress som straffer, ingen endeløs scroll, ingen «kjøp»-triks, ingen push-varsler.

## 7. «Slå en voksen» (2 ganger i uka)
Dette er en egen modus der barnet skal føle mestring ved å **teste og «ta» en voksen**.

- Barnet starter modusen, og en voksen setter seg ved siden av.
- **Barnet er sjefen/dommeren:** appen gir barnet en fasit og en jury-rolle. Barnet stiller spørsmål, og den voksne svarer høyt på engelsk. Barnet trykker «riktig»/«prøv igjen».
- **Utfordringsformater (roter mellom dem):**
  - *Bilde-quiz:* barnet viser bilde, den voksne må si ordet.
  - *Setningsduell:* barnet sier en rammesetning, den voksne må si en ny med et annet ord.
  - *Skjult ord:* den voksne får bare beskrivelse/lyd, barnet vet svaret.
  - *Oppdrag:* «Få den voksne til å si 5 setninger på engelsk på 2 minutter».
- **Voksenhandikap** (justerbart): kortere tid, må svare uten å se bildet, må svare på engelsk bare, må unngå norske ord.
- Barnet får poeng når det **lærer den voksne noe** («Teach me a word!»).
- Barnet får en «Voksen slått!»-belønning og samlerobjekt. Resultater ligger i barnets egen profil, ikke som en offentlig rangering.
- Modus kan også spilles med en søsken som «voksen» etter at foreldrene har vist vei.

## 8. Design
- **Rolig, men levende:** lys bakgrunn, få sterke aksentfarger, store runde former, tydelig kontrast.
- **To visuelle temaer** (valgbare per profil, og med felles grunndesign):
  - *Barn A:* blokk-/pikselstil, bygge- og spillfølelse (originale blokkfigurer).
  - *Barn B:* scene-/teaterstil med gardiner, spotlight og kostymer.
- **Typografi:** avrundet, svært lesbar sans-serif, stor størrelse. Bruk systemfonter eller selvhostede fonter (ingen eksterne CDN-er).
- **Layout:** én hovedhandling per skjerm, store ikoner med tekst, tydelig «tilbake» og «ferdig».
- **Animasjon:** korte, myke og med mening. Respekter `prefers-reduced-motion`.
- **Lyd:** av/på-knapp i hjørnet, lav standardvolum for effekter.
- **Voksenvisning** (bak en enkel «voksenport», f.eks. et regnestykke): eksport/import av data, tilbakestilling av profil, justering av voksenhandikap, og en enkel fremdriftsoversikt.

## 9. Faser og akseptkriterier
### Fase 1: MVP (første leveranse)
- Installerbar PWA som fungerer offline på iPad (2021).
- To profiler (navn og tema valgbart).
- ~100 ord, 5 temaer, setningsrammer: `I see a ___`, `I like ___`, `I have a ___`.
- Aktiviteter: *Lytt og trykk*, *Si det høyt* (med innspilling og avspilling), *Setningsbygger*.
- Spredt repetisjon, daglig 10-minuttersøkt, enkle belønninger.
- Eksport/import av fremdrift.
- **Akseptkriterier:** en økt tar ca. 10 min; appen starter uten nett; ingen nettverkskall til tredjeparter; fungerer stående og liggende; alle trykkflater ≥ 48 px.

### Fase 2: Nivåhopp og kart
- Plasseringstest, øykart og «Test deg ut».
- Flere temaer og ordforråd opp mot 300.

### Fase 3: Maskot, samleobjekter og tematisering per barn
- Maskot med utstyr, byggebase (A) og scene/kostymer (B), milde streaks.

### Fase 4: «Slå en voksen»
- Alle utfordringsformater, voksenhandikap, voksenvisning.

### Fase 5: Snakke med figur og rollespill
- Dialoger, replikker, ev. valgfri talegjenkjenning som bonus.

## 10. Repo-struktur (forslag)
```
/index.html
/manifest.webmanifest
/sw.js
/css/
/js/            (moduler: app, profiler, srs, aktiviteter, lyd, lagring)
/data/          (ord.json, rammer.json, temaer.json)
/assets/        (ikoner, svg, lyd)
/README.md
/SPEC.md
```

## 11. Startinstruksjon til Claude Code
> Les `SPEC.md`. Bygg **Fase 1** som en statisk PWA som kan hostes på GitHub Pages (relative stier, ingen byggesteg som krever Mac, ingen tredjeparts-avhengigheter). Lag først en kjørbar skjelett-app (manifest, service worker med versjonert cache, ikoner, to profiler), og kjør den lokalt slik at jeg kan se resultatet. Deretter bygger du aktivitetene én og én. Legg ordlisten i `data/ord.json` (ca. 100 ord, frekvens først), og lag SVG-grafikk selv. Bruk konservativ JavaScript som fungerer i Safari 15 eller nyere. Foreslå hvordan jeg skal teste på iPaden etter hver milepæl, og commit ofte.

## 12. Åpne spørsmål
- Hvilken iPadOS-versjon er installert på iPaden (Innstillinger → Generelt → Om)?
- Skal ferdiginnspilt lyd (f.eks. forelder, eller en engelskspråklig stemme) brukes, eller er innebygd tekst-til-tale godt nok i starten?
- Hva skal maskotene hete og se ut som (barna kan få bestemme)?
