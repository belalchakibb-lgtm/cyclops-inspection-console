# PROJECT: ZERO — Story Bible

## Premise
**2037, Ashford Bay.** Helix Dynamics runs the *Cell Renewal Trial*, led by **Dr. Elias Voss**: a compound that repairs any damaged human cell. Two weeks after the public rollout, the infected appear. They are feverish, voiceless and drawn to noise and light. The city collapses in eleven days.

The player wakes up in Ward 3B of St. Aurelia Medical Center. They have no memory, and their hospital wristband reads **SUBJECT 00**.

## Main cast
| Character | Role |
|---|---|
| **Subject 00 (the player)** | Has cells that never age. Was kept sedated "away from the Cube until the timeline stabilises". |
| **Maya Torres** | Former paramedic and the first survivor you meet. Sharp and wary. Her trust in you is tracked across chapters. |
| **Dr. Elias Voss** | Helix project lead. Appears as the obvious villain but is the tragic center of the story. |
| **Director Adrian Kell** | Helix board chair. The "man in the white coat" from the notes, and the real villain. |
| **The Warden** | Chapter 1 boss: the hospital's former security chief, infected and armoured. |
| **"Z"** | An unknown author who leaves notes for the player. (The twist: Z is the player.) |

## The ZERO CUBE
A black cube that moves matter through time. Voss believes he *found* it. In fact the player built it, at the end of the story, and sent it back. The cure needed a "template" of cells that never age. That template is Subject 00, whose cells were changed by repeated trips through time. **The outbreak exists because the player exists**, and the player exists because the outbreak forced them to build the Cube. It's a closed time loop.

---

## Chapter 1 — The Outbreak  ✅ BUILT
1. **Intro cinematic:** radio broadcasts, the silent city, a recording that says "Do NOT wake the subject…". The player wakes up.
2. **Ward 3B → nurse station:** find a flashlight (tutorial: move, interact, light). Read the *Patient Log*, which hints at the Helix connection.
3. **Storage:** find a steel pipe. The noise draws the first infected down the corridor (tutorial: combat).
4. **Emergency Room** (three infected): find the *Shift Note* with the security code. The code is **randomised every playthrough**.
5. **Security office (keypad puzzle):** the CCTV log shows hazmat figures placing a black cube on your chest. *"Zero is stable. Tell Voss it worked."* Take the keycard.
6. **Lobby (ambush):** the keycard opens the chained doors, and a cinematic reveals the dead city and a red flare.
7. **Pharmacy:** meet Maya. **Dialogue choices** change `mayaTrust` and `showedWristband`.
8. **Police Precinct 9:** solve the **breaker puzzle** (hint in the *Maintenance Memo*; breaker 2 is a trap). Get the fuse from the armory. A Brute guards the precinct.
9. **Subway generator:** installing the fuse wakes **the Warden** (boss, cinematic). He has a telegraphed ground slam, summons infected, and his health scales with party size.
10. **Escape:** the gate opens, Maya joins you, and you head into the tunnels. **Final twist card:** a photo in your pocket shows *you* standing beside Dr. Voss.

**Hidden research files (5):** a secret room behind a bookshelf in Records, behind the ambulance, in the alley, at the newsstand, and in the subway ticket booth. Together they reveal the trial's side effects, Voss's doubts about where the Cube came from, a "timeline" transfer order, and a message from **Z**.
**Optional:** a Fire Axe in the Collapsed Offices (stronger weapon, achievement).

## Chapter 2 — The Survivors  (designed)
- **Shelter EAGLE-3**, an abandoned military bunker reached through the subway tunnels, which start out dark with ambushes by Runners.
- Characters: **Sgt. Rhea Okafor** (pragmatic leader), **Theo** (a teenage radio operator), **Dr. Anya Brandt** (an ex-Helix chemist hiding her past).
- **Dialogue choices:** whether to reveal you are Subject 00. Okafor wants to hand you to the military, Brandt wants to study you, and Maya's trust decides whether she backs you.
- **Discovery:** the Helix board's insurance files show the outbreak was **deliberate**. Kell released the compound early to sell the "cure" contract to governments.
- Puzzles: radio frequency tuning, a generator room with a power-routing puzzle, and a locked archive with a fingerprint scanner (Brandt helps only if her secret is protected).
- Boss: **The Choir**, a pack of infected that coordinate by sound. Players must stay quiet and use distraction devices.

## Chapter 3 — The Secret Lab  (designed)
- **Helix Dynamics, Sublevel 4**: an underground research facility with keycard tiers, laser grids, coolant-valve and cipher-terminal puzzles, and hidden rooms.
- **Voss's recordings** (audio logs with subtitles) show that he begged the board to stop.
- **Discovery of the ZERO CUBE**: a long cinematic. Touching it shows flashes of you building it.
- Twist: Brandt (or Okafor, depending on Chapter 2 choices) betrays the group to Kell's security.
- Boss: **Specimen V**, the first successful trial subject.

## Chapter 4 — The Past  (designed)
- Time travel to **May 2035**, Ashford Bay before the fall: daylight, crowds and a working city, built from the same street layout to create emotional contrast.
- Explore Voss's laboratory as a visitor. Meet the *young* Voss, who recognises you even though he has never met you.
- **Decisions:** warn Voss or steal his notes, trust young Maya (a paramedic trainee) or avoid her, sabotage the trial or document it.
- Discover the truth: Kell is already planning the early release, and the Cube in 2035 is the one you will bring back.

## Chapter 5 — Project Zero  (designed)
- The final day of the experiment, at the Helix launch event.
- **Biggest twist:** "Z" is you. The notes, the transfer order and the timeline stabilisation were all left by you, on earlier loops.
- Final boss: Kell injected with an unstable compound, in a fight across collapsing timelines.
- **Final decision** at the Cube:

### Endings
| Ending | Requirement | Outcome |
|---|---|---|
| **Good** | Destroy the Cube | The trial is stopped and Voss lives to publish safely. You fade from the timeline, but Maya keeps a photo she doesn't remember taking. |
| **Bad** | Take the Cube for yourself, or hand it to Kell | Kell launches early. The outbreak happens anyway, two years sooner. The final shot is you waking up in Ward 3B again. |
| **Secret** | All 25 research files across the game + `mayaTrust ≥ 6` + you showed Maya the wristband in Ch1 | You and Maya rewrite the loop. Instead of a warning, you leave the *cure formula* for Voss. The city is saved and you keep your memories. You sign the note: **Z**. |

The flags these endings need are already saved: `storyFlags.mayaTrust`, `storyFlags.showedWristband`, `documents.*`, `storyFlags.ch1Complete`.

---

## Tone and audience rules
- Suspense, mystery and atmosphere. No gore: the infected collapse and fade when defeated.
- Infected are fictional and visually stylised (pale skin, glowing eyes).
- Every chapter should feel like an episode: a cold-open cinematic, rising tension, a boss, and a twist card at the end.
