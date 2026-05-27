'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

export interface FluidState {
  /** Normalized mouse X (0–1) */
  mouseX: number;
  /** Normalized mouse Y (0–1, bottom=0 top=1 for GL) */
  mouseY: number;
  /** Raw pixel position */
  pixelX: number;
  pixelY: number;
  /** Velocity in normalized coords per frame */
  velocityX: number;
  velocityY: number;
  /** Scalar speed (smoothed) */
  speed: number;
  /** Vertical scroll velocity (normalized) */
  scrollVelocity: number;
  /** Whether the mouse has entered the window */
  active: boolean;
}

const defaultState: FluidState = {
  mouseX: 0.5,
  mouseY: 0.5,
  pixelX: 0,
  pixelY: 0,
  velocityX: 0,
  velocityY: 0,
  speed: 0,
  scrollVelocity: 0,
  active: false,
};

// Use a mutable ref-based approach so consumers get values without re-renders.
// Components that need reactivity can subscribe via the onChange callback.
type FluidListener = (state: FluidState) => void;

interface FluidContextValue {
  getState: () => FluidState;
  subscribe: (listener: FluidListener) => () => void;
}

const FluidContext = createContext<FluidContextValue | null>(null);

export function FluidProvider({ children }: { children: React.ReactNode }) {
  const stateRef = useRef<FluidState>({ ...defaultState });
  const listenersRef = useRef<Set<FluidListener>>(new Set());
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });
  const lastScrollRef = useRef({ y: 0, time: 0 });
  const smoothSpeedRef = useRef(0);
  const smoothScrollVelRef = useRef(0);
  const rafIdRef = useRef(0);

  const notify = useCallback(() => {
    const s = stateRef.current;
    listenersRef.current.forEach(fn => fn(s));
  }, []);

  useEffect(() => {
    let animating = true;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(now - lastMouseRef.current.time, 1);

      const nx = e.clientX / window.innerWidth;
      const ny = 1.0 - e.clientY / window.innerHeight;

      const dx = nx - lastMouseRef.current.x;
      const dy = ny - lastMouseRef.current.y;

      // Velocity is normalized coords per millisecond, scaled up for usability
      const vx = (dx / dt) * 1000;
      const vy = (dy / dt) * 1000;
      const rawSpeed = Math.sqrt(vx * vx + vy * vy);

      // Exponential smoothing
      smoothSpeedRef.current += (rawSpeed - smoothSpeedRef.current) * 0.3;

      stateRef.current = {
        ...stateRef.current,
        mouseX: nx,
        mouseY: ny,
        pixelX: e.clientX,
        pixelY: e.clientY,
        velocityX: vx,
        velocityY: vy,
        speed: smoothSpeedRef.current,
        active: true,
      };

      lastMouseRef.current = { x: nx, y: ny, time: now };
    };

    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = Math.max(now - lastScrollRef.current.time, 1);
      const dy = (currentY - lastScrollRef.current.y) / window.innerHeight;
      const scrollVel = (dy / dt) * 1000;

      smoothScrollVelRef.current += (scrollVel - smoothScrollVelRef.current) * 0.2;
      stateRef.current = {
        ...stateRef.current,
        scrollVelocity: smoothScrollVelRef.current,
      };

      lastScrollRef.current = { y: currentY, time: now };
    };

    // Decay loop — smoothly reduce velocity/speed when idle
    const tick = () => {
      if (!animating) return;

      // Decay speed
      smoothSpeedRef.current *= 0.92;
      smoothScrollVelRef.current *= 0.9;

      if (smoothSpeedRef.current < 0.001) smoothSpeedRef.current = 0;
      if (Math.abs(smoothScrollVelRef.current) < 0.001) smoothScrollVelRef.current = 0;

      stateRef.current = {
        ...stateRef.current,
        speed: smoothSpeedRef.current,
        scrollVelocity: smoothScrollVelRef.current,
      };

      notify();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      animating = false;
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [notify]);

  const contextValue: FluidContextValue = {
    getState: () => stateRef.current,
    subscribe: (listener: FluidListener) => {
      listenersRef.current.add(listener);
      return () => { listenersRef.current.delete(listener); };
    },
  };

  return (
    <FluidContext.Provider value={contextValue}>
      {children}
    </FluidContext.Provider>
  );
}

export function useFluid(): FluidContextValue {
  const ctx = useContext(FluidContext);
  if (!ctx) throw new Error('useFluid must be used within FluidProvider');
  return ctx;
}
