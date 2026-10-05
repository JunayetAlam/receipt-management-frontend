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
  Activity,
  AlertTriangle,
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
import ReturnInvoiceActivitySheet from "@/components/ReturnInvoices/ReturnInvoiceActivitySheet";
import ConfirmPopup from "@/components/Global/ConfirmPopup";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCustomerPrintValidation } from "@/utils/customerPrintValidation";
import CustomerFormModal from "@/components/Customers/CustomerFormModal";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";

export default function ReturnInvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [isAdmin] = useIsAdmin();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [customerEditOpen, setCustomerEditOpen] = useState(false);

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
    <div className="space-y-6 p-6 max-w-6xl mx-auto relative">
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manage Return Invoices
            </h1>
            <span className="font-mono text-xs text-muted-foreground">
              Return Invoice #{returnInvoice.returnNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Change Dropdown */}
          <ReturnInvoiceStatusDropdown returnInvoice={returnInvoice} />

          {/* View Invoice / Print Invoice */}
          {!returnInvoice.isDeleted && (
            <>
              <Link href={`/return-invoices/${returnInvoice.id}/invoice`}>
                <Button
                  variant="outline"
                  size="sm"
                  title="View Invoice"
                  className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <FileText className="size-3.5" /> View Invoice
                </Button>
              </Link>
              {(() => {
                const printValidation = getCustomerPrintValidation(
                  returnInvoice.receipt?.customer
                );
                if (printValidation.isPrintable) {
                  return (
                    <Link
                      href={`/return-invoices/${returnInvoice.id}/invoice?print=1`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        title="Print Invoice"
                        className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <Printer className="size-3.5" /> Print Invoice
                      </Button>
                    </Link>
                  );
                }
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-not-allowed">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="h-8 gap-1.5 text-xs font-medium text-muted-foreground pointer-events-none opacity-50"
                        >
                          <Printer className="size-3.5" /> Print Invoice
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs text-xs text-center"
                    >
                      {printValidation.warningMessage}
                    </TooltipContent>
                  </Tooltip>
                );
              })()}
            </>
          )}

          {/* Activity Log Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivitySheetOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            title="Return Invoice Activity Log"
          >
            <Activity className="size-3.5" />
            Activity Log
          </Button>

          {/* Edit return invoice if allowed */}
          {!returnInvoice.isDeleted &&
            (isAdmin || returnInvoice.status !== "APPROVED") &&
            returnInvoice.isLatest !== false && (
              <Link href={`/return-invoices/${returnInvoice.id}/edit`}>
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
          {isAdmin && returnInvoice.isDeleteRequested ? (
            <div className="flex items-center gap-1.5 border-l border-border pl-1.5 ml-1">
              <ConfirmPopup
                title="Approve Deletion Request?"
                description={`Confirm deletion of Return Invoice "${returnInvoice.returnNumber}"? Stock will be adjusted.`}
                confirmLabel="Confirm Delete"
                destructive={true}
                loading={isConfirming}
                onConfirm={async () => {
                  try {
                    await confirmDelete(returnInvoice.id).unwrap();
                    toast.success("Return invoice deletion confirmed");
                    router.push("/return-invoices");
                  } catch (err) {
                    toast.error(errorMessageGenerator(err));
                  }
                }}
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
                description={`Reject deletion request for "${returnInvoice.returnNumber}"?`}
                confirmLabel="Reject"
                destructive={false}
                loading={isRejecting}
                onConfirm={async () => {
                  try {
                    await rejectDelete(returnInvoice.id).unwrap();
                    toast.success("Deletion request rejected");
                  } catch (err) {
                    toast.error(errorMessageGenerator(err));
                  }
                }}
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
          ) : returnInvoice.isDeleted && isAdmin ? (
            returnInvoice.canRestore !== false ? (
              <ConfirmPopup
                title="Restore Return Invoice?"
                description={`Restore deleted Return "${returnInvoice.returnNumber}"? Stock will be restored again.`}
                confirmLabel="Restore Return"
                destructive={false}
                loading={isRestoring}
                onConfirm={async () => {
                  try {
                    await restoreReturn(returnInvoice.id).unwrap();
                    toast.success("Return invoice restored successfully");
                  } catch (err) {
                    toast.error(errorMessageGenerator(err));
                  }
                }}
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
              <span
                className="text-xs text-muted-foreground italic px-2"
                title="Cannot restore: a newer return exists on this receipt"
              >
                Restore locked (newer return exists)
              </span>
            )
          ) : (
            !returnInvoice.isDeleted && (
              returnInvoice.isDeleteRequested && !isAdmin ? (
                <Badge
                  variant="secondary"
                  className="h-8 px-2.5 text-xs text-amber-600 bg-amber-500/10 cursor-not-allowed"
                >
                  Delete Requested
                </Badge>
              ) : (
                (isAdmin || returnInvoice.status !== "APPROVED") &&
                returnInvoice.isLatest !== false && (
                  <Button
                    variant="outline"
                    size="sm"
                    title={isAdmin ? "Delete Return Invoice" : "Request Delete"}
                    onClick={() => setDeleteModalOpen(true)}
                    className="h-8 gap-1.5 text-xs font-medium text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    {isAdmin ? "Delete" : "Request Delete"}
                  </Button>
                )
              )
            )
          )}
        </div>
      </div>

      {(() => {
        const printValidation = getCustomerPrintValidation(
          returnInvoice?.receipt?.customer
        );
        if (printValidation.isPrintable) return null;
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/40 p-3.5 text-amber-900 dark:text-amber-200 shadow-xs mb-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Return Invoice Incomplete for Printing
                </p>
                <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
                  {printValidation.warningMessage}
                </p>
              </div>
            </div>
            {returnInvoice?.receipt?.customer && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCustomerEditOpen(true)}
                className="shrink-0 text-xs border-amber-400/80 bg-white hover:bg-amber-100 text-amber-950 dark:bg-zinc-900 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-950 font-medium gap-1.5 h-8 px-3 cursor-pointer shadow-xs"
              >
                <Pencil className="size-3.5" /> Add Missing Customer Details
              </Button>
            )}
          </div>
        );
      })()}

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ReturnInvoiceForm initialData={returnInvoice} isDetails />
      </Suspense>

      <ReturnInvoiceDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        returnInvoice={returnInvoice}
        onSuccess={() => router.push("/return-invoices")}
      />

      <ReturnInvoiceActivitySheet
        open={activitySheetOpen}
        onOpenChange={setActivitySheetOpen}
        returnInvoice={returnInvoice}
      />

      {returnInvoice?.receipt?.customer && (
        <CustomerFormModal
          open={customerEditOpen}
          onOpenChange={setCustomerEditOpen}
          customerToEdit={returnInvoice.receipt.customer as any}
          requireAddress
        />
      )}
    </div>
  );
}
