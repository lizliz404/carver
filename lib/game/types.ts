export enum Tile {
  VOID,
  WALL,
  ICE,
  DIRT,
  GOAL
}

export type Point = { x: number; y: number };

export interface GameState {
  board: Tile[][];
  player: Point;
  px: number; // For rendering smooth interpolation
  py: number;
  state: 'IDLE' | 'MOVING' | 'SLIDING' | 'WON' | 'DEAD';
  slideDir: Point | null;
  target: Point;
  levelIndex: number;
}
