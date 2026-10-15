// Tiny canvas confetti: runs its own animation frame only while particles are alive.

const COLORS = [
  "#14b8a6",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#3b82f6",
  "#22c55e",
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  width: number;
  height: number;
  color: string;
  life: number;
  round: boolean;
};

export type Confetti = {
  burst: (x: number, y: number, count: number) => void;
  destroy: () => void;
};

export function createConfetti(canvas: HTMLCanvasElement): Confetti {
  const ctx = canvas.getContext("2d");
  let particles: Particle[] = [];
  let frame = 0;
  let last = 0;
  let dpr = 1;

  /** Wipe the whole pixel buffer, independent of the current transform. */
  const clear = () => {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const tick = (now: number) => {
    if (!ctx) return;
    const dt = Math.min(3, (now - last) / 16.67);
    last = now;
    clear();

    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) {
      p.vx *= Math.pow(0.985, dt);
      p.vy = p.vy * Math.pow(0.985, dt) + 0.12 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
      p.life -= 0.0105 * dt;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      }
      ctx.restore();
    }

    if (particles.length) {
      frame = requestAnimationFrame(tick);
    } else {
      frame = 0;
      clear();
    }
  };

  return {
    burst(x, y, count) {
      if (!ctx) return;
      resize();
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
        const speed = 2 + Math.random() * 3.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.3,
          width: 2.5 + Math.random() * 2,
          height: 4 + Math.random() * 3,
          color: COLORS[i % COLORS.length],
          life: 1,
          round: Math.random() < 0.3,
        });
      }
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    },
    destroy() {
      cancelAnimationFrame(frame);
      frame = 0;
      particles = [];
      clear();
    },
  };
}
