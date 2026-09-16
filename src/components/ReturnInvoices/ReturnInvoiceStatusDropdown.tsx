"use client";

import { useState } from "react";
import { ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover";
import useIsAdmin from "@/hooks/useIsAdmin";
import { useUpdateReturnInvoiceStatusMutation } from "@/redux/api/returnInvoiceApi";
import { TReturnInvoice } from "@/types";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: ("PENDING" | "APPROVED" | "REJECTED")[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

interface ReturnInvoiceStatusDropdownProps {
  returnInvoice: TReturnInvoice;
  disabled?: boolean;
  className?: string;
}

export default function ReturnInvoiceStatusDropdown({
  returnInvoice,
  disabled = false,
  className,
}: ReturnInvoiceStatusDropdownProps) {
  const [isAdmin] = useIsAdmin();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateReturnInvoiceStatusMutation();
  const [openStatusPopover, setOpenStatusPopover] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmStatusChange = async (
    newStatus: "PENDING" | "APPROVED" | "REJECTED",
  ) => {
    try {
      setIsUpdating(true);
      await updateStatus({ id: returnInvoice.id, status: newStatus }).unwrap();
      toast.success(
        `Return ${returnInvoice.returnNumber} status updated to ${newStatus}`,
      );
      setOpenStatusPopover(null);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAdmin || returnInvoice.isDeleted) {
    return (
      <Badge
        variant="outline"
        className={cn(
          returnInvoice.status === "APPROVED"
            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]"
            : returnInvoice.status === "REJECTED"
              ? "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
              : "bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]",
          className,
        )}
      >
        {returnInvoice.status}
      </Badge>
    );
  }

  const isCurrentUpdating = isUpdating || isUpdatingStatus;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isCurrentUpdating}
          className={cn(
            "h-7 w-[115px] justify-between text-[11px] font-semibold border rounded-lg px-2.5 shadow-none focus:ring-1 focus:ring-ring transition-colors cursor-pointer",
            returnInvoice.status === "APPROVED" &&
              "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 hover:bg-emerald-500/25",
            returnInvoice.status === "REJECTED" &&
              "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25",
            returnInvoice.status === "PENDING" &&
              "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400 hover:bg-amber-500/25",
            className,
          )}
        >
          {isCurrentUpdating ? (
            <span className="flex items-center gap-1 mx-auto">
              <Loader2 className="size-3 animate-spin" /> Updating...
            </span>
          ) : (
            <>
              <span>{returnInvoice.status}</span>
              <ChevronDown className="size-3 opacity-60 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[130px] p-1 text-xs"
        onFocusOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement | null;
          if (target?.closest('[data-slot="popover-content"]')) {
            e.preventDefault();
          }
        }}
      >
        {STATUS_OPTIONS.map((statusOption) => {
          const isCurrent = returnInvoice.status === statusOption;
          if (isCurrent) {
            return (
              <DropdownMenuItem
                key={statusOption}
                disabled
                className="font-semibold text-xs opacity-60 bg-muted/50 cursor-default"
              >
                {statusOption} (Current)
              </DropdownMenuItem>
            );
          }

          const isPopoverOpenForThis = openStatusPopover === statusOption;
          const isOtherPopoverOpen =
            openStatusPopover !== null && openStatusPopover !== statusOption;

          return (
            <Popover
              key={statusOption}
              open={isPopoverOpenForThis}
              onOpenChange={(isOpen) => {
                if (isOpen) setOpenStatusPopover(statusOption);
                else if (!isCurrentUpdating) setOpenStatusPopover(null);
              }}
            >
              <PopoverTrigger asChild>
                <DropdownMenuItem
                  disabled={isOtherPopoverOpen}
                  onSelect={(e) => {
                    e.preventDefault();
                    setOpenStatusPopover(statusOption);
                  }}
                  className={cn(
                    "font-medium cursor-pointer rounded-lg px-2 py-1.5 text-xs transition-colors",
                    isPopoverOpenForThis && "bg-accent font-semibold",
                    statusOption === "APPROVED" &&
                      "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
                    statusOption === "REJECTED" &&
                      "text-destructive hover:bg-destructive/10",
                    statusOption === "PENDING" &&
                      "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
                  )}
                >
                  {statusOption}
                </DropdownMenuItem>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="start"
                sideOffset={8}
                className="w-72 gap-2.5 p-3.5 rounded-2xl shadow-xl border border-border bg-popover z-50"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <PopoverHeader className="gap-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>Confirm Status Change</span>
                  </div>
                  <PopoverDescription className="text-xs text-muted-foreground leading-relaxed">
                    Change status of{" "}
                    <span className="font-mono font-medium text-foreground">
                      {returnInvoice.returnNumber}
                    </span>{" "}
                    from <strong>{returnInvoice.status}</strong> to{" "}
                    <strong>{statusOption}</strong>?
                  </PopoverDescription>
                </PopoverHeader>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setOpenStatusPopover(null)}
                    disabled={isCurrentUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      "h-7 px-2.5 text-xs font-semibold text-white",
                      statusOption === "APPROVED" && "bg-emerald-600 hover:bg-emerald-700",
                      statusOption === "REJECTED" && "bg-destructive hover:bg-destructive/90",
                      statusOption === "PENDING" && "bg-amber-600 hover:bg-amber-700",
                    )}
                    onClick={() => handleConfirmStatusChange(statusOption)}
                    disabled={isCurrentUpdating}
                  >
                    {isCurrentUpdating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
