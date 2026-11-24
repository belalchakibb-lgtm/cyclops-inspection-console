"""Render the SKORP petroglyph cover: sandstone height field + carved masks
+ raking light. No text is drawn anywhere.

usage: python3 render.py BUILD_DIR OUT.png [--logo LOGO.png] [--invert-logo]
                         [--logo-scale 0.9] [--seed 7]

Without --logo the centre is left as a smoothed, empty cartouche ready for
the logo; nothing is invented in its place.
"""
import argparse
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, zoom, binary_dilation

W, H = 2400, 3600
CX, CY = W / 2, H / 2
SLOT_R = 440

ap = argparse.ArgumentParser()
ap.add_argument("build")
ap.add_argument("out")
ap.add_argument("--logo")
ap.add_argument("--invert-logo", action="store_true",
                help="engrave the light parts of the logo instead of the dark parts")
ap.add_argument("--logo-scale", type=float, default=0.94,
                help="logo size relative to the central cartouche diameter")
ap.add_argument("--seed", type=int, default=7)
args = ap.parse_args()

rng = np.random.default_rng(args.seed)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def noise(scale, aniso=(1, 1)):
    """Smooth value noise, ~unit std, feature size ≈ scale px.
    aniso stretches features (sy, sx)."""
    sy, sx = scale * aniso[0], scale * aniso[1]
    gh, gw = int(H / sy) + 4, int(W / sx) + 4
    g = rng.standard_normal((gh, gw)).astype(np.float32)
    up = zoom(g, (sy, sx), order=3)[:H, :W]
    up -= up.mean()
    return up / (up.std() + 1e-6)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def load_mask(name):
    im = Image.open(os.path.join(args.build, f"mask_{name}.png")).convert("L")
    return np.asarray(im, dtype=np.float32) / 255.0


print("stone…")
# ---------------------------------------------------------------- stone height (px units)
h = (5.0 * noise(520) + 2.6 * noise(160) + 1.3 * noise(48)
     + 0.55 * noise(12) + 0.28 * noise(3.5))
h += 0.35 * gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.6)  # sand grain
# sedimentary bedding: gently warped horizontal strata
warp = 70 * noise(700) + 18 * noise(150)
strata_phase = (yy + warp) / 46.0
h += 0.45 * np.sin(2 * np.pi * strata_phase) * (0.5 + 0.5 * noise(400))
strata_band = np.sin(2 * np.pi * (yy + warp) / 310.0)

dist_c = np.hypot(xx - CX, yy - CY)
slot_zone = smoothstep(SLOT_R + 30, SLOT_R - 10, dist_c)

# exfoliation: sandstone flakes off in sheets, exposing fresher, paler rock
flake_n = noise(260) + 0.35 * noise(60)
glyph_guard = gaussian_filter(load_mask('glyphs'), 30) > 0.01
flake = smoothstep(1.72, 1.80, flake_n) * (1 - smoothstep(SLOT_R + 220, SLOT_R + 120, dist_c))
flake = gaussian_filter(flake * (1 - glyph_guard), 1.5)
h -= 3.0 * flake

print("cracks…")
# ---------------------------------------------------------------- cracks
crack_img = Image.new("L", (W, H), 0)
cd = ImageDraw.Draw(crack_img)
pyr = np.random.default_rng(args.seed + 11)


def walk(x, y, ang, length, width, depth=0):
    pts = [(x, y)]
    for i in range(int(length / 10)):
        ang += pyr.normal(0, 0.22)
        x += 10 * math.cos(ang)
        y += 10 * math.sin(ang)
        pts.append((x, y))
        if depth < 2 and pyr.random() < 0.025:
            walk(x, y, ang + pyr.choice([-1, 1]) * pyr.uniform(0.5, 1.2),
                 length * pyr.uniform(0.15, 0.4), max(1, width * 0.55), depth + 1)
    for i in range(len(pts) - 1):
        t = i / max(1, len(pts) - 1)
        wdt = max(1, int(round(width * (1 - 0.7 * t))))
        cd.line([pts[i], pts[i + 1]], fill=255, width=wdt)


