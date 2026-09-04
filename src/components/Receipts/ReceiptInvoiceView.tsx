"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Phone,
  MapPin,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TReceipt } from "@/types";

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

export default function ReceiptInvoiceView({ receipt }: ReceiptInvoiceViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Payments chronologically sorted (last payment at last), excluding rejected
  const sortedPayments = [...(receipt.payments || [])]
    .filter((p) => p.status !== "REJECTED")
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-zinc-950 py-6 sm:py-10 print:bg-white print:py-0 print:m-0">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-[210mm] mx-auto px-4 mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/receipts/${receipt.id}`}>
          <Button variant="outline" size="sm" className="gap-2 shadow-xs bg-card">
            <ArrowLeft className="size-4" /> Back to Receipt
          </Button>
        </Link>

        <div className="flex items-center gap-2">
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
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 shadow-xl rounded-sm border border-slate-200/80 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:m-0 flex flex-col justify-between overflow-hidden"
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* Main Document Content Area with Generous, Balanced Margins */}
        <div className="px-10 py-10 sm:px-14 sm:py-12 md:px-16 md:py-14 space-y-9 flex-1">
          {/* Header Row: Shop Name (Left) | INVOICE Title (Right) */}
          <div className="flex justify-between items-start">
            {/* Left: Brand Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Rupayon Biddut
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Meet All Your Needs • Electrical Goods
              </p>
            </div>

            {/* Right: Big Minimalist INVOICE Header */}
            <div className="text-right">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-900 uppercase">
                INVOICE
              </h2>
            </div>
          </div>

          {/* Sub-Header / Metadata Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Left: Invoice To (Customer Details) */}
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-800 text-sm">
                Invoice to:
              </p>
              <p className="font-bold text-base text-slate-900">
                {receipt.customer?.name || "Valued Customer"}
              </p>
              <p className="text-slate-600 text-xs">
                {receipt.customer?.address || "Kushtia, Bangladesh"}
              </p>
              <p className="text-slate-600 text-xs font-mono">
                {receipt.customer?.countryCode ? `${receipt.customer.countryCode} ` : ""}
                {receipt.customer?.phoneNumber}
              </p>
              {receipt.customer?.email && (
                <p className="text-slate-500 text-xs">
                  {receipt.customer.email}
                </p>
              )}
            </div>

            {/* Right: Invoice# and Date */}
            <div className="space-y-2 text-sm w-full sm:w-auto">
              <div className="flex justify-between sm:justify-end items-center gap-8">
                <span className="font-bold text-slate-800 text-sm">Invoice#</span>
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
          <div className="pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-y border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-2 text-left">Item</th>
                  <th className="py-3 px-2 text-center w-16">Unit</th>
                  <th className="py-3 px-2 text-center w-16">Quantity</th>
                  <th className="py-3 px-2 text-right w-24">Unit Price</th>
                  <th className="py-3 px-2 text-right w-20">Disc %</th>
                  <th className="py-3 px-2 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-2 font-medium text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-600">
                        {item.unit}
                      </td>
                      <td className="py-3 px-2 text-center font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        ৳{item.sellingPrice}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-700">
                        {item.discount > 0 ? `${item.discount}%` : "—"}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">
                        ৳{item.totalPrice}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                      No items recorded
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="border-b border-slate-900"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Calculation Section: Takes Half Width of the section (aligned right) */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-1/2 print:w-1/2 space-y-2.5 text-xs">
              {/* 1. Subtotal */}
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-sm">Subtotal</span>
                <span className="font-mono font-semibold text-sm text-slate-900">
                  ৳{receipt.subTotal}
                </span>
              </div>

              {/* 2. Receipt Discount (if any) */}
              {receipt.discount > 0 && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-sm">Discount</span>
                  <span className="font-mono font-semibold text-sm text-rose-600">
                    -৳{receipt.discount}
                  </span>
                </div>
              )}

              {/* 3. Net Total */}
              <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-200">
                <span className="font-semibold text-sm">Net Total</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  ৳{receipt.totalAmount}
                </span>
              </div>

              {/* 4. Show all payments with date (no notes) */}
              {sortedPayments.length > 0 ? (
                sortedPayments.map((p, idx) => (
                  <div key={p.id || idx} className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold text-sm">
                      Paid ({formatInvoiceDate(p.createdAt)})
                    </span>
                    <span className="font-mono font-semibold text-sm text-emerald-700">
                      ৳{p.amount}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-sm">
                    Paid ({formatInvoiceDate(receipt.createdAt)})
                  </span>
                  <span className="font-mono font-semibold text-sm text-emerald-700">
                    ৳{receipt.paidAmount}
                  </span>
                </div>
              )}

              {/* 5. Total Due (Prominent Divider & Total Stacked at Bottom) */}
              <div className="flex justify-between items-center text-slate-900 pt-3 border-t-2 border-slate-900">
                <span className="font-bold text-base">Total Due</span>
                <span
                  className={`font-mono font-extrabold text-xl ${
                    receipt.dueAmount > 0 ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  ৳{receipt.dueAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Sign-off & Signature Area (Above Footer) */}
          <div className="pt-10 flex flex-col sm:flex-row justify-between items-end gap-6">
            {/* Left: Thank you note */}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Thank you for your business!
              </p>
            </div>

            {/* Right: Signature Placeholder with Elegant Accent Line */}
            <div className="w-56 text-center">
              <div className="border-b-2 border-primary/60 pb-1 mb-2 h-10"></div>
              <p className="text-xs font-semibold text-slate-700">
                Authorized Signed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Colored Footer Band (In Website Theme Color) */}
        <div className="bg-primary text-primary-foreground py-3.5 px-10 sm:px-14 flex flex-wrap justify-between items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Phone className="size-3.5 text-primary-foreground/90 shrink-0" />
            <span>+880 1712-345678, +880 1912-345678</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-primary-foreground/90 shrink-0" />
            <span>Court Para, N.S. Road, Kushtia - 7000</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="size-3.5 text-primary-foreground/90 shrink-0" />
            <span>contact@rupayonbiddut.com</span>
          </div>
        </div>
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
