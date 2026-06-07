import { NextResponse } from "next/server";
import { getLeaderboard, readOnchainLeaderboard } from "@/lib/leaderboard";

const TTL_MS = 30 * 60 * 1000;
let memoryCache: { expiresAt: number; payload: unknown } | null = null;

export async function GET() {
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return respond(memoryCache.payload);
  }

  const cached = await getLeaderboard();
  if (cached.updatedAt && Date.now() - cached.updatedAt < TTL_MS) {
    memoryCache = { expiresAt: Date.now() + TTL_MS, payload: cached };
    return respond(cached);
  }

  try {
    const fresh = await readOnchainLeaderboard();
    memoryCache = { expiresAt: Date.now() + TTL_MS, payload: fresh };
    return respond(fresh);
  } catch {
    const fallback = { ...cached, stale: true };
    memoryCache = { expiresAt: Date.now() + 60_000, payload: fallback };
    return respond(fallback);
  }
}

function respond(payload: unknown) {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
