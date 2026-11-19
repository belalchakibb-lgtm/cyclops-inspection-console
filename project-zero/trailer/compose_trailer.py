#!/usr/bin/env python3
"""
PROJECT: ZERO - in-engine-style trailer.
3D shots are rendered from the REAL Chapter 1 map (export_world.cjs ->
render3d.html via render_trailer.cjs). This script defines the edit,
renders the 3D frames, adds titles/subtitles/grain/letterbox, generates
the sound design and encodes the MP4 (vertical 720x1280, 24 fps).

Usage: python3 compose_trailer.py WORK_DIR SERVE_URL
"""
import json, math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

WORK, URL = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 24
K = W / 720  # text scale vs. the original 720p layout
AMBER, RED, CYAN = (255, 196, 64), (235, 55, 45), (150, 255, 230)
FB = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
FR = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
_f = {}
def font(p, s):
    s = int(s * K)
    if (p, s) not in _f: _f[(p, s)] = ImageFont.truetype(p, s)
    return _f[(p, s)]
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)

# ---- the edit: (start, end, shot or None, overlays) ----
EDIT = [
    (0.0, 2.6, None, [("title", "2037", None)]),
    (2.6, 5.2, None, [("title", "A MIRACLE CURE.", "IT WENT WRONG.")]),
    (5.2, 9.8, "ward", [("sub", "RECORDING", "Subject Zero-Zero... vitals stable.\nDo NOT wake the subject.")]),
    (9.8, 14.4, "corridor", [("sub", "RADIO", "...do not approach the infected.\nThey are drawn to noise and light.")]),
    (14.4, 17.6, "er", [("caption", "FIGHT BACK", None)]),
    (17.6, 21.4, "reveal", [("caption", "THE CITY WENT SILENT", None)]),
    (21.4, 25.0, "street", [("flash", "SURVIVE", 21.8), ("flash", "SOLVE", 22.7), ("flash", "ESCAPE", 23.6)]),
    (25.0, 27.8, "maya", [("sub", "MAYA", "Stop. Right there.\nAre you bitten?")]),
    (27.8, 31.8, "warden", [("caption_red", "THE WARDEN", None)]),
    (31.8, 35.2, "gate", [("bottom", "FIND THE ZERO CUBE.", "CHANGE WHAT HAPPENED.")]),
    (35.2, 40.6, "aerial", [("logo", None, None)]),
]
DUR = EDIT[-1][1]
TOTAL = int(DUR * FPS)

def shot_at(T):
    for s, e, shot, ov in EDIT:
        if s <= T < e: return s, e, shot, ov
    return EDIT[-1]

def glow_text(img, y, s, f, color, alpha=1.0, blur=12, x=None):
    if alpha <= 0.01: return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    bb = d.multiline_textbbox((0, 0), s, font=f, align="center", spacing=8)
    tx = (W - (bb[2] - bb[0])) / 2 if x is None else x
    d.multiline_text((tx, y), s, font=f, fill=color + (int(255 * clamp(alpha)),), align="center", spacing=8)
    g = layer.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(g); img.alpha_composite(layer)
    return layer

def shadow_text(img, y, s, f, color, alpha):
    if alpha <= 0.01: return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    bb = d.multiline_textbbox((0, 0), s, font=f, align="center", spacing=8)
    tx = (W - (bb[2] - bb[0])) / 2
    a = int(255 * clamp(alpha))
    d.multiline_text((tx + 3, y + 4), s, font=f, fill=(0, 0, 0, int(a * 0.85)), align="center", spacing=8)
    d.multiline_text((tx, y), s, font=f, fill=color + (a,), align="center", spacing=8)
    img.alpha_composite(layer)

