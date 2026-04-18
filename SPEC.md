# PIZZA.RUN Rebrand Spec

## Overview

Rebrand DEATH.RUN (a horizontal endless runner set in hell) into PIZZA.RUN — a family-friendly, humorous pizzeria-themed reskin. **All gameplay mechanics stay exactly the same**: dodge, dash with invincibility frames, combo taunts, death screen, 6 obstacle patterns, peak stats. Only the *skin* changes — strings, palette, player character, obstacle visuals, environment. Obstacle `pattern` strings (`pillar`, `skull`, `saw`, `geyser`, `spike`, `chain`) **must not change** — they are collision/rendering switch keys; only the display `name` and `color` are updated. The UI tone shifts from dark/neon to bright/cartoony (warm daylight pizzeria kitchen).

---

## Brand Swap Reference

### Title & Copy (`index.html`)

| Line | From | To |
|---|---|---|
| 6 (`<title>`) | `DEATH.RUN` | `PIZZA.RUN` |
| 16 (title) | `DEATH.RUN` | `PIZZA.RUN` |
| 17 (tagline) | `// ESCAPE HELL OR DIE TRYING //` | `// DELIVER HOT OR DIE TRYIN' //` |
| 18 (start) | `[ PRESS SPACE TO DESCEND ]` | `[ PRESS SPACE TO SLICE ]` |
| 21 (death heading) | `⚰ WASTED ⚰` | `🍕 DROPPED 🍕` |
| 24 (stat) | `SOULS COLLECTED:` | `PEPPERONIS COLLECTED:` |
| 25 (stat) | `OBSTACLES EVADED:` | `HAZARDS DODGED:` |
| 27 (label) | `CAUSE OF DEATH:` | `DELIVERY FAILED BY:` |
| 27 (default) | `SKILL ISSUE` | `DOUGH ISSUES` |
| 29 (restart) | `[ PRESS SPACE TO DESCEND AGAIN ]` | `[ PRESS SPACE TO DELIVER AGAIN ]` |
| 33, 37, 41, 45 (HUD) | `DISTANCE / SOULS / SPEED / COMBO` | `DISTANCE / PEPPERONIS / SPEED / COMBO` |

Also update the favicon and `<title>` for share-link polish.

### Obstacles (`js/constants.js` — `OBSTACLE_TYPES`)

Keep `pattern` strings unchanged (used by `getObstacleHitbox` and `drawObstacle` switches — changing them would break collision routing). Only change the display `name` and tuning `color`.

| Pattern | Old name | New name | New color |
|---|---|---|---|
| `pillar` | HELLFIRE PILLAR | `OVEN FLAME` | `#ff8800` (warm orange) |
| `skull` | DEMON SKULL | `MEATBALL OF DOOM` | `#7a3a1a` (meatball brown) |
| `saw` | BONE SAW | `PIZZA CUTTER` | `#e0e0e0` (chrome) |
| `geyser` | LAVA GEYSER | `TOMATO SAUCE GEYSER` | `#cc2222` (tomato red) |
| `spike` | BLOOD SPIKE | `PARMESAN SHARD` | `#f4d35e` (parmesan tan) |
| `chain` | CHAIN WHIP | `MOZZARELLA STRETCH` | `#fff8dc` (cheese cream) |

### Combo Taunts (`js/constants.js` — `COMBO_TAUNTS`)

Preserve the pacing (empty at 0–1, escalating from 2+). 9 entries, indexed 0–8.

```js
[
  '',                         // 0
  '',                         // 1  (consider 'FRESH DOUGH...' as an early-acknowledgment fix later)
  'NOT BAD...',               // 2  (keep; tone-neutral)
  'SAUCY!',                   // 3
  'EXTRA CHEESE!!',           // 4
  'DELIZIOSO!!!',             // 5
  "CHEF'S KISS!!!!",          // 6
  'PIZZA GOD!!!!!',           // 7
  'LEGENDARY DELIVERY!!!!!',  // 8
]
```

### Collectible: `souls` → Pepperonis

The state field `gameState.soulCount` stays as an internal variable name (purely cosmetic rename; deferring keeps the diff smaller and avoids touching every `game-loop.js` reference). HUD label and death-screen stat change to `PEPPERONIS` / `PEPPERONIS COLLECTED:`.

---

## Visual Redesign

### Palette (drop neon, go bright cartoony)

| Role | Current (hex) | New (hex) | Notes |
|---|---|---|---|
| Page bg (`css/style.css` body) | `#000` / dark | `#f7e4c4` (warm cream) | subtle checkered-tile feel via CSS pattern |
| Title glow | `#ff0033` neon red | `#e63946` tomato red + `#ffd166` yellow outline | cartoon sign aesthetic |
| HUD accent | `#ff0033` / `#ffaa00` | `#e63946` / `#2a9d8f` (basil green) | |
| Collectible tint | `#aa00ff` purple | `#c8102e` pepperoni red w/ `#6b2b1a` spots | |
| Particle (dash/death) | `#ff3300` fire-red | `#ffb347` cheese-orange + `#cc2222` sauce splash | |
| Floor | lava brown/red gradient | `#d9a441` pizzeria-tile yellow + checker pattern overlay | |
| Ceiling | stalactite purple/black | `#f4e1c1` cream kitchen ceiling w/ hanging silhouettes | |
| Mountains (bg parallax) | dark hellscape blues | `#9cc5a1 / #7eb382 / #5e9668` layered green hill silhouettes | alt: pizzeria-skyline rooftops, deferred |
| Bloom tint | orange-red | softer warm yellow/orange; still additive via `mix-blend-mode: screen` | |

### Player Redesign (`js/player.js`)

Replace skeleton with **pizza slice character**:
- Triangular slice silhouette (golden crust edge, tomato middle, cheese/pepperoni spots)
- Two little white sneakers with black laces (animated stepping bob when moving)
- Googly eyes (two white circles with shifting black pupils — adds charm and reads instantly as cute)
- Dash state: eyes squint, tiny motion lines, sauce-droplet trail replaces skull trail
- Floor reflection: keep the shadow but drop the "reflection of self" — simple oval soft-shadow under feet for cartoon feel

Remove: `drawSkull3D` calls from player, flame eyes, skull trail.

Keep: 24×32 hitbox (visual) / 20×26 world-space hitbox, depth scaling via `worldToScreen`, dash i-frame visual cue (brief yellow/gold outline instead of red).

### Obstacle Redesigns (`js/obstacles.js`)

For each case in `drawObstacle` switch, keep geometry + hitbox, restyle visuals:

- **`pillar` → Oven Flame**: Cartoon flame shape — rounded teardrop with wavy base, yellow→orange→red vertical gradient, gentle bobbing. Remove gritty red tones; go warm and rounded.
- **`skull` → Meatball of Doom**: Brown sphere (`#7a3a1a`) with darker oregano flecks, subtle highlight top-left, two small googly eyes (evil angled brows). Rename `drawSkull3D` → `drawMeatball3D` (same shading technique, new color stops). Used by this obstacle only (player no longer uses it).
- **`saw` → Pizza Cutter**: Silver circular disc with radial highlights, wooden handle nub, spinning animation (already in place, just restyle).
- **`geyser` → Tomato Sauce Geyser**: Red upward splash with droplet particles, replaces lava. Keep ground-up eruption animation.
- **`spike` → Parmesan Shard**: Triangular yellow-tan wedge with subtle crystalline facets, slight glossy highlight.
- **`chain` → Mozzarella Stretch**: Cream-white stretchy strand with slight sag and subtle wobble; keep the rigid pendulum physics — do NOT reintroduce per-link traveling wave without updating hitbox (see agent memory).

### Collectible (`js/souls.js`)

Replace the purple/magenta energy orb with a **pepperoni coin**:
- Red disc (`#c8102e`) with 4–5 darker brown specks (`#6b2b1a`)
- Slight tumble/rotation animation in place of energy tendrils
- Soft warm glow (`rgba(255, 180, 100, 0.5)`) instead of purple glow
- Collection particles switch from purple → warm orange/yellow

### Environment (`js/rendering-helpers.js`)

