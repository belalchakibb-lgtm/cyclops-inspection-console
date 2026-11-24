"""SVG source for the SKORP petroglyph cover.

Everything here is drawn white-on-black: the SVG is a *carving mask*, not the
final picture. render.py turns each layer into depth + pigment on sandstone.

Layers (rendered separately):
  glyphs   – the 13 song petroglyphs (deep, pigmented grooves)
  geometry – Fibonacci spiral, golden-rectangle squares, waveforms (shallow)
  slot     – the central cartouche reserved for the SKORP logo
"""
import math
import random

W, H = 2400, 3600
CX, CY = W / 2, H / 2
PHI = (1 + 5 ** 0.5) / 2
GOLDEN_ANGLE = math.pi * (3 - 5 ** 0.5)  # 137.507...°
SLOT_R = 440

# ---------------------------------------------------------------- helpers

def stroke(d, w=11, extra=""):
    return (f'<path d="{d}" fill="none" stroke="#fff" stroke-width="{w}" '
            f'stroke-linecap="round" stroke-linejoin="round" {extra}/>')


def fill(d, extra=""):
    return f'<path d="{d}" fill="#fff" {extra}/>'


def circle(x, y, r, filled=True, w=10):
    if filled:
        return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#fff"/>'
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="none" '
            f'stroke="#fff" stroke-width="{w}"/>')


def dots_along(points, r):
    return "".join(circle(x, y, r) for x, y in points)


def quadruped(horns="goat", outline=False, s=1.0):
    """Saharan rock-art animal in profile, facing right, centred at 0,0."""
    body = ("M -72,-8 C -70,-34 -20,-38 20,-34 C 48,-32 62,-30 70,-22 "
            "C 80,-34 88,-48 98,-56 C 110,-62 122,-56 124,-46 "
            "C 118,-40 108,-34 98,-28 C 88,-14 80,4 66,14 "
            "C 30,24 -30,24 -60,16 C -72,10 -74,2 -72,-8 Z")
    legs = [(-52, 14, -58, 78), (-32, 18, -28, 80), (40, 18, 34, 80), (60, 12, 66, 76)]
    out = []
    if outline:
        out.append(stroke(body, 9))
    else:
        out.append(fill(body))
    for x1, y1, x2, y2 in legs:
        out.append(stroke(f"M {x1},{y1} L {x2},{y2}", 11))
    out.append(stroke("M -70,-12 C -86,-6 -90,10 -84,26", 8))  # tail
    if horns == "goat":  # Barbary sheep: heavy horns sweeping back and curling
        out.append(stroke("M 102,-58 C 96,-92 62,-100 50,-80 C 42,-64 58,-52 70,-60", 12))
        out.append(stroke("M 110,-58 C 112,-84 98,-104 80,-108", 7))
        out.append(stroke("M 118,-40 C 122,-28 116,-18 112,-14", 6))  # beard
    elif horns == "lyre":  # Bovidian-period cattle with lyre horns
        out.append(stroke("M 104,-58 C 80,-90 70,-130 96,-162 C 104,-170 114,-170 118,-166", 12))
        out.append(stroke("M 112,-58 C 130,-90 150,-120 140,-158 C 138,-166 132,-170 126,-170", 12))
    body_g = "".join(out)
    if s != 1.0:
        return f'<g transform="scale({s})">{body_g}</g>'
    return body_g


def human(x=0, y=0, s=1.0, arms="out", legs="stand", head_r=22, filled_body=True):
    """Tassili 'round-head' figure."""
    out = [circle(0, -92, head_r)]
    torso = "M -20,-66 C -24,-40 -18,-10 -12,10 L 12,10 C 18,-10 24,-40 20,-66 Z"
    out.append(fill(torso) if filled_body else stroke(torso, 8))
    if arms == "out":
        out.append(stroke("M -18,-60 C -48,-50 -66,-30 -78,-6", 11))
        out.append(stroke("M 18,-60 C 48,-50 66,-30 78,-6", 11))
    elif arms == "up":
        out.append(stroke("M -18,-60 C -40,-80 -52,-108 -56,-140", 11))
        out.append(stroke("M 18,-60 C 40,-80 52,-108 56,-140", 11))
        out.append(stroke("M -56,-140 L -66,-152 M -56,-140 L -52,-156 M -56,-140 L -44,-150", 6))
        out.append(stroke("M 56,-140 L 66,-152 M 56,-140 L 52,-156 M 56,-140 L 44,-150", 6))
    if legs == "stand":
        out.append(stroke("M -10,8 C -16,40 -20,70 -26,98", 12))
        out.append(stroke("M 10,8 C 16,40 20,70 26,98", 12))
    return f'<g transform="translate({x},{y}) scale({s})">{"".join(out)}</g>'


