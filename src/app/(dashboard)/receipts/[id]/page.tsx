"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetReceiptByIdQuery,
  useConfirmDeleteReceiptMutation,
  useRejectDeleteReceiptMutation,
  useRestoreReceiptMutation,
} from "@/redux/api/receiptApi";
import useIsAdmin from "@/hooks/useIsAdmin";
import ReceiptForm from "@/components/Receipts/ReceiptForm";
import ReceiptStatusDropdown from "@/components/Receipts/ReceiptStatusDropdown";
import ReceiptDeleteModal from "@/components/Receipts/ReceiptDeleteModal";
import ConfirmPopup from "@/components/Global/ConfirmPopup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";

export default function ReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isAdmin] = useIsAdmin();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetReceiptByIdQuery(id, {
    skip: !id,
  });
  const receipt = data?.data;

  const [confirmDelete, { isLoading: isConfirming }] =
    useConfirmDeleteReceiptMutation();
  const [rejectDelete, { isLoading: isRejecting }] =
    useRejectDeleteReceiptMutation();
  const [restoreReceipt, { isLoading: isRestoring }] =
    useRestoreReceiptMutation();

  const handleAdminConfirmDelete = async () => {
    if (!receipt) return;
    try {
      await confirmDelete(receipt.id).unwrap();
      toast.success(
        `Receipt ${receipt.receiptNumber} deletion confirmed. Stock restored.`
      );
      router.push("/receipts");
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRejectDelete = async () => {
    if (!receipt) return;
    try {
      await rejectDelete(receipt.id).unwrap();
      toast.success(
        `Deletion request for Receipt ${receipt.receiptNumber} rejected.`
      );
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRestore = async () => {
    if (!receipt) return;
    try {
      const res: any = await restoreReceipt(receipt.id).unwrap();
      toast.success(`Receipt ${receipt.receiptNumber} restored successfully.`);
      if (res?.data?.warnings && res.data.warnings.length > 0) {
        res.data.warnings.forEach((w: string) => toast.warning(w));
      }
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/receipts">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              title="Back to Receipts"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manage Receipts
            </h1>
            {receipt && (
              <span className="font-mono text-xs text-muted-foreground">
                Receipt #{receipt.receiptNumber}
              </span>
            )}
          </div>
        </div>

        {receipt && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Change Dropdown */}
            <ReceiptStatusDropdown receipt={receipt} />

            {/* View Invoice */}
            <Link href={`/receipts/${receipt.id}/invoice`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 font-medium"
              >
                <FileText className="size-3.5" /> Invoice (A4)
              </Button>
            </Link>

            {/* Edit receipt if allowed */}
            {!receipt.isDeleted && (isAdmin || receipt.status !== "APPROVED") && (
              <Link href={`/receipts/${receipt.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium"
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
              </Link>
            )}

            {/* Deletion & Restoration Actions */}
            {isAdmin && receipt.isDeleteRequested ? (
              <div className="flex items-center gap-1.5 border-l border-border pl-1.5 ml-1">
                <ConfirmPopup
                  title="Approve Deletion Request?"
                  description={`Confirm deletion of Receipt "${receipt.receiptNumber}"? Stock will be restored.`}
                  confirmLabel="Confirm Delete"
                  destructive={true}
                  loading={isConfirming}
                  onConfirm={handleAdminConfirmDelete}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium gap-1"
                  >
                    <Check className="size-3.5" /> Delete
                  </Button>
                </ConfirmPopup>
                <ConfirmPopup
                  title="Reject Deletion Request?"
                  description={`Reject deletion request for "${receipt.receiptNumber}"?`}
                  confirmLabel="Reject"
                  destructive={false}
                  loading={isRejecting}
                  onConfirm={handleAdminRejectDelete}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
                  >
                    <X className="size-3.5" /> Reject
                  </Button>
                </ConfirmPopup>
              </div>
            ) : receipt.isDeleted && isAdmin ? (
              <ConfirmPopup
                title="Restore Receipt?"
                description={`Restore deleted Receipt "${receipt.receiptNumber}"? Stock will be re-deducted.`}
                confirmLabel="Restore Receipt"
                destructive={false}
                loading={isRestoring}
                onConfirm={handleAdminRestore}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-medium text-primary border-primary/40 hover:bg-primary/10 gap-1.5"
                >
                  <RotateCcw className="size-3.5" /> Restore
                </Button>
              </ConfirmPopup>
            ) : (
              !receipt.isDeleted && (
                receipt.isDeleteRequested && !isAdmin ? (
                  <Badge
                    variant="secondary"
                    className="h-8 px-2.5 text-xs text-amber-600 bg-amber-500/10 cursor-not-allowed"
                  >
                    Delete Requested
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    title={isAdmin ? "Delete Receipt" : "Request Delete"}
                    onClick={() => setDeleteModalOpen(true)}
                    className="h-8 gap-1.5 text-xs font-medium text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    {isAdmin ? "Delete" : "Request Delete"}
                  </Button>
                )
              )
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError || !receipt ? (
        <div className="p-8 text-center space-y-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-destructive font-semibold">
            Receipt not found or failed to load
          </p>
          <Link href="/receipts">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Receipts
            </Button>
          </Link>
        </div>
      ) : (
        <ReceiptForm initialData={receipt} isEditing={true} isDetails={true} />
      )}

      {/* Delete / Request Delete Modal */}
      <ReceiptDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        receipt={receipt ?? null}
        onSuccess={() => router.push("/receipts")}
      />
    </div>
  );
}
