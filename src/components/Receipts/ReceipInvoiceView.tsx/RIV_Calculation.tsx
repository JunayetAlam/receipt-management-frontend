import { TReceipt } from "@/types";
import { formatInvoiceDate } from "@/utils/formatInvoiceDate";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import React from "react";

export default function RIV_Calculation({ receipt }: { receipt: TReceipt }) {
  const sortedPayments = [...(receipt.payments || [])]
    .filter((p) => p.status !== "REJECTED")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  return (
    <div
      className="flex justify-end pt-1 pr-2.5"
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
    >
      <div className="w-full sm:w-1/2 print:w-1/2 space-y-1 text-xs">
        <div className="flex justify-between items-center text-slate-700">
          <span className="font-semibold text-sm">Subtotal</span>
          <span className="font-mono font-semibold text-sm text-slate-900">
            {formatInvoiceMoney(receipt.subTotal)}
          </span>
        </div>

        {receipt.discount > 0 && (
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-semibold text-sm">Discount</span>
            <span className="font-mono font-semibold text-sm text-rose-600">
              -{formatInvoiceMoney(receipt.discount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-200">
          <span className="font-semibold text-sm">Net Total</span>
          <span className="font-mono font-bold text-sm text-slate-900">
            {formatInvoiceMoney(receipt.totalAmount)}
          </span>
        </div>

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
                {formatInvoiceMoney(p.amount)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-semibold text-sm">
              Paid ({formatInvoiceDate(receipt.createdAt)})
            </span>
            <span className="font-mono font-semibold text-sm text-emerald-700">
              {formatInvoiceMoney(receipt.paidAmount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-900 border-t-2 border-slate-900">
          <span className="font-bold text-base">Total Due</span>
          <span
            className={`font-mono font-extrabold text-xl ${
              receipt.dueAmount > 0 ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {formatInvoiceMoney(receipt.dueAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
