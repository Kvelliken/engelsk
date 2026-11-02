"""Lager ferdige lydfiler for alt appen sier: ord, ordbrikker, setninger,
spørsmål fra figuren og replikker i rollespill.

Bruker Kokoro (https://github.com/thewh1teagle/kokoro-onnx, Apache 2.0), en
naturlig stemmemodell som kjører lokalt. iPadens egen tekst-til-tale brukes
bare som reserve når en lydfil mangler.

Oppsett (én gang):
    python3 -m venv .tts && .tts/bin/pip install kokoro-onnx soundfile
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Kjør (krever ffmpeg):
    .tts/bin/python verktoy/lag-lyd.py --modell kokoro-v1.0.int8.onnx --stemmer voices-v1.0.bin

Tekstene hentes fra verktoy/tekster.mjs (krever node), som bruker samme
setningskode som appen. Fasit-stemmen sier ord og setninger; figuren (Pip og
rollene i rollespill) har en egen stemme, med «f-» foran filnavnet.

Bare nye tekster lages; bruk --alle for å lage alt på nytt (f.eks. ny stemme).
Resultat: assets/lyd/*.mp3 og data/lyd.json (lista appen og service workeren bruker).
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
LYD = ROT / "assets" / "lyd"
STEMME = "af_heart"        # fasit: ord, setninger, barnets replikker
FIGURSTEMME = "am_michael"  # figuren som spør og svarer
SPRAAK = "en-us"
# Kokoro blir utydelig i starten av ord når den selv senker farten, så vi lager
# lyden i normalt tempo og senker farten etterpå med ffmpeg (tonehøyden beholdes).
TEMPO_ORD = 0.85
TEMPO_SETNING = 0.9

def lydnokkel(tekst):
    """Samme regel som lydNokkel() i js/lyd.js."""
    t = re.sub(r"[^a-z0-9]+", "-", tekst.lower()).strip("-")
    return t[:80]


def alle_tekster():
    ut = subprocess.run(["node", str(ROT / "verktoy" / "tekster.mjs")], check=True, capture_output=True, text=True).stdout
    return json.loads(ut)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--modell", required=True)
    p.add_argument("--stemmer", required=True)
    p.add_argument("--alle", action="store_true", help="lag alle filene på nytt")
    a = p.parse_args()

    import soundfile as sf
    from kokoro_onnx import Kokoro

    kokoro = Kokoro(a.modell, a.stemmer)
    LYD.mkdir(parents=True, exist_ok=True)
    tekster = alle_tekster()
    jobber = [(t, STEMME, "") for t in tekster["modell"]] + [(t, FIGURSTEMME, "f-") for t in tekster["figur"]]
    oppslag = {}
    nye = 0
    for tekst, stemme, prefiks in jobber:
        nokkel = prefiks + lydnokkel(tekst)
        if not lydnokkel(tekst) or nokkel in oppslag:
            continue
        oppslag[nokkel] = tekst
        mp3 = LYD / (nokkel + ".mp3")
        if mp3.exists() and not a.alle:
            continue
        tempo = TEMPO_ORD if " " not in tekst.strip() else TEMPO_SETNING
        uttale = tekst if re.search(r"[.!?]$", tekst) else tekst + "."
        samples, rate = kokoro.create(uttale, voice=stemme, speed=1.0, lang=SPRAAK)
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
            sf.write(wav.name, samples, rate)
            # Fjern stillhet på slutten (ikke i starten: det kan klippe svake lyder som f og h),
            # senk farten, jevn ut lydstyrken, mono 48 kbit/s.
            subprocess.run([
                "ffmpeg", "-loglevel", "error", "-y", "-i", wav.name,
                "-af", "areverse,"
                       "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                       f"atempo={tempo},adelay=60,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5",
                "-ar", "24000", "-ac", "1", "-b:a", "48k", str(mp3),
            ], check=True)
        nye += 1
        if nye % 50 == 0:
            print(nye, "laget …", flush=True)

    # Fjern filer som ikke lenger brukes.
    for f in LYD.glob("*.mp3"):
        if f.stem not in oppslag:
            f.unlink()
            print("fjernet", f.name)

    (ROT / "data" / "lyd.json").write_text(json.dumps({
        "stemme": "Kokoro " + STEMME + " / figur " + FIGURSTEMME,
        "filer": sorted(oppslag),
    }, ensure_ascii=False, indent=0) + "\n")
    print(f"{nye} nye filer, {len(oppslag)} totalt")


if __name__ == "__main__":
    main()