def rng(seed):
    return random.Random(seed)

# ---------------------------------------------------------------- 13 glyphs
# Each returns SVG in a local box of roughly ±150 px.


def g_oblivion():
    """1. Oblivion (النسيان, 'forgetting'): a figure whose lower half
    crumbles into drifting pecked dust; memory dispersing."""
    r = rng(1)
    out = [circle(0, -100, 24)]
    out.append(fill("M -22,-72 C -26,-50 -20,-30 -16,-14 L 16,-14 C 20,-30 26,-50 22,-72 Z"))
    out.append(stroke("M -20,-66 C -50,-56 -70,-36 -84,-12", 11))
    out.append(stroke("M 20,-66 C 40,-62 52,-70 62,-84", 11))  # arm reaching back
    # dissolving: pecks drift down and to the right, shrinking
    for i in range(70):
        t = i / 70
        y = -10 + t * 150 + r.uniform(-8, 8)
        spread = 14 + t * 90
        x = r.uniform(-spread, spread) * (1 - 0.3 * t) + t * 70
        rr = max(1.6, 9 * (1 - t) ** 1.2 + r.uniform(-1, 1))
        out.append(circle(x, y, rr))
    return "".join(out)


def g_goat2():
    """2. GOAT II: the return. A solid Barbary sheep stands over the hollow
    outline of its earlier self; two pecked stars mark the second coming."""
    return ("<g transform='translate(-38,-24) scale(0.82)' opacity='0.85'>" + quadruped("goat", outline=True) + "</g>"
            + "<g transform='translate(14,22)'>" + quadruped("goat") + "</g>"
            + circle(-96, -120, 9) + circle(-66, -132, 9))


def g_athir():
    """3. Athir (أثير, 'ether' / 'on the airwaves'): a round-head figure,
    arms open, broadcasting arcs of sound up into the air."""
    out = [human(0, 40, 0.95, arms="up")]
    r = rng(3)
    for i, rr in enumerate((58, 88, 120, 152)):
        # pecked, slightly irregular arcs (rock-art concentric arcs, not an icon)
        pts = []
        for k in range(41):
            a = math.radians(-168 + 156 * k / 40)
            q = rr + 3.5 * math.sin(k * 0.9 + i) + r.uniform(-1.5, 1.5)
            pts.append((q * math.cos(a) * 1.08, -92 + q * math.sin(a) * 0.82))
        d = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        out.append(stroke(d, 10 - 1.5 * i, f'stroke-dasharray="0.1 {15 + 3 * i}"'))
    out.append(stroke("M -112,-150 L -100,-140 L -88,-150", 5))  # birds riding the air
    out.append(stroke("M 96,-176 L 106,-168 L 116,-176", 4))
    # wind/air currents under the feet
    out.append(stroke("M -110,150 C -80,136 -50,164 -20,150 C 10,136 40,164 70,150 C 90,140 105,146 115,152", 7))
    return "".join(out)


def g_vrtx():
    """4. VRTX (vortex): an Archimedean whirl pecked into the rock, with
    small figures and pebbles being drawn into its eye."""
    pts = []
    turns = 3.3
    for i in range(400):
        t = i / 399
        a = t * turns * 2 * math.pi
        rr = 8 + 128 * t
        pts.append((rr * math.cos(a), rr * math.sin(a)))
    d = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    out = [stroke(d, 11)]
    # debris spiralling inward, getting smaller
    for k in range(9):
        t = 1.05 - k * 0.1
        a = t * turns * 2 * math.pi + 0.9
        rr = 8 + 128 * t + 18
        out.append(circle(rr * math.cos(a), rr * math.sin(a), 3 + 6 * t))
    out.append("<g transform='translate(118,-112) rotate(35) scale(0.32)'>" + human(arms="out") + "</g>")
    return "".join(out)


