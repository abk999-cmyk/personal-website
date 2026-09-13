"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { skillGroups, skillEdges } from "@/content/skills";
import { useReducedMotionPref } from "@/lib/use-reduced-motion";

type Node = { id: string; group: string; pos: THREE.Vector3 };

function mulberry(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layout() {
  const rnd = mulberry(42);
  const centers: Record<string, THREE.Vector3> = {};
  const golden = Math.PI * (3 - Math.sqrt(5));
  skillGroups.forEach((g, i) => {
    const y = 1 - (i / (skillGroups.length - 1)) * 2 * 0.7;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i + 0.8;
    centers[g.id] = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(2.2);
  });
  const nodes: Node[] = [];
  for (const g of skillGroups) {
    const c = centers[g.id];
    g.skills.forEach((s, j) => {
      const n = g.skills.length;
      const phi = Math.acos(1 - (2 * (j + 0.5)) / n);
      const theta = golden * j;
      const rad = 0.75 + rnd() * 0.45;
      const off = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(rad);
      nodes.push({ id: s, group: g.id, pos: c.clone().add(off) });
    });
  }
  return { centers, nodes };
}

const NODE = new THREE.Color("#b8b8c0");
const NODE_DIM = new THREE.Color("#4a4a52");
const ACCENT = new THREE.Color("#d4ff3a");

function Scene({ active, onActive, reduce }: { active: string | null; onActive: (g: string | null) => void; reduce: boolean }) {
  const { centers, nodes } = useMemo(() => layout(), []);
  const [hover, setHover] = useState<string | null>(null);
  const group = useRef<THREE.Group>(null);

  const edgeGeo = useMemo(() => {
    const pts: number[] = [];
    const byId = new Map(nodes.map((n) => [n.id, n]));
    for (const n of nodes) {
      const c = centers[n.group];
      pts.push(n.pos.x, n.pos.y, n.pos.z, c.x, c.y, c.z);
    }
    for (const [a, b] of skillEdges) {
      const na = byId.get(a);
      const nb = byId.get(b);
      if (na && nb) pts.push(na.pos.x, na.pos.y, na.pos.z, nb.pos.x, nb.pos.y, nb.pos.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [nodes, centers]);

  useFrame((_, dt) => {
    if (reduce || !group.current) return;
    group.current.rotation.y += dt * 0.05;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#2e2e33" transparent opacity={0.9} />
      </lineSegments>
      {nodes.map((n) => {
        const lit = active ? n.group === active : hover ? hover === n.id : true;
        const isHover = hover === n.id;
        return (
          <mesh
            key={n.id}
            position={n.pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(n.id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHover(null);
              document.body.style.cursor = "";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onActive(active === n.group ? null : n.group);
            }}
          >
            <sphereGeometry args={[isHover ? 0.1 : 0.062, 12, 12]} />
            <meshBasicMaterial color={isHover || (active && n.group === active) ? ACCENT : lit ? NODE : NODE_DIM} />
            {isHover ? (
              <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
                <span className="whitespace-nowrap rounded-full border border-accent/40 bg-ink/90 px-2 py-1 font-mono text-[11px] text-accent">
                  {n.id}
                </span>
              </Html>
            ) : null}
          </mesh>
        );
      })}
      {skillGroups.map((g) => (
        <Html key={g.id} position={centers[g.id]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <span
            className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-sm ${active === g.id ? "border-accent/50 bg-ink/80 text-accent" : "border-line-2 bg-ink/70 text-muted"}`}
          >
            {g.name}
          </span>
        </Html>
      ))}
    </group>
  );
}

export function SkillsConstellation({ active, onActive }: { active: string | null; onActive: (g: string | null) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotionPref();
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0.4, narrow ? 8.6 : 6.4], fov: 40 }}
        onPointerMissed={() => onActive(null)}
      >
        <Scene active={active} onActive={onActive} reduce={reduce} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} dampingFactor={0.08} enableDamping />
      </Canvas>
    </div>
  );
}
