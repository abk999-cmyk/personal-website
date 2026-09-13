"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute vec3 aSphere;
  attribute vec3 aGrid;
  attribute float aSeed;
  varying float vF;
  varying float vDepth;
  varying float vSeed;

  void main() {
    float m = smoothstep(0.0, 1.0, uMorph);
    vec3 p = mix(aSphere, aGrid, m);
    p += 0.06 * vec3(
      sin(uTime * 0.70 + aSeed * 6.2831),
      cos(uTime * 0.55 + aSeed * 3.1416),
      sin(uTime * 0.45 + aSeed * 9.4248)
    );
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vec2 d = wp.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(1.25, 0.0, dist);
    wp.xy += normalize(d + vec2(1e-4)) * f * 0.45;
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + f * 1.8) * (6.0 / -mv.z);
    vF = f;
    vDepth = -mv.z;
    vSeed = aSeed;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vF;
  varying float vDepth;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.12, r);
    float depthFade = smoothstep(10.5, 4.0, vDepth);
    float lime = clamp(vF * 1.4 + step(0.955, vSeed) * 0.8, 0.0, 1.0);
    vec3 col = mix(uColorB, uColorA, lime);
    gl_FragColor = vec4(col, a * (0.22 + 0.55 * depthFade));
  }
`;

function makeGeometry(count: number) {
  const sphere = new Float32Array(count * 3);
  const grid = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const cols = Math.ceil(Math.sqrt(count * 1.7));
  const rows = Math.ceil(count / cols);
  const golden = Math.PI * (3 - Math.sqrt(5));
  let s = 1337;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 2.15 + (rnd() - 0.5) * 0.18;
    sphere[i * 3] = Math.cos(th) * r * R;
    sphere[i * 3 + 1] = y * R;
    sphere[i * 3 + 2] = Math.sin(th) * r * R;

    const cx = i % cols;
    const cy = Math.floor(i / cols);
    const gx = (cx / (cols - 1) - 0.5) * 8.5;
    const gz = (cy / (rows - 1) - 0.5) * 5.5;
    grid[i * 3] = gx;
    grid[i * 3 + 1] = -1.1 + Math.sin(gx * 1.25) * 0.28 + Math.cos(gz * 1.6) * 0.22;
    grid[i * 3 + 2] = gz;
    seed[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(sphere, 3));
  g.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
  g.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  return g;
}

function Field({ count, onReady }: { count: number; onReady: () => void }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ mx: 99, my: 99 });
  const { viewport, gl } = useThree();
  const geometry = useMemo(() => makeGeometry(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uMouse: { value: new THREE.Vector2(99, 99) },
          uPixelRatio: { value: 1 },
          uSize: { value: 2.1 },
          uColorA: { value: new THREE.Color("#d4ff3a") },
          uColorB: { value: new THREE.Color("#8d93a8") },
        },
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    const onMove = (e: PointerEvent) => {
      target.current.mx = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      target.current.mx = 99;
      target.current.my = 99;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    onReady();
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      geometry.dispose();
      material.dispose();
    };
  }, [gl, geometry, material, onReady]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const u = material.uniforms;
    u.uTime.value += d;
    const progress = window.scrollY / Math.max(1, window.innerHeight);
    const morphT = THREE.MathUtils.clamp(progress * 1.35, 0, 1);
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, morphT, 4, d);

    const far = target.current.mx > 50;
    const wx = far ? 99 : (target.current.mx * viewport.width) / 2;
    const wy = far ? 99 : (target.current.my * viewport.height) / 2;
    const m = u.uMouse.value as THREE.Vector2;
    m.x = THREE.MathUtils.damp(m.x, wx, 7, d);
    m.y = THREE.MathUtils.damp(m.y, wy, 7, d);

    if (group.current) {
      group.current.rotation.y += d * 0.07;
      const tiltT = far ? 0 : target.current.my * 0.12;
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tiltT, 3, d);
      const narrow = viewport.aspect < 1;
      const tx = narrow ? 0 : viewport.width * 0.21;
      const ty = narrow ? 1.1 : 0.5;
      const sc = narrow ? Math.max(0.6, viewport.width / 6.5) : 1;
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, tx, 4, d);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, ty, 4, d);
      group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, sc, 4, d));
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

/** Interactive particle field for the hero. Morphs from a sphere into a data surface as you scroll. */
export function LatentField() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const count = typeof window !== "undefined" && window.innerWidth < 768 ? 9000 : 22000;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      className="absolute inset-0 transition-opacity duration-1000 ease-out"
      style={{ opacity: ready ? 1 : 0, pointerEvents: "none" }}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
        camera={{ position: [0, 0, 6.6], fov: 42, near: 0.1, far: 40 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Field count={count} onReady={() => setReady(true)} />
      </Canvas>
    </div>
  );
}
