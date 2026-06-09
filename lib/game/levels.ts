import { Tile } from './types';

export const LEVELS = [
  // Level 1: The Slide - Teaches Ice vs Wall vs Dirt
  [
    "#######",
    "#@.D.G#",
    "#######"
  ],
  // Level 2: The Carve - Teaches stepping OFF Dirt creates Ice
  [
    "########",
    "##G...##",
    "###.#.##",
    "#.....##",
    "#.###.##",
    "#@DDD.##",
    "########"
  ],
  // Level 3: The Bumper - Teaches keeping Dirt untouched to halt a slide
  [
    "#######",
    "#.....#",
    "#.###.#",
    "#.G.D.#",
    "#.###.#",
    "#@..D.#",
    "#######"
  ]
];

export function parseLevel(levelMap: string[]): { board: Tile[][], player: {x: number, y: number} } {
  let player = { x: 1, y: 1 };
  const board = levelMap.map((row, y) => {
    return row.split('').map((char, x) => {
      switch (char) {
        case '#': return Tile.WALL;
        case '.': return Tile.ICE;
        case 'D': return Tile.DIRT;
        case 'G': return Tile.GOAL;
        case '@':
          player = { x, y };
          return Tile.DIRT; // Player starts on dirt
        case ' ': return Tile.VOID;
        default: return Tile.VOID;
      }
    });
  });
  return { board, player };
}
