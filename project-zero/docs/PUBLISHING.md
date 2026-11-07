# Publishing & Monetization Setup

The steps below need **your** Roblox account, so code can't do them for you. Each one takes a few minutes on create.roblox.com, which also works in a phone browser once the game has been published from Studio.

## 1. Publish (Studio, one time)
1. Open `build/ProjectZero.rbxlx` in Roblox Studio.
2. **File → Publish to Roblox → Create new experience.** Name it `PROJECT: ZERO`.
3. **Home → Game Settings:**
   - **Security:** turn on *Enable Studio Access to API Services* (needed to test saving in Studio).
   - **Places → (your place) → Max players:** `4` (co-op party size).
   - **Monetization → Private Servers:** optional. Set a price, or leave it free so friends can play together privately.
   - **Avatar:** R15 recommended (the zombies and swing animation are built for R15).
4. Publish again after changing settings.

## 2. Maturity questionnaire
Fill it in honestly at create.roblox.com → your experience → *Maturity & Compliance*. The game has fantasy violence against fictional infected, no blood or gore, and suspense themes.

## 3. Cosmetic shop (optional, Robux)
All monetization is **cosmetic only**: story chapters and gameplay advantages are never sold.

1. create.roblox.com → your experience → **Monetization → Passes → Create a Pass.** Name it `VIP`, put it on sale and copy its **ID**.
2. **Monetization → Developer Products → Create.** Make three products and copy each **ID**:
   - `Hazmat Bundle` (suggested 99 R$)
   - `Night Ops Bundle` (suggested 149 R$)
   - `Survivor Emotes` (suggested 49 R$)
3. Open `src/shared/Config.lua` and paste the IDs:
   ```lua
   Config.Monetization = {
       VipGamePassId = 123456789,           -- your pass ID
       Products = {
           { key = "bundle_hazmat",  productId = 111, ... },
           { key = "bundle_nightops", productId = 222, ... },
           { key = "emote_pack",     productId = 333, ... },
       },
   }
   ```
   You can also edit `Shared → Config` directly inside Studio.
4. Rebuild (`python3 tools/build_rbxlx.py`) or edit in Studio, then publish.

Until IDs are added, the shop shows "not open yet" and nothing can be bought.

### How purchases are secured
- Purchases are only prompted from the **server** (`BuyProduct` remote → `MarketplaceService:PromptProductPurchase`).
- `ProcessReceipt` grants items on the server, records the `PurchaseId` in the player's profile, **saves**, and only then returns `PurchaseGranted`. If the save fails, it rolls back and returns `NotProcessedYet`, so Roblox retries. A purchase can never be granted twice or lost.
- VIP is checked with `UserOwnsGamePassAsync` on join and granted immediately after `PromptGamePassPurchaseFinished`.

## 4. Audio (optional upgrade)
The game uses Roblox's built-in sounds, so it works with no setup. For richer atmosphere, find free audio in **Studio → Toolbox → Audio**, copy the IDs into `Config.Sounds` (`AmbientHospital`, `AmbientCity`, `MusicMenu`, `MusicTension`, `MusicBoss`) and republish. Empty entries are skipped safely.

## 5. Before going public
- Run the checklist in [REPORT.md](REPORT.md#manual-test-plan-studio).
- Add a game icon and thumbnails. Screenshots from the intro cinematic work well.
- Description idea: *"Wake up in an abandoned hospital with no memory. Escape the infected city, uncover the truth behind the Helix trial and the mysterious ZERO CUBE. Solo or co-op (4 players)."*
