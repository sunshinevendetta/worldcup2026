"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { AsciiField } from "@/components/reactbits/AsciiField";

export function DarkVeil() {
  const veilRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = veilRef.current;
    const glint = glintRef.current;
    if (!root || !glint) return;

    const xTo = gsap.quickTo(glint, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(glint, "y", { duration: 0.8, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      xTo(event.clientX - rect.left - rect.width / 2);
      yTo(event.clientY - rect.top - rect.height / 2);
    };

    root.addEventListener("pointermove", onMove);
    const drift = gsap.to(root, {
      "--veil-shift": "1",
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      root.removeEventListener("pointermove", onMove);
      drift.kill();
    };
  }, []);

  return (
    <div ref={veilRef} className="dark-veil" aria-hidden="true">
      <AsciiField />
      <div ref={glintRef} className="dark-veil__glint" />
      <div className="dark-veil__mesh" />
    </div>
  );
}
