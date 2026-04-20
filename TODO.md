# PIZZA.RUN Rebrand — TODO

Execution checklist derived from [SPEC.md](./SPEC.md). Work top-to-bottom; each numbered stage is an independent commit. Game remains runnable at every stage boundary.

---

## Stage 1 — Strings Pass (`index.html` + `js/constants.js`) ✅ COMPLETE

### `index.html`
- [x] Line 6: `<title>DEATH.RUN — Escape Hell</title>` → `<title>PIZZA.RUN — Deliver Hot</title>`
- [x] Line 16: title heading `DEATH.RUN` → `PIZZA.RUN`
- [x] Line 17: tagline `// ESCAPE HELL OR DIE TRYING //` → `// DELIVER HOT OR DIE TRYIN' //`
- [x] Line 18: start prompt `[ PRESS SPACE TO DESCEND ]` → `[ PRESS SPACE TO SLICE ]`
- [x] Line 21: death heading `⚰ WASTED ⚰` → `🍕 DROPPED 🍕`
- [x] Line 24: stat label `SOULS COLLECTED:` → `PEPPERONIS COLLECTED:`
- [x] Line 25: stat label `OBSTACLES EVADED:` → `HAZARDS DODGED:`
- [x] Line 27: stat label `CAUSE OF DEATH:` → `DELIVERY FAILED BY:`
- [x] Line 27: default cause `SKILL ISSUE` → `DOUGH ISSUES`
- [x] Line 29: restart prompt `[ PRESS SPACE TO DESCEND AGAIN ]` → `[ PRESS SPACE TO DELIVER AGAIN ]`
- [x] Line 37: HUD label `SOULS` → `PEPPERONIS` (keep `DISTANCE`, `SPEED`, `COMBO`)
- [ ] ~~Update favicon link~~ — no `<link rel="icon">` exists in index.html; deferred to a polish pass when a favicon asset is added

### `js/constants.js` — `OBSTACLE_TYPES` (names only, keep `pattern` keys unchanged)
- [x] `HELLFIRE PILLAR` → `OVEN FLAME` (pattern: `pillar`)
- [x] `DEMON SKULL` → `MEATBALL OF DOOM` (pattern: `skull`)
- [x] `BONE SAW` → `PIZZA CUTTER` (pattern: `saw`)
- [x] `LAVA GEYSER` → `TOMATO SAUCE GEYSER` (pattern: `geyser`)
- [x] `BLOOD SPIKE` → `PARMESAN SHARD` (pattern: `spike`)
- [x] `CHAIN WHIP` → `MOZZARELLA STRETCH` (pattern: `chain`)

### `js/constants.js` — `COMBO_TAUNTS` (9 entries, indices 0–8)
- [x] [0] `''` (unchanged)
- [x] [1] `''` (unchanged)
- [x] [2] `'NOT BAD...'` (unchanged — tone-neutral)
- [x] [3] `'UNHOLY'` → `'SAUCY!'`
- [x] [4] `'DEMONIC!'` → `'EXTRA CHEESE!!'`
- [x] [5] `'BLASPHEMOUS!!'` → `'DELIZIOSO!!!'`
- [x] [6] `'SACRILEGE!!!'` → `"CHEF'S KISS!!!!"`
- [x] [7] `'GODKILLER!!!!'` → `'PIZZA GOD!!!!!'`
- [x] [8] `'BEYOND DEATH!!!!!'` → `'LEGENDARY DELIVERY!!!!!'`

### `js/game-loop.js` — death-cause string formatting sanity check
- [x] Verified: `die(cause)` at line 211 receives `o.type.name` directly (line 142); no hardcoded formatting. New obstacle names (max length 19 chars: `TOMATO SAUCE GEYSER`) render cleanly in `DELIVERY FAILED BY:` field without code changes.

### Stage 1 verification
- [ ] Load game — title screen, HUD labels, and death screen all read as PIZZA.RUN
- [ ] Build a combo 2–8 → correct taunts fire at each threshold
- [ ] Die on each of 6 obstacles → death screen shows new name in `DELIVERY FAILED BY:`
- [ ] Commit: `rebrand(stage-1): DEATH.RUN → PIZZA.RUN strings + taunts`

---

## Stage 2 — Palette Pass ✅ COMPLETE

### `js/constants.js` — `OBSTACLE_TYPES` colors
- [x] `pillar` color → `#ff8800` (warm orange)
- [x] `skull` color → `#7a3a1a` (meatball brown)
- [x] `saw` color → `#e0e0e0` (chrome)
- [x] `geyser` color → `#cc2222` (tomato red)
- [x] `spike` color → `#f4d35e` (parmesan tan)
- [x] `chain` color → `#fff8dc` (cheese cream)

