import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0% 50%',
        background: 'linear-gradient(90deg, #b600a8, #7621b0, #be4c00)',
      }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[150]"
    />
  );
}