starts = [(-20, 620, 0.25, 1500, 6), (W + 20, 1180, 3.0, 1300, 5), (380, -20, 1.35, 1100, 5),
          (W + 20, 2900, 3.45, 1700, 6), (-20, 3150, -0.25, 1000, 4), (1650, H + 20, -1.75, 900, 4),
          (-20, 2050, 0.05, 700, 3), (2050, -20, 1.95, 800, 3)]
for x, y, a, L, w in starts:
    walk(x, y, a, L, w)
# hairline craquelure everywhere
for _ in range(70):
    walk(pyr.uniform(0, W), pyr.uniform(0, H), pyr.uniform(0, 2 * math.pi), pyr.uniform(60, 260), 1, 3)
crack = np.asarray(crack_img, dtype=np.float32) / 255.0
crack_soft = gaussian_filter(crack, 1.1)
crack_chip = gaussian_filter((binary_dilation(crack > 0.5, iterations=3)).astype(np.float32), 2.5)
crack_chip *= smoothstep(0.6, 1.4, noise(14))  # chipped lips, not continuous
crack_atten = 1 - 0.65 * slot_zone  # keep only hairlines across the logo
h -= (9.0 * crack_soft + 1.6 * crack_chip) * crack_atten

print("engravings…")
# ---------------------------------------------------------------- engravings
weather = 0.62 + 0.38 * smoothstep(-1.4, 0.9, noise(190) + 0.4 * noise(40))
peck_dots = (rng.random((H, W)) < 0.055).astype(np.float32)
peck = gaussian_filter(peck_dots, 1.6)
peck = peck / peck.max()


def carve(mask, depth, rough=0.28, pecked=0.35, wt=True, edge_blur=1.4):
    m = gaussian_filter(mask, edge_blur)
    m = np.clip((m - 0.5 + rough * 0.5 * noise(3.0) * (m > 0.02)) * 3.2 + 0.5, 0, 1)
    m = gaussian_filter(m, 0.9)
    prof = gaussian_filter(m, 2.4)  # rounded U-groove
    d = depth * prof * (1 - pecked + pecked * (0.55 + 0.9 * peck))
    if wt:
        d *= weather
    d *= (1 - 0.7 * flake)
    return d, m


glyph_m = load_mask("glyphs")
geo_m = load_mask("geometry")
d_glyph, m_glyph = carve(glyph_m, 13.0)
d_geo, m_geo = carve(geo_m, 4.2, rough=0.4, pecked=0.5)
# keep the geometry out of the logo cartouche (it passes *behind* the logo)
deep_m = load_mask("deep")
d_deep, m_deep = carve(deep_m, 6.0, rough=0.15, pecked=0.2, wt=False)
h -= d_deep
d_geo *= (1 - slot_zone)
m_geo *= (1 - slot_zone)
h -= d_glyph + d_geo

# ---------------------------------------------------------------- centre: cartouche / logo
polish = smoothstep(SLOT_R + 18, SLOT_R - 14, dist_c)
h_smooth = gaussian_filter(h, 5)
h = h * (1 - 0.55 * polish) + h_smooth * 0.55 * polish  # dressed (smoothed) stone face
h -= 1.6 * polish  # very shallow recess
ring = np.exp(-((dist_c - SLOT_R - 8) / 4.5) ** 2) * (0.6 + 0.4 * peck)
h -= 2.2 * ring

