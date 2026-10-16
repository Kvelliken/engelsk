"""Lager app-ikonene (PNG) fra et pikselrutenett. Kjøres bare når ikonet endres:

    python3 verktoy/lag-ikoner.py

Krever Pillow. Resultatet ligger i assets/ikoner/ og committes.
"""
from pathlib import Path
from PIL import Image, ImageDraw

RUTENETT = [
    "................",
    "................",
    "..WWWWWWWWWWWW..",
    ".WWWWWWWWWWWWWW.",
    ".WWKWWKWWKWWKWW.",
    ".WWKWWKWWWWWKWW.",
    ".WWKKKKWWKWWKWW.",
    ".WWKWWKWWKWWKWW.",
    ".WWKWWKWWKWWWWW.",
    ".WWKWWKWWKWWKWW.",
    ".WWWWWWWWWWWWWW.",
    "..WWWWWWWWWWWW..",
    "....WWW.........",
    "...WW...........",
    "GGGGGGGGGGGGGGGG",
    "DDDDDDDDDDDDDDDD",
]
FARGER = {
    ".": (58, 160, 232),
    "W": (255, 255, 255),
    "K": (30, 58, 95),
    "G": (91, 191, 74),
    "D": (138, 90, 50),
}
UT = Path(__file__).resolve().parent.parent / "assets" / "ikoner"


def tegn(storrelse, marg=0.0):
    bilde = Image.new("RGB", (storrelse, storrelse), FARGER["."])
    d = ImageDraw.Draw(bilde)
    start = storrelse * marg
    piksel = (storrelse - 2 * start) / len(RUTENETT)
    for r, rad in enumerate(RUTENETT):
        for k, tegnet in enumerate(rad):
            if tegnet == ".":
                continue
            x0 = round(start + k * piksel)
            y0 = round(start + r * piksel)
            x1 = round(start + (k + 1) * piksel) - 1
            y1 = round(start + (r + 1) * piksel) - 1
            d.rectangle([x0, y0, x1, y1], fill=FARGER[tegnet])
    # Gress og jord helt ut til kantene, også med marg
    if marg:
        bunn = round(start + 14 * piksel)
        d.rectangle([0, bunn, storrelse, round(start + 15 * piksel) - 1], fill=FARGER["G"])
        d.rectangle([0, round(start + 15 * piksel), storrelse, storrelse], fill=FARGER["D"])
    return bilde


def main():
    UT.mkdir(parents=True, exist_ok=True)
    for s in (180, 192, 512):
        tegn(s).save(UT / f"ikon-{s}.png")
    tegn(512, marg=0.1).save(UT / "ikon-maskable-512.png")
    print("Ikoner lagret i", UT)


if __name__ == "__main__":
    main()
