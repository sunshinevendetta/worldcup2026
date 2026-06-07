"use client";

import Link from "next/link";
import { type ReactNode, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function MagneticButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useGSAP(() => {
    if (!ref.current) return;
    xTo.current = gsap.quickTo(ref.current, "x", { duration: 0.45, ease: "power3.out" });
    yTo.current = gsap.quickTo(ref.current, "y", { duration: 0.45, ease: "power3.out" });
  }, { scope: ref });

  function move(event: React.PointerEvent<HTMLAnchorElement>) {
    const element = ref.current;
    if (!element || !xTo.current || !yTo.current) return;
    const rect = element.getBoundingClientRect();
    xTo.current((event.clientX - rect.left - rect.width / 2) * 0.22);
    yTo.current((event.clientY - rect.top - rect.height / 2) * 0.28);
  }

  function reset() {
    xTo.current?.(0);
    yTo.current?.(0);
  }

  return (
    <Link
      ref={ref}
      className={`magnetic-button ${variant === "secondary" ? "magnetic-button--secondary" : ""}`}
      href={href}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      {children}
    </Link>
  );
}
