import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GraduationCap, Trophy, GitMerge } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import TiltCard from '../components/TiltCard';

const timeline = [
  {
    period: '2025 — 2029',
    title: 'B.Tech, Computer Science (Data Science)',
    place: 'Indian Institute of Information Technology, Bhopal',
    desc:
      'CGPA 8.6 / 10 · strong foundations in DSA, OOP, Operating Systems, DBMS, and distributed system design.',
    tags: ['DSA', 'OOP', 'Operating Systems', 'DBMS', 'System Design'],
  },
  {
    period: '— 2024',
    title: 'Schooling · Class X & XII',
    place: 'The Sanskaar Valley School, Bhopal',
    desc:
      'CBSE · Class XII: 91.25% · Class X: 92% — physics, chemistry, mathematics and computer science.',
    tags: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
  },
];

export default function EducationSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const titleX = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const lineHeight = useTransform(scrollYProgress, [0.05, 0.7], ['0%', '100%']);

  return (
    <section
      ref={ref}
      id="education"
      className="px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-32 relative"
      style={{ background: '#0C0C0C' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-14 sm:mb-20">
          <span className="mono text-xs uppercase tracking-[0.3em] text-[#8b92b0]">// education</span>
          <motion.h2
            style={{ x: titleX, fontSize: 'clamp(2.5rem, 10vw, 140px)' }}
            className="hero-heading font-black uppercase text-center leading-none tracking-tight"
          >
            Education
          </motion.h2>
        </div>

        <div className="relative pl-6 sm:pl-10">
          <div
            className="absolute top-2 bottom-2 left-1 sm:left-2 w-px overflow-hidden"
            style={{ background: 'rgba(215,226,234,0.08)' }}
          >
            <motion.div
              style={{
                height: lineHeight,
                background:
                  'linear-gradient(180deg, rgba(215,226,234,0.9), rgba(215,226,234,0.1))',
              }}
              className="w-full"
            />
          </div>

          {timeline.map((t, i) => (
            <FadeIn key={t.title} delay={i * 0.1}>
              <div className="relative mb-10 sm:mb-12 last:mb-0">
                <div className="timeline-dot absolute -left-[19px] sm:-left-[31px] top-2 z-10" />
                <TiltCard intensity={5} className="rounded-3xl">
                <div className="code-card p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <GraduationCap className="w-4 h-4 text-[#bbccd7]" strokeWidth={1.6} />
                    <span className="mono text-xs uppercase tracking-widest text-[#8b92b0]">
                      {t.period}
                    </span>
                  </div>
                  <h3
                    className="font-medium text-[#d7e2ea] mb-1"
                    style={{ fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', lineHeight: 1.2 }}
                  >
                    {t.title}
                  </h3>
                  <div className="text-[#bbccd7] text-sm sm:text-base mb-3">{t.place}</div>
                  <p className="text-[#8b92b0] leading-relaxed text-sm sm:text-base">{t.desc}</p>
                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="mono text-xs rounded-full px-3 py-1 border border-[#d7e2ea]/15 text-[#bbccd7]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                </TiltCard>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <TiltCard intensity={6} className="mt-12 rounded-3xl">
          <div className="code-card p-6 sm:p-8 flex items-center gap-5 sm:gap-6">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #b600a8, #7621b0)',
                color: '#fff',
              }}
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.6} />
            </div>
            <div>
              <div className="mono text-xs uppercase tracking-widest text-[#8b92b0] mb-1">
                // achievement · 2026
              </div>
              <h3
                className="font-medium text-[#d7e2ea]"
                style={{ fontSize: 'clamp(1rem, 1.6vw, 1.3rem)' }}
              >
                2nd Place — RootRush 2026 (Jeopardy-style CTF)
              </h3>
              <p className="text-[#8b92b0] text-sm mt-1 leading-relaxed">
                Led team <span className="text-[#bbccd7]">Ctrl Alt Defend</span> · organized by
                Xploit, Cybersecurity Club, IIIT Bhopal · NIIMACK 2026. Solved forensics, security
                analysis, and AI-based scenarios.
              </p>
            </div>
          </div>
          </TiltCard>
        </FadeIn>

        <FadeIn delay={0.3}>
          <TiltCard intensity={6} className="mt-5 rounded-3xl">
          <div className="code-card p-6 sm:p-8 flex items-center gap-5 sm:gap-6">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1A6E4A, #28c840)',
                color: '#fff',
              }}
            >
              <GitMerge className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.6} />
            </div>
            <div>
              <div className="mono text-xs uppercase tracking-widest text-[#8b92b0] mb-1">
                // open source · 2026
              </div>
              <h3
                className="font-medium text-[#d7e2ea]"
                style={{ fontSize: 'clamp(1rem, 1.6vw, 1.3rem)' }}
              >
                GSSoC 2026 — 10+ Merged Pull Requests
              </h3>
              <p className="text-[#8b92b0] text-sm mt-1 leading-relaxed">
                GirlScript Summer of Code · merged 10+ PRs across community projects — bug fixes,
                new API endpoints, and performance/security improvements. Earned 11 badges including
                the rare <span className="text-[#bbccd7]">Power Contributor</span>.
              </p>
            </div>
          </div>
          </TiltCard>
        </FadeIn>
      </div>
    </section>
  );
}
