"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type StaggeredMenuItem = {
  href: string;
  label: string;
  eyebrow: string;
  description: string;
};

export function StaggeredMenu({
  items,
  currentPath,
  trigger = "label",
  align = "right",
}: {
  items: readonly StaggeredMenuItem[];
  currentPath: string;
  trigger?: "label" | "trophy";
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (scope.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  useGSAP(
    () => {
      const panel = scope.current?.querySelector(".staggered-menu-panel");
      if (!panel) return;

      if (open) {
        gsap.set(panel, { autoAlpha: 1, pointerEvents: "auto" });
        gsap.fromTo(
          panel,
          { y: -14, scale: 0.98, filter: "blur(8px)" },
          { y: 0, scale: 1, filter: "blur(0px)", duration: 0.38, ease: "power3.out" },
        );
        gsap.fromTo(
          ".staggered-menu-link",
          { autoAlpha: 0, x: -36, y: 18, rotate: -2 },
          { autoAlpha: 1, x: 0, y: 0, rotate: 0, duration: 0.58, stagger: 0.065, ease: "expo.out" },
        );
        gsap.fromTo(
          ".staggered-menu-note > *",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.055, ease: "power3.out", delay: 0.08 },
        );
        return;
      }

      gsap.to(panel, {
        autoAlpha: 0,
        y: -10,
        scale: 0.985,
        filter: "blur(6px)",
        duration: 0.18,
        ease: "power2.in",
        pointerEvents: "none",
      });
    },
    { scope, dependencies: [open] },
  );

  return (
    <div ref={scope} className={`staggered-menu staggered-menu--${align} staggered-menu--${trigger} ${open ? "is-open" : ""}`}>
      <button
        className={`staggered-menu-toggle ${trigger === "trophy" ? "staggered-menu-toggle--trophy" : ""}`}
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="site-staggered-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {trigger === "trophy" ? (
          <Image
            className="site-brand-mark-icon"
            src="/images/world-cup-trophy.png"
            alt=""
            width={28}
            height={28}
            priority={false}
          />
        ) : (
          <>
            <span className="staggered-menu-toggle-copy">Menu</span>
            <span className="staggered-menu-toggle-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </>
        )}
      </button>

      <div id="site-staggered-menu" className="staggered-menu-panel" aria-hidden={!open}>
        <div className="staggered-menu-note" aria-hidden="true">
          <span>World Cup 2026</span>
          <strong>Choose the next stop.</strong>
          <p>Four clean routes, no card-nav traffic jam.</p>
        </div>

        <div className="staggered-menu-links" aria-label="Main menu">
          {items.map((item, index) => {
            const active = currentPath === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`staggered-menu-link ${active ? "is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="staggered-menu-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="staggered-menu-link-copy">
                  <span>{item.eyebrow}</span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