### `css/style.css`
- [x] Body background: `#000` → `#f7e4c4` (warm cream)
- [x] Title glow: `#ff0033` → `#e63946` tomato red + `#ffd166` yellow outline (implemented via layered text-shadow offsets)
- [x] HUD primary accent: `#ff0033` → `#e63946`
- [x] HUD secondary accent: `#ffaa00` → `#2a9d8f` (basil green) for start/restart prompts & speed panel
- [x] Souls/pepperoni HUD value: `#aa00ff` → `#c8102e` (pepperoni red)
- [x] HUD panel bg: `rgba(0,0,0,0.4)` → `rgba(255,245,220,0.45)` (cream)
- [x] Death screen stat-border, colors, and bg tint → warm palette
- [x] `#game` canvas border + box-shadow retinted to tomato/yellow

### `js/souls.js`
- [x] Collectible glow aura: `#aa00ff` purple → `rgba(255,180,100,...)` warm
- [x] Core sphere gradient: purple stops → pepperoni-red stops (shape intact; full disc redraw in Stage 4)
- [x] Wisps, highlight, floor reflection → warm tints

### Particle color sites (live in `js/game-loop.js`, not `js/particles.js` which is update-only)
- [x] Dash particles (game-loop.js:50) `#ff3300` → `#ffb347` (cheese-orange)
- [x] Pepperoni collection particles (game-loop.js:157) `#aa00ff` → `#ffb347` (warm)
- [x] Death explosion particles (game-loop.js:226) `#ff3300` → `#cc2222` (tomato-sauce splat)
- [x] Flour-dust drift loop in `js/rendering.js` retinted to `rgba(255,245,220,0.5)`
- [x] Ceiling "dust" particles in `js/rendering-helpers.js` retinted to `rgba(255,245,220,0.18)`

### `js/rendering-helpers.js` (tint only — shape changes in Stage 3)
- [x] Floor gradient: lava brown/red → `#e8b855 → #d9a441 → #c8933a → #a8791f` pizzeria-tile yellow
- [x] Floor perspective grid + cracks retinted to warm brown (`rgba(122,58,26,0.2)` / `rgba(90,60,30,0.25)`)
- [x] Floor glow pulse: lava orange-red → warm oven-glow `rgba(255,209,102,0.55)`
- [x] Ceiling gradient: purple/black → `#f4e1c1 → #e8d2a8 → #ddc695 → #c8b077` cream
- [x] Ceiling fixtures (stroke `#4a3a2a` → `#8a6a4a`, fill `#5a4a3a` → `#a08060`)
- [x] Ceiling drips: brown → `rgba(255,209,102,0.55)` warm bulb-glow
- [x] Mountain layers: `['#1a3a5a','#2a4a6a','#3a5a7a']` → `['#9cc5a1','#7eb382','#5e9668']` green hills
- [x] Mountain edge highlight: blue → green `rgba(180,220,180,...)`

### `js/rendering.js`
- [x] Canvas base clear (`draw` + `drawTitleBG`): `#000` → `#f7e4c4` cream
- [x] Atmospheric fog gradient: black → warm cream `rgba(247,228,196,...)`
- [x] Flash-on-hit: `rgba(255,50,50,...)` → `rgba(204,34,34,...)` (tomato-sauce splash)
- [x] Bloom light halo: `rgba(255,150,50,...) → rgba(255,100,0,...) → rgba(255,50,0,0)` → softer warm yellow `rgba(255,209,130,...) → rgba(255,170,80,...) → rgba(255,140,60,0)`
- [x] Bloom canvas base kept dark (screen-blend requires dark base; documented inline)

### Stage 2 verification
- [ ] Load game — title + gameplay read as bright cartoony (no black/neon chrome, no purple orbs, no fire-red)
- [ ] Dash → warm cheese-orange sparks (not fire-red)
- [ ] Collect pepperoni → warm orange sparkle (not purple)
- [ ] Die → tomato-sauce splat (reddish but warm, not harsh neon)
- [ ] Commit: `rebrand(stage-2): bright cartoony palette swap`

---

## Stage 3 — Environment Redraws (`js/rendering-helpers.js`, `js/mountains.js`) ✅ COMPLETE

- [x] `drawFloor`: added dark-tile checkered overlay (11 bands, quadratic depth compression, widening cells near camera) on yellow pizzeria-tile base; grout seams between bands; removed old cracks/perspective-grid lines; warm oven-glow pulse retained
- [x] `drawCeiling`: replaced stalactites with alternating hanging kitchen items — cast-iron pots (trapezoid body + rim + side handles + sheen), pans (ellipse body + protruding handle), warm string-light bulbs (soft radial halo + filament highlight + tiny cap). Cords sway via existing `sin(frameCount * 0.05 + i)` rhythm + gentle horizontal drift for breathing feel. Flour-dust drift preserved.
- [x] `generateMountains` (in `js/mountains.js`): replaced jagged `Math.random()` spikes with layered sine-wave rolling hills — primary wave (wavelength 260/190/120 per layer, back→front) + secondary wave (0.35× wavelength, 0.25× amplitude) for organic asymmetry; denser sampling on near layers; phase-staggered between layers so crests don't line up

### Stage 3 verification
- [ ] Floor reads as pizzeria tile, ceiling as kitchen, background as daylight hills
- [ ] Parallax still scrolls correctly on title + gameplay
- [ ] Commit: `rebrand(stage-3): pizzeria kitchen environment`

---

## Stage 4 — Collectible Redraw (`js/souls.js`) ✅ COMPLETE

- [x] Replaced purple/red orb with pepperoni disc (face gradient `#e6344a → #c8102e → #8a1f24`, darker `#8a1f24` crust-rim ring for dimension)
- [x] 5 darker brown specks (`#6b2b1a`) on face at fixed radial positions; specks rotate with `s.rotation` so they track the spin; fade out when disc is edge-on (`faceVisible = |cos(rotation)|`)
- [x] Replaced energy-tendril wisps with tumble/rotation — disc X-scale oscillates `0.65 + 0.35 * cos(s.rotation)` via existing `rotSpeed` (0.02–0.08/frame), so it always reads as a pepperoni (never fully edge-on)
- [x] Warm halo aura (`rgba(255,180,100,...)`) replaces old purple magical aura
- [x] Grease-sheen glint highlight on face (warm cream ellipse, fades with faceVisible)
- [x] Soft floor shadow (ellipse, X-width tracks tumble)
- [x] Collection particles swap → done in Stage 2 (`game-loop.js:157` → `#ffb347`)

### Stage 4 verification
- [ ] Collectibles read instantly as pepperonis
- [ ] Collection sparkle feels warm, not cold
- [ ] Commit: `rebrand(stage-4): pepperoni coin collectible`

---

## Stage 5 — Player Redraw (`js/player.js`) ✅ COMPLETE

- [x] Removed `drawSkull3D` import + all call sites (head, trail, floor reflection); skeleton spine/ribs/arms gone
- [x] Removed flame-eyes dash cue — replaced with squint slits
- [x] Removed trailing skulls — replaced with sauce-droplet ellipses (tomato `#cc2222` normally, gold `#ffd166` during dash)
- [x] Triangular pizza-slice silhouette: tip-up triangle (baseL→tip→baseR), cheese→tomato body gradient (`#ffe3a3 → #f4c053 → #d94a2a → #a8321c`)
- [x] Golden crust curved arc beneath the slice base (quadratic bulge, `#e0a94a → #995c1e` gradient)
- [x] 3 pepperoni spots (`#c8102e`) + 4 small cream cheese bubbles for texture
- [x] Two white sneakers below the crust with black laces (X cross-hatch), dark sole, subtle body gradient; alternating step animation (`stepPhase = sin(frameCount * 0.25)`, each shoe rises 2.5px when opposite shoe plants)
- [x] Stepping body bob when moving (`|bodyBob| = |stepPhase| * 1.2`)
- [x] Googly eyes: white circles + thin black outline + black pupil + catchlight; pupils track `player.vx` direction for character
- [x] Dash state: squinted eyes (flat ellipse + horizontal slit line), motion lines behind player (gold warm `rgba(255,209,102,0.8)`), sauce-droplet trail recolors gold
- [x] Dash i-frame outline: gold `#ffd166` (was red `#ff2233`)
- [x] Soft oval floor shadow replaces flipped-skull reflection
- [x] Hitbox untouched — collision dimensions live in `game-loop.js` (PLAYER_HB_W/H) and were not modified
- [x] Depth scaling preserved — all draws use `* scale` from `worldToScreen`

### Stage 5 verification
- [ ] Player reads as a cute pizza slice at a glance
- [ ] Dash visual still clearly signals invincibility
- [ ] Hitbox unchanged — same dodge feel as before
- [ ] Commit: `rebrand(stage-5): pizza slice player character`

---

## Stage 6 — Obstacle Redraws (`js/obstacles.js`) ✅ COMPLETE

