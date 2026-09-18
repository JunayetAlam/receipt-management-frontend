"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileDown,
  RotateCcw,
  Search,
} from "lucide-react";
import useIsAdmin from "@/hooks/useIsAdmin";
import { useGetProductProfitQuery } from "@/redux/api/productApi";
import type { ProductProfitSortField } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import { cn } from "@/lib/utils";
import ProductProfitSummaryCards from "./ProductProfitSummaryCards";
import TableSkeleton from "../Global/TableSkeleton";

const SORT_OPTIONS: {
  label: string;
  sortBy: ProductProfitSortField;
  sortOrder: "asc" | "desc";
}[] = [
  { label: "Profit: High to Low", sortBy: "profit", sortOrder: "desc" },
  { label: "Profit: Low to High", sortBy: "profit", sortOrder: "asc" },
  { label: "Sales: High to Low", sortBy: "salesTotal", sortOrder: "desc" },
  { label: "Sold Qty: High to Low", sortBy: "soldQty", sortOrder: "desc" },
  { label: "Name: A to Z", sortBy: "name", sortOrder: "asc" },
  { label: "Name: Z to A", sortBy: "name", sortOrder: "desc" },
  {
    label: "Profit %: High to Low",
    sortBy: "profitPercent",
    sortOrder: "desc",
  },
];

function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatOptionalMoney(value: number | null) {
  if (value == null) return "—";
  return formatInvoiceMoney(value);
}

function formatPercent(value: number | null) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

const TABLE_HEADERS = [
  "Product",
  "Sold",
  "Avg Buy",
  "Avg Sale",
  "Sales",
  "Cost",
  "Profit",
  "Profit %",
  "Receipts",
];

export default function ProductProfitTable() {
  const router = useRouter();
  const [isAdmin, isAdminLoading] = useIsAdmin();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStart, setAppliedStart] = useState("");
  const [appliedEnd, setAppliedEnd] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortIndex, setSortIndex] = useState("0");
  const [page, setPage] = useState(1);
  const [dateError, setDateError] = useState<string | null>(null);

  const selectedSort = SORT_OPTIONS[Number(sortIndex)] || SORT_OPTIONS[0];

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isAdminLoading, router]);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: 25,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
    };
    if (appliedStart) params.startDate = appliedStart;
    if (appliedEnd) params.endDate = appliedEnd;
    if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
    return params;
  }, [page, selectedSort, appliedStart, appliedEnd, searchTerm]);

  const { data: response, isLoading, isFetching, isError } =
    useGetProductProfitQuery(queryParams, { skip: !isAdmin });

  const report = response?.data;
  const products = report?.products || [];
  const summary = report?.summary;
  const meta = response?.meta;

  const hasAssumedBuy = products.some((row) => row.assumedBuyFromSellQty > 0);

  const applyDateFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setDateError("Start date cannot be after end date");
      return;
    }
    setDateError(null);
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
    setPage(1);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setPage(1);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStart("");
    setAppliedEnd("");
    setSearchInput("");
    setSearchTerm("");
    setSortIndex("0");
    setPage(1);
    setDateError(null);
  };

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sortBy", selectedSort.sortBy);
    params.set("sortOrder", selectedSort.sortOrder);
    if (appliedStart) params.set("startDate", appliedStart);
    if (appliedEnd) params.set("endDate", appliedEnd);
    if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
    return `/product-profit/export?${params.toString()}`;
  }, [selectedSort, appliedStart, appliedEnd, searchTerm]);

  if (isAdminLoading || !isAdmin) {
    return <TableSkeleton headers={TABLE_HEADERS} title="Product Profit" />;
  }

  return (
    <div className="space-y-4">
      <ProductProfitSummaryCards
        summary={summary}
        isLoading={isLoading || isFetching}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Start date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              End date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
          <Button type="button" variant="secondary" onClick={applyDateFilter}>
            Apply dates
          </Button>

          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1 gap-2 sm:min-w-[220px]"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search product"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <Select
            value={sortIndex}
            onValueChange={(value) => {
              setSortIndex(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt, index) => (
                <SelectItem key={opt.label} value={String(index)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={handleReset}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Link href={exportHref}>
            <Button type="button" size="sm" className="gap-1.5">
              <FileDown className="size-3.5" />
              Print / Save as PDF
            </Button>
          </Link>
        </div>
      </div>

      {dateError ? (
        <p className="text-sm text-destructive">{dateError}</p>
      ) : null}

      {(appliedStart || appliedEnd) && (
        <p className="text-xs text-muted-foreground">
          Showing sales
          {appliedStart ? ` from ${appliedStart}` : ""}
          {appliedEnd ? ` to ${appliedEnd}` : ""}
          {" · "}Returns counted only if also in this range (Asia/Dhaka)
        </p>
      )}

      {hasAssumedBuy ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <p>
            Some lines had no buying price. For those quantities, unit selling
            price was used as cost (zero margin on that qty).
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-destructive">
            Failed to load product profit report
          </p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No product sales found for the selected filters
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Avg Buy</TableHead>
                  <TableHead className="text-right">Avg Sale</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Profit %</TableHead>
                  <TableHead>Receipts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{row.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.unit}
                          {row.assumedBuyFromSellQty > 0
                            ? ` · buy=sell on ${formatQty(row.assumedBuyFromSellQty)}`
                            : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatQty(row.soldQty)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatOptionalMoney(row.avgPurchase)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatOptionalMoney(row.avgSale)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatInvoiceMoney(row.salesTotal)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatInvoiceMoney(row.purchaseCost)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-semibold",
                        row.profit > 0 && "text-emerald-600",
                        row.profit < 0 && "text-rose-600",
                      )}
                    >
                      {formatInvoiceMoney(row.profit)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono",
                        (row.profitPercent ?? 0) > 0 && "text-emerald-600",
                        (row.profitPercent ?? 0) < 0 && "text-rose-600",
                      )}
                    >
                      {formatPercent(row.profitPercent)}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="flex flex-wrap gap-1">
                        {(row.receipts || []).length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          (row.receipts || []).map((r) => (
                            <Link
                              key={r.id}
                              href={`/receipts/${r.id}/invoice`}
                              className="font-mono text-xs text-primary hover:underline"
                              title={`Open invoice ${r.receiptNumber}`}
                            >
                              {r.receiptNumber} ({formatQty(r.quantity)})
                            </Link>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {meta && meta.totalPage > 0 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPage} · {meta.total} products
            {isFetching ? " · updating…" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
