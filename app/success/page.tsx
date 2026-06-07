import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { getTeamBySlug } from "@/lib/teams";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
  const { team: slug } = await searchParams;
  const team = slug ? getTeamBySlug(slug) : undefined;

  return (
    <main className="page-shell grid min-h-[calc(100vh-64px)] place-items-center py-8">
      <div className="surface max-w-xl space-y-5 p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Claim submitted</p>
        <h1 className="text-4xl font-black">{team ? `${team.name} flag claimed` : "Flag claimed"}</h1>
        <p className="text-[var(--muted)]">
          Share your support cast and send people straight to the team page.
        </p>
        {team ? <ShareButton teamName={team.name} teamSlug={team.slug} /> : null}
        <div className="flex justify-center gap-3">
          <Link className="button secondary" href="/leaderboard">Leaderboard</Link>
          <Link className="button secondary" href="/">Pick another team</Link>
        </div>
      </div>
    </main>
  );
}
