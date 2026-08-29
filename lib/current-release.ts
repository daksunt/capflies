/** Release selector: fixture by default; official only when explicitly requested at build time. */
import * as fixture from "./fixture-release.ts";
import * as official from "./official-release.ts";

const selected = process.env.CAPFLIES_RELEASE === "official" ? official : fixture;

export const cells = selected.cells;
export const release = selected.release;
export const brief = selected.brief;
export const cellFor = selected.cellFor;
export const inputsFor = selected.inputsFor;
export const releaseInputs = process.env.CAPFLIES_RELEASE === "official" ? official.releaseInputs : fixture.fixtureInputs;
