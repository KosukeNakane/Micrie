// [App] app - AppRouter.tsx
// 役割: アプリ全体のセットアップ/プロバイダ
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { EditPage } from '@pages/edit';
import { PerformancePage } from '@pages/performance';
import { RecordingPage } from '@pages/recording';

const routeOrder: Record<string, number> = {
  '/recording': 0,
  '/edit': 1,
  '/performance': 2,
};

export const AppRouter = () => {
  const location = useLocation();
  const pathname = location.pathname in routeOrder ? location.pathname : '/recording';
  const currentIndex = routeOrder[pathname];
  const prevIndexRef = useRef<number>(currentIndex);

  // direction: 1 = forward (slide left), -1 = backward (slide right)
  const direction = useMemo(() => {
    const prev = prevIndexRef.current;
    return currentIndex > prev ? 1 : currentIndex < prev ? -1 : 0;
  }, [currentIndex]);

  useEffect(() => {
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  const variants = {
    enter: (dir: number) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0, position: 'absolute', top: 0, left: 0, right: 0 }),
    center: { x: 0, opacity: 1, position: 'relative', width: '100%' },
    exit: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0, position: 'absolute', top: 0, left: 0, right: 0 }),
  } as const;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.18, ease: 'easeInOut' }}
          style={{ width: '100%' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/recording" replace />} />
            <Route path="/recording" element={<RecordingPage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="/performance" element={<PerformancePage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
