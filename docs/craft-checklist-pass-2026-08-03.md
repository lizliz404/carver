# Craft checklist pass — 2026-08-03

Product: **Carver** (`carver.lizliz.xyz`)  
Type: **browser puzzle game** (Next.js shell + canvas)  
Starter: 附 A **light** on landing chrome; in-game feedback — **not** marketing chapter dots

## Already present

- OG + Twitter + VideoGame JSON-LD (`app/layout.tsx`, `app/page.tsx`, `/og-image.png`)
- Undo / restart paths with on-canvas death & win overlays
- Input flash feedback (≤180ms) + blocked SFX / shake
- Help popover with rules + tip; Escape / outside click close
- Touch D-pad with press states; swipe + keyboard controls

## Implemented this pass

| Item | Files |
|---|---|
| 附 A: top progress bar | `styles/premium-one-pager.css`, `lib/premium-one-pager.ts`, wired in `components/CarverPage.tsx` |
| 附 A: SVG noise (dark `overlay` blend) | same; tokens ice `#7aa2f7` → violet `#bb9af7` |
| 附 A: `::selection` + thin scrollbar + smooth scroll + prm kill-switch | same |
| Skip chapter dots | `initPremiumOnePager({ enableChapters: false })` — game shell, not narrative LP |
| Skip pop-reveal | `enableReveal: false` — protect game/LCP first paint |
| #11 / #12 death CTA consequence copy | `GameCanvas.tsx` — “Undo last move” / “Restart this board” |
| #3 boot honesty | initial status `LOADING BOARD` → `READY` on first tick |
| #22 focus + prm press | `:focus-visible` ring; `motion-safe:active:scale-95` on touch chrome |
| 404 next-step CTA | `app/not-found.tsx` — copy + “Back to Carver” |

## Explicitly skipped

- **Chapter dots** — brief + product type: do not put marketing rail on game canvas route; &lt;3 narrative sections
- **pop-reveal** — single-viewport shell; no below-fold marketing sections
- Scroll progress usefulness — `main` is `overflow-hidden`; window scroll ≈ 0; bar mounts for pack consistency (dormant OK, same as holopinch)
- Dynamic OG / Cmd+K / autosave / status page — wrong stage for a free puzzle toy

## Residual P2/P3 (do not implement now)

- Bind progress to the inner `overflow-y-auto` section if mobile chrome grows taller than viewport
- Optional zh strings for death overlay button labels (shell i18n already covers help/tagline)
- Stronger reduced-motion path for canvas shake/particles (engine/renderer) — higher risk than chrome
- Labor-illusion stage copy only matters for boot; mid-level load is sync
