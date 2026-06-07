"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const CHARS = ["2", "0", "2", "6", "+", ".", "*", "#", "x", "/", "\\"];

export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const pointer = { x: 0.62, y: 0.32 };
    const pointerX = gsap.quickTo(pointer, "x", { duration: 0.8, ease: "power3.out" });
    const pointerY = gsap.quickTo(pointer, "y", { duration: 0.8, ease: "power3.out" });
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX((event.clientX - rect.left) / rect.width);
      pointerY((event.clientY - rect.top) / rect.height);
    };

    const render = () => {
      frame += 1;
      if (frame % 3 !== 0) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      context.clearRect(0, 0, width, height);
      context.font = "800 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";

      const cell = 18;
      const time = performance.now() * 0.001;
      for (let y = cell; y < height; y += cell) {
        for (let x = cell; x < width; x += cell) {
          const dx = x / width - pointer.x;
          const dy = y / height - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.sin(x * 0.034 + y * 0.052 + time * 2.2);
          const intensity = Math.max(0, 1 - distance * 2.8) + wave * 0.2;
          const char = CHARS[Math.abs(Math.floor((x * 0.07 + y * 0.11 + time * 4) % CHARS.length))];
          context.fillStyle = `rgba(255, 211, 106, ${Math.max(0.09, Math.min(0.5, intensity * 0.34))})`;
          context.fillText(char, x + wave * 2, y + Math.cos(time + x * 0.02) * 2);
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    gsap.ticker.add(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(render);
    };
  }, []);

  return <canvas ref={canvasRef} className="ascii-field" aria-hidden="true" />;
}
