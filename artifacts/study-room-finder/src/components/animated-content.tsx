import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ReactBits Animated Content pattern: https://reactbits.dev/animations/animated-content
export function AnimatedContent({
  children,
  className,
  delay = 0,
  testId,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  testId?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      data-testid={testId}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}