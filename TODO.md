# PIZZA.RUN Rebrand — TODO

Execution checklist derived from [SPEC.md](./SPEC.md). Work top-to-bottom; each numbered stage is an independent commit. Game remains runnable at every stage boundary.

---

## Stage 1 — Strings Pass (`index.html` + `js/constants.js`)

### `index.html`
- [ ] Line 6: `<title>DEATH.RUN</title>` → `<title>PIZZA.RUN</title>`
- [ ] Line 16: title heading `DEATH.RUN` → `PIZZA.RUN`
- [ ] Line 17: tagline `// ESCAPE HELL OR DIE TRYING //` → `// DELIVER HOT OR DIE TRYIN' //`
- [ ] Line 18: start prompt `[ PRESS SPACE TO DESCEND ]` → `[ PRESS SPACE TO SLICE ]`
- [ ] Line 21: death heading `⚰ WASTED ⚰` → `🍕 DROPPED 🍕`
- [ ] Line 24: stat label `SOULS COLLECTED:` → `PEPPERONIS COLLECTED:`
- [ ] Line 25: stat label `OBSTACLES EVADED:` → `HAZARDS DODGED:`
- [ ] Line 27: stat label `CAUSE OF DEATH:` → `DELIVERY FAILED BY:`
- [ ] Line 27: default cause `SKILL ISSUE` → `DOUGH ISSUES`
- [ ] Line 29: restart prompt `[ PRESS SPACE TO DESCEND AGAIN ]` → `[ PRESS SPACE TO DELIVER AGAIN ]`
- [ ] Line 37: HUD label `SOULS` → `PEPPERONIS` (keep `DISTANCE`, `SPEED`, `COMBO`)
- [ ] Update favicon link (if present) to a pizza-themed icon

### `js/constants.js` — `OBSTACLE_TYPES` (names only, keep `pattern` keys unchanged)
- [ ] `HELLFIRE PILLAR` → `OVEN FLAME` (pattern: `pillar`)
- [ ] `DEMON SKULL` → `MEATBALL OF DOOM` (pattern: `skull`)
- [ ] `BONE SAW` → `PIZZA CUTTER` (pattern: `saw`)
- [ ] `LAVA GEYSER` → `TOMATO SAUCE GEYSER` (pattern: `geyser`)
- [ ] `BLOOD SPIKE` → `PARMESAN SHARD` (pattern: `spike`)
- [ ] `CHAIN WHIP` → `MOZZARELLA STRETCH` (pattern: `chain`)

### `js/constants.js` — `COMBO_TAUNTS` (9 entries, indices 0–8)
- [ ] [0] `''` (unchanged)
- [ ] [1] `''` (unchanged)
- [ ] [2] `'NOT BAD...'` (unchanged — tone-neutral)
- [ ] [3] `'UNHOLY'` → `'SAUCY!'`
- [ ] [4] `'DEMONIC!'` → `'EXTRA CHEESE!!'`
- [ ] [5] `'BLASPHEMOUS!!'` → `'DELIZIOSO!!!'`
- [ ] [6] `'SACRILEGE!!!'` → `"CHEF'S KISS!!!!"`
- [ ] [7] `'GODKILLER!!!!'` → `'PIZZA GOD!!!!!'`
- [ ] [8] `'BEYOND DEATH!!!!!'` → `'LEGENDARY DELIVERY!!!!!'`

### `js/game-loop.js` — death-cause string formatting sanity check
- [ ] Verify `CAUSE OF DEATH` field (set from `obstacle.type.name` at die()) reads cleanly with new obstacle names — e.g., `DELIVERY FAILED BY: MEATBALL OF DOOM`. Adjust any hardcoded string formatting if the new names break layout.

### Stage 1 verification
- [ ] Load game — title screen, HUD labels, and death screen all read as PIZZA.RUN
- [ ] Build a combo 2–8 → correct taunts fire at each threshold
- [ ] Die on each of 6 obstacles → death screen shows new name in `DELIVERY FAILED BY:`
- [ ] Commit: `rebrand(stage-1): DEATH.RUN → PIZZA.RUN strings + taunts`

---

## Stage 2 — Palette Pass

### `js/constants.js` — `OBSTACLE_TYPES` colors
- [ ] `pillar` color → `#ff8800` (warm orange)
- [ ] `skull` color → `#7a3a1a` (meatball brown)
- [ ] `saw` color → `#e0e0e0` (chrome)
- [ ] `geyser` color → `#cc2222` (tomato red)
- [ ] `spike` color → `#f4d35e` (parmesan tan)
- [ ] `chain` color → `#fff8dc` (cheese cream)

### `css/style.css`
- [ ] Body background: dark/black → `#f7e4c4` (warm cream)
- [ ] Title glow: `#ff0033` → `#e63946` tomato red + `#ffd166` yellow outline
- [ ] HUD primary accent: `#ff0033` → `#e63946`
- [ ] HUD secondary accent: `#ffaa00` → `#2a9d8f` (basil green)
- [ ] Any remaining neon-red borders → warm palette equivalents

