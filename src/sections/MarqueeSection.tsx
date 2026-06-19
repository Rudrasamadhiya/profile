import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import FadeIn from '../components/FadeIn';

type Tech = { name: string; slug: string; color: string };

const row1: Tech[] = [
  { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
  { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
  { name: 'React', slug: 'react', color: '61DAFB' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'ffffff' },
  { name: 'React Native', slug: 'react', color: '61DAFB' },
  { name: 'Tailwind', slug: 'tailwindcss', color: '06B6D4' },
  { name: 'HTML5', slug: 'html5', color: 'E34F26' },
  { name: 'CSS3', slug: 'css3', color: '1572B6' },
];

const row2: Tech[] = [
  { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
  { name: 'NestJS', slug: 'nestjs', color: 'E0234E' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
  { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
  { name: 'Redis', slug: 'redis', color: 'DC382D' },
  { name: 'Socket.IO', slug: 'socketdotio', color: 'ffffff' },
  { name: 'Firebase', slug: 'firebase', color: 'FFCA28' },
];

const row3: Tech[] = [
  { name: 'Java', slug: 'openjdk', color: 'ED8B00' },
  { name: 'Docker', slug: 'docker', color: '2496ED' },
  { name: 'Git', slug: 'git', color: 'F05032' },
  { name: 'GitHub', slug: 'github', color: 'ffffff' },
  { name: 'Vercel', slug: 'vercel', color: 'ffffff' },
  { name: 'Postman', slug: 'postman', color: 'FF6C37' },
  { name: 'Linux', slug: 'linux', color: 'FCC624' },
];

function TechChip({ tech }: { tech: Tech }) {
  return (
    <div className="tech-chip">
      <span
        className="tech-chip-icon"
        style={{
          background: `radial-gradient(circle at 30% 30%, #${tech.color}33, transparent 70%)`,
        }}
      >
        <img
          src={`https://cdn.simpleicons.org/${tech.slug}/${tech.color}`}
          alt={tech.name}
          width={22}
          height={22}
          loading="lazy"
        />
      </span>
      <span className="mono text-sm text-[#e6edf3]">{tech.name}</span>
    </div>
  );
}

function PerspectiveRow({
  items,
  reverse = false,
  speed = 50,
}: {
  items: Tech[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="tech-marquee-wrapper relative overflow-hidden">
      <div
        className="tech-marquee gap-4"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {doubled.map((t, i) => (
          <TechChip key={`${t.name}-${i}`} tech={t} />
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const stageRotate = useTransform(scrollYProgress, [0, 1], [-3, 8]);
  const headingX = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden pt-20 sm:pt-28 md:pt-36 pb-16 sm:pb-20"
      style={{ background: '#0C0C0C' }}
    >
      <div className="mesh-bg opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-end mb-10 sm:mb-14">
          <FadeIn>
            <div className="flex items-center gap-3 mb-4 mono text-xs uppercase tracking-[0.3em] text-[#8b92b0]">
              <span className="h-px w-10 bg-[#8b92b0]/40" />
              <span>// tech stack</span>
            </div>
            <motion.h2
              style={{ x: headingX, fontSize: 'clamp(2.2rem, 7vw, 5.5rem)' }}
              className="hero-heading font-black uppercase tracking-tight leading-none"
            >
              Tools I ship with
            </motion.h2>
            <p
              className="mt-4 text-[#8b92b0] max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)' }}
            >
              A pragmatic, TypeScript-first stack — React &amp; React Native on the front, Node /
              NestJS microservices on the back. Picked for shipping, not for showing off.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex items-center gap-3 mono text-xs text-[#8b92b0] uppercase tracking-widest">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#d7e2ea]/15">
                <span className="w-2 h-2 rounded-full bg-[#28c840] shadow-[0_0_8px_#28c840]" />
                hover to pause
              </span>
            </div>
          </FadeIn>
        </div>

        <div className="relative">
          <div className="marquee-fade left" />
          <div className="marquee-fade right" />

          <div className="tech-stage">
            <motion.div
              style={{
                rotateX: 14,
                rotateY: stageRotate,
                rotateZ: 0.5,
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50%',
              }}
              className="flex flex-col gap-3 sm:gap-4"
            >
              <PerspectiveRow items={row1} speed={55} />
              <PerspectiveRow items={row2} speed={70} reverse />
              {/* hide 3rd row on mobile to reduce visual noise */}
              <div className="hidden sm:block">
                <PerspectiveRow items={row3} speed={45} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Featured "currently shipping" card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-10 sm:mt-14">
          <FadeIn delay={0.1}>
            <div className="code-card p-6 sm:p-7 flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between">
                <div className="mono text-xs uppercase tracking-widest text-[#8b92b0]">
                  // core
                </div>
                <Sparkles className="w-4 h-4 text-[#b600a8]" strokeWidth={1.6} />
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#61DAFB22' }}
                >
                  <img
                    src="https://cdn.simpleicons.org/react/61DAFB"
                    width={22}
                    height={22}
                    alt="React"
                  />
                </span>
                <div>
                  <div className="text-[#d7e2ea] font-medium">React &amp; Next.js</div>
                  <div className="mono text-xs text-[#8b92b0]">full-stack core</div>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between mono text-[10px] uppercase tracking-widest text-[#8b92b0] mb-1.5">
                  <span>proficiency</span>
                  <span>advanced</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '90%',
                      background: 'linear-gradient(90deg, #61DAFB, #b600a8)',
                    }}
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div className="code-card p-6 sm:p-7 flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between">
                <div className="mono text-xs uppercase tracking-widest text-[#8b92b0]">
                  // shipping
                </div>
                <TrendingUp className="w-4 h-4 text-[#be4c00]" strokeWidth={1.6} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Next.js', slug: 'nextdotjs', color: 'ffffff' },
                  { name: 'React', slug: 'react', color: '61DAFB' },
                  { name: 'Firebase', slug: 'firebase', color: 'FFCA28' },
                  { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 border border-white/5 bg-white/[0.02]"
                  >
                    <img
                      src={`https://cdn.simpleicons.org/${t.slug}/${t.color}`}
                      width={16}
                      height={16}
                      alt={t.name}
                    />
                    <span className="mono text-xs text-[#bbccd7]">{t.name}</span>
                  </div>
                ))}
              </div>
              <div className="mono text-xs text-[#8b92b0] mt-auto">
                Live in production —{' '}
                <span className="text-[#bbccd7]">PrepSharp.in</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.26}>
            <div className="code-card p-6 sm:p-7 flex flex-col gap-4 h-full">
              <div className="mono text-xs uppercase tracking-widest text-[#8b92b0]">
                // learning
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { name: 'Docker', slug: 'docker', color: '2496ED' },
                  { name: 'Kubernetes', slug: 'kubernetes', color: '326CE5' },
                  { name: 'AWS', slug: 'amazonwebservices', color: 'FF9900' },
                  { name: 'CI/CD', slug: 'githubactions', color: '2088FF' },
                ].map((t) => (
                  <span
                    key={t.name}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-white/10"
                  >
                    <img
                      src={`https://cdn.simpleicons.org/${t.slug}/${t.color}`}
                      width={14}
                      height={14}
                      alt={t.name}
                    />
                    <span className="mono text-xs text-[#bbccd7]">{t.name}</span>
                  </span>
                ))}
              </div>
              <div className="mono text-xs text-[#8b92b0] mt-auto">
                Sharpening the edges — full-stack &amp; cloud.
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
