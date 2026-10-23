"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmPopup from "./ConfirmPopup";

type PermanentDeleteButtonProps = {
  /** Display name, e.g. product name or receipt number */
  label: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

/** Superadmin-only: permanently deletes ONE archived record. */
export function PermanentDeleteButton({
  label,
  loading,
  onConfirm,
}: PermanentDeleteButtonProps) {
  return (
    <ConfirmPopup
      title="Delete Permanently?"
      description={`"${label}" will be removed for good and can no longer be restored.`}
      confirmLabel="Delete Forever"
      destructive
      loading={loading}
      onConfirm={onConfirm}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
        title="Delete permanently"
      >
        <Trash2 className="mr-1 size-3" />
        Delete
      </Button>
    </ConfirmPopup>
  );
}

type ClearArchiveButtonProps = {
  /** Plural noun, e.g. "products" */
  entityPlural: string;
  count: number;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

/** Superadmin-only: permanently deletes EVERY archived record of this type. */
export function ClearArchiveButton({
  entityPlural,
  count,
  loading,
  onConfirm,
}: ClearArchiveButtonProps) {
  return (
    <ConfirmPopup
      title="Clear Archive?"
      description={`All ${count} archived ${entityPlural} will be permanently deleted and can no longer be restored.`}
      confirmLabel="Clear All"
      destructive
      loading={loading}
      side="bottom"
      align="end"
      onConfirm={onConfirm}
    >
      <Button
        variant="destructive"
        disabled={loading || count === 0}
        className="h-9 gap-1.5 text-xs font-semibold"
      >
        <Trash2 className="size-4" />
        Clear All
      </Button>
    </ConfirmPopup>
  );
}
