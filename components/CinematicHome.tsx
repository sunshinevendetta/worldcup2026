"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import type { Team } from "@/lib/teams";
import type { Leaderboard } from "@/lib/leaderboard";
import { formatEth } from "@/lib/format";
import { TeamGrid } from "@/components/TeamGrid";
import { SplitText } from "@/components/reactbits/SplitText";
import { MagneticButton } from "@/components/reactbits/MagneticButton";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { KineticCopy } from "@/components/reactbits/KineticCopy";

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP);

export function CinematicHome({
  teams,
  leaderboard,
}: {
  teams: Team[];
  leaderboard: Leaderboard;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const counts = leaderboard.teams.map((team) => [team.slug, team.count] as [string, number]);
  const featured = [1, 13, 9, 17, 37, 45, 5, 29]
    .map((id) => teams.find((team) => team.id === id))
    .filter((team): team is Team => Boolean(team));
  const argentina = featured.find((team) => team.slug === "argentina") || featured[0];
  const [activeTeam, setActiveTeam] = useState<Team>(argentina);
  const groupLetters = Array.from(new Set(teams.map((team) => team.group))).sort();

  useGSAP(
    (_context, contextSafe) => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".hero-kicker", { autoAlpha: 0, y: 24, duration: 0.75 })
        .from(".hero-copy", { autoAlpha: 0, y: 28, duration: 0.9 }, "-=0.35")
        .from(".hero-action", { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.08 }, "-=0.35")
        .from(".cup-piece", { autoAlpha: 0, y: 54, scale: 0.84, duration: 1.05, stagger: 0.055 }, "-=0.65")
        .from(".world-ball", { autoAlpha: 0, scale: 0.4, rotate: -90, duration: 0.9 }, "-=0.55")
        .from(".tournament-ribbon", { autoAlpha: 0, xPercent: -38, scaleX: 0.55, duration: 0.95, stagger: 0.08 }, "-=0.55")
        .from(".orbit-tile", { autoAlpha: 0, y: 70, rotate: 5, scale: 0.92, duration: 1.1, stagger: 0.08 }, "-=0.75")
        .from(".metric-card", { autoAlpha: 0, y: 24, duration: 0.75, stagger: 0.07 }, "-=0.7");

      gsap.to(".tournament-ribbon", {
        xPercent: 14,
        duration: 5.8,
        repeat: -1,
        yoyo: true,
        stagger: 0.24,
        ease: "sine.inOut",
      });

      gsap.to(".world-ball", {
        rotate: 360,
        y: -10,
        duration: 10,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".cup-core", {
        y: -12,
        filter: "drop-shadow(0 0 36px rgba(242, 200, 91, 0.48))",
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".orbit-track", {
        rotate: 4,
        y: -22,
        ease: "none",
        scrollTrigger: {
          trigger: ".home-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".pitch-line", {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: ".world-stage",
          start: "top 76%",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      const race = gsap.timeline({
        scrollTrigger: {
          trigger: ".race-strip",
          start: "top 78%",
          end: "bottom 30%",
          scrub: 1,
        },
      });
      race
        .fromTo(".race-line", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, ease: "none" })
        .fromTo(".race-pulse", { xPercent: -10 }, { xPercent: 110, ease: "none" }, 0);

      ScrollTrigger.batch(".team-card-shell", {
        start: "top 86%",
        interval: 0.08,
        batchMax: 8,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.045, ease: "power3.out", overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, y: 42, scale: 0.98, overwrite: true }),
      });

      const makeContextSafe = contextSafe || (<T extends (...args: never[]) => unknown>(fn: T) => fn);
      const activateDraggedTeam = makeContextSafe(function (this: Draggable | undefined, event?: Event) {
        const target =
          this?.target ||
          (event?.currentTarget instanceof HTMLElement ? event.currentTarget : null) ||
          (event?.target instanceof HTMLElement ? event.target.closest("[data-team-slug]") : null);
        const slug = target?.getAttribute("data-team-slug");
        if (!slug) return;
        const nextTeam = featured.find((team) => team.slug === slug);
        if (nextTeam) setActiveTeam(nextTeam);
      });

      const draggables = Draggable.create(".orbit-tile", {
        type: "x,y",
        bounds: ".hero-orbit",
        edgeResistance: 0.78,
        cursor: "grab",
        activeCursor: "grabbing",
        zIndexBoost: true,
        allowNativeTouchScrolling: false,
        onPress: activateDraggedTeam,
        onDragStart() {
          this.target.classList.add("is-dragging");
          gsap.to(this.target, { scale: 1.08, duration: 0.28, ease: "power3.out", overwrite: true });
        },
        onDrag() {
          this.target.style.setProperty("--drag-x", `${Math.round(this.x)}px`);
          this.target.style.setProperty("--drag-y", `${Math.round(this.y)}px`);
        },
        onDragEnd() {
          this.target.classList.remove("is-dragging");
          gsap.to(this.target, { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.55)", overwrite: true });
        },
      });

      gsap.set(".team-card-shell", { autoAlpha: 0, y: 42, scale: 0.98 });
      ScrollTrigger.refresh();

      return () => {
        draggables.forEach((draggable) => draggable.kill());
      };
    },
    { scope },
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ".active-team-panel",
        { autoAlpha: 0, y: 24, scale: 0.94, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.75, ease: "expo.out" },
      );
    },
    { scope, dependencies: [activeTeam.slug], revertOnUpdate: true },
  );

  return (
    <main ref={scope} className="cinematic-home">
      <section className="home-hero page-shell">
        <div className="hero-panel">
          <p className="hero-kicker">Pick your country. Back them all the way.</p>
          <h1>
            <SplitText text="FIFA WORLD CUP 2026" />
          </h1>
          <KineticCopy />
          <div className="hero-actions">
            <span className="hero-action"><MagneticButton href="#teams">Pick a team</MagneticButton></span>
            <span className="hero-action"><MagneticButton href="/leaderboard" variant="secondary">Leaderboard</MagneticButton></span>
          </div>
          <div className="group-codebar" aria-label="World Cup groups">
            {groupLetters.map((letter) => (
              <span key={letter}>Group {letter}</span>
            ))}
          </div>
        </div>
        <div className="hero-orbit" aria-label="Featured support flags">
          <WorldCupStage />
          <div className="orbit-track">
            {featured.map((team, index) => (
              <button
                className={`orbit-tile orbit-tile--${index + 1} ${activeTeam.slug === team.slug ? "is-active" : ""}`}
                key={team.id}
                type="button"
                data-team-slug={team.slug}
                onClick={() => setActiveTeam(team)}
                onPointerEnter={() => setActiveTeam(team)}
                aria-pressed={activeTeam.slug === team.slug}
              >
                <Image src={team.image} alt={`${team.name} support flag`} fill sizes="220px" className="object-cover" priority={index < 2} />
                <span>{team.shortName}</span>
              </button>
            ))}
          </div>
          <SpotlightCard className="active-team-panel">
            <p>Focused flag</p>
            <strong>{activeTeam.name}</strong>
            <span>Group {activeTeam.group} / Token #{activeTeam.tokenId}</span>
            <a href={`/team/${activeTeam.slug}`}>Claim {activeTeam.shortName}</a>
          </SpotlightCard>
        </div>
      </section>

      <section className="page-shell metrics-band" aria-label="Campaign summary">
        <Metric label="Total mints" value={leaderboard.totalMints.toLocaleString()} />
        <Metric label="Prize bag" value={`${formatEth(leaderboard.prizeBagEth)} ETH`} />
        <Metric label="Mint price" value="0.001 ETH" />
        <Metric label="Teams" value="48" />
      </section>

      <section className="page-shell race-strip" aria-label="Support race">
        <div className="race-copy">
          <p>Supply is the scoreboard.</p>
          <span>One public count, 48 teams, no offchain intent points.</span>
        </div>
        <div className="race-visual">
          <div className="race-line" />
          <div className="race-pulse" />
        </div>
      </section>

      <section id="teams" className="page-shell teams-section">
        <div className="section-heading">
          <p>Choose your side</p>
          <h2>All 48 flags are live in the picker.</h2>
        </div>
        <TeamGrid teams={teams} counts={counts} />
      </section>
    </main>
  );
}

function WorldCupStage() {
  return (
    <div className="world-stage" aria-hidden="true">
      <div className="pitch-frame">
        <div className="pitch-line pitch-line--top" />
        <div className="pitch-line pitch-line--mid" />
        <div className="pitch-line pitch-line--bottom" />
        <div className="pitch-circle" />
      </div>
      <div className="cup-core">
        <div className="cup-aura cup-piece" />
        <div className="cup-bowl cup-piece" />
        <div className="cup-handle cup-handle--left cup-piece" />
        <div className="cup-handle cup-handle--right cup-piece" />
        <div className="cup-stem cup-piece" />
        <div className="cup-base cup-piece" />
      </div>
      <div className="world-ball cup-piece" />
      <div className="tournament-ribbon tournament-ribbon--blue" />
      <div className="tournament-ribbon tournament-ribbon--gold" />
      <div className="tournament-ribbon tournament-ribbon--green" />
      <div className="tournament-ribbon tournament-ribbon--red" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <SpotlightCard className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </SpotlightCard>
  );
}
