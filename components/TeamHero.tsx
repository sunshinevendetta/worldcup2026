import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import { ClaimTeamButton } from "@/components/ClaimTeamButton";
import { ShareButton } from "@/components/ShareButton";

export function TeamHero({ team, count }: { team: Team; count: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-start">
      <div className="team-hero-art-card">
        <div className="team-art relative aspect-square">
          <Image src={team.image} alt={`${team.name} support flag artwork`} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Group {team.group}</p>
          <h1 className="mt-2 text-4xl font-black sm:text-6xl">{team.name}</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Mint price" value="0.001 ETH" />
          <Stat label="Support" value={count.toLocaleString()} />
          <Stat label="Token ID" value={String(team.tokenId)} />
        </div>
        <ClaimTeamButton teamId={team.tokenId} teamSlug={team.slug} teamName={team.name} />
        <div className="flex flex-wrap gap-3">
          <ShareButton teamName={team.name} teamSlug={team.slug} />
          <Link className="button secondary" href="/leaderboard">Leaderboard</Link>
          <Link className="button secondary" href="/rules">Rules</Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-2 break-words font-mono text-lg font-black">{value}</div>
    </div>
  );
}
