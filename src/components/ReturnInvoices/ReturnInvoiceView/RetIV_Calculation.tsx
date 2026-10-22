import { TReturnInvoice } from "@/types";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import { derivePositionAfterReturn } from "@/utils/deriveReceiptSettlement";
import { SCALED_BASE_FONT } from "@/components/Global/TextSizeControl";
import React from "react";
import RIV_PageTotals from "@/components/Receipts/ReceipInvoiceView.tsx/RIV_PageTotals";
import type { PageTotal } from "@/components/Receipts/ReceipInvoiceView.tsx/paginateInvoicePages";

// Same layout as the sales invoice summary (RIV_Calculation): two columns with a
// divider, context on the left and the running totals on the right, sized in
// `em` so the text-size control scales it.

function MoneyRow({
  label,
  amount,
  sign,
  emphasize,
  hideSign,
  className,
}: {
  label: string;
  amount: number;
  sign: "+" | "-";
  emphasize?: boolean;
  hideSign?: boolean;
  className?: string;
}) {
  const color = sign === "+" ? "text-slate-900" : "text-rose-600";

  return (
    <div className="flex justify-between items-center text-slate-700">
      <span
        className={
          emphasize ? "font-bold text-[1.2em] text-slate-900" : "font-semibold"
        }
      >
        {label}
      </span>
      <span
        className={`font-mono ${emphasize ? "font-extrabold text-[1.4em]" : "font-semibold"} ${className || color}`}
      >
        {hideSign ? "" : sign}
        {formatInvoiceMoney(Math.abs(amount))}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-slate-700">
      <span className="font-semibold">{label}</span>
      <span className={`${mono ? "font-mono " : ""}font-semibold text-slate-900`}>
        {value}
      </span>
    </div>
  );
}

const sectionTitle =
  "font-bold text-[0.9em] uppercase tracking-wider text-slate-500";

export default function RetIV_Calculation({
  returnInvoice,
  pageTotals,
}: {
  returnInvoice: TReturnInvoice;
  /** Per-page item totals, listed above the Subtotal (multi-page invoices only). */
  pageTotals?: PageTotal[];
}) {
  const subTotal = Number(returnInvoice.subTotal) || 0;
  const discount = Number(returnInvoice.discount) || 0;
  const netCredit = Number(returnInvoice.totalAmount) || 0;
  const currentRefund = Number(returnInvoice.refundedAmount) || 0;

  const previousPosition = returnInvoice.previousPosition || {
    netDue: 0,
    netRefundable: 0,
  };

  const currentPosition =
    returnInvoice.currentPosition ||
    derivePositionAfterReturn(previousPosition, netCredit, currentRefund);

  const sale = returnInvoice.receipt;
  const returnedItems = returnInvoice.items || [];
  const returnedQty = returnedItems.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0),
    0,
  );

  return (
    <div
      className="grid grid-cols-2 gap-x-6 pt-1.5 px-1.5 leading-snug"
      style={{
        fontSize: SCALED_BASE_FONT,
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* Left part ends in a vertical divider, centred in the gap between the parts. */}
      <div className="space-y-1.5 pr-6 border-r border-slate-300">
        {sale && (
          <div className="space-y-0.5">
            <p className={sectionTitle}>Original Sale</p>
            <InfoRow label="Receipt" value={sale.receiptNumber} mono />
            {sale.totalAmount !== undefined && (
              <InfoRow
                label="Sale Total"
                value={formatInvoiceMoney(Number(sale.totalAmount) || 0)}
                mono
              />
            )}
            {sale.paidAmount !== undefined && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Paid</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {formatInvoiceMoney(Number(sale.paidAmount) || 0)}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className={`space-y-0.5 ${sale ? "pt-1 border-t border-dashed border-slate-300" : ""}`}
        >
          <p className={sectionTitle}>Returned</p>
          <InfoRow
            label="Items"
            value={`${returnedItems.length} ${returnedItems.length === 1 ? "item" : "items"} · ${returnedQty} qty`}
          />
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-semibold">Refunded Now</span>
            <span className="font-mono font-semibold text-emerald-700">
              {formatInvoiceMoney(currentRefund)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <RIV_PageTotals pageTotals={pageTotals} />

        <MoneyRow label="Subtotal" amount={subTotal} sign="+" />
        <MoneyRow label="Discount" amount={discount} sign="-" />

        <div className="border-t border-slate-200 pt-0.5 space-y-0.5">
          <MoneyRow label="Total" amount={netCredit} sign="+" />

          {previousPosition.netDue > 0 ? (
            <MoneyRow
              label="Previous Customer Due"
              amount={previousPosition.netDue}
              sign="-"
            />
          ) : previousPosition.netRefundable > 0 ? (
            <MoneyRow
              label="Previous Refund Due"
              amount={previousPosition.netRefundable}
              sign="+"
            />
          ) : (
            <MoneyRow label="Previous Due" amount={0} sign="-" />
          )}

          <MoneyRow label="Current Refund" amount={currentRefund} sign="-" />
        </div>

        <div className="border-t-2 border-slate-900 pt-0.5">
          {currentPosition.netRefundable > 0 ? (
            <MoneyRow
              label="Refund Due"
              amount={currentPosition.netRefundable}
              sign="+"
              emphasize
              hideSign
              className="text-rose-600"
            />
          ) : currentPosition.netDue > 0 ? (
            <MoneyRow
              label="Customer Due"
              amount={currentPosition.netDue}
              sign="+"
              emphasize
              hideSign
              className="text-rose-600"
            />
          ) : (
            <MoneyRow
              label="Balance"
              amount={0}
              sign="+"
              emphasize
              hideSign
              className="text-slate-900"
            />
          )}
        </div>
      </div>
    </div>
  );
}
