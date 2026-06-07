"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.018,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".split-char",
        { autoAlpha: 0, yPercent: 120, rotateX: -78, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          yPercent: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1.05,
          delay,
          stagger,
          ease: "expo.out",
        },
      );
    },
    { scope },
  );

  return (
    <span ref={scope} className={`split-text ${className}`} aria-label={text}>
      {text.split(" ").map((word, wordIndex) => (
        <span className="split-word" aria-hidden="true" key={`${word}-${wordIndex}`}>
          {word.split("").map((char, charIndex) => (
            <span className="split-char" key={`${char}-${charIndex}`}>
              {char}
            </span>
          ))}
          {wordIndex < text.split(" ").length - 1 ? <span className="split-space">&nbsp;</span> : null}
        </span>
      ))}
    </span>
  );
}
