# DEATH.RUN — Design Patterns & Implementation Notes

## Obstacle Type Reference (constants.js)
| Name | Pattern | w | h | Notes |
|------|---------|---|---|-------|
| HELLFIRE PILLAR | pillar | 30 | 80 | Static, 3D lit, top face visible |
| DEMON SKULL | skull | 44 | 44 | Bobs (sin), glowing eyes |
| BONE SAW | saw | 50 | 20 | Rotates, hitbox 50x50 (square, not rect) |
| LAVA GEYSER | geyser | 25 | 120 | Wavy animation, tall threat |
| BLOOD SPIKE | spike | 15 | 65 | Smallest w, dripping blood animation |
| CHAIN WHIP | chain | 8 | 200 | Tallest at 200px, swinging motion |

## Obstacle Hitboxes (collision.js)
- pillar: { x: o.x - w/2, y: o.y, w: o.w, h: o.h }
- skull: { x: o.x - w/2, y: o.y - w/2, w: o.w, h: o.w } (square, not w x h)
- saw: { x: o.x - 25, y: o.y - 25, w: 50, h: 50 } (hardcoded 50x50)
- geyser: { x: o.x - 10, y: o.y, w: 20, h: o.h } (narrowed to 20px)
- spike: { x: o.x - w/2, y: o.y, w: o.w, h: o.h }
- chain: BROKEN — cx depends on player.y, creates moving hitbox. Needs refactor.

## Player Hitbox (game-loop.js line 89)
- Current: ax = player.x - 12, ay = player.y - 16, aw = 24, ah = 32
- Recommendation: shrink to aw=20, ah=26 for forgiveness hitbox
- Player visual at PLAY_LEFT (x=30): sz=30, scale=1.0
- Player visual at PLAY_RIGHT (x=300): sz~25, scale~0.84
- Hitbox does NOT scale — mismatch largest at x=30 (left side of play area)

## Perspective System (perspective.js)
- t = clamp((wx - 20) / (W - 55), 0, 1) — left=0 (near), right=1 (far)
- scale = lerp(1.0, 0.55, depth) — objects shrink as they move right
- sy = lerp(wy, VP_Y, depth * 0.2) — mild vertical convergence
- VP_Y = H/2 = 325 — vanishing point at vertical center
- The "descent" direction is actually horizontal (left=player zone, right=far distance)

## Speed / Difficulty Formulas
- speed = 3 + distance/1000 (unbounded — cap at 8 recommended)
- difficulty = min(distance/2000, 1) (caps at 1.0, used in vx calc only)
- obstacle vx = -(speed + rand(-0.5, 0.5) + difficulty*2)
- At difficulty=1 and speed=5: vx range is -6.5 to -7.5 (fast)

## Spawn Timing (game-loop.js)
- Obstacle: every 100 frames (frameCount - lastObstacle > 100)
- Soul: every 50 frames (frameCount - lastSoul > 50)
- Problem: frame-based, not speed or distance-based
- Better: distance-based intervals (120 distance units for obstacles, 80 for souls)

## Dash Mechanic (game-loop.js)
- Cooldown: 60 frames (~1 second at 60fps)
- Invincibility: 15 frames (~0.25 seconds)
- Triggers: ShiftLeft or ShiftRight
- CRITICAL BUG: speed += 2 permanently on each dash
- Fix: dashSpeedBonus = 2, decays at 0.05/frame, adds to base speed formula

## Combo System
- Increments on: soul collection only (BUG — should increment on dodge too)
- Resets on: startGame() (death/restart) but NOT on taking damage during invincibility
- Display: updateHUD() shows combo + '×' + COMBO_TAUNTS[min(combo, 8)]
- comboPanel.classList.toggle 'combo-active' drives CSS glow animation

## Recommended Obstacle Unlock Order for Tutorial
- Distance 0-500: Blood Spike only (simplest, static, smallest)
- Distance 500-800: + Demon Skull (round, clear hitbox)
- Distance 800-1200: + Hellfire Pillar (larger but static)
- Distance 1200-1600: + Bone Saw (rotating, dynamic feel)
- Distance 1600-2000: + Lava Geyser (tall, teaches vertical avoidance)
- Distance 2000+: + Chain Whip (full chaos, swinging hitbox)

## Performance Benchmarks (estimated)
- drawBloom(): one radialGradient per light source per frame — costly on mobile
- drawPlayer(): 1 skull, 3 ribs, 2 arms, 2 legs, multiple gradients per frame
- drawObstacle pillar: 8 random flame particles per frame (expensive — uses Math.random() in draw)
- Particle glow: createRadialGradient per glow particle — most expensive per-unit render
- Suggested limits: particles <= 150, bgParticles <= 60, lightSources <= 20

## Touch Input Architecture
- Current: absolute position lerp (broken — pushes into obstacles)
- Recommended: relative drag from touch start position
- Dash on mobile: double-tap detection or rapid swipe gesture
- Mobile detection: navigator.maxTouchPoints > 0

## Death Screen Stats (die() function)
- distance: Math.floor(gameState.distance) — accurate
- soulCount: accurate running counter
- demonsDodged: BROKEN — uses obstacles.length-1 at death moment
- maxCombo: accurate (but misleading because it's soul-based, not dodge-based)
- cause: obstacle.type.name — accurate, readable, shareable
