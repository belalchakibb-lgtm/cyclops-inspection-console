#!/usr/bin/env python3
"""
PROJECT: ZERO - teaser trailer generator (vertical 720x1280, 30 fps).
Everything (visuals + sound) is generated from code: no external assets.
Usage: python3 make_teaser.py OUT_DIR   -> OUT_DIR/ProjectZero_Teaser.mp4
"""
import math, os, sys, wave, subprocess
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 720, 1280, 30
DUR = 34.0
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
FR = os.path.join(OUT, "frames")
os.makedirs(FR, exist_ok=True)

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_M = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
_fc = {}
def font(path, size):
    k = (path, size)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(path, size)
    return _fc[k]

AMBER = (255, 196, 64)
RED = (230, 50, 40)
rng = np.random.default_rng(37)
# pre-made fog texture (tileable-ish smooth noise)
small = rng.random((40, 24))
FOG = Image.fromarray((small * 255).astype(np.uint8)).resize((W * 2, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(40))
GRAIN = [Image.fromarray((rng.random((H // 2, W // 2)) * 255).astype(np.uint8)).resize((W, H)) for _ in range(6)]

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)

def text_c(d, y, s, f, fill, spacing=10):
    bbox = d.multiline_textbbox((0, 0), s, font=f, align="center", spacing=spacing)
    w = bbox[2] - bbox[0]
    d.multiline_text(((W - w) / 2, y), s, font=f, fill=fill, align="center", spacing=spacing)

def glow_text(img, y, s, f, color, alpha=1.0, blur=14):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    a = int(255 * clamp(alpha))
    text_c(d, y, s, f, color + (a,))
    g = layer.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(g); img.alpha_composite(g); img.alpha_composite(layer)

def fog(img, t, strength, tint=(150, 160, 170)):
    off = int((t * 25) % W)
    f = FOG.crop((off, 0, off + W, H))
    col = Image.new("RGBA", (W, H), tint + (0,))
    col.putalpha(f.point(lambda v: int(v * strength / 255)))
    img.alpha_composite(col)

def vignette():
    y, x = np.ogrid[0:H, 0:W]
    r = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
    a = np.clip((r - 0.55) * 1.6, 0, 1) * 235
    v = np.zeros((H, W, 4), np.uint8); v[..., 3] = a.astype(np.uint8)
    return Image.fromarray(v, "RGBA")
VIG = vignette()

def zombie(d, cx, base, scale, eye=(255, 230, 140), lean=0.0, col=(8, 9, 10)):
    s = scale
    # silhouette: legs, torso, outstretched arms, head
    d.polygon([(cx - 22 * s, base), (cx - 8 * s, base - 95 * s), (cx + 8 * s, base - 95 * s), (cx + 22 * s, base)], fill=col)
    d.polygon([(cx - 30 * s + lean * s, base - 90 * s), (cx + 30 * s + lean * s, base - 90 * s), (cx + 24 * s + lean * 2 * s, base - 175 * s), (cx - 24 * s + lean * 2 * s, base - 175 * s)], fill=col)
    for side in (-1, 1):
        d.line([(cx + side * 22 * s + lean * 2 * s, base - 165 * s), (cx + side * 40 * s + lean * 3 * s, base - 150 * s + side * 6 * s)], fill=col, width=int(14 * s))
    hx, hy = cx + lean * 2.6 * s, base - 200 * s
    d.ellipse([hx - 20 * s, hy - 24 * s, hx + 20 * s, hy + 22 * s], fill=col)
    for ex in (-7, 7):
        d.ellipse([hx + ex * s - 3.5 * s, hy - 4 * s, hx + ex * s + 3.5 * s, hy + 2 * s], fill=eye)

# ---------------- scenes ----------------
def sc_title_card(t, lines, sub=None, typewriter=False):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    fog(img, t, 40, (90, 95, 100))
    s = lines
    if typewriter:
        n = int(len(s) * clamp(t / 1.2))
        s = s[:n] + ("_" if int(t * 3) % 2 == 0 else "")
    flick = 0.55 if rng.random() < 0.06 else 1.0
    glow_text(img, H * 0.42, s, font(FONT_B, 54), (235, 238, 240), flick * ease(t / 0.6))
    if sub:
        a = ease((t - 1.0) / 0.8)
        glow_text(img, H * 0.42 + 150, sub, font(FONT_B, 30), AMBER, a, 10)
    return img

def sc_corridor(t):
    img = Image.new("RGBA", (W, H), (14, 18, 20, 255))
    d = ImageDraw.Draw(img)
    z = 1 + t * 0.06
    vx, vy = W / 2, H * 0.46
    def P(x, y):  # perspective point from normalized corridor coords
        return (vx + (x - vx) * z, vy + (y - vy) * z)
    # walls/floor/ceiling quads
    d.polygon([P(-200, -200), P(W + 200, -200), P(vx + 60, vy - 80), P(vx - 60, vy - 80)], fill=(40, 48, 50))
    d.polygon([P(-200, H + 200), P(W + 200, H + 200), P(vx + 60, vy + 80), P(vx - 60, vy + 80)], fill=(60, 66, 62))
    d.polygon([P(-200, -200), P(vx - 60, vy - 80), P(vx - 60, vy + 80), P(-200, H + 200)], fill=(70, 86, 82))
    d.polygon([P(W + 200, -200), P(vx + 60, vy - 80), P(vx + 60, vy + 80), P(W + 200, H + 200)], fill=(64, 80, 76))
    d.rectangle([P(vx - 60, vy - 80), P(vx + 60, vy + 80)], fill=(4, 5, 6))
    # ceiling lamps receding, flickering
    for i in range(7):
        k = 1 / (1 + i * 0.55)
        lx0, ly = vx - 70 * k, vy - (vy + 100) * k
        on = not (i in (1, 4) and math.sin(t * 23 + i) > 0.2)
        col = (230, 240, 255) if on else (40, 45, 48)
        d.rectangle([P(lx0, ly), P(vx + 70 * k, ly + 12 * k)], fill=col)
        if on:
            glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(glow).ellipse([P(vx - 160 * k, ly - 40 * k), P(vx + 160 * k, ly + 180 * k)], fill=(200, 220, 230, 40))
            img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(30)))
    # figure at the end of the corridor appears
    if t > 2.6:
        zombie(d, vx, vy + 70, 0.32 * z, eye=(255, 240, 150))
    # door doors side
    for i in range(3):
        k = 1 / (1 + i * 0.9)
        x = vx - (vx + 40) * k
        d.rectangle([P(x, vy - 30 - 220 * k), P(x + 30 * k, vy + 70 + 300 * k)], fill=(30, 36, 40))
    fog(img, t, 55)
    return img

def subtitle(img, speaker, line, a=1.0):
    d = ImageDraw.Draw(img)
    a255 = int(255 * clamp(a))
    text_c(d, H - 300, speaker.upper(), font(FONT_B, 26), AMBER + (a255,))
    text_c(d, H - 260, line, font(FONT_R, 30), (235, 235, 235, a255))

def sc_wristband(t):
    img = Image.new("RGBA", (W, H), (6, 8, 10, 255))
    d = ImageDraw.Draw(img)
    zoom = 1 + t * 0.05
    bw, bh = 560 * zoom, 160 * zoom
    x0, y0 = (W - bw) / 2, H * 0.42 - bh / 2
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=30, fill=(225, 228, 230))
    d.rectangle([x0 + 30 * zoom, y0 + 30 * zoom, x0 + 120 * zoom, y0 + bh - 30 * zoom], fill=(20, 20, 20))
    for i in range(14):  # barcode
        if i % 3 != 1:
            bx = x0 + 34 * zoom + i * 6 * zoom
            d.rectangle([bx, y0 + 34 * zoom, bx + 3 * zoom, y0 + bh - 34 * zoom], fill=(230, 230, 230))
    d.text((x0 + 150 * zoom, y0 + 30 * zoom), "ST. AURELIA MEDICAL", font=font(FONT_B, int(22 * zoom)), fill=(90, 90, 90))
    d.text((x0 + 150 * zoom, y0 + 62 * zoom), "SUBJECT 00", font=font(FONT_B, int(52 * zoom)), fill=(180, 20, 20))
    fog(img, t, 30, (60, 60, 60))
    subtitle(img, "Recording", "Vitals stable... do NOT wake the subject.", ease(t / 0.5))
    return img

def sc_city(t):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    # dusk sky gradient
    sky = np.zeros((H, W, 4), np.uint8)
    g = np.linspace(0, 1, H)[:, None]
    sky[..., 0] = (40 + 90 * g * 0.6).astype(np.uint8)
    sky[..., 1] = (45 + 30 * g * 0.6).astype(np.uint8)
    sky[..., 2] = (60 + 10 * g).astype(np.uint8)
    sky[..., 3] = 255
    img = Image.fromarray(sky, "RGBA")
    d = ImageDraw.Draw(img)
    r = np.random.default_rng(5)
    pan = t * 18
    # skyline layers
    for layer, (col, top, wmin) in enumerate([((30, 32, 38), 0.42, 60), ((16, 17, 20), 0.52, 80)]):
        x = -100 - pan * (0.5 + layer * 0.5)
        while x < W + 100:
            bw = r.integers(wmin, wmin + 90); bh = r.integers(150, 520)
            yb = H * top + 300 - bh
            d.rectangle([x, yb, x + bw, H], fill=col)
            for wy in range(int(yb) + 20, int(H * 0.7), 34):
                for wx in range(int(x) + 10, int(x + bw) - 10, 22):
                    if r.random() < 0.05:
                        d.rectangle([wx, wy, wx + 8, wy + 12], fill=(255, 190, 110))
            x += bw + r.integers(0, 20)
    # red flare on a roof
    fx, fy = W * 0.72 - pan, H * 0.48
    flare = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(flare)
    pulse = 0.8 + 0.2 * math.sin(t * 9)
    fd.ellipse([fx - 60, fy - 60, fx + 60, fy + 60], fill=(255, 60, 40, int(150 * pulse)))
    for i in range(10):  # rising smoke
        sy = fy - 40 - i * 45 - (t * 30) % 45
        fd.ellipse([fx - 20 - i * 6, sy - 20 - i * 4, fx + 20 + i * 6, sy + 20 + i * 4], fill=(200, 90, 80, max(0, 60 - i * 6)))
    img.alpha_composite(flare.filter(ImageFilter.GaussianBlur(14)))
    # street + approaching infected
    d = ImageDraw.Draw(img)
    d.rectangle([0, H * 0.72, W, H], fill=(10, 10, 12))
    for i, (x, sp) in enumerate([(0.18, 1.0), (0.5, 1.3), (0.8, 0.9), (0.33, 1.6), (0.66, 1.2)]):
        sc = 0.6 + (t * 0.18 * sp) + i * 0.1
        zombie(d, W * x + math.sin(t * 2 + i) * 8, H * 0.72 + 40 * sc + i * 20, sc, lean=math.sin(t * 3 + i) * 4, eye=(255, 220, 120) if i != 3 else (90, 255, 220))
    fog(img, t, 70, (130, 120, 125))
    return img

def sc_flash(t, word, color):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    # eyes in the dark
    for i in range(6):
        ex = (i * 131 + 70) % (W - 80) + 40; ey = (i * 211 + 200) % (H - 500) + 150
        if (i + int(t * 6)) % 3:
            for dx in (-12, 12):
                d.ellipse([ex + dx - 5, ey - 3, ex + dx + 5, ey + 3], fill=(255, 220, 120))
    shake = (rng.random() - 0.5) * 18 * clamp(1 - t * 2)
    glow_text(img, H * 0.43 + shake, word, font(FONT_B, 120), color, 1.0, 18)
    return img

def sc_warden(t):
    img = Image.new("RGBA", (W, H), (12, 8, 8, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([0, H * 0.74, W, H], fill=(20, 16, 16))
    # slam ring telegraph
    rr = 40 + t * 380
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([W / 2 - rr, H * 0.78 - rr * 0.25, W / 2 + rr, H * 0.78 + rr * 0.25], outline=(255, 40, 30, int(220 * clamp(1.4 - t))), width=10)
    img.alpha_composite(ring.filter(ImageFilter.GaussianBlur(4))); img.alpha_composite(ring)
    zombie(d, W / 2, H * 0.78, 2.6 + t * 0.15, eye=(255, 50, 40), col=(4, 4, 6))
    # red glow behind
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse([W / 2 - 300, H * 0.2, W / 2 + 300, H * 0.75], fill=(255, 40, 30, 40))
    img.alpha_composite(g.filter(ImageFilter.GaussianBlur(60)))
    fog(img, t, 50, (120, 60, 60))
    glow_text(img, H * 0.08, "THE WARDEN", font(FONT_B, 64), RED, ease(t / 0.4), 16)
    return img

def sc_cube(t):
    img = Image.new("RGBA", (W, H), (2, 3, 5, 255))
    a, b = t * 0.9, 0.6 + t * 0.35
    pts = []
    for x in (-1, 1):
        for y in (-1, 1):
            for z in (-1, 1):
                X = x * math.cos(a) - z * math.sin(a); Z = x * math.sin(a) + z * math.cos(a)
                Y = y * math.cos(b) - Z * math.sin(b); Z2 = y * math.sin(b) + Z * math.cos(b)
                k = 520 / (Z2 + 4.5)
                pts.append((W / 2 + X * k, H * 0.45 + Y * k))
    faces = [(0, 1, 3, 2), (4, 5, 7, 6), (0, 1, 5, 4), (2, 3, 7, 6), (0, 2, 6, 4), (1, 3, 7, 5)]
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for f in faces:
        d.polygon([pts[i] for i in f], fill=(10, 12, 14, 200))
    edges = [(0, 1), (1, 3), (3, 2), (2, 0), (4, 5), (5, 7), (7, 6), (6, 4), (0, 4), (1, 5), (2, 6), (3, 7)]
    pulse = 0.6 + 0.4 * math.sin(t * 5)
    for e in edges:
        d.line([pts[e[0]], pts[e[1]]], fill=(90, 255, 220, int(255 * pulse)), width=5)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(18))); img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(6))); img.alpha_composite(layer)
    # glitch slices
    if rng.random() < 0.25:
        arr = np.array(img)
        y0 = int(rng.integers(0, H - 60)); arr[y0:y0 + 40] = np.roll(arr[y0:y0 + 40], int(rng.integers(-40, 40)), axis=1)
        img = Image.fromarray(arr, "RGBA")
    glow_text(img, H * 0.74, "FIND THE ZERO CUBE.", font(FONT_B, 46), (200, 255, 240), ease(t / 0.6), 12)
    glow_text(img, H * 0.74 + 70, "CHANGE WHAT HAPPENED.", font(FONT_B, 30), AMBER, ease((t - 1.2) / 0.6), 8)
    return img

