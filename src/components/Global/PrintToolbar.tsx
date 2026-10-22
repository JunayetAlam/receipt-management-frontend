"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Toolbar above every printable view (invoices and list exports), so the
 * controls sit in the same place everywhere:
 *
 *   [← Go Back]  [ view controls (wrap if needed) ]  [Print / Save as PDF]
 *
 * The three parts are fixed grid columns, so the Print button always stays in
 * the top-right corner; only the middle controls wrap onto extra lines.
 */
export default function PrintToolbar({
  children,
  onPrint,
  printDisabledReason,
}: {
  /** View-specific controls (text size, copy tabs, page count…), right-aligned in the middle. */
  children?: ReactNode;
  onPrint: () => void;
  /** When set, Print is disabled and this explains why (tooltip). */
  printDisabledReason?: string;
}) {
  const router = useRouter();

  return (
    <div className="max-w-[210mm] mx-auto px-4 mb-6 grid grid-cols-[auto_1fr_auto] items-start gap-3 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 shadow-xs bg-card cursor-pointer"
      >
        <ArrowLeft className="size-4" />
        <span className="hidden sm:inline">Go Back</span>
      </Button>

      <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
        {children}
      </div>

      {printDisabledReason ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-not-allowed">
              <Button
                disabled
                className="gap-2 font-semibold shadow-xs pointer-events-none opacity-50"
                size="sm"
              >
                <Printer className="size-4" /> Print / Save as PDF
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-xs text-center">
            {printDisabledReason}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          onClick={onPrint}
          className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs hover:opacity-95 cursor-pointer"
          size="sm"
        >
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
      )}
    </div>
  );
}
