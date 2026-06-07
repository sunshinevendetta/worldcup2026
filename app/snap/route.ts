import { NextRequest, NextResponse } from "next/server";
import { getAbsoluteAppUrl, getSupportShareText } from "@/lib/social";
import { getTeamBySlug, teams, type Team } from "@/lib/teams";

const SNAP_CONTENT_TYPE = "application/vnd.farcaster.snap+json";
const GROUP_PAGE_SIZE = 4;

type SnapElement = {
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  on?: Record<string, unknown>;
};

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return snapResponse(buildSnap(request));
}

export async function POST(request: NextRequest) {
  return snapResponse(buildSnap(request));
}

function buildSnap(request: NextRequest) {
  const group = request.nextUrl.searchParams.get("group")?.toUpperCase();
  const page = getSnapPage(request.nextUrl.searchParams.get("page"));
  const teamSlug = request.nextUrl.searchParams.get("team");
  const team = teamSlug ? getTeamBySlug(teamSlug) : undefined;

  if (team) {
    return buildTeamSnap(team);
  }

  if (group && getGroups().includes(group)) {
    return buildGroupSnap(group);
  }

  return buildGroupPickerSnap(page);
}

function buildGroupPickerSnap(page: number) {
  const groups = getGroups();
  const totalPages = Math.ceil(groups.length / GROUP_PAGE_SIZE);
  const start = (page - 1) * GROUP_PAGE_SIZE;
  const visibleGroups = groups.slice(start, start + GROUP_PAGE_SIZE);
  const pageLabel = `${visibleGroups[0]}-${visibleGroups[visibleGroups.length - 1]}`;
  const navChildren = [page > 1 ? "prev" : undefined, page < totalPages ? "next" : undefined].filter(
    (child): child is string => Boolean(child),
  );
  const elements: Record<string, SnapElement> = {
    page: stack(["hero", "title", "body", "groups", "nav"]),
    hero: image(getAbsoluteAppUrl("/images/world-cup-share-hero.png?v=1"), "World Cup Support Drop", {
      title: "World Cup Support Drop",
      subtitle: `Groups ${pageLabel}`,
    }),
    title: text(`Pick a group (${pageLabel})`, { weight: "bold" }),
    body: text("Choose a group, then back a country on Base. Every 0.001 ETH flag claim adds to that team's count and reward pool.", { size: "sm" }),
    groups: stack(visibleGroups.map((group) => `group-${group}`), "vertical"),
    nav: stack(navChildren, "horizontal"),
  };

  for (const group of visibleGroups) {
    elements[`group-${group}`] = button(`Group ${group}`, submit(getAbsoluteAppUrl(`/snap?group=${group}`)));
  }
  elements.next = button("Next groups", submit(getAbsoluteAppUrl(`/snap?page=${page + 1}`)), "secondary");
  elements.prev = button("Back groups", submit(getAbsoluteAppUrl(`/snap?page=${page - 1}`)), "secondary");

  return snap(elements);
}

function buildGroupSnap(group: string) {
  const groupTeams = teams.filter((team) => team.group === group);
  const elements: Record<string, SnapElement> = {
    page: stack(["title", "body", "teams", "back"]),
    title: text(`Back a team from Group ${group}`, { weight: "bold" }),
    body: text("Choose the country you want to lift on the leaderboard. The winning support base shares the post-tournament reward path.", { size: "sm" }),
    teams: stack(groupTeams.map((team) => `team-${team.slug}`), "vertical"),
    back: button("Back to groups", submit(getAbsoluteAppUrl("/snap")), "secondary"),
  };

  for (const team of groupTeams) {
    elements[`team-${team.slug}`] = button(team.shortName, submit(getAbsoluteAppUrl(`/snap?team=${team.slug}`)));
  }

  return snap(elements);
}

function buildTeamSnap(team: Team) {
  const teamUrl = getAbsoluteAppUrl(`/team/${team.slug}?miniApp=true`);
  const castText = getSupportShareText(team.name);
  const elements: Record<string, SnapElement> = {
    page: stack(["hero", "title", "body", "actions", "back"]),
    hero: image(getAbsoluteAppUrl(`/images/teams/${team.slug}.webp`), team.name, {
      title: team.name,
      subtitle: `Group ${team.group} support flag`,
    }),
    title: text(`Support ${team.name}`, { weight: "bold" }),
    body: text("Mint one support flag for 0.001 ETH. Your claim adds to this country's live count, and the strongest fan base becomes eligible for the reward flow after the cup.", { size: "sm" }),
    actions: stack(["mint", "cast"], "vertical"),
    mint: button("Mint flag", openMiniApp(teamUrl)),
    cast: button("Cast support", composeCast(castText, [teamUrl]), "secondary"),
    back: button(`Group ${team.group}`, submit(getAbsoluteAppUrl(`/snap?group=${team.group}`)), "secondary"),
  };

  return snap(elements);
}

function snap(elements: Record<string, SnapElement>) {
  return {
    version: "2.0",
    theme: { accent: "green" },
    ui: {
      root: "page",
      elements,
    },
  };
}

function stack(children: string[], direction: "horizontal" | "vertical" = "vertical"): SnapElement {
  return {
    type: "stack",
    props: { direction, gap: "sm" },
    children,
  };
}

function text(content: string, props: Record<string, unknown> = {}): SnapElement {
  return {
    type: "text",
    props: { content, ...props },
  };
}

function image(url: string, alt: string, props: Record<string, unknown> = {}): SnapElement {
  return {
    type: "image",
    props: { url, alt, aspect: "1:1", ...props },
  };
}

function button(label: string, press: Record<string, unknown>, variant: "primary" | "secondary" = "primary"): SnapElement {
  return {
    type: "button",
    props: { label, variant },
    on: { press },
  };
}

function submit(target: string) {
  return {
    action: "submit",
    params: { target },
  };
}

function openMiniApp(target: string) {
  return {
    action: "open_mini_app",
    params: { target },
  };
}

function composeCast(text: string, embeds: string[]) {
  return {
    action: "compose_cast",
    params: { text, embeds },
  };
}

function getGroups() {
  return [...new Set(teams.map((team) => team.group))].sort();
}

function getSnapPage(value: string | null) {
  const page = Number(value || 1);
  if (!Number.isInteger(page)) return 1;
  return Math.min(Math.max(page, 1), Math.ceil(getGroups().length / GROUP_PAGE_SIZE));
}

function snapResponse(body: unknown) {
  return NextResponse.json(body, {
    headers: {
      "Content-Type": SNAP_CONTENT_TYPE,
      "Cache-Control": "no-store",
      Vary: "Accept",
    },
  });
}