rng = np.random.default_rng(3)
GRAIN = [Image.fromarray((rng.random((H // 2, W // 2)) * 255).astype(np.uint8)).resize((W, H)) for _ in range(6)]

def compose(i):
    T = i / FPS
    s, e, shot, ov = shot_at(T)
    lt = T - s
    if shot:
        img = Image.open(os.path.join(WORK, "frames3d", f"f{i:05d}.jpg")).convert("RGBA")
    else:
        img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    for kind, a, b in ov:
        if kind == "title":
            txt = a
            if a == "2037":
                n = int(len(a) * clamp(lt / 1.2)); txt = a[:n] + ("_" if int(lt * 3) % 2 == 0 else "")
            glow_text(img, H * 0.42, txt, font(FB, 58), (238, 240, 242), ease(lt / 0.5))
            if b: glow_text(img, H * 0.42 + 120 * K, b, font(FB, 32), AMBER, ease((lt - 1.0) / 0.6), 8)
        elif kind == "sub":
            al = ease((lt - 0.4) / 0.4) * ease((e - T) / 0.3)
            shadow_text(img, H - 330 * K, a, font(FB, 24), AMBER, al)
            shadow_text(img, H - 292 * K, b, font(FR, 30), (240, 240, 240), al)
        elif kind in ("caption", "caption_red"):
            al = ease((lt - 0.3) / 0.5) * ease((e - T) / 0.3)
            glow_text(img, 150 * K, a, font(FB, 52 if kind == "caption_red" else 40), RED if kind == "caption_red" else (235, 235, 235), al, 14)
        elif kind == "flash":
            k = T - b
            if 0 <= k < 0.85:
                col = {"SURVIVE": (245, 245, 245), "SOLVE": AMBER, "ESCAPE": RED}[a]
                dark = Image.new("RGBA", (W, H), (0, 0, 0, 120)); img.alpha_composite(dark)
                glow_text(img, H * 0.43 + (rng.random() - 0.5) * 14 * clamp(1 - k * 3), a, font(FB, 118), col, 1.0, 18)
        elif kind == "bottom":
            glow_text(img, H * 0.76, a, font(FB, 44), CYAN, ease((lt - 0.4) / 0.6), 12)
            glow_text(img, H * 0.76 + 64 * K, b, font(FB, 28), AMBER, ease((lt - 1.4) / 0.6), 8)
        elif kind == "logo":
            img.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(150 * ease(lt / 0.8)))))
            if lt < 0.7 and rng.random() < 0.5:
                glow_text(img, H * 0.33 + (rng.random() - 0.5) * 16, "PROJECT: ZERO", font(FB, 80), CYAN, 0.5, 4)
            glow_text(img, H * 0.33, "PROJECT: ZERO", font(FB, 80), (242, 244, 246), ease(lt / 0.4), 20)
            glow_text(img, H * 0.33 + 110 * K, "THE CURE WAS NEVER MEANT FOR THIS YEAR", font(FB, 22), AMBER, ease((lt - 0.8) / 0.6), 6)
            glow_text(img, H * 0.60, "SOLO OR CO-OP  •  UP TO 4 PLAYERS", font(FB, 28), (225, 225, 225), ease((lt - 1.6) / 0.6), 6)
            glow_text(img, H * 0.65, "CHAPTER 1: THE OUTBREAK", font(FB, 28), (225, 225, 225), ease((lt - 2.0) / 0.6), 6)
            glow_text(img, H * 0.76, "PLAY FREE ON ROBLOX", font(FB, 46), AMBER, ease((lt - 2.6) / 0.5), 14)
    if not shot:  # 3D shots already carry grain from the grade shader
        gr = GRAIN[i % len(GRAIN)].point(lambda v: int(v * 0.07))
        noise = Image.new("RGBA", (W, H), (255, 255, 255, 0)); noise.putalpha(gr); img.alpha_composite(noise)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, int(84 * K)], fill=(0, 0, 0, 255)); d.rectangle([0, H - int(84 * K), W, H], fill=(0, 0, 0, 255))
    fade = min(clamp(lt / 0.2), clamp((e - T) / 0.2)) if shot else 1
    if T > DUR - 1.0: fade = min(fade, clamp((DUR - T) / 1.0))
    if fade < 1: img.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - fade)))))
    img.convert("RGB").save(os.path.join(WORK, "frames", f"f{i:05d}.jpg"), quality=93)

