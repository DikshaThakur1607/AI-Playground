import { useEffect, useRef } from 'react';

const COLORS = ['#ff6b9d', '#38bdf8', '#84cc16', '#f59e0b', '#8b5cf6', '#34d399', '#f97316', '#67e8f9'];

function rand(min, max) { return Math.random() * (max - min) + min; }

export default function Confetti({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 160 }, () => ({
      x: rand(0, canvas.width),
      y: rand(-canvas.height * 0.6, -10),
      r: rand(4, 10),
      d: rand(1.5, 3.5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: rand(-12, 12),
      tiltSpeed: rand(0.05, 0.25),
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      wobble: rand(0, Math.PI * 2),
    }));

    let frame = 0;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.d + Math.sin(p.wobble + frame * 0.03) * 0.6;
        p.wobble += 0.04;
        p.tilt += p.tiltSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.tilt * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        }
        ctx.restore();

        if (p.y > canvas.height + 20) particles.splice(i, 1);
      }

      if (particles.length > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 9999,
        width: '100%', height: '100%',
      }}
      aria-hidden="true"
    />
  );
}