def sc_logo(t):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    fog(img, t, 45, (100, 100, 110))
    jitter = (rng.random() - 0.5) * 14 if t < 0.7 else 0
    a = ease(t / 0.4)
    if t < 0.7 and rng.random() < 0.5:
        glow_text(img, H * 0.36 + jitter, "PROJECT: ZERO", font(FONT_B, 82), (90, 255, 220), a * 0.5, 4)
    glow_text(img, H * 0.36, "PROJECT: ZERO", font(FONT_B, 82), (240, 242, 245), a, 20)
    glow_text(img, H * 0.36 + 110, "THE CURE WAS NEVER MEANT FOR THIS YEAR", font(FONT_B, 22), AMBER, ease((t - 0.8) / 0.6), 6)
    glow_text(img, H * 0.62, "SOLO OR CO-OP  •  UP TO 4 PLAYERS", font(FONT_B, 28), (220, 220, 220), ease((t - 1.6) / 0.6), 6)
    glow_text(img, H * 0.67, "CHAPTER 1: THE OUTBREAK", font(FONT_B, 28), (220, 220, 220), ease((t - 2.0) / 0.6), 6)
    glow_text(img, H * 0.78, "PLAY FREE ON ROBLOX", font(FONT_B, 44), AMBER, ease((t - 2.6) / 0.5), 14)
    return img

