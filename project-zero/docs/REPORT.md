# Development Report — PROJECT: ZERO

_Stages 1–4 and the core of Stages 6–7 are complete for Chapter 1. This file lists honestly what is built, how it was checked, and what is left._

## How this was verified
I wrote this in a cloud environment that **can't run Roblox Studio**, so I could not play-test it. Here is what was checked:

| Check | Tool | Result |
|---|---|---|
| Syntax of all 45 scripts | `tools/lint.cjs` (Lua parser) | ✅ pass |
| Undefined globals / typos | `tools/lint.cjs` (scope analysis vs Roblox globals) | ✅ pass |
| Every `require` target exists | `tools/lint.cjs` | ✅ pass |
| Every cross-module call (`Services.X.fn()`, `UI.fn()`, …) exists | `tools/lint.cjs` | ✅ pass |
| Every RemoteEvent name used is declared | `tools/lint.cjs` | ✅ pass |
| Story data integrity (dialogue links, doc/item/achievement/cosmetic/cinematic/door IDs) | one-off script | ✅ pass |
| Place file is valid XML with all 45 scripts | `tools/build_rbxlx.py` + XML parse | ✅ pass |
| Roblox-aware lint + official Rojo build | GitHub Actions (`.github/workflows/project-zero.yml`) | runs on every push; see the Actions tab |