One `case` at a time, easiest → hardest. After each, playtest that obstacle still spawns and reads correctly.

- [x] `case 'saw'` → **Pizza Cutter**: chrome serrated disc + radial polish lines + fixed wooden handle + metal collar + hub rivet
- [x] `case 'spike'` → **Parmesan Shard**: tan/yellow wedge, 3 crystalline facet lines, left-edge gloss, tip specular glint, shadow facet
- [x] `case 'pillar'` → **Oven Flame**: 3-layer teardrop bezier flame with bob, yellow→orange→red gradient, floor glow pool, outer halo
- [x] `case 'geyser'` → **Tomato Sauce Geyser**: tomato-red eruption column, dark crimson pool, arc droplets, bright core streak
- [x] `case 'chain'` → **Mozzarella Stretch**: cream cheese color, wet-gloss alternating links, drip teardrop at bottom (rigid pendulum physics preserved)
- [x] `case 'skull'` → **Meatball of Doom**: `drawSkull3D` renamed → `drawMeatball3D`, brown sphere with herb flecks + gloss + googly eyes with angled menacing brows

### Stage 6 verification
- [ ] All 6 obstacles read as their new motif at a glance
- [ ] Hitboxes unchanged (same collision feel — confirm via short playtest)
- [ ] Commit (one per case, or one combined): `rebrand(stage-6): pizzeria obstacle redraws`

---

## Stage 7 — Story Screen (`js/constants.js`, `js/config.js`, `js/scenes.js`, `index.html`, `css/style.css`) ✅ COMPLETE

One-time cinematic lore screen between title and game start. Full spec in `CLAUDE.md §Story Screen`.

### `js/constants.js`
- [x] Add `STORY_PAGES` export — array of 4 `{ headline, body }` objects with exact copy from spec

### `js/config.js`
- [x] Add `StoryScene` to `scene` array between `TitleScene` and `GameScene`

### `index.html`
- [x] Add `#story-screen` div inside `#ui-overlay` after `#death-screen`

### `css/style.css`
- [x] `#story-screen`, `#story-headline`, `#story-body`, `#story-prompt` styles added

### `js/scenes.js` — `TitleScene` update
- [x] SPACE handler → `'StoryScene'`
- [x] `pointerdown` handler → `'StoryScene'`

### `js/scenes.js` — `StoryScene` (new class)
- [x] Full `StoryScene` class: `create`, `loadPage`, `startTypewriter`, `finishTypewriter`, `advancePage`, `skipToGame`, `cleanup`, `updatePrompt`, `update`

### Stage 7 verification
- [ ] Title SPACE/click → story screen appears; animated background runs behind it
- [ ] Page 1: headline visible immediately; body typewriters in char-by-char
- [ ] SPACE mid-typewriter → full text appears instantly; prompt updates
- [ ] SPACE on completed page → advances to next page (1→2→3→4)
- [ ] Prompt reads `[ PRESS SPACE TO CONTINUE ]` on pages 1–3, `[ PRESS SPACE TO BEGIN ]` on page 4
- [ ] Page 4 body is empty; headline "THE KITCHEN IS WAITING." stands alone
- [ ] ESC from any page → game starts immediately, no story screen visible
- [ ] SPACE on page 4 → game starts; HUD appears; story screen hidden
- [ ] Die → SPACE on death screen → game restarts, no story screen shown

---

## Final Verification (full SPEC §Verification)

- [ ] `python3 -m http.server 8000` → game loads at `http://localhost:8000`
- [ ] Grep sweep clean: `rg -i "death|hell|demon|blood|skull|wasted|damn|soul" index.html js/ css/`
      allowed matches: `pattern:'skull'` (collision key), `soulCount`/`bgSouls` (deferred rename)
- [ ] Full run: title → gameplay → die on each obstacle type → restart
- [ ] Combo 2/3/4/5/6/7/8 taunts verified (force `gameState.combo = N` in devtools)
- [ ] Dash i-frames still work (gold/yellow cue, same cooldown)
- [ ] Peak-combo flash + screen shake still fire at milestones [5, 10, 25, 50, 100]
- [ ] CI green on push (TruffleHog + Semgrep unaffected)

---

## Out of Scope (do NOT do in this rebrand)

- [ ] ~~Rename internal `gameState.soulCount` → `pepperoniCount`~~ (separate PR)
- [ ] ~~Add audio / SFX~~
- [ ] ~~Background music~~
- [ ] ~~Fix pre-existing bugs: dash permanent speed, combo tracks souls not dodges, `demonsDodged` counter~~ (rebrand is behavior-neutral; file separate issues)
