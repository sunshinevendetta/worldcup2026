"use client";

import { useEffect, useState } from "react";
import { BASE_CHAIN } from "@/lib/chain";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged" | "chainChanged", listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: "accountsChanged" | "chainChanged", listener: (...args: unknown[]) => void) => void;
  disconnect?: () => Promise<void>;
};

export type WalletConnector = "farcaster" | "base" | "injected" | "walletconnect";
export type WalletSnapshot = { address?: string; chainId?: number; provider?: EthereumProvider };

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

let coinbaseProvider: EthereumProvider | undefined;
let walletConnectProvider: EthereumProvider | undefined;
let farcasterProvider: EthereumProvider | undefined;

export function useWalletConnection() {
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [provider, setProvider] = useState<EthereumProvider>();
  const [connector, setConnector] = useState<WalletConnector>();
  const [hasProvider, setHasProvider] = useState(true);
  const [status, setStatus] = useState("Connect a wallet to continue.");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitialWallet() {
      await Promise.resolve();
      if (!active) return;

      const initialProvider = window.ethereum;
      setHasProvider(Boolean(initialProvider));

      if (!initialProvider) {
        return;
      }

      const walletProvider = initialProvider;
      setProvider(walletProvider);
      setConnector("injected");

      try {
        const accounts = (await walletProvider.request({ method: "eth_accounts" })) as string[];
        const chainHex = (await walletProvider.request({ method: "eth_chainId" })) as string;
        if (!active) return;
        setAddress(accounts[0]);
        setChainId(Number.parseInt(chainHex, 16));
      } catch {
        // Initial wallet discovery is best-effort; explicit connect shows any provider errors.
      }
    }

    void loadInitialWallet();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!provider) return;

    function onAccountsChanged(accounts: unknown) {
      const nextAddress = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : undefined;
      setAddress(nextAddress);
      setStatus(nextAddress ? "Wallet connected." : "Connect a wallet to continue.");
    }

    function onChainChanged(chainHex: unknown) {
      if (typeof chainHex === "string") setChainId(Number.parseInt(chainHex, 16));
    }

    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [provider]);

  async function refreshWallet(walletProvider = provider, { silent = false } = {}) {
    if (!walletProvider) return;

    try {
      const accounts = (await walletProvider.request({ method: "eth_accounts" })) as string[];
      const chainHex = (await walletProvider.request({ method: "eth_chainId" })) as string;
      setAddress(accounts[0]);
      setChainId(Number.parseInt(chainHex, 16));
      if (!silent) setStatus(accounts[0] ? "Wallet connected." : "Connect a wallet to continue.");
    } catch (error) {
      if (!silent) setStatus(error instanceof Error ? error.message : "Could not read wallet state.");
    }
  }

  async function connect(nextConnector: WalletConnector = "injected"): Promise<WalletSnapshot | undefined> {
    setPending(true);
    setStatus(`Opening ${getConnectorLabel(nextConnector)}.`);

    try {
      const walletProvider = await getProvider(nextConnector);
      if (!walletProvider) {
        throw new Error(getMissingProviderMessage(nextConnector));
      }

      setHasProvider(true);
      setProvider(walletProvider);
      setConnector(nextConnector);

      const accounts = (await walletProvider.request({ method: "eth_requestAccounts" })) as string[];
      const chainHex = (await walletProvider.request({ method: "eth_chainId" })) as string;
      const nextAddress = accounts[0];
      const nextChainId = Number.parseInt(chainHex, 16);
      setAddress(nextAddress);
      setChainId(nextChainId);
      setStatus(nextAddress ? `${getConnectorLabel(nextConnector)} connected.` : "No wallet account selected.");
      return { address: nextAddress, chainId: nextChainId, provider: walletProvider };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection failed.";
      setHasProvider(nextConnector !== "injected" || Boolean(window.ethereum));
      setStatus(message);
      return undefined;
    } finally {
      setPending(false);
    }
  }

  async function switchNetwork(walletProvider = provider): Promise<boolean> {
    if (!walletProvider) return false;

    setPending(true);
    setStatus(`Switching to ${BASE_CHAIN.name}.`);
    try {
      await walletProvider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: toChainHex(BASE_CHAIN.id) }] });
      setChainId(BASE_CHAIN.id);
      setStatus(`Connected to ${BASE_CHAIN.name}.`);
      return true;
    } catch (error) {
      const code = getProviderErrorCode(error);
      if (code === 4902) {
        await walletProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: toChainHex(BASE_CHAIN.id),
              chainName: BASE_CHAIN.name,
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: [BASE_CHAIN.rpcUrl],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ],
        });
        setChainId(BASE_CHAIN.id);
        setStatus(`Connected to ${BASE_CHAIN.name}.`);
        return true;
      } else {
        setStatus(error instanceof Error ? error.message : `Please switch to ${BASE_CHAIN.name}.`);
        return false;
      }
    } finally {
      setPending(false);
    }
  }

  async function sendTransaction(
    transaction: { from: string; to: string; value?: string; data?: string },
    walletProvider = provider,
  ) {
    if (!walletProvider) {
      throw new Error("Connect a wallet to continue.");
    }

    return (await walletProvider.request({
      method: "eth_sendTransaction",
      params: [transaction],
    })) as string;
  }

  return {
    address,
    chainId,
    connected: Boolean(address),
    connector,
    hasProvider,
    pending,
    readyChain: chainId === BASE_CHAIN.id,
    status: !hasProvider ? "Open this app in a wallet-enabled browser, Farcaster, or Base App." : status,
    connect,
    refreshWallet,
    sendTransaction,
    setStatus,
    switchNetwork,
  };
}

