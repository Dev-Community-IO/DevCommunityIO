const PALETTE = [
  '#ff6b6b',
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
  '#c77dff',
  '#ff9400',
  '#00d4aa',
  '#ff8fab',
  '#a78bfa',
  '#38bdf8',
];

type PieceKind = 'rect' | 'circle' | 'ribbon';

type ConfettiPiece = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  opacity: number;
  kind: PieceKind;
  drag: number;
  wobble: number;
  wobbleSpeed: number;
  gravity: number;
  bornAt: number;
  lifeMs: number;
};

const DURATION_MS = 4800;
const FADE_MS = 1200;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function makePiece(
  x: number,
  y: number,
  vx: number,
  vy: number,
  bornAt: number,
  lifeMs: number,
  kind?: PieceKind
): ConfettiPiece {
  const pieceKind: PieceKind = kind ?? (Math.random() < 0.55 ? 'rect' : Math.random() < 0.75 ? 'circle' : 'ribbon');

  const size =
    pieceKind === 'ribbon'
      ? { w: rand(3, 5), h: rand(14, 26) }
      : pieceKind === 'circle'
        ? { w: rand(5, 9), h: rand(5, 9) }
        : { w: rand(6, 11), h: rand(8, 14) };

  return {
    x,
    y,
    ...size,
    color: pickColor(),
    vx,
    vy,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.18, 0.18),
    opacity: 1,
    kind: pieceKind,
    drag: rand(0.985, 0.993),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.015, 0.04),
    gravity: pieceKind === 'ribbon' ? rand(0.028, 0.042) : rand(0.045, 0.07),
    bornAt,
    lifeMs,
  };
}

function spawnBurst(pieces: ConfettiPiece[], originX: number, originY: number, count: number, bornAt: number) {
  for (let i = 0; i < count; i += 1) {
    const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15);
    const speed = rand(7, 16);
    pieces.push(
      makePiece(
        originX + rand(-24, 24),
        originY + rand(-12, 12),
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        bornAt,
        rand(3200, 4600)
      )
    );
  }
}

function spawnRain(pieces: ConfettiPiece[], width: number, count: number, bornAt: number) {
  for (let i = 0; i < count; i += 1) {
    pieces.push(
      makePiece(
        rand(0, width),
        rand(-80, -20),
        rand(-1.2, 1.2),
        rand(1.2, 3.2),
        bornAt,
        rand(3600, 5200),
        Math.random() < 0.3 ? 'ribbon' : undefined
      )
    );
  }
}

function drawPiece(ctx: CanvasRenderingContext2D, piece: ConfettiPiece) {
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.rot);
  ctx.globalAlpha = piece.opacity;
  ctx.fillStyle = piece.color;

  if (piece.kind === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, piece.w / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const rx = piece.kind === 'ribbon' ? piece.w * 0.7 : 2;
    ctx.beginPath();
    ctx.roundRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h, rx);
    ctx.fill();
  }

  ctx.restore();
}

export function celebrateOnboarding(): void {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const pieces: ConfettiPiece[] = [];
  const start = performance.now();
  let lastFrame = start;
  let rafId = 0;

  const centerX = () => canvas.width * 0.5;
  const burstY = () => canvas.height * 0.72;

  // Staggered waves for a richer, less “flash” feel
  const schedule: { at: number; run: (elapsed: number) => void }[] = [
    { at: 0, run: () => spawnBurst(pieces, centerX(), burstY(), 48, 0) },
    { at: 120, run: () => spawnBurst(pieces, centerX() - 80, burstY() + 20, 22, 120) },
    { at: 120, run: () => spawnBurst(pieces, centerX() + 80, burstY() + 20, 22, 120) },
    { at: 280, run: (elapsed) => spawnRain(pieces, canvas.width, 36, elapsed) },
    { at: 680, run: (elapsed) => spawnRain(pieces, canvas.width, 28, elapsed) },
    { at: 1200, run: (elapsed) => spawnRain(pieces, canvas.width, 18, elapsed) },
  ];
  const fired = new Set<number>();

  const animate = (now: number) => {
    const elapsed = now - start;
    const dt = Math.min(32, now - lastFrame) / 16.67; // ~60fps units
    lastFrame = now;

    for (const wave of schedule) {
      if (elapsed >= wave.at && !fired.has(wave.at)) {
        fired.add(wave.at);
        wave.run(elapsed);
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = pieces.length - 1; i >= 0; i -= 1) {
      const piece = pieces[i];
      const age = elapsed - piece.bornAt;

      if (age > piece.lifeMs) {
        pieces.splice(i, 1);
        continue;
      }

      piece.vx *= piece.drag;
      piece.vy *= piece.drag;
      piece.vy += piece.gravity * dt;
      piece.wobble += piece.wobbleSpeed * dt;
      piece.x += (piece.vx + Math.sin(piece.wobble) * 0.35) * dt;
      piece.y += piece.vy * dt;
      piece.rot += piece.vr * dt;

      const fadeStart = Math.max(0, piece.lifeMs - FADE_MS);
      if (age > fadeStart) {
        piece.opacity = 1 - (age - fadeStart) / FADE_MS;
      }

      if (piece.y > canvas.height + 40 || piece.x < -40 || piece.x > canvas.width + 40) {
        pieces.splice(i, 1);
        continue;
      }

      drawPiece(ctx, piece);
    }

    if (elapsed < DURATION_MS || pieces.length > 0) {
      rafId = requestAnimationFrame(animate);
    } else {
      canvas.remove();
      window.removeEventListener('resize', resize);
    }
  };

  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(animate);

  // Safety cleanup if tab is backgrounded
  window.setTimeout(() => {
    cancelAnimationFrame(rafId);
    canvas.remove();
    window.removeEventListener('resize', resize);
  }, DURATION_MS + 800);
}
