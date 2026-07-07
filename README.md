# Carver

Carver is a browser-first puzzle game about irreversible damage becoming infrastructure.

You move across a small board where dirt gives you traction, ice makes you slide, reused ice collapses into void, and void scars can become deliberate braces. The core question is not just “how do I preserve enough resources?” but “how can the damage I already caused become the structure that lets me move next?”

## Play

- Live game: https://carver.lizliz.xyz
- Also at: https://carver.pages.dev
- Platforms: desktop browser and mobile browser
- Controls: `WASD`, arrow keys, swipe, or on-screen touch controls
- Undo: `U` or `Z`
- Restart: `R`

## Current Prototype

- **Handmade levels:** six compact levels with a gentler first-time ramp and a real next-level flow.
- **Irreversible terrain:** leaving `Dirt` turns it into `Ice`; sliding over old `Ice` collapses it into `Void`.
- **Void braces:** sliding into a `Void` scar stops you before it and restores footing under you.
- **Low-friction recovery:** `U` / `Z` undoes the last stable move, reducing restart-only frustration.
- **Contextual help UI:** the question-mark icon reveals rules beside the button on hover, focus, or tap, and closes from outside clicks.
- **Static deployment:** built with Next.js static export for Cloudflare Pages.

## Design Thesis

Carver is not fundamentally about ice. It is about irreversible decisions.

The current prototype tests one specific thesis:

> Irreversible damage becomes interesting when it can become infrastructure.

This keeps the game away from pure resource accounting. The player should eventually stop thinking only “how many safe tiles are left?” and start thinking “which scar can I deliberately create or reuse?”

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Node.js built-in test runner

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run the full local check:

```bash
npm run check
```

Create a production static export:

```bash
npm run build
```

Clean generated build output:

```bash
npm run clean
```

## Project Structure

```text
app/              Next.js routes, metadata, robots, sitemap
components/       Page shell and canvas UI
lib/game/         Engine, levels, renderer, audio, shared types
public/           Icons, Open Graph image, public assets
tests/            Engine behavior tests
PRD.md            Product/design direction
```

## Level Legend

```text
#  Wall
@  Player start
$  Goal
.  Dirt
x  Void scar
space  Ice
```

## Verification

Before shipping, run:

```bash
npm run check && npm run build
```
