import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ExternalLink, Check, Github, Layers, Brain, Receipt } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import TiltCard from '../components/TiltCard';

interface Project {
  id: string;
  n: string;
  name: string;
  tagline: string;
  category: string;
  problem: string;
  bullets: string[];
  stack: string[];
  icon: typeof Layers;
  accent: string;
  live?: string;
}

const projects: Project[] = [
  {
    id: 'flowlink',
    n: '01',
    name: 'FlowLink',
    tagline: 'Hierarchical knowledge & problem-solving platform',
    category: 'Backend · Firestore · RBAC',
    problem:
      'Traditional discussion platforms lack structured hierarchy and governance. Designed a scalable backend with hierarchical node architecture and RBAC-based access control.',
    bullets: [
      'Modeled normalized NoSQL schema in Firestore with user indexing, membership rules, and secure access policies.',
      'Built end-to-end workflow engine: problem creation → moderation → approval → solution validation → voting, with state + notifications.',
      'Optimized read/write paths for performant, scalable data retrieval.',
    ],
    stack: ['Java', 'Firebase', 'Firestore', 'React'],
    icon: Layers,
    accent: '#b600a8',
  },
  {
    id: 'prepsharp',
    n: '02',
    name: 'PrepSharp.in',
    tagline: 'Computer-Based Testing (CBT) simulation platform',
    category: 'Live · Spring Boot · REST',
    problem:
      'Built a scalable CBT backend that simulates competitive exams with structured question categorization and analytics.',
    bullets: [
      'Developed RESTful APIs for authentication, exam state management, scoring engine, and answer review.',
      'Engineered an automated PDF data-extraction pipeline (chapter, difficulty, answer-type) with low-latency DB queries.',
      'Designed a modular backend architecture focused on performance and maintainability.',
    ],
    stack: ['Java', 'Spring Boot', 'REST APIs', 'Firestore'],
    icon: Brain,
    accent: '#7621b0',
    live: 'https://prepsharp.in',
  },
  {
    id: 'pos',
    n: '03',
    name: 'POS System',
    tagline: 'Inventory & transaction management',
    category: 'Java · OOP · Reliability',
    problem:
      'Small retailers need reliable inventory tracking and transactional consistency without enterprise complexity. Designed a modular POS backend.',
    bullets: [
      'Implemented inventory management, billing engine, and automated stock synchronization.',
      'Object-oriented architecture ensuring modularity, exception handling, and transactional consistency.',
      'Generated sales reports and transaction logs for operational analytics.',
    ],
    stack: ['Java', 'OOP', 'File Handling', 'Reporting'],
    icon: Receipt,
    accent: '#be4c00',
  },
];

export default function ProjectsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const titleX = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section
      ref={ref}
      id="projects"
      className="rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 px-5 sm:px-8 md:px-10 pt-24 sm:pt-28 md:pt-32 pb-24"
      style={{ background: '#0C0C0C' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-14 sm:mb-20">
          <span className="mono text-xs uppercase tracking-[0.3em] text-[#8b92b0]">// work</span>
          <motion.h2
            style={{ x: titleX, fontSize: 'clamp(2.5rem, 10vw, 140px)' }}
            className="hero-heading font-black uppercase text-center leading-none tracking-tight"
          >
            Projects
          </motion.h2>
        </div>

        {projects.map((p, i) => {
          const targetScale = 1 - (projects.length - 1 - i) * 0.03;
          const range: [number, number] = [i / projects.length, 1];
          return (
            <ProjectStackedCard
              key={p.id}
              project={p}
              index={i}
              targetScale={targetScale}
              progress={scrollYProgress}
              range={range}
            />
          );
        })}
      </div>
    </section>
  );
}

function ProjectStackedCard({
  project,
  index,
  targetScale,
  progress,
  range,
}: {
  project: Project;
  index: number;
  targetScale: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  range: [number, number];
}) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const Icon = project.icon;

  return (
    <div
      className="sticky flex items-start justify-center mb-6 sm:mb-10"
      style={{ top: `${100 + index * 28}px` }}
    >
      <motion.div
        style={{ scale }}
        className="project-card w-full rounded-[32px] sm:rounded-[40px] md:rounded-[50px] border-2 border-[#D7E2EA]/40 p-5 sm:p-7 md:p-10 bg-[#0c0c0c]"
      >
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8 sm:mb-10">
          <div className="flex items-start gap-5 sm:gap-7">
            <span
              className="hero-heading font-black leading-none"
              style={{ fontSize: 'clamp(2.6rem, 7vw, 100px)' }}
            >
              {project.n}
            </span>
            <div className="flex flex-col gap-2 pt-1">
              <span className="inline-flex self-start items-center gap-2 text-[#D7E2EA] uppercase tracking-widest text-xs rounded-full border border-[#D7E2EA]/40 px-3 py-1 mono">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: project.accent, boxShadow: `0 0 8px ${project.accent}` }}
                />
                {project.category}
              </span>
              <h3
                className="text-[#D7E2EA] font-medium leading-tight"
                style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.6rem)' }}
              >
                {project.name}
              </h3>
              <div className="mono text-sm text-[#8b92b0]">{project.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Rudrasamadhiya"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA]/40 text-[#D7E2EA] uppercase tracking-widest text-xs px-4 py-2.5 hover:bg-[#D7E2EA]/10 transition-colors"
            >
              <Github className="w-3.5 h-3.5" strokeWidth={2} />
              Code
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] uppercase tracking-widest text-xs sm:text-sm px-4 py-2.5 sm:px-6 sm:py-3 hover:bg-[#D7E2EA]/10 transition-colors"
              >
                Live
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-7">
          <div className="md:col-span-2 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${project.accent}, ${project.accent}80)`,
                  color: '#fff',
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <div className="mono text-xs uppercase tracking-widest text-[#8b92b0] mb-1">
                  // problem
                </div>
                <p className="text-[#bbccd7] leading-relaxed text-sm sm:text-[15px]">
                  {project.problem}
                </p>
              </div>
            </div>

            <div>
              <div className="mono text-xs uppercase tracking-widest text-[#8b92b0] mb-3">
                // stack
              </div>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="mono text-xs rounded-full px-3 py-1.5 border border-[#d7e2ea]/15 text-[#bbccd7]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            {project.bullets.map((b, i) => (
              <FadeIn key={i} delay={0.05 + i * 0.06} y={20}>
                <TiltCard intensity={5} className="rounded-2xl">
                  <div className="code-card p-4 sm:p-5 flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(215,226,234,0.08), rgba(215,226,234,0.02))',
                        border: '1px solid rgba(215,226,234,0.12)',
                      }}
                    >
                      <Check className="w-3.5 h-3.5 text-[#bbccd7]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[#bbccd7] text-sm leading-relaxed">{b}</p>
                  </div>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
