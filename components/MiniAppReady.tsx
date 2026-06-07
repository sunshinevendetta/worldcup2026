"use client";

import { useEffect } from "react";

export function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;

    async function markReady() {
      try {
        const mod = await import("@farcaster/miniapp-sdk");
        const miniAppSdk = mod as unknown as { default?: { actions?: { ready?: () => Promise<void> } }; sdk?: { actions?: { ready?: () => Promise<void> } } };
        const sdk = miniAppSdk.default || miniAppSdk.sdk;
        if (!cancelled) {
          await sdk?.actions?.ready?.();
        }
      } catch {
        // The app should remain browsable outside Farcaster and during local development.
      }
    }

    markReady();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
