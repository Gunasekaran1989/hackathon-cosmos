import { useEffect, useRef } from "react";

export const Particles = ({ count = 40 }: { count?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let w = (c.width = c.offsetWidth);
    let h = (c.height = c.offsetHeight);
    const colors = ["#2563eb", "#a855f7", "#22c55e"];
    const ps = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1, c: colors[Math.floor(Math.random() * 3)],
    }));
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.shadowBlur = 12; ctx.shadowColor = p.c;
        ctx.fill();
      });
      ps.forEach((a, i) => ps.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(tick);
    };
    tick();
    const onResize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [count]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
};
