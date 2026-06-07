declare module "@farcaster/miniapp-sdk" {
  type EthereumProvider = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: "accountsChanged" | "chainChanged", listener: (...args: unknown[]) => void) => void;
    removeListener?: (event: "accountsChanged" | "chainChanged", listener: (...args: unknown[]) => void) => void;
  };

  const sdk: {
    actions?: {
      ready?: () => Promise<void>;
      composeCast?: (args: { text: string; embeds?: string[] }) => Promise<void>;
    };
    wallet?: {
      ethProvider?: EthereumProvider;
      getEthereumProvider?: () => Promise<EthereumProvider | undefined>;
    };
  };
  export default sdk;
  export { sdk };
}
