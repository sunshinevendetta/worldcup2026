import { LeaderboardTable } from "@/components/LeaderboardTable";
import { formatDate, formatEth } from "@/lib/format";
import { getLeaderboard } from "@/lib/leaderboard";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <main className="page-shell space-y-6 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Claimed supply ranking</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">Leaderboard</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Total mints" value={leaderboard.totalMints.toLocaleString()} />
        <Metric label="Prize bag estimate" value={`${formatEth(leaderboard.prizeBagEth)} ETH`} />
        <Metric label="Last updated" value={formatDate(leaderboard.updatedAt)} />
      </div>
      {leaderboard.stale ? (
        <div className="surface p-4 text-sm font-semibold text-[var(--muted)]">Showing cached or initial zero-state data.</div>
      ) : null}
      <LeaderboardTable teams={leaderboard.teams} />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-2 font-mono text-xl font-black">{value}</div>
    </div>
  );
}
