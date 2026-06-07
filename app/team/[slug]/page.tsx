import { notFound } from "next/navigation";
import { TeamHero } from "@/components/TeamHero";
import { getLeaderboard } from "@/lib/leaderboard";
import { getTeamBySlug, teams } from "@/lib/teams";

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const leaderboard = await getLeaderboard();
  const row = leaderboard.teams.find((item) => item.slug === team.slug);

  return (
    <main className="page-shell py-8">
      <TeamHero team={team} count={row?.count ?? 0} />
    </main>
  );
}
