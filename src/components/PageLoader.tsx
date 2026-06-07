import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TARGET = 'RUDRA SAMADHIYA';
const SCRAMBLE = '!<>-_\\/[]{}=+*^?#$%@&01';

const BOOT_LINES: { ts: string; msg: string; status?: 'ok' | 'warn' }[] = [
  { ts: '00:00.04', msg: 'init :: portfolio.runtime' },
  { ts: '00:00.12', msg: 'resolve :: 142 modules' },
  { ts: '00:00.21', msg: 'compile :: tsx → js' },
  { ts: '00:00.34', msg: 'shaders :: 3d cube online' },
  { ts: '00:00.48', msg: 'fetch :: tech-stack manifest' },
  { ts: '00:00.61', msg: 'hydrate :: framer-motion' },
  { ts: '00:00.74', msg: 'mount :: react root', status: 'ok' },
  { ts: '00:00.86', msg: 'rudra.dev :: ready', status: 'ok' },
];

const MODULES = [
  { name: 'core', color: '#28c840', speed: 1.0 },
  { name: '3d', color: '#b600a8', speed: 0.7 },
  { name: 'fx', color: '#7621b0', speed: 0.85 },
  { name: 'net', color: '#be4c00', speed: 1.15 },
];

const STRIPS = 7;

function Scrambled({ target, duration = 1500 }: { target: string; duration?: number }) {
  const [out, setOut] = useState(() => target.replace(/\S/g, ' '));
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const settled = Math.min(target.length, Math.floor((elapsed / duration) * target.length));
      let s = '';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        if (ch === ' ') s += ' ';
        else if (i < settled) s += ch;
        else s += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      setOut(s);
      if (elapsed < duration + 100) raf = requestAnimationFrame(tick);
      else setOut(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{out}</>;
}

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // master progress (eased)
  useEffect(() => {
    const start = performance.now();
    const total = 2200;
    let raf = 0;
    let value = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const target = Math.min(100, (elapsed / total) * 100);
      value += (target - value) * 0.14;
      setProgress(value);
      if (value < 99.6) raf = requestAnimationFrame(tick);
      else {
        setProgress(100);
        setTimeout(() => setDone(true), 520);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // stream boot log lines
  useEffect(() => {
    const timers: number[] = [];
    BOOT_LINES.forEach((_, i) => {
      const id = window.setTimeout(() => setVisibleLines(i + 1), 180 + i * 180);
      timers.push(id);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  // auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleLines]);

  // lock body scroll while loading
  useEffect(() => {
    document.body.style.overflow = done ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className="fixed inset-0 z-[200] pointer-events-auto"
        >
          {/* content layer — fades out first */}
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 md:p-12"
            style={{ background: '#0c0c0c' }}
          >
            <div className="mesh-bg opacity-60" />
            <div className="grid-overlay" />
            <div className="noise-overlay" />

            {/* top bar — like an IDE status strip */}
            <div className="relative z-10 flex items-center justify-between mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8b92b0]">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="terminal-dot r" />
                <span className="terminal-dot y" />
                <span className="terminal-dot g" />
                <span className="ml-2 sm:ml-4">rudra.dev — boot.log</span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span>{TARGET.toLowerCase()}@iiitb</span>
                <span className="text-[#28c840]">▲</span>
              </div>
            </div>

            {/* center — scrambled name */}
            <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
              <div className="mono text-[10px] sm:text-xs text-[#8b92b0] flex items-center gap-2 flex-wrap">
                <span className="text-[#b600a8]">$</span> ./deploy --target=portfolio
              </div>
              <h1
                className="hero-heading mono font-black uppercase tracking-tight leading-[0.95] whitespace-pre"
                style={{ fontSize: 'clamp(2.2rem, 11vw, 9rem)' }}
              >
                <Scrambled target={TARGET} duration={1700} />
              </h1>
              <div className="mono text-[10px] sm:text-xs text-[#8b92b0]">
                backend developer · iiit bhopal · est. 2024
              </div>
            </div>

            {/* bottom — boot log + module bars + progress */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-10">
              {/* boot log */}
              <div
                ref={logRef}
                className="mono text-[11px] sm:text-xs leading-[1.7] text-[#bbccd7] overflow-hidden max-h-[140px] sm:max-h-[160px]"
                style={{
                  maskImage:
                    'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
                  WebkitMaskImage:
                    'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
                }}
              >
                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-[#8b92b0]">{line.ts}</span>
                    <span
                      className={
                        line.status === 'ok' ? 'text-[#28c840]' : 'text-[#b600a8]'
                      }
                    >
                      {line.status === 'ok' ? '✓' : '›'}
                    </span>
                    <span className="truncate">{line.msg}</span>
                  </motion.div>
                ))}
              </div>

              {/* module bars */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {MODULES.map((m) => {
                  const w = Math.min(100, progress * m.speed);
                  return (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className="mono text-[10px] sm:text-xs uppercase tracking-widest text-[#8b92b0] w-10">
                        {m.name}
                      </span>
                      <div className="flex-1 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-150"
                          style={{
                            width: `${w}%`,
                            background: `linear-gradient(90deg, ${m.color}, ${m.color}80)`,
                            boxShadow: `0 0 8px ${m.color}66`,
                          }}
                        />
                      </div>
                      <span className="mono text-[10px] sm:text-xs text-[#bbccd7] tabular-nums w-9 text-right">
                        {Math.round(w)}%
                      </span>
                    </div>
                  );
                })}

                {/* master progress */}
                <div className="mt-2 sm:mt-3 flex items-end justify-between gap-3">
                  <div className="mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8b92b0]">
                    {progress < 100 ? 'deploying' : 'ready'}
                  </div>
                  <div
                    className="hero-heading mono font-black tabular-nums"
                    style={{ fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', lineHeight: 1 }}
                  >
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* exit curtain — vertical strips that slide up with stagger */}
          <div className="absolute inset-0 flex pointer-events-none">
            {Array.from({ length: STRIPS }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: '0%' }}
                exit={{ y: '-101%' }}
                transition={{
                  duration: 0.95,
                  delay: 0.35 + i * 0.06,
                  ease: [0.85, 0, 0.15, 1],
                }}
                className="flex-1 h-full"
                style={{
                  background:
                    i % 2 === 0
                      ? '#0c0c0c'
                      : 'linear-gradient(180deg, #0c0c0c 0%, #14111a 100%)',
                  borderRight:
                    i < STRIPS - 1 ? '1px solid rgba(215,226,234,0.04)' : 'none',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
