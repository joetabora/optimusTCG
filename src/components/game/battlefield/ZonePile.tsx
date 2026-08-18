"use client";

interface ZonePileProps {
  vaultCount: number;
  scrapCount: number;
}

export function ZonePile({ vaultCount, scrapCount }: ZonePileProps) {
  return (
    <div className="flex gap-2">
      <PileBadge label="Vault" count={vaultCount} />
      <PileBadge label="Scrap" count={scrapCount} />
    </div>
  );
}

function PileBadge({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex min-h-11 min-w-[4.5rem] flex-col items-center justify-center rounded-xl border border-white/10 bg-[var(--helix-glass)] px-3 py-2 backdrop-blur-md">
      <span className="text-[0.58rem] uppercase tracking-[0.16em] text-white/50">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-white/85">{count}</span>
    </div>
  );
}
