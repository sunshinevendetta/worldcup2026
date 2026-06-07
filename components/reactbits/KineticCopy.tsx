"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function KineticCopy() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "expo.out" },
      });

      tl.from(".kinetic-line", {
        autoAlpha: 0,
        y: 28,
        rotateX: -32,
        filter: "blur(8px)",
        duration: 0.9,
        stagger: 0.075,
      }).from(
        ".kinetic-pill",
        {
          autoAlpha: 0,
          scale: 0.72,
          y: 12,
          duration: 0.75,
          stagger: 0.055,
        },
        "-=0.55",
      );
    },
    { scope },
  );

  return (
    <div ref={scope} className="kinetic-copy" aria-label="Support drop mechanics">
      <p className="kinetic-line">
        Pick a country and claim its flag. Every mint pushes that nation up the global leaderboard.
      </p>
      <p className="kinetic-line">
        The most-backed team unlocks the headline prize pool for its holders when the tournament ends.
      </p>
      <p className="kinetic-line">
        Podium finish? Holders get an extra cut. One flag. One side. All the way.
      </p>
      <div className="kinetic-pills" aria-hidden="true">
        <span className="kinetic-pill">One team</span>
        <span className="kinetic-pill">One flag</span>
        <span className="kinetic-pill">One run to the final</span>
      </div>
    </div>
  );
}
