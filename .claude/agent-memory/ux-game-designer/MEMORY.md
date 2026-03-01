# UX Game Designer — DEATH.RUN Agent Memory

## Architecture Quick Reference
- All game logic in `js/` directory (modular ES modules, no build step)
- `js/state.js` — single gameState object, source of truth for all mutable state
- `js/constants.js` — OBSTACLE_TYPES (6 types), COMBO_TAUNTS (9 entries), lerp/clamp/rand helpers
- `js/game-loop.js` — update(), startGame(), die(), updateHUD()
- `js/spawning.js` — spawnObstacle(), spawnSoul()
- `js/collision.js` — rectCollide(), getObstacleHitbox() with per-pattern hitbox logic
- `js/scenes.js` — TitleScene, GameScene (Phaser input bridge to gameState.keys[])
- `js/rendering.js` — draw(), drawBloom(), drawTitleBG()
- `js/player.js` — drawPlayer() with perspective scaling via worldToScreen()
- `js/perspective.js` — worldToScreen() maps world coords to screen; scale = lerp(1.0, 0.55, depth)
- Play area: PLAY_LEFT=30, PLAY_RIGHT=300, PLAY_TOP=70, PLAY_BOTTOM=H-20

## Critical Bugs Found (March 2026)
1. **DASH ADDS PERMANENT SPEED**: `gameState.speed += 2` in game-loop.js dash handler (line 30). Repeated dash makes game unwinnable. Fix: use decaying `dashSpeedBonus` variable.
2. **COMBO TRACKS SOULS NOT DODGES**: combo++ only on soul collection, not obstacle avoidance. The combo UI implies skill tracking but measures luck. Fix: increment combo when obstacle passes player x-position.
3. **DEMONSDODGED IS WRONG**: `demonsDodged = obstacles.length - 1` at moment of death — counts obstacles currently on screen, not obstacles dodged during run. Fix: track running counter incremented per dodge.
4. **CHAIN HITBOX IS PLAYER-RELATIVE**: getObstacleHitbox 'chain' case uses player.y in its x calculation — hitbox moves with player, untestable. Needs refactor.

## Design Insights
- Obstacle spawn is NOW distance-scaled: lerp(100, 60, difficulty) frames. Reaches 60 frames at distance 2000.
- Speed is NOW capped at 8: `Math.min(3 + distance/1000, 8)`. Playability ceiling confirmed.
- Grace period of 180 frames (3s) now delays first obstacle spawn. Souls still spawn during grace period.
- Same obstacle type no longer repeats back-to-back. lastObstacleType filters eligible pool in spawnObstacle().
- Combo milestones [5,10,25,50,100] trigger gold comboFlashAlpha overlay (0.25–0.45) + screenShake 3 + CSS burst animation on HUD panel.
- Soul spawn (50 frames) has no speed compensation — souls still fly past at high speed. Not yet fixed.
- Difficulty variable `min(distance/2000, 1)` now consistently drives both spawn rate and obstacle velocity.

## State Fields Added (March 2026)
- `gameState.gracePeriod` — countdown from 180, gates obstacle spawning
- `gameState.lastObstacleType` — pattern string of last spawned obstacle, prevents repeats
- `gameState.comboFlashAlpha` — gold flash overlay alpha, decays at 0.80x per frame
- `gameState.prevCombo` — previous frame's combo value, used to detect milestone crossings

## Performance Concerns
- No particle cap on gameState.particles. Death (40) + dash spam (15 each) + souls (10 each) can stack to 100+ simultaneously.
- ctx.createRadialGradient() called every frame per glow particle — expensive. Skip below 30% life.
- Bloom canvas drawImage + mix-blend-mode: screen is costly on mobile.
- Suggested cap: particles ≤ 150, bgParticles ≤ 60.

## Hitbox / Visual Mismatch
- Player visual scales with worldToScreen() (depth 0-1 → scale 1.0-0.55). Hitbox is always 24x32.
- Obstacle visuals scale but hitboxes use raw world dimensions.
- Forgiveness hitbox fix: shrink player hitbox to 20x26. Scale obstacle hitboxes by worldToScreen(o.x, o.y).scale.

## Touch Input Problems
- Drag-to-position touch moves player toward touch coordinates each frame at rate 0.08.
- If finger rests on obstacle, player is continuously pushed into it.
- No mobile dash (Shift key only). No gesture support. Mobile is functionally broken.
- Fix: relative drag model (offset from touch start), double-tap or swipe for dash.

## Combo System Details
- COMBO_TAUNTS[0] and [1] are empty strings (no feedback at combo 1).
- First feedback is "NOT BAD..." at combo=2.
- Peak is "BEYOND DEATH!!!!!" at combo=8 (clips there).
- Combo number continues past 8 in display even though taunt clips — correct behavior.
- Fix index 1 to "STILL ALIVE..." for early acknowledgment.

## Detailed File: patterns.md
See patterns.md for obstacle type dimensions, hitbox formulas, and spawn probability notes.
