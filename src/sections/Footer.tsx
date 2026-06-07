import { Mail, Github, Linkedin, Phone, ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import TiltCard from '../components/TiltCard';

const links = [
  {
    icon: Mail,
    label: 'Email',
    value: 'Samadhiyarudra123@gmail.com',
    href: 'mailto:Samadhiyarudra123@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 86430 37131',
    href: 'tel:+918643037131',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'in/rudra-samadhiya',
    href: 'https://www.linkedin.com/in/rudra-samadhiya',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: '@Rudrasamadhiya',
    href: 'https://github.com/Rudrasamadhiya',
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative px-5 sm:px-8 md:px-10 pt-24 pb-10"
      style={{ background: '#0C0C0C' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-14">
        <div className="flex flex-col items-center gap-4">
          <FadeIn>
            <span className="mono text-xs uppercase tracking-[0.3em] text-[#8b92b0]">// contact</span>
          </FadeIn>
          <FadeIn delay={0.05} y={30}>
            <h2
              className="hero-heading font-black uppercase text-center leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 140px)' }}
            >
              Let&apos;s build
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p
              className="text-[#bbccd7] text-center max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)' }}
            >
              Open to internships and backend collaborations. Based in Bhopal, India.
              Drop a line — I reply fast.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {links.map((l, i) => {
            const Icon = l.icon;
            return (
              <FadeIn key={l.label} delay={0.1 + i * 0.06}>
                <TiltCard intensity={8} className="rounded-3xl">
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="code-card group p-5 sm:p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(215,226,234,0.12)',
                      }}
                    >
                      <Icon className="w-4 h-4 text-[#d7e2ea]" strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0">
                      <div className="mono text-xs uppercase tracking-widest text-[#8b92b0]">
                        {l.label}
                      </div>
                      <div className="text-[#d7e2ea] text-sm truncate">{l.value}</div>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 text-[#8b92b0] group-hover:text-[#d7e2ea] transition-colors flex-shrink-0"
                    strokeWidth={1.6}
                  />
                </a>
                </TiltCard>
              </FadeIn>
            );
          })}
        </div>

        <div className="border-t border-[#D7E2EA]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#8b92b0] text-xs uppercase tracking-widest mono">
          <span>&copy; {new Date().getFullYear()} Rudra Samadhiya</span>
          <span>Built with React · TypeScript · Framer Motion</span>
        </div>
      </div>
    </footer>
  );
}
