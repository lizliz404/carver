# Carver PRD

## Product Thesis

Carver is a compact browser puzzle game about irreversible movement. The player is not simply navigating a grid; every move changes the board by turning footing into ice. The interesting tension is that progress consumes future control.

The current product should be judged as a playable puzzle toy first, not a content site. If the player cannot immediately understand how to move, feel the consequence of a move, and want to retry, the product is failing no matter how polished the surrounding chrome looks.

## Core Loop

1. Start on dirt.
2. Choose a direction.
3. The starting dirt tile becomes ice.
4. The player slides until they hit useful footing, a wall, death, or the goal.
5. The board state is now harder because prior footing may be gone.
6. Retry until the path to the goal is understood.

## Current Audience

- Primary: puzzle-game curious players opening a small web game from a link.
- Secondary: Liz using Carver as a fast prototype for evaluating a mechanic, name, UX, and deploy pipeline.

## Current Product Requirements

### Playability

- The game must be playable on desktop keyboard.
- The game must be playable on mobile touch screens.
- Input affordances must be visible without reading side documentation.
- Restart must be obvious and fast.
- Status feedback must explain whether the player is ready, sliding, dead, or has won.

### Visual Feel

- The board should feel crisp, pixel-like, and intentional.
- The central game area must not look like a blurred screenshot or stretched canvas.
- Surrounding UI should support play, not overwhelm it.
- Mobile layout should prioritize game board + controls over explanatory side panels.

### Product Clarity

- The name is Carver, not Carve. The subject is the player/role, not just the verb.
- Copy should describe the mechanism in plain terms: every move carves the world into ice.
- Documentation should separate product understanding from run/deploy instructions.

## Current Implementation Decisions

- Keep Carver as a static Next.js app deployed through GitHub-connected Cloudflare Pages.
- Keep the core game in Canvas 2D for fast iteration and low runtime complexity.
- Use keyboard controls for desktop: `WASD`, arrow keys, and `R` for restart.
- Use mobile D-pad buttons and swipe gestures for touch screens.
- Render Canvas at device pixel ratio and disable image smoothing to improve crispness.
- Keep README focused on running the project.
- Keep this PRD as the canonical place for product interpretation and iteration notes.

## Known Gaps

- The current level set is tiny and partly split between the active inline level and an older unused `levels.ts` path.
- The player avatar is functional but visually generic.
- The UI still has more terminal/protocol chrome than the product may need.
- There is no level select, tutorial progression, or win/retry analytics.
- There is no automated browser interaction test for touch controls yet.

## Validation Criteria

Carver is acceptable for the current milestone when:

- Desktop keyboard movement changes the game state.
- Mobile touch buttons change the game state.
- Mobile swipe changes the game state.
- Canvas appears crisp on high-DPI displays.
- Live Cloudflare URL returns `200` and contains the expected Carver markers.
- No Google AI Studio, Gemini, placeholder image, or unused template manifest remains.

## Out of Scope For Now

- Multiple worlds or a large level pack.
- Accounts, saves, leaderboards, or monetization.
- AI-generated levels.
- Server-side APIs.
- Full visual redesign before the core playability problem is solved.

## Next Iteration Questions

1. Is the fun in solving hand-authored levels, or in experimenting with the movement toy?
2. Should the first screen be pure game, or should it include a short one-line mechanic prompt?
3. Is the cyber terminal framing helping the mechanic, or hiding it?
4. Should Carver become more character-driven, or stay abstract/minimal?
5. What is the smallest three-level tutorial that proves the mechanic has legs?
