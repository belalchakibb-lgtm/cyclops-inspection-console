# SKORP: petroglyph book cover

Front cover, 2400 × 3600 px (8 × 12 in at 300 dpi), rendered procedurally:
a sandstone height field (strata, grain, flaking, desert varnish, cracks) with
every engraving *carved* into it as a groove, lit by a low raking light.
The cover has no text of any kind.

## Status of the central logo

No reference photo of the SKORP clothing-brand logo was available, so the
centre is left as a **dressed, empty cartouche**. Nothing was invented in its
place. To engrave the real logo:

```bash
pip install numpy scipy pillow
python3 glyphs.py build
node rasterize.cjs build glyphs geometry slot deep
python3 render.py build skorp-cover.png --logo path/to/skorp-logo.png
#   --invert-logo     if the logo is light-on-dark
#   --logo-scale 1.0  to enlarge it (default 0.94 of the cartouche)
```

The logo is traced from the file (alpha channel, or an automatic dark/light
threshold), keeping its exact silhouette and proportions, and carved as the
deepest, darkest engraving on the wall.

## Composition (golden ratio)

- **Fibonacci spiral:** built square by square from the golden-rectangle
  construction. Its eye sits exactly under the logo, so the whole wall unwinds
  from SKORP. The first construction squares are pecked faintly behind it.
- **Song order = golden angle:** each track advances 5/13 of the way round
  the ring from the previous one. 5/13 is the Fibonacci approximation of
  1/φ², which is the golden angle (137.5°, the sunflower-seed rule). Track 13, GOAT, crowns the top.
- **Golden sections:** faint pecked guide lines at 1/φ² and 1 − 1/φ² of the page.
- **Sound:** two waveform rings wrapped around the logo; top and bottom
  friezes of 89 pecked bars (a Fibonacci number) shaped like an audio
  waveform that also read as rock-art tally marks; thin frequency lines.

## The 13 petroglyphs

Detailed song lyrics could not be verified from reliable sources. Each
glyph is therefore based on the **meaning of the title** (most titles are
Algerian Arabic) and on Tassili n'Ajjer rock-art vocabulary. Every one is an
**artistic interpretation**, not an official meaning.

| # | Song | Title meaning used | Petroglyph |
|---|------|--------------------|------------|
| 1 | Oblivion | النسيان: forgetting | A round-head figure whose lower body crumbles into drifting pecked dust |
| 2 | GOAT II | the sequel / the return | A solid Barbary sheep standing over the hollow outline of its former self; two stars |
| 3 | Athir | أثير: the ether; "on air" / the airwaves | A figure with arms raised sends pecked arcs of sound into the sky; birds ride the air |
| 4 | VRTX | vortex | A whirling spiral with pebbles and a tiny figure being pulled into its eye |
| 5 | Damigha | الدامغة: "the crushing / irrefutable one", the classic name for a decisive poetic retort | An archer's single arrow splits its target |
| 6 | Kfen K7el | كفن كحل: "black shroud" | A bound, shrouded body under a crescent moon, ringed by tumulus stones; carved deepest and filled soot-black |
| 7 | Clarity | clarity | An open eye under a fan of rays, above calm horizon lines |
| 8 | Vantablack | the near-perfect light absorber | A solid soot-black disc; the sun's rays curl into it and do not come back |
| 9 | SOS | distress signal | A figure with both arms up beside a signal fire and smoke rings; beneath, ··· — — — ··· pecked as dots and grooves (no letters) |
| 10 | NOVA | a star's sudden flare | A burst of long and short rays, shock rings and scattered ejecta |
| 11 | Alf9Aron | read as ألف قرن: "a thousand centuries". *Qarn* also means "horn", so this reading is the least certain | A lyre-horned cow from Tassili's Cattle Period above rows of tally marks counting the ages |
| 12 | Legacy | what is passed on | An adult hand and a child's hand pressed side by side, the oldest signature in rock art |
| 13 | GOAT | greatest of all time / the original | A lone Barbary sheep on the summit, with the sun between its horns like a crown |

## Files

- `glyphs.py`: all engravings as SVG carving masks (one function per song)
- `rasterize.cjs`: renders the masks with headless Chromium
- `render.py`: sandstone, carving, pigment, lighting and colour grade
