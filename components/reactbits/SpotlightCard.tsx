"use client";

import Link from "next/link";
import { type ReactNode, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SpotlightCard({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const cardRef = useRef<HTMLAnchorElement | HTMLDivElement>(null);
  const rotateXTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotateYTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    rotateXTo.current = gsap.quickTo(cardRef.current, "rotateX", { duration: 0.45, ease: "power3.out" });
    rotateYTo.current = gsap.quickTo(cardRef.current, "rotateY", { duration: 0.45, ease: "power3.out" });
  }, { scope: cardRef });

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--spot-x", `${x}px`);
    card.style.setProperty("--spot-y", `${y}px`);
    rotateXTo.current?.(((y / rect.height) - 0.5) * -5);
    rotateYTo.current?.(((x / rect.width) - 0.5) * 5);
  };

  const onPointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.65, ease: "elastic.out(1, 0.55)", overwrite: true });
  };

  const props = {
    ref: cardRef as never,
    className: `spotlight-card ${className}`,
    onPointerMove,
    onPointerLeave,
  };

  if (href) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return <div {...props}>{children}</div>;
}
