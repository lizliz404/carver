"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine, Direction, MoveResult } from "../lib/game/engine";
import { LEVELS, STARTING_LEVEL, createGameEngine } from "../lib/game/levels";
import { Renderer } from "../lib/game/renderer";
import { SFX, unlockAudio } from "../lib/game/audio";

const DIRECTIONS: Array<{ label: string; dir: Direction; className: string }> =
  [
    { label: "↑", dir: "UP", className: "col-start-2 row-start-1" },
    { label: "←", dir: "LEFT", className: "col-start-1 row-start-2" },
    { label: "↓", dir: "DOWN", className: "col-start-2 row-start-2" },
    { label: "→", dir: "RIGHT", className: "col-start-3 row-start-2" },
  ];

// Which tutorial levels show hints, and which direction/position
const TUTORIAL_HINTS: Record<number, Array<{ col: number; row: number; dir: Direction }>> = {
  0: [{ col: 1, row: 1, dir: "RIGHT" }],                    // L1: press RIGHT
  1: [{ col: 1, row: 1, dir: "RIGHT" }],                    // L2: press RIGHT
  2: [{ col: 2, row: 1, dir: "RIGHT" }],                    // L3: press RIGHT from dirt
};

const directionFromSwipe = (dx: number, dy: number): Direction | null => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "RIGHT" : "LEFT";
  return dy > 0 ? "DOWN" : "UP";
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const inputFeedbackTimerRef = useRef<number | null>(null);
  const slideTimerRef = useRef<number>(0);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [status, setStatus] = useState("IDLE");
  const [lastInput, setLastInput] = useState<
    Direction | "RESET" | "BLOCKED" | "NEXT" | "UNDO" | null
  >(null);
  const [showHints, setShowHints] = useState(true);
  const moveCountRef = useRef(0);

  const loadLevel = useCallback((levelIndex: number) => {
    const nextLevel = LEVELS[levelIndex] ?? LEVELS[0];
    engineRef.current = createGameEngine(nextLevel);
    setCurrentLevelIndex(levelIndex);
    setStatus("READY");
    moveCountRef.current = 0;
    setShowHints(levelIndex in TUTORIAL_HINTS);
  }, []);

  const flashInput = useCallback(
    (input: Direction | "RESET" | "BLOCKED" | "NEXT" | "UNDO") => {
      if (inputFeedbackTimerRef.current)
        window.clearTimeout(inputFeedbackTimerRef.current);
      setLastInput(input);
      inputFeedbackTimerRef.current = window.setTimeout(
        () => setLastInput(null),
        180,
      );
    },
    [],
  );

  const resetGame = useCallback(() => {
    loadLevel(currentLevelIndex);
    flashInput("RESET");
    SFX.restart();
  }, [currentLevelIndex, flashInput, loadLevel]);

  const nextLevel = useCallback(() => {
    const nextIndex = Math.min(currentLevelIndex + 1, LEVELS.length - 1);
    loadLevel(nextIndex);
    flashInput("NEXT");
    SFX.restart();
  }, [currentLevelIndex, flashInput, loadLevel]);

  const undoMove = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.undo()) {
      setStatus("READY");
      flashInput("UNDO");
      SFX.restart();
    } else {
      flashInput("BLOCKED");
      SFX.blocked();
    }
  }, [flashInput]);

  const move = useCallback(
    (dir: Direction) => {
      const engine = engineRef.current;
      if (!engine) return;

      const result: MoveResult | undefined = engine.input(dir);

      if (result === "MOVED") {
        moveCountRef.current += 1;
        if (showHints && moveCountRef.current >= 1) {
          setShowHints(false);
        }
        flashInput(dir);
        SFX.move();
      } else if (result === "BLOCKED") {
        flashInput("BLOCKED");
        SFX.blocked();
      }
    },
    [flashInput, showHints],
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      if (rendererRef.current && engineRef.current) {
        rendererRef.current.resize(
          width,
          height,
          engineRef.current.state.cols,
          engineRef.current.state.rows,
          dpr,
        );
      }
    };

    window.addEventListener("resize", resize);

    engineRef.current = new GameEngine(
      LEVELS[currentLevelIndex] ?? STARTING_LEVEL,
    );
    rendererRef.current = new Renderer(canvas);
    resize();
    moveCountRef.current = 0;
    setShowHints(currentLevelIndex in TUTORIAL_HINTS);

    // Track previous state for transition detection
    let prevSliding: Direction | null = null;
    let prevWon = false;
    let prevDead = false;
    let prevPlayerPos = { ...engineRef.current.state.player };

    let af: number;
    let lastTime = 0;

    const tick = (t: number) => {
      const engine = engineRef.current;
      const renderer = rendererRef.current;
      if (!engine || !renderer) return;

      if (t - lastTime > 60) {
        // Detect state transitions for SFX and particles
        const { sliding, won, dead, player } = engine.state;

        if (sliding && !prevSliding) {
          slideTimerRef.current = 0;
        }

        if (sliding) {
          slideTimerRef.current += 60;
          if (slideTimerRef.current % 180 === 0) {
            SFX.slide();
          }
        }

        if (won && !prevWon) {
          SFX.victory();
          renderer.triggerVictory();
        }

        if (dead && !prevDead) {
          SFX.death();
          renderer.triggerDeathFlash();
          renderer.triggerShake(8);
        }

        if (player.x !== prevPlayerPos.x || player.y !== prevPlayerPos.y) {
          renderer.emitGridSparks(player.x, player.y, 6);
        }

        if (!sliding && prevSliding && !won && !dead) {
          renderer.triggerShake(3);
          SFX.blocked();
        }

        engine.tick();

        if (engine.state.won) setStatus("YOU WIN");
        else if (engine.state.dead) setStatus("DEAD");
        else if (engine.state.sliding) setStatus("SLIDING");
        else setStatus("READY");

        prevSliding = sliding;
        prevWon = won;
        prevDead = dead;
        prevPlayerPos = { ...player };
        lastTime = t;
      }

      // Draw tutorial hints
      const hints = showHints ? (TUTORIAL_HINTS[currentLevelIndex] ?? null) : null;

      renderer.draw(engine.state, t, hints);
      af = requestAnimationFrame(tick);
    };
    af = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(af);
      if (inputFeedbackTimerRef.current)
        window.clearTimeout(inputFeedbackTimerRef.current);
    };
  }, [currentLevelIndex, showHints]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === "r" || e.key === "R") {
        resetGame();
        return;
      }

      if (e.key === "u" || e.key === "U" || e.key === "z" || e.key === "Z") {
        undoMove();
        return;
      }

      let dir: Direction | null = null;
      if (e.key === "ArrowUp" || e.key === "w") dir = "UP";
      if (e.key === "ArrowDown" || e.key === "s") dir = "DOWN";
      if (e.key === "ArrowLeft" || e.key === "a") dir = "LEFT";
      if (e.key === "ArrowRight" || e.key === "d") dir = "RIGHT";

      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, resetGame, undoMove]);

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3 sm:block"
      onClick={unlockAudio}
      onKeyDown={unlockAudio}
    >
      <div className="relative min-h-0 flex-1 sm:h-full">
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none"
          onPointerDown={(event) => {
            unlockAudio();
            touchStartRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = touchStartRef.current;
            touchStartRef.current = null;
            if (!start) return;

            const dir = directionFromSwipe(
              event.clientX - start.x,
              event.clientY - start.y,
            );
            if (dir) move(dir);
          }}
          aria-label="Carver game board. Swipe or use the on-screen direction buttons to move."
        />
        <div className="pointer-events-none absolute right-3 top-3 rounded border border-[#24283b] bg-[#1a1b26]/95 px-2 py-1 font-mono text-xs font-bold text-[#c0caf5]">
          <span className="mr-2 text-[#565f89]">
            LEVEL {currentLevelIndex + 1}/{LEVELS.length}
          </span>
          <span>{status}</span>
          {lastInput ? (
            <span className="ml-2 text-[#7aa2f7]">
              {"//"} {lastInput}
            </span>
          ) : null}
        </div>
        {status === "DEAD" ? (
          <div className="absolute inset-x-4 bottom-4 rounded border border-[#f7768e]/60 bg-[#05070a]/92 px-4 py-3 text-center shadow-[0_0_30px_rgba(247,118,142,0.18)]">
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#f7768e]">
              Route collapsed
            </div>
            <p className="mt-1 text-xs font-semibold text-[#c0caf5]">
              Undo one move, or restart this board.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                className="rounded border border-[#7aa2f7]/70 bg-[#7aa2f7]/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#7aa2f7] transition hover:bg-[#7aa2f7] hover:text-[#05070a]"
                onPointerDown={(event) => {
                  event.preventDefault();
                  unlockAudio();
                  undoMove();
                }}
              >
                Undo
              </button>
              <button
                type="button"
                className="rounded border border-[#414868] bg-[#1a1b26] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#c0caf5] transition hover:border-[#f7768e]"
                onPointerDown={(event) => {
                  event.preventDefault();
                  unlockAudio();
                  resetGame();
                }}
              >
                Restart
              </button>
            </div>
          </div>
        ) : null}
        {status === "YOU WIN" ? (
          <div className="absolute inset-x-4 bottom-4 rounded border border-[#9ece6a]/60 bg-[#05070a]/92 px-4 py-3 text-center shadow-[0_0_30px_rgba(158,206,106,0.18)]">
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#9ece6a]">
              {currentLevelIndex === LEVELS.length - 1
                ? "All levels complete"
                : "Level clear"}
            </div>
            <p className="mt-1 text-xs font-semibold text-[#c0caf5]">
              Level {currentLevelIndex + 1}/{LEVELS.length} cleared.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {currentLevelIndex < LEVELS.length - 1 ? (
                <button
                  type="button"
                  className="rounded border border-[#9ece6a]/70 bg-[#9ece6a]/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#9ece6a] transition hover:bg-[#9ece6a] hover:text-[#05070a]"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    unlockAudio();
                    nextLevel();
                  }}
                >
                  Next Level
                </button>
              ) : null}
              <button
                type="button"
                className="rounded border border-[#414868] bg-[#1a1b26] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#c0caf5] transition hover:border-[#7aa2f7]"
                onPointerDown={(event) => {
                  event.preventDefault();
                  unlockAudio();
                  resetGame();
                }}
              >
                Replay
              </button>
            </div>
          </div>
        ) : null}
        {lastInput ? (
          <div className="pointer-events-none absolute left-3 top-12">
            <div
              className={`rounded border bg-[#05070a]/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#c0caf5] shadow-[0_0_18px_rgba(122,162,247,0.22)] ${
                lastInput === "BLOCKED"
                  ? "border-[#f7768e]/70"
                  : "border-[#7aa2f7]/70"
              }`}
            >
              {lastInput === "RESET"
                ? "Reset"
                : lastInput === "UNDO"
                  ? "Undo"
                  : lastInput === "NEXT"
                    ? "Next"
                    : lastInput === "BLOCKED"
                      ? "Blocked"
                      : `Move ${lastInput}`}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-end justify-between gap-3 sm:hidden">
        <div className="rounded-xl border border-[#414868] bg-[#05070a] p-2 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div className="mb-1 text-center text-[9px] font-bold uppercase tracking-widest text-[#7aa2f7]">
            Tap / Swipe
          </div>
          <div
            className="grid touch-none grid-cols-3 grid-rows-2 gap-2"
            aria-label="Touch movement controls"
          >
            {DIRECTIONS.map(({ label, dir, className }) => (
              <button
                key={dir}
                type="button"
                aria-label={`Move ${dir.toLowerCase()}`}
                className={`${className} h-14 w-14 rounded-lg border bg-[#1a1b26] text-2xl font-black shadow transition duration-150 active:scale-95 active:bg-[#7aa2f7] active:text-[#05070a] ${
                  lastInput === dir
                    ? "border-[#7aa2f7] text-[#05070a] bg-[#7aa2f7] ring-2 ring-[#7aa2f7]/40"
                    : "border-[#7aa2f7]/60 text-[#c0caf5]"
                }`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  unlockAudio();
                  move(dir);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="h-12 rounded-lg border border-[#7aa2f7]/70 bg-[#1a1b26] px-4 text-xs font-black uppercase tracking-widest text-[#7aa2f7] shadow active:scale-95 active:bg-[#7aa2f7] active:text-[#05070a]"
            onPointerDown={(event) => {
              event.preventDefault();
              unlockAudio();
              undoMove();
            }}
          >
            Undo
          </button>
          <button
            type="button"
            className="h-12 rounded-lg border border-[#f7768e]/70 bg-[#1a1b26] px-4 text-xs font-black uppercase tracking-widest text-[#f7768e] shadow active:scale-95 active:bg-[#f7768e] active:text-[#05070a]"
            onPointerDown={(event) => {
              event.preventDefault();
              unlockAudio();
              resetGame();
            }}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
