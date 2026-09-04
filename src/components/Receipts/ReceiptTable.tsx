"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Plus,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Banknote,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Archive,
  Phone,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllReceiptsQuery,
  useUpdateReceiptStatusMutation,
  useConfirmDeleteReceiptMutation,
  useRejectDeleteReceiptMutation,
  useRestoreReceiptMutation,
} from "@/redux/api/receiptApi";
import useIsAdmin from "@/hooks/useIsAdmin";
import { TReceipt } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmPopup from "../Global/ConfirmPopup";
import ReceiptDetailsSheet from "./ReceiptDetailsSheet";
import ReceiptDeleteModal from "./ReceiptDeleteModal";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { cn } from "@/lib/utils";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type TabType = "ALL" | "PENDING" | "APPROVED" | "PENDING_DELETION" | "ARCHIVED";

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Total: High to Low", sortBy: "totalAmount", sortOrder: "desc" },
  { label: "Total: Low to High", sortBy: "totalAmount", sortOrder: "asc" },
];

export default function ReceiptTable() {
  const [isAdmin] = useIsAdmin();

  // Filters & State
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals & Sheets
  const [selectedReceiptForDetails, setSelectedReceiptForDetails] = useState<TReceipt | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  const [selectedReceiptForDelete, setSelectedReceiptForDelete] = useState<TReceipt | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Mutations
  const [updateReceiptStatus, { isLoading: isUpdatingStatus }] = useUpdateReceiptStatusMutation();
  const [confirmDelete, { isLoading: isConfirming }] = useConfirmDeleteReceiptMutation();
  const [rejectDelete, { isLoading: isRejecting }] = useRejectDeleteReceiptMutation();
  const [restoreReceipt, { isLoading: isRestoring }] = useRestoreReceiptMutation();

  // Query Params
  const queryParams: Record<string, unknown> = {
    page,
    limit,
    sortBy: sortOption.sortBy,
    sortOrder: sortOption.sortOrder,
  };

  if (searchTerm.trim()) {
    queryParams.searchTerm = searchTerm.trim();
  }

  // Tab Filtering
  if (activeTab === "ALL") {
    queryParams.isDeleted = false;
  } else if (activeTab === "PENDING") {
    queryParams.isDeleted = false;
    queryParams.status = "PENDING";
  } else if (activeTab === "APPROVED") {
    queryParams.isDeleted = false;
    queryParams.status = "APPROVED";
  } else if (activeTab === "PENDING_DELETION") {
    queryParams.isDeleted = false;
    queryParams.isDeleteRequested = true;
  } else if (activeTab === "ARCHIVED") {
    queryParams.isDeleted = true;
  }

  const { data: response, isLoading, isFetching } = useGetAllReceiptsQuery(queryParams);
  const receipts = response?.data || [];
  const meta = response?.meta;

  const handleOpenDetails = (r: TReceipt) => {
    setSelectedReceiptForDetails(r);
    setDetailsSheetOpen(true);
  };

  const handleOpenDelete = (r: TReceipt) => {
    setSelectedReceiptForDelete(r);
    setDeleteModalOpen(true);
  };

  // Admin Quick Status Actions
  const handleAdminApprove = async (r: TReceipt) => {
    try {
      await updateReceiptStatus({ id: r.id, status: "APPROVED" }).unwrap();
      toast.success(`Receipt ${r.receiptNumber} approved successfully!`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminReject = async (r: TReceipt) => {
    try {
      await updateReceiptStatus({ id: r.id, status: "REJECTED" }).unwrap();
      toast.success(`Receipt ${r.receiptNumber} rejected.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminConfirmDelete = async (r: TReceipt) => {
    try {
      await confirmDelete(r.id).unwrap();
      toast.success(`Receipt ${r.receiptNumber} deletion confirmed. Stock restored.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRejectDelete = async (r: TReceipt) => {
    try {
      await rejectDelete(r.id).unwrap();
      toast.success(`Deletion request for Receipt ${r.receiptNumber} rejected.`);
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const handleAdminRestore = async (r: TReceipt) => {
    try {
      const res: any = await restoreReceipt(r.id).unwrap();
      toast.success(`Receipt ${r.receiptNumber} restored successfully.`);
      if (res?.data?.warnings && res.data.warnings.length > 0) {
        res.data.warnings.forEach((w: string) => toast.warning(w));
      }
    } catch (err) {
      toast.error(errorMessageGenerator(err));
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-4">
      {/* Top Header Controls: Search, Sort, Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt # or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>
          <Select
            value={sortOption.label}
            onValueChange={(val) => {
              const opt = SORT_OPTIONS.find((s) => s.label === val);
              if (opt) {
                setSortOption(opt);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.label} value={opt.label} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/receipts/create">
            <Button size="sm" className="gap-1.5 font-semibold text-xs shadow-xs">
              <Plus className="size-4" /> Create Receipt
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setActiveTab("ALL");
            setPage(1);
          }}
          className={cn(
            "pb-2.5 px-3 border-b-2 transition-colors",
            activeTab === "ALL"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          All Receipts
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("PENDING");
            setPage(1);
          }}
          className={cn(
            "pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "PENDING"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Clock className="size-3 text-amber-600" />
          Pending Approval
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("APPROVED");
            setPage(1);
          }}
          className={cn(
            "pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "APPROVED"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <ShieldCheck className="size-3 text-emerald-600" />
          Approved
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("PENDING_DELETION");
            setPage(1);
          }}
          className={cn(
            "pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "PENDING_DELETION"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <ShieldAlert className="size-3 text-rose-600" />
          Deletion Requests
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("ARCHIVED");
            setPage(1);
          }}
          className={cn(
            "pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5",
            activeTab === "ARCHIVED"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Archive className="size-3" />
          Archived / Deleted
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Receipt Number</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold text-center">Items</th>
                <th className="px-4 py-3 font-semibold text-right">Total Bill</th>
                <th className="px-4 py-3 font-semibold text-right">Paid</th>
                <th className="px-4 py-3 font-semibold text-right">Due</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3.5 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="px-4 py-3.5 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3.5 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3.5 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3.5 text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></td>
                    <td className="px-4 py-3.5 text-right"><Skeleton className="h-7 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Receipt className="size-8 text-muted-foreground/40" />
                      <p className="text-base font-medium text-foreground">No receipts found</p>
                      <p className="text-xs text-muted-foreground">
                        {activeTab === "PENDING_DELETION"
                          ? "No deletion requests pending admin confirmation."
                          : "Try adjusting your search filters or create a new receipt."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => {
                  const isLockedForCashier = !isAdmin && receipt.status === "APPROVED";
                  const hasDue = receipt.dueAmount > 0;
                  const formattedDate = formatDate(receipt.createdAt);

                  return (
                    <tr
                      key={receipt.id}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        isFetching && "opacity-60",
                        receipt.isDeleteRequested && "bg-rose-500/5 hover:bg-rose-500/10",
                        receipt.isDeleted && "bg-muted/30 opacity-70",
                      )}
                    >
                      {/* Receipt Number & Date */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono font-bold text-foreground text-xs">
                            {receipt.receiptNumber}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formattedDate}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {receipt.customer?.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground/70" />
                            {receipt.customer?.countryCode || "+880"} {receipt.customer?.phoneNumber}
                          </span>
                        </div>
                      </td>

                      {/* Items Count */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-medium text-xs">
                          {receipt._count?.items ?? receipt.items?.length ?? 0}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                        ৳{receipt.totalAmount}
                      </td>

                      {/* Paid Amount */}
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        ৳{receipt.paidAmount}
                      </td>

                      {/* Due Amount */}
                      <td className="px-4 py-3 text-right">
                        {hasDue ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-destructive border border-destructive/20">
                            ৳{receipt.dueAmount}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            PAID
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge
                            variant="outline"
                            className={
                              receipt.status === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]"
                                : receipt.status === "REJECTED"
                                ? "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                                : "bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]"
                            }
                          >
                            {receipt.status}
                          </Badge>

                          {receipt.isDeleteRequested && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 text-rose-600 bg-rose-500/10 border-rose-500/20"
                            >
                              Delete Req
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Receipt Action: Details button when approved, or View Details + Edit when pending */}
                          {!receipt.isDeleted && receipt.status === "APPROVED" ? (
                            <Link href={`/receipts/${receipt.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View Receipt Details"
                                className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
                              >
                                <Eye className="size-3.5" /> Details
                              </Button>
                            </Link>
                          ) : (
                            <>
                              {/* View Details */}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Receipt Details"
                                onClick={() => handleOpenDetails(receipt)}
                                className="size-7 text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="size-3.5" />
                              </Button>

                              {/* Edit Receipt */}
                              {!receipt.isDeleted && (
                                <Link href={`/receipts/${receipt.id}/edit`}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit Receipt"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                </Link>
                              )}
                            </>
                          )}

                          {/* View PDF / Invoice */}
                          {!receipt.isDeleted && (
                            <Link href={`/receipts/${receipt.id}/invoice`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View PDF / Invoice"
                                className="size-7 text-muted-foreground hover:text-primary"
                              >
                                <FileText className="size-3.5" />
                              </Button>
                            </Link>
                          )}

                          {/* Admin Quick Status: Approve / Reject Pending Receipt */}
                          {isAdmin && receipt.status === "PENDING" && !receipt.isDeleted && (
                            <div className="flex items-center gap-1 border-l border-border pl-1 ml-1">
                              <ConfirmPopup
                                title="Approve Receipt?"
                                description={`Approve Receipt "${receipt.receiptNumber}"?`}
                                confirmLabel="Approve"
                                destructive={false}
                                loading={isUpdatingStatus}
                                onConfirm={() => handleAdminApprove(receipt)}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-[11px] gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                  title="Approve Receipt"
                                >
                                  <Check className="size-3" /> Approve
                                </Button>
                              </ConfirmPopup>
                              <ConfirmPopup
                                title="Reject Receipt?"
                                description={`Reject Receipt "${receipt.receiptNumber}"?`}
                                confirmLabel="Reject"
                                destructive={true}
                                loading={isUpdatingStatus}
                                onConfirm={() => handleAdminReject(receipt)}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                                  title="Reject Receipt"
                                >
                                  <X className="size-3" />
                                </Button>
                              </ConfirmPopup>
                            </div>
                          )}

                          {/* Admin Delete Request Confirmation */}
                          {isAdmin && receipt.isDeleteRequested ? (
                            <div className="flex items-center gap-1 border-l border-border pl-1 ml-1">
                              <ConfirmPopup
                                title="Approve Deletion Request?"
                                description={`Confirm deletion of Receipt "${receipt.receiptNumber}"? Stock will be restored.`}
                                confirmLabel="Confirm Delete"
                                destructive={true}
                                loading={isConfirming}
                                onConfirm={() => handleAdminConfirmDelete(receipt)}
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-2 text-[11px] gap-1"
                                  title="Confirm Delete"
                                >
                                  <Check className="size-3" /> Delete
                                </Button>
                              </ConfirmPopup>
                              <ConfirmPopup
                                title="Reject Deletion Request?"
                                description={`Reject deletion request for "${receipt.receiptNumber}"?`}
                                confirmLabel="Reject"
                                destructive={false}
                                loading={isRejecting}
                                onConfirm={() => handleAdminRejectDelete(receipt)}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7"
                                  title="Reject Delete Request"
                                >
                                  <X className="size-3" />
                                </Button>
                              </ConfirmPopup>
                            </div>
                          ) : receipt.isDeleted && isAdmin ? (
                            /* Admin Restore Deleted Receipt */
                            <ConfirmPopup
                              title="Restore Receipt?"
                              description={`Restore Receipt "${receipt.receiptNumber}"? Stock will be re-deducted.`}
                              confirmLabel="Restore"
                              destructive={false}
                              loading={isRestoring}
                              onConfirm={() => handleAdminRestore(receipt)}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px] gap-1 text-primary border-primary/40 hover:bg-primary/10"
                                title="Restore Receipt"
                              >
                                <RotateCcw className="size-3" /> Restore
                              </Button>
                            </ConfirmPopup>
                          ) : (
                            /* Normal Delete / Request Delete */
                            !receipt.isDeleted && (
                              receipt.isDeleteRequested && !isAdmin ? (
                                <Badge
                                  variant="secondary"
                                  className="h-7 px-2 text-[10px] text-amber-600 bg-amber-500/10 cursor-not-allowed"
                                  title="Deletion request pending admin review"
                                >
                                  Delete Requested
                                </Badge>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={isAdmin ? "Delete Receipt" : "Request Delete"}
                                  onClick={() => handleOpenDelete(receipt)}
                                  className="size-7 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
            <span className="text-muted-foreground">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, meta.total)} of {meta.total} receipts
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" /> Previous
              </Button>
              <span className="font-mono text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Sheets */}
      <ReceiptDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        receipt={selectedReceiptForDetails}
      />

      <ReceiptDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        receipt={selectedReceiptForDelete}
      />
    </div>
  );
}
