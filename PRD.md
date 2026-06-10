# Carver 2.0 PRD

## 1.0 Post-Mortem (What We Learned)

Carver 1.0 proved several things:

**What worked:**
- Visual identity, deployment pipeline, static Next.js + Cloudflare Pages, i18n, SEO, UI atmosphere
- The core *visual* mechanic is compelling: dirt turns to ice, the player slides
- The tagline "progress consumes future control" resonates

**What didn't work:**
- The actual gameplay is "count stopping points", not "manage irreversible decisions"
- The mechanic exhausts itself in 5 minutes — all levels are isomorphic
- 1.0 started from mechanism ("what if tiles change when you leave?") rather than a cognitive paradox
- Product packaging outran core loop maturity

**Root cause:** The thesis and the mechanic live on different abstraction levels. The thesis is about irreversible choice; the mechanic is about a single tile-state transition with no combinatorial expansion.

## 2.0 Design Philosophy

### Start from the paradox, not the mechanism.

The cognitive paradox we are pursuing:

> **Every action you take to solve the puzzle also destroys the resources you need to solve it. The path IS the cost.**

This is the genuine thesis. "Dirt turns to ice" was one expression of it — but too narrow to sustain 30+ levels.

### The mechanic is a grammar, not a sentence.

A good puzzle mechanic is a small set of primitive rules whose combinations explode combinatorially. Portal's grammar is: portals, momentum, objects. Baba Is You's grammar is: pushable rules, rule words, object words. Carver 2.0's grammar must be: **terrain types that change based on player interaction, and interact with each other.**

### Three design tests for every new element:

1. Does it change what the player *understands* about the world, not just what they *do*?
2. Does it combine with existing elements to produce genuinely new puzzle shapes?
3. Can a level designer (or generator) exploit it without inventing custom logic per level?

## Core Mechanic System

### Layer 0: The Foundation (preserved from 1.0)

```
Dirt  →  step off  →  Ice  →  slide
Ice   →  slide continuously
Wall  →  stop (blocked)
Goal  →  win
```

This is the basic grammar. Every player learns it in 60 seconds. It is not the game — it is the alphabet.

### Layer 1: Terrain Types

The world contains terrain with different *durability* and *side effects*:

| Terrain | Leaves behind | Slide behavior | Special |
|---------|--------------|----------------|---------|
| Dirt    | Ice          | —              | Standard |
| Clay    | Cracked Clay  | —              | Can be stepped on twice before becoming Ice |
| Glass   | Shattered     | —              | Breaks immediately; also breaks all orthogonally adjacent Glass |
| Sponge  | Ice           | Absorbs slide  | Can stop a slide without consuming the tile |
| Ember   | Ash           | Ignites slide  | While sliding over Ember, adjacent Dirt/Clay ignite after 1 tick |

### Layer 2: Propagation

Some terrain types *propagate* their state change to neighbors:

| Terrain | Propagation |
|---------|-------------|
| Frost Dirt | When converted to Ice, all orthogonally adjacent Dirt → Frost Dirt |
| Cracking Clay | When stepped on the second time, orthogonally adjacent Clay → Cracked Clay |
| Glass | When shattered, chain-shatters connected Glass |
| Ember | When ignited, orthogonally adjacent Dirt → Ember after 2 ticks |

Propagation means the player cannot reason locally. A single step can trigger a cascade.

### Layer 3: History as Structure

The player's *past* becomes part of the current board:

- **Echo tiles:** On retry, the previous attempt's path leaves ghost tiles. Ghost tiles are passable but slow movement (can stop a slide after 2 ghost tiles instead of immediately).
- **Scarred terrain:** Some tiles remember how many times they've been stepped on across attempts. After N attempts stepping on the same tile, it degrades (Dirt → Cracked → Ice).
- **Locked history:** A level can declare "this is attempt 3" — starting with the scars of hypothetical prior attempts as a puzzle constraint.

This is where the thesis starts to bite: *retrying doesn't reset the world*. Your failures accumulate. You are carving grooves into a finite landscape.

### Layer 4: Temporal Feedback

Some tiles change based on *when* you touch them, not just *whether*:

