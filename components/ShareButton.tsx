"use client";

import { useState } from "react";
import { getSupportShareText } from "@/lib/social";

export function ShareButton({ teamName, teamSlug }: { teamName: string; teamSlug: string }) {
  const [showChoices, setShowChoices] = useState(false);
  const [status, setStatus] = useState("");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${appUrl}/team/${teamSlug}`;
  const text = getSupportShareText(teamName, teamSlug);

  function choosePlatform() {
    setStatus("");
    setShowChoices((value) => !value);
  }

  async function shareFarcaster() {
    setStatus("");
    setShowChoices(false);
    try {
      const mod = await import("@farcaster/miniapp-sdk");
      const miniAppSdk = mod as unknown as {
        default?: { actions?: { composeCast?: (args: { text: string; embeds?: string[] }) => Promise<void> } };
        sdk?: { actions?: { composeCast?: (args: { text: string; embeds?: string[] }) => Promise<void> } };
      };
      const sdk = miniAppSdk.default || miniAppSdk.sdk;
      await sdk?.actions?.composeCast?.({ text, embeds: [url] });
      setStatus("Farcaster share opened.");
      return;
    } catch {
      const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
      window.open(intent, "_blank", "noopener,noreferrer");
      setStatus("Farcaster share opened.");
    }
  }

  function shareX() {
    setStatus("");
    setShowChoices(false);
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
    setStatus("X share opened.");
  }

  return (
    <div>
      <div className="share-support-panel">
        <button className="button" type="button" onClick={choosePlatform} aria-expanded={showChoices}>
          Share
        </button>
        {showChoices ? (
          <div className="share-modal-backdrop" role="presentation" onClick={() => setShowChoices(false)}>
            <div className="share-modal" role="dialog" aria-modal="true" aria-label="Share" onClick={(event) => event.stopPropagation()}>
              <div className="share-modal-header">
                <strong>Share</strong>
                <button className="share-modal-close" type="button" onClick={() => setShowChoices(false)} aria-label="Close share modal">
                  Close
                </button>
              </div>
              <div className="share-platform-grid">
                <button className="share-platform-button" type="button" onClick={shareX} aria-label="Share on X">
                  <span className="share-platform-icon share-platform-icon--x" aria-hidden="true">
                    <XIcon />
                  </span>
                  <span>X</span>
                </button>
                <button className="share-platform-button" type="button" onClick={() => void shareFarcaster()} aria-label="Share on Farcaster">
                  <span className="share-platform-icon share-platform-icon--farcaster" aria-hidden="true">
                    <FarcasterIcon />
                  </span>
                  <span>Farcaster</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {status ? <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M14.3 10.4 22.2 1h-1.9l-6.8 8.1L8 1H1.8l8.3 12.1L1.8 23h1.9l7.3-8.7L16.8 23H23l-8.7-12.6Zm-2.6 3.1-.8-1.2L4.2 2.4h2.9l5.4 8 .8 1.2 7 10.1h-2.9l-5.7-8.2Z" />
    </svg>
  );
}

function FarcasterIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M5 3h14v18h-3v-5.1h-1.9v-3.2h1.9V6.2H8v6.5h1.9v3.2H8V21H5V3Z" />
      <path d="M10.2 8h3.6v8h-3.6V8Z" />
    </svg>
  );
}
