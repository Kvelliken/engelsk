"""Lager ferdige lydfiler for alle ord, ordbrikker og setninger i appen.

Bruker Kokoro (https://github.com/thewh1teagle/kokoro-onnx, Apache 2.0), en
naturlig stemmemodell som kjører lokalt. iPadens egen tekst-til-tale brukes
bare som reserve når en lydfil mangler.

Oppsett (én gang):
    python3 -m venv .tts && .tts/bin/pip install kokoro-onnx soundfile
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Kjør (krever ffmpeg):
    .tts/bin/python verktoy/lag-lyd.py --modell kokoro-v1.0.int8.onnx --stemmer voices-v1.0.bin

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
STEMME = "af_heart"
SPRAAK = "en-us"
# Kokoro blir utydelig i starten av ord når den selv senker farten, så vi lager
# lyden i normalt tempo og senker farten etterpå med ffmpeg (tonehøyden beholdes).
TEMPO_ORD = 0.85
TEMPO_SETNING = 0.9

# Tekster som appen sier i tillegg til ord og setninger.
EKSTRA = ["Hello! I like pizza. I see a cat."]


def lydnokkel(tekst):
    """Samme regel som lydNokkel() i js/lyd.js."""
    t = re.sub(r"[^a-z0-9]+", "-", tekst.lower()).strip("-")
    return t[:80]


def lag_setning(ramme, ord):
    ut = []
    for t in ramme["mal"]:
        if t == "{art}":
            ut.append(ord["art"])
        elif t == "{ord}":
            ut.append(ord["en"])
        elif t == "{liker}":
            ut.append(ord["liker"])
        else:
            ut.append(t)
    return ut


def alle_tekster():
    ord_liste = json.loads((ROT / "data" / "ord.json").read_text())
    rammer = json.loads((ROT / "data" / "rammer.json").read_text())
    ord_map = {o["id"]: o for o in ord_liste}
    enkle, setninger = set(), set()
    for o in ord_liste:
        enkle.add(o["en"])
    for r in rammer:
        for oid in r["ord"]:
            brikker = lag_setning(r, ord_map[oid])
            enkle.update(brikker)  # brikkene sies når de legges i luka
            setninger.add(" ".join(brikker))
    setninger.update(EKSTRA)
    return sorted(enkle), sorted(setninger)


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
    enkle, setninger = alle_tekster()
    oppslag = {}
    nye = 0
    for tekst, tempo in [(t, TEMPO_ORD) for t in enkle] + [(t, TEMPO_SETNING) for t in setninger]:
        nokkel = lydnokkel(tekst)
        if not nokkel or nokkel in oppslag:
            continue
        oppslag[nokkel] = tekst
        mp3 = LYD / (nokkel + ".mp3")
        if mp3.exists() and not a.alle:
            continue
        uttale = tekst if re.search(r"[.!?]$", tekst) else tekst + "."
        samples, rate = kokoro.create(uttale, voice=STEMME, speed=1.0, lang=SPRAAK)
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
            sf.write(wav.name, samples, rate)
            # Fjern stillhet på slutten (ikke i starten: det kan klippe svake lyder som f og h), jevn ut lydstyrken, mono 48 kbit/s.
            subprocess.run([
                "ffmpeg", "-loglevel", "error", "-y", "-i", wav.name,
                "-af", "areverse,"
                       "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                       f"atempo={tempo},adelay=60,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5",
                "-ar", "24000", "-ac", "1", "-b:a", "48k", str(mp3),
            ], check=True)
        nye += 1
        print("laget", mp3.name)

    # Fjern filer som ikke lenger brukes.
    for f in LYD.glob("*.mp3"):
        if f.stem not in oppslag:
            f.unlink()
            print("fjernet", f.name)

    (ROT / "data" / "lyd.json").write_text(json.dumps({
        "stemme": "Kokoro " + STEMME,
        "filer": sorted(oppslag),
    }, ensure_ascii=False, indent=0) + "\n")
    print(f"{nye} nye filer, {len(oppslag)} totalt")


if __name__ == "__main__":
    main()
