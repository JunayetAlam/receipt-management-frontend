"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TCustomerTransaction, TShop } from "@/types";
import { useGetShopDetailsQuery } from "@/redux/api/shopApi";
import ReceiptStyle from "@/components/Receipts/ReceipInvoiceView.tsx/receipt-style";
import CustomerTransactionHeader from "./CustomerTransactionHeader";
import CustomerTransactionContinuationBar from "./CustomerTransactionContinuationBar";
import CustomerTransactionFooter from "./CustomerTransactionFooter";
import CustomerTransactionListTable from "./CustomerTransactionListTable";
import {
  LIST_CONTENT_FOOTER_GAP,
  paginateCustomerTransactionPages,
  type CustomerTransactionPage,
} from "./paginateCustomerTransactionPages";

type ListMetrics = {
  pageHeight: number;
  footerHeight: number;
  headerHeight: number;
  continuationBarHeight: number;
  tableHeaderHeight: number;
  rowHeight: number;
  emptyStateHeight: number;
};

const FALLBACK_METRICS: ListMetrics = {
  pageHeight: 1122.5,
  footerHeight: 38,
  headerHeight: 110,
  continuationBarHeight: 32,
  tableHeaderHeight: 32,
  rowHeight: 32,
  emptyStateHeight: 48,
};

