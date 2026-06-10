# Carver 2.0 PRD

## 0. Core Judgment

Carver 1.0 validated the hook, not the game.

The thesis is strong:

> every move changes the board
> progress consumes future control

But the current mechanic only teaches one durable lesson:

> preserve stopping points

That is not enough to sustain a puzzle game. It is a good local rule, not a complete rulespace.

Carver 2.0 should not be a polish pass. It should be a mechanics rewrite whose job is to turn the thesis into a system that keeps producing new thoughts.

## 1. What 1.0 Proved

### What worked

- The name, icon, dark terminal atmosphere, and `carver` identity are coherent.
- The browser delivery model works: static Next.js, Canvas, Cloudflare Pages.
- The bilingual presentation and SEO shell are good enough to keep.
- The first-time interaction lands: leaving dirt behind and seeing it become ice is legible and memorable.
- The phrase “progress consumes future control” is the right north star.

### What failed

- The core gameplay collapses into “count the remaining stopping points.”
- The player sees most of the rulespace within a few minutes.
- Later levels risk becoming larger arrangements of the same idea, not new ways of thinking.
- The product wrapper is currently more mature than the puzzle system.
- The existing UI copy reinforces the narrow 1.0 strategy: preserve stopping points.

### Root cause

The thesis and the mechanic are on different abstraction levels.

- Thesis: irreversible decisions reshape the future.
- Current mechanic: dirt becomes ice, ice makes you slide.

Those are related, but not equivalent. “Sliding on ice” is only one expression of irreversible control loss. The real design interest is not ice. It is history becoming constraint.

## 2. 2.0 Product Thesis

Carver 2.0 is a minimalist puzzle game about irreversible progress.

The player is not merely crossing a board. The player is spending the board.

One-line product promise:

> This is not a puzzle about finding the path. It is a puzzle about what your path destroys.

Chinese promise:

> 这不是一个找路游戏，而是一个关于“你走出的路会摧毁什么”的游戏。

## 3. Design Goal

Carver 2.0 must make the player repeatedly update their model of the world.

The target progression is not:

```text
learn stopping points → practice stopping points → harder stopping points
```

The target progression is:

```text
movement changes terrain
→ terrain has durability
→ control points are consumable
→ old paths become future constraints
→ solving now can destroy solving later
```

A successful 2.0 level should make the player ask at least one of these questions:

- What am I spending by moving here?
- Do I need this tile now, or later?
- Should I preserve control, or deliberately lose it?
- Can I turn my previous damage into a tool?
- Does the obvious successful route make the final route impossible?

## 4. Design Principles

### 4.1 Thesis before feature

Every mechanic must serve this sentence:

> Progress consumes future control.

If a mechanic is only a new obstacle, decoration, or content multiplier, it does not belong in 2.0.

### 4.2 Fewer mechanics, deeper consequences

Do not add Clay, Glass, Sponge, Ember, timers, history scars, propagation, and moving goals all at once. That creates a busy prototype, not a sharper game.

2.0 should first prove that a small grammar can produce 20 good handcrafted levels.

### 4.3 Old habits must break

A new layer is only successful if it invalidates an old autopilot.

Example:

- 1.0 habit: preserve stopping points.
- 2.0 correction: some stopping points must be consumed early; some must be destroyed; some are traps if preserved.

### 4.4 The board must explain itself

No long tutorial overlays. New rules should be taught by tiny levels that isolate the rule, then invert it.

Text can label, but the level must teach.

## 5. Core 2.0 Mechanics

## 5.1 Foundation: Dirt Becomes Ice

Keep the 1.0 foundation:

```text
Dirt → leave → Ice
Ice → slide
Wall → stop/block
Goal → win
```

But reframe it correctly:

- This is the alphabet.
- This is not the full language.
- It teaches that movement changes the world.

## 5.2 Primary Upgrade: Terrain Durability

Add tile lifecycle:

```text
Dirt → Ice → Void
```

Rules:

- Leaving `Dirt` turns it into `Ice`.
- Passing over `Ice` consumes its final durability and turns it into `Void` after the player leaves it.
- `Void` cannot be crossed. Depending on level tuning, entering it either kills the player or is blocked; the MVP should prefer “blocked” for clarity unless death is already visually obvious.

