import { GameState } from "./engine";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private tileSize = 32;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is unavailable');

    this.ctx = ctx;
    this.width = canvas.clientWidth || canvas.width;
    this.height = canvas.clientHeight || canvas.height;
    this.ctx.imageSmoothingEnabled = false;
  }

  public resize(w: number, h: number, cols: number, rows: number, dpr = 1) {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    const maxTileW = w / cols;
    const maxTileH = h / rows;
    this.tileSize = Math.floor(Math.min(maxTileW, maxTileH));
  }

  public draw(state: GameState, t: number) {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const ox = Math.floor((this.width - state.cols * this.tileSize) / 2);
    const oy = Math.floor((this.height - state.rows * this.tileSize) / 2);

    for (let y = 0; y < state.rows; y++) {
      for (let x = 0; x < state.cols; x++) {
        const tile = state.grid[y][x];
        const px = ox + x * this.tileSize;
        const py = oy + y * this.tileSize;

        if (tile === 'WALL') {
          this.ctx.fillStyle = '#24283b';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = '#414868';
          this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === 'DIRT') {
          this.ctx.fillStyle = '#1a1b26';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = '#9ece6a';
          this.ctx.strokeRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
        } else if (tile === 'ICE') {
          this.ctx.fillStyle = '#16161e';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.fillStyle = '#7aa2f7';
          this.ctx.globalAlpha = 0.2;
          this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
          this.ctx.globalAlpha = 1.0;
        } else if (tile === 'GOAL') {
          this.ctx.fillStyle = '#bb9af7';
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.fillStyle = '#ffffff';
          const size = 10 + Math.sin(t * 0.01) * 4;
          this.ctx.fillRect(px + this.tileSize / 2 - size / 2, py + this.tileSize / 2 - size / 2, size, size);
        }
      }
    }

    const px = ox + state.player.x * this.tileSize;
    const py = oy + state.player.y * this.tileSize;
    
    this.ctx.fillStyle = state.dead ? '#f7768e' : (state.won ? '#9ece6a' : '#c0caf5');
    this.ctx.beginPath();
    this.ctx.arc(px + this.tileSize / 2, py + this.tileSize / 2, this.tileSize * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
    
    if (state.sliding) {
      this.ctx.strokeStyle = '#c0caf5';
      this.ctx.globalAlpha = 0.5;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(px + this.tileSize / 2, py + this.tileSize / 2);
      let dx = 0;
      let dy = 0;
      if (state.sliding === 'UP') dy = this.tileSize / 2;
      if (state.sliding === 'DOWN') dy = -this.tileSize / 2;
      if (state.sliding === 'LEFT') dx = this.tileSize / 2;
      if (state.sliding === 'RIGHT') dx = -this.tileSize / 2;
      this.ctx.lineTo(px + this.tileSize / 2 + dx, py + this.tileSize / 2 + dy);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1.0;
    }
  }
}
