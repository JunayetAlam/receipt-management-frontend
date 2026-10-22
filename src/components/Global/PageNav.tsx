"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/** 1 … 4 5 [6] 7 8 … 20 — always keeps first/last and a window around the current page. */
export function getPageItems(page: number, totalPage: number, siblings = 1): PageItem[] {
  const maxSlots = siblings * 2 + 5; // first, last, current window, 2 ellipses
  if (totalPage <= maxSlots) {
    return Array.from({ length: totalPage }, (_, i) => i + 1);
  }
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, totalPage);
  const showStart = left > 2;
  const showEnd = right < totalPage - 1;
  const range = (a: number, b: number) =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const edgeCount = siblings * 2 + 3;

  if (!showStart && showEnd) return [...range(1, edgeCount), "end-ellipsis", totalPage];
  if (showStart && !showEnd)
    return [1, "start-ellipsis", ...range(totalPage - edgeCount + 1, totalPage)];
  return [1, "start-ellipsis", ...range(left, right), "end-ellipsis", totalPage];
}

interface PageNavProps {
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function PageNav({
  page,
  totalPage,
  onPageChange,
  disabled = false,
  className,
}: PageNavProps) {
  if (totalPage <= 1) return null;
  const current = Math.min(Math.max(page, 1), totalPage);
  const items = getPageItems(current, totalPage);
  const go = (p: number) => {
    if (p !== current && p >= 1 && p <= totalPage) onPageChange(p);
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-end gap-1", className)}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="First page"
        title="First page"
        className="hidden size-8 sm:inline-flex"
        disabled={disabled || current <= 1}
        onClick={() => go(1)}
      >
        <ChevronsLeft className="size-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        title="Previous page"
        className="size-8"
        disabled={disabled || current <= 1}
        onClick={() => go(current - 1)}
      >
        <ChevronLeft className="size-3.5" />
      </Button>

      {items.map((item) =>
        typeof item === "number" ? (
          <Button
            key={item}
            variant={item === current ? "default" : "outline"}
            size="sm"
            aria-label={`Page ${item}`}
            aria-current={item === current ? "page" : undefined}
            disabled={disabled && item !== current}
            onClick={() => go(item)}
            className={cn(
              "h-8 min-w-8 px-2 font-mono text-xs tabular-nums",
              item !== current && "text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </Button>
        ) : (
          <span
            key={item}
            aria-hidden
            className="inline-flex h-8 min-w-6 items-center justify-center text-xs text-muted-foreground"
          >
            …
          </span>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        title="Next page"
        className="size-8"
        disabled={disabled || current >= totalPage}
        onClick={() => go(current + 1)}
      >
        <ChevronRight className="size-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Last page"
        title="Last page"
        className="hidden size-8 sm:inline-flex"
        disabled={disabled || current >= totalPage}
        onClick={() => go(totalPage)}
      >
        <ChevronsRight className="size-3.5" />
      </Button>
    </nav>
  );
}
