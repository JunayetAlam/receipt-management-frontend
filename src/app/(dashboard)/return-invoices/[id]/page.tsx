"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Printer,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetReturnInvoiceByIdQuery,
  useConfirmDeleteReturnInvoiceMutation,
  useRejectDeleteReturnInvoiceMutation,
  useRestoreReturnInvoiceMutation,
} from "@/redux/api/returnInvoiceApi";
import useIsAdmin from "@/hooks/useIsAdmin";
import ReturnInvoiceForm from "@/components/ReturnInvoices/ReturnInvoiceForm";
import ReturnInvoiceStatusDropdown from "@/components/ReturnInvoices/ReturnInvoiceStatusDropdown";
import ReturnInvoiceDeleteModal from "@/components/ReturnInvoices/ReturnInvoiceDeleteModal";
import ConfirmPopup from "@/components/Global/ConfirmPopup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";

export default function ReturnInvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isAdmin] = useIsAdmin();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetReturnInvoiceByIdQuery(id, {
    skip: !id,
  });
  const returnInvoice = data?.data;

  const [confirmDelete, { isLoading: isConfirming }] =
    useConfirmDeleteReturnInvoiceMutation();
  const [rejectDelete, { isLoading: isRejecting }] =
    useRejectDeleteReturnInvoiceMutation();
  const [restoreReturn, { isLoading: isRestoring }] =
    useRestoreReturnInvoiceMutation();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !returnInvoice) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-3">
        <p className="text-destructive font-semibold">
          Return invoice not found
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Go Back</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            title="Go Back"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Return Invoice
            </h1>
            <span className="font-mono text-xs text-muted-foreground">
              {returnInvoice.returnNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ReturnInvoiceStatusDropdown returnInvoice={returnInvoice} />

          {!returnInvoice.isDeleted && (
            <>
              <Link href={`/return-invoices/${returnInvoice.id}/invoice`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <FileText className="size-3.5" /> View Invoice
                </Button>
              </Link>
              <Link
                href={`/return-invoices/${returnInvoice.id}/invoice?print=1`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <Printer className="size-3.5" /> Print
                </Button>
              </Link>
              {(isAdmin || returnInvoice.status !== "APPROVED") &&
                returnInvoice.isLatest !== false &&
                !returnInvoice.isDeleted && (
                <Link href={`/return-invoices/${returnInvoice.id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                </Link>
              )}
            </>
          )}

          {isAdmin &&
          returnInvoice.isDeleteRequested &&
          !returnInvoice.isDeleted &&
          returnInvoice.isLatest !== false ? (
            <div className="flex items-center gap-1.5 border-l pl-1.5 ml-1">
              <ConfirmPopup
                title="Confirm deletion?"
                description={`Delete ${returnInvoice.returnNumber}? Only the latest return can be deleted.`}
                confirmLabel="Confirm"
                destructive
                loading={isConfirming}
                onConfirm={async () => {
                  try {
                    await confirmDelete(returnInvoice.id).unwrap();
                    toast.success("Deleted");
                    router.push("/return-invoices");
                  } catch (err) {
                    toast.error(errorMessageGenerator(err));
                  }
                }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <Check className="size-3.5" /> Delete
                </Button>
              </ConfirmPopup>
              <ConfirmPopup
                title="Reject deletion?"
                description={`Reject delete request for ${returnInvoice.returnNumber}?`}
                confirmLabel="Reject"
                loading={isRejecting}
                onConfirm={async () => {
                  try {
                    await rejectDelete(returnInvoice.id).unwrap();
                    toast.success("Request rejected");
                  } catch (err) {
                    toast.error(errorMessageGenerator(err));
                  }
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <X className="size-3.5" /> Reject
                </Button>
              </ConfirmPopup>
            </div>
          ) : returnInvoice.isDeleted && isAdmin && returnInvoice.canRestore !== false ? (
            <ConfirmPopup
              title="Restore?"
              description={`Restore ${returnInvoice.returnNumber}? Not allowed if a newer return already exists.`}
              confirmLabel="Restore"
              loading={isRestoring}
              onConfirm={async () => {
                try {
                  await restoreReturn(returnInvoice.id).unwrap();
                  toast.success("Restored");
                } catch (err) {
                  toast.error(errorMessageGenerator(err));
                }
              }}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
              >
                <RotateCcw className="size-3.5" /> Restore
              </Button>
            </ConfirmPopup>
          ) : returnInvoice.isDeleted && isAdmin && returnInvoice.canRestore === false ? (
            <span className="text-xs text-muted-foreground px-2">
              Restore locked (newer return exists)
            </span>
          ) : (
            !returnInvoice.isDeleted &&
            returnInvoice.isLatest !== false && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 text-destructive"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            )
          )}
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ReturnInvoiceForm initialData={returnInvoice} isDetails />
      </Suspense>

      <ReturnInvoiceDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        returnInvoice={returnInvoice}
        onSuccess={() => router.push("/return-invoices")}
      />
    </div>
  );
}
