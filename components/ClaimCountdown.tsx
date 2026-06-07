"use client";

import { useEffect, useMemo, useState } from "react";

const unlockAt = new Date("2026-07-19T22:00:00.000Z");

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  unlocked: boolean;
};

export function ClaimCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());

    const start = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, []);

  const remaining = useMemo(() => {
    if (now === null) return null;
    return getRemaining(unlockAt.getTime() - now);
  }, [now]);

  return (
    <div className="claim-countdown" aria-label="Countdown until prize claims unlock">
      <div className="claim-countdown-head">
        <span>{remaining?.unlocked ? "Claims unlocked" : "Claims unlock after the final"}</span>
        <strong>July 19, 2026 / 6:00 PM EDT</strong>
      </div>
      <div className="claim-countdown-grid">
        <CountdownUnit label="Days" value={remaining?.days} />
        <CountdownUnit label="Hours" value={remaining?.hours} />
        <CountdownUnit label="Minutes" value={remaining?.minutes} />
        <CountdownUnit label="Seconds" value={remaining?.seconds} />
      </div>
      <p>
        Final kickoff is scheduled for 3:00 PM EDT. Unlock is set three hours later to account for extra time and penalties.
      </p>
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <strong>{value === undefined ? "--" : String(value).padStart(2, "0")}</strong>
      <span>{label}</span>
    </div>
  );
}

function getRemaining(ms: number): Remaining {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    unlocked: ms <= 0,
  };
}
