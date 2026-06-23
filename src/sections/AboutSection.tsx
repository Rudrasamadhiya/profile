import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import TiltCard from '../components/TiltCard';
import CountUp from '../components/CountUp';

const aboutText =
  "Computer Science (Data Science) undergraduate at IIIT Bhopal who likes shipping real, production-grade software. I work full-stack across React, Next.js, React Native and Node / NestJS — building scalable, distributed systems and writing clean, maintainable code.";

const stats = [
  { value: '133K+', label: 'Question bank · PrepSharp' },
  { value: '16+', label: 'Open-source PRs · GSSoC' },
  { value: '2nd', label: 'Place · RootRush CTF' },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="min-h-screen flex flex-col items-center justify-center relative px-5 sm:px-8 md:px-10 py-24 sm:py-32"
    >
      <div className="max-w-5xl w-full mx-auto flex flex-col items-center gap-14 sm:gap-20 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <FadeIn delay={0} y={20}>
            <span className="mono text-xs uppercase tracking-[0.3em] text-[#8b92b0]">// about</span>
          </FadeIn>
          <FadeIn delay={0.05} y={30}>
            <h2
              className="hero-heading font-black uppercase leading-none tracking-tight text-center"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 140px)' }}
            >
              About me
            </h2>
          </FadeIn>
        </div>

        <AnimatedText
          text={aboutText}
          className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-2xl"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={0.1 + i * 0.08}>
              <TiltCard intensity={9} className="rounded-3xl">
              <div className="code-card p-6 sm:p-8 text-center">
                <div
                  className="font-black hero-heading"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1 }}
                >
                  <CountUp value={s.value} />
                </div>
                <div className="mono mt-3 text-[#8b92b0] text-xs sm:text-sm uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
              </TiltCard>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <div className="code-card p-5 sm:p-7 max-w-2xl w-full">
            <div className="terminal-bar -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 mb-4 rounded-t-[24px]">
              <span className="terminal-dot r" />
              <span className="terminal-dot y" />
              <span className="terminal-dot g" />
              <span className="kbd ml-3">~/rudra — bio.md</span>
            </div>
            <p className="mono text-sm leading-relaxed text-[#bbccd7]">
              <span className="text-[#8b92b0]"># Currently</span>
              <br />
              Running <span className="text-[#b600a8]">PrepSharp.in</span> — a live CBT exam platform
              (Next.js + Firebase) now live on the Google Play Store — and building{' '}
              <span className="text-[#b600a8]">Instant Kirana</span>, a distributed quick-commerce
              platform (React Native + NestJS microservices). Contributing to open source via{' '}
              <span className="text-[#bbccd7]">GSSoC 2026</span> (16+ merged PRs) and sharpening DSA.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
