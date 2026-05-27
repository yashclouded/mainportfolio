'use client';

import { useEffect, useRef } from 'react';
import { useFluid } from '@/lib/FluidContext';

/**
 * SVG filter for Apple-water-like text refraction.
 * 
 * Tuned for smooth, large-scale distortion (not noisy/glitchy):
 * - 2 octaves (smoother noise, less graininess)
 * - Lower base frequency (larger-scale waves)
 * - Moderate displacement (up to 12px — enough to see, not enough to break)
 * - Soft directional chromatic aberration
 * - Subtle Gaussian blur for refractive diffusion
 *
 * Applied to large headings via style={{ filter: 'url(#liquid-text)' }}
 * or via the content wrapper for global liquid feel.
 */
export default function TextLiquidFilter() {
  const { subscribe } = useFluid();

  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const redOffsetRef = useRef<SVGFEOffsetElement>(null);
  const blueOffsetRef = useRef<SVGFEOffsetElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);

  useEffect(() => {
    const unsubscribe = subscribe((state) => {
      const speed = state.speed;
      const clampedSpeed = Math.min(speed, 5.0);
      const normalizedSpeed = clampedSpeed / 5.0;

      // Turbulence: low frequency for smooth, large-scale water waves
      if (turbulenceRef.current) {
        const freq = 0.005 + normalizedSpeed * 0.025;
        turbulenceRef.current.setAttribute('baseFrequency', `${freq.toFixed(4)}`);
      }

      // Displacement: smooth ramp, capped at 12px for elegance
      if (displacementRef.current) {
        const scale = normalizedSpeed * 12.0;
        displacementRef.current.setAttribute('scale', scale.toFixed(2));
      }

      // Directional chromatic aberration — subtle, follows cursor direction
      if (redOffsetRef.current && blueOffsetRef.current) {
        const dirX = state.velocityX;
        const dirY = state.velocityY;
        const mag = Math.sqrt(dirX * dirX + dirY * dirY);
        const ndx = mag > 0.01 ? dirX / mag : 0;
        const ndy = mag > 0.01 ? dirY / mag : 0;

        // Reduced offsets for Apple-like subtlety
        const redDx = ndx * normalizedSpeed * 1.8;
        const redDy = ndy * normalizedSpeed * 1.8;
        redOffsetRef.current.setAttribute('dx', redDx.toFixed(2));
        redOffsetRef.current.setAttribute('dy', redDy.toFixed(2));

        const blueDx = -ndx * normalizedSpeed * 1.2;
        const blueDy = -ndy * normalizedSpeed * 1.2;
        blueOffsetRef.current.setAttribute('dx', blueDx.toFixed(2));
        blueOffsetRef.current.setAttribute('dy', blueDy.toFixed(2));
      }

      // Subtle Gaussian blur for refractive diffusion
      if (blurRef.current) {
        const blurAmount = normalizedSpeed * 0.5;
        blurRef.current.setAttribute('stdDeviation', blurAmount.toFixed(2));
      }

      // Color matrix — subtle warm shift
      if (colorMatrixRef.current) {
        const intensity = normalizedSpeed * 0.2;
        const matrix = [
          1 + intensity * 0.25, 0, 0, 0, intensity * 0.04,
          0, 1 - intensity * 0.15, 0, 0, 0,
          0, 0, 1 - intensity * 0.2, 0, 0,
          0, 0, 0, 1, 0,
        ].join(' ');
        colorMatrixRef.current.setAttribute('values', matrix);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <svg
      className="fixed pointer-events-none"
      style={{ width: 0, height: 0, position: 'absolute' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="liquid-text" x="-15%" y="-15%" width="130%" height="130%">
          {/* Smooth organic noise — 2 octaves for large-scale water-like waves */}
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.005"
            numOctaves="2"
            seed="3"
            result="noise"
          />

          {/* Displacement — smooth water-like warp */}
          <feDisplacementMap
            ref={displacementRef}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* Subtle Gaussian blur for refractive softness */}
          <feGaussianBlur
            ref={blurRef}
            in="displaced"
            stdDeviation="0"
            result="blurred"
          />

          {/* Channel separation for chromatic aberration */}
          <feColorMatrix
            in="blurred"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="redChannel"
          />
          <feOffset
            ref={redOffsetRef}
            in="redChannel"
            dx="0"
            dy="0"
            result="redShifted"
          />

          <feColorMatrix
            in="blurred"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="greenChannel"
          />

          <feColorMatrix
            in="blurred"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="blueChannel"
          />
          <feOffset
            ref={blueOffsetRef}
            in="blueChannel"
            dx="0"
            dy="0"
            result="blueShifted"
          />

          {/* Recombine channels */}
          <feMerge result="recombined">
            <feMergeNode in="redShifted" />
            <feMergeNode in="greenChannel" />
            <feMergeNode in="blueShifted" />
          </feMerge>

          {/* Final warm color shift */}
          <feColorMatrix
            ref={colorMatrixRef}
            in="recombined"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