def g_damigha():
    """5. Damigha (الدامغة, 'the crushing / irrefutable one', the name given
    to a decisive poetic retort): an archer looses one arrow that splits
    its target."""
    out = [circle(-92, -86, 17)]
    out.append(stroke("M -92,-68 L -96,0", 12))  # torso
    out.append(stroke("M -96,0 L -124,62 M -96,0 L -64,58", 12))  # lunge
    out.append(stroke("M -94,-56 L -40,-56", 10))  # bow arm
    out.append(stroke("M -94,-56 L -74,-44 L -70,-56", 9))  # draw arm
    out.append(stroke("M -48,-118 C -16,-90 -16,-22 -48,6", 10))  # bow
    out.append(stroke("M -48,-118 L -70,-56 L -48,6", 4))  # string
    out.append(stroke("M -70,-56 L 92,-56", 7))  # arrow shaft
    out.append(fill("M 92,-56 L 74,-66 L 78,-56 L 74,-46 Z"))
    out.append(stroke("M -64,-56 L -76,-64 M -64,-56 L -76,-48", 5))
    out.append(circle(112, -56, 36, filled=False, w=10))
    out.append(circle(112, -56, 11))
    for a in (-70, -20, 25, 80, 140):  # the target shatters
        ra = math.radians(a)
        out.append(stroke(f"M {112+40*math.cos(ra):.1f},{-56+40*math.sin(ra):.1f} "
                          f"L {112+70*math.cos(ra+0.15):.1f},{-56+70*math.sin(ra+0.15):.1f}", 5))
    return f"<g transform='translate(-6,36)'>{''.join(out)}</g>"


SHROUD = ("M -128,6 C -130,-18 -110,-30 -92,-26 C -84,-24 -80,-18 -74,-15 "
          "C -40,-24 40,-22 96,-9 C 120,-3 134,8 127,19 C 119,30 96,31 60,31 "
          "C 10,33 -40,35 -74,27 C -80,31 -88,35 -98,35 C -116,35 -127,24 -128,6 Z")


def shroud_bindings():
    out = []
    for i, x in enumerate((-52, -14, 24, 62, 96)):
        k = 9 if i % 2 else -9
        out.append(f'<path d="M {x-k},-26 L {x+k},38" stroke="#000" stroke-width="5" fill="none"/>')
    return "".join(out)


def g_kfen():
    """6. Kfen K7el (كفن كحل, 'black shroud'): a body wrapped and laid to
    rest under a crescent moon, ringed by the stones of a Saharan tumulus."""
    out = [fill(SHROUD), shroud_bindings()]
    out.append(fill("M 26,-128 A 44,44 0 1 0 60,-52 A 34,34 0 1 1 26,-128 Z"))  # crescent
    r = rng(6)
    for i in range(17):  # tumulus ring
        a = math.pi * (0.02 + 0.96 * i / 16)
        x, y = 148 * math.cos(a), 84 + 40 * math.sin(a) - 8
        out.append(circle(x, y + r.uniform(-3, 3), 7 + r.uniform(-1.5, 2)))
    return "".join(out)


def g_clarity():
    """7. Clarity: an open eye under a rising sun; the haze lifts and the
    rays reach the ground."""
    out = [stroke("M -128,0 C -70,-74 70,-74 128,0 C 70,74 -70,74 -128,0 Z", 11)]
    out.append(circle(0, 0, 38, filled=False, w=12))
    out.append(circle(0, 0, 17))
    for i in range(11):  # lashes / rays fan above
        a = math.radians(-160 + i * 14)
        out.append(stroke(f"M {86*math.cos(a):.1f},{-6+64*math.sin(a):.1f} "
                          f"L {128*math.cos(a):.1f},{-6+104*math.sin(a):.1f}", 7))
    out.append(stroke("M -110,96 L 110,96", 7))
    out.append(stroke("M -80,120 L 80,120", 6))
    out.append(stroke("M -44,142 L 44,142", 5))
    return "".join(out)


def g_vantablack():
    """8. Vantablack (the near-perfect absorber of light): a disc gouged and
    filled solid; the sun's rays curl into it and do not return."""
    out = [circle(0, 0, 74)]
    for i in range(8):
        a0 = i * math.pi / 4
        pts = []
        for k in range(30):
            t = k / 29
            rr = 150 - 72 * t
            a = a0 + 1.2 * t ** 1.6
            pts.append((rr * math.cos(a), rr * math.sin(a)))
        d = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        out.append(stroke(d, 6 + 2 * (i % 2)))
    out.append(circle(0, 0, 92, filled=False, w=4))
    return "".join(out)


