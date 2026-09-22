import { TReceipt, TShop } from "@/types";
import { formatInvoiceDate } from "@/utils/formatInvoiceDate";
import Image from "next/image";
import React from "react";

export default function RIV_Details({
  shop,
  receipt,
}: {
  shop: TShop | null | undefined;
  receipt: TReceipt;
}) {
  return (
    <>
      {/* Header Row: Shop Logo & Name (Left) | INVOICE Title (Right) */}
      <div className="flex justify-between items-start gap-4">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {shop?.name || "Rupayon Biddut"}
          </h1>
          {shop?.tagline ? (
            <p className="text-xs font-medium text-slate-500 -mt-1">
              {shop.tagline}
            </p>
          ) : !shop ? (
            <p className="text-xs font-medium text-slate-500 -mt-1">
              Meet All Your Needs • Electrical Goods
            </p>
          ) : null}
          {shop?.phoneNumbers && shop.phoneNumbers.length > 0 && (
            <p className="text-xs text-slate-600 ">
              Phone: {shop.phoneNumbers.join(", ")}
            </p>
          )}
        </div>
        {/* Left: Brand Logo & Name */}
        <div className="flex flex-col items-start max-w-[65%]">
          {shop?.logo && (
            <Image
              src={shop.logo}
              alt={shop.name || "Shop Logo"}
              width={200}
              height={200}
              className="max-h-14 w-auto max-w-[220px] object-contain"
            />
          )}
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
    </>
  );
}
