import { cn } from "@/lib/utils";

type TabTone =
  | "indigo"
  | "sky"
  | "emerald"
  | "teal"
  | "amber"
  | "rose"
  | "slate"
  | "violet"
  | "orange";

// Full class strings are listed so Tailwind can detect them at build time.
const TONES: Record<
  TabTone,
  { pill: string; underline: string; hover: string }
> = {
  indigo: {
    pill: "bg-indigo-500/15 text-indigo-700 ring-1 ring-indigo-500/30 dark:text-indigo-300",
    underline: "border-indigo-500 text-indigo-700 dark:text-indigo-300",
    hover: "hover:text-indigo-600 dark:hover:text-indigo-300",
  },
  sky: {
    pill: "bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/30 dark:text-sky-300",
    underline: "border-sky-500 text-sky-700 dark:text-sky-300",
    hover: "hover:text-sky-600 dark:hover:text-sky-300",
  },
  emerald: {
    pill: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300",
    underline: "border-emerald-500 text-emerald-700 dark:text-emerald-300",
    hover: "hover:text-emerald-600 dark:hover:text-emerald-300",
  },
  teal: {
    pill: "bg-teal-500/15 text-teal-700 ring-1 ring-teal-500/30 dark:text-teal-300",
    underline: "border-teal-500 text-teal-700 dark:text-teal-300",
    hover: "hover:text-teal-600 dark:hover:text-teal-300",
  },
  amber: {
    pill: "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300",
    underline: "border-amber-500 text-amber-700 dark:text-amber-300",
    hover: "hover:text-amber-600 dark:hover:text-amber-300",
  },
  rose: {
    pill: "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/30 dark:text-rose-300",
    underline: "border-rose-500 text-rose-700 dark:text-rose-300",
    hover: "hover:text-rose-600 dark:hover:text-rose-300",
  },
  slate: {
    pill: "bg-slate-500/15 text-slate-700 ring-1 ring-slate-500/30 dark:text-slate-300",
    underline: "border-slate-500 text-slate-700 dark:text-slate-300",
    hover: "hover:text-slate-700 dark:hover:text-slate-200",
  },
  violet: {
    pill: "bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/30 dark:text-violet-300",
    underline: "border-violet-500 text-violet-700 dark:text-violet-300",
    hover: "hover:text-violet-600 dark:hover:text-violet-300",
  },
  orange: {
    pill: "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/30 dark:text-orange-300",
    underline: "border-orange-500 text-orange-700 dark:text-orange-300",
    hover: "hover:text-orange-600 dark:hover:text-orange-300",
  },
};

// The same tab value gets the same color on every page.
const TONE_BY_TAB: Record<string, TabTone> = {
  ALL: "indigo",
  CUSTOMER: "sky",
  RETAILER: "emerald",
  ACTIVE: "teal",
  PENDING: "amber",
  APPROVED: "emerald",
  PENDING_DELETION: "rose",
  ARCHIVED: "slate",
  RECEIPT: "sky",
  PAYMENT: "emerald",
  RETURN_INVOICE: "orange",
  LIST: "violet",
  GRID: "amber",
  TIMELINE: "violet",
  TABLE: "amber",
  SHOP: "violet",
};

const getTone = (tab: string) => TONES[TONE_BY_TAB[tab.toUpperCase()] ?? "teal"];

/** Segmented (pill) tab: tinted background when active, tinted hover otherwise. */
export const tabPillClass = (tab: string, active: boolean) => {
  const tone = getTone(tab);
  return active
    ? cn(tone.pill, "shadow-xs font-semibold")
    : cn("text-muted-foreground", tone.hover);
};

/** Underlined tab: colored bottom border and text when active. */
export const tabUnderlineClass = (tab: string, active: boolean) => {
  const tone = getTone(tab);
  return active
    ? cn(tone.underline, "font-semibold")
    : cn("border-transparent text-muted-foreground", tone.hover);
};