def g_sos():
    """9. SOS: a figure with both arms raised beside a signal fire; three
    short, three long, three short pecks run beneath it."""
    out = [human(-48, 18, 0.9, arms="up")]
    out.append(fill("M 70,104 C 40,96 36,60 56,36 C 60,56 70,58 72,44 C 74,22 88,6 92,-14 "
                    "C 104,10 120,40 112,72 C 108,92 94,104 70,104 Z"))  # flame
    for i, (dx, dy, r_) in enumerate(((84, -46, 11), (96, -80, 14), (82, -120, 17))):
        out.append(circle(dx, dy, r_, filled=False, w=6))  # smoke rings
    # ··· — — — ···  (Morse, pecked as dots and grooves, no letters)
    x = -128
    y = 142
    for kind in "sss lll sss".replace(" ", "|"):
        if kind == "|":
            x += 12
            continue
        if kind == "s":
            out.append(circle(x + 5, y, 6))
            x += 20
        else:
            out.append(stroke(f"M {x},{y} L {x+22},{y}", 11))
            x += 38
    return "".join(out)


def g_nova():
    """10. NOVA: a star that suddenly flares, with long and short rays,
    two shock-rings and scattered ejecta."""
    out = [circle(0, 0, 24)]
    for i in range(12):
        a = i * math.pi / 6
        L = 130 if i % 2 == 0 else 72
        out.append(stroke(f"M {34*math.cos(a):.1f},{34*math.sin(a):.1f} L {L*math.cos(a):.1f},{L*math.sin(a):.1f}",
                          10 if i % 2 == 0 else 7))
    out.append(f'<circle cx="0" cy="0" r="52" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="14 12"/>')
    out.append(f'<circle cx="0" cy="0" r="98" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="6 16"/>')
    r = rng(10)
    for _ in range(14):
        a = r.uniform(0, 2 * math.pi)
        rr = r.uniform(108, 150)
        out.append(circle(rr * math.cos(a), rr * math.sin(a), r.uniform(3, 6)))
    return "".join(out)


def g_alf9aron():
    """11. Alf9Aron, read here as ألف قرن ('a thousand centuries'; 'qarn' also
    means 'horn'). ARTISTIC INTERPRETATION: a lyre-horned cow of Tassili's
    cattle period stands over rows of tally marks counting the ages."""
    out = ["<g transform='translate(-14,4) scale(0.95)'>" + quadruped("lyre") + "</g>"]
    for row, y in enumerate((112, 140)):
        for i in range(13 if row == 0 else 9):
            x = -118 + i * 18 + (row * 18)
            out.append(stroke(f"M {x},{y-10} L {x+2},{y+10}", 6))
        out.append(stroke(f"M {-124+row*18},{y+4} L {116 - (4-row*4)*18 if row else 116},{y-6}", 4))
    return "".join(out)


def hand(s=1.0, spread=1.0):
    out = [fill("M -40,10 C -44,-30 -36,-50 -30,-54 L 34,-54 C 42,-46 46,-20 42,12 "
                "C 38,46 20,62 0,62 C -24,62 -38,44 -40,10 Z")]
    fingers = [(-30, -50, -48, -128), (-10, -54, -14, -150), (12, -54, 16, -146),
               (32, -48, 46, -116), (40, 6, 92, -30)]
    for x1, y1, x2, y2 in fingers:
        out.append(stroke(f"M {x1},{y1} L {x1+(x2-x1)*spread:.1f},{y2}", 22))
    return f"<g transform='scale({s})'>{''.join(out)}</g>"


def g_legacy():
    """12. Legacy: the oldest signature in rock art: an adult's hand and,
    pressed beside it, a child's hand: what is passed on."""
    return ("<g transform='translate(-36,10) rotate(-12)'>" + hand(1.0) + "</g>"
            + "<g transform='translate(82,58) rotate(14)'>" + hand(0.55) + "</g>")


def g_goat():
    """13. GOAT: the original. One Barbary sheep alone on the summit, the sun
    resting between its horns like a crown."""
    out = [stroke("M -150,138 L -86,62 L -60,82 L -12,26 L 30,64 L 62,40 L 150,138", 10)]
    out.append(stroke("M -60,138 L -30,104 M 20,138 L 46,100", 5))
    out.append("<g transform='translate(-14,-30) scale(0.74)'>" + quadruped("goat") + "</g>")
    out.append(circle(66, -128, 20, filled=False, w=8))
    for i in range(8):
        a = i * math.pi / 4
        out.append(stroke(f"M {66+28*math.cos(a):.1f},{-128+28*math.sin(a):.1f} "
                          f"L {66+40*math.cos(a):.1f},{-128+40*math.sin(a):.1f}", 5))
    return "".join(out)


