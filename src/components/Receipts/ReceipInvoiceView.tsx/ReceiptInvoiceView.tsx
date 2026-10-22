"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import TextSizeControl, {
  textScaleStyle,
  useTextScale,
} from "@/components/Global/TextSizeControl";
import PrintToolbar from "@/components/Global/PrintToolbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tabPillClass } from "@/lib/tabColors";
import { getCustomerPrintValidation } from "@/utils/customerPrintValidation";
import CustomerFormModal from "@/components/Customers/CustomerFormModal";

import { TReceipt, TReceiptItem } from "@/types";
import { useGetShopDetailsQuery } from "@/redux/api/shopApi";
import Image from "next/image";
import RIV_ProductTable from "./RIV_ProductTable";
import RIV_Details from "./RIV_Details";
import ReceiptStyle from "./receipt-style";
import RIV_Footer from "./RIV_Footer";
import RIV_Calculation from "./RIV_Calculation";
import RIV_ContinuationBar from "./RIV_ContinuationBar";
import {
  INVOICE_CONTENT_FOOTER_GAP,
  measureOverheadCorrection,
  pageTotalsOf,
  paginateInvoicePages,
  type InvoicePage,
  type OverheadCorrection,
} from "./paginateInvoicePages";

interface ReceiptInvoiceViewProps {
  receipt: TReceipt;
}

type InvoiceMetrics = {
  pageHeight: number;
  compactFooterHeight: number;
  lastFooterHeight: number;
  detailsHeight: number;
  continuationBarHeight: number;
  tableHeaderHeight: number;
  rowHeight: number;
  balanceRowHeight: number;
  calculationHeight: number;
};

const FALLBACK_METRICS: InvoiceMetrics = {
  pageHeight: 1122.5,
  compactFooterHeight: 52,
  lastFooterHeight: 168,
  detailsHeight: 130,
  continuationBarHeight: 36,
  tableHeaderHeight: 36,
  rowHeight: 37,
  balanceRowHeight: 40,
  calculationHeight: 280,
};

function metricsEqual(a: InvoiceMetrics, b: InvoiceMetrics) {
  return (Object.keys(a) as (keyof InvoiceMetrics)[]).every(
    (key) => Math.abs(a[key] - b[key]) < 0.5,
  );
}