# timeline: (start, end, fn)
TL = [
    (0.0, 2.6, lambda t: sc_title_card(t, "2037", typewriter=True)),
    (2.6, 6.2, lambda t: sc_title_card(t, "A MIRACLE CURE.", "IT WENT WRONG.")),
    (6.2, 11.2, lambda t: subtitle_wrap(sc_corridor(t), t, "Radio", "...do not approach the infected.\nThey are drawn to noise and light...")),
    (11.2, 14.4, sc_wristband),
    (14.4, 19.8, lambda t: subtitle_wrap(sc_city(t), t, "Maya", "Stop. Right there. Are you bitten?")),
    (19.8, 20.7, lambda t: sc_flash(t, "SURVIVE", (240, 240, 240))),
    (20.7, 21.6, lambda t: sc_flash(t, "SOLVE", AMBER)),
    (21.6, 22.5, lambda t: sc_flash(t, "ESCAPE", RED)),
    (22.5, 25.6, sc_warden),
    (25.6, 29.6, sc_cube),
    (29.6, 34.0, sc_logo),
]
CUTS = [s for s, _, _ in TL]

def subtitle_wrap(img, t, sp, line):
    subtitle(img, sp, line, ease((t - 0.4) / 0.5))
    return img

def render(i):
    T = i / FPS
    for s, e, fn in TL:
        if s <= T < e:
            img = fn(T - s)
            # fade between scenes
            fade = min(clamp((T - s) / 0.25), clamp((e - T) / 0.25))
            break
    else:
        img, fade = Image.new("RGBA", (W, H), (0, 0, 0, 255)), 1
    img.alpha_composite(VIG)
    gr = GRAIN[i % len(GRAIN)].point(lambda v: int(v * 0.09))
    noise = Image.new("RGBA", (W, H), (255, 255, 255, 0)); noise.putalpha(gr)
    img.alpha_composite(noise)
    # letterbox bars
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 70], fill=(0, 0, 0, 255)); d.rectangle([0, H - 70, W, H], fill=(0, 0, 0, 255))
    if fade < 1:
        black = Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - fade))))
        img.alpha_composite(black)
    img.convert("RGB").save(os.path.join(FR, f"f{i:05d}.png"), compress_level=1)

