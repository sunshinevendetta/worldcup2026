"use client";

import type { WalletConnector, WalletSnapshot } from "@/components/useWalletConnection";
import { getConnectorLabel } from "@/components/useWalletConnection";

const CONNECTORS: WalletConnector[] = ["farcaster", "base", "injected", "walletconnect"];

export function WalletConnectorButtons({
  connect,
  pending,
}: {
  connect: (connector: WalletConnector) => Promise<WalletSnapshot | undefined>;
  pending: boolean;
}) {
  return (
    <div className="wallet-choice-grid">
      {CONNECTORS.map((connector) => (
        <button
          className="wallet-choice-button"
          type="button"
          onClick={() => void connect(connector)}
          disabled={pending}
          key={connector}
        >
          <span>{getConnectorInitials(connector)}</span>
          <strong>{getConnectorLabel(connector)}</strong>
        </button>
      ))}
    </div>
  );
}

function getConnectorInitials(connector: WalletConnector) {
  if (connector === "farcaster") return "FC";
  if (connector === "base") return "BW";
  if (connector === "walletconnect") return "WC";
  return "EIP";
}