- **`drawFloor`**: Yellow pizzeria-tile gradient with **black-and-white checkered overlay** (classic pizzeria) fading toward the vanishing point via the existing perspective grid.
- **`drawCeiling`**: Cream ceiling with simple hanging silhouettes (pots, string lights) replacing stalactites. Keep the "drip" animation hook but restyle as a slow swaying string light.
- **`drawMountains`**: Rolling green hills in 3 parallax layers replacing the hellscape silhouettes.
- **Particles/fog** (`js/particles.js`): retint existing dust/ember particles to warm cream/white (flour dust vibe). Cut fire-red particles entirely.

---

## Critical Files

```
index.html                    — all brand copy (title, HUD, death screen)
js/constants.js               — OBSTACLE_TYPES names+colors, COMBO_TAUNTS
css/style.css                 — palette vars, title glow, HUD tint, body bg
js/player.js                  — pizza-slice character (new drawPlayer body)
js/obstacles.js               — 6 obstacle re-draws + drawSkull3D → drawMeatball3D
js/souls.js                   — pepperoni coin visual
js/particles.js               — particle tint swap
js/rendering-helpers.js       — floor (tile), ceiling (cream), mountains (hills)
js/game-loop.js               — minor: death-cause string formatting if any
js/rendering.js               — check for any hardcoded color refs to background/bloom
```

---

## Implementation Order (ship-in-stages)

Commit in this order so any stage boundary is a shippable state:

1. **Strings pass** — `index.html` + `js/constants.js`. Rename-only changes. Runnable, readable, feels ~40% different.
2. **Palette pass** — `css/style.css`, particle tints in `js/particles.js`, obstacle colors in `js/constants.js`, `js/souls.js` tint, `js/rendering-helpers.js` tints. Feels ~80% different without redrawing shapes yet.
3. **Environment pass** — `js/rendering-helpers.js`: floor tile pattern, cream ceiling, green-hill mountains.
4. **Collectible redraw** — `js/souls.js` → pepperoni coin.
5. **Player redraw** — `js/player.js` → pizza slice with googly eyes + sneakers.
6. **Obstacle redraws** — `js/obstacles.js`, one `case` at a time. Suggested order easiest → hardest: `saw` → `spike` → `pillar` → `geyser` → `chain` → `skull` (which also entails `drawSkull3D` → `drawMeatball3D`).

Each stage is independently committable and leaves the game runnable.

---

## Verification

1. `python3 -m http.server 8000` → open `http://localhost:8000`.
2. Title screen: `PIZZA.RUN` + tagline + `PRESS SPACE TO SLICE`, bright cartoony palette, green hills parallax.
3. Grep sweep: `rg -i "death|hell|demon|blood|skull|wasted|damn|soul" index.html js/ css/` — only surviving matches should be:
   - `pattern:'skull'` (collision key, fine)
   - `soulCount` / `bgSouls` variable names (deferred cosmetic rename)
   - No user-facing matches.
4. Start game → player is pizza slice, floor is checkered tile, collectibles are pepperonis.
5. Trigger each obstacle type (play long enough to see all 6 spawn) → each reads as its new motif at a glance.
6. Build combo 2/3/4/5/6/7/8 → new taunts fire at correct thresholds (temporarily force `gameState.combo = N` in devtools to validate all).
7. Die on each obstacle → death screen shows `🍕 DROPPED 🍕`, `DELIVERY FAILED BY: <new obstacle name>`, new stat labels.
8. Restart via SPACE works, stats reset.
9. Dash still grants invincibility frames (gold/yellow visual cue instead of red), cooldown identical.
10. CI unaffected — TruffleHog + Semgrep are content-blind to these changes.

---

## Out of Scope (Follow-ups)

- Rename internal `soulCount` → `pepperoniCount` (pure cosmetic; separate PR to keep diff reviewable).
- Audio rebrand (if/when SFX are added — current game has none).
- Background music (mandolin pizzeria loop? deferred).
- Pre-existing bugs flagged in agent memory (dash permanent speed, combo tracks souls not dodges, `demonsDodged` counter wrong) — do NOT fix here; rebrand should be behavior-neutral.