Why this matters:

1.0 asks:

> Where can I stop?

2.0 starts asking:

> Which parts of the board can survive being used twice?

This is the smallest change that upgrades the game from stopping-point counting to irreversible resource management.

## 5.3 Control Resource: Anchor Tiles

Add `Anchor` as a deliberate stopping resource.

Rules:

- `Anchor` stops sliding.
- Standing on `Anchor` allows the next deliberate move.
- `Anchor` does not behave like normal dirt.

MVP variants:

- `Anchor`: permanent stop.
- `Fragile Anchor`: stops once, then becomes `Ice` or `Void`.

Design purpose:

- Turns “stopping point” from accidental leftover dirt into an explicit resource.
- Lets level design separate “terrain durability” from “control recovery.”
- Creates choices about when to spend control.

Important: do not overuse permanent anchors. If anchors are too stable, 2.0 regresses back into “count the stops.”

## 5.4 Optional Later Layer: Directional Memory

Only after durability + anchors prove depth, consider directional memory.

Rule concept:

```text
A carved tile remembers the direction used to create it.
Re-entering that tile biases or forces movement along that remembered direction.
```

Why it is interesting:

- The board does not just become worse; it remembers how you shaped it.
- The player’s past intention becomes a future constraint.
- This directly expresses “history becomes structure.”

Risk:

- Cognitive load is high.
- Visual language must be excellent.
- It should not be in the first MVP unless 20-level durability playtesting is already successful.

## 5.5 Optional Later Layer: Moving Goal

A moving or stateful goal can be explored later, but it is not MVP.

Good version:

- The goal shifts after specific terrain changes.
- The player must prepare the future goal position before activating it.

Bad version:

- The goal simply moves every N turns.
- This becomes timing noise instead of irreversible planning.

## 6. Mechanics to Avoid for 2.0 MVP

Avoid these until the core loop proves itself:

- Large terrain taxonomy: Clay, Glass, Sponge, Ember, etc.
- Timers and pulse tiles.
- Cross-attempt memory.
- Procedural level generation.
- Enemies.
- Powerups.
- Narrative systems.
- Score chasing.
- Monetization/account features.

Reason:

Carver’s current problem is not lack of content. It is insufficient mechanic unfolding. Adding many rules too early can hide the problem instead of solving it.

## 7. Level Progression

## 7.1 Chapter 1: First Cut

Purpose: preserve the 1.0 “aha.”

Mechanics:

- Dirt
- Ice
- Wall
- Goal

Player learns:

- Moving changes terrain.
- Ice removes voluntary stopping.
- Untouched dirt can recover control.

Level count: 4–5.

Exit test:

- Player can explain why shortest path is not always correct.

## 7.2 Chapter 2: No Road Twice

Purpose: introduce terrain durability.

Mechanics:

- Dirt → Ice → Void

Player learns:

- A route can be useful once and fatal later.
- Reusing a path is a cost, not a default.
- Preserving all stops is not always possible.

Level count: 6–8.

Teaching order:

```text
isolate → repeat → punish reuse → require deliberate breakage → combine with 1.0 sliding
```

Exit test:

- Player can predict which tiles will become unusable after a move.

## 7.3 Chapter 3: Borrowed Control

Purpose: make control explicit and consumable.

Mechanics:

- Anchor
- Fragile Anchor

Player learns:

- Control is a resource.
- Stopping early can be wrong.
- Spending a stop can open one route while closing another.

Level count: 6–8.

Exit test:

- Player solves at least one level by refusing an obvious anchor.

## 7.4 Chapter 4: Past Becomes Structure

Purpose: introduce one high-leverage memory mechanic if earlier chapters succeed.

Candidate mechanic:

- Directional Memory

Player learns:

- The board remembers not only where you moved, but how.
- A previous route can become infrastructure or trap.

Level count: 6–10.

Gate:

- Do not build this chapter until Chapters 1–3 produce at least 20 playable levels and external playtesters report genuine new thinking.

## 8. MVP Scope

The first 2.0 implementation should be deliberately small.

### Must ship

