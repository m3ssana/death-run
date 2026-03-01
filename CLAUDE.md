# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DEATH.RUN** is a brutal HTML5 horizontal endless runner game. The player runs through hell dodging obstacles (coming from the right) and collecting souls. No build process, no backend — just static files served over HTTP with Phaser 3 loaded via CDN.

- Canvas: 900×650px
- States: `title`, `playing`, `dead`
- External dependency: Phaser 3.60.0 (CDN)

## Development

Serve locally and refresh:
```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

No build step, no tests, no linter. Check browser console (F12) for errors.

## CI

GitHub Actions runs on every push and PR (`.github/workflows/security.yml`):
- **TruffleHog** — scans git history for verified secrets (`--only-verified`)
- **Semgrep** — SAST with `p/javascript` and `p/secrets` rulesets

Results appear on the workflow run summary page. Both jobs fail on findings.

## Architecture

```
index.html          → 3 canvases (#game, #bloom, #ui-overlay), HUD elements, Phaser CDN
css/style.css       → All styling, animations, HUD layout
js/main.js          → Entry point: init contexts, generate mountains, create Phaser.Game
js/config.js        → Phaser config (CANVAS mode, 900x650, scenes)
js/state.js         → Central gameState object (all mutable game state lives here)
js/constants.js     → W, H, HORIZON, VP_X/VP_Y, OBSTACLE_TYPES, COMBO_TAUNTS, helpers (lerp/clamp/rand)
js/scenes.js        → TitleScene + GameScene (Phaser scenes, input bridge)
js/game-loop.js     → update(), startGame(), die(), updateHUD() — core game logic
js/spawning.js      → spawnObstacle(), spawnSoul()
js/perspective.js   → worldToScreen() — maps world coords to screen with depth scaling
js/collision.js     → rectCollide() (AABB), getObstacleHitbox() (per-pattern hitboxes)
js/rendering.js     → draw(), drawBloom(), drawTitleBG()
js/rendering-helpers.js → drawFloor(), drawCeiling(), drawMountains()
js/player.js        → drawPlayer()
js/obstacles.js     → drawObstacle(), drawSkull3D()
js/souls.js         → drawSoul()
js/particles.js     → updateParticles(), updateBgParticles()
js/mountains.js     → generateMountains() (3 parallax layers)
```

### Key Design Patterns

**Two-canvas rendering:** Main canvas (`ctx`) renders all gameplay. Bloom canvas (`bctx`) renders light sources, composited on top with `mix-blend-mode: screen`. All rendering uses direct Canvas2D — Phaser only manages scene lifecycle and input.

**Input bridge:** `GameScene.update()` copies Phaser key states into `gameState.keys[]` each frame. Game logic in `game-loop.js` reads from `gameState.keys[]`, fully decoupled from Phaser's input API.

**Horizontal scrolling:** Obstacles spawn at `x = W + 50` (off right edge) with negative `vx`, moving leftward. Player is confined to the left portion of the screen (x: 30–300) and dodges primarily up/down. The perspective system (`worldToScreen`) uses X as the depth axis — objects on the right appear smaller/farther.

**Central state:** All mutable state lives in `gameState` (js/state.js). No global variables scattered across files.

### Perspective System

`worldToScreen(wx, wy)` in `js/perspective.js` maps world coordinates to screen coordinates with depth scaling:
- Depth axis: **horizontal** (left=near at scale 1.0, right=far at scale 0.55)
- Vanishing point: right edge, vertical center (`VP_X=W`, `VP_Y=H/2`)
- Y coordinates converge toward vertical center with increasing depth
- `HORIZON = 55` defines the sky/ground boundary

### Obstacle System

Six types defined in `OBSTACLE_TYPES` (constants.js): HELLFIRE PILLAR, DEMON SKULL, BONE SAW, LAVA GEYSER, BLOOD SPIKE, CHAIN WHIP. Each has a `pattern` string that drives both rendering (`drawObstacle` switch) and collision (`getObstacleHitbox` switch). To add a new type: add to `OBSTACLE_TYPES`, add draw case in `obstacles.js`, add hitbox case in `collision.js`.

### Player Movement

- **Up/Down (Arrow/WASD):** Direct positional movement (3px/frame) — primary dodge axis
- **Left/Right (Arrow/WASD):** Acceleration-based via `player.vx` with friction (0.92) — secondary
- **Shift:** Dash — 60-frame cooldown, 15 frames invincibility
- Player clamped to `PLAY_LEFT..PLAY_RIGHT` horizontally, `PLAY_TOP..PLAY_BOTTOM` vertically

## Manual Testing Checklist

1. Title screen: mountains scroll leftward, title flickers
2. SPACE/click starts game, HUD appears, player on left side
3. Obstacles fly in from right, souls appear and drift left
4. Up/Down dodges vertically, Left/Right adjusts horizontal position
5. Shift triggers dash with invincibility particles
6. Collision → death sequence (screen shake, particles, 800ms delay, death screen)
7. SPACE on death screen restarts
