import { TProductProfitRow } from "@/types";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import {
  PRINT_TABLE_STYLE,
  PRINT_TD as tdClass,
  PRINT_TH as thClass,
  printRowClass,
} from "@/components/Global/printTable";

function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SellReportListTable({
  products,
  startIndex = 0,
  empty = false,
}: {
  products: TProductProfitRow[];
  startIndex?: number;
  empty?: boolean;
}) {
  return (
    <table
      className="w-full caption-bottom border-collapse"
      style={PRINT_TABLE_STYLE}
    >
      <thead data-probe="header">
        <tr>
          <th className={`${thClass} w-[4em] text-center`}>#</th>
          <th className={thClass}>Product</th>
          <th className={`${thClass} text-right`}>Sold</th>
          <th className={`${thClass} text-right`}>Sale</th>
        </tr>
      </thead>
      <tbody>
        {empty ? (
          <tr data-row="empty">
            <td
              colSpan={4}
              className={`${tdClass} text-center text-slate-500 italic py-[3.2em]`}
            >
              No product sales found for this period.
            </td>
          </tr>
        ) : (
          products.map((row, idx) => (
            <tr
              key={row.productId}
              data-row="item"
              className={printRowClass(startIndex + idx)}
            >
              <td className={`${tdClass} text-center text-slate-500 font-mono w-[4em]`}>
                {startIndex + idx + 1}
              </td>
              <td className={`${tdClass} font-semibold truncate`}>
                <span title={row.productName}>{row.productName}</span>
                <span className="block text-[0.9em] font-normal text-slate-500">
                  {row.unit}
                </span>
              </td>
              <td className={`${tdClass} text-right font-mono whitespace-nowrap`}>
                {formatQty(row.soldQty)}
              </td>
              <td className={`${tdClass} text-right font-mono font-semibold whitespace-nowrap`}>
                {formatInvoiceMoney(row.salesTotal)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
