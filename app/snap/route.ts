import { NextRequest, NextResponse } from "next/server";
import { getAbsoluteAppUrl, getSupportShareText } from "@/lib/social";
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
  const teamSlug = request.nextUrl.searchParams.get("team");
  const team = teamSlug ? getTeamBySlug(teamSlug) : undefined;

  if (team) {
    return buildTeamSnap(team);
  }

  if (group && getGroups().includes(group)) {
    return buildGroupSnap(group);
  }

  return buildGroupPickerSnap();
}

function buildGroupPickerSnap() {
  const groups = getGroups();
  const firstGroups = groups.slice(0, 6);
  const secondGroups = groups.slice(6);
  const children = ["title", "body", "groups"];
  const elements: Record<string, SnapElement> = {
    page: stack(children),
    title: text("Pick your World Cup group", { weight: "bold" }),
    body: text("Choose a group, pick a team, then mint the support flag in the Mini App.", { size: "sm" }),
    groups: stack(["groups-1", "groups-2"], "horizontal"),
    "groups-1": stack(firstGroups.map((group) => `group-${group}`), "vertical"),
    "groups-2": stack(secondGroups.map((group) => `group-${group}`), "vertical"),
  };

  for (const group of groups) {
    elements[`group-${group}`] = button(`Group ${group}`, submit(getAbsoluteAppUrl(`/snap?group=${group}`)));
  }

  return snap(elements);
}

function buildGroupSnap(group: string) {
  const groupTeams = teams.filter((team) => team.group === group);
  const elements: Record<string, SnapElement> = {
    page: stack(["title", "body", "teams", "back"]),
    title: text(`Group ${group}`, { weight: "bold" }),
    body: text("Pick the team you want to support.", { size: "sm" }),
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
    page: stack(["title", "body", "actions", "back"]),
    title: text(`Support ${team.name}`, { weight: "bold" }),
    body: text("Mint this team flag for 0.001 ETH. The most-supported team gets the collected flag ETH.", { size: "sm" }),
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

function snapResponse(body: unknown) {
  return NextResponse.json(body, {
    headers: {
      "Content-Type": SNAP_CONTENT_TYPE,
      "Cache-Control": "no-store",
      Vary: "Accept",
    },
  });
}
