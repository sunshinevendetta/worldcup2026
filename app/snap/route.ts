import { NextRequest, NextResponse } from "next/server";
import { getAbsoluteAppUrl, getSupportShareText, getTeamShareLabel } from "@/lib/social";
import { getTeamBySlug, teams, type Team } from "@/lib/teams";

const SNAP_CONTENT_TYPE = "application/vnd.farcaster.snap+json";

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
  const groupPage = Number(request.nextUrl.searchParams.get("page") || "0");
  const teamSlug = request.nextUrl.searchParams.get("team");
  const team = teamSlug ? getTeamBySlug(teamSlug) : undefined;

  if (team) {
    return buildTeamSnap(team);
  }

  if (group && getGroups().includes(group)) {
    return buildGroupSnap(group);
  }

  return buildGroupPickerSnap(groupPage);
}

function buildGroupPickerSnap(groupPage: number) {
  const groupPages = chunk(getGroups(), 4);
  const pageIndex = normalizePageIndex(groupPage, groupPages.length);
  const visibleGroups = groupPages[pageIndex] || groupPages[0];
  const previousPage = normalizePageIndex(pageIndex - 1, groupPages.length);
  const nextPage = normalizePageIndex(pageIndex + 1, groupPages.length);
  const groupRange = `${visibleGroups[0]}-${visibleGroups[visibleGroups.length - 1]}`;
  const elements: Record<string, SnapElement> = {
    page: stack(["hero", "title", "groups", "group-nav"]),
    hero: image(getAbsoluteAppUrl("/images/world-cup-share-hero.png?v=1"), "World Cup Support Drop", {
      title: "World Cup Support Drop",
      subtitle: `Groups ${groupRange}`,
    }),
    title: text("Pick your World Cup group", { weight: "bold" }),
    groups: stack(visibleGroups.map((group) => `group-${group}`), "horizontal"),
    "group-nav": stack(["group-back", "group-next"], "horizontal"),
    "group-back": button("Back", submit(getAbsoluteAppUrl(`/snap?page=${previousPage}`)), "secondary"),
    "group-next": button("Next", submit(getAbsoluteAppUrl(`/snap?page=${nextPage}`)), "secondary"),
  };

  for (const group of visibleGroups) {
    elements[`group-${group}`] = button(group, submit(getAbsoluteAppUrl(`/snap?group=${group}`)));
  }

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
    elements[`team-${team.slug}`] = button(getSnapTeamLabel(team), submit(getAbsoluteAppUrl(`/snap?team=${team.slug}`)));
  }

  return snap(elements);
}

function buildTeamSnap(team: Team) {
  const teamUrl = getAbsoluteAppUrl(`/team/${team.slug}?miniApp=true`);
  const castText = getSupportShareText(team.name, team.slug);
  const elements: Record<string, SnapElement> = {
    page: stack(["hero", "title", "body", "actions", "back"]),
    hero: image(getAbsoluteAppUrl(`/images/teams/${team.slug}.webp`), team.name, {
      aspect: "1.91:1",
      title: team.name,
      subtitle: `Group ${team.group} support flag`,
    }),
    title: text(`Support ${team.name}`, { weight: "bold" }),
    body: text("Mint a support flag for 0.001 ETH. The most-backed team wins the support pool.", { size: "sm" }),
    actions: stack(["mint", "cast"], "horizontal", { columns: 2 }),
    mint: button("Mint flag", openUrl(teamUrl)),
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

function stack(children: string[], direction: "horizontal" | "vertical" = "vertical", props: Record<string, unknown> = {}): SnapElement {
  return {
    type: "stack",
    props: { direction, gap: "sm", ...props },
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

function openUrl(url: string) {
  return {
    action: "open_url",
    params: { url },
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

function normalizePageIndex(pageIndex: number, pageCount: number) {
  if (!Number.isFinite(pageIndex) || pageCount < 1) return 0;
  return ((Math.trunc(pageIndex) % pageCount) + pageCount) % pageCount;
}

function getSnapTeamLabel(team: Team) {
  const labels: Record<string, string> = {
    "cape-verde": "Cape V.",
    "dr-congo": "DR Congo",
    england: "England",
    "ivory-coast": "Ivory C.",
    "new-zealand": "N. Zealand",
    "saudi-arabia": "Saudi",
    scotland: "Scotland",
    "south-africa": "S. Africa",
    "south-korea": "S. Korea",
    "united-states": "USA",
  };

  const label = labels[team.slug] || team.shortName;
  if (team.slug === "england" || team.slug === "scotland") {
    return `${String.fromCodePoint(0x1f3f4)} ${label}`;
  }

  return getTeamShareLabel(label, team.slug);
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
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
