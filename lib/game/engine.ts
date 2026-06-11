export type Tile = "DIRT" | "ICE" | "VOID" | "WALL" | "GOAL";
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type MoveResult = "MOVED" | "BLOCKED" | "INACTIVE";

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
  private history: GameState[] = [];
  private static readonly DIRECTIONS: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

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
        if (char === "#") row.push("WALL");
        else if (char === ".") row.push("DIRT");
        else if (char === " ") row.push("ICE");
        else if (char === "x") row.push("VOID");
        else if (char === "$") row.push("GOAL");
        else if (char === "@") {
          row.push("DIRT");
          player = { x, y };
        } else {
          row.push("WALL");
        }
      }
      grid.push(row);
    }

    return { grid, player, sliding: null, won: false, dead: false, cols, rows };
  }

  public input(dir: Direction): MoveResult {
    if (this.state.won || this.state.dead || this.state.sliding)
      return "INACTIVE";

    if (!this.canMove(dir)) return "BLOCKED";

    this.history.push(this.cloneState(this.state));
    this.state.grid[this.state.player.y][this.state.player.x] = "ICE";

    this.state.sliding = dir;
    this.step({ preserveCurrentTile: true });
    return "MOVED";
  }

  public tick() {
    if (this.state.sliding && !this.state.won && !this.state.dead) {
      this.step();
    }
  }

  public undo(): boolean {
    if (this.state.sliding) return false;

    const previousState = this.history.pop();
    if (!previousState) return false;

    this.state = previousState;
    return true;
  }

  public getAvailableDirections(): Direction[] {
    return GameEngine.DIRECTIONS.filter((dir) => this.canMove(dir));
  }

  private canMove(dir: Direction): boolean {
    if (this.state.won || this.state.dead || this.state.sliding) return false;

    const currentTile =
      this.state.grid[this.state.player.y][this.state.player.x];
    if (currentTile !== "DIRT") return false;

    const nextPosition = this.getNextPosition(dir);
    if (!this.isInBounds(nextPosition.x, nextPosition.y)) return false;

    return !this.isBlockingTile(this.state.grid[nextPosition.y][nextPosition.x]);
  }

  private step(options: { preserveCurrentTile?: boolean } = {}) {
    if (!this.state.sliding) return;

    const currentPosition = { ...this.state.player };
    const { x: nx, y: ny } = this.getNextPosition(this.state.sliding);

    if (ny < 0 || ny >= this.state.rows || nx < 0 || nx >= this.state.cols) {
      this.consumeCurrentIce(currentPosition, options.preserveCurrentTile);
      this.state.dead = true;
      this.state.sliding = null;
      return;
    }

    const nextTile = this.state.grid[ny][nx];

    if (nextTile === "WALL" || nextTile === "VOID") {
      if (nextTile === "VOID") {
        this.state.grid[this.state.player.y][this.state.player.x] = "DIRT";
      } else {
        this.consumeCurrentIce(currentPosition, options.preserveCurrentTile);
      }
      this.state.sliding = null;
      return;
    }

    this.consumeCurrentIce(currentPosition, options.preserveCurrentTile);
    this.state.player = { x: nx, y: ny };

    if (nextTile === "GOAL") {
      this.state.won = true;
      this.state.sliding = null;
      return;
    }

    if (nextTile === "DIRT") {
      this.state.sliding = null;
      return;
    }
  }

  private consumeCurrentIce(position: Position, preserveCurrentTile = false) {
    if (preserveCurrentTile) return;
    if (this.state.grid[position.y][position.x] === "ICE") {
      this.state.grid[position.y][position.x] = "VOID";
    }
  }

  private cloneState(state: GameState): GameState {
    return {
      ...state,
      player: { ...state.player },
      grid: state.grid.map((row) => [...row]),
    };
  }

  private getNextPosition(dir: Direction): Position {
    let dx = 0,
      dy = 0;
    if (dir === "UP") dy = -1;
    if (dir === "DOWN") dy = 1;
    if (dir === "LEFT") dx = -1;
    if (dir === "RIGHT") dx = 1;

    return { x: this.state.player.x + dx, y: this.state.player.y + dy };
  }

  private isInBounds(x: number, y: number): boolean {
    return y >= 0 && y < this.state.rows && x >= 0 && x < this.state.cols;
  }

  private isBlockingTile(tile: Tile): boolean {
    return tile === "WALL" || tile === "VOID";
  }
}
