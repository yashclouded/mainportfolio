import * as THREE from 'three';

// ─── GLSL Shader Sources ───────────────────────────────────────────────────────

const baseVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Advect a field by a velocity field (semi-Lagrangian)
// IMPORTANT: velocity is in UV-space/second, so coord = vUv - vel * uDt
// (no texelSize multiplication — that was shrinking the effect by ~500x)
const advectShader = /* glsl */ `
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDt;
uniform float uDissipation;
varying vec2 vUv;

void main() {
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vec2 coord = vUv - vel * uDt;
  gl_FragColor = uDissipation * texture2D(uSource, coord);
}
`;

// Jacobi pressure solver iteration
const pressureShader = /* glsl */ `
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}
`;

// Compute divergence of velocity field
const divergenceShader = /* glsl */ `
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
`;

// Subtract pressure gradient from velocity (projection step)
const gradientSubtractShader = /* glsl */ `
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B) * 0.5;
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

// Splat: add a Gaussian blob to a field
const splatShader = /* glsl */ `
precision highp float;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
uniform float uAspect;
varying vec2 vUv;

void main() {
  vec2 p = vUv;
  p.x *= uAspect;
  vec2 pt = uPoint;
  pt.x *= uAspect;
  float d = distance(p, pt);
  float falloff = exp(-d * d / (uRadius * uRadius));
  vec4 base = texture2D(uTarget, vUv);
  gl_FragColor = vec4(base.rgb + uColor * falloff, 1.0);
}
`;

// Clear a render target to a value
const clearShader = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform float uValue;
varying vec2 vUv;

void main() {
  gl_FragColor = uValue * texture2D(uTexture, vUv);
}
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function createFBO(width: number, height: number, type: THREE.TextureDataType) {
  const rt = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type,
    depthBuffer: false,
    stencilBuffer: false,
  });
  return rt;
}

interface DoubleFBO {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap: () => void;
}

function createDoubleFBO(width: number, height: number, type: THREE.TextureDataType): DoubleFBO {
  let fbo1 = createFBO(width, height, type);
  let fbo2 = createFBO(width, height, type);
  return {
    get read() { return fbo1; },
    get write() { return fbo2; },
    swap() {
      const tmp = fbo1;
      fbo1 = fbo2;
      fbo2 = tmp;
    },
  };
}

function createShaderMaterial(fragmentShader: string, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: baseVertexShader,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
}

// ─── FluidSimulation Class ─────────────────────────────────────────────────────

export interface FluidConfig {
  simScale: number;
  pressureIterations: number;
  velocityDissipation: number;
  densityDissipation: number;
  splatForce: number;
  splatRadiusMin: number;
  splatRadiusMax: number;
}

const DEFAULT_CONFIG: FluidConfig = {
  simScale: 3,
  pressureIterations: 20,
  velocityDissipation: 0.97,
  densityDissipation: 0.975,
  splatForce: 800,
  splatRadiusMin: 0.025,
  splatRadiusMax: 0.15,
};

export class FluidSimulation {
  private renderer: THREE.WebGLRenderer;
  public config: FluidConfig;

  private simWidth: number;
  private simHeight: number;
  private aspect: number;
  private texelSize: THREE.Vector2;

  private velocity: DoubleFBO;
  private pressure: DoubleFBO;
  private density: DoubleFBO;
  private divergenceFBO: THREE.WebGLRenderTarget;

  private quad: THREE.Mesh;
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  private advectMat: THREE.ShaderMaterial;
  private divergenceMat: THREE.ShaderMaterial;
  private pressureMat: THREE.ShaderMaterial;
  private gradSubMat: THREE.ShaderMaterial;
  private splatMat: THREE.ShaderMaterial;
  private clearMat: THREE.ShaderMaterial;

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number, config?: Partial<FluidConfig>) {
    this.renderer = renderer;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.simWidth = Math.floor(width / this.config.simScale);
    this.simHeight = Math.floor(height / this.config.simScale);
    this.aspect = width / height;
    this.texelSize = new THREE.Vector2(1.0 / this.simWidth, 1.0 / this.simHeight);

    const texType = THREE.HalfFloatType;

    this.velocity = createDoubleFBO(this.simWidth, this.simHeight, texType);
    this.pressure = createDoubleFBO(this.simWidth, this.simHeight, texType);
    this.density = createDoubleFBO(this.simWidth, this.simHeight, texType);
    this.divergenceFBO = createFBO(this.simWidth, this.simHeight, texType);

    // Fullscreen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geom = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geom);
    this.scene.add(this.quad);

    // Advection material — no texelSize needed (velocity is in UV-space/sec)
    this.advectMat = createShaderMaterial(advectShader, {
      uVelocity: { value: null },
      uSource: { value: null },
      uDt: { value: 0.016 },
      uDissipation: { value: this.config.velocityDissipation },
    });

    this.divergenceMat = createShaderMaterial(divergenceShader, {
      uVelocity: { value: null },
      uTexelSize: { value: this.texelSize },
    });

    this.pressureMat = createShaderMaterial(pressureShader, {
      uPressure: { value: null },
      uDivergence: { value: null },
      uTexelSize: { value: this.texelSize },
    });

    this.gradSubMat = createShaderMaterial(gradientSubtractShader, {
      uPressure: { value: null },
      uVelocity: { value: null },
      uTexelSize: { value: this.texelSize },
    });

    this.splatMat = createShaderMaterial(splatShader, {
      uTarget: { value: null },
      uPoint: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Vector3(0, 0, 0) },
      uRadius: { value: 0.04 },
      uAspect: { value: this.aspect },
    });

    this.clearMat = createShaderMaterial(clearShader, {
      uTexture: { value: null },
      uValue: { value: 0.8 },
    });
  }

  private renderPass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.quad.material = material;
    const oldRT = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(oldRT);
  }

  resize(width: number, height: number) {
    this.simWidth = Math.floor(width / this.config.simScale);
    this.simHeight = Math.floor(height / this.config.simScale);
    this.aspect = width / height;
    this.texelSize.set(1.0 / this.simWidth, 1.0 / this.simHeight);

    this.velocity.read.setSize(this.simWidth, this.simHeight);
    this.velocity.write.setSize(this.simWidth, this.simHeight);
    this.pressure.read.setSize(this.simWidth, this.simHeight);
    this.pressure.write.setSize(this.simWidth, this.simHeight);
    this.density.read.setSize(this.simWidth, this.simHeight);
    this.density.write.setSize(this.simWidth, this.simHeight);
    this.divergenceFBO.setSize(this.simWidth, this.simHeight);

    this.splatMat.uniforms.uAspect.value = this.aspect;
  }

  /** Inject a velocity + density splat at a point */
  splat(x: number, y: number, dx: number, dy: number, radius: number) {
    // Velocity splat
    this.splatMat.uniforms.uTarget.value = this.velocity.read.texture;
    this.splatMat.uniforms.uPoint.value.set(x, y);
    this.splatMat.uniforms.uColor.value.set(dx * this.config.splatForce, dy * this.config.splatForce, 0);
    this.splatMat.uniforms.uRadius.value = radius;
    this.renderPass(this.splatMat, this.velocity.write);
    this.velocity.swap();

    // Density splat (inject into .r channel)
    this.splatMat.uniforms.uTarget.value = this.density.read.texture;
    this.splatMat.uniforms.uColor.value.set(1.5, 0.0, 0.0);
    this.splatMat.uniforms.uRadius.value = radius * 0.85;
    this.renderPass(this.splatMat, this.density.write);
    this.density.swap();
  }

  /** Step the simulation forward one frame */
  step(dt: number) {
    // 1. Advect velocity
    this.advectMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this.advectMat.uniforms.uSource.value = this.velocity.read.texture;
    this.advectMat.uniforms.uDt.value = dt;
    this.advectMat.uniforms.uDissipation.value = this.config.velocityDissipation;
    this.renderPass(this.advectMat, this.velocity.write);
    this.velocity.swap();

    // 2. Compute divergence
    this.divergenceMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this.renderPass(this.divergenceMat, this.divergenceFBO);

    // 3. Clear pressure
    this.clearMat.uniforms.uTexture.value = this.pressure.read.texture;
    this.clearMat.uniforms.uValue.value = 0.8;
    this.renderPass(this.clearMat, this.pressure.write);
    this.pressure.swap();

    // 4. Jacobi pressure solve
    this.pressureMat.uniforms.uDivergence.value = this.divergenceFBO.texture;
    for (let i = 0; i < this.config.pressureIterations; i++) {
      this.pressureMat.uniforms.uPressure.value = this.pressure.read.texture;
      this.renderPass(this.pressureMat, this.pressure.write);
      this.pressure.swap();
    }

    // 5. Gradient subtract (project)
    this.gradSubMat.uniforms.uPressure.value = this.pressure.read.texture;
    this.gradSubMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this.renderPass(this.gradSubMat, this.velocity.write);
    this.velocity.swap();

    // 6. Advect density
    this.advectMat.uniforms.uVelocity.value = this.velocity.read.texture;
    this.advectMat.uniforms.uSource.value = this.density.read.texture;
    this.advectMat.uniforms.uDt.value = dt;
    this.advectMat.uniforms.uDissipation.value = this.config.densityDissipation;
    this.renderPass(this.advectMat, this.density.write);
    this.density.swap();
  }

  getDensityTexture(): THREE.Texture {
    return this.density.read.texture;
  }

  getVelocityTexture(): THREE.Texture {
    return this.velocity.read.texture;
  }

  dispose() {
    this.velocity.read.dispose();
    this.velocity.write.dispose();
    this.pressure.read.dispose();
    this.pressure.write.dispose();
    this.density.read.dispose();
    this.density.write.dispose();
    this.divergenceFBO.dispose();
    this.advectMat.dispose();
    this.divergenceMat.dispose();
    this.pressureMat.dispose();
    this.gradSubMat.dispose();
    this.splatMat.dispose();
    this.clearMat.dispose();
    (this.quad.geometry as THREE.BufferGeometry).dispose();
  }
}
