"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, encodeClaimCall, ethValueHex, hasConfiguredContract } from "@/lib/contract";
import { BASE_CHAIN } from "@/lib/chain";
import { WalletStatus } from "@/components/WalletStatus";
import { WalletConnectorButtons } from "@/components/WalletConnectorButtons";
import { getConnectorLabel, type WalletSnapshot, useWalletConnection } from "@/components/useWalletConnection";

export function ClaimTeamButton({ teamId, teamSlug, teamName }: { teamId: number; teamSlug: string; teamName: string }) {
  const router = useRouter();
  const {
    address,
    chainId,
    connect,
    connector,
    pending: walletPending,
    readyChain,
    sendTransaction,
    setStatus,
    status,
    switchNetwork,
  } = useWalletConnection();
  const [claimPending, setClaimPending] = useState(false);

  async function claim() {
    let claimAddress = address;
    let claimChainId = chainId;
    let claimProvider: WalletSnapshot["provider"];

    if (!claimAddress) {
      const wallet = await connect("base");
      claimAddress = wallet?.address;
      claimChainId = wallet?.chainId;
      claimProvider = wallet?.provider;
    }

    if (!claimAddress) return;

    if (!hasConfiguredContract()) {
      setStatus("Contract address is not configured yet. Add NEXT_PUBLIC_CONTRACT_ADDRESS after deployment.");
      return;
    }

    setClaimPending(true);
    setStatus(`Preparing ${teamName} claim.`);
    try {
      if (claimChainId !== BASE_CHAIN.id) {
        const switched = await switchNetwork(claimProvider);
        if (!switched) return;
      }

      const data = encodeClaimCall(claimAddress, teamId);
      const hash = await sendTransaction({
        from: claimAddress,
        to: CONTRACT_ADDRESS,
        value: ethValueHex(),
        data,
      }, claimProvider);
      setStatus(`Transaction sent: ${hash}`);
      router.push(`/success?team=${teamSlug}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Claim failed.");
    } finally {
      setClaimPending(false);
    }
  }

  const pending = walletPending || claimPending;

  return (
    <div className="surface space-y-3 p-4">
      <WalletStatus address={address} chainId={chainId} connector={address ? getConnectorLabel(connector) : undefined} />
      <div className="claim-button-stack">
        {!address ? (
          <WalletConnectorButtons connect={connect} pending={pending} />
        ) : (
          <button className="button" type="button" onClick={claim} disabled={pending}>
            {pending ? "Transaction pending" : readyChain ? `Claim ${teamName} flag` : `Switch and claim ${teamName}`}
          </button>
        )}
        <span className="claim-price-pill">
          0.001 ETH
        </span>
      </div>
      <p className="text-sm font-semibold text-[var(--muted)]">{status}</p>
    </div>
  );
}
