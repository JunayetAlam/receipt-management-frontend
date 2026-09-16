import { TReturnInvoice, TShop } from "@/types";
import { formatInvoiceDate } from "@/utils/formatInvoiceDate";
import React from "react";

export default function RetIV_Details({
  shop,
  returnInvoice,
}: {
  shop: TShop | null | undefined;
  returnInvoice: TReturnInvoice;
}) {
  const customer = returnInvoice.receipt?.customer;

  return (
    <>
      <div className="flex justify-between items-start gap-4">
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
        <div className="text-right shrink-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-slate-900 uppercase leading-tight">
            RETURN
            <br />
            INVOICE
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-3">
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-800 text-sm">
            Return from: {customer?.name || "Valued Customer"}
          </p>
          <p className="text-slate-600 text-xs">
            {customer?.address || "Kushtia, Bangladesh"}
          </p>
          <div className="flex">
            <p className="text-slate-600 text-xs font-mono">
              {customer?.countryCode ? `${customer.countryCode} ` : ""}
              {customer?.phoneNumber}
            </p>
            {customer?.email && (
              <p className="text-slate-500 text-xs">, {customer.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm w-full sm:w-auto">
          <div className="flex justify-between sm:justify-end items-center gap-8">
            <span className="font-bold text-slate-800 text-sm">Return#</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">
              {returnInvoice.returnNumber}
            </span>
          </div>
          <div className="flex justify-between sm:justify-end items-center gap-8">
            <span className="font-bold text-slate-800 text-sm">Against</span>
            <span className="font-mono font-semibold text-slate-900 text-sm">
              {returnInvoice.receipt?.receiptNumber || "—"}
            </span>
          </div>
          <div className="flex justify-between sm:justify-end items-center gap-8">
            <span className="font-bold text-slate-800 text-sm">Date</span>
            <span className="font-mono text-slate-900 text-sm">
              {formatInvoiceDate(returnInvoice.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