- **Timer tiles:** After first step, count down N ticks before converting to Ice. Must plan a route that returns before the timer expires.
- **Sequence tiles:** Convert to Ice only if stepped on as the K-th move of the attempt. Wrong order = blocked.
- **Pulse tiles:** Alternate between Dirt and Ice every N ticks, independent of player action. The board has a heartbeat.

### Layer 5: Combinatorial Explosion

The real depth comes from *combinations*:

- Glass next to Clay: shattering Glass destroys the Clay's second-use buffer
- Frost Dirt + Timer: propagation races against the countdown
- Ember + Echo: your past route is now on fire
- Sponge + Pulse: the only safe stopping point is only available every N ticks
- Scarred + Sequence: you must take specific tiles at specific attempt numbers

A level designer (or procedural generator) can compose these without writing custom code per level. The grammar handles it.

## Level Progression Architecture

### Tutorial Arc (Levels 1–5)

Teach the alphabet:
1. Dirt → Ice, reach goal (1.0 level, preserved)
2. Clay: two-step tiles
3. Glass: chain-shatter
4. Sponge: safe stop
5. Ember: delayed ignition

### Expansion Arc (Levels 6–15)

Introduce one propagation or temporal mechanic per level, always combined with Layer 1:
6. Frost Dirt + Clay: propagation changes which tiles have two uses
7. Glass + Ember: shattering can spread fire
8. Timer + Sponge: the safe stop expires
9. Sequence + Glass: must shatter at the right moment
10. Pulse + Dirt: the board breathes

### History Arc (Levels 16–25)

Introduce cross-attempt mechanics:
16. Echo: first level with ghost paths
20. Scarred: terrain degrades across attempts
23. Locked history: start with scars as given
25. Echo + Ember: your past is burning

### Synthesis Arc (Levels 26–40+)

Three or more mechanics combined. No new primitives — just deeper compositions.

## What Stays from 1.0

- **Stack:** Next.js static export, Canvas 2D renderer, Cloudflare Pages deploy
- **Controls:** WASD / arrows / swipe / touch D-pad, R to restart
- **Brand:** "carver" name, icon, dark terminal aesthetic, EN/ZH i18n
- **Audio:** Web Audio API synthesized SFX (extend for new tile types)
- **Quality gate:** `npm run check` = lint + typecheck + tests

## What Changes

- **Level system:** From one hardcoded level to a level loader + progression state
- **Engine:** From Dirt/Ice/Wall/Goal only → multi-terrain with propagation, timers, history
- **Renderer:** Animations must communicate propagation (ripple effects, chain reactions)
- **UI:** Add level number indicator, attempt counter (for history mechanics), terrain legend
- **No tutorial text popups.** Terrain behavior must be discoverable through play — the first level with Glass should make it obvious.
- **Persistent state:** Attempt history stored in localStorage for Echo/Scarred mechanics

## First Playable Target

The minimum 2.0 that proves the grammar works:

- **4 terrain types:** Dirt, Clay, Glass, Sponge
- **1 propagation:** Glass chain-shatter
- **0 temporal/history mechanics** (those are Layer 3+, validate grammar first)
- **5 authored levels** covering tutorial + one combination
- **Level select** (simple list, no unlock gating needed for 5 levels)
- **Renderer updated** to visualize Glass (translucent), Clay (layered), Sponge (textured)

Success metric: a playtester can solve Level 5 without reading instructions, and says "oh that's clever" at least once.

## Out of Scope (for now)

- Procedural level generation
- Level editor
- Accounts, saves, leaderboards, monetization
- Mobile app store packaging
- Multiplayer / daily challenges
- AI-generated levels
- Tutorial overlay system (design levels to teach, don't build a separate tutorial)

## Validation Criteria

2.0 is acceptable when:

1. **Grammar proof:** At least 5 levels exist that use different mechanic combinations, and each feels like a different kind of thinking.
2. **No leaking abstractions:** A level designer can add a level by editing a data file (grid + metadata), not by writing TypeScript.
3. **Discoverability:** A new player can understand Clay and Glass within 2 levels each, without text.
4. **Performance:** Same or better than 1.0 — 60fps on mid-range mobile.
5. **Live at carver.pages.dev**, playable in under 3 seconds from cold load.
