import { useEffect, useRef } from 'react';

export default function CursorButterfly() {
  const elRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const target = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.09;
      pos.current.y += (target.current.y - pos.current.y) * 0.09;
      if (elRef.current) {
        elRef.current.style.transform =
          `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={elRef} className="cursor-butterfly" aria-hidden="true">
      🦋
    </div>
  );
}
