"use client";

import { useState } from "react";
import { Minus, Plus, RotateCcw, Type } from "lucide-react";

/**
 * Text-size control shared by every printable view (invoices and list exports).
 *
 * The view puts `--invoice-text-scale` on its root (see `textScaleStyle`), and
 * its tables size everything in `em` off `SCALED_BASE_FONT`, so text, row
 * heights and column widths scale together. Pages are measured from probes
 * rendered under the same root, so pagination and print follow the chosen size.
 */
export const TEXT_SCALE_MIN = 0.6;
export const TEXT_SCALE_MAX = 1.3;
export const TEXT_SCALE_STEP = 0.05;

/** Base font size (10px at 100%) for tables/summaries that size themselves in `em`. */
export const SCALED_BASE_FONT = "calc(10px * var(--invoice-text-scale, 1))";

export const clampTextScale = (value: number) =>
  Math.round(
    Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, value)) * 100,
  ) / 100;

/** Style for the view's root element: exposes the scale to everything inside, probes included. */
export const textScaleStyle = (scale: number) => ({
  ["--invoice-text-scale" as string]: scale,
});

/**
 * Text scale for one view. Each view keeps its own size, and it is not saved:
 * every load starts at the default 100%.
 */
export function useTextScale() {
  const [scale, setScale] = useState(1);
  const changeScale = (value: number) => setScale(clampTextScale(value));
  return [scale, changeScale] as const;
}

const iconButtonClass =
  "inline-flex size-6 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

/** Toolbar meter: − / slider / + / percentage / reset. Hidden when printing. */
export default function TextSizeControl({
  scale,
  onChange,
}: {
  scale: number;
  onChange: (scale: number) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1 py-0.5 shadow-xs print:hidden"
      title="Text size"
    >
      <Type
        className="ml-0.5 size-3.5 shrink-0 text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => onChange(scale - TEXT_SCALE_STEP)}
        disabled={scale <= TEXT_SCALE_MIN}
        className={iconButtonClass}
        title="Smaller text"
        aria-label="Smaller text"
      >
        <Minus className="size-3.5" />
      </button>
      <input
        type="range"
        min={TEXT_SCALE_MIN}
        max={TEXT_SCALE_MAX}
        step={TEXT_SCALE_STEP}
        value={scale}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 accent-primary cursor-pointer"
        aria-label="Text size"
      />
      <button
        type="button"
        onClick={() => onChange(scale + TEXT_SCALE_STEP)}
        disabled={scale >= TEXT_SCALE_MAX}
        className={iconButtonClass}
        title="Larger text"
        aria-label="Larger text"
      >
        <Plus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
        {Math.round(scale * 100)}%
      </span>
      {scale !== 1 && (
        <button
          type="button"
          onClick={() => onChange(1)}
          className={iconButtonClass}
          title="Reset to default size"
          aria-label="Reset to default size"
        >
          <RotateCcw className="size-3.5" />
        </button>
      )}
    </div>
  );
}
