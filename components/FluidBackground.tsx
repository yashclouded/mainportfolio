'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useFluid } from '@/lib/FluidContext';
import { FluidSimulation } from '@/lib/FluidSimulation';

// ─── Composite Fragment Shader ─────────────────────────────────────────────────
// Reads density + velocity textures and renders the liquid membrane with:
// - Velocity-based UV refraction (colors swim and bend)
// - Chromatic refraction (per-channel UV offset at edges)
// - Organic noise-perturbed boundaries
// - Warm color ramp: white → amber → crimson → charcoal
// - Film grain + subtle hue drift

const compositeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const compositeFragment = /* glsl */ `
precision highp float;

uniform sampler2D uDensity;
uniform sampler2D uVelocity;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x_) - 0.5;
  vec3 ox = floor(x_ + 0.5);
  vec3 a0 = x_ - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Film grain
float grain(vec2 uv, float time) {
  return fract(sin(dot(uv * time, vec2(12.9898, 78.233))) * 43758.5453);
}

// HSL to RGB
vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
  float m = l - c * 0.5;
  vec3 rgb;
  if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
  else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
  else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
  else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
  else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
  else rgb = vec3(c, 0.0, x);
  return rgb + m;
}

void main() {
  vec2 uv = vUv;

  // ── Velocity-based refraction ──
  // Sample velocity field and use it to offset UV when reading density
  // This makes the density pattern shimmer and bend as fluid flows
  vec2 vel = texture2D(uVelocity, uv).xy;
  float velMag = length(vel);

  // Refraction offset proportional to velocity
  vec2 refractionOffset = vel * 0.004;

  // ── Chromatic refraction: per-channel UV offset ──
  // Each color channel samples density at a slightly different UV,
  // creating subtle color fringing at fluid edges
  float densityR = texture2D(uDensity, uv + refractionOffset * 1.3).r;
  float densityG = texture2D(uDensity, uv + refractionOffset * 0.7).r;
  float densityB = texture2D(uDensity, uv + refractionOffset * 0.2).r;

  // Primary density for shape
  float density = (densityR + densityG + densityB) / 3.0;

  // ── Organic noise at membrane edges ──
  float edgeNoise = snoise(uv * 14.0 + uTime * 0.6) * 0.06;
  float noise2 = snoise(uv * 28.0 - uTime * 1.0) * 0.03;
  density += edgeNoise * smoothstep(0.05, 0.4, density) + noise2 * density;
  density = clamp(density, 0.0, 1.0);

  // Edge factor — peaks at boundaries for refraction emphasis
  float edgeFactor = smoothstep(0.05, 0.25, density) * (1.0 - smoothstep(0.3, 0.6, density));

  // Add noise-based UV wobble at edges (liquid refraction)
  vec2 edgeWobble = vec2(
    snoise(uv * 20.0 + uTime * 1.5),
    snoise(uv * 20.0 + uTime * 1.5 + 100.0)
  ) * edgeFactor * 0.008;
  
  // Re-sample density with edge wobble for organic boundary
  density = texture2D(uDensity, uv + refractionOffset + edgeWobble).r;
  density += edgeNoise * smoothstep(0.05, 0.4, density);
  density = clamp(density, 0.0, 1.0);

  // Smooth threshold for membrane feel
  float membraneDensity = smoothstep(0.03, 0.45, density);

  // ── Slow hue drift ──
  float hueDrift = sin(uTime * 0.06) * 0.012;

  // ── Color palette ──
  vec3 white = vec3(1.0);
  vec3 amber = hsl2rgb(0.083 + hueDrift, 0.75, 0.55);
  vec3 crimson = hsl2rgb(0.972 + hueDrift, 0.78, 0.30);
  vec3 charcoal = hsl2rgb(0.0 + hueDrift * 2.0, 0.32, 0.07);
  vec3 deepBlue = hsl2rgb(0.6 + hueDrift, 0.45, 0.18);

  // ── Composite color ramp ──
  vec3 color = white;
  color = mix(color, amber, smoothstep(0.0, 0.20, membraneDensity));
  color = mix(color, crimson, smoothstep(0.15, 0.50, membraneDensity));
  color = mix(color, charcoal, smoothstep(0.45, 0.80, membraneDensity));
  color = mix(color, deepBlue, smoothstep(0.82, 1.0, membraneDensity) * 0.35);

  // ── Chromatic fringing at edges ──
  // Use per-channel density differences to add subtle color separation
  float chromaR = smoothstep(0.03, 0.45, densityR);
  float chromaB = smoothstep(0.03, 0.45, densityB);
  float chromaDiff = (chromaR - chromaB) * edgeFactor;
  color.r += chromaDiff * 0.12;
  color.b -= chromaDiff * 0.08;

  // ── Film grain ──
  float g = grain(uv * uResolution, uTime * 4.1 + 1.0);
  color += (g - 0.5) * 0.015;

  // ── Vignette ──
  float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5) * 1.4);
  color *= 0.97 + 0.03 * vignette;

  gl_FragColor = vec4(color, 1.0);
}
`;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getState } = useFluid();
  const simRef = useRef<FluidSimulation | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const compositeRef = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const animFrameRef = useRef(0);
  const lastSplatRef = useRef({ x: 0.5, y: 0.5, time: 0 });
  const isMobileRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile / reduced-motion fallback
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 768;
    if (isCoarse || isSmallScreen) {
      isMobileRef.current = true;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isMobileRef.current = true;
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClear = false;
    rendererRef.current = renderer;

    // Fluid simulation — bigger, smoother
    const sim = new FluidSimulation(renderer, width, height, {
      simScale: 3,
      pressureIterations: 20,
      velocityDissipation: 0.97,
      densityDissipation: 0.975,
      splatForce: 800,
      splatRadiusMin: 0.025,
      splatRadiusMax: 0.15,
    });
    simRef.current = sim;

    // Composite scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sceneRef.current = scene;
    cameraRef.current = camera;

    const compositeMat = new THREE.ShaderMaterial({
      vertexShader: compositeVertex,
      fragmentShader: compositeFragment,
      uniforms: {
        uDensity: { value: null },
        uVelocity: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      depthTest: false,
      depthWrite: false,
    });
    compositeRef.current = compositeMat;

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compositeMat);
    scene.add(quad);

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      sim.resize(w, h);
      compositeMat.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let lastTime = performance.now();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const state = getState();

      // ── Inject cursor splats ──
      if (state.active && state.speed > 0.02) {
        const speed = Math.min(state.speed, 10.0);
        const normalizedSpeed = speed / 10.0;

        // Radius grows with velocity — physically larger disturbance when fast
        const radius = sim.config.splatRadiusMin +
          normalizedSpeed * (sim.config.splatRadiusMax - sim.config.splatRadiusMin);

        // Only splat if cursor moved
        const dx = state.mouseX - lastSplatRef.current.x;
        const dy = state.mouseY - lastSplatRef.current.y;
        const splatDist = Math.sqrt(dx * dx + dy * dy);

        if (splatDist > 0.0005) {
          // Velocity multiplier tuned for the new splatForce (800) and no-texelSize advection
          sim.splat(
            state.mouseX,
            state.mouseY,
            state.velocityX * 0.0008,
            state.velocityY * 0.0008,
            radius
          );
          lastSplatRef.current = { x: state.mouseX, y: state.mouseY, time: now };
        }
      }

      // Step simulation

      sim.step(dt);

      // Render composite — pass both density and velocity for refraction
      compositeMat.uniforms.uDensity.value = sim.getDensityTexture();
      compositeMat.uniforms.uVelocity.value = sim.getVelocityTexture();
      compositeMat.uniforms.uTime.value += dt;

      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
    };

    animate();

    (canvas as any).__fluidCleanup = () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      sim.dispose();
      renderer.dispose();
      compositeMat.dispose();
    };
  }, [getState]);

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas && (canvas as any).__fluidCleanup) {
        (canvas as any).__fluidCleanup();
      }
    };
  }, [init]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      />
      <div
        className="fixed inset-0 pointer-events-none block md:hidden"
        style={{ zIndex: -1, background: 'white' }}
      />
    </>
  );
}
