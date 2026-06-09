export type Tile = 'DIRT' | 'ICE' | 'WALL' | 'GOAL';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  grid: Tile[][];
  player: Position;
  sliding: Direction | null;
  won: boolean;
  dead: boolean;
  cols: number;
  rows: number;
}

export class GameEngine {
  public state: GameState;

  constructor(initialGrid: string[]) {
    this.state = this.parseGrid(initialGrid);
  }

  private parseGrid(raw: string[]): GameState {
    const grid: Tile[][] = [];
    let player: Position = { x: 0, y: 0 };
    const rows = raw.length;
    const cols = raw[0].length;

    for (let y = 0; y < rows; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < cols; x++) {
        const char = raw[y][x];
        if (char === '#') row.push('WALL');
        else if (char === '.') row.push('DIRT');
        else if (char === ' ') row.push('ICE');
        else if (char === '$') row.push('GOAL');
        else if (char === '@') {
          row.push('DIRT'); // Player spawns on dirt
          player = { x, y };
        } else {
          row.push('WALL');
        }
      }
      grid.push(row);
    }

    return { grid, player, sliding: null, won: false, dead: false, cols, rows };
  }

  public input(dir: Direction) {
    if (this.state.won || this.state.dead || this.state.sliding) return;

    const currentTile = this.state.grid[this.state.player.y][this.state.player.x];
    
    // Can only initiate movement from DIRT
    if (currentTile !== 'DIRT') return;

    // Moving means we leave DIRT, returning it to ICE
    this.state.grid[this.state.player.y][this.state.player.x] = 'ICE';
    
    this.state.sliding = dir;
    this.step();
  }

  public tick() {
    if (this.state.sliding && !this.state.won && !this.state.dead) {
      this.step();
    }
  }

  private step() {
    if (!this.state.sliding) return;

    let dx = 0, dy = 0;
    if (this.state.sliding === 'UP') dy = -1;
    if (this.state.sliding === 'DOWN') dy = 1;
    if (this.state.sliding === 'LEFT') dx = -1;
    if (this.state.sliding === 'RIGHT') dx = 1;

    const nx = this.state.player.x + dx;
    const ny = this.state.player.y + dy;

    // Out of bounds
    if (ny < 0 || ny >= this.state.rows || nx < 0 || nx >= this.state.cols) {
      this.state.dead = true;
      this.state.sliding = null;
      return;
    }

    const nextTile = this.state.grid[ny][nx];

    if (nextTile === 'WALL') {
      // Hit a wall: stop sliding
      this.state.sliding = null;
      // We are on whatever tile we were on previously. BUT wait: 
      // If we bumped into wall, we just stay at the previous tile and stop sliding.
      // Oh wait, did we convert the tile we started sliding on? YES. 
      // So if we hit a wall, we just stop on ICE. We can't move anymore unless we are on DIRT!
      return;
    }

    // Move player
    this.state.player = { x: nx, y: ny };

    if (nextTile === 'GOAL') {
      this.state.won = true;
      this.state.sliding = null;
      return;
    }

    if (nextTile === 'DIRT') {
      // We found dirt! We stop sliding automatically.
      // We get our footing back.
      this.state.sliding = null;
      return;
    }

    // Otherwise it's ICE, we keep sliding next tick
  }
}
