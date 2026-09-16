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

  const returns = (receipt.returnInvoices || []).filter((r) => !r.isDeleted);
  const totalReturned = Math.round(
    returns.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0) * 100,
  ) / 100;
  const netSaleAfterReturns = Math.round(
    Math.max(0, (Number(receipt.totalAmount) || 0) - totalReturned) * 100,
  ) / 100;
  const paid = Number(receipt.paidAmount) || 0;
  const netDue = Math.round(Math.max(0, netSaleAfterReturns - paid) * 100) / 100;
  const netRefundable =
    Math.round(Math.max(0, paid - netSaleAfterReturns) * 100) / 100;

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

        {returns.length > 0 && (
          <div className="pt-3 mt-2 border-t border-dashed border-slate-300 space-y-1.5">
            <p className="font-bold text-sm text-slate-900 tracking-wide">
              Returns
            </p>
            {returns.map((ret) => (
              <div key={ret.id} className="space-y-0.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-xs">
                    {ret.returnNumber}{" "}
                    <span className="font-normal text-slate-500">
                      ({formatInvoiceDate(ret.createdAt)})
                    </span>
                  </span>
                  <span className="font-mono font-semibold text-xs text-rose-600">
                    -{formatInvoiceMoney(ret.totalAmount)}
                  </span>
                </div>
                {(ret.items || []).length > 0 && (
                  <p className="text-[10px] text-slate-500 leading-snug pl-0.5">
                    {(ret.items || [])
                      .map((it) => `${it.productName} × ${it.quantity}`)
                      .join(", ")}
                  </p>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center text-slate-800 pt-1 border-t border-slate-200">
              <span className="font-semibold text-sm">Total Returned</span>
              <span className="font-mono font-bold text-sm text-rose-600">
                -{formatInvoiceMoney(totalReturned)}
              </span>
            </div>

            <div className="pt-1.5 space-y-1 border-t border-slate-200">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-xs">Sale Net Total</span>
                <span className="font-mono text-xs">
                  {formatInvoiceMoney(receipt.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-xs">(-) Total Returned</span>
                <span className="font-mono text-xs text-rose-600">
                  -{formatInvoiceMoney(totalReturned)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-900">
                <span className="font-semibold text-sm">
                  Net Sale After Returns
                </span>
                <span className="font-mono font-bold text-sm">
                  {formatInvoiceMoney(netSaleAfterReturns)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-xs">Paid</span>
                <span className="font-mono text-xs text-emerald-700">
                  {formatInvoiceMoney(paid)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-900 border-t border-slate-900 pt-1">
                <span className="font-bold text-sm">Net Due</span>
                <span
                  className={`font-mono font-extrabold text-base ${
                    netDue > 0 ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {formatInvoiceMoney(netDue)}
                </span>
              </div>
              {netRefundable > 0 && (
                <div className="flex justify-between items-center text-slate-900">
                  <span className="font-bold text-sm">Net Refundable</span>
                  <span className="font-mono font-extrabold text-base text-emerald-700">
                    {formatInvoiceMoney(netRefundable)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