SONGS = [
    ("Oblivion", g_oblivion),
    ("GOAT II", g_goat2),
    ("Athir", g_athir),
    ("VRTX", g_vrtx),
    ("Damigha", g_damigha),
    ("Kfen K7el", g_kfen),
    ("Clarity", g_clarity),
    ("Vantablack", g_vantablack),
    ("SOS", g_sos),
    ("NOVA", g_nova),
    ("Alf9Aron", g_alf9aron),
    ("Legacy", g_legacy),
    ("GOAT", g_goat),
]

# ---------------------------------------------------------------- layout


def glyph_positions():
    """Songs 1..13 are dealt round the logo by the golden ratio (sunflower
    rule): each song advances 5/13 of the way round the ring from the last
    (5/13 = F5/F7, the Fibonacci approximation of 1/φ², i.e. the golden angle).
    Slots are measured by arc length so the stretched ring stays even.
    The ring is rotated so track 13, GOAT, crowns the top of the cover."""
    rx, ry = 800, 1265
    N = 4000
    pts = [(rx * math.cos(2 * math.pi * k / N - math.pi / 2), ry * math.sin(2 * math.pi * k / N - math.pi / 2))
           for k in range(N + 1)]
    cum = [0.0]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        cum.append(cum[-1] + math.hypot(x1 - x0, y1 - y0))
    P = cum[-1]
    pos = []
    for i in range(1, 14):
        f = (((i - 13) * 5) % 13) / 13  # 5/13 = F5/F7 ≈ 1/φ²: golden step on 13 even slots
        target = f * P
        k = next(j for j, c in enumerate(cum) if c >= target)
        x, y = pts[k]
        wob = 1 + 0.02 * math.sin(i * 2.4)
        pos.append((CX + x * wob, CY + y * wob))
    return pos


GLYPH_SCALE = 1.22


def fibonacci_squares(w0):
    """Square-by-square Fibonacci (golden) spiral construction.
    Returns squares, arc path, and the limit ('eye') point."""
    x, y, w, h = 0.0, 0.0, w0, w0 * PHI
    squares, arcs = [], []
    px, py = x, y  # spiral starts at top-left
    for step in range(16):
        k = step % 4
        if k == 0:   # square on top
            s = w; sq = (x, y, s, s); y += s; h -= s
        elif k == 1:  # square on right
            s = h; sq = (x + w - s, y, s, s); w -= s
        elif k == 2:  # square on bottom
            s = w; sq = (x, y + h - s, s, s); h -= s
        else:         # square on left
            s = h; sq = (x, y, s, s); x += s; w -= s
        sx, sy, ss, _ = sq
        end = [(sx + ss, sy + ss), (sx, sy + ss), (sx, sy), (sx + ss, sy)][k]
        squares.append(sq)
        arcs.append((ss, end))
    eye = (x + w / 2, y + h / 2)
    d = f"M {px:.2f},{py:.2f} " + " ".join(f"A {r:.2f},{r:.2f} 0 0 1 {ex:.2f},{ey:.2f}" for r, (ex, ey) in arcs)
    return squares, d, eye


