import { GameEngine } from './engine.ts';

export const LEVELS: string[][] = [
  [
    "#########",
    "#@  x   #",
    "#  .  x #",
    "#    $  #",
    "#########",
  ],
  [
    "#########",
    "#@ x  $ #",
    "# x   x #",
    "#  .    #",
    "#########",
  ],
  [
    "#########",
    "#@x    x#",
    "#  . .  #",
    "#x    x$#",
    "#########",
  ],
];

export const STARTING_LEVEL = LEVELS[0];

export const createGameEngine = (level: string[] = STARTING_LEVEL) => new GameEngine(level);
