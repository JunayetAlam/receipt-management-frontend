import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import type { PageTotal } from "./paginateInvoicePages";

/**
 * Page-by-page item totals at the top of the final summary, right above the
 * Subtotal they add up to. Renders nothing for a single page.
 */
export default function RIV_PageTotals({
  pageTotals = [],
}: {
  pageTotals?: PageTotal[];
}) {
  if (pageTotals.length === 0) return null;

  return (
    <div className="space-y-px pb-0.5 mb-0.5 border-b border-slate-300">
      {pageTotals.map((pt) => (
        <div
          key={pt.pageNo}
          className="flex justify-between items-center text-slate-600"
        >
          <span className="font-semibold">
            Page {pt.pageNo}{" "}
            <span className="font-normal text-slate-400">
              (items {pt.firstItemNo}–{pt.lastItemNo})
            </span>
          </span>
          <span className="font-mono font-semibold text-slate-800">
            {formatInvoiceMoney(pt.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
