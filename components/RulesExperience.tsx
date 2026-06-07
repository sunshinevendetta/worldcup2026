"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SplitText } from "@/components/reactbits/SplitText";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { MagneticButton } from "@/components/reactbits/MagneticButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const prizeBuckets = [
  { percent: "50%", label: "Most supported team", body: "All holders of the team with the most flags claimed." },
  { percent: "30%", label: "Tournament winner", body: "Holders of the team that wins the tournament." },
  { percent: "15%", label: "Second place", body: "Holders of the team that finishes second." },
  { percent: "5%", label: "Third place", body: "Holders of the team that finishes third." },
];

export function RulesExperience() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from(".rules-kicker", { autoAlpha: 0, y: 18, duration: 0.7 })
        .from(".rules-lead", { autoAlpha: 0, y: 28, filter: "blur(10px)", duration: 0.9 }, "-=0.35")
        .from(".rules-actions", { autoAlpha: 0, y: 18, duration: 0.7 }, "-=0.45");

      ScrollTrigger.batch(".rules-reveal", {
        start: "top 84%",
        interval: 0.08,
        batchMax: 4,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.06, ease: "power3.out", overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 38, scale: 0.98, overwrite: true }),
      });

      gsap.set(".rules-reveal", { autoAlpha: 0, y: 38, scale: 0.98 });

      gsap.to(".prize-flow-line", {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: ".rules-prize-grid",
          start: "top 78%",
          end: "bottom 42%",
          scrub: 1,
        },
      });

    },
    { scope },
  );

  return (
    <main ref={scope} className="rules-experience page-shell">
      <section className="rules-hero">
        <div>
          <p className="rules-kicker">Support mechanics / prize snapshots</p>
          <h1>
            <SplitText text="Rules & Prize Logic" />
          </h1>
          <p className="rules-lead">
            You pick a team and claim their flag for 0.001 ETH. You can support as many teams as you want.
            The leaderboard shows which team has the most flags claimed.
          </p>
          <div className="rules-actions">
            <MagneticButton href="/">Pick a team</MagneticButton>
            <MagneticButton href="/leaderboard" variant="secondary">Leaderboard</MagneticButton>
          </div>
        </div>
      </section>

      <section className="rules-section-head rules-reveal">
        <p>How the prize bag is distributed</p>
        <h2>Four ways holders can win.</h2>
      </section>

      <section className="rules-prize-grid" aria-label="Prize bag distribution">
        <div className="prize-flow-line" aria-hidden="true" />
        {prizeBuckets.map((bucket) => (
          <SpotlightCard className="rules-prize-card rules-reveal" key={bucket.label}>
            <span>{bucket.percent}</span>
            <h3>{bucket.label}</h3>
            <p>{bucket.body}</p>
          </SpotlightCard>
        ))}
      </section>

      <SpotlightCard className="rules-snapshot rules-reveal">
        <p>Prize claims open after the champion is announced. If your wallet holds an eligible winning flag, the app will show a claim button so you can claim your gains.</p>
        <strong>Simple. You support a team. You win when they win.</strong>
        <Link href="/claim">Claim status</Link>
      </SpotlightCard>
    </main>
  );
}
