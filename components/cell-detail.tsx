import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { downloads } from "../lib/artifacts";
import { cellFor, inputsFor, release } from "../lib/fixture-release";
import { formatScore, label, sourceById, sourcesFor, type MatrixCell, type TrackSignal } from "../lib/radar";
import { cellName, FreshnessNote, StateBadge, TrackReading } from "./signal";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * URL-addressable detail sheet. The selected cell lives in the query string, so
 * links, reload, back and forward work without any client state container.
 */
export function CellDetail() {
  const router = useRouter();
  const raw = router.query.cell;
  const id = router.isReady && typeof raw === "string" ? raw : null;
  const cell = id ? cellFor(id) : undefined;

  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const close = () => {
    void router.push({ pathname: router.pathname }, undefined, { scroll: false });
  };

  useEffect(() => {
    if (!cell) return;
    opener.current = document.activeElement;
    dialog.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [cell?.id]);

  if (!cell) {
    // An unknown ?cell= value must not silently render nothing useful.
    return id ? (
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Unknown cell">
        <div className="drawer-body">
          <p>No cell is published for <code>{id}</code> in release {release.release}.</p>
          <Link href={{ pathname: router.pathname }}>Close</Link>
        </div>
      </div>
    ) : null;
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    if (!focusable.length) return;
    const first = focusable[0]!;
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div className="scrim" onClick={close} />
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        ref={dialog}
        onKeyDown={onKeyDown}
      >
        <div className="drawer-body">
          <div className="drawer-head">
            <div>
              <p className="eyebrow">{release.provenance === "fixture" ? "Fixture detail" : "Cell detail"}</p>
              <h2 id="drawer-title">{cellName(cell)}</h2>
            </div>
            <button type="button" onClick={close} className="close">
              Close
            </button>
          </div>

          <p className="drawer-state">
            <StateBadge state={cell.state} /> <FreshnessNote freshness={cell.freshness} asOf={cell.asOf} />
            {cell.confidence ? <span className="muted"> · {cell.confidence} confidence</span> : null}
          </p>

          {cell.note ? <p className="notice">{cell.note}</p> : null}

          <div className="tracks">
            <TrackReading signal={cell.flowTrend} track="flowTrend" />
            <TrackReading signal={cell.pressure} track="pressure" />
          </div>
          <p className="muted small">
            The two tracks are reported separately. Capflies never averages them into one score.
          </p>

          <h3>Configured inputs</h3>
          <div className="table-wrap">
          <table className="detail-table">
            <caption>
              Every series configured for this cell, whether or not it contributed to this release.
            </caption>
            <thead>
              <tr>
                <th scope="col">Series</th>
                <th scope="col">Track</th>
                <th scope="col">Evidence</th>
                <th scope="col">Transform</th>
                <th scope="col">As of</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {sourcesFor(cell.region, cell.assetClass).map((source) => {
                const input = inputsFor(cell).find((item) => item.sourceId === source.id);
                return (
                  <tr key={source.id}>
                    <th scope="row">
                      <a href={source.officialUrl} rel="noreferrer noopener" target="_blank">
                        {source.dataset}
                      </a>
                      <span className="muted small block">{source.series}</span>
                    </th>
                    <td>{label[source.track]}</td>
                    <td>{source.evidenceKind}</td>
                    <td>{source.transform}</td>
                    <td>{input ? input.asOf : "—"}</td>
                    <td className="num">{input ? formatScore(input.score) : "not used"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          <h3>Provenance</h3>
          <dl className="kv">
            <dt>Release</dt>
            <dd>
              {release.release} · methodology {release.methodologyVersion}
            </dd>
            <dt>Acceleration</dt>
            <dd>{describeAcceleration(cell)}</dd>
            <dt>History</dt>
            <dd>{release.reconstructed ? "Latest-vintage reconstruction, not a contemporaneous backtest." : "Live vintages only."}</dd>
            <dt>Downloads</dt>
            <dd>
              <a href={downloads.cells} download>
                cells.csv
              </a>{" "}
              ·{" "}
              <a href={downloads.inputs} download>
                inputs.csv
              </a>{" "}
              ·{" "}
              <a href={downloads.manifest} download>
                release.json
              </a>
            </dd>
          </dl>
        </div>
      </div>
    </>
  );
}

function describeAcceleration(cell: MatrixCell): string {
  const tracks = [cell.flowTrend, cell.pressure].filter((track): track is TrackSignal => track !== null);
  if (!tracks.length || tracks.every((track) => track.acceleration === null)) {
    return `Not comparable: ${release.release} has no previous release to compare against.`;
  }
  return tracks.map((track) => `${label[track.track]} ${track.acceleration}`).join(", ");
}
