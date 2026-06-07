import Link from "next/link";
import type { LeaderboardTeam } from "@/lib/leaderboard";

export function LeaderboardTable({ teams }: { teams: LeaderboardTeam[] }) {
  const ranked = [...teams].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <div className="surface overflow-hidden">
      <div className="grid grid-cols-[56px_1fr_72px_96px] border-b border-[var(--line)] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        <span>Rank</span>
        <span>Team</span>
        <span>Group</span>
        <span className="text-right">Support</span>
      </div>
      {ranked.map((team, index) => (
        <Link key={team.id} href={`/team/${team.slug}`} className="grid grid-cols-[56px_1fr_72px_96px] items-center border-b border-[var(--line)] px-4 py-3 last:border-b-0 hover:bg-[var(--panel-strong)]">
          <span className="font-mono font-black">{index + 1}</span>
          <span className="font-bold">{team.name}</span>
          <span className="text-sm font-semibold text-[var(--muted)]">{team.group}</span>
          <span className="text-right font-mono font-black">{team.count.toLocaleString()}</span>
        </Link>
      ))}
    </div>
  );
}
