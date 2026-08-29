import Link from "next/link";
import { useRouter } from "next/router";
import { formatScore, label, strengthBand, type Freshness, type MatrixCell, type MatrixState, type TrackSignal } from "../lib/radar";

export const stateLabel: Record<MatrixState, string> = {
  "confirming-in": "Confirming in",
  "confirming-out": "Confirming out",
  diverging: "Diverging",
  "flow-only": "Flow only",
  "pressure-only": "Pressure only",
  insufficient: "Insufficient",
  unavailable: "Unavailable",
};

export function cellName(cell: MatrixCell): string {
  return `${label[cell.region]} ${label[cell.assetClass]!.toLowerCase()}`;
}

export function StateBadge({ state }: { state: MatrixState }) {
  return <span className={`badge state-${state}`}>{stateLabel[state]}</span>;
}

export function FreshnessNote({ freshness, asOf }: { freshness: Freshness | null; asOf: string | null }) {
  if (!asOf) return <span className="muted">No dated evidence</span>;
  if (freshness === "current") return <span className="muted">As of {asOf}</span>;
  return (
    <span className="warn">
      {freshness === "stale" ? "Stale, carried" : "Expired"} · as of {asOf}
    </span>
  );
}

/** Direction is encoded by bar side and sign, not by colour alone. */
export function ScoreBar({ score }: { score: number }) {
  const width = `${Math.min(Math.abs(score), 100) / 2}%`;
  return (
    <span className="bar" aria-hidden="true">
      <span className="bar-axis" />
      <span className={score >= 0 ? "bar-fill positive-fill" : "bar-fill negative-fill"} style={score >= 0 ? { left: "50%", width } : { right: "50%", width }} />
    </span>
  );
}

export function TrackReading({ signal, track }: { signal: TrackSignal | null; track: "flowTrend" | "pressure" }) {
  if (!signal) {
    return (
      <div className="reading empty">
        <span className="track-name">{label[track]}</span>
        <span className="muted">Not defensible</span>
      </div>
    );
  }
  return (
    <div className="reading">
      <span className="track-name">{label[track]}</span>
      <span className="score">
        {formatScore(signal.score)}
        <span className="muted"> {strengthBand(signal.score)}</span>
      </span>
      <ScoreBar score={signal.score} />
      <span className="muted small">
        {signal.evidenceKinds.join(", ")} · {signal.usableInputs}/{signal.configuredInputs} inputs · as of {signal.asOf}
      </span>
    </div>
  );
}

export function CellLink({ cell, children, className }: { cell: MatrixCell; children: React.ReactNode; className?: string }) {
  const { pathname } = useRouter();
  if (cell.state === "unavailable") {
    return (
      <span className={className}>
        {children}
      </span>
    );
  }
  return (
    <Link className={className} href={{ pathname, query: { cell: cell.id } }} scroll={false} aria-label={`Open detail for ${cellName(cell)}`}>
      {children}
    </Link>
  );
}
