import { CinematicHome } from "@/components/CinematicHome";
import { getLeaderboard, getTeams } from "@/lib/leaderboard";

export default async function Home() {
  const [teams, leaderboard] = await Promise.all([getTeams(), getLeaderboard()]);
  return <CinematicHome teams={teams} leaderboard={leaderboard} />;
}
