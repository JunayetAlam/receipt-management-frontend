"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Archive,
  Printer,
  FileText,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllReturnInvoicesQuery,
  useConfirmDeleteReturnInvoiceMutation,
  useRejectDeleteReturnInvoiceMutation,
  useRestoreReturnInvoiceMutation,
} from "@/redux/api/returnInvoiceApi";
import useIsAdmin from "@/hooks/useIsAdmin";
import { TReturnInvoice } from "@/types";
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
import ReturnInvoiceDeleteModal from "./ReturnInvoiceDeleteModal";
import ReturnInvoiceStatusDropdown from "./ReturnInvoiceStatusDropdown";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function ReturnInvoiceTable() {
  const [isAdmin] = useIsAdmin();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedForDelete, setSelectedForDelete] =
    useState<TReturnInvoice | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [confirmDelete, { isLoading: isConfirming }] =
    useConfirmDeleteReturnInvoiceMutation();
  const [rejectDelete, { isLoading: isRejecting }] =
    useRejectDeleteReturnInvoiceMutation();
  const [restoreReturn, { isLoading: isRestoring }] =
    useRestoreReturnInvoiceMutation();

  const queryParams: Record<string, unknown> = {
    page,
    limit,
    sortBy: sortOption.sortBy,
    sortOrder: sortOption.sortOrder,
  };
  if (searchTerm.trim()) queryParams.searchTerm = searchTerm.trim();

  if (activeTab === "ALL") queryParams.isDeleted = false;
  else if (activeTab === "PENDING") {
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

  const { data: response, isLoading } =
    useGetAllReturnInvoicesQuery(queryParams);
  const rows = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta?.totalPage || 1;

  const tabs: { key: TabType; label: string; icon?: React.ReactNode }[] = [
    { key: "ALL", label: "All Returns" },
    {
      key: "PENDING",
      label: "Pending",
      icon: <Clock className="size-3 text-amber-600" />,
    },
    {
      key: "APPROVED",
      label: "Approved",
      icon: <ShieldCheck className="size-3 text-emerald-600" />,
    },
    {
      key: "PENDING_DELETION",
      label: "Deletion Requests",
      icon: <ShieldAlert className="size-3 text-rose-600" />,
    },
    {
      key: "ARCHIVED",
      label: "Archived",
      icon: <Archive className="size-3" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by return #..."
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
        <Link href="/return-invoices/create">
          <Button size="sm" className="gap-1.5 font-semibold text-xs shadow-xs">
            <Plus className="size-4" /> Create Return Invoice
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={cn(
              "pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap",
              activeTab === tab.key
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Return #</TableHead>
              <TableHead>Source Receipt</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Refund Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 8 }).map((__, c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Undo2 className="size-8 text-muted-foreground/40" />
                    <p className="text-base font-medium text-foreground">
                      No return invoices found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/return-invoices/${row.id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {row.returnNumber}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.receipt ? (
                      <Link
                        href={`/receipts/${row.receiptId}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {row.receipt.receiptNumber}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.receipt?.customer?.name || "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {row._count?.items ?? row.items?.length ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-semibold">
                    ৳{Number(row.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-xs font-mono",
                      row.dueRefundAmount > 0 && "text-rose-600 font-semibold",
                    )}
                  >
                    ৳{Number(row.dueRefundAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <ReturnInvoiceStatusDropdown returnInvoice={row} />
                      {row.isDeleteRequested && (
                        <Badge
                          variant="outline"
                          className="text-[9px] border-rose-500/40 text-rose-600"
                        >
                          Delete Req
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!row.isDeleted && (
                        <>
                          <Link href={`/return-invoices/${row.id}/invoice`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="View invoice"
                            >
                              <FileText className="size-3.5" />
                            </Button>
                          </Link>
                          <Link
                            href={`/return-invoices/${row.id}/invoice?print=1`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Print"
                            >
                              <Printer className="size-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/return-invoices/${row.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2"
                            >
                              Details
                            </Button>
                          </Link>
                          {(isAdmin || row.status !== "APPROVED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px] text-destructive"
                              onClick={() => {
                                setSelectedForDelete(row);
                                setDeleteModalOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                      {isAdmin && row.isDeleteRequested && !row.isDeleted && (
                        <>
                          <ConfirmPopup
                            title="Confirm deletion?"
                            description={`Delete ${row.returnNumber}? Stock will be adjusted.`}
                            confirmLabel="Confirm"
                            destructive
                            loading={isConfirming}
                            onConfirm={async () => {
                              try {
                                await confirmDelete(row.id).unwrap();
                                toast.success("Return invoice deleted");
                              } catch (err) {
                                toast.error(errorMessageGenerator(err));
                              }
                            }}
                          >
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-[11px]"
                            >
                              Confirm
                            </Button>
                          </ConfirmPopup>
                          <ConfirmPopup
                            title="Reject deletion?"
                            description={`Reject delete request for ${row.returnNumber}?`}
                            confirmLabel="Reject"
                            loading={isRejecting}
                            onConfirm={async () => {
                              try {
                                await rejectDelete(row.id).unwrap();
                                toast.success("Deletion request rejected");
                              } catch (err) {
                                toast.error(errorMessageGenerator(err));
                              }
                            }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px]"
                            >
                              Reject
                            </Button>
                          </ConfirmPopup>
                        </>
                      )}
                      {isAdmin && row.isDeleted && (
                        <ConfirmPopup
                          title="Restore return invoice?"
                          description={`Restore ${row.returnNumber}? Stock will be restored again.`}
                          confirmLabel="Restore"
                          loading={isRestoring}
                          onConfirm={async () => {
                            try {
                              await restoreReturn(row.id).unwrap();
                              toast.success("Return invoice restored");
                            } catch (err) {
                              toast.error(errorMessageGenerator(err));
                            }
                          }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px]"
                          >
                            Restore
                          </Button>
                        </ConfirmPopup>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <ReturnInvoiceDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        returnInvoice={selectedForDelete}
      />
    </div>
  );
}
