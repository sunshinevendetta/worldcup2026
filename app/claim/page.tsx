import Link from "next/link";
import { ClaimCountdown } from "@/components/ClaimCountdown";
import { ClaimWalletPanel } from "@/components/ClaimWalletPanel";

export default function ClaimPage() {
  return (
    <main className="claim-experience page-shell">
      <section className="claim-gate spotlight-card">
        <p className="claim-kicker">Prize claim status</p>
        <h1>Claims open after the champion is announced.</h1>
        <p className="claim-copy">
          When the tournament result is final, eligible wallets will see a claim button here. Connect your wallet, check your eligible flags, and claim your gains.
        </p>
        <ClaimCountdown />
        <ClaimWalletPanel />
        <div className="claim-actions">
          <button className="claim-disabled" type="button" disabled>
            Claim gains
          </button>
          <Link className="button secondary" href="/rules">Rules</Link>
        </div>
      </section>
    </main>
  );
}