const PROBE_TRANSACTION: TCustomerTransaction = {
  id: "probe-tx",
  customerId: "probe-cust",
  type: "RECEIPT",
  transactionAmount: 1000,
  cashAmount: 800,
  dueAmount: 200,
  due: 1000,
  cash: 800,
  balance: 200,
  referenceNumber: "REC-2026-0001",
  customer: {
    id: "probe-cust",
    name: "Sample Customer",
    phoneNumber: "01700000000",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function metricsEqual(a: ListMetrics, b: ListMetrics) {
  return (Object.keys(a) as (keyof ListMetrics)[]).every(
    (key) => Math.abs(a[key] - b[key]) < 0.5,
  );
}

export default function CustomerTransactionExportView({
  transactions,
  filterLabel,
  customerName,
  dateRangeLabel,
  searchTerm,
  backHref = "/customer-transactions",
}: {
  transactions: TCustomerTransaction[];
  filterLabel: string;
  customerName?: string;
  dateRangeLabel?: string;
  searchTerm?: string;
  backHref?: string;
}) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const headerProbeRef = useRef<HTMLDivElement>(null);
  const barProbeRef = useRef<HTMLDivElement>(null);
  const tableProbeRef = useRef<HTMLDivElement>(null);
  const footerProbeRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<ListMetrics>(FALLBACK_METRICS);
  const didAutoPrint = useRef(false);

  const { data: shopResponse, isLoading: isShopLoading } = useGetShopDetailsQuery();
  const shop = shopResponse?.data as TShop | null | undefined;
  const shopName = shop?.name || "Shop";
  const generatedAt = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    const previous = document.title;
    document.title = `${shopName} — Customer Transactions`;
    return () => {
      document.title = previous;
    };
  }, [shopName]);

  useEffect(() => {
    const readMetrics = (): ListMetrics => {
      const tableRoot = tableProbeRef.current;
      const headerEl = tableRoot?.querySelector('[data-probe="header"]') as HTMLElement | null;
      const itemEl = tableRoot?.querySelector('[data-row="item"]') as HTMLElement | null;
      const emptyEl = tableRoot?.querySelector('[data-row="empty"]') as HTMLElement | null;

      return {
        pageHeight: rulerRef.current?.offsetHeight || FALLBACK_METRICS.pageHeight,
        footerHeight: footerProbeRef.current?.offsetHeight || FALLBACK_METRICS.footerHeight,
        headerHeight: headerProbeRef.current?.offsetHeight || FALLBACK_METRICS.headerHeight,
        continuationBarHeight: barProbeRef.current?.offsetHeight || FALLBACK_METRICS.continuationBarHeight,
        tableHeaderHeight: headerEl?.offsetHeight || FALLBACK_METRICS.tableHeaderHeight,
        rowHeight: itemEl?.offsetHeight || FALLBACK_METRICS.rowHeight,
        emptyStateHeight: emptyEl?.offsetHeight || FALLBACK_METRICS.emptyStateHeight,
      };
    };

    const update = () => {
      const next = readMetrics();
      setMetrics((prev) => (metricsEqual(prev, next) ? prev : next));
    };

    update();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => update());
    const nodes = [
      rulerRef.current,
      headerProbeRef.current,
      barProbeRef.current,
      tableProbeRef.current,
      footerProbeRef.current,
    ];
    nodes.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [shop, transactions.length, filterLabel, customerName, dateRangeLabel, searchTerm]);

  const pages: CustomerTransactionPage[] = useMemo(
    () =>
      paginateCustomerTransactionPages({
        transactions,
        ...metrics,
      }),
    [transactions, metrics],
  );

  const pageCount = pages.length;

  const totalDue = useMemo(
    () => transactions.reduce((acc, t) => acc + (t.due || 0), 0),
    [transactions],
  );
  const totalCash = useMemo(
    () => transactions.reduce((acc, t) => acc + (t.cash || 0), 0),
    [transactions],
  );
  const totalBalance = useMemo(
    () => totalDue - totalCash,
    [totalDue, totalCash],
  );

  const handlePrint = () => window.print();

  useEffect(() => {
    if (didAutoPrint.current || isShopLoading) return;
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("print") !== "1") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (didAutoPrint.current) return;
      didAutoPrint.current = true;
      window.print();
      const url = new URL(window.location.href);
      if (url.searchParams.has("print")) {
        url.searchParams.delete("print");
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [isShopLoading, pageCount, metrics]);

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-zinc-950 py-6 sm:py-10 print:bg-white print:py-0 print:m-0">
      {/* Top Toolbar (Hidden on print) */}
      <div className="max-w-[210mm] mx-auto px-4 mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2 shadow-xs bg-card">
            <ArrowLeft className="size-4" /> Back to Transactions
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1 rounded-md shadow-xs">
            {pageCount} {pageCount === 1 ? "Page" : "Pages"} (A4)
          </span>
          <Button
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs hover:opacity-95 cursor-pointer"
            size="sm"
          >
            <Printer className="size-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Hidden Probing Container for Dynamic Height Calculation */}
      <div
        aria-hidden="true"
        className="absolute w-[210mm] overflow-hidden pointer-events-none print:hidden"
        style={{ left: "-9999px", top: 0, visibility: "hidden" }}
      >
        <div ref={rulerRef} style={{ height: "297mm", width: "210mm" }} />
        <div className="px-10">
          <div ref={headerProbeRef}>
            <CustomerTransactionHeader
              shop={shop}
              generatedAt={generatedAt}
              filterLabel={filterLabel}
              customerName={customerName}
              dateRangeLabel={dateRangeLabel}
              searchTerm={searchTerm}
              totalCount={transactions.length}
              totalCash={totalCash}
              totalDue={totalDue}
            />
          </div>
          <div ref={barProbeRef}>
            <CustomerTransactionContinuationBar
              shopName={shopName}
              pageNo={2}
              pageCount={2}
            />
          </div>
          <div ref={tableProbeRef}>
            <CustomerTransactionListTable
              transactions={[PROBE_TRANSACTION]}
              startIndex={0}
            />
          </div>
          <div ref={footerProbeRef}>
            <CustomerTransactionFooter pageNo={1} pageCount={1} />
          </div>
        </div>
      </div>

      {/* Rendered A4 Printable Pages */}
      <div className="space-y-6 print:space-y-0">
        {pages.map((p) => {
          const isFirst = p.pageNo === 1;

          return (
            <div
              key={p.pageNo}
              className="bg-white text-slate-900 shadow-md print:shadow-none mx-auto relative flex flex-col justify-between overflow-hidden"
              style={{
                width: "210mm",
                height: "297mm",
                pageBreakAfter: "always",
              }}
            >
              <div
                className="px-9 pt-7 flex flex-col flex-1"
                style={{ paddingBottom: `${LIST_CONTENT_FOOTER_GAP}px` }}
              >
                {isFirst ? (
                  <CustomerTransactionHeader
                    shop={shop}
                    generatedAt={generatedAt}
                    filterLabel={filterLabel}
                    customerName={customerName}
                    dateRangeLabel={dateRangeLabel}
                    searchTerm={searchTerm}
                    totalCount={transactions.length}
                    totalDue={totalDue}
                    totalCash={totalCash}
                    totalBalance={totalBalance}
                  />
                ) : (
                  <CustomerTransactionContinuationBar
                    shopName={shopName}
                    pageNo={p.pageNo}
                    pageCount={pageCount}
                  />
                )}

                <div className="mt-4 flex-1">
                  <CustomerTransactionListTable
                    transactions={p.transactions}
                    startIndex={p.startIndex}
                    empty={transactions.length === 0}
                  />
                </div>
              </div>

              <CustomerTransactionFooter
                pageNo={p.pageNo}
                pageCount={pageCount}
              />
            </div>
          );
        })}
      </div>

      <ReceiptStyle />
    </div>
  );
}
