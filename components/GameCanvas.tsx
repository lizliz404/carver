"use client";

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, Direction } from '../lib/game/engine';
import { Renderer } from '../lib/game/renderer';

const LEVEL = [
  "######",
  "#@...#",
  "#.##.#",
  "#    #",
  "#.  .#",
  "#.##.#",
  "#...$#",
  "######"
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [status, setStatus] = useState('IDLE');

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        if (rendererRef.current && engineRef.current) {
          rendererRef.current.resize(canvas.width, canvas.height, engineRef.current.state.cols, engineRef.current.state.rows);
        }
      }
    };

    window.addEventListener('resize', resize);
    
    engineRef.current = new GameEngine(LEVEL);
    rendererRef.current = new Renderer(canvas);
    resize();

    let af: number;
    let lastTime = 0;
    
    // Core loop
    const tick = (t: number) => {
      if (!engineRef.current || !rendererRef.current) return;
      
      // Step physics at 10Hz to see sliding fast
      if (t - lastTime > 100) {
        engineRef.current.tick();
        lastTime = t;
        
        // Updates UI State
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
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === 'r' || e.key === 'R') {
        engineRef.current = new GameEngine(LEVEL);
        return;
      }

      let dir: Direction | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w') dir = 'UP';
      if (e.key === 'ArrowDown' || e.key === 's') dir = 'DOWN';
      if (e.key === 'ArrowLeft' || e.key === 'a') dir = 'LEFT';
      if (e.key === 'ArrowRight' || e.key === 'd') dir = 'RIGHT';

      if (dir) {
        e.preventDefault();
        engineRef.current.input(dir);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
      <div className="absolute top-4 right-4 pointer-events-none text-xs font-mono font-bold text-[#c0caf5] bg-[#1a1b26] px-2 py-1 border border-[#24283b] rounded">
        {status}
      </div>
    </>
  );
}
