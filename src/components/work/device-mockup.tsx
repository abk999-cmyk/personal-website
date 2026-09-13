"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

import type { ProjectImage } from "@/content/projects";

/**
 * Laptop + phone composition that tilts toward the cursor.
 * Pure CSS 3D; no WebGL, so it costs nothing on mobile.
 */
export function DeviceMockup({ desktop, mobile, compact = false }: { desktop: ProjectImage; mobile?: ProjectImage; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="absolute inset-0 overflow-hidden [perspective:1400px]"
      style={{ pointerEvents: compact ? "none" : "auto" }}
    >
      <div className="grid-bg absolute inset-0 opacity-25" />
      <motion.div
        style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: "preserve-3d" }}
        className={compact ? "absolute inset-x-[8%] top-[12%]" : "absolute inset-x-[10%] top-[10%]"}
      >
        {/* laptop */}
        <div className="relative rounded-[10px] border border-line-2 bg-[#0d0d0f] p-[6px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-surface">
            <Image src={desktop.src} alt={desktop.alt} fill priority={!compact} sizes="(max-width: 768px) 90vw, 800px" className="object-cover object-top" />
          </div>
        </div>
        <div className="mx-auto h-[6px] w-[70%] rounded-b-md bg-[#1a1a1d]" />
        {/* phone */}
        {mobile ? (
          <div
            className="absolute -bottom-[18%] right-[-3%] w-[22%] rounded-[16px] border border-line-2 bg-[#0d0d0f] p-[4px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95)]"
            style={{ transform: "translateZ(60px)" }}
          >
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[12px] bg-surface">
              <Image src={mobile.src} alt={mobile.alt} fill sizes="200px" className="object-cover object-top" />
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