**Not yet verified, because it needs Roblox:** actual gameplay feel, frame rate on phones, zombie pathing through every doorway, lighting look, and the purchase prompts. The [manual test plan](#manual-test-plan-studio) below covers these.

## ✅ Completed

### Stage 1 — Structure & prototype
- Rojo-compatible project, a one-file place build, modular services and controllers.
- Secure networking layer: central remote list, per-player rate limits, `pcall`-wrapped handlers, type checks.

### Stage 2 — Chapter 1 *The Outbreak* (fully playable start → finish)
- Procedural world: St. Aurelia hospital (9 rooms + a hidden room), plaza, Harbor Avenue, Kessler Street, pharmacy, Police Precinct 9 with armory, collapsed offices, alley, newsstand, and the Line 4 subway plaza with a gate and tunnel.
- 10 story stages, each a checkpoint: flashlight → pipe → code → keypad → keycard → lobby → Maya → fuse → generator → Warden → escape.
- Puzzles: a randomised 4-digit keypad code, the breaker panel (with a trap breaker), a keycard reader, the generator fuse, and a secret bookshelf door.
- 5 story documents and 5 hidden research files; an optional Fire Axe; bandage and medkit pickups plus drops.
- Branching dialogue with Maya; choices are saved as story flags for later chapters and endings.
- Contextual tutorials adapted to PC or touch, each shown once.

### Stage 3 — Zombie AI & player systems
- 5 infected types: Infected, Runner, Brute, Mutated (rare, slows you), and **The Warden** boss (telegraphed slam, summons, scales with party size).
- Detection by sight with line of sight, hearing of sprinting players, and attraction to flashlights. Chasing uses direct movement or throttled pathfinding, with stuck recovery, wind-up attacks, despawning and a population cap.
- Non-gory defeat (collapse and fade). Roblox zombie animation pack, glowing eyes.
- Player: health with slow passive regen, server-side sprint stamina, flashlight, melee weapons with server hit detection, inventory and consumables, a document reader, a mission tracker with a waypoint, and a map.

### Stage 4 — Cinematics
- Data-driven cinematic system: camera glides, letterbox, subtitles, title cards, fades, flicker, shake, and a **skip button**.
- 5 cinematics: intro, lobby reveal, meeting Maya, Warden reveal, escape plus the twist card. All are short. Players are invulnerable and ignored by zombies while watching.

### Stage 6 — Multiplayer & saving
- Co-op for up to 4 players with a shared story session and synced objectives. Key items are shared with the party; equipment and documents are personal.
- Downed and revive system (hold to revive, 30 s timer, party wipe rule) and multiplayer checkpoints.
- Late joiners, respawns and save resumes restore world state (doors, items, equipment), so no one can be soft-locked.
- Party invitations (`SocialService:PromptGameInvite`); private servers can be enabled in settings.
- DataStore profiles: `UpdateAsync` only, session locking, retries with backoff, autosave every 2 minutes, save on leave and on `BindToClose`, a safe kick on load failure, and a Studio fallback that tells you saves are off.

### Stage 7 — Monetization (cosmetic only)
- VIP Game Pass and 3 cosmetic bundles through `MarketplaceService`.
- Idempotent `ProcessReceipt` with save-before-grant and rollback.
- The shop hides items until you add real IDs, so there are no fake purchases.

### Retention
- 14 achievements (with cosmetic rewards), daily cosmetic rewards with streaks, research-file collection, a replayable chapter with best-time tracking, and story flags for multiple endings.

### UI (mobile, tablet, PC)
- Main menu (PLAY / CHAPTERS / INVENTORY / SETTINGS / SHOP / DAILY / INVITE / CREDITS), pause menu, and chapter-complete summary.
- HUD: health, stamina, objective, party key items, toasts, hints and boss bar.
- Bag with tabs (Items / Files / Style / Awards), map, keypad and dialogue box.
- Auto-scaling UI, safe-area insets, native touch buttons (RUN / LIGHT), and large touch targets.
- Settings: graphics (Auto/Low/Medium/High), music and effects volume, subtitles, camera shake and tutorials. All are saved.

### Graphics & performance
- Future lighting, atmosphere haze, colour grading, bloom, sun rays and depth of field on High.
- Flickering lights (handled on the client), fire barrels, a rooftop flare with smoke, glowing pickups.
- Optimized anchored geometry, no per-zombie scripts, and particles turned off on Low.

## ⏳ Remaining work
| Item | Notes |
|---|---|
| **Play-test Chapter 1 in Studio** | Use the test plan below. Expect tuning: zombie speed, damage, prompt distances, lighting. |
| Chapters 2–5 | Fully designed in [STORY.md](STORY.md); the world builder, mission and cinematic systems are ready to reuse. |
| Endings (Good / Bad / Secret) | Designed. The flags they need are already being saved. |
| Better audio | Built-in Roblox sounds are used now. Add Creator Store audio IDs in `Config.Sounds`. |
| Custom animations | Roblox standard packs are used now. Custom zombie attack, lunge or crawl animations need the Animation Editor in Studio. |
| Real shop IDs | Create the Game Pass and Products on create.roblox.com, see [PUBLISHING.md](PUBLISHING.md). |
| Optional Stage 5 locations | Abandoned school, forest and time-travel facility belong to Chapters 2–4. |

## Manual test plan (Studio)
1. **Single player, full run:** press Play, then PLAY → START CHAPTER 1. Complete all 10 objectives. Check that each objective marker points to the right place and that the chapter summary appears.
2. **Skip cinematics:** the SKIP button works for every cinematic, and the camera returns to the player.
3. **Phone:** Test → Device → iPhone. The RUN and LIGHT buttons show, prompts can be tapped, the menu and bag fit the screen, and the weapon swings on tap.
4. **Co-op:** Test → Clients and Servers → 3 players. Player 1 picks up the keycard and Player 2 uses the reader. Down a player and revive them. A new client that joins mid-chapter spawns at the checkpoint with a flashlight and pipe.
5. **Saving:** turn on API access, reach the pharmacy, stop, then Play → CONTINUE. You should resume at "Pharmacy", with the lobby open and Maya's objective active.
6. **Purchases:** with test IDs added, buy a bundle and confirm the cosmetic appears in Bag → Style. Rejoin and confirm it's still owned.
7. **Exploit spot-checks:** wrong keypad codes stay locked, and the generator won't take a fuse you don't have.
