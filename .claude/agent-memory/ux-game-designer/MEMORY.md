# UX Game Designer — DEATH.RUN Agent Memory

## Architecture Quick Reference
- All game logic in `js/` directory (modular ES modules, no build step)
- `js/state.js` — single gameState object, source of truth for all mutable state
- `js/constants.js` — OBSTACLE_TYPES (6 types), COMBO_TAUNTS (9 entries), COMBO_MILESTONES, helpers (lerp/clamp/rand)
- `js/game-loop.js` — update(), startGame(), die(), updateHUD(); PLAYER_HB_W/H constants
- `js/spawning.js` — spawnObstacle(), spawnSoul()
- `js/collision.js` — rectCollide(), getObstacleHitbox() with per-pattern hitbox logic (world-space)
- `js/scenes.js` — TitleScene, GameScene (Phaser input bridge to gameState.keys[])
- `js/rendering.js` — draw(), drawBloom(), drawTitleBG()
- `js/player.js` — drawPlayer() with perspective scaling via worldToScreen()
- `js/perspective.js` — worldToScreen() maps world coords to screen; scale = lerp(1.0, 0.55, depth)
- `js/particles.js` — MAX_PARTICLES=150, MAX_BG_PARTICLES=60 caps; oldest dropped first
- Play area: PLAY_LEFT=30, PLAY_RIGHT=300, PLAY_TOP=70, PLAY_BOTTOM=H-20

## Design Insights
- Collision happens in SCREEN space: both player and obstacle hitboxes scaled by worldToScreen scale. Player hitbox is 20×26 world units (shrunk from 24×32 visual for forgiveness).
- Obstacle spawn is distance-scaled: lerp(100, 60, difficulty) frames. Reaches 60 frames at distance 2000.
- Speed is capped at 8: `Math.min(3 + distance/1000, 8)`. Playability ceiling confirmed.
- Grace period of 180 frames (3s) delays first obstacle spawn. Souls still spawn during grace period.
- Same obstacle type never repeats back-to-back. lastObstacleType filters eligible pool in spawnObstacle().
- Combo milestones [5,10,25,50,100] trigger gold comboFlashAlpha overlay (0.25–0.45) + screenShake 3 + CSS burst animation on HUD panel.
- Combo increments on BOTH obstacle dodge (x < -100) AND soul collection. Both feel good; dodges are the primary skill signal.
- Chain obstacle is a rigid pendulum: both render and hitbox use `Math.sin(frameCount * 0.05 + o.sinOffset) * 25`. Do not re-introduce per-link traveling wave without updating hitbox.
- Mobile controls: relative drag (touchDragging + playerStart/touchStart anchors), double-tap within 300ms triggers dash via `gameState.dashRequested` one-shot flag.
- Soul spawn (50 frames) has no speed compensation — souls still fly past at high speed. Not yet fixed.
- Difficulty variable `min(distance/2000, 1)` consistently drives both spawn rate and obstacle velocity.

## State Fields
- `gameState.gracePeriod` — countdown from 180, gates obstacle spawning
- `gameState.lastObstacleType` — pattern string of last spawned obstacle, prevents repeats
- `gameState.comboFlashAlpha` — gold flash overlay alpha, decays at 0.80x per frame
- `gameState.prevCombo` — previous frame's combo value, used to detect milestone crossings
- `gameState.touchDragging` + `touchStart/playerStart/touchDrag X/Y` — relative-drag touch model
- `gameState.dashRequested` — one-shot, consumed every frame by dash handler
- `gameState.lastTapTime` — timestamp for double-tap detection (performance.now())

## Performance Notes
- Particle caps enforced in updateParticles() (MAX_PARTICLES=150, MAX_BG_PARTICLES=60). Oldest dropped first so newest feedback survives.
- ctx.createRadialGradient() called every frame per glow particle — expensive. Opportunity: skip below 30% life.
- Bloom canvas drawImage + mix-blend-mode: screen is costly on mobile.

## Combo System Details
- COMBO_TAUNTS[0] and [1] are empty strings (no feedback at combo 1).
- First feedback is "NOT BAD..." at combo=2.
- Peak is "BEYOND DEATH!!!!!" at combo=8 (clips there).
- Combo number continues past 8 in display even though taunt clips — correct behavior.
- Design idea: fill index 1 with "STILL ALIVE..." for early acknowledgment at combo=1.

## Known Follow-ups / Tuning Opportunities
- Chain hitbox is 30 wide but visible chain is ~6 wide. Tightening to ~12–14 would match visual more fairly.
- Soul collection radius (30) in world coords — no perspective scaling. Near souls feel too easy, far souls nearly uncollectable. Consider scaling.
- Combo never decays mid-run — only resets on death. Consider decay on near-misses or timeouts for more dynamic tension.
- No audio at all. Screen-shake + particles carry all impact feedback.

## Detailed File: patterns.md
See patterns.md for obstacle type dimensions, hitbox formulas, and spawn probability notes.
