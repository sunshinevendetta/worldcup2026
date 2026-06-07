import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamHero } from "@/components/TeamHero";
import { getLeaderboard } from "@/lib/leaderboard";
import { getTeamBySlug, teams } from "@/lib/teams";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const appIcon = "/images/world-cup-trophy.png?v=2";

export function generateStaticParams() {
  return teams.map((team) => ({ slug: team.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};

  const teamUrl = new URL(`/team/${team.slug}`, appUrl).toString();
  const teamImage = new URL(team.image, appUrl).toString();
  const absoluteAppIcon = new URL(appIcon, appUrl).toString();

  return {
    title: `${team.name} | World Cup Support Drop`,
    description: `Support ${team.name} with a 0.001 ETH World Cup flag.`,
    openGraph: {
      title: `Support ${team.name}`,
      description: `Mint a ${team.name} support flag and push the team up the leaderboard.`,
      url: teamUrl,
      images: [{ url: teamImage, width: 1200, height: 1200, alt: `${team.name} support flag` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Support ${team.name}`,
      description: `Mint a ${team.name} support flag and push the team up the leaderboard.`,
      images: [teamImage],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: teamImage,
        button: {
          title: "Mint flag",
          action: {
            type: "launch_frame",
            name: "World Cup Support Drop",
            url: teamUrl,
            splashImageUrl: absoluteAppIcon,
            splashBackgroundColor: "#080a0d",
          },
        },
      }),
    },
  };
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