def make_audio(path):
    sr = 44100; n = int(sr * DUR); tt = np.arange(n) / sr; a = np.random.default_rng(1)
    drone = 0.25 * np.sin(2 * np.pi * 41.2 * tt) + 0.15 * np.sin(2 * np.pi * 61.7 * tt + np.sin(tt * 0.3)) + 0.08 * np.sin(2 * np.pi * 82.4 * tt)
    k = 400; wind = np.convolve(a.standard_normal(n), np.ones(k) / k, mode="same") * 3.0 * (0.6 + 0.4 * np.sin(tt * 0.7))
    out = drone * np.clip(tt / 3, 0, 1) + wind * 0.5
    def add(at, sig):
        i0 = int(at * sr); seg = sig[: max(0, min(len(sig), n - i0))]; out[i0:i0 + len(seg)] += seg
    def boom(dur=1.6, f0=60, amp=1.0):
        x = np.arange(int(dur * sr)) / sr
        return amp * np.sin(2 * np.pi * f0 * x * np.exp(-x * 1.5)) * np.exp(-x * 2.6) + amp * 0.3 * a.standard_normal(len(x)) * np.exp(-x * 18)
    def beat(amp=0.7):
        x = np.arange(int(0.25 * sr)) / sr; return amp * np.sin(2 * np.pi * 50 * x) * np.exp(-x * 22)
    def groan(at, pitch=1.0):
        x = np.arange(int(1.2 * sr)) / sr
        f = 95 * pitch * (1 + 0.15 * np.sin(2 * np.pi * 3 * x))
        add(at, 0.22 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr)) * np.exp(-((x - 0.5) ** 2) / 0.12) * 0.6)
    hb = 5.4
    while hb < 14.0:
        add(hb, beat()); add(hb + 0.28, beat(0.5)); hb += 0.95 - (hb - 5.4) * 0.03
    # rain over outdoor shots
    rn = np.convolve(a.standard_normal(n), np.ones(6) / 6, mode="same") * 0.35
    env = np.zeros(n)
    for s0, e0 in ((17.6, 25.0), (27.8, 31.8), (35.2, DUR)):
        i0, i1 = int(s0 * sr), int(e0 * sr); env[i0:i1] = 1
    env = np.convolve(env, np.ones(int(0.3 * sr)) / int(0.3 * sr), mode="same")
    out += rn * env
    def whoosh(at):
        x = np.arange(int(0.35 * sr)) / sr; add(at, a.standard_normal(len(x)) * np.sin(np.pi * x / 0.35) ** 2 * 0.5)
    whoosh(15.55); add(15.8, boom(0.6, 90, 1.0))  # pipe swing + hit
    add(14.0, boom(1.0, 48, 1.2)); groan(13.6, 1.4)  # corridor lunge scare
    x = np.arange(int(1.6 * sr)) / sr  # warden roar
    add(28.6, 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(55 * (1 + 0.3 * np.sin(2 * np.pi * 7 * x))) / sr)) * np.sin(np.pi * x / 1.6) * 0.6)
    for s, _, _, _ in EDIT[1:]: add(s, boom(1.2, 55, 0.6))
    for c in (21.8, 22.7, 23.6): add(c, boom(0.9, 70, 0.9))
    for g, p in ((11.5, 1.0), (14.8, 0.8), (16.6, 1.2), (22.2, 0.9)): groan(g, p)
    add(29.95, boom(2.2, 34, 1.6))  # warden slam
    x = np.arange(int(3.2 * sr)) / sr; add(31.8, 0.25 * np.sin(2 * np.pi * (200 + 900 * x / 3.2) * x) * (x / 3.2) ** 2)
    add(35.2, boom(3.5, 34, 1.5))
    x = np.arange(int(3 * sr)) / sr
    for j, f in enumerate((440, 523.25, 392)): add(35.8 + j * 0.9, 0.18 * np.sin(2 * np.pi * f * x) * np.exp(-x * 1.4))
    out = out * np.clip((DUR - tt) / 1.5, 0, 1); out = out / (np.max(np.abs(out)) + 1e-9) * 0.9
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out * 32767).astype(np.int16).tobytes())

if __name__ == "__main__":
    os.makedirs(os.path.join(WORK, "frames"), exist_ok=True)
    tl = []
    for i in range(TOTAL):
        T = i / FPS; s, e, shot, _ = shot_at(T)
        if shot: tl.append({"i": i, "shot": shot, "u": (T - s) / (e - s), "t": T})
    with open(os.path.join(WORK, "timeline.json"), "w") as f: json.dump(tl, f)
    if "--skip3d" not in sys.argv:
        subprocess.run(["node", os.environ.get('DRIVER', os.path.join(HERE, 'render_trailer.cjs')), URL, os.path.join(WORK, "timeline.json"), os.path.join(WORK, "frames3d")], check=True)
    from multiprocessing import Pool
    with Pool(os.cpu_count()) as p: p.map(compose, range(TOTAL), chunksize=8)
    wav = os.path.join(WORK, "trailer.wav"); make_audio(wav)
    mp4 = os.path.join(WORK, "ProjectZero_Trailer.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(WORK, "frames", "f%05d.jpg"), "-i", wav,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "160k",
                    "-movflags", "+faststart", "-shortest", mp4], check=True)
    print("wrote", mp4)