m_logo = np.zeros((H, W), np.float32)
if args.logo:
    print("logo…")
    im = Image.open(args.logo)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        rgba = im.convert("RGBA")
        a = np.asarray(rgba, dtype=np.float32)[..., 3] / 255.0
        lum = np.asarray(rgba.convert("L"), dtype=np.float32) / 255.0
        ink = a * (1 - lum) if not args.invert_logo else a * lum
        if ink.max() < 0.2:  # light logo on transparent bg: use alpha
            ink = a
    else:
        lum = np.asarray(im.convert("L"), dtype=np.float32) / 255.0
        # Otsu threshold to separate logo from its background
        hist, edges = np.histogram(lum, 256, (0, 1))
        p = hist / hist.sum(); om = np.cumsum(p); mu = np.cumsum(p * np.arange(256)); mt = mu[-1]
        sb = (mt * om - mu) ** 2 / (om * (1 - om) + 1e-9)
        thr = (np.argmax(sb) + 1) / 256.0  # upper edge of the dark class
        ink = (lum < thr).astype(np.float32)
        if args.invert_logo:
            ink = 1 - ink
    ys, xs = np.nonzero(ink > 0.5)
    ink = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    lh, lw = ink.shape
    box = 2 * SLOT_R * args.logo_scale
    s = box / max(lh, lw)
    # a wide wordmark may run past the disc: give it more width
    if lw > lh * 1.4:
        s = min(1.25 * box / lw, box / lh)
    nh, nw = max(1, int(lh * s)), max(1, int(lw * s))
    logo_img = Image.fromarray((ink * 255).astype(np.uint8)).resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("L", (W, H), 0)
    canvas.paste(logo_img, (int(CX - nw / 2), int(CY - nh / 2)))
    lm = np.asarray(canvas, dtype=np.float32) / 255.0
    d_logo, m_logo = carve(lm, 11.0, rough=0.18, pecked=0.25, wt=False, edge_blur=1.0)
    d_logo *= 0.85 + 0.15 * weather
    h -= d_logo

print("light…")
# ---------------------------------------------------------------- shading
gy, gx = np.gradient(h)
nz = np.ones_like(h)
nrm = np.sqrt(gx * gx + gy * gy + nz)
nx, ny, nz = -gx / nrm, -gy / nrm, nz / nrm
L = np.array([-0.62, -0.58, 0.53]); L /= np.linalg.norm(L)  # low raking key light, upper left
diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
# soft fill from lower right (bounce off desert floor)
F = np.array([0.5, 0.6, 0.62]); F /= np.linalg.norm(F)
fill_l = np.clip(nx * F[0] + ny * F[1] + nz * F[2], 0, 1)

cav = gaussian_filter(h, 7) - h
ao = np.clip(1 - 0.075 * np.clip(cav, 0, None), 0.35, 1)
ao2 = np.clip(1 - 0.03 * np.clip(gaussian_filter(h, 30) - h, 0, None), 0.6, 1)

# ---------------------------------------------------------------- albedo
c_orange = np.array([0.74, 0.37, 0.16])
c_ochre = np.array([0.84, 0.53, 0.27])
c_rust = np.array([0.50, 0.21, 0.09])
c_fresh = np.array([0.90, 0.60, 0.36])
c_varnish = np.array([0.30, 0.15, 0.08])

t1 = smoothstep(-1.2, 1.2, noise(340) + 0.5 * noise(90) + 0.35 * strata_band)
t2 = smoothstep(0.2, 1.6, noise(220) + 0.4 * noise(30))
alb = (c_orange * (1 - t1)[..., None] + c_ochre * t1[..., None])
alb = alb * (1 - 0.55 * t2)[..., None] + c_rust * (0.55 * t2)[..., None]
# desert varnish: dark streaks that ran down the face
streak = smoothstep(0.6, 2.2, noise(60, aniso=(6, 0.6)) + 0.9 * noise(300) + 0.5 * noise(45))
streak *= (0.45 + 0.55 * smoothstep(H * 0.9, 0, yy))
alb = alb * (1 - 0.3 * streak)[..., None] + c_varnish * (0.3 * streak)[..., None]
# mineral flecks
fine = rng.standard_normal((H, W)).astype(np.float32)
alb *= (1 + 0.06 * gaussian_filter(fine, 0.7))[..., None]
dark_fleck = (gaussian_filter(fine, 1.2) > 0.62).astype(np.float32)
alb *= (1 - 0.25 * dark_fleck)[..., None]
# flaked patches: paler fresh stone
alb = alb * (1 - 0.35 * flake)[..., None] + c_fresh * (0.35 * flake)[..., None]
# dressed cartouche reads slightly cleaner/warmer
alb = alb * (1 - 0.15 * polish)[..., None] + c_ochre * (0.15 * polish)[..., None]
# crack interiors: dust and shadowed mineral
alb *= (1 - 0.5 * crack_soft * crack_atten)[..., None]