export default function ReceiptInvoiceView({
  receipt,
}: ReceiptInvoiceViewProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const detailsProbeRef = useRef<HTMLDivElement>(null);
  const barProbeRef = useRef<HTMLDivElement>(null);
  const tableProbeRef = useRef<HTMLDivElement>(null);
  const calcProbeRef = useRef<HTMLDivElement>(null);
  const compactFooterProbeRef = useRef<HTMLDivElement>(null);
  const lastFooterProbeRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<InvoiceMetrics>(FALLBACK_METRICS);
  // Measured height of every item row (long names wrap, so rows differ).
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  // Gap between predicted and rendered page layout, measured after render (see measureOverheadCorrection).
  const [overheadCorrection, setOverheadCorrection] =
    useState<OverheadCorrection>({ first: 0, rest: 0 });
  const sheetRef = useRef<HTMLDivElement>(null);
  const [customerEditOpen, setCustomerEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "shop">("customer");
  const [textScale, changeTextScale] = useTextScale();
  const didAutoPrint = useRef(false);

  const { data: shopResponse, isLoading: isShopLoading } =
    useGetShopDetailsQuery();
  const shop = shopResponse?.data;

  const printValidation = useMemo(
    () => getCustomerPrintValidation(receipt.customer),
    [receipt.customer]
  );

  const handlePrint = () => {
    if (!printValidation.isPrintable) return;
    window.print();
  };

  const shopName = shop?.name || "Sanowar Electric";

  const contactPhones =
    shop?.phoneNumbers && shop.phoneNumbers.length > 0
      ? shop.phoneNumbers[0]
      : !shop
        ? "+880 1712-345678"
        : "";

  const contactLocations =
    shop?.locations && shop.locations.length > 0
      ? shop.locations.join(" | ")
      : !shop
        ? "Court Para, N.S. Road, Kushtia - 7000"
        : "";

  const contactEmails =
    shop?.emails && shop.emails.length > 0
      ? shop.emails[0]
      : !shop
        ? "contact@sanowarelectric.store"
        : "";

  const probeItem: TReceiptItem = useMemo(() => {
    if (receipt.items?.[0]) return receipt.items[0];
    return {
      id: "probe-item",
      receiptId: receipt.id,
      productName: "Measurement item",
      unit: "PIECE",
      sellingPrice: 0,
      quantity: 1,
      discount: 0,
      subTotal: 0,
      totalPrice: 0,
      createdAt: receipt.createdAt,
      updatedAt: receipt.createdAt,
    };
  }, [receipt]);

  useEffect(() => {
    const readMetrics = (): InvoiceMetrics => {
      const tableRoot = tableProbeRef.current;
      const headerEl = tableRoot?.querySelector(
        '[data-probe="header"]',
      ) as HTMLElement | null;
      const itemEls = Array.from(
        tableRoot?.querySelectorAll<HTMLElement>('[data-row="item"]') ?? [],
      );
      const itemHeights = itemEls.map((el) => el.getBoundingClientRect().height);
      // Single-line row height: the shortest measured row.
      const singleRowHeight = itemHeights.length
        ? Math.min(...itemHeights)
        : 0;
      const bfEl = tableRoot?.querySelector(
        '[data-row="balance-bf"]',
      ) as HTMLElement | null;
      const cfEl = tableRoot?.querySelector(
        '[data-row="balance-cf"]',
      ) as HTMLElement | null;

      return {
        pageHeight:
          rulerRef.current?.offsetHeight || FALLBACK_METRICS.pageHeight,
        compactFooterHeight:
          compactFooterProbeRef.current?.offsetHeight ||
          FALLBACK_METRICS.compactFooterHeight,
        lastFooterHeight:
          lastFooterProbeRef.current?.offsetHeight ||
          FALLBACK_METRICS.lastFooterHeight,
        detailsHeight:
          detailsProbeRef.current?.offsetHeight ||
          FALLBACK_METRICS.detailsHeight,
        continuationBarHeight:
          barProbeRef.current?.offsetHeight ||
          FALLBACK_METRICS.continuationBarHeight,
        tableHeaderHeight:
          headerEl?.offsetHeight || FALLBACK_METRICS.tableHeaderHeight,
        rowHeight: singleRowHeight || FALLBACK_METRICS.rowHeight,
        balanceRowHeight:
          Math.max(
            bfEl?.getBoundingClientRect().height || 0,
            cfEl?.getBoundingClientRect().height || 0,
          ) || FALLBACK_METRICS.balanceRowHeight,
        calculationHeight:
          calcProbeRef.current?.offsetHeight ||
          FALLBACK_METRICS.calculationHeight,
      };
    };

    const readRowHeights = () =>
      receipt.items?.length
        ? Array.from(
            tableProbeRef.current?.querySelectorAll<HTMLElement>(
              '[data-row="item"]',
            ) ?? [],
          ).map((el) => el.getBoundingClientRect().height)
        : [];

    const update = () => {
      const next = readMetrics();
      setMetrics((prev) => (metricsEqual(prev, next) ? prev : next));
      const nextHeights = readRowHeights();
      setRowHeights((prev) =>
        prev.length === nextHeights.length &&
        prev.every((h, i) => Math.abs(h - nextHeights[i]) < 0.5)
          ? prev
          : nextHeights,
      );
    };

    update();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => update());
    const nodes = [
      rulerRef.current,
      detailsProbeRef.current,
      barProbeRef.current,
      tableProbeRef.current,
      calcProbeRef.current,
      compactFooterProbeRef.current,
      lastFooterProbeRef.current,
    ];
    nodes.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [receipt, shop]);

  const pages: InvoicePage[] = useMemo(
    () =>
      paginateInvoicePages({
        items: receipt.items || [],
        ...metrics,
        rowHeights,
        overheadCorrection,
      }),
    [receipt.items, metrics, rowHeights, overheadCorrection],
  );

  // After the pages render, check them against the prediction and fill any
  // space left at the bottom (or pull rows back out from under the footer).
  const correctionPasses = useRef(0);
  useEffect(() => {
    // New layout inputs: allow a fresh round of corrections.
    correctionPasses.current = 0;
  }, [receipt.items, metrics, rowHeights]);

  useLayoutEffect(() => {
    if (correctionPasses.current >= 3) return; // settled (guards against flip-flopping)
    const next = measureOverheadCorrection(sheetRef.current, pages);
    if (!next) return; // nothing measurable (e.g. single page): keep the last value
    if (
      Math.abs(overheadCorrection.first - next.first) < 1 &&
      Math.abs(overheadCorrection.rest - next.rest) < 1
    ) {
      return;
    }
    correctionPasses.current += 1;
    setOverheadCorrection(next);
  }, [pages, activeTab, overheadCorrection]);

  const pageCount = pages.length;
  // Page-by-page totals for the final summary (also used by its measuring probe,
  // so the summary's height includes these lines).
  const pageTotals = useMemo(() => pageTotalsOf(pages), [pages]);
  const footerContacts = {
    contactPhones,
    contactLocations,
    contactEmails,
  };

  useEffect(() => {
    if (!printValidation.isPrintable) return;
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
        window.history.replaceState(
          null,
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [isShopLoading, pageCount, metrics, printValidation.isPrintable]);

  return (
    <div
      className="min-h-screen bg-slate-100/80 dark:bg-zinc-950 py-6 sm:py-10 print:bg-white print:py-0 print:m-0"
      /* Scales the product table and summary (pages, measuring probes and print alike). */
      style={textScaleStyle(textScale)}
    >
      <PrintToolbar
        onPrint={handlePrint}
        printDisabledReason={
          printValidation.isPrintable
            ? undefined
            : printValidation.warningMessage
        }
      >
        {/* Text size meter for the product table and summary */}
        <TextSizeControl scale={textScale} onChange={changeTextScale} />

        {/* Tabs for Customer Copy / Shop Copy */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("customer")}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
              tabPillClass("customer", activeTab === "customer"),
            )}
          >
            Customer's Copy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shop")}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
              tabPillClass("shop", activeTab === "shop"),
            )}
          >
            Dealer's Copy
          </button>
        </div>

        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1 rounded-md shadow-xs">
          {pageCount} {pageCount === 1 ? "Page" : "Pages"} × 2 Copies
        </span>
      </PrintToolbar>

      {/* Warning banner when customer info is incomplete */}
      {!printValidation.isPrintable && (
        <div className="max-w-[210mm] mx-auto px-4 mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/40 p-4 text-amber-900 dark:text-amber-200 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-300">
                  Invoice is Not Printable
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                  {printValidation.warningMessage} Please update customer details to enable printing.
                </p>
              </div>
            </div>
            {receipt.customer && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCustomerEditOpen(true)}
                className="shrink-0 border-amber-400/80 bg-white hover:bg-amber-100 text-amber-950 dark:bg-zinc-900 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-950/80 font-medium text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                <Pencil className="size-3.5" />
                Add Missing Details
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Customer Form Modal for updating customer details */}
      {receipt.customer && (
        <CustomerFormModal
          open={customerEditOpen}
          onOpenChange={setCustomerEditOpen}
          customerToEdit={receipt.customer as any}
          requireAddress
        />
      )}

      <div
        aria-hidden="true"
        className="absolute w-[210mm] overflow-hidden pointer-events-none print:hidden"
        style={{
          left: "-9999px",
          top: 0,
          visibility: "hidden",
        }}
      >
        <div ref={rulerRef} style={{ height: "297mm", width: "210mm" }} />
        <div className="px-10">
          <div ref={detailsProbeRef}>
            <RIV_Details shop={shop} receipt={receipt} />
          </div>
        </div>
        <div className="px-10">
          <div ref={barProbeRef}>
            <RIV_ContinuationBar
              shopName={shopName}
              receipt={receipt}
              pageNo={2}
              pageCount={2}
            />
          </div>
        </div>
        <div ref={tableProbeRef} className="px-10">
          {/* Every item is rendered here so each row's real (possibly wrapped) height is measured. */}
          <RIV_ProductTable
            items={receipt.items?.length ? receipt.items : [probeItem]}
            startIndex={0}
            broughtForward={100}
            carriedForward={200}
            fromPage={1}
            toPage={2}
            showBroughtForward
            showCarryForward
          />
        </div>
        <div className="px-10">
          <div ref={calcProbeRef}>
            <RIV_Calculation receipt={receipt} pageTotals={pageTotals} />
          </div>
        </div>
        <div ref={compactFooterProbeRef}>
          <RIV_Footer
            isLastPage={false}
            pageNo={1}
            pageCount={2}
            {...footerContacts}
          />
        </div>
        <div ref={lastFooterProbeRef}>
          <RIV_Footer isLastPage pageNo={1} pageCount={1} {...footerContacts} />
        </div>
      </div>

      <div
        id="a4-invoice-sheet"
        ref={sheetRef}
        className="flex flex-col items-center gap-6 print:gap-0"
      >
        {/* Customer Copy */}
        <div
          className={`invoice-copy-group flex-col items-center gap-6 print:gap-0 w-full ${
            activeTab === "customer" ? "flex" : "hidden print:flex"
          }`}
        >
          {pages.map((page) => {
            const footerHeight = page.isLast
              ? metrics.lastFooterHeight
              : metrics.compactFooterHeight;

            return (
              <div
                key={`customer-${page.pageNo}`}
                data-invoice-page={page.pageNo}
                className="invoice-page relative w-full max-w-[210mm] bg-white text-slate-900 shadow-xl rounded-sm border border-slate-200/80 print:border-none print:shadow-none print:rounded-none print:max-w-none overflow-hidden"
                style={{
                  width: "210mm",
                  height: "297mm",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="px-10 pt-10"
                  style={{
                    paddingBottom: footerHeight + INVOICE_CONTENT_FOOTER_GAP,
                  }}
                >
                  {page.pageNo === 1 ? (
                    <RIV_Details shop={shop} receipt={receipt} />
                  ) : (
                    <RIV_ContinuationBar
                      shopName={shopName}
                      receipt={receipt}
                      pageNo={page.pageNo}
                      pageCount={pageCount}
                    />
                  )}

                  <div className="pt-4">
                    <RIV_ProductTable
                      items={page.items}
                      startIndex={page.startIndex}
                      broughtForward={page.broughtForward}
                      carriedForward={page.carriedForward}
                      fromPage={page.pageNo - 1}
                      toPage={page.pageNo + 1}
                      showBroughtForward={page.showBroughtForward}
                      showCarryForward={page.showCarryForward}
                      pageTotal={
                        page.pageNo > 1
                          ? pageTotals.find((pt) => pt.pageNo === page.pageNo)
                          : undefined
                      }
                      broughtForwardParts={pageTotals.filter(
                        (pt) => pt.pageNo < page.pageNo,
                      )}
                      carriedForwardParts={pageTotals.filter(
                        (pt) => pt.pageNo <= page.pageNo,
                      )}
                    />
                  </div>

                  {page.showCalculation && <RIV_Calculation receipt={receipt} pageTotals={pageTotals} />}
                </div>

                <div className="absolute left-0 right-0 bottom-0">
                  <RIV_Footer
                    isLastPage={page.isLast}
                    pageNo={page.pageNo}
                    pageCount={pageCount}
                    copyType="Customer's Copy"
                    {...footerContacts}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Shop Copy */}
        <div
          className={`invoice-copy-group flex-col items-center gap-6 print:gap-0 w-full ${
            activeTab === "shop" ? "flex" : "hidden print:flex"
          }`}
        >
          {pages.map((page) => {
            const footerHeight = page.isLast
              ? metrics.lastFooterHeight
              : metrics.compactFooterHeight;

            return (
              <div
                key={`shop-${page.pageNo}`}
                data-invoice-page={page.pageNo}
                className="invoice-page relative w-full max-w-[210mm] bg-white text-slate-900 shadow-xl rounded-sm border border-slate-200/80 print:border-none print:shadow-none print:rounded-none print:max-w-none overflow-hidden"
                style={{
                  width: "210mm",
                  height: "297mm",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="px-10 pt-10"
                  style={{
                    paddingBottom: footerHeight + INVOICE_CONTENT_FOOTER_GAP,
                  }}
                >
                  {page.pageNo === 1 ? (
                    <RIV_Details shop={shop} receipt={receipt} />
                  ) : (
                    <RIV_ContinuationBar
                      shopName={shopName}
                      receipt={receipt}
                      pageNo={page.pageNo}
                      pageCount={pageCount}
                    />
                  )}

                  <div className="pt-4">
                    <RIV_ProductTable
                      items={page.items}
                      startIndex={page.startIndex}
                      broughtForward={page.broughtForward}
                      carriedForward={page.carriedForward}
                      fromPage={page.pageNo - 1}
                      toPage={page.pageNo + 1}
                      showBroughtForward={page.showBroughtForward}
                      showCarryForward={page.showCarryForward}
                      pageTotal={
                        page.pageNo > 1
                          ? pageTotals.find((pt) => pt.pageNo === page.pageNo)
                          : undefined
                      }
                      broughtForwardParts={pageTotals.filter(
                        (pt) => pt.pageNo < page.pageNo,
                      )}
                      carriedForwardParts={pageTotals.filter(
                        (pt) => pt.pageNo <= page.pageNo,
                      )}
                    />
                  </div>

                  {page.showCalculation && <RIV_Calculation receipt={receipt} pageTotals={pageTotals} />}
                </div>

                <div className="absolute left-0 right-0 bottom-0">
                  <RIV_Footer
                    isLastPage={page.isLast}
                    pageNo={page.pageNo}
                    pageCount={pageCount}
                    copyType="Dealer's Copy"
                    {...footerContacts}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReceiptStyle />
    </div>
  );
}
