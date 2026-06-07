import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import ContactButton from '../components/ContactButton';
import FloatingCube from '../components/FloatingCube';
import OrbitShapes from '../components/OrbitShapes';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Education', href: '#education' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

const TYPED = 'whoami → rudra samadhiya · iiit bhopal · software dev';

export default function HeroSection() {
  const [typed, setTyped] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(TYPED.slice(0, i));
      if (i >= TYPED.length) clearInterval(id);
    }, 38);
    return () => clearInterval(id);
  }, []);

  // scroll-driven parallax for hero cube + heading
  const { scrollY } = useScroll();
  const cubeY = useTransform(scrollY, [0, 600], [0, 180]);
  const cubeRotate = useTransform(scrollY, [0, 600], [0, 40]);
  const headingY = useTransform(scrollY, [0, 600], [0, -80]);
  const headingOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const glowY = useTransform(scrollY, [0, 600], [0, 100]);

  return (
    <section
      className="min-h-screen flex flex-col relative"
      style={{ overflowX: 'clip' }}
    >
      <div className="mesh-bg" />
      <div className="grid-overlay" />
      <motion.div className="hero-glow" style={{ y: glowY }} />
      <div className="noise-overlay" />
      <OrbitShapes />

      <FadeIn delay={0} y={-20} as="nav" className="px-5 sm:px-8 md:px-10 pt-5 sm:pt-6 md:pt-8 relative z-30">
        <div className="flex justify-between items-center gap-4">
          <a href="#hero" className="mono text-sm sm:text-base text-[#d7e2ea] flex items-center gap-2">
            <span className="text-[#b600a8]">{'<'}</span>
            rudra.dev
            <span className="text-[#b600a8]">{'/>'}</span>
          </a>
          <div className="hidden md:flex items-center gap-5 md:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base hover:opacity-90 transition-opacity duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-10 h-10 rounded-full border border-[#d7e2ea]/30 flex items-center justify-center text-[#d7e2ea]"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* mobile menu drawer */}
        <motion.div
          initial={false}
          animate={{
            height: menuOpen ? 'auto' : 0,
            opacity: menuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden overflow-hidden"
        >
          <div className="mt-4 code-card p-5 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="mono uppercase tracking-widest text-sm text-[#d7e2ea] py-2 border-b border-[#d7e2ea]/10 last:border-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </FadeIn>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center px-5 sm:px-8 md:px-10 pt-8 sm:pt-12 md:pt-16 pb-8 md:pb-14 relative z-20">
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="flex flex-col gap-8 sm:gap-10"
        >
          <div className="max-w-3xl">
            <FadeIn delay={0.1} y={20}>
              <div className="mono text-[10px] sm:text-xs md:text-sm text-[#8b92b0] mb-4 sm:mb-6 flex items-center gap-2 flex-wrap">
                <span className="inline-block w-2 h-2 rounded-full bg-[#28c840] shadow-[0_0_10px_#28c840]" />
                <span className="text-[#b600a8]">$</span>
                <span className="break-all">{typed}</span>
                <span className="inline-block w-[8px] h-[14px] sm:w-[10px] sm:h-[18px] bg-[#d7e2ea] animate-pulse" />
              </div>
            </FadeIn>

            <div className="overflow-hidden">
              <FadeIn delay={0.2} y={40}>
                <h1
                  className="hero-heading font-black uppercase tracking-tight leading-[0.9]"
                  style={{ fontSize: 'clamp(2.8rem, 13vw, 8.5rem)' }}
                >
                  Hi, i&apos;m
                  <br />
                  Rudra.
                </h1>
              </FadeIn>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 sm:gap-6">
            <FadeIn delay={0.35} y={20}>
              <p
                className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[420px]"
                style={{ fontSize: 'clamp(0.78rem, 1.4vw, 1.4rem)' }}
              >
                software developer · backend systems · problem solver
                <span
                  className="block mt-2 text-[#8b92b0] normal-case font-normal tracking-normal"
                  style={{ fontSize: 'clamp(0.75rem, 1.1vw, 1rem)' }}
                >
                  CSE @ <span className="text-[#bbccd7]">IIIT Bhopal</span>. Building scalable
                  backends with Java, Spring Boot &amp; Firestore.
                </span>
              </p>
            </FadeIn>
            <FadeIn delay={0.5} y={20}>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="#projects"
                  className="hidden sm:inline-flex rounded-full border border-[#D7E2EA]/40 text-[#D7E2EA] uppercase tracking-widest text-xs md:text-sm px-5 py-2.5 md:px-7 md:py-3.5 hover:bg-[#D7E2EA]/10 transition-colors"
                >
                  View Work
                </a>
                <a href="#contact">
                  <ContactButton />
                </a>
              </div>
            </FadeIn>
          </div>
        </motion.div>

        <motion.div
          style={{ y: cubeY, rotate: cubeRotate }}
          className="hidden lg:flex items-center justify-center"
        >
          <FadeIn delay={0.4} y={20}>
            <FloatingCube />
          </FadeIn>
        </motion.div>
      </div>

      {/* mobile-only floating cube — small, top-right corner of the hero, floats above content */}
      <div className="lg:hidden pointer-events-none absolute top-20 right-4 sm:right-6 z-10 opacity-90 scale-[0.55] sm:scale-75 origin-top-right">
        <FloatingCube />
      </div>

      {/* scroll indicator — hidden on mobile (we have the dock instead) */}
      <FadeIn delay={1} y={10} className="hidden sm:flex absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 mono text-[10px] uppercase tracking-[0.3em] text-[#8b92b0]">
          <span>scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#8b92b0] to-transparent" />
        </div>
      </FadeIn>
    </section>
  );
}
