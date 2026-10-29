'use client';

import { motion } from 'framer-motion';

// Fades and slides an element in the first time it scrolls into view.
// Pass `delay` (seconds) to stagger siblings. Reduced-motion users get a plain fade (see Shell).
export default function Reveal({ as = 'div', delay = 0, y = 28, x = 0, className, children, ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
