'use client';

import { MotionConfig } from 'framer-motion';
import { usePortfolio } from '@/context/PortfolioContext';

// Fades the page in once content has loaded from the database, so visitors never see stale defaults flash.
// reducedMotion="user" turns movement off for people who set "reduce motion" in their OS.
export default function Shell({ children }) {
  const { dataReady } = usePortfolio();
  return (
    <MotionConfig reducedMotion="user">
      <main className={`transition-opacity duration-500 ${dataReady ? 'opacity-100' : 'opacity-0'}`}>{children}</main>
    </MotionConfig>
  );
}
