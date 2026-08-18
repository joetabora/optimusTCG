"use client";

interface FluxDisplayProps {
  flux: number;
  fluxMax: number;
}

export function FluxDisplay({ flux, fluxMax }: FluxDisplayProps) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-cyan-400/20 bg-[var(--helix-glass)] px-4 py-2 backdrop-blur-md">
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-cyan-100/60">
          Flux
        </p>
        <p className="font-mono text-lg font-semibold text-[var(--helix-flux)]">
          {flux}/{fluxMax}
        </p>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: fluxMax }).map((_, index) => (
          <span
            key={index}
            className="h-3 w-3 rounded-full border border-cyan-300/30"
            style={{
              background:
                index < flux
                  ? "radial-gradient(circle at 30% 30%, #a5f3fc, #0891b2)"
                  : "transparent",
              boxShadow: index < flux ? "0 0 10px rgba(34,211,238,0.55)" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
