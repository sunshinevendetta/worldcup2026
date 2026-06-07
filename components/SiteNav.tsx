"use client";

import { usePathname } from "next/navigation";
import { StaggeredMenu } from "@/components/reactbits/StaggeredMenu";

const navItems = [
  {
    href: "/",
    label: "Home",
    eyebrow: "Overview",
    description: "Jump back to the tournament hub.",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    eyebrow: "Ranking",
    description: "Track which teams are leading the race.",
  },
  {
    href: "/rules",
    label: "Rules",
    eyebrow: "How it works",
    description: "Read the prize logic and support flow.",
  },
  {
    href: "/claim",
    label: "Claim",
    eyebrow: "Reward",
    description: "Check whether your wallet can claim.",
  },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <nav className="site-nav page-shell" aria-label="Primary navigation">
        <div className="site-nav-identity">
          <StaggeredMenu items={navItems} currentPath={pathname} trigger="trophy" align="left" />
        </div>
      </nav>
    </header>
  );
}
