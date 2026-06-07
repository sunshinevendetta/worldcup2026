import fs from "node:fs/promises";
import path from "node:path";
import { BASE_CHAIN, CONTRACT_ADDRESS, encodeTotalSupplyCall, hasConfiguredContract, MINT_PRICE_ETH } from "@/lib/contract";
import { teams, type Team } from "@/lib/teams";

export type LeaderboardTeam = {
  id: number;
  slug: string;
  name: string;
  group: string;
  count: number;
};

export type Leaderboard = {
  updatedAt: number;
  stale: boolean;
  chainId: number;
  contract: string;
  totalMints: number;
  mintPriceEth: string;
  prizeBagEth: string;
  teams: LeaderboardTeam[];
};

const cachePath = path.join(process.cwd(), "public", "data", "leaderboard.json");

export async function getTeams(): Promise<Team[]> {
  return teams;
}

export async function getLeaderboard(): Promise<Leaderboard> {
  const raw = await fs.readFile(cachePath, "utf8");
  return JSON.parse(raw) as Leaderboard;
}

export function buildLeaderboard(counts: Map<number, bigint>): Leaderboard {
  const rows = teams.map((team) => ({
    id: team.id,
    slug: team.slug,
    name: team.name,
    group: team.group,
    count: Number(counts.get(team.tokenId) ?? 0n),
  }));
  const totalMints = rows.reduce((sum, team) => sum + team.count, 0);
  const prizeBagEth = ((totalMints * Number(MINT_PRICE_ETH)) / 2).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");

  return {
    updatedAt: Date.now(),
    stale: false,
    chainId: BASE_CHAIN.id,
    contract: hasConfiguredContract() ? CONTRACT_ADDRESS : "",
    totalMints,
    mintPriceEth: MINT_PRICE_ETH,
    prizeBagEth: prizeBagEth || "0",
    teams: rows,
  };
}

export async function readOnchainLeaderboard() {
  if (!hasConfiguredContract()) {
    return buildLeaderboard(new Map());
  }

  const counts = new Map<number, bigint>();
  await Promise.all(
    teams.map(async (team) => {
      const data = encodeTotalSupplyCall(team.tokenId);
      const result = await rpc<string>("eth_call", [{ to: CONTRACT_ADDRESS, data }, "latest"]);
      const count = BigInt(result || "0x0");
      counts.set(team.tokenId, count);
    }),
  );
  return buildLeaderboard(counts);
}

export async function writeLeaderboard(leaderboard: Leaderboard) {
  await fs.writeFile(cachePath, `${JSON.stringify(leaderboard, null, 2)}\n`);
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(BASE_CHAIN.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await response.json()) as { result?: T; error?: { message?: string } };
  if (json.error) throw new Error(json.error.message || "RPC request failed");
  return json.result as T;
}
