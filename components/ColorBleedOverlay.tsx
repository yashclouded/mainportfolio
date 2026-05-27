'use client';

import { useEffect, useRef } from 'react';
import { useFluid } from '@/lib/FluidContext';

/**
 * A full-viewport overlay with `mix-blend-mode: screen` that creates
 * a warm-colored radial glow following the cursor.
 *
 * How it works:
 * - The overlay is positioned above all content, pointer-events: none
 * - A radial gradient centered on the cursor goes from warm color → black
 * - `screen` blend mode: black = no change, color = lightens/colorizes
 *
 * Effect on page elements:
 * - White background: screen(white, anything) = white → no visible change ✓
 * - Black text: screen(black, crimson) = crimson → text turns warm-colored ✓
 * - Gray text: screen(gray, crimson) = lighter warm → subtle color shift ✓
 * - Dark fluid bg: screen(dark, crimson) = brighter → enhances reveal ✓
 *
 * The radius grows with cursor velocity, so:
 * - Slow movement → small, subtle text coloring
 * - Fast movement → large dramatic color spill across text
 */
export default function ColorBleedOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useFluid();

  useEffect(() => {
    // Skip on touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const unsubscribe = subscribe((state) => {
      const el = overlayRef.current;
      if (!el) return;

      const speed = Math.min(state.speed, 8.0);
      const normalizedSpeed = speed / 8.0;

      // Radius: 60px idle → 280px at full speed
      const radius = 60 + normalizedSpeed * 220;

      // Intensity: subtle at idle, strong when fast
      const intensity = 0.1 + normalizedSpeed * 0.75;

      // Cursor position in viewport pixels
      const x = state.pixelX;
      const y = state.pixelY;

      // Warm color: shifts from deep crimson to brighter amber with velocity
      const r = Math.round(170 + normalizedSpeed * 50);  // 170 → 220
      const g = Math.round(30 + normalizedSpeed * 60);   // 30 → 90
      const b = Math.round(25 + normalizedSpeed * 15);   // 25 → 40

      el.style.background = `radial-gradient(
        circle ${radius}px at ${x}px ${y}px,
        rgba(${r}, ${g}, ${b}, ${intensity}) 0%,
        rgba(${Math.round(r * 0.7)}, ${Math.round(g * 0.5)}, ${Math.round(b * 0.4)}, ${(intensity * 0.4).toFixed(3)}) 45%,
        rgba(0, 0, 0, 0) 100%
      )`;
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        willChange: 'background',
      }}
    />
  );
}
