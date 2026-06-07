import { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function SectionDots() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(s.id);
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[120] hidden md:flex flex-col gap-3">
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group relative flex items-center gap-3"
            aria-label={`Go to ${s.label}`}
          >
            <span
              className={`mono text-[10px] uppercase tracking-widest text-[#8b92b0] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isActive ? 'opacity-100 text-[#d7e2ea]' : ''
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-500 ${
                isActive
                  ? 'w-2.5 h-2.5 bg-[#d7e2ea] shadow-[0_0_12px_rgba(215,226,234,0.6)]'
                  : 'w-1.5 h-1.5 bg-[#8b92b0]/40 group-hover:bg-[#bbccd7]'
              }`}
            />
          </a>
        );
      })}
    </div>
  );
}
