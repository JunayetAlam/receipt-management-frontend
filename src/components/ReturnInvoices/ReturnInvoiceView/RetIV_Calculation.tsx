import { TReturnInvoice } from "@/types";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import React from "react";

export default function RetIV_Calculation({
  returnInvoice,
}: {
  returnInvoice: TReturnInvoice;
}) {
  return (
    <div
      className="flex justify-end pt-1 pr-2.5"
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
    >
      <div className="w-full sm:w-1/2 print:w-1/2 space-y-1 text-xs">
        <div className="flex justify-between items-center text-slate-700">
          <span className="font-semibold text-sm">Subtotal</span>
          <span className="font-mono font-semibold text-sm text-slate-900">
            {formatInvoiceMoney(returnInvoice.subTotal)}
          </span>
        </div>

        {returnInvoice.discount > 0 && (
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-semibold text-sm">Discount</span>
            <span className="font-mono font-semibold text-sm text-rose-600">
              -{formatInvoiceMoney(returnInvoice.discount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-200">
          <span className="font-semibold text-sm">Net Credit</span>
          <span className="font-mono font-bold text-sm text-slate-900">
            {formatInvoiceMoney(returnInvoice.totalAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="font-semibold text-sm">Refunded</span>
          <span className="font-mono font-semibold text-sm text-emerald-700">
            {formatInvoiceMoney(returnInvoice.refundedAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-900 border-t-2 border-slate-900">
          <span className="font-bold text-base">Refund Due</span>
          <span
            className={`font-mono font-extrabold text-xl ${
              returnInvoice.dueRefundAmount > 0
                ? "text-rose-600"
                : "text-slate-900"
            }`}
          >
            {formatInvoiceMoney(returnInvoice.dueRefundAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
