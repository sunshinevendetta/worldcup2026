import { NextResponse } from "next/server";
import { getAbsoluteAppUrl } from "@/lib/social";

export const dynamic = "force-dynamic";

const accountAssociation = {
  header: "eyJmaWQiOjI3Mjk3NywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDBCYjE1ZjEzY0FlRDgyM2Q4MjgyMUY3ZkQxMWVEOGU5RTBlMjc5NjQifQ",
  payload: "eyJkb21haW4iOiJ3b3JsZGN1cC5zdW5zaGluZXZlbmRldHRhLmNvbSJ9",
  signature: "3M0qAV//ZrOADn07bygpb18/QisH+PQsfm0saYTMWYZAoUTx4y5+Cb/uRuYbCpdRXxfvbTRmEeVNHx1RSzHl8hw=",
};

export function GET() {
  const baseBuilderOwnerAddress =
    process.env.NEXT_PUBLIC_BASE_BUILDER_OWNER_ADDRESS ||
    process.env.DROP_ADMIN_ADDRESS ||
    process.env.PRIMARY_SALE_RECIPIENT;

  const manifest: Record<string, unknown> = {
    miniapp: {
      version: "1",
      name: "World Cup Support Drop",
      subtitle: "Back your World Cup team",
      description: "Claim a team support flag for 0.001 ETH. The most-supported team gets the collected flag ETH.",
      homeUrl: getAbsoluteAppUrl("/"),
      iconUrl: getAbsoluteAppUrl("/images/teams/mexico.webp"),
      splashImageUrl: getAbsoluteAppUrl("/images/teams/mexico.webp"),
      splashBackgroundColor: "#080a0d",
      heroImageUrl: getAbsoluteAppUrl("/images/teams/mexico.webp"),
      tagline: "Back your team",
      ogTitle: "World Cup Support Drop",
      ogDescription: "Claim a support flag and push your team up the leaderboard.",
      ogImageUrl: getAbsoluteAppUrl("/images/teams/mexico.webp"),
      primaryCategory: "games",
      tags: ["worldcup", "base", "nft", "sports", "collect"],
      requiredChains: ["eip155:8453"],
      requiredCapabilities: ["wallet.getEthereumProvider", "actions.composeCast"],
    },
  };

  if (baseBuilderOwnerAddress) {
    manifest.baseBuilder = {
      ownerAddress: baseBuilderOwnerAddress,
    };
  }

  manifest.accountAssociation = getAccountAssociation() || accountAssociation;

  const webhookUrl = process.env.FARCASTER_WEBHOOK_URL;
  if (webhookUrl && typeof manifest.miniapp === "object" && manifest.miniapp) {
    (manifest.miniapp as Record<string, unknown>).webhookUrl = webhookUrl;
  }

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}

function getAccountAssociation() {
  const header = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER;
  const payload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD;
  const signature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE;

  if (!header || !payload || !signature) {
    return undefined;
  }

  return { header, payload, signature };
}