async function getProvider(connector: WalletConnector): Promise<EthereumProvider | undefined> {
  if (connector === "injected") {
    return window.ethereum;
  }

  if (connector === "farcaster") {
    if (!farcasterProvider) {
      const mod = await import("@farcaster/miniapp-sdk");
      const sdk = mod.default || mod.sdk;
      farcasterProvider = (await sdk.wallet?.getEthereumProvider?.()) as EthereumProvider | undefined;
    }
    return farcasterProvider;
  }

  if (connector === "base") {
    if (!coinbaseProvider) {
      const { CoinbaseWalletSDK } = await import("@coinbase/wallet-sdk");
      const sdk = new CoinbaseWalletSDK({
        appName: "World Cup Support Drop",
        appLogoUrl: getAppIconUrl(),
        appChainIds: [BASE_CHAIN.id],
      });
      coinbaseProvider = sdk.makeWeb3Provider({ options: "all" }) as EthereumProvider;
    }
    return coinbaseProvider;
  }

  if (connector === "walletconnect") {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (!projectId) return undefined;

    if (!walletConnectProvider) {
      const WalletConnectProvider = (await import("@walletconnect/ethereum-provider")).default;
      walletConnectProvider = (await WalletConnectProvider.init({
        projectId,
        chains: [BASE_CHAIN.id],
        showQrModal: true,
        rpcMap: {
          [BASE_CHAIN.id]: BASE_CHAIN.rpcUrl,
        },
        metadata: {
          name: "World Cup Support Drop",
          description: "Claim World Cup 2026 team support flags.",
          url: window.location.origin,
          icons: [getAppIconUrl()],
        },
      })) as EthereumProvider;
    }
    return walletConnectProvider;
  }

  return undefined;
}

function getMissingProviderMessage(connector: WalletConnector) {
  if (connector === "farcaster") {
    return "Open this inside Farcaster to use the Farcaster wallet.";
  }
  if (connector === "base") {
    return "Base Wallet could not be opened.";
  }
  if (connector === "walletconnect") {
    return "WalletConnect is missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.";
  }
  return "Open this app in a wallet-enabled browser.";
}

export function getConnectorLabel(connector?: WalletConnector) {
  if (connector === "farcaster") return "Farcaster";
  if (connector === "base") return "Base Wallet";
  if (connector === "walletconnect") return "WalletConnect";
  return "Browser wallet";
}

function getAppIconUrl() {
  return `${window.location.origin}/images/world-cup-trophy.png?v=2`;
}

function toChainHex(chainId: number) {
  return `0x${chainId.toString(16)}`;
}

function getProviderErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "number" ? code : undefined;
  }
  return undefined;
}
