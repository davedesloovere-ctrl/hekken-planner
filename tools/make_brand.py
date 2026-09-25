"""Tekent het icoon en logo van de Hekkenplanner (Pillow). Opnieuw draaien na een wijziging."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "custom_components" / "hekken" / "brand"
S = 1024  # tekenen op groot formaat, daarna verkleinen voor zachte randen
TOP, BOTTOM = (33, 150, 243), (13, 71, 161)
WHITE = (255, 255, 255, 255)
AMBER = (255, 193, 7, 255)


def gradient(w, h):
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        c = tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = (*c, 255)
    return img


def icon(size: int) -> Image.Image:
    bg = gradient(S, S)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, S - 1, S - 1), radius=230, fill=255)
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    img.paste(bg, (0, 0), mask)
    d = ImageDraw.Draw(img)

    # grond en palen
    d.rounded_rectangle((120, 770, 904, 800), radius=15, fill=(255, 255, 255, 110))
    d.rounded_rectangle((170, 330, 225, 785), radius=14, fill=WHITE)
    d.rounded_rectangle((800, 330, 855, 785), radius=14, fill=WHITE)
    # schuifhekken
    d.rounded_rectangle((250, 400, 780, 740), radius=22, outline=WHITE, width=34)
    for x in range(335, 720, 78):
        d.rounded_rectangle((x - 12, 410, x + 12, 730), radius=10, fill=WHITE)
    d.rounded_rectangle((260, 556, 770, 584), radius=12, fill=WHITE)
    # wieltjes
    for cx in (320, 710):
        d.ellipse((cx - 26, 748, cx + 26, 800), fill=WHITE)
    # waarschuwingslampje op de linkerpaal
    d.ellipse((160, 255, 235, 330), fill=AMBER)

    # klokje rechtsboven: de planning
    cx, cy, r = 770, 250, 150
    d.ellipse((cx - r - 18, cy - r - 18, cx + r + 18, cy + r + 18), fill=(13, 71, 161, 255))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE)
    d.line((cx, cy, cx, cy - 95), fill=(13, 71, 161, 255), width=30)
    d.line((cx, cy, cx + 72, cy + 40), fill=(13, 71, 161, 255), width=30)
    d.ellipse((cx - 24, cy - 24, cx + 24, cy + 24), fill=(13, 71, 161, 255))
    return img.resize((size, size), Image.LANCZOS)


def logo(height: int, dark: bool) -> Image.Image:
    font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 330)
    text = "Hekkenplanner"
    tw = ImageDraw.Draw(Image.new("RGBA", (1, 1))).textbbox((0, 0), text, font=font)
    width = S + 90 + (tw[2] - tw[0]) + 40
    img = Image.new("RGBA", (width, S), (0, 0, 0, 0))
    img.paste(icon(S), (0, 0))
    color = (240, 244, 248, 255) if dark else (22, 38, 58, 255)
    ImageDraw.Draw(img).text((S + 90, S // 2), text, font=font, fill=color, anchor="lm")
    return img.resize((round(width * height / S), height), Image.LANCZOS)


OUT.mkdir(parents=True, exist_ok=True)
icon(256).save(OUT / "icon.png", optimize=True)
icon(512).save(OUT / "icon@2x.png", optimize=True)
logo(128, dark=False).save(OUT / "logo.png", optimize=True)
logo(256, dark=False).save(OUT / "logo@2x.png", optimize=True)
logo(128, dark=True).save(OUT / "dark_logo.png", optimize=True)
logo(256, dark=True).save(OUT / "dark_logo@2x.png", optimize=True)
print(sorted(p.name for p in OUT.iterdir()))
