# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DEATH.RUN** is a brutal HTML5 endless runner game where the player descends through hell, dodging obstacles and collecting souls. The game is a single `index.html` file (~1437 lines) with no build process, backend, or external dependencies beyond Phaser 3.

**Key Stats:**
- Canvas resolution: 900×650px
- Game state: title screen, active gameplay, death screen
- Death frequency: intended to be brutal and punishing

---

## Architecture

### High-Level Structure

The codebase follows this flow:

```
HTML/CSS (styles, 3 canvases: main game, bloom, UI overlay)
    ↓
Phaser 3 Framework
    ├─ TitleScene (title screen animation + game start)
    └─ GameScene (active game loop, input bridging, draw calls)
        ↓
    Module-level Game Logic
    ├─ update() — player movement, collision, game state
    ├─ draw() — render game world to main canvas
    └─ drawBloom() — render lighting effects to bloom canvas
```

### Two-Canvas Design

- **Main canvas** (`#game`): Primary game rendering with all graphics, effects, and screen shake
- **Bloom canvas** (`#bloom`): Secondary canvas for lighting/glow effects, blended on top with `mix-blend-mode: screen`

This separation allows additive glow effects without clearing the main canvas.

### Phaser 3 Integration

The game uses Phaser 3 primarily for:
- **Scene management** (TitleScene ↔ GameScene transitions)
- **Input handling** (keyboard, mouse, touch)
- **Game loop lifecycle** (create, update cycles)
- **Pointer/touch input** normalization

**Key constraint:** All rendering is direct Canvas2D (`ctx` and `bctx` contexts), not Phaser Graphics API. This allows full use of:
- Canvas gradients, bezier curves, composite operations
- Direct pixel manipulation (particles, bloom)
- Screen shake via `ctx.translate()`

### Input System

Module-level `keys` object is populated each frame by GameScene input bridge:

```js
// GameScene.update() bridges Phaser → module-level keys[]
keys['ArrowUp']    = this.cursors.up.isDown;
keys['KeyW']       = this.wasd.up.isDown;
keys['ShiftLeft']  = this.shift.left.isDown;
// ... etc
```

Then `update()` function reads from `keys[]` for player movement/dash detection. This decouples game logic from Phaser's input system.

---

## Game Logic Overview

### State Machine

- `state = 'title'` — Title screen (TitleScene runs `drawTitleBG()` each frame)
- `state = 'playing'` — Active game (GameScene runs full update/draw loop)
- `state = 'dead'` — Death animation (particles, screen shake, 800ms delay before showing death screen)

### Core Systems

**Player (`player` object):**
- `x, y` — position
- `w, h` — width/height (24×32)
- `vy` — vertical velocity
- `trail` — particle trail for movement visualization
- `lean` — rotation angle for sprites

**Obstacles (`obstacles` array):**
- Five obstacle types (see `OBSTACLE_TYPES` enum around line 291)
- Procedurally spawned via `spawnObstacle()`
- Collision detection via `rectCollide()` and `getObstacleHitbox()`

**Souls (`souls` array):**
- Spawn randomly, move downward
- Collected for score/combo bonus

**Particles:**
- `particles` — dash trail, collision sparks (main canvas)
- `bgParticles` — background dust (render-before-gameplay)
- Updated via `updateParticles()`

**Lighting/Glow:**
- `lightSources` array — moving light points
- Rendered to bloom canvas with gradients

### Scoring Mechanics

- **Distance** — increases each frame during gameplay
- **Souls** — collected for +1 score
- **Combo** — consecutive obstacles dodged without damage
  - Combo message displayed via `COMBO_TAUNTS` (line 995)
  - Max combo tracked and shown on death screen
- **Dash** — Shift key, costs 60-frame cooldown, grants invincibility for 15 frames

### Collision & Damage

- Player collision with obstacle → `die(cause)` triggers death sequence
- 15 frames of invincibility after dash (particles rendered showing invincibility state)
- Death screen shows: distance, souls, obstacles evaded, peak combo, cause of death

---

## Development Workflow

### No Build Required

Since there's no build process, **development is direct editing + refresh:**

1. Edit `index.html`
2. Refresh browser at `http://localhost:8000/index.html` (or appropriate server)
3. Check browser console (F12) for errors

### Key Sections to Edit

**Visual Changes:**
- CSS (lines 7–147): colors, animations, HUD styling
- Draw functions: `drawPlayer`, `drawObstacle`, `drawFloor`, `drawCeiling`, `drawMountains`, `drawSkull3D`
- Bloom pass: `drawBloom()` (line 1246)

**Game Logic:**
- Difficulty: modify `lastObstacle`, `lastSoul`, spawn rates in `update()`
- Mechanics: adjust `OBSTACLE_TYPES` (line 291), collision boxes in `getObstacleHitbox()`
- Particle system: tweak `particles.push()` calls during dash/collision
- Combo system: modify `COMBO_TAUNTS` (line 995) or combo threshold

