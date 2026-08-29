import { assetClasses, formatScore, label, regions, type MatrixCell } from "../lib/radar";
import { CellLink, cellName, stateLabel } from "./signal";

function summary(cell: MatrixCell): string {
  if (cell.state === "unavailable") return "No v1 source configured";
  if (cell.state === "insufficient") return "Evidence below the coverage rule";
  const parts = [
    `flow ${cell.flowTrend ? formatScore(cell.flowTrend.score) : "—"}`,
    `pressure ${cell.pressure ? formatScore(cell.pressure.score) : "—"}`,
  ];
  return parts.join(", ");
}

export function Matrix({ cells }: { cells: MatrixCell[] }) {
  const find = (region: string, assetClass: string) =>
    cells.find((cell) => cell.region === region && cell.assetClass === assetClass)!;

  return (
    <div className="table-wrap">
      <table className="matrix">
        <caption>
          Rotation matrix. Each supported cell keeps measured flow trend separate from leading pressure; the two are
          never combined into one score. Select a cell for its inputs, dates, and downloads.
        </caption>
        <thead>
          <tr>
            <th scope="col">Region</th>
            {assetClasses.map((assetClass) => (
              <th key={assetClass} scope="col">
                {label[assetClass]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region}>
              <th scope="row">{label[region]}</th>
              {assetClasses.map((assetClass) => {
                const cell = find(region, assetClass);
                return (
                  <td key={assetClass} className={`cell state-${cell.state}`}>
                    <CellLink cell={cell} className="cell-link">
                      <span className="cell-state">{stateLabel[cell.state]}</span>
                      {cell.state === "unavailable" ? null : (
                      <span className="cell-scores">
                        <span className={cell.flowTrend ? "flow" : "muted"}>
                          F {cell.flowTrend ? formatScore(cell.flowTrend.score) : "—"}
                        </span>
                        <span className={cell.pressure ? "press" : "muted"}>
                          P {cell.pressure ? formatScore(cell.pressure.score) : "—"}
                        </span>
                      </span>
                      )}
                      {cell.freshness && cell.freshness !== "current" ? (
                        <span className="cell-flag">{cell.freshness}</span>
                      ) : null}
                    </CellLink>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Deterministic ranked alternative to the matrix; also the mobile reading order. */
export function RankedList({ cells, limit }: { cells: MatrixCell[]; limit?: number }) {
  const shown = limit ? cells.slice(0, limit) : cells;
  return (
    <ol className="ranked">
      {shown.map((cell) => (
        <li key={cell.id}>
          <CellLink cell={cell} className="ranked-item">
            <span className="ranked-name">{cellName(cell)}</span>
            <span className="ranked-state">{stateLabel[cell.state]}</span>
            <span className="ranked-scores">{summary(cell)}</span>
          </CellLink>
        </li>
      ))}
    </ol>
  );
}
