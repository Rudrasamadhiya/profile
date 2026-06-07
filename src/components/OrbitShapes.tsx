import { motion } from 'framer-motion';

export default function OrbitShapes() {
  return (
    <div className="orbit-stage" aria-hidden>
      <motion.div
        className="orbit-sphere"
        animate={{ y: [0, -22, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orbit-torus"
        animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <motion.div
        className="orbit-cube"
        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {[
          'translateZ(28px)',
          'rotateY(180deg) translateZ(28px)',
          'rotateY(90deg) translateZ(28px)',
          'rotateY(-90deg) translateZ(28px)',
          'rotateX(90deg) translateZ(28px)',
          'rotateX(-90deg) translateZ(28px)',
        ].map((t, i) => (
          <div key={i} className="orbit-cube-face" style={{ transform: t }} />
        ))}
      </motion.div>
    </div>
  );
}
