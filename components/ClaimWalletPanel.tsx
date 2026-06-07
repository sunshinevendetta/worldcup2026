"use client";

import { BASE_CHAIN } from "@/lib/chain";
import { hasConfiguredContract } from "@/lib/contract";
import { WalletStatus } from "@/components/WalletStatus";
import { WalletConnectorButtons } from "@/components/WalletConnectorButtons";
import { getConnectorLabel, useWalletConnection } from "@/components/useWalletConnection";

export function ClaimWalletPanel() {
  const { address, chainId, connect, connector, pending, readyChain, status, switchNetwork } = useWalletConnection();
  const connected = Boolean(address);

  return (
    <div className="claim-wallet-panel">
      <WalletStatus address={address} chainId={chainId} connector={connected ? getConnectorLabel(connector) : undefined} />
      <div className="claim-wallet-actions">
        {!connected ? (
          <WalletConnectorButtons connect={connect} pending={pending} />
        ) : !readyChain ? (
          <button className="button" type="button" onClick={() => void switchNetwork()} disabled={pending}>
            Switch to {BASE_CHAIN.name}
          </button>
        ) : (
          <button className="button" type="button" disabled>
            Wallet ready
          </button>
        )}
        <span className={`claim-contract-pill ${hasConfiguredContract() ? "is-ready" : ""}`}>
          {hasConfiguredContract() ? "Contract configured" : "Awaiting contract address"}
        </span>
      </div>
      <p className="claim-wallet-status">{status}</p>
      <p className="claim-wallet-note">
        Prize claims stay locked until the tournament result is final. Connecting now verifies the wallet and network that will be checked for eligible flags.
      </p>
    </div>
  );
}
