import { TProduct } from "@/types";
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

export default function ProductListTable({
  products,
  startIndex = 0,
  empty = false,
}: {
  products: TProduct[];
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
          <th className={`${thClass} w-[3.2em] text-center`}>#</th>
          <th className={thClass}>Name</th>
          <th className={thClass}>Unit</th>
          <th className={`${thClass} text-right`}>Stock</th>
          <th className={`${thClass} text-right`}>Selling Price</th>
          <th className={`${thClass} text-right`}>Buying Price</th>
        </tr>
      </thead>
      <tbody>
        {empty ? (
          <tr data-row="empty">
            <td
              colSpan={6}
              className={`${tdClass} text-center text-slate-500 italic py-[1.6em]`}
            >
              No products found for this filter.
            </td>
          </tr>
        ) : (
          products.map((product, idx) => (
            <tr
              key={product.id}
              data-row="item"
              className={printRowClass(startIndex + idx)}
            >
              <td className={`${tdClass} text-center text-slate-500 font-mono`}>
                {startIndex + idx + 1}
              </td>
              <td className={`${tdClass} font-semibold truncate max-w-[22em]`}>
                {product.name}
              </td>
              <td className={`${tdClass} text-slate-700 whitespace-nowrap`}>
                {product.unit}
              </td>
              <td className={`${tdClass} text-right font-mono whitespace-nowrap`}>
                {formatQty(product.stock)}
              </td>
              <td className={`${tdClass} text-right font-mono whitespace-nowrap`}>
                {formatInvoiceMoney(product.sellingPrice)}
              </td>
              <td className={`${tdClass} text-right font-mono whitespace-nowrap`}>
                {product.buyingPrice != null
                  ? formatInvoiceMoney(product.buyingPrice)
                  : "—"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
