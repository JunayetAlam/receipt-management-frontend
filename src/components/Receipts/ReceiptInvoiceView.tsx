"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TReceipt } from "@/types";
import { useGetShopDetailsQuery } from "@/redux/api/shopApi";
import Image from "next/image";

interface ReceiptInvoiceViewProps {
  receipt: TReceipt;
}

const formatInvoiceDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

export default function ReceiptInvoiceView({
  receipt,
}: ReceiptInvoiceViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const naturalContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  const { data: shopResponse } = useGetShopDetailsQuery();
  const shop = shopResponse?.data;

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const calculatePages = () => {
      const singlePageHeight = rulerRef.current?.offsetHeight || 1122.5;
      const contentHeight = naturalContentRef.current?.offsetHeight || 0;
      const footerHeight = footerRef.current?.offsetHeight || 0;
      const totalHeight = contentHeight + footerHeight + 40; // 40px for pt-10
      const pages = Math.max(1, Math.ceil(totalHeight / singlePageHeight));
      setPageCount((prev) => (prev !== pages ? pages : prev));
    };

    calculatePages();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        calculatePages();
      });

      if (naturalContentRef.current) {
        observer.observe(naturalContentRef.current);
      }
      if (footerRef.current) {
        observer.observe(footerRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [receipt]);

  const contactPhones =
    shop?.phoneNumbers && shop.phoneNumbers.length > 0
      ? shop.phoneNumbers.join(", ")
      : !shop
        ? "+880 1712-345678, +880 1912-345678"
        : "";

  const contactLocations =
    shop?.locations && shop.locations.length > 0
      ? shop.locations.join(" | ")
      : !shop
        ? "Court Para, N.S. Road, Kushtia - 7000"
        : "";

  const contactEmails =
    shop?.emails && shop.emails.length > 0
      ? shop.emails.join(", ")
      : !shop
        ? "contact@rupayonbiddut.com"
        : "";

  // Payments chronologically sorted (last payment at last), excluding rejected
  const sortedPayments = [...(receipt.payments || [])]
    .filter((p) => p.status !== "REJECTED")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-zinc-950 py-6 sm:py-10 print:bg-white print:py-0 print:m-0">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-[210mm] mx-auto px-4 mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/receipts/${receipt.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shadow-xs bg-card"
          >
            <ArrowLeft className="size-4" /> Back to Receipt
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

      {/* A4 Paper Document Canvas */}
      <div
        ref={printRef}
        id="a4-invoice-sheet"
        className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 shadow-xl rounded-sm border border-slate-200/80 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:m-0 flex flex-col justify-between overflow-hidden relative"
        style={{
          boxSizing: "border-box",
          minHeight: `${pageCount * 297}mm`,
        }}
      >
        {/* Hidden 1-Page A4 Ruler for Exact Browser-Rendered Pixel Height */}
        <div
          ref={rulerRef}
          style={{
            height: "297mm",
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {shop?.logo && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
            <Image
              src={shop.logo}
              alt={shop.name || "Shop Logo"}
              width={200}
              height={200}
              className="max-h-20 w-auto max-w-[220px] object-contain"
            />
          </div>
        )}
        {/* Main Document Content Area with Generous, Balanced Margins */}
        <div className="px-10 pt-10 flex-1">
          <div ref={naturalContentRef}>
            {/* Header Row: Shop Logo & Name (Left) | INVOICE Title (Right) */}
            <div className="flex justify-between items-start gap-4">
              {/* Left: Brand Logo & Name */}
              <div className="flex flex-col items-start max-w-[65%]">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                  {shop?.name || "Rupayon Biddut"}
                </h1>
                {shop?.tagline ? (
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {shop.tagline}
                  </p>
                ) : !shop ? (
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Meet All Your Needs • Electrical Goods
                  </p>
                ) : null}
              </div>

              {/* Right: Big Minimalist INVOICE Header */}
              <div className="text-right shrink-0">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-900 uppercase">
                  INVOICE
                </h2>
              </div>
            </div>

            {/* Sub-Header / Metadata Grid */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-3">
              {/* Left: Invoice To (Customer Details) */}
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-slate-800 text-sm">
                  Invoice to: {receipt.customer?.name || "Valued Customer"}
                </p>
                <p className="text-slate-600 text-xs">
                  {receipt.customer?.address || "Kushtia, Bangladesh"}
                </p>
                <div className="flex">
                  <p className="text-slate-600 text-xs font-mono">
                    {receipt.customer?.countryCode
                      ? `${receipt.customer.countryCode} `
                      : ""}
                    {receipt.customer?.phoneNumber}
                  </p>
                  {receipt.customer?.email && (
                    <p className="text-slate-500 text-xs">
                      , {receipt.customer.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Invoice# and Date */}
              <div className="space-y-2 text-sm w-full sm:w-auto">
                <div className="flex justify-between sm:justify-end items-center gap-8">
                  <span className="font-bold text-slate-800 text-sm">
                    Invoice#
                  </span>
                  <span className="font-mono font-semibold text-slate-900 text-sm">
                    {receipt.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end items-center gap-8">
                  <span className="font-bold text-slate-800 text-sm">Date</span>
                  <span className="font-mono text-slate-900 text-sm">
                    {formatInvoiceDate(receipt.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Itemized Table */}
            <div className="*:data-[slot=table-container]:overflow-x-hidden pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-5 text-center">#</TableHead>
                    <TableHead className="w-[190px] max-w-[190px] px-0">
                      Item
                    </TableHead>
                    <TableHead className="w-16">Unit</TableHead>
                    <TableHead className="text-center w-16">Qt.</TableHead>
                    <TableHead className="text-right w-24">U/P</TableHead>
                    <TableHead className="text-right w-20">Disc %</TableHead>
                    <TableHead className="text-right w-24">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipt.items && receipt.items.length > 0 ? (
                    receipt.items.map((item, idx) => (
                      <TableRow key={item.id || idx}>
                        <TableCell className="text-center font-mono text-muted-foreground w-5 text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium w-[210px] max-w-[210px] px-0">
                          <span
                            className="block truncate w-[210px] max-w-[210px]"
                            title={item.productName}
                          >
                            {item.productName}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {item.unit.toLowerCase()}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ৳{item.sellingPrice}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {item.discount > 0 ? `${item.discount}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ৳{item.totalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-4 text-center text-muted-foreground italic"
                      >
                        No items recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Calculation Section: Takes Half Width of the section (aligned right) */}
            <div className="flex justify-end pt-1 pr-2.5">
              <div className="w-full sm:w-1/2 print:w-1/2 space-y-1 text-xs">
                {/* 1. Subtotal */}
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-sm">Subtotal</span>
                  <span className="font-mono font-semibold text-sm text-slate-900">
                    ৳{receipt.subTotal.toFixed(2)}
                  </span>
                </div>

                {/* 2. Receipt Discount (if any) */}
                {receipt.discount > 0 && (
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold text-sm">Discount</span>
                    <span className="font-mono font-semibold text-sm text-rose-600">
                      -৳{receipt.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* 3. Net Total */}
                <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-sm">Net Total</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ৳{receipt.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* 4. Show all payments with date (no notes) */}
                {sortedPayments.length > 0 ? (
                  sortedPayments.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex justify-between items-center text-slate-700"
                    >
                      <span className="font-semibold text-sm">
                        Paid ({formatInvoiceDate(p.createdAt)})
                      </span>
                      <span className="font-mono font-semibold text-sm text-emerald-700">
                        ৳{p.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold text-sm">
                      Paid ({formatInvoiceDate(receipt.createdAt)})
                    </span>
                    <span className="font-mono font-semibold text-sm text-emerald-700">
                      ৳{receipt.paidAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* 5. Total Due (Prominent Divider & Total Stacked at Bottom) */}
                <div className="flex justify-between items-center text-slate-900 border-t-2 border-slate-900">
                  <span className="font-bold text-base">Total Due</span>
                  <span
                    className={`font-mono font-extrabold text-xl ${
                      receipt.dueAmount > 0 ? "text-rose-600" : "text-slate-900"
                    }`}
                  >
                    ৳{receipt.dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign-off & Signature Area (Above Footer) */}
          </div>
        </div>

        {/* Bottom Full-Width Colored Footer Band (In Website Theme Color) */}
        <div ref={footerRef} className="space-y-3 border">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 w-full px-10">
            {/* Left: Thank you note */}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Thank you for your business!
              </p>
            </div>

            {/* Right: Signature Placeholder with Elegant Accent Line */}
            <div className="w-56 text-center">
              <div className="border-b-2 border-primary/60 pb-1 mb-2 h-15"></div>
              <p className="text-xs font-semibold text-slate-700">
                Authorized Signed
              </p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground py-3.5 px-9 flex flex-wrap justify-between items-center gap-4 text-xs font-medium">
            {contactPhones && (
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary-foreground/90 shrink-0" />
                <span>{contactPhones}</span>
              </div>
            )}

            {contactLocations && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary-foreground/90 shrink-0" />
                <span>{contactLocations}</span>
              </div>
            )}

            {contactEmails && (
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-primary-foreground/90 shrink-0" />
                <span>{contactEmails}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic A4 Page Cutoff Indicators (Screen preview only - hidden on print) */}
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            className="absolute left-0 w-full pointer-events-none z-30 -translate-y-full print:hidden"
            style={{ top: `${pageNum * 297}mm` }}
            aria-hidden="true"
          >
            <div className="relative flex items-center">
              <div className="w-full border-b-2 border-dashed border-rose-500/80 dark:border-rose-400/80" />
              <span className="absolute right-4 -top-3 bg-rose-600 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider select-none">
                A4 Page {pageNum} End ({pageNum * 297}mm)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Global Print Optimization Styles for Clean A4 Output */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html,
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header,
          nav,
          aside,
          .no-print {
            display: none !important;
          }
          #a4-invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
