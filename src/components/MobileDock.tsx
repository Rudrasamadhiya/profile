import { useEffect, useState } from 'react';
import { Home, User, Code2, Briefcase, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { id: 'hero', icon: Home, label: 'Home' },
  { id: 'about', icon: User, label: 'About' },
  { id: 'skills', icon: Code2, label: 'Skills' },
  { id: 'projects', icon: Briefcase, label: 'Work' },
  { id: 'contact', icon: Mail, label: 'Hire' },
];

export default function MobileDock() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(item.id);
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-[120] px-2"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(28, 28, 32, 0.85), rgba(14, 14, 16, 0.85))',
          border: '1px solid rgba(215, 226, 234, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 18px 50px -10px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-label={item.label}
              className="relative flex items-center justify-center"
            >
              <motion.div
                animate={{
                  width: isActive ? 84 : 40,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-10 flex items-center justify-center gap-1.5 rounded-full overflow-hidden"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #b600a8, #7621b0)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 8px 22px -8px rgba(182, 0, 168, 0.6)'
                    : 'none',
                }}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-[#bbccd7]'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    className="mono text-[10px] uppercase tracking-widest text-white whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </a>
          );
        })}
      </div>
    </motion.nav>
  );
}
