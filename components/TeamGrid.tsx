"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Team } from "@/lib/teams";
import { TeamCard } from "@/components/TeamCard";
import { BASE_CHAIN } from "@/lib/chain";
import { CONTRACT_ADDRESS, encodeClaimCall, ethValueHex, hasConfiguredContract } from "@/lib/contract";
import { type WalletConnector, type WalletSnapshot, useWalletConnection } from "@/components/useWalletConnection";

export function TeamGrid({ teams, counts }: { teams: Team[]; counts?: Array<[string, number]> }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [claimingSlug, setClaimingSlug] = useState<string>();
  const deferredQuery = useDeferredValue(query);
  const wallet = useWalletConnection();
  const countMap = useMemo(() => new Map(counts || []), [counts]);
  const groupLetters = useMemo(() => Array.from(new Set(teams.map((team) => team.group))).sort(), [teams]);
  const groups = useMemo(() => ["All", ...groupLetters], [groupLetters]);

  const filteredTeams = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return teams.filter((team) => {
      const matchesGroup = group === "All" || team.group === group;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        team.name.toLowerCase().includes(normalizedQuery) ||
        team.shortName.toLowerCase().includes(normalizedQuery);
      return matchesGroup && matchesQuery;
    });
  }, [deferredQuery, group, teams]);

  const groupedTeams = useMemo(
    () =>
      groupLetters
        .map((letter) => ({
          letter,
          teams: filteredTeams.filter((team) => team.group === letter),
        }))
        .filter((teamGroup) => teamGroup.teams.length > 0),
    [filteredTeams, groupLetters],
  );

  const showGroupedAll = group === "All" && groupedTeams.length > 0;

  async function claimTeam(team: Team) {
    let claimAddress = wallet.address;
    let claimChainId = wallet.chainId;
    let claimProvider: WalletSnapshot["provider"];

    setClaimingSlug(team.slug);
    wallet.setStatus(`Preparing ${team.name} claim.`);

    try {
      if (!claimAddress) {
        const connectedWallet = await connectForFastClaim();
        claimAddress = connectedWallet?.address;
        claimChainId = connectedWallet?.chainId;
        claimProvider = connectedWallet?.provider;
      }

      if (!claimAddress) return;

      if (!hasConfiguredContract()) {
        wallet.setStatus("Contract address is not configured yet. Add NEXT_PUBLIC_CONTRACT_ADDRESS after deployment.");
        return;
      }

      if (claimChainId !== BASE_CHAIN.id) {
        const switched = await wallet.switchNetwork(claimProvider);
        if (!switched) return;
      }

      const hash = await wallet.sendTransaction(
        {
          from: claimAddress,
          to: CONTRACT_ADDRESS,
          value: ethValueHex(),
          data: encodeClaimCall(claimAddress, team.tokenId),
        },
        claimProvider,
      );
      wallet.setStatus(`Transaction sent: ${hash}`);
      router.push(`/success?team=${team.slug}`);
    } catch (error) {
      wallet.setStatus(error instanceof Error ? error.message : "Claim failed.");
    } finally {
      setClaimingSlug(undefined);
    }
  }

  async function connectForFastClaim() {
    const connectors: WalletConnector[] = wallet.hasProvider ? ["injected", "farcaster", "base"] : ["farcaster", "base"];

    for (const connector of connectors) {
      const connectedWallet = await wallet.connect(connector);
      if (connectedWallet?.address) {
        return connectedWallet;
      }
    }

    return undefined;
  }

  return (
    <div className="team-picker">
      <div className="team-picker-toolbar">
        <label className="team-search-shell">
          <span>Search</span>
          <input
            className="input team-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Mexico, Japan, Brazil..."
            aria-label="Search teams"
            suppressHydrationWarning
          />
        </label>
        <div className="team-group-tabs" role="tablist" aria-label="Filter teams by group">
          {groups.map((letter) => (
            <button
              key={letter}
              className={`team-group-filter ${group === letter ? "is-active" : ""}`}
              onClick={() => setGroup(letter)}
              type="button"
              aria-pressed={group === letter}
            >
              <span>{letter === "All" ? "All teams" : `Group ${letter}`}</span>
            </button>
          ))}
        </div>
        <p className="team-picker-summary">
          {group === "All"
            ? `${filteredTeams.length} teams organized by group`
            : `${filteredTeams.length} teams in Group ${group}`}
        </p>
        <p className="team-picker-wallet-status">{wallet.status}</p>
      </div>

      {showGroupedAll ? (
        <div className="team-group-stack">
          {groupedTeams.map((teamGroup) => (
            <section className="team-group-row" key={teamGroup.letter} aria-label={`Group ${teamGroup.letter}`}>
              <div className="team-group-rail">
                <span>Group</span>
                <strong>{teamGroup.letter}</strong>
                <small>{teamGroup.teams.length} of 4</small>
              </div>
              <div className="team-grid team-grid--grouped">
                {teamGroup.teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    count={countMap.get(team.slug) ?? 0}
                    claiming={claimingSlug === team.slug || wallet.pending}
                    onClaim={claimTeam}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="team-grid team-grid--flat">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              count={countMap.get(team.slug) ?? 0}
              claiming={claimingSlug === team.slug || wallet.pending}
              onClaim={claimTeam}
            />
          ))}
        </div>
      )}

      {filteredTeams.length === 0 ? (
        <div className="team-empty-state">
          <strong>No teams found.</strong>
          <span>Try another country name or switch back to All teams.</span>
        </div>
      ) : null}
    </div>
  );
}