### `js/souls.js`
- [ ] Collectible glow tint: `#aa00ff` purple → `rgba(255, 180, 100, 0.5)` warm

### `js/particles.js`
- [ ] Dash/death particle color: `#ff3300` fire-red → `#ffb347` cheese-orange (+ `#cc2222` sauce-splash variant)
- [ ] Flour-dust background particles: retint to warm cream/white
- [ ] Remove fire-red particle emissions entirely

### `js/rendering-helpers.js` (tint only — shape changes in Stage 3)
- [ ] Floor gradient: lava brown/red → `#d9a441` pizzeria-tile yellow
- [ ] Ceiling gradient: stalactite purple/black → `#f4e1c1` cream
- [ ] Mountain layers: dark blue silhouettes → `#9cc5a1 / #7eb382 / #5e9668` green hills

### `js/rendering.js`
- [ ] Grep for hardcoded color refs to background/bloom; soften bloom tint to warm yellow/orange

### Stage 2 verification
- [ ] Title + gameplay read as bright cartoony (no black/neon chrome)
- [ ] No fire-red particles during dash or death
- [ ] Commit: `rebrand(stage-2): bright cartoony palette swap`

---

## Stage 3 — Environment Redraws (`js/rendering-helpers.js`)

- [ ] `drawFloor`: add black-and-white checkered overlay on yellow tile base, fading to vanishing point
- [ ] `drawCeiling`: replace stalactites with hanging silhouettes (pots, string lights); keep drip hook as swaying string lights
- [ ] `drawMountains`: rolling green hills in 3 parallax layers (replaces hellscape silhouettes)

### Stage 3 verification
- [ ] Floor reads as pizzeria tile, ceiling as kitchen, background as daylight hills
- [ ] Parallax still scrolls correctly on title + gameplay
- [ ] Commit: `rebrand(stage-3): pizzeria kitchen environment`

---

## Stage 4 — Collectible Redraw (`js/souls.js`)

- [ ] Replace purple orb with red pepperoni disc (`#c8102e`)
- [ ] Add 4–5 darker brown specks (`#6b2b1a`) on face
- [ ] Replace energy-tendril animation with slight tumble/rotation
- [ ] Swap collection particles purple → warm orange/yellow

### Stage 4 verification
- [ ] Collectibles read instantly as pepperonis
- [ ] Collection sparkle feels warm, not cold
- [ ] Commit: `rebrand(stage-4): pepperoni coin collectible`

---

## Stage 5 — Player Redraw (`js/player.js`)

- [ ] Remove `drawSkull3D` call from player head
- [ ] Remove flame eyes (dash cooldown visual)
- [ ] Remove trailing skulls
- [ ] Draw triangular pizza-slice silhouette (golden crust edge, tomato middle, cheese/pepperoni spots)
- [ ] Draw two white sneakers with black laces; add stepping bob when moving
- [ ] Add googly eyes (white circles + shifting black pupils)
- [ ] Dash state: squint eyes, motion lines, sauce-droplet trail (replaces skull trail)
- [ ] Change dash i-frame outline: red → yellow/gold
- [ ] Replace skull floor-reflection with simple oval soft-shadow
- [ ] Preserve 24×32 visual hitbox / 20×26 world-space hitbox — do NOT change collision dimensions
- [ ] Preserve depth scaling via `worldToScreen` (player scales with perspective — do not bypass)

### Stage 5 verification
- [ ] Player reads as a cute pizza slice at a glance
- [ ] Dash visual still clearly signals invincibility
- [ ] Hitbox unchanged — same dodge feel as before
- [ ] Commit: `rebrand(stage-5): pizza slice player character`

---

## Stage 6 — Obstacle Redraws (`js/obstacles.js`)

One `case` at a time, easiest → hardest. After each, playtest that obstacle still spawns and reads correctly.

- [ ] `case 'saw'` → **Pizza Cutter**: silver disc + radial highlights + wooden handle nub
- [ ] `case 'spike'` → **Parmesan Shard**: tan/yellow wedge, crystalline facets, glossy highlight
- [ ] `case 'pillar'` → **Oven Flame**: rounded teardrop, yellow→orange→red vertical gradient, gentle bob
- [ ] `case 'geyser'` → **Tomato Sauce Geyser**: red splash + droplet particles (keep eruption animation)
- [ ] `case 'chain'` → **Mozzarella Stretch**: cream strand with sag + subtle wobble (KEEP rigid pendulum physics — do not reintroduce per-link wave)
- [ ] `case 'skull'` → **Meatball of Doom**: rename `drawSkull3D` → `drawMeatball3D`, recolor stops (`#7a3a1a` + darker flecks), add two googly eyes with angled brows

### Stage 6 verification
- [ ] All 6 obstacles read as their new motif at a glance
- [ ] Hitboxes unchanged (same collision feel — confirm via short playtest)
- [ ] Commit (one per case, or one combined): `rebrand(stage-6): pizzeria obstacle redraws`

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
