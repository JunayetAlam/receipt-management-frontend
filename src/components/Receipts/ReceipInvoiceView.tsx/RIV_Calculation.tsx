import { TReceipt } from "@/types";
import { formatInvoiceDate } from "@/utils/formatInvoiceDate";
import {
  formatInvoiceMoney,
  roundInvoiceMoney,
} from "@/utils/formatInvoiceMoney";
import { deriveReceiptSettlement } from "@/utils/deriveReceiptSettlement";
import React from "react";
import { INVOICE_BASE_FONT } from "./RIV_ProductTable";
import RIV_PageTotals from "./RIV_PageTotals";
import type { PageTotal } from "./paginateInvoicePages";

export default function RIV_Calculation({
  receipt,
  pageTotals,
}: {
  receipt: TReceipt;
  /** Per-page item totals, listed above the Subtotal (multi-page invoices only). */
  pageTotals?: PageTotal[];
}) {
  const sortedPayments = [...(receipt.payments || [])]
    .filter((p) => p.status !== "REJECTED")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const returns = (receipt.returnInvoices || []).filter((r) => !r.isDeleted);
  const hasReturns = returns.length > 0;

  const totalCredits = returns.reduce(
    (sum, r) => sum + (Number(r.totalAmount) || 0),
    0,
  );
  const totalRefunded = returns.reduce(
    (sum, r) => sum + (Number(r.refundedAmount) || 0),
    0,
  );

  const settlement = deriveReceiptSettlement({
    receiptTotal: Number(receipt.totalAmount) || 0,
    paidAmount: Number(receipt.paidAmount) || 0,
    creditsBefore: totalCredits,
    thisCredit: 0,
    refundedBefore: totalRefunded,
    thisRefunded: 0,
  });

  // paidAmount is the running total: the amount paid at sale (not a payment
  // record) plus every installment. Show the at-sale part as its own line so
  // the list adds up to the Total Paid below it.
  const totalPaid = Number(receipt.paidAmount) || 0;
  const installmentsTotal = sortedPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );
  const paidAtSale = roundInvoiceMoney(Math.max(0, totalPaid - installmentsTotal));

  const paidLines = [
    ...(paidAtSale > 0 || sortedPayments.length === 0
      ? [{ key: "sale", date: receipt.createdAt, amount: paidAtSale }]
      : []),
    ...sortedPayments.map((p, idx) => ({
      key: p.id || String(idx),
      date: p.createdAt,
      amount: p.amount,
    })),
  ];

  // Two columns so the summary uses the full width under the table: history
  // (payments, returns) on the left, the running totals on the right.
  return (
    <div
      className="grid grid-cols-2 gap-x-6 pt-1.5 px-1.5 leading-snug"
      style={{
        fontSize: INVOICE_BASE_FONT,
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* Left part ends in a vertical divider, centred in the gap between the parts. */}
      <div className="space-y-1.5 pr-6 border-r border-slate-300">
        <div className="space-y-0.5">
          <p className="font-bold text-[0.9em] uppercase tracking-wider text-slate-500">
            Payments
          </p>
          {paidLines.map((line) => (
            <div
              key={line.key}
              className="flex justify-between items-center text-slate-700"
            >
              <span className="font-semibold">
                Paid ({formatInvoiceDate(line.date)})
              </span>
              <span className="font-mono font-semibold text-emerald-700">
                {formatInvoiceMoney(line.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center text-slate-900 pt-0.5 border-t border-slate-300">
            <span className="font-bold">Total Paid</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatInvoiceMoney(totalPaid)}
            </span>
          </div>
        </div>

        {hasReturns && (
          <div className="space-y-1 pt-1 border-t border-dashed border-slate-300">
            <p className="font-bold text-[0.9em] uppercase tracking-wider text-slate-500">
              Returns
            </p>
            {returns.map((ret) => {
              const credit = Number(ret.totalAmount) || 0;
              const discount = Number(ret.discount) || 0;
              const refunded = Number(ret.refundedAmount) || 0;
              const subTotal =
                Number(ret.subTotal) ||
                Math.round((credit + discount) * 100) / 100;

              return (
                <div key={ret.id} className="space-y-px">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">
                      {ret.returnNumber}{" "}
                      <span className="font-normal text-slate-500">
                        ({formatInvoiceDate(ret.createdAt)})
                      </span>
                    </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatInvoiceMoney(subTotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[0.9em] text-slate-500 pl-1.5">
                      <span>Discount</span>
                      <span className="font-mono text-rose-600">
                        -{formatInvoiceMoney(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[0.9em] text-slate-700 pl-1.5">
                    <span className="font-semibold">Net Credit</span>
                    <span className="font-mono font-semibold text-rose-600">
                      -{formatInvoiceMoney(credit)}
                    </span>
                  </div>
                  {refunded > 0 && (
                    <div className="flex justify-between items-center text-[0.9em] text-slate-700 pl-1.5">
                      <span className="font-semibold">Refunded</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {formatInvoiceMoney(refunded)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <RIV_PageTotals pageTotals={pageTotals} />

        <div className="flex justify-between items-center text-slate-700">
          <span className="font-semibold">Subtotal</span>
          <span className="font-mono font-semibold text-slate-900">
            {formatInvoiceMoney(receipt.subTotal)}
          </span>
        </div>

        {receipt.discount > 0 && (
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-semibold">Discount</span>
            <span className="font-mono font-semibold text-rose-600">
              -{formatInvoiceMoney(receipt.discount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-900 pt-0.5 border-t border-slate-200">
          <span className="font-semibold">Net Total</span>
          <span className="font-mono font-bold text-slate-900">
            {formatInvoiceMoney(receipt.totalAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="font-semibold">Total Paid</span>
          <span className="font-mono font-semibold text-emerald-700">
            {formatInvoiceMoney(receipt.paidAmount)}
          </span>
        </div>

        {/* Without returns: original sale balance. With returns: settled below. */}
        {!hasReturns && (
          <div className="flex justify-between items-center text-slate-900 pt-0.5 border-t-2 border-slate-900">
            <span className="font-bold text-[1.2em]">Total Due</span>
            <span
              className={`font-mono font-extrabold text-[1.4em] ${
                receipt.dueAmount > 0 ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {formatInvoiceMoney(receipt.dueAmount)}
            </span>
          </div>
        )}

        {hasReturns && (
          <>
            <div className="flex justify-between items-center text-slate-800 pt-0.5 border-t border-slate-200">
              <span className="font-semibold">Total Returned</span>
              <span className="font-mono font-bold text-rose-600">
                -{formatInvoiceMoney(settlement.totalCredits)}
              </span>
            </div>

            {settlement.totalRefunded > 0 && (
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-semibold">Total Refunded</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatInvoiceMoney(settlement.totalRefunded)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-900 pt-0.5 border-t border-slate-200">
              <span className="font-semibold">Net Sale After Returns</span>
              <span className="font-mono font-bold">
                {formatInvoiceMoney(settlement.netSaleAfterReturns)}
              </span>
            </div>

            {settlement.totalRefunded > 0 && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Net Paid (after refunds)</span>
                <span className="font-mono text-emerald-700">
                  {formatInvoiceMoney(settlement.netPaid)}
                </span>
              </div>
            )}

            {settlement.netRefundable > 0 ? (
              <div className="flex justify-between items-center text-slate-900 border-t-2 border-slate-900 pt-0.5">
                <span className="font-bold text-[1.2em]">Net Refundable</span>
                <span className="font-mono font-extrabold text-[1.4em] text-emerald-700">
                  {formatInvoiceMoney(settlement.netRefundable)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-slate-900 border-t-2 border-slate-900 pt-0.5">
                <span className="font-bold text-[1.2em]">Net Due</span>
                <span
                  className={`font-mono font-extrabold text-[1.4em] ${
                    settlement.netDue > 0 ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {formatInvoiceMoney(settlement.netDue)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
