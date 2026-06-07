import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";

export function TeamCard({
  team,
  count,
  claiming = false,
  onClaim,
}: {
  team: Team;
  count?: number;
  claiming?: boolean;
  onClaim?: (team: Team) => void;
}) {
  return (
    <SpotlightCard className="team-card-shell block overflow-hidden">
      <div className="team-art relative aspect-square">
        <Image
          src={team.image}
          alt={`${team.name} support flag artwork`}
          fill
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="team-card-rank">#{team.tokenId}</div>
        <div className="team-card-side-tag">Group {team.group}</div>
      </div>
      <div className="team-card-body">
        <div className="team-card-title-row">
          <div>
            <span className="team-card-confed">{team.confederation}</span>
            <h2>{team.name}</h2>
          </div>
          <span className="team-card-group">Group {team.group}</span>
        </div>
        <div className="team-card-support">
          <span className="text-[var(--muted)]">Support</span>
          <span className="font-mono font-black">{(count ?? 0).toLocaleString()}</span>
        </div>
        <div className="team-card-actions">
          <button
            className="team-card-cta team-card-cta--claim"
            type="button"
            onClick={() => onClaim?.(team)}
            disabled={claiming}
          >
            {claiming ? "Opening wallet" : `Claim ${team.shortName}`}
          </button>
          <Link className="team-card-cta team-card-cta--details" href={`/team/${team.slug}`}>
            See more
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}
