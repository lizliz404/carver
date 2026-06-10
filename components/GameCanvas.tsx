"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine, Direction, MoveResult } from '../lib/game/engine';
import { STARTING_LEVEL, createGameEngine } from '../lib/game/levels';
import { Renderer } from '../lib/game/renderer';

const DIRECTIONS: Array<{ label: string; dir: Direction; className: string }> = [
  { label: '↑', dir: 'UP', className: 'col-start-2 row-start-1' },
  { label: '←', dir: 'LEFT', className: 'col-start-1 row-start-2' },
  { label: '↓', dir: 'DOWN', className: 'col-start-2 row-start-2' },
  { label: '→', dir: 'RIGHT', className: 'col-start-3 row-start-2' },
];

const directionFromSwipe = (dx: number, dy: number): Direction | null => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'RIGHT' : 'LEFT';
  return dy > 0 ? 'DOWN' : 'UP';
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const inputFeedbackTimerRef = useRef<number | null>(null);
  const [status, setStatus] = useState('IDLE');
  const [lastInput, setLastInput] = useState<Direction | 'RESET' | 'BLOCKED' | null>(null);

  const flashInput = useCallback((input: Direction | 'RESET' | 'BLOCKED') => {
    if (inputFeedbackTimerRef.current) window.clearTimeout(inputFeedbackTimerRef.current);
    setLastInput(input);
    inputFeedbackTimerRef.current = window.setTimeout(() => setLastInput(null), 180);
  }, []);

  const resetGame = useCallback(() => {
    engineRef.current = createGameEngine();
    setStatus('READY');
    flashInput('RESET');
  }, [flashInput]);

  const move = useCallback((dir: Direction) => {
    const result: MoveResult | undefined = engineRef.current?.input(dir);
    flashInput(result === 'MOVED' ? dir : 'BLOCKED');
  }, [flashInput]);

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
        rendererRef.current.resize(width, height, engineRef.current.state.cols, engineRef.current.state.rows, dpr);
      }
    };

    window.addEventListener('resize', resize);

    engineRef.current = new GameEngine(STARTING_LEVEL);
    rendererRef.current = new Renderer(canvas);
    resize();

    let af: number;
    let lastTime = 0;

    const tick = (t: number) => {
      if (!engineRef.current || !rendererRef.current) return;

      if (t - lastTime > 100) {
        engineRef.current.tick();
        lastTime = t;

        if (engineRef.current.state.won) setStatus('YOU WIN');
        else if (engineRef.current.state.dead) setStatus('DEAD');
        else if (engineRef.current.state.sliding) setStatus('SLIDING');
        else setStatus('READY');
      }

      rendererRef.current.draw(engineRef.current.state, t);
      af = requestAnimationFrame(tick);
    };
    af = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(af);
      if (inputFeedbackTimerRef.current) window.clearTimeout(inputFeedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      let dir: Direction | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w') dir = 'UP';
      if (e.key === 'ArrowDown' || e.key === 's') dir = 'DOWN';
      if (e.key === 'ArrowLeft' || e.key === 'a') dir = 'LEFT';
      if (e.key === 'ArrowRight' || e.key === 'd') dir = 'RIGHT';

      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, resetGame]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:block">
      <div className="relative min-h-0 flex-1 sm:h-full">
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none"
          onPointerDown={(event) => {
            touchStartRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = touchStartRef.current;
            touchStartRef.current = null;
            if (!start) return;

            const dir = directionFromSwipe(event.clientX - start.x, event.clientY - start.y);
            if (dir) move(dir);
          }}
          aria-label="Carver game board. Swipe or use the on-screen direction buttons to move."
        />
        <div className="pointer-events-none absolute right-3 top-3 rounded border border-[#24283b] bg-[#1a1b26]/95 px-2 py-1 font-mono text-xs font-bold text-[#c0caf5]">
          <span>{status}</span>
          {lastInput ? <span className="ml-2 text-[#7aa2f7]">{'//'} {lastInput}</span> : null}
        </div>
        {lastInput ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className={`rounded-full border bg-[#05070a]/75 px-5 py-2 text-xs font-black uppercase tracking-[0.35em] text-[#c0caf5] shadow-[0_0_28px_rgba(122,162,247,0.35)] animate-pulse ${lastInput === 'BLOCKED' ? 'border-[#f7768e]/70' : 'border-[#7aa2f7]/70'}`}>
              {lastInput === 'RESET' ? 'Reset' : lastInput === 'BLOCKED' ? 'Blocked' : `Move ${lastInput}`}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-end justify-between gap-3 sm:hidden">
        <div className="rounded-xl border border-[#414868] bg-[#05070a] p-2 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div className="mb-1 text-center text-[9px] font-bold uppercase tracking-widest text-[#7aa2f7]">Tap / Swipe</div>
          <div className="grid touch-none grid-cols-3 grid-rows-2 gap-2" aria-label="Touch movement controls">
            {DIRECTIONS.map(({ label, dir, className }) => (
              <button
                key={dir}
                type="button"
                aria-label={`Move ${dir.toLowerCase()}`}
                className={`${className} h-14 w-14 rounded-lg border bg-[#1a1b26] text-2xl font-black shadow transition duration-150 active:scale-95 active:bg-[#7aa2f7] active:text-[#05070a] ${
                  lastInput === dir
                    ? 'border-[#7aa2f7] text-[#05070a] bg-[#7aa2f7] ring-2 ring-[#7aa2f7]/40'
                    : 'border-[#7aa2f7]/60 text-[#c0caf5]'
                }`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  move(dir);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="h-14 rounded-lg border border-[#f7768e]/70 bg-[#1a1b26] px-4 text-xs font-black uppercase tracking-widest text-[#f7768e] shadow active:scale-95 active:bg-[#f7768e] active:text-[#05070a]"
          onPointerDown={(event) => {
            event.preventDefault();
            resetGame();
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}
