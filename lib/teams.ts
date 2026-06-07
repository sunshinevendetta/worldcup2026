import teamsData from "@/public/data/teams.json";

export type Team = {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  group: string;
  confederation: string;
  image: string;
  tokenId: number;
  shareText: string;
};

export const teams = teamsData.teams as Team[];

export function getTeamBySlug(slug: string) {
  return teams.find((team) => team.slug === slug);
}

export function getTeamById(id: number) {
  return teams.find((team) => team.id === id);
}
