import React from "react";
import { TCustomerTransaction } from "@/types";
import {
  formatInvoiceMoney,
  formatSignedDue,
} from "@/utils/formatInvoiceMoney";
import {
  PRINT_TABLE_STYLE,
  PRINT_TD as tdClass,
  PRINT_TH as thClass,
  printRowClass,
} from "@/components/Global/printTable";

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeOnly = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function CustomerTransactionListTable({
  transactions,
  startIndex = 0,
  empty = false,
  isCustomerSelected = false,
}: {
  transactions: TCustomerTransaction[];
  startIndex?: number;
  empty?: boolean;
  isCustomerSelected?: boolean;
}) {
  return (
    <table
      className="w-full caption-bottom border-collapse"
      style={PRINT_TABLE_STYLE}
    >
      <thead data-probe="header">
        <tr>
          <th className={`${thClass} w-[2.8em] text-center`}>#</th>
          <th className={`${thClass} whitespace-nowrap`}>Date</th>
          {!isCustomerSelected && <th className={thClass}>Client</th>}
          <th className={thClass}>Type</th>
          <th className={`${thClass} text-right`}>Due</th>
          <th className={`${thClass} text-right`}>Cash</th>
          <th className={`${thClass} text-right`}>Net Due</th>
          <th className={thClass}>Note</th>
          <th className={`${thClass} whitespace-nowrap`}>Invoice #</th>
        </tr>
      </thead>
      <tbody>
        {empty ? (
          <tr data-row="empty">
            <td
              colSpan={isCustomerSelected ? 8 : 9}
              className={`${tdClass} text-center text-slate-500 italic py-[1.6em]`}
            >
              No transactions found for this filter.
            </td>
          </tr>
        ) : (
          transactions.map((tx, idx) => {
            const isReceipt = tx.type === "RECEIPT";
            const isPayment = tx.type === "PAYMENT";
            const isReturn = tx.type === "RETURN_INVOICE";

            const invoiceNumber = isReturn
              ? tx.returnInvoice?.returnNumber || tx.referenceNumber || "—"
              : tx.receipt?.receiptNumber ||
                tx.payment?.receipt?.receiptNumber ||
                (isReceipt ? tx.referenceNumber : null) ||
                "—";

            return (
              <tr
                key={tx.id}
                data-row="item"
                className={printRowClass(startIndex + idx)}
              >
                <td
                  className={`${tdClass} text-center text-slate-500 font-mono`}
                >
                  {startIndex + idx + 1}
                </td>
                <td className={`${tdClass} whitespace-nowrap`}>
                  <p className="font-mono text-slate-800 text-[1em] font-medium leading-tight">
                    {formatDateOnly(tx.createdAt)}
                  </p>
                  <p className="font-mono text-slate-500 text-[0.9em] leading-tight mt-[0.2em]">
                    {formatTimeOnly(tx.createdAt)}
                  </p>
                </td>
                {!isCustomerSelected && (
                  <td className={tdClass}>
                    <div className="max-w-[17em]">
                      <p className="font-semibold text-slate-900 text-[1.05em] leading-tight truncate">
                        {tx.customer?.name || "Walk-in"}
                      </p>
                      <p className="font-mono text-slate-600 text-[0.9em] leading-tight mt-[0.2em] truncate">
                        {tx.customer?.phoneNumber
                          ? `${tx.customer.countryCode || "+880"} ${tx.customer.phoneNumber}`
                          : "—"}
                      </p>
                      <p className="text-slate-500 text-[0.9em] leading-tight mt-[0.2em] truncate">
                        {tx.customer?.address || "—"}
                      </p>
                    </div>
                  </td>
                )}
                <td className={`${tdClass} whitespace-nowrap font-medium`}>
                  <span
                    className={`inline-block px-[0.6em] py-[0.2em] rounded text-[0.95em] font-semibold ${
                      isReceipt
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : isPayment
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isReceipt ? "Receipt" : isPayment ? "Payment" : "Return"}
                  </span>
                </td>
                <td
                  className={`${tdClass} text-right font-mono font-medium whitespace-nowrap ${
                    tx.due > 0
                      ? "text-amber-700 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  {tx.due > 0 ? formatInvoiceMoney(tx.due) : "—"}
                </td>
                <td
                  className={`${tdClass} text-right font-mono font-medium whitespace-nowrap text-emerald-700`}
                >
                  {tx.cash > 0 ? formatInvoiceMoney(tx.cash) : "—"}
                </td>
                <td
                  className={`${tdClass} text-right font-mono font-medium whitespace-nowrap ${
                    tx.balance > 0
                      ? "text-rose-700 font-bold"
                      : tx.balance < 0
                        ? "text-emerald-700 font-bold"
                        : "text-slate-600"
                  }`}
                >
                  {formatSignedDue(tx.balance)}
                </td>
                <td
                  className={`${tdClass} text-[0.95em] text-slate-700 whitespace-pre-wrap wrap-break-word leading-relaxed`}
                >
                  {tx.note || tx.payment?.note || tx.receipt?.note || "—"}
                </td>
                <td
                  className={`${tdClass} font-mono text-[1.05em] font-semibold text-slate-800 whitespace-nowrap`}
                >
                  {invoiceNumber}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
