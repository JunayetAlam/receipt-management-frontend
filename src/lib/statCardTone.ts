export type StatTone =
  | "blue"
  | "sky"
  | "indigo"
  | "violet"
  | "emerald"
  | "teal"
  | "amber"
  | "orange"
  | "rose";

// Full class strings are listed so Tailwind can detect them at build time.
const STAT_TONES: Record<
  StatTone,
  { card: string; icon: string; label: string }
> = {
  blue: {
    card: "border-blue-500/20 bg-linear-to-br from-blue-500/10 via-blue-500/[0.03] to-transparent",
    icon: "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/25 dark:text-blue-400",
    label: "text-blue-700/80 dark:text-blue-300/80",
  },
  sky: {
    card: "border-sky-500/20 bg-linear-to-br from-sky-500/10 via-sky-500/[0.03] to-transparent",
    icon: "bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/25 dark:text-sky-400",
    label: "text-sky-700/80 dark:text-sky-300/80",
  },
  indigo: {
    card: "border-indigo-500/20 bg-linear-to-br from-indigo-500/10 via-indigo-500/[0.03] to-transparent",
    icon: "bg-indigo-500/15 text-indigo-600 ring-1 ring-indigo-500/25 dark:text-indigo-400",
    label: "text-indigo-700/80 dark:text-indigo-300/80",
  },
  violet: {
    card: "border-violet-500/20 bg-linear-to-br from-violet-500/10 via-violet-500/[0.03] to-transparent",
    icon: "bg-violet-500/15 text-violet-600 ring-1 ring-violet-500/25 dark:text-violet-400",
    label: "text-violet-700/80 dark:text-violet-300/80",
  },
  emerald: {
    card: "border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-emerald-500/[0.03] to-transparent",
    icon: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400",
    label: "text-emerald-700/80 dark:text-emerald-300/80",
  },
  teal: {
    card: "border-teal-500/20 bg-linear-to-br from-teal-500/10 via-teal-500/[0.03] to-transparent",
    icon: "bg-teal-500/15 text-teal-600 ring-1 ring-teal-500/25 dark:text-teal-400",
    label: "text-teal-700/80 dark:text-teal-300/80",
  },
  amber: {
    card: "border-amber-500/20 bg-linear-to-br from-amber-500/10 via-amber-500/[0.03] to-transparent",
    icon: "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/25 dark:text-amber-400",
    label: "text-amber-700/80 dark:text-amber-300/80",
  },
  orange: {
    card: "border-orange-500/20 bg-linear-to-br from-orange-500/10 via-orange-500/[0.03] to-transparent",
    icon: "bg-orange-500/15 text-orange-600 ring-1 ring-orange-500/25 dark:text-orange-400",
    label: "text-orange-700/80 dark:text-orange-300/80",
  },
  rose: {
    card: "border-rose-500/20 bg-linear-to-br from-rose-500/10 via-rose-500/[0.03] to-transparent",
    icon: "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/25 dark:text-rose-400",
    label: "text-rose-700/80 dark:text-rose-300/80",
  },
};

/** Tinted gradient background and border for a stat card. */
export const statCardClass = (tone: StatTone) =>
  `border shadow-xs transition-shadow hover:shadow-sm ${STAT_TONES[tone].card}`;

/** Tinted icon tile for a stat card. */
export const statIconClass = (tone: StatTone) => STAT_TONES[tone].icon;

/** Tinted label text for a stat card. */
export const statLabelClass = (tone: StatTone) => STAT_TONES[tone].label;
