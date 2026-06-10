import { GameState } from "./engine";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private tileSize = 32;
  private dpr = 1;
  private particles: Particle[] = [];
  private sparks: Spark[] = [];
  private shakeAmount = 0;
  private shakeDecay = 0.85;
  private lastPlayerPos: { x: number; y: number } | null = null;
  private slideTrail: Array<{ x: number; y: number; alpha: number }> = [];
  private victoryTime = 0;
  private deathFlash = 0;
  private ox = 0;
  private oy = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is unavailable");

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

  public emitDirtParticles(px: number, py: number, color: string, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 3;
      this.particles.push({
        x: px + this.tileSize / 2,
        y: py + this.tileSize / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  public emitSparks(x: number, y: number, color: string, count = 5) {
    for (let i = 0; i < count; i++) {
      this.sparks.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: 12 + Math.random() * 16,
        size: 1 + Math.random() * 1.5,
      });
    }
  }

  /** Emit sparks at grid coordinates (auto-converts to screen space) */
  public emitGridSparks(col: number, row: number, count = 5) {
    const cx = this.ox + col * this.tileSize + this.tileSize / 2;
    const cy = this.oy + row * this.tileSize + this.tileSize / 2;
    this.emitSparks(cx, cy, "#7aa2f7", count);
  }

  public triggerShake(intensity = 6) {
    this.shakeAmount = Math.max(this.shakeAmount, intensity);
  }

  public triggerDeathFlash() {
    this.deathFlash = 1.0;
  }

  public triggerVictory() {
    this.victoryTime = 120;
  }

  public draw(state: GameState, t: number) {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Shake offset
    let sx = 0;
    let sy = 0;
    if (this.shakeAmount > 0.5) {
      sx = (Math.random() - 0.5) * this.shakeAmount * 2;
      sy = (Math.random() - 0.5) * this.shakeAmount * 2;
      this.shakeAmount *= this.shakeDecay;
    }

    const ox = Math.floor((this.width - state.cols * this.tileSize) / 2) + sx;
    const oy = Math.floor((this.height - state.rows * this.tileSize) / 2) + sy;

    this.ox = ox;
    this.oy = oy;

    // --- Draw grid ---
    for (let y = 0; y < state.rows; y++) {
      for (let x = 0; x < state.cols; x++) {
        const tile = state.grid[y][x];
        const px = ox + x * this.tileSize;
        const py = oy + y * this.tileSize;

        if (tile === "WALL") {
          this.ctx.fillStyle = "#24283b";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = "#414868";
          this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else if (tile === "DIRT") {
          this.ctx.fillStyle = "#1a1b26";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = "#9ece6a";
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
        } else if (tile === "ICE") {
          this.ctx.fillStyle = "#16161e";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          // Ice shimmer
          const shimmer = Math.sin(t * 0.03 + x * 1.5 + y * 0.7) * 0.05 + 0.17;
          this.ctx.fillStyle = `rgba(122, 162, 247, ${shimmer})`;
          this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        } else if (tile === "GOAL") {
          // Pulsing goal
          const pulse = Math.sin(t * 0.02) * 0.15 + 0.85;
          this.ctx.fillStyle = `rgba(187, 154, 247, ${pulse})`;
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

          // Animated center marker
          const size = 8 + Math.sin(t * 0.025) * 6;
          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillRect(
            px + this.tileSize / 2 - size / 2,
            py + this.tileSize / 2 - size / 2,
            size,
            size,
          );

          // Goal glow
          this.ctx.shadowColor = "#bb9af7";
          this.ctx.shadowBlur = 10 + Math.sin(t * 0.03) * 5;
          this.ctx.strokeStyle = "rgba(187, 154, 247, 0.5)";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);
          this.ctx.shadowBlur = 0;
        }
      }
    }

    // --- Slide trail ---
    const ppx = ox + state.player.x * this.tileSize + this.tileSize / 2;
    const ppy = oy + state.player.y * this.tileSize + this.tileSize / 2;

    if (state.sliding) {
      this.slideTrail.push({ x: ppx, y: ppy, alpha: 0.6 });
    } else {
      // Fade trail quickly when not sliding
      if (this.slideTrail.length > 0) {
        this.slideTrail = [];
      }
    }

    // Limit trail length
    if (this.slideTrail.length > 30) {
      this.slideTrail = this.slideTrail.slice(-30);
    }

    // Fade trail
    for (let i = 0; i < this.slideTrail.length; i++) {
      this.slideTrail[i].alpha *= 0.92;
    }

    // Draw trail
    for (let i = 1; i < this.slideTrail.length; i++) {
      const prev = this.slideTrail[i - 1];
      const curr = this.slideTrail[i];
      if (prev.alpha < 0.02) continue;
      this.ctx.strokeStyle = `rgba(122, 162, 247, ${prev.alpha})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(prev.x, prev.y);
      this.ctx.lineTo(curr.x, curr.y);
      this.ctx.stroke();
    }

    // --- Draw player ---
    this.ctx.shadowColor = state.dead ? "#f7768e" : state.won ? "#9ece6a" : "#7aa2f7";
    this.ctx.shadowBlur = state.sliding ? 16 : 8;
    this.ctx.fillStyle = state.dead ? "#f7768e" : state.won ? "#9ece6a" : "#c0caf5";
    this.ctx.beginPath();
    this.ctx.arc(ppx, ppy, this.tileSize * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Player inner glow
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.beginPath();
    this.ctx.arc(ppx, ppy, this.tileSize * 0.15, 0, Math.PI * 2);
    this.ctx.fill();

    // --- Draw particles ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      this.ctx.fillStyle = `${p.color}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`;
      this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    // --- Draw sparks ---
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life--;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      const alpha = s.life / 20;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }

    // --- Death flash ---
    if (this.deathFlash > 0) {
      this.ctx.fillStyle = `rgba(247, 118, 142, ${this.deathFlash * 0.3})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.deathFlash -= 0.03;
      if (this.deathFlash < 0) this.deathFlash = 0;
    }

    // --- Victory overlay ---
    if (this.victoryTime > 0) {
      // Radial pulse
      const vAlpha = Math.min(1, this.victoryTime / 60) * 0.2;
      this.ctx.fillStyle = `rgba(158, 206, 106, ${vAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Victory ring
      const ringPulse = Math.sin(t * 0.05) * 8;
      this.ctx.strokeStyle = "rgba(158, 206, 106, 0.6)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(ppx, ppy, this.tileSize * 0.6 + ringPulse, 0, Math.PI * 2);
      this.ctx.stroke();

      this.victoryTime--;
    }

    this.lastPlayerPos = { x: state.player.x, y: state.player.y };
  }
}
