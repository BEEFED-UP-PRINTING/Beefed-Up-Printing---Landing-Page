import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const COLORS = [
  "rgba(249,115,22,",   // orange
  "rgba(239,68,68,",    // red
  "rgba(255,200,80,",   // amber
  "rgba(255,255,255,",  // white
];

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  const isTouch = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Disable on touch devices
    const mq = window.matchMedia("(hover: none)");
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      if (canvas) {
        canvas.width = W;
        canvas.height = H;
      }
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Emit particles
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const speed = 0.5 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.6,
          size: 2 + Math.random() * 4,
          color,
        });
      }
    }

    window.addEventListener("mousemove", onMove);

    function loop() {
      ctx!.clearRect(0, 0, W, H);

      particles.current = particles.current.filter((p) => p.life > 0);

      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.vx *= 0.97;
        p.life -= 1 / (60 * p.maxLife);

        const alpha = Math.max(0, p.life);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx!.fillStyle = `${p.color}${(alpha * 0.9).toFixed(2)})`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = p.color + "0.6)";
        ctx!.fill();
      }

      raf.current = requestAnimationFrame(loop);
    }

    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: "screen" }}
      aria-hidden
    />
  );
}
