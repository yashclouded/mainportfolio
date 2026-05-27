'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { useFluid } from '@/lib/FluidContext';

/**
 * Minimal cursor dot.
 * Lives OUTSIDE the blended content wrapper so it's not affected by
 * the invert+difference blend. It's just a clean red dot that fades
 * out as velocity increases.
 */
export default function Cursor() {
  const { subscribe } = useFluid();
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(pointer: coarse)').matches;
    }
    return false;
  });

  const springConfig = { damping: 25, stiffness: 250, mass: 0.4 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const cursorOpacity = useSpring(1, { damping: 20, stiffness: 100 });
  const cursorScale = useSpring(1, { damping: 15, stiffness: 120 });

  useEffect(() => {
    if (isTouch) return;

    const unsubscribe = subscribe((state) => {
      cursorX.set(state.pixelX);
      cursorY.set(state.pixelY);

      const normalizedSpeed = Math.min(state.speed / 4.0, 1.0);
      cursorOpacity.set(1.0 - normalizedSpeed * 0.7);
      cursorScale.set(1.0 - normalizedSpeed * 0.4);
    });

    return unsubscribe;
  }, [subscribe, cursorX, cursorY, cursorOpacity, cursorScale]);

  if (isTouch) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
      style={{
        x: cursorX,
        y: cursorY,
        opacity: cursorOpacity,
        scale: cursorScale,
        translateX: '-50%',
        translateY: '-50%',
        width: 6,
        height: 6,
        backgroundColor: '#FF3333',
      }}
    />
  );
}
