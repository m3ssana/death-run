# ⚰ DEATH.RUN — Escape Hell or Die Trying ⚰

A brutally difficult HTML5 endless runner where you descend through hell itself, dodging demonic obstacles, collecting tortured souls, and questioning your life choices.

## About

Welcome to **DEATH.RUN**, where the difficulty is high, the framerate is smooth, and your sanity will not be. This is not a game about winning. This is a game about **dying in increasingly creative ways**.

You are a skeleton. You are falling into hell. Your only tools are:
- **Arrow keys or WASD** to move (good luck)
- **Shift** to dash (invincibility frames for 0.25 seconds, then you're toast again)
- **Your dying will and determination** (currently 0%)

## How to Play

1. Open `index.html` in your browser
2. Press SPACE to descend into hell
3. Dodge:
   - **Hellfire Pillars** — flaming columns of pure rage
   - **Demon Skulls** — they're smarter than you
   - **Bone Saws** — spinning metal discs of pain
   - **Lava Geysers** — hot columns that go "whoosh"
   - **Blood Spikes** — pointy things from a horror film
   - **Chain Whips** — why are there chains?? WHY ARE THERE CHAINS???

4. Collect souls for points and combos
5. Die when the inevitable happens (and it will)
6. Press SPACE to descend again and suffer more

## Features

✨ **Brutal Difficulty**
Your first 10 deaths are basically tutorials. By death 50, you might understand the pattern.

✨ **3D Perspective Rendering**
Everything looks like it's made of pixel art from 2004, but it's actually advanced Canvas2D black magic.

✨ **Combo System**
Dodge 5+ obstacles in a row and receive increasingly unhinged taunts:
- NOT BAD...
- UNHOLY
- DEMONIC!
- BLASPHEMOUS!!
- SACRILEGE!!!
- GODKILLER!!!!
- **BEYOND DEATH!!!!!**

✨ **Particle Effects**
When you dash, your skeleton erupts in orange flame particles. When you die, expect even MORE particles.

✨ **Bloom Lighting**
Yes, your GPU is rendering a secondary canvas just for glow effects. Is it necessary? No. Do we do it anyway? Yes.

✨ **Touch/Mobile Support**
Play on your phone! Suffer in portrait mode! The hell isn't location-specific!

## Architecture

This game is built with:
- **Phaser 3** — for scene management and input handling
- **Canvas 2D API** — for all rendering (gradients, bezier curves, composite operations, etc.)
- **ES6 Modules** — because monolithic files are for the weak
- **Pure JavaScript** — no frameworks, no dependencies, no excuses

See `CLAUDE.md` for detailed architecture notes and `js/` for the modular code structure.

## Installation

It's one HTML file. Literally just download/clone and open in a browser.

```bash
git clone https://github.com/m3ssana/death-run.git
cd death-run
# Open index.html in your browser
# OR run a local server:
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Controls

| Key(s) | Action |
|--------|--------|
| **SPACE** | Start game / Restart |
| **ARROW KEYS** or **WASD** | Move left/right, up/down |
| **SHIFT** | Dash (invincibility + boost + particle explosion) |
| **MOUSE/TOUCH** | Swipe to move (mobile) |

## Difficulty Scaling

The game gets harder as you progress:
- Speed increases with distance
- Obstacles spawn faster
- Enemy types vary

There is **no "easy mode"**. There is only "harder" and "hardest."

## Death Screen

When you die (and you will), you'll see:
- **DISTANCE**: How far you fell before becoming a skeleton paste
- **SOULS COLLECTED**: Sad ghosts you befriended
- **OBSTACLES EVADED**: Probably less than you think
- **PEAK COMBO**: Your greatest achievement (likely 3)
- **CAUSE OF DEATH**: The obstacle that sent you packing

## Code Quality

This project has:
- ✅ Modular architecture (15+ ES6 modules)
- ✅ Clean separation of concerns
- ✅ Canvas2D rendering preservation
- ✅ Phaser 3 scene management
- ✅ No console errors (probably)
- ✅ Documentation (in `CLAUDE.md`)

This project does NOT have:
- ❌ A difficulty slider
- ❌ A pause button (suffering waits for no one)
- ❌ Sound (your speakers thank me)
- ❌ Leaderboards (I don't want to see your high score)
- ❌ Mercy

## Future Ideas

- [ ] **Sound effects** — screaming is free
- [ ] **New obstacle types** — there's always more ways to die
- [ ] **Skins** — different skeleton models (all equally doomed)
- [ ] **Achievements** — "Dodged 1000 obstacles" = "congratulations, you wasted your life"
- [ ] **Multiplay** — competitive suffering
- [ ] **Level editor** — create your own hell

## License

MIT — You're free to use, modify, and redistribute. Please credit the original work. Or don't. It's your karma.

## Credits

**Concept & Development**: m3ssana
**Porting to Phaser 3**: Claude (because I needed someone to blame for bugs)
**Testing**: Your therapy bills
**Difficulty Tuning**: Spite and regret
**Soundtrack**: The crushing weight of failure

---

**Warning**: DEATH.RUN may cause:
- Frustration
- Keyboard damage
- Existential dread
- Surprisingly good hand-eye coordination
- An unhealthy understanding of game difficulty curves
- Regret

**Play at your own risk. You have been warned.** ⚰

---

Made with ☠️ and Canvas2D black magic.