- `Dirt → Ice → Void` lifecycle.
- `Anchor` tile.
- `Fragile Anchor` tile if permanent anchors are too easy.
- Undo last move.
- Restart level.
- Level select.
- 15–20 handcrafted levels.
- Engine-level tests for all tile transitions.
- Visual distinction for Dirt, Ice, Void, Anchor, Fragile Anchor.
- Updated EN/ZH copy that no longer frames the game only as “preserve stopping points.”

### Should ship

- Move counter.
- Undo counter.
- Simple chapter labels.
- Tiny one-line mechanic hints per chapter.
- Mobile geometry check for controls not covering the board.

### Should not ship yet

- Directional memory.
- Propagation.
- Timers.
- Moving goal.
- Procedural generation.
- Scoring/leaderboards.

## 9. Engine Requirements

Current engine state is too narrow:

```ts
Tile = 'DIRT' | 'ICE' | 'WALL' | 'GOAL'
```

2.0 needs the engine to own rules, not the component.

Required concepts:

- Tile lifecycle and durability.
- Movement resolution.
- Slide stopping rules.
- Transition events for renderer/SFX.
- Level loading from data.
- Undo stack.
- Win/loss state.

Suggested tile set for MVP:

```ts
Tile =
  | 'DIRT'
  | 'ICE'
  | 'VOID'
  | 'WALL'
  | 'GOAL'
  | 'ANCHOR'
  | 'FRAGILE_ANCHOR';
```

Suggested move result events:

```ts
type GameEvent =
  | { type: 'tileChanged'; from: Tile; to: Tile; x: number; y: number }
  | { type: 'startedSliding'; direction: Direction }
  | { type: 'stopped'; reason: 'wall' | 'dirt' | 'anchor' | 'blocked' }
  | { type: 'won' }
  | { type: 'dead' };
```

The renderer should consume events. It should not infer rules by inspecting state after the fact.

## 10. Level Data Requirements

Levels must be data, not hardcoded component behavior.

Each level should declare:

- id
- title
- chapter
- grid
- mechanic tags
- optional EN/ZH hint
- optional reference solution for tests

Example shape:

```ts
type LevelDefinition = {
  id: string;
  title: string;
  chapter: 'first-cut' | 'no-road-twice' | 'borrowed-control' | 'past-becomes-structure';
  grid: string[];
  mechanics: Array<'ice' | 'void' | 'anchor' | 'fragile-anchor' | 'directional-memory'>;
  hint: { en: string; zh: string };
  solution?: Direction[];
};
```

## 11. UX Requirements

### Controls

Keep:

- WASD
- arrow keys
- swipe
- touch D-pad
- restart

Add:

- undo
- level select
- visible level/chapter indicator

### Copy direction

Stop explaining the game as “preserve stopping points.”

Better copy:

- “Every route spends the board.”
- “Ice can carry you once. Reuse it carelessly and the path collapses.”
- “Anchors give control back, but some control can only be borrowed once.”

Chinese direction:

- “你不是在找路，你是在花掉棋盘。”
- “冰面能带你走一次；重复使用会让路塌掉。”
- “锚点能把控制权借回来，但有些控制权只能借一次。”

### Undo

Undo is a UX feature, not a world mechanic.

Rules:

- Default: unlimited undo for normal mode.
- Optional later: challenge mode can limit undo.
- Undo must restore full engine state, including tile durability and fragile anchors.

Why:

Carver is prediction-heavy. Without undo, players will restart too often and confuse puzzle difficulty with interface punishment.

## 12. Visual Requirements

The visual language must communicate rules before beauty.

Required distinctions:

- Dirt: stable, grippy, usable.
- Ice: slick, already spent once.
- Void: gone, unusable, dangerous.
- Anchor: control recovery.
- Fragile Anchor: control recovery with visible decay.
- Goal: destination, not terrain.

Rules:

- Do not rely only on color.
- Use texture/shape differences for tile state.
- Tile changes must animate briefly and clearly.
- Void must not look like background decoration.
- Fragile Anchor must show its one-use nature before the player steps on it.

## 13. Testing Requirements

### Engine tests

Must test:

- Dirt becomes Ice after leaving.
- Ice becomes Void after being reused, if lifecycle rule is enabled.
- Void blocks movement or kills consistently, based on chosen MVP rule.
- Anchor stops sliding.
- Fragile Anchor stops once and then degrades.
- Wall stops or blocks correctly.
- Goal wins.
- Undo restores grid, player position, sliding state, win/death state, and fragile tile state.
- Input is ignored while sliding, won, or dead.