def geometry_layer():
    out = []
    squares, spiral_d, eye = fibonacci_squares(1950)
    dx, dy = CX - eye[0], CY - eye[1]
    g = [f"<g transform='translate({dx:.1f},{dy:.1f})'>"]
    g.append(stroke(spiral_d, 9))
    for i, (sx, sy, ss, _) in enumerate(squares[:9]):
        g.append(f'<rect x="{sx:.1f}" y="{sy:.1f}" width="{ss:.1f}" height="{ss:.1f}" fill="none" '
                 f'stroke="#fff" stroke-width="3.2" stroke-dasharray="{"" if i < 4 else "2 9"}" opacity="0.75"/>')
    g.append("</g>")
    out.append("".join(g))

    # golden-ratio guides: lines at 1/φ² and 1/φ of the page in both axes,
    # pecked very faintly (structure, not decoration)
    for f in (1 / PHI ** 2, 1 - 1 / PHI ** 2):
        X, Y = W * f, H * f
        out.append(f'<line x1="{X:.1f}" y1="0" x2="{X:.1f}" y2="{H}" stroke="#fff" stroke-width="2.5" '
                   f'stroke-dasharray="3 14" opacity="0.5"/>')
        out.append(f'<line x1="0" y1="{Y:.1f}" x2="{W}" y2="{Y:.1f}" stroke="#fff" stroke-width="2.5" '
                   f'stroke-dasharray="3 14" opacity="0.5"/>')

    # circular waveform rings around the logo: a sound wave wrapped around SKORP
    r = rng(99)
    env = [r.uniform(0.2, 1) for _ in range(64)]
    for ring, (R, amp, freq, sw) in enumerate(((SLOT_R + 46, 16, 72, 6), (SLOT_R + 84, 9, 144, 4))):
        pts = []
        N = 1440
        for k in range(N + 1):
            a = 2 * math.pi * k / N
            e = env[int(k / N * 64) % 64] * 0.6 + 0.4 * env[(int(k / N * 64) + 1) % 64]
            rr = R + amp * e * math.sin(freq * a + ring)
            pts.append((CX + rr * math.cos(a), CY + rr * math.sin(a)))
        out.append(stroke("M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", sw))
    out.append(circle(CX, CY, SLOT_R + 122, filled=False, w=3))

    # top and bottom friezes: an audio waveform pecked as tally strokes.
    # Bars follow a Fibonacci-ish envelope; reads as both rock-art tally and sound.
    for yb, seed in ((150, 7), (H - 150, 8)):
        r = rng(seed)
        n = 89  # a Fibonacci number of bars
        x0, x1 = 210, W - 210
        for i in range(n):
            t = i / (n - 1)
            x = x0 + (x1 - x0) * t
            env = (math.sin(math.pi * t) ** 0.7) * (0.55 + 0.45 * abs(math.sin(t * 21 + seed)))
            hgt = 8 + 54 * env * r.uniform(0.6, 1.0)
            out.append(stroke(f"M {x:.1f},{yb-hgt:.1f} L {x:.1f},{yb+hgt:.1f}", 7))
        out.append(stroke(f"M {x0-40},{yb} L {x1+40},{yb}", 3))

    # thin sine frequency lines flowing along the spiral side of the page
    for k, (y0, amp, per) in enumerate(((290, 14, 140), (322, 8, 70), (H - 290, 14, 140), (H - 322, 8, 70))):
        pts = [(x, y0 + amp * math.sin(2 * math.pi * x / per + k) * math.sin(math.pi * x / W))
               for x in range(150, W - 149, 6)]
        out.append(stroke("M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts), 4 if k % 2 else 5,
                          'opacity="0.8"'))
    return "".join(out)


def glyph_layer():
    out = []
    for (name, fn), (x, y) in zip(SONGS, glyph_positions()):
        out.append(f"<g id='g-{name}' transform='translate({x:.1f},{y:.1f}) scale({GLYPH_SCALE})'>{fn()}</g>")
    return "".join(out)


DEEP = {  # local-coordinate shapes carved deepest and filled with solid soot-black
    "Kfen K7el": fill(SHROUD) + shroud_bindings(),
    "Vantablack": circle(0, 0, 74),
}


def deep_layer():
    out = []
    for (name, _), (x, y) in zip(SONGS, glyph_positions()):
        if name in DEEP:
            out.append(f"<g transform='translate({x:.1f},{y:.1f}) scale({GLYPH_SCALE})'>{DEEP[name]}</g>")
    return "".join(out)


def slot_layer():
    return circle(CX, CY, SLOT_R)


def svg(layer):
    body = {"glyphs": glyph_layer, "geometry": geometry_layer, "slot": slot_layer, "deep": deep_layer}[layer]()
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="#000"/>{body}</svg>')


if __name__ == "__main__":
    import sys, os
    outdir = sys.argv[1]
    for layer in ("glyphs", "geometry", "slot", "deep"):
        with open(os.path.join(outdir, f"mask_{layer}.svg"), "w") as f:
            f.write(svg(layer))
    # combined preview for layout checks
    with open(os.path.join(outdir, "mask_preview.svg"), "w") as f:
        f.write(svg("geometry").replace("</svg>", "")
                + f"<g opacity='1'>{glyph_layer()}</g>{slot_layer()}</svg>")
