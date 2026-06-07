"use client";

import { BASE_CHAIN } from "@/lib/chain";

export function WalletStatus({ address, chainId, connector }: { address?: string; chainId?: number; connector?: string }) {
  return (
    <div className="surface flex flex-wrap items-center gap-3 p-3 text-sm">
      <span className="font-bold">Wallet</span>
      <span className="font-mono text-[var(--muted)]">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</span>
      {chainId ? <span className="rounded-md bg-[rgba(22,166,168,0.16)] px-2 py-1 font-mono font-bold text-[var(--accent-strong)]">{getChainLabel(chainId)}</span> : null}
      {connector ? <span className="wallet-connector-pill">{connector}</span> : null}
    </div>
  );
}

function getChainLabel(chainId: number) {
  if (chainId === BASE_CHAIN.id) return BASE_CHAIN.name;
  return `Switch to ${BASE_CHAIN.name}`;
}
