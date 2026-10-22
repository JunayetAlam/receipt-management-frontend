"use client";

import PageNav from "@/components/Global/PageNav";
import { useUrlState, useUrlSearch } from "@/hooks/useUrlState";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  FileText,
  Wallet,
  Undo2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  X,
  Users,
  User,
  Store,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
import { useGetAllCustomerTransactionsQuery } from "@/redux/api/customerTransactionApi";
import { useGetAllCustomersQuery } from "@/redux/api/customerApi";
import { TCustomerTransaction } from "@/types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatInvoiceMoney,
  formatSignedDue,
} from "@/utils/formatInvoiceMoney";
import { cn } from "@/lib/utils";
import { tabPillClass } from "@/lib/tabColors";
import { getCustomerTypeRowTone } from "@/lib/customerRowTone";
import CustomerTransactionStatsCards from "./CustomerTransactionStatsCards";
import CustomerTransactionDetailModal from "./CustomerTransactionDetailModal";
import CustomerFilterSelect from "./CustomerFilterSelect";

type TransactionTab = "ALL" | "RECEIPT" | "PAYMENT" | "RETURN_INVOICE";

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
];

export default function CustomerTransactionTable({
  hideStats = false,
}: {
  hideStats?: boolean;
} = {}) {
  const { getString, getNumber, setParams, resetParams } = useUrlState();
  const { value: searchInput, setValue: setSearchInput, searchTerm } = useUrlSearch();
  const activeTypeTab = getString("tab", "ALL") as TransactionTab;
  const setActiveTypeTab = (v: TransactionTab) => setParams({ tab: v === "ALL" ? null : v });
  const customerTypeFilter = getString("customerType", "ALL") as "ALL" | "CUSTOMER" | "RETAILER";
  const setCustomerTypeFilter = (v: string) => setParams({ customerType: v === "ALL" ? null : v });
  const selectedCustomerId = getString("customerId", "ALL");
  const setSelectedCustomerId = (v: string) => setParams({ customerId: v === "ALL" ? null : v });
  const startDate = getString("startDate");
  const setStartDate = (v: string) => setParams({ startDate: v || null });
  const endDate = getString("endDate");
  const setEndDate = (v: string) => setParams({ endDate: v || null });
  
  const sortIndex = getString("sort", "0");
  const setSortIndex = (v: string) => setParams({ sort: v === "0" ? null : v });
  const page = getNumber("page", 1);
  const setPage = (n: number) => setParams({ page: n === 1 ? null : n });
  const limit = getNumber("limit", 25);
  const setLimit = (n: number) => setParams({ limit: n === 25 ? null : n });

  // Selected transaction for detail modal
  const [selectedTx, setSelectedTx] = useState<TCustomerTransaction | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load customer list for filter dropdown
  const { data: customerData, isLoading: isCustomersLoading } =
    useGetAllCustomersQuery({
      limit: "all",
      isDeleted: false,
    });
  const customers = customerData?.data || [];

  const selectedCustomer = useMemo(
    () =>
      selectedCustomerId !== "ALL"
        ? customers.find((c) => c.id === selectedCustomerId) || null
        : null,
    [customers, selectedCustomerId],
  );

  // Query Params
  const selectedSort = SORT_OPTIONS[Number(sortIndex)] || SORT_OPTIONS[0];
  const queryParams: Record<string, unknown> = {
    page,
    limit,
    sortBy: selectedSort.sortBy,
    sortOrder: selectedSort.sortOrder,
  };

  if (searchTerm.trim()) {
    queryParams.searchTerm = searchTerm.trim();
  }
  if (customerTypeFilter !== "ALL") {
    queryParams.customerType = customerTypeFilter;
  }
  if (selectedCustomerId !== "ALL") {
    queryParams.customerId = selectedCustomerId;
  }
  if (activeTypeTab !== "ALL") {
    queryParams.type = activeTypeTab;
  }
  if (startDate) {
    queryParams.startDate = startDate;
  }
  if (endDate) {
    queryParams.endDate = endDate;
  }

  // Fetch transactions
  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetAllCustomerTransactionsQuery(queryParams);

  const transactions = response?.data || [];
  const meta = response?.meta;
  const totalCount = meta?.total ?? 0;

  const handleResetFilters = () => {
    setSearchInput("");
    resetParams(["tab", "customerType", "customerId", "startDate", "endDate", "searchTerm", "sort", "page"]);
  };

  const handleOpenDetail = (tx: TCustomerTransaction) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sortBy", selectedSort.sortBy);
    params.set("sortOrder", selectedSort.sortOrder);
    if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
    if (customerTypeFilter !== "ALL")
      params.set("customerType", customerTypeFilter);
    if (selectedCustomerId !== "ALL")
      params.set("customerId", selectedCustomerId);
    if (activeTypeTab !== "ALL") params.set("type", activeTypeTab);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return `/customer-transactions/export?${params.toString()}`;
  }, [
    selectedSort,
    searchTerm,
    customerTypeFilter,
    selectedCustomerId,
    activeTypeTab,
    startDate,
    endDate,
  ]);

  const columnCount = selectedCustomer ? 8 : 9;

  const isFiltersActive =
    activeTypeTab !== "ALL" ||
    customerTypeFilter !== "ALL" ||
    selectedCustomerId !== "ALL" ||
    startDate !== "" ||
    endDate !== "" ||
    searchTerm !== "" ||
    sortIndex !== "0";

  return (
    <div className="space-y-6">
      {/* 1. Top Stats Cards (Requested by User) */}
      {!hideStats && (
        <CustomerTransactionStatsCards
          queryParams={{
            ...(selectedCustomerId !== "ALL"
              ? { customerId: selectedCustomerId }
              : {}),
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
            ...(activeTypeTab !== "ALL" ? { type: activeTypeTab } : {}),
            ...(customerTypeFilter !== "ALL"
              ? { customerType: customerTypeFilter }
              : {}),
          }}
        />
      )}

      {/* 2. Top Header Controls: Customer Type Tabs, Filter Tabs & Export Button */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Customer Type Tabs: All | Customer | Retailer */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 text-xs shadow-2xs self-start">
          <button
            type="button"
            onClick={() => {
              setCustomerTypeFilter("ALL");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-all cursor-pointer",
              tabPillClass("ALL", customerTypeFilter === "ALL"),
            )}
          >
            <Users className="size-3.5" />
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerTypeFilter("CUSTOMER");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-all cursor-pointer",
              tabPillClass("CUSTOMER", customerTypeFilter === "CUSTOMER"),
            )}
          >
            <User className="size-3.5" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerTypeFilter("RETAILER");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-all cursor-pointer",
              tabPillClass("RETAILER", customerTypeFilter === "RETAILER"),
            )}
          >
            <Store className="size-3.5" />
            Retailer
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1 text-xs">
            {(
              [
                { label: "All Transactions", value: "ALL" },
                { label: "Receipts / Sales", value: "RECEIPT" },
                { label: "Cash Payments", value: "PAYMENT" },
                { label: "Return Invoices", value: "RETURN_INVOICE" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTypeTab(tab.value);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-colors",
                  tabPillClass(tab.value, activeTypeTab === tab.value),
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Controls */}
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!transactions.length}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Link href={exportHref}>
              <FileDown className="size-4" />
              Export List
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-12">
          {/* Text Search */}
          <div className="relative min-w-0 2xl:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, phone, reference, or note..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Select Customer */}
          <div className="min-w-0 2xl:col-span-3">
            <CustomerFilterSelect
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onChange={(val) => {
                setSelectedCustomerId(val);
              }}
              isLoading={isCustomersLoading}
              placeholder="All Customers"
            />
          </div>

          {/* Start Date & End Date */}
          <div className="flex min-w-0 items-center gap-2 2xl:col-span-4">
            <div className="relative min-w-0 flex-1">
              <Input
                type="date"
                title="Start Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                className="w-full min-w-0 text-xs px-2"
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">to</span>
            <div className="relative min-w-0 flex-1">
              <Input
                type="date"
                title="End Date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                className="w-full min-w-0 text-xs px-2"
              />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="min-w-0 2xl:col-span-2">
            <Select
              value={sortIndex}
              onValueChange={(val) => {
                setSortIndex(val);
              }}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s, idx) => (
                  <SelectItem key={idx} value={String(idx)} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Filter info */}
        {isFiltersActive && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Filters active</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset filters
            </Button>
          </div>
        )}
      </div>

      {/* 4. Transactions Table (ProductTable layout style) */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Table Top Toolbar: Count & Top Pagination */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border bg-muted/30 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : totalCount > 0 && meta ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground font-mono">
                  {(meta.page - 1) * meta.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground font-mono">
                  {Math.min(meta.page * meta.limit, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground font-mono">
                  {totalCount}
                </span>{" "}
                transactions
              </>
            ) : (
              "0 transactions found"
            )}
          </p>

          {/* Top Pagination Controls */}
          {meta && meta.totalPage > 1 && (
            <PageNav
              page={page}
              totalPage={meta.totalPage}
              onPageChange={(p) => setParams({ page: p })}
              disabled={isFetching}
            />
          )}
        </div>

        {/* Professional Customer Details Card (When a specific customer is selected) */}
        {selectedCustomer && (
          <div className="border-b border-border bg-muted/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar className="size-12 rounded-full border border-border/80 shrink-0">
                  {selectedCustomer.image ? (
                    <AvatarImage
                      src={selectedCustomer.image}
                      alt={selectedCustomer.name}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-foreground truncate">
                      {selectedCustomer.name}
                    </h2>
                    {selectedCustomer.customerType === "RETAILER" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5 font-medium">
                        Retailer
                      </Badge>
                    ) : (
                      <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20 text-[10px] py-0 px-1.5 font-normal">
                        Customer
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                      <span>
                        {selectedCustomer.countryCode || "+880"}{" "}
                        {selectedCustomer.phoneNumber}
                      </span>
                    </span>
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3 text-muted-foreground/70 shrink-0" />
                        <span>{selectedCustomer.email}</span>
                      </span>
                    )}
                    {selectedCustomer.address && (
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{selectedCustomer.address}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                    Total Due
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold text-sm sm:text-base",
                      (selectedCustomer.totalDue || 0) > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {formatInvoiceMoney(selectedCustomer.totalDue || 0)}
                  </span>
                </div>

                <div className="h-8 w-px bg-border hidden sm:block" />

                <div className="flex items-center gap-1.5">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    <Link href={`/customers/${selectedCustomer.id}`}>
                      <ExternalLink className="size-3" />
                      View Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomerId("ALL");
                    }}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Clear Customer Filter"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Data View */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[130px] text-xs">Date</TableHead>
                {!selectedCustomer && (
                  <TableHead className="text-xs">Customer</TableHead>
                )}
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-right text-xs">Due</TableHead>
                <TableHead className="text-right text-xs">Cash</TableHead>
                <TableHead className="text-right text-xs">Net Due</TableHead>
                <TableHead className="text-xs">Note</TableHead>
                <TableHead className="text-xs">Invoice</TableHead>
                <TableHead className="text-right text-xs w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} index={i}>
                    {Array.from({ length: columnCount }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="h-36 text-center text-xs text-muted-foreground"
                  >
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, index) => {
                  const isReceipt = tx.type === "RECEIPT";
                  const isPayment = tx.type === "PAYMENT";
                  const isReturn = tx.type === "RETURN_INVOICE";

                  const receiptId =
                    tx.receiptId ||
                    tx.receipt?.id ||
                    tx.payment?.receiptId ||
                    tx.payment?.receipt?.id ||
                    tx.returnInvoice?.receiptId ||
                    tx.returnInvoice?.receipt?.id;

                  const receiptNumber =
                    tx.receipt?.receiptNumber ||
                    tx.payment?.receipt?.receiptNumber ||
                    tx.returnInvoice?.receipt?.receiptNumber ||
                    (isReceipt ? tx.referenceNumber : null);

                  const returnInvoiceId =
                    tx.returnInvoiceId || tx.returnInvoice?.id;
                  const returnNumber =
                    tx.returnInvoice?.returnNumber ||
                    (isReturn ? tx.referenceNumber : null);

                  return (
                    <TableRow
                      key={tx.id}
                      className={cn(
                        "transition-colors text-xs",
                        getCustomerTypeRowTone(
                          tx.customer?.customerType,
                          index,
                          customerTypeFilter,
                        ),
                      )}
                    >
                      {/* Date with time below */}
                      <TableCell className="py-2.5">
                        <div className="space-y-0.5 font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                            <span>{formatDate(tx.createdAt)}</span>
                          </div>
                          <p className="pl-[18px] text-[11px] text-muted-foreground">
                            {formatTime(tx.createdAt)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Customer (hidden when a customer is selected) */}
                      {!selectedCustomer && (
                        <TableCell className="py-2.5">
                          <div className="space-y-0.5 max-w-[220px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p
                                className="font-semibold text-foreground truncate"
                                title={tx.customer?.name}
                              >
                                {tx.customer?.name || "Walk-in Customer"}
                              </p>
                              {tx.customer?.customerType === "RETAILER" ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] py-0 px-1 font-medium">
                                  Retailer
                                </Badge>
                              ) : tx.customer?.customerType === "CUSTOMER" ? (
                                <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20 text-[9px] py-0 px-1 font-normal">
                                  Customer
                                </Badge>
                              ) : null}
                            </div>
                            {tx.customer?.phoneNumber && (
                              <p className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                                <Phone className="size-3 text-muted-foreground/70 shrink-0" />
                                <span>
                                  {tx.customer.countryCode || "+880"}{" "}
                                  {tx.customer.phoneNumber}
                                </span>
                              </p>
                            )}
                            {tx.customer?.address && (
                              <p
                                className="flex items-center gap-1 text-muted-foreground"
                                title={tx.customer.address}
                              >
                                <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                                <span className="truncate">
                                  {tx.customer.address}
                                </span>
                              </p>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {/* Type Badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider py-0.5",
                            isReceipt &&
                              "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                            isPayment &&
                              "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            isReturn &&
                              "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                          )}
                        >
                          {isReceipt && <FileText className="mr-1 size-3" />}
                          {isPayment && <Wallet className="mr-1 size-3" />}
                          {isReturn && <Undo2 className="mr-1 size-3" />}
                          {isReceipt
                            ? "Receipt"
                            : isPayment
                              ? "Payment"
                              : "Return"}
                        </Badge>
                      </TableCell>

                      {/* Due */}
                      <TableCell className="text-right font-mono font-semibold">
                        {tx.due > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {formatInvoiceMoney(tx.due)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Cash */}
                      <TableCell className="text-right font-mono font-semibold">
                        {tx.cash > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatInvoiceMoney(tx.cash)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Balance */}
                      <TableCell className="text-right font-mono font-semibold">
                        <span
                          className={cn(
                            tx.balance > 0
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : tx.balance < 0
                                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-muted-foreground",
                          )}
                        >
                          {formatSignedDue(tx.balance)}
                        </span>
                      </TableCell>

                      {/* Note - show full note without skipping */}
                      <TableCell className="text-muted-foreground whitespace-pre-wrap break-words min-w-[200px] leading-relaxed">
                        {tx.note || tx.payment?.note || tx.receipt?.note || "—"}
                      </TableCell>

                      {/* Invoice */}
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {isReturn ? (
                          returnInvoiceId && returnNumber ? (
                            <Link
                              href={`/return-invoices/${returnInvoiceId}/invoice`}
                              className="group inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                              title={`View Return Invoice #${returnNumber}`}
                            >
                              <span>{returnNumber}</span>
                              <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            </Link>
                          ) : returnNumber ? (
                            <span className="font-semibold text-foreground">
                              {returnNumber}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : receiptId && receiptNumber ? (
                          <Link
                            href={`/receipts/${receiptId}/invoice`}
                            className="group inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            title={`View Invoice #${receiptNumber}`}
                          >
                            <span>{receiptNumber}</span>
                            <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </Link>
                        ) : receiptNumber ? (
                          <span className="font-semibold text-foreground">
                            {receiptNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(tx)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bottom Pagination Controls (Matching ProductTable) */}
        {meta && meta.totalPage > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val));
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={String(pageSize)}
                      className="text-xs"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PageNav
              page={page}
              totalPage={meta.totalPage}
              onPageChange={(p) => setParams({ page: p })}
              disabled={isFetching}
            />
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <CustomerTransactionDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        transaction={selectedTx}
      />
    </div>
  );
}
