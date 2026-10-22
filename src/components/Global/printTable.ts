import { SCALED_BASE_FONT } from "./TextSizeControl";

// Shared look for every printable table (list exports), matching the invoice
// product table: dark border on every cell, light gray on every even row, and
// compact rows. All sizes are in `em` off `SCALED_BASE_FONT`, so the view's
// text-size control scales text, row height and column widths together.

/** Put on the <table>: base font size that the `em` sizes below build on. */
export const PRINT_TABLE_STYLE = { fontSize: SCALED_BASE_FONT };

export const PRINT_TH =
  "h-[2.4em] px-[0.6em] py-[0.4em] text-left align-middle text-[1em] font-bold uppercase tracking-wider text-black whitespace-nowrap border border-slate-700 bg-slate-50";

export const PRINT_TD =
  "px-[0.6em] py-[0.3em] border border-slate-700 align-middle text-[1em] leading-tight text-slate-900";

/** Row background: every even row (2nd, 4th, …) gets a light gray, counted across pages. */
export const printRowClass = (index: number) =>
  index % 2 === 1 ? "bg-slate-100" : "";