# ---------------------------------------------------------------- pigment
c_char = np.array([0.075, 0.058, 0.050])
c_brown = np.array([0.26, 0.135, 0.07])
pmix = smoothstep(-1, 1, noise(26) + 0.6 * noise(110))
pig_col = c_char * (1 - pmix)[..., None] + c_brown * pmix[..., None]
patch = 0.55 + 0.45 * smoothstep(-1.3, 0.8, noise(70) + 0.5 * noise(9))
p_glyph = np.clip(gaussian_filter(m_glyph, 1.2) * 1.08, 0, 1) * patch * (0.55 + 0.45 * weather) * (1 - 0.6 * flake)
p_geo = np.clip(gaussian_filter(m_geo, 1.0), 0, 1) * 0.55 * patch
p_logo = np.clip(gaussian_filter(m_logo, 1.0) * 1.1, 0, 1) * (0.82 + 0.18 * patch)
p_deep = np.clip(gaussian_filter(m_deep, 1.0), 0, 1) * (0.9 + 0.1 * patch)
pig = np.clip(p_glyph + p_geo + p_logo, 0, 0.97)
pig = np.maximum(pig, p_deep * 0.98)
logo_soot = np.clip(gaussian_filter(m_logo, 1.0), 0, 1) * 0.7
pig_col = pig_col * (1 - logo_soot)[..., None] + c_char * logo_soot[..., None]
pig_col = pig_col * (1 - p_deep)[..., None] + np.array([0.035, 0.03, 0.028]) * p_deep[..., None]
alb = alb * (1 - pig)[..., None] + pig_col * pig[..., None]

# ---------------------------------------------------------------- compose + grade
key_col = np.array([1.06, 0.90, 0.74])   # late-afternoon sun
fill_col = np.array([0.30, 0.25, 0.26])  # cool-ish bounce
amb_col = np.array([0.12, 0.08, 0.065])
light = (diff[..., None] * key_col * 1.35 + fill_l[..., None] * fill_col * 0.55 + amb_col)
img = alb * light * (ao * ao2)[..., None]

# cinematic falloff: key pool high-left of centre, deep corners
kx, ky = W * 0.42, H * 0.40
r = np.hypot((xx - kx) / W, (yy - ky) / H * 0.82)
pool = 0.98 * np.exp(-(r / 0.52) ** 2) + 0.16
vign = smoothstep(1.05, 0.35, np.hypot((xx - CX) / (W * 0.62), (yy - CY) / (H * 0.62)))
img *= (pool * (0.35 + 0.65 * vign))[..., None]

# gentle filmic tone curve
img = np.clip(img, 0, None)
img = img * (2.51 * img + 0.03) / (img * (2.43 * img + 0.59) + 0.14)
img = np.clip(img, 0, 1) ** (1 / 1.12)
# split tone: warm highlights, deep umber shadows
lum = img.mean(axis=2, keepdims=True)
img = img + (np.array([0.02, 0.0, -0.025]) * lum) + np.array([0.012, 0.004, 0.0]) * (1 - lum)
img += rng.normal(0, 0.010, img.shape).astype(np.float32)  # film grain
img = np.clip(img, 0, 1)

out = Image.fromarray((img * 255 + 0.5).astype(np.uint8), "RGB")
out = out.filter(ImageFilter.UnsharpMask(radius=2, percent=40, threshold=2))
out.save(args.out, dpi=(300, 300))
print("wrote", args.out)