### Level tests

Must test:

- Each level has exactly one player start.
- Each level has at least one goal.
- Each level only uses unlocked mechanics for its chapter.
- Every level with a reference solution is solvable by replaying that solution through the engine.
- EN/ZH hints exist for each level that has a hint key.

### Product checks

Must verify:

- `npm run check` passes.
- Production build succeeds.
- Mobile controls do not overlap the board.
- The live site still defaults to English and switches to Chinese correctly.

## 14. External Validation Plan

Do not declare 2.0 successful because the PRD sounds good. That is exactly the trap.

Validation target:

- Ship a 15–20 level prototype.
- Put it in front of 5–10 real players.
- Watch without explaining.

Collect:

- Where players first understand `Ice → Void`.
- Whether they can explain anchors after one or two levels.
- Which levels create “new thought” versus “same trick again.”
- Whether failures feel earned or arbitrary.
- Whether players use undo as thinking support or spam it from confusion.

Success signals:

- Players describe the game as managing irreversible cost, not only preserving stops.
- Players change strategy between chapters.
- At least one level makes players solve by deliberately destroying or refusing control.
- Players can predict tile transitions before moving.

Failure signals:

- Players still summarize the game as “leave stopping points.”
- Levels after 10 feel like larger versions of the same trick.
- Players brute-force with undo instead of forming a model.
- Tile transitions surprise players in a bad way.
- The new mechanics require too much text to explain.

## 15. Response to the Critique

The critique is correct.

Carver 1.0 has a strong thesis but an underpowered mechanic. “Dirt becomes ice” is not wrong; it is just incomplete. It creates one good insight, then runs out.

The important correction is this:

> Carver is not fundamentally about ice. It is about irreversible decisions.

Ice should remain because it is a clean first expression of control loss. But it must become layer one of a broader system where terrain has durability, control is consumable, and previous movement creates future constraints.

The next version should not ask, “What other cool tiles can we add?”

It should ask:

> What is the smallest ruleset that keeps making the player rethink the cost of progress?

For 2.0, the answer is:

```text
Dirt → Ice → Void
+
Anchor / Fragile Anchor
+
Undo
+
15–20 handcrafted levels
+
engine tests
+
real playtest observation
```

That is enough to prove whether Carver is a real puzzle system or just a beautiful GIF.

## 16. 2.0 Implementation Sequence

### Phase 1: Engine seam

- Move all rule behavior into engine-level modules.
- Add tile lifecycle support.
- Add level data loading.
- Add undo stack.
- Add tests before expanding UI.

### Phase 2: MVP mechanics

- Implement `VOID`.
- Implement `ANCHOR`.
- Implement `FRAGILE_ANCHOR` only if needed after first levels.
- Emit explicit game events for renderer/SFX.

### Phase 3: Level set

- Build 5 First Cut levels.
- Build 6–8 No Road Twice levels.
- Build 6–8 Borrowed Control levels.
- Include reference solutions for at least core teaching levels.

### Phase 4: Product update

- Update UI copy away from stopping-point framing.
- Add level select, undo, move/undo counters.
- Update tile legend and i18n.
- Verify mobile controls and build.

### Phase 5: Playtest gate

- Deploy prototype.
- Watch 5–10 users.
- Kill, simplify, or defer any mechanic that does not produce new thinking.

## 17. Out of Scope

- Procedural generation.
- Level editor.
- Accounts and cloud saves.
- Leaderboards.
- Daily challenges.
- Monetization.
- Story mode.
- More than one advanced memory mechanic before playtesting.
- Any mechanic that exists only because it sounds clever in a PRD.

## 18. Decision Record

Confidence: medium-high.

Reason:

- The critique matches the observed current engine and UI copy.
- The proposed MVP directly addresses the abstraction mismatch.
- The biggest unknown is not technical feasibility; it is whether `Dirt → Ice → Void + Anchor` produces enough level depth.

Owner:

- Product/mechanic decision: Liz.
- Implementation decision: agent/developer working in the Carver repo.

Next checkpoint:

- A playable 15–20 level 2.0 prototype, not another document.
