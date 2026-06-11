# Carver PRD — Irreversible Movement Puzzle

## Core Judgment

Carver should not become a feature-rich puzzle platform. Its durable product shape is smaller and sharper:

> A tiny board where every move edits the future, and the best solution often uses the damage you already caused.

The old framing — “preserve stopping points” — was too narrow. The better framing is:

> Damage becomes infrastructure.

That sentence is the product. Everything else is implementation detail.

## Product Promise

Carver is a minimalist browser puzzle game about irreversible movement.

The player is not merely finding a path. The player is carving a world that remains changed after every move. A good Carver level makes the player realize that a mistake, scar, collapse, or apparent dead end may become the exact structure needed to solve the board.

One-line public promise:

> Every move spends the board. Sometimes the wound is the way out.

Chinese promise:

> 每一步都会消耗棋盘。有时，伤口本身就是出路。

## Target User

Carver is for players who like compact logic toys rather than content-heavy games:

- puzzle players who enjoy Sokoban, Baba Is You, Stephen's Sausage Roll, A Monster's Expedition, or tiny browser puzzles;
- people who enjoy “one new rule changes everything” moments;
- portfolio visitors who should understand the product in under 20 seconds.

It is not for users looking for action, collectibles, narrative progression, accounts, score chasing, or procedural endless play.

## Current Product State

The current prototype has already crossed the most important line: it is a real playable game, not a decorative shell.

What exists:

- static Next.js browser delivery;
- Canvas-based board renderer;
- eight handmade levels;
- keyboard, swipe, and touch controls;
- undo and restart;
- bilingual UI;
- Web Audio SFX/BGM;
- engine tests;
- terrain lifecycle: `Dirt -> Ice -> Void`;
- void brace behavior: `Void` is not just death/absence; it can stop a slide and restore a decision point.

The important product correction is that `Void` should remain useful. If `Void` is only punishment, Carver becomes resource accounting. If `Void` can become a brace, Carver becomes a game about reusing irreversible damage.

## Product Constitution

### 1. One Board, One Thought

A level should teach or invert one thought. If a level needs a paragraph, the level is doing the wrong job.

Good level question:

- Can I make this scar useful?
- Should I spend this foothold now or later?
- Is the clean route a trap?
- Can I deliberately collapse a path to create a stop?

Bad level question:

- Did I remember five tile types?
- Did I read the tutorial text?
- Did I brute-force all arrow-key sequences?

### 2. Irreversibility Must Be Legible

Every changed tile must answer three questions visually:

- What was it?
- What is it now?
- Can I use it again?

If the player cannot predict a tile's next state before moving, the mechanic is not ready.

### 3. Damage Must Sometimes Help

This is the non-obvious insight. Most irreversible puzzle games make damage a cost. Carver's distinctive move is that damage can become structure.

Design implication:

- `Void` should not be only a pit.
- Collapsed routes should sometimes become braces, blockers, or future alignment tools.
- A beautiful Carver solution should feel slightly wrong before it feels inevitable.

### 4. Undo Is Thinking Support

Undo is not an accessibility concession or an easy-mode feature. It is the correct interface for a prediction-heavy puzzle.

Rules:

- keep undo fast and cheap;
- restore full engine state;
- never punish experimentation in normal mode;
- do not add score/leaderboard pressure that makes undo feel shameful.

### 5. No Content Inflation

More levels are useful only if they create new thinking. A 12-level Carver with six strong reversals is better than a 60-level Carver that repeats “save enough stops.”

Do not add:

- enemies;
- timers;
- powerups;
- meta-progression;
- procedural generation;
- daily challenges;
- leaderboards;
- accounts;
- story mode;
- a level editor;
- monetization.

Not yet. Probably not ever, unless external play shows a real need.

## Mechanics Contract

### Existing Tile Grammar

```text
#      Wall: blocks movement
@      Player start
$      Goal: win condition
.      Dirt: stable foothold; can initiate deliberate movement
space  Ice: frictionless slide surface
x      Void scar: unusable as floor, but can brace a slide
```

### Existing Terrain Lifecycle

```text
Dirt -> Ice -> Void
```

Rules:

- leaving `Dirt` turns it into `Ice`;
- sliding over old `Ice` can collapse it into `Void`;
- `Void` stops a slide before the scar and can restore footing under the player;
- the goal is destination, not terrain grammar.

### Design Interpretation

`Dirt` is agency.
`Ice` is spent agency.
`Void` is damage that may become structure.

This interpretation should guide copy, renderer, sound, and future levels.

## Level Design Doctrine

### The Teaching Arc

The current arc should stay compact:

```text
agency exists
-> movement spends agency
-> spent agency removes control
-> reused agency collapses
-> collapse can become support
-> damage can be placed deliberately
```

### Level Quality Test

A level is worth keeping if at least one of these is true:

- the first obvious move is wrong for an interesting reason;
- the player must create a scar intentionally;
- an old scar becomes a useful stop;
- the solution changes how the player describes the rules;
- the level is a clean tutorial for exactly one mechanic.

A level should be cut if:

- it is only bigger;
- it requires blind trial-and-error;
- the same idea appears in a cleaner earlier level;
- the difficulty comes from cramped geometry rather than changed reasoning;
- the player wins without understanding why.

### Next Level Set Target

The next stable version should aim for 10-14 levels, not 30.

Suggested shape:

- 2 levels: agency and sliding;
- 2 levels: collapse and void creation;
- 3 levels: void as brace;
- 2 levels: deliberate scar placement;
- 1-3 levels: synthesis/challenge.

A 15th level is allowed only if it proves a genuinely new inversion.

## UX Requirements

### First 20 Seconds

The player should be able to start without reading.

Required:

- visible board above any long explanation;
- one-line tagline;
- first level solvable with one obvious input;
- help available, not forced;
- mobile touch controls never cover the board.

### Copy Direction

Use physical, human language. Avoid abstract design jargon in the app surface.

Good:

- “Every move spends the board.”
- “Old ice collapses into a scar.”
- “Aim at the wound. Let it stop you.”
- “The clean route is not always the safe route.”

Avoid:

- “resource optimization”;
- “terrain lifecycle management”;
- “state transition puzzle”;
- “procedural mechanic depth.”

### Audio Direction

BGM should feel tonal, cold, and spacious — not like low-frequency machine hum.

Contract:

- bass supports, never dominates;
- musical body lives in low-mid/mid/high harmonic layers;
- state changes may brighten or dim the pad, but should not become busy music;
- SFX should clarify actions, not arcade-ify the game.

Audio failure test:

> If a player describes the background as “white noise,” “fan hum,” or “low drone,” the mix is wrong.

## Technical Contract

### Architecture

Keep the seams boring:

- `lib/game/engine.ts`: owns rules and state transitions;
- `lib/game/levels.ts`: owns playable level data;
- `lib/game/renderer.ts`: draws state and feedback;
- `lib/game/audio.ts`: owns synthesized sound;
- `components/GameCanvas.tsx`: connects input, loop, renderer, and engine;
- `components/CarverPage.tsx`: product shell and copy.

Do not move game rules into React UI. Do not infer rules in the renderer.

### Verification Gate

Before shipping product changes:

```bash
npm run check
```

For deployment-sensitive changes:

```bash
npm run build
```

For folder hygiene:

```bash
npm run clean
```

Generated directories such as `.next/`, `out/`, `node_modules/`, and `tsconfig.tsbuildinfo` are local artifacts, not source.

## External Validation

Do not declare Carver “done” because the PRD sounds elegant. That is the velvet-lined trap.

Run a small playtest with 5 people.

Observe without explaining:

- Can they start within 20 seconds?
- When do they understand `Dirt -> Ice -> Void`?
- Do they discover that `Void` can help?
- Do they describe the game as “save stops” or “use damage”?
- Which level creates the first real pause/thought?
- Where do they brute-force with undo?

Success signals:

- players intentionally create scars;
- players can predict tile changes before moving;
- players verbalize “damage as structure” in their own words;
- at least one level creates a clean aha without extra text;
- no one needs a long tutorial to understand the core.

Failure signals:

- players think `Void` is only a hazard;
- later levels feel like larger copies of earlier ones;
- undo becomes blind spam;
- BGM feels like low-frequency noise;
- the product wrapper feels more polished than the rulespace.

## Kill / Cut Rules

If future work adds complexity but does not strengthen “damage becomes infrastructure,” cut it.

Cut candidates first:

1. any new tile type that behaves like a generic obstacle;
2. any tutorial copy that compensates for unclear levels;
3. any level whose solution cannot be explained in one sentence;
4. any UI panel that competes with the board;
5. any audio layer that masks action feedback.

## Next Checkpoint

The next meaningful checkpoint is not another strategy document.

It is:

- 10-14 level set;
- all engine tests green;
- mobile controls verified geometrically;
- BGM passes the “not a drone” smell test;
- 5-person silent playtest notes.

Confidence: medium-high.

The product thesis is strong. The remaining uncertainty is not whether Carver can be polished; it is whether enough levels can produce new thought without adding new mechanics. That must be proven in play, not argued in prose.
