import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  value: string; // e.g. "1000+", "90%+", "3 yrs"
  duration?: number;
  className?: string;
}

export default function CountUp({ value, duration = 1500, className }: CountUpProps) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCurrent(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  const display =
    target >= 100 ? Math.round(current).toString() : current.toFixed(target % 1 ? 1 : 0);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {display}
      {suffix}
    </span>
  );
}