**Input:**
- Add/remove keys in GameScene `create()` via `this.input.keyboard.addKeys()`
- Bridge new keys to `keys[]` object in GameScene `update()`

### Perspectives & 3D Effects

The game uses a **perspective transform** (`worldToScreen()` at line 244) that:
- Maps game world coords (wx, wy) to screen coords (sx, sy)
- Applies depth-based scaling (objects higher on screen are smaller)
- Creates sense of forward motion into the horizon

Key constants:
- `HORIZON = 55` — y-coordinate where the horizon line appears
- `VP_X, VP_Y` — vanishing point (center of perspective)

Modifying these changes the visual feel of the descent.

---

## Common Modifications

### Adjust Difficulty

- Spawn rates: `lastObstacle`, `lastSoul` thresholds in `update()` (line 998)
- Example: increase `if (frameCount - lastObstacle > 100)` to 120 for fewer obstacles
- Obstacle speed: `speed += 0.008` per frame (line 1009)

### Add New Obstacle Type

1. Add entry to `OBSTACLE_TYPES` (line 291)
2. Handle in `drawObstacle()` (line 650) with new `o.type` case
3. Update collision logic in `getObstacleHitbox()` (line 980) if needed

### Change Colors/Theming

- Edit CSS gradients and shadows (lines 34–147)
- Modify draw function color constants:
  - `drawFloor()` gradients (line 322)
  - `drawMountains()` color calculation (line 428)
  - Obstacle/player colors in respective draw functions

### Adjust Camera/Perspective

- `HORIZON` (line 202): move horizon up/down
- `worldToScreen()` depth scaling (line 250): adjust perspective intensity
- Screen shake amplitude: `screenShake = 6` in various places (change the multiplier)

---

## Key Files & Line Ranges

| Section | Lines | Purpose |
|---------|-------|---------|
| HTML & CSS | 1–193 | UI, canvases, animations |
| Canvas contexts | 198 | `let ctx, bctx` initialization |
| State variables | 208–235 | Game state, input, particles |
| Helper functions | 237–262 | `lerp`, `clamp`, `rand`, perspective |
| Game functions | 254–322 | `startGame()`, `die()`, spawning |
| Obstacle types | 290–313 | Obstacle definitions & spawning |
| Draw functions | 322–1363 | All rendering (floor, ceiling, mountains, player, etc.) |
| Phaser scenes | 1366–1419 | TitleScene & GameScene classes |
| Phaser config | 1420–1437 | Game instantiation |

---

## Testing & Debugging

### Console Errors

- Open DevTools (F12) → Console tab
- Check for any Phaser errors or undefined references
- Common issues:
  - `Cannot read property 'isDown' of undefined` — key not registered in scene
  - `ctx is null` — canvas context not initialized in scene `create()`

### Performance Tips

- Particle limits: `particles.length` can cause slowdown if unbounded
- Consider capping max particles or implementing object pooling
- Bloom pass is expensive — consider disabling `drawBloom()` for profiling

### Manual Testing Checklist

1. **Title screen:** Mountains scroll, title flickers, animations smooth
2. **Game start:** Press SPACE or click → GameScene loads, HUD appears
3. **Movement:** Arrow keys + WASD move player smoothly
4. **Dash:** Shift key triggers dash with invincibility (15 frames)
5. **Obstacles:** Spawning, collision detection, screen shake on hit
6. **Souls:** Spawn and collect for score
7. **Death:** Screen shake, particle explosion, death screen after 800ms
8. **Restart:** SPACE on death screen → restarts game
9. **Touch (mobile):** Swipe/tap to move (if testing on device)

---

## Recent Refactoring (Feb 2026)

The game was recently **ported from raw Canvas2D + manual rAF loop to Phaser 3** (commit f994058). Key changes:

- Removed `document.addEventListener('keydown', ...)` → now uses Phaser input system
- Removed manual `gameLoop()` → Phaser handles update/render cycle
- Added `TitleScene` and `GameScene` for proper scene management
- All draw functions remain **unchanged** — 100% visual fidelity preserved
- Input bridge ensures game logic (reading `keys[]`) works identically

This refactoring:
✓ Provides clean architecture for future scene/state management
✓ Simplifies input handling (keyboard, mouse, touch unified)
✓ Maintains all original Canvas2D rendering (gradients, effects, performance)
✗ Added Phaser 3 CDN dependency (external library load)

---

## Resources & Notes

- **Phaser 3 Docs:** https://photonengine.com/phaserDocs/3.60.0/
- **Canvas 2D API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **Perspective Transform:** The `worldToScreen()` function is the key to all depth effects; modifying it changes the entire visual feel
- **Particles:** Stored in arrays and manually updated—good candidate for optimization if you hit performance limits
