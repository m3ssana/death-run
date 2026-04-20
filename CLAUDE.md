# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DEATH.RUN** is a brutal HTML5 horizontal endless runner game. The player runs through hell dodging obstacles (coming from the right) and collecting souls. No build process, no backend — just static files served over HTTP with Phaser 3 loaded via CDN.

- Canvas: 900×650px
- States: `title`, `story`, `playing`, `dead`
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
index.html          → 3 canvases (#game, #bloom, #ui-overlay), HUD elements, #story-screen panel, Phaser CDN
css/style.css       → All styling, animations, HUD layout, story screen styles
js/main.js          → Entry point: init contexts, generate mountains, create Phaser.Game
js/config.js        → Phaser config (CANVAS mode, 900x650, scenes: TitleScene → StoryScene → GameScene)
js/state.js         → Central gameState object (all mutable game state lives here)
js/constants.js     → W, H, HORIZON, VP_X/VP_Y, OBSTACLE_TYPES, COMBO_TAUNTS, STORY_PAGES, helpers (lerp/clamp/rand)
js/scenes.js        → TitleScene + StoryScene + GameScene (Phaser scenes, input bridge)
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

## Story Screen

A one-time cinematic shown when the player first starts from the title screen. It does **not** replay on restarts from the death screen — the player has earned that context, don't waste their time.

### Flow

```
TitleScene  →(SPACE/click)→  StoryScene  →(final page advance)→  GameScene
                                  ↑
                              (ESC skips)
                              (not shown on death→restart)
```

`TitleScene` transitions to `StoryScene` (not `GameScene`). `StoryScene` transitions to `GameScene` after the last page is advanced. The death-screen restart calls `startGame()` directly (already in `GameScene`), so `StoryScene` is bypassed.

### Implementation

**New Phaser scene:** `StoryScene` (key: `'StoryScene'`) in `js/scenes.js`. Add to `config.js` scene list between `TitleScene` and `GameScene`.

**New DOM element** in `index.html` inside `#ui-overlay`, after `#death-screen`:

```html
<div id="story-screen">
  <div id="story-headline"></div>
  <div id="story-body"></div>
  <div id="story-prompt"></div>
</div>
```

**Story pages** defined as `STORY_PAGES` constant in `js/constants.js` — array of `{ headline, body }` objects (see content below). This keeps narrative copy in one place.

**`StoryScene` behavior:**
- `create()`: set `gameState.state = 'story'`; show `#story-screen`, hide others; load page 0; start typewriter for body text; bind SPACE/click → `advancePage()`, ESC → skip to `GameScene`
- `update()`: call `drawTitleBG()` each frame so the animated background continues running behind the panel
- `advancePage()`: if typewriter is mid-type → instantly complete current page text (first press reveals, second press advances); else advance to next page; if past last page → `this.scene.start('GameScene')`
- `destroy()` / scene shutdown: hide `#story-screen`, clear any typewriter interval

**Typewriter effect:** Reveal body text one character at a time at ~28ms per character using `setInterval`. Store the interval reference on the scene so it can be cancelled on skip or page advance. Track completion with a boolean `this.typewriterDone`.

**Background:** `drawTitleBG()` runs every frame (same as `TitleScene`) — animated floor, ceiling, mountains, and parallax continue behind the story panel.

### Story Pages Content

These are the four pages defined in `STORY_PAGES`. Copy is final — do not alter wording without design approval.

```javascript
export const STORY_PAGES = [
  {
    headline: "MAMA ROSA'S PIZZERIA",
    body: "The most famous pizza shop in town is in total chaos!\n\nThe kitchen has gone completely wild —\nflames are flying, cutters are spinning,\nand cheese is EVERYWHERE.",
  },
  {
    headline: 'THE BIG DELIVERY',
    body: "A fresh pizza needs to reach the customer HOT!\n\n900 meters of out-of-control kitchen\nstand between you and the exit.\n\nRun fast. Dodge everything. Deliver!",
  },
  {
    headline: 'HOW TO PLAY',
    body: "ARROW KEYS or WASD — dodge up and down.\nSHIFT — dash through danger (super speed!).\n\nGrab the flying pepperonis for bonus points.\nDon't stop running!",
  },
  {
    headline: 'THE KITCHEN AWAITS!',
    body: '',   // intentionally empty — headline stands alone as the call to action
  },
];
```

### Visual Design

- **Panel**: centered, `max-width: 580px`, dark semi-transparent background `rgba(8,4,14,0.92)`, `2px solid #e63946` border, `box-shadow` matching title/death screen style
- **Headline** (`#story-headline`): Orbitron font, `#e63946` red, `~22px`, letter-spacing `4px`, uppercase, `text-shadow` glow
- **Body** (`#story-body`): Orbitron font, `rgba(255,168,72,0.9)` amber, `11px`, `line-height: 2`, `white-space: pre-line` to respect `\n` in copy, `min-height: 120px` to prevent layout jump
- **Prompt** (`#story-prompt`): cyan `#2a9d8f` pulsing animation (reuse `.pulse` keyframe), `12px`; shows `[ PRESS SPACE ]` while typing, `[ PRESS SPACE TO CONTINUE ]` when done, `[ PRESS SPACE TO BEGIN ]` on the last page
- **Page indicator** (optional): small dots or `1 / 4` counter bottom-right of panel, amber color
- **Transition**: no fade — snap show/hide is consistent with the rest of the game's hard-cut style

### CSS additions required (`css/style.css`)

```css
#story-screen {
  display: none;
  max-width: 580px;
  background: radial-gradient(ellipse at center, rgba(18,8,28,0.93) 0%, rgba(8,4,14,0.96) 100%);
  padding: 50px 60px;
  border: 2px solid #e63946;
  box-shadow: 0 0 60px rgba(230,57,70,0.3), 0 0 120px rgba(255,100,30,0.1), inset 0 0 30px rgba(180,20,20,0.08);
  text-align: left;
}
#story-headline {
  font-family: 'Orbitron', monospace;
  font-size: 20px;
  font-weight: 900;
  color: #e63946;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(230,57,70,0.7), 0 0 40px rgba(230,57,70,0.3);
  margin-bottom: 28px;
}
#story-body {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  color: rgba(255,168,72,0.9);
  line-height: 2;
  white-space: pre-line;
  min-height: 120px;
  text-shadow: 0 0 10px rgba(255,140,40,0.4);
  margin-bottom: 36px;
}
#story-prompt {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  color: #2a9d8f;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(42,157,143,0.65);
  animation: pulse 1.2s infinite;
}
```

## Manual Testing Checklist

1. Title screen: mountains scroll leftward, title flickers
2. SPACE/click → story screen appears over animated background; title screen hides
3. Story page 1 typewriters in body text; headline appears immediately
4. SPACE mid-typewriter → text completes instantly (no second-press needed to advance)
5. SPACE on complete page → advances to page 2, 3, 4; prompt updates on last page
6. ESC at any story page → skips directly to game start
7. SPACE on last story page → game starts, HUD appears, player on left side
8. Dying and pressing SPACE on death screen → game restarts **without** re-showing story screen
9. Obstacles fly in from right, souls appear and drift left
10. Up/Down dodges vertically, Left/Right adjusts horizontal position
11. Shift triggers dash with invincibility particles
12. Collision → death sequence (screen shake, particles, 800ms delay, death screen)
