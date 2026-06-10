import { GameEngine } from "./engine.ts";

export const LEVELS: string[][] = [
  // Level 1 — tutorial: just slide to win
  ["#######", "#@   $#", "#######"],
  // Level 2 — tutorial: dirt stops you
  ["#######", "#@.$ #", "#######"],
  // Level 3 — tutorial: stop then slide
  ["#######", "#@. $ #", "#######"],
  // Level 4 — ice collapses behind you
  ["########", "#@  . $#", "########"],
  // Level 5 — void blocks adjacent
  ["#########", "#@  x  $#", "#  .   $#", "#########"],
  // Level 6 — void braces a slide
  ["#########", "#@  x   #", "#  .  x #", "#    $  #", "#########"],
  // Level 7 — combine mechanics
  ["#########", "#@     x#", "# x . . #", "#   .$ x#", "#########"],
  // Level 8 — challenge
  ["#########", "#@ x  x #", "# ..  x #", "#  . $  #", "#########"],
];

export const STARTING_LEVEL = LEVELS[0];

export const createGameEngine = (level: string[] = STARTING_LEVEL) =>
  new GameEngine(level);
