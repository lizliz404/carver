import { GameState, Direction } from "./engine";

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

interface Hint {
  col: number;
  row: number;
  dir: Direction;
}

const DIRECTION_ARROW: Record<Direction, string> = {
  UP: "↑",
  DOWN: "↓",
  LEFT: "←",
  RIGHT: "→",
};

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
  private tileChangeFlashes: Array<{
    x: number;
    y: number;
    life: number;
    from: string;
    to: string;
  }> = [];

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

  public draw(
    state: GameState,
    t: number,
    hints: Hint[] | null = null,
    availableDirections: Direction[] = [],
  ) {
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

    const ox = Math.floor(
      (this.width - state.cols * this.tileSize) / 2,
    ) + sx;
    const oy = Math.floor(
      (this.height - state.rows * this.tileSize) / 2,
    ) + sy;

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
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
          // Wall inner detail
          this.ctx.fillStyle = "#1f2335";
          this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        } else if (tile === "DIRT") {
          this.ctx.fillStyle = "#1a1b26";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = "#9ece6a";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(px + 3, py + 3, this.tileSize - 6, this.tileSize - 6);
          // Dirt grain texture
          const grainCount = 5;
          for (let g = 0; g < grainCount; g++) {
            const gx = px + 5 + ((g * 7 + x * 3 + y * 11) % (this.tileSize - 10));
            const gy = py + 5 + ((g * 13 + y * 7 + x * 5) % (this.tileSize - 10));
            this.ctx.fillStyle = "rgba(158, 206, 106, 0.4)";
            this.ctx.fillRect(gx, gy, 1.5, 1.5);
          }
          // Subtle inner glow
          const dirtPulse = Math.sin(t * 0.015 + x * 0.5 + y * 0.5) * 0.04 + 0.06;
          this.ctx.fillStyle = `rgba(158, 206, 106, ${dirtPulse})`;
          this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
        } else if (tile === "ICE") {
          this.ctx.fillStyle = "#16161e";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          // Ice shimmer
          const shimmer = Math.sin(t * 0.03 + x * 1.5 + y * 0.7) * 0.05 + 0.17;
          this.ctx.fillStyle = `rgba(122, 162, 247, ${shimmer})`;
          this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
          // Ice crystal sparkles
          const sparkleCount = 3;
          for (let s = 0; s < sparkleCount; s++) {
            const sx =
              px + 4 + ((s * 11 + x * 7 + Math.floor(t * 0.01)) % (this.tileSize - 8));
            const sy =
              py + 4 + ((s * 17 + y * 13) % (this.tileSize - 8));
            const sparkleAlpha =
              Math.abs(Math.sin(t * 0.04 + s * 2.1 + x + y)) * 0.35;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
            this.ctx.fillRect(sx, sy, 1, 1);
          }
        } else if (tile === "VOID") {
          this.ctx.fillStyle = "#05070a";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          // Pulsing red border
          const voidPulse = Math.sin(t * 0.025 + x * 0.7) * 0.2 + 0.8;
          this.ctx.strokeStyle = `rgba(247, 118, 142, ${voidPulse})`;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
          // X pattern
          this.ctx.strokeStyle = `rgba(247, 118, 142, ${voidPulse * 0.65})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(px + 8, py + 8);
          this.ctx.lineTo(px + this.tileSize - 8, py + this.tileSize - 8);
          this.ctx.moveTo(px + this.tileSize - 8, py + 8);
          this.ctx.lineTo(px + 8, py + this.tileSize - 8);
          this.ctx.stroke();
          // Inner dark void particles
          for (let v = 0; v < 2; v++) {
            const vx =
              px + 6 + ((v * 19 + x * 13 + Math.floor(t * 0.015)) % (this.tileSize - 12));
            const vy =
              py + 6 + ((v * 23 + y * 17) % (this.tileSize - 12));
            this.ctx.fillStyle = "rgba(247, 118, 142, 0.25)";
            this.ctx.fillRect(vx, vy, 1.5, 1.5);
          }
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
          this.ctx.strokeRect(
            px + 1,
            py + 1,
            this.tileSize - 2,
            this.tileSize - 2,
          );
          this.ctx.shadowBlur = 0;
        }
      }
    }

    // --- Available direction indicators on player's tile ---
    if (
      availableDirections.length > 0 &&
      !state.sliding &&
      !state.won &&
      !state.dead
    ) {
      const px = ox + state.player.x * this.tileSize;
      const py = oy + state.player.y * this.tileSize;
      const cx = px + this.tileSize / 2;
      const cy = py + this.tileSize / 2;
      const pulse = Math.sin(t * 0.05) * 0.12 + 0.18;

      for (const dir of availableDirections) {
        let dx = 0, dy = 0;
        if (dir === "UP") dy = -1;
        if (dir === "DOWN") dy = 1;
        if (dir === "LEFT") dx = -1;
        if (dir === "RIGHT") dx = 1;

        // Draw a subtle highlight on the adjacent tile
        this.ctx.fillStyle = `rgba(122, 162, 247, ${pulse})`;
        this.ctx.fillRect(
          px + dx * this.tileSize + 3,
          py + dy * this.tileSize + 3,
          this.tileSize - 6,
          this.tileSize - 6,
        );

        // Draw a tiny arrow pointing from player center
        const arrowSize = this.tileSize * 0.28;
        const offset = this.tileSize * 0.48;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse + 0.15})`;
        this.ctx.font = `${Math.floor(this.tileSize * 0.45)}px monospace`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          DIRECTION_ARROW[dir],
          cx + dx * offset,
          cy + dy * offset,
        );
      }
    }

    // --- Slide trail ---
    const ppx = ox + state.player.x * this.tileSize + this.tileSize / 2;
    const ppy = oy + state.player.y * this.tileSize + this.tileSize / 2;

    if (state.sliding) {
      this.slideTrail.push({ x: ppx, y: ppy, alpha: 0.7 });
    } else {
      if (this.slideTrail.length > 0) {
        this.slideTrail = [];
      }
    }

    if (this.slideTrail.length > 30) {
      this.slideTrail = this.slideTrail.slice(-30);
    }

    for (let i = 0; i < this.slideTrail.length; i++) {
      this.slideTrail[i].alpha *= 0.9;
    }

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
    this.ctx.shadowColor = state.dead
      ? "#f7768e"
      : state.won
        ? "#9ece6a"
        : state.sliding
          ? "#7aa2f7"
          : "#c0caf5";
    this.ctx.shadowBlur = state.sliding ? 18 : 10;
    this.ctx.fillStyle = state.dead
      ? "#f7768e"
      : state.won
        ? "#9ece6a"
        : "#c0caf5";

    // Player bounce when not sliding
    const bounce = state.sliding
      ? 0
      : Math.sin(t * 0.08) * 2;

    this.ctx.beginPath();
    this.ctx.arc(
      ppx,
      ppy + bounce,
      this.tileSize * 0.32,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    // Player inner glow
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    this.ctx.beginPath();
    this.ctx.arc(
      ppx,
      ppy + bounce,
      this.tileSize * 0.15,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    // Player outer ring (direction indicator when not sliding)
    if (!state.sliding && !state.won && !state.dead) {
      this.ctx.strokeStyle = "rgba(192, 202, 245, 0.2)";
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(
        ppx,
        ppy + bounce,
        this.tileSize * 0.38,
        0,
        Math.PI * 2,
      );
      this.ctx.stroke();
    }

    // --- Tutorial hints ---
    if (hints && hints.length > 0) {
      for (const hint of hints) {
        this.drawTutorialHint(hint, ox, oy, t);
      }
    }

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
      const vAlpha = Math.min(1, this.victoryTime / 60) * 0.2;
      this.ctx.fillStyle = `rgba(158, 206, 106, ${vAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);

      const ringPulse = Math.sin(t * 0.05) * 8;
      this.ctx.strokeStyle = "rgba(158, 206, 106, 0.6)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(
        ppx,
        ppy,
        this.tileSize * 0.6 + ringPulse,
        0,
        Math.PI * 2,
      );
      this.ctx.stroke();

      this.victoryTime--;
    }

    this.lastPlayerPos = { x: state.player.x, y: state.player.y };
  }

  private drawTutorialHint(
    hint: Hint,
    ox: number,
    oy: number,
    t: number,
  ) {
    const cx = ox + hint.col * this.tileSize + this.tileSize / 2;
    const cy = oy + hint.row * this.tileSize + this.tileSize / 2;

    // Pulsing circle behind arrow
    const pulse = Math.sin(t * 0.04) * 0.15 + 0.55;
    this.ctx.fillStyle = `rgba(122, 162, 247, ${pulse})`;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, this.tileSize * 0.45, 0, Math.PI * 2);
    this.ctx.fill();

    // Arrow
    const bounce = Math.sin(t * 0.06) * 3;
    let arrowX = cx;
    let arrowY = cy + bounce;

    if (hint.dir === "RIGHT") arrowX = cx + this.tileSize * 0.15 + bounce;
    if (hint.dir === "LEFT") arrowX = cx - this.tileSize * 0.15 - bounce;
    if (hint.dir === "UP") arrowY = cy - this.tileSize * 0.15 - bounce;
    if (hint.dir === "DOWN") arrowY = cy + this.tileSize * 0.15 + bounce;

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = `bold ${Math.floor(this.tileSize * 0.55)}px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(DIRECTION_ARROW[hint.dir], arrowX, arrowY);
  }
}