# ---------------- audio ----------------
def make_audio(path):
    sr = 44100; n = int(sr * DUR); tt = np.arange(n) / sr
    a = np.random.default_rng(1)
    drone = 0.25 * np.sin(2 * np.pi * 41.2 * tt) + 0.15 * np.sin(2 * np.pi * 61.7 * tt + np.sin(tt * 0.3)) + 0.08 * np.sin(2 * np.pi * 82.4 * tt * (1 + 0.002 * np.sin(tt)))
    noise = a.standard_normal(n); k = 400
    wind = np.convolve(noise, np.ones(k) / k, mode="same") * 3.0 * (0.6 + 0.4 * np.sin(tt * 0.7))
    out = drone * np.clip(tt / 3, 0, 1) + wind * 0.5
    def add(at, sig):
        i0 = int(at * sr); seg = sig[: max(0, min(len(sig), n - i0))]; out[i0:i0 + len(seg)] += seg
    def boom(dur=1.6, f0=60, amp=1.0):
        x = np.arange(int(dur * sr)) / sr
        return amp * np.sin(2 * np.pi * f0 * x * np.exp(-x * 1.5)) * np.exp(-x * 2.6) + amp * 0.3 * a.standard_normal(len(x)) * np.exp(-x * 18)
    def beat(amp=0.7):
        x = np.arange(int(0.25 * sr)) / sr
        return amp * np.sin(2 * np.pi * 50 * x) * np.exp(-x * 22)
    # heartbeat during corridor + wristband
    hb = 6.4
    while hb < 14.4:
        add(hb, beat()); add(hb + 0.28, beat(0.5)); hb += 0.95 - (hb - 6.4) * 0.03
    for c in CUTS[1:]:
        add(c, boom(1.2, 55, 0.6))
    for c in (19.8, 20.7, 21.6):
        add(c, boom(0.9, 70, 0.9))
    add(22.5, boom(2.2, 38, 1.3))  # warden slam
    # riser into the cube + logo
    x = np.arange(int(4.0 * sr)) / sr
    riser = 0.25 * np.sin(2 * np.pi * (200 + 900 * x / 4) * x) * (x / 4) ** 2
    add(25.6, riser)
    add(29.6, boom(3.5, 34, 1.5))
    # eerie bell motif on title
    x = np.arange(int(3 * sr)) / sr
    for j, f in enumerate((440, 523.25, 392)):
        add(30.2 + j * 0.9, 0.18 * np.sin(2 * np.pi * f * x) * np.exp(-x * 1.4))
    fade = np.clip((DUR - tt) / 1.5, 0, 1)
    out = out * fade
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.9
    pcm = (out * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())

if __name__ == "__main__":
    total = int(DUR * FPS)
    with Pool(os.cpu_count()) as p:
        p.map(render, range(total), chunksize=8)
    wav = os.path.join(OUT, "teaser.wav"); make_audio(wav)
    mp4 = os.path.join(OUT, "ProjectZero_Teaser.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(FR, "f%05d.png"), "-i", wav,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-c:a", "aac", "-b:a", "160k",
                    "-movflags", "+faststart", "-shortest", mp4], check=True)
    print("wrote", mp4)
