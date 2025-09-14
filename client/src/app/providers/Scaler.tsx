import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PortalRootProvider } from './PortalRootContext';

export const BASE_W = 1440;
export const BASE_H = 1024;

type ScalerCtx = { scale: number; baseW: number; baseH: number };
const ScalerContext = createContext<ScalerCtx>({ scale: 1, baseW: BASE_W, baseH: BASE_H });
export const useScaler = () => useContext(ScalerContext);

export const Scaler = ({ children }: { children: React.ReactNode }) => {
  const [scale, setScale] = useState(1);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  const recalc = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = Math.min(vw / BASE_W, vh / BASE_H);
    setScale(s);
  };

  useLayoutEffect(() => {
    recalc();
  }, []);

  useEffect(() => {
    let af = 0;
    const onResize = () => {
      if (af) cancelAnimationFrame(af);
      af = requestAnimationFrame(recalc);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (af) cancelAnimationFrame(af); };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' }}>
      <ScalerContext.Provider value={{ scale, baseW: BASE_W, baseH: BASE_H }}>
        <div
          style={{
            position: 'relative',
            width: BASE_W,
            height: BASE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <PortalRootProvider root={portalRootRef.current}>
            {children}
            {/* Scaled portal root */}
            <div ref={portalRootRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          </PortalRootProvider>
        </div>
      </ScalerContext.Provider>
    </div>
  );
};
