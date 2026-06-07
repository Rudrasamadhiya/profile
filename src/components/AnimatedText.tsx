import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  // Split into words first so wrapping never breaks mid-word, then into chars.
  const words = text.split(' ');
  let charIndex = 0;
  const total = text.length;

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => {
        const chars = word.split('');
        const node = (
          <span key={`w-${wi}`} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {chars.map((char) => {
              const start = charIndex / total;
              const end = (charIndex + 1) / total;
              charIndex += 1;
              return (
                <Char
                  key={`c-${charIndex}`}
                  char={char}
                  start={start}
                  end={end}
                  progress={scrollYProgress}
                />
              );
            })}
          </span>
        );
        // advance index past the space that follows the word (except for the last word)
        if (wi < words.length - 1) charIndex += 1;
        return (
          <span key={`grp-${wi}`}>
            {node}
            {wi < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </p>
  );
}

function Char({
  char,
  start,
  end,
  progress,
}: {
  char: string;
  start: number;
  end: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}
