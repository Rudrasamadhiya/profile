import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

export default function TiltCard({
  children,
  className,
  intensity = 8,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xs = useSpring(x, { stiffness: 250, damping: 22, mass: 0.4 });
  const ys = useSpring(y, { stiffness: 250, damping: 22, mass: 0.4 });

  const rotateX = useTransform(ys, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(xs, [-0.5, 0.5], [-intensity, intensity]);

  const glareX = useTransform(xs, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(ys, [-0.5, 0.5], ['0%', '100%']);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1200,
      }}
      className={`relative ${className ?? ''}`}
    >
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay opacity-0 hover:opacity-100"
          style={{
            background: useTransform(
              [glareX, glareY] as never,
              ([gx, gy]: string[]) =>
                `radial-gradient(400px circle at ${gx} ${gy}, rgba(255,255,255,0.18), transparent 60%)`
            ),
            transition: 'opacity 0.35s ease',
          }}
        />
      )}
    </motion.div>
  );
}
