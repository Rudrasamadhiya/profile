import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Code2, Database, Layers } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import TiltCard from '../components/TiltCard';

const skillGroups = [
  {
    icon: Code2,
    title: 'Languages & CS Core',
    items: ['TypeScript', 'JavaScript', 'Java', 'C++', 'DSA', 'OOP', 'Operating Systems', 'DBMS'],
  },
  {
    icon: Layers,
    title: 'Frontend & Backend',
    items: [
      'React',
      'Next.js',
      'React Native (Expo)',
      'Node.js',
      'NestJS',
      'REST APIs',
      'WebSockets',
      'Microservices',
    ],
  },
  {
    icon: Database,
    title: 'Data, Cache & DevOps',
    items: ['PostgreSQL', 'MongoDB', 'Firebase / Firestore', 'Redis', 'Docker', 'Git & GitHub', 'Vercel'],
  },
];

export default function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const titleX = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      ref={ref}
      id="skills"
      className="px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] relative z-[1]"
      style={{ background: '#FFFFFF' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-14 sm:mb-20">
          <span className="mono text-xs uppercase tracking-[0.3em] text-[#64748b]">// skills</span>
          <motion.h2
            style={{ x: titleX, color: '#0C0C0C', fontSize: 'clamp(2.5rem, 10vw, 140px)', lineHeight: 1 }}
            className="font-black uppercase text-center"
          >
            What I do
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {skillGroups.map((group, i) => {
            const Icon = group.icon;
            return (
              <FadeIn key={group.title} delay={i * 0.08}>
                <TiltCard intensity={6} glare={false} className="h-full rounded-3xl">
                <div
                  className="h-full rounded-3xl p-7 sm:p-8 transition-all duration-500"
                  style={{
                    background: '#fafafa',
                    border: '1px solid rgba(12, 12, 12, 0.08)',
                    boxShadow: '0 24px 60px -28px rgba(12,12,12,0.15)',
                  }}
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background: 'linear-gradient(135deg, #0C0C0C, #2a2c33)',
                      color: '#fff',
                    }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.6} />
                  </div>
                  <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                    0{i + 1}
                  </div>
                  <h3
                    className="font-medium mb-5"
                    style={{
                      color: '#0C0C0C',
                      fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)',
                      lineHeight: 1.2,
                    }}
                  >
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="mono text-xs sm:text-sm rounded-full px-3 py-1.5 transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                          color: '#0C0C0C',
                          background: '#fff',
                          border: '1px solid rgba(12, 12, 12, 0.12)',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                </TiltCard>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
