"use client";

import { memo, useEffect, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  panelClosed,
  panelMinimizedToggled,
  TBulkImportItem,
  TBulkImportStatus,
} from "@/redux/bulkImportSlice";
import { cancelBulkImport, retryFailedImports } from "@/redux/bulkImportRunner";

const STATUS_META: Record<
  TBulkImportStatus,
  { label: string; className: string }
> = {
  pending: { label: "Waiting", className: "text-muted-foreground" },
  creating: { label: "Creating...", className: "text-sky-600 dark:text-sky-400" },
  created: { label: "Created", className: "text-emerald-600 dark:text-emerald-400" },
  restored: { label: "Restored", className: "text-emerald-600 dark:text-emerald-400" },
  error: { label: "Failed", className: "text-rose-600 dark:text-rose-400" },
  cancelled: { label: "Cancelled", className: "text-muted-foreground" },
};

function StatusIcon({ status }: { status: TBulkImportStatus }) {
  const className = cn("size-4 shrink-0", STATUS_META[status].className);
  switch (status) {
    case "creating":
      return <Loader2 className={cn(className, "animate-spin")} />;
    case "created":
    case "restored":
      return <CheckCircle2 className={className} />;
    case "error":
      return <AlertCircle className={className} />;
    case "cancelled":
      return <Ban className={className} />;
    default:
      return <Clock className={className} />;
  }
}

const ImportRow = memo(function ImportRow({ item }: { item: TBulkImportItem }) {
  const meta = STATUS_META[item.status];
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 px-4 py-2 text-xs",
        item.status === "error" && "bg-rose-500/5",
      )}
    >
      <StatusIcon status={item.status} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground" title={item.payload.name}>
          {item.payload.name}
        </p>
        {item.error ? (
          <p className="mt-0.5 text-[11px] leading-snug text-rose-600 dark:text-rose-400">
            {item.error}
          </p>
        ) : (
          <p className={cn("mt-0.5 text-[11px]", meta.className)}>{meta.label}</p>
        )}
      </div>
    </li>
  );
});

type TFilter = "all" | "failed";

export default function BulkImportPanel() {
  const dispatch = useAppDispatch();
  const { items, isRunning, isOpen, isMinimized } = useAppSelector(
    (state) => state.bulkImport,
  );
  const [filter, setFilter] = useState<TFilter>("all");

  // Warn before closing the tab while products are still being created
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isRunning]);

  if (!isOpen || items.length === 0) return null;

  const total = items.length;
  const succeeded = items.filter(
    (i) => i.status === "created" || i.status === "restored",
  ).length;
  const failed = items.filter((i) => i.status === "error").length;
  const cancelled = items.filter((i) => i.status === "cancelled").length;
  const processed = succeeded + failed + cancelled;
  const percent = Math.round((processed / total) * 100);

  const title = isRunning
    ? `Creating ${Math.min(processed + 1, total)} of ${total} products`
    : failed > 0
      ? `${succeeded} created, ${failed} failed`
      : cancelled > 0
        ? `${succeeded} created, ${cancelled} cancelled`
        : `${succeeded} product${succeeded === 1 ? "" : "s"} created`;

  const visibleItems =
    filter === "failed" ? items.filter((i) => i.status === "error") : items;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 bg-muted/60 px-4 py-3">
        {isRunning ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-sky-600 dark:text-sky-400" />
        ) : failed > 0 ? (
          <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => dispatch(panelMinimizedToggled())}
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isRunning}
          onClick={() => dispatch(panelClosed())}
          title={isRunning ? "Import is still running" : "Close"}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-300",
            failed > 0 ? "bg-amber-500" : "bg-emerald-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {!isMinimized && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-md px-2 py-1 font-medium",
                  filter === "all"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All ({total})
              </button>
              <button
                type="button"
                onClick={() => setFilter("failed")}
                className={cn(
                  "rounded-md px-2 py-1 font-medium",
                  filter === "failed"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Failed ({failed})
              </button>
            </div>

            {isRunning ? (
              <button
                type="button"
                onClick={cancelBulkImport}
                className="font-medium text-rose-600 hover:underline dark:text-rose-400"
              >
                Cancel remaining
              </button>
            ) : (
              (failed > 0 || cancelled > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    dispatch(retryFailedImports());
                  }}
                  className="inline-flex items-center gap-1 font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  <RotateCcw className="size-3" />
                  Retry {failed + cancelled}
                </button>
              )
            )}
          </div>

          {/* Item list */}
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {visibleItems.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                No failed products
              </li>
            ) : (
              visibleItems.map((item) => <ImportRow key={item.id} item={item} />)
            )}
          </ul>
        </>
      )}
    </div>
  );
}
