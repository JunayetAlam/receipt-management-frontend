import { TCustomer } from "@/types";
import { formatSignedDue } from "@/utils/formatInvoiceMoney";
import {
  PRINT_TABLE_STYLE,
  PRINT_TD as tdClass,
  PRINT_TH as thClass,
  printRowClass,
} from "@/components/Global/printTable";

export default function CustomerListTable({
  customers,
  startIndex = 0,
  empty = false,
}: {
  customers: TCustomer[];
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
          <th className={thClass}>Phone</th>
          <th className={thClass}>Email</th>
          <th className={thClass}>Address</th>
          <th className={`${thClass} text-right`}>Due</th>
        </tr>
      </thead>
      <tbody>
        {empty ? (
          <tr data-row="empty">
            <td
              colSpan={6}
              className={`${tdClass} text-center text-slate-500 italic py-[1.6em]`}
            >
              No customers found for this filter.
            </td>
          </tr>
        ) : (
          customers.map((customer, idx) => {
            const due = Number(customer.totalDue) || 0;
            return (
              <tr
                key={customer.id}
                data-row="item"
                className={printRowClass(startIndex + idx)}
              >
                <td className={`${tdClass} text-center text-slate-500 font-mono`}>
                  {startIndex + idx + 1}
                </td>
                <td className={`${tdClass} font-semibold truncate max-w-[18em]`}>
                  {customer.name}
                </td>
                <td className={`${tdClass} font-mono whitespace-nowrap`}>
                  {customer.countryCode || "+880"} {customer.phoneNumber}
                </td>
                <td className={`${tdClass} truncate max-w-[18em] text-slate-700`}>
                  {customer.email || "—"}
                </td>
                <td className={`${tdClass} truncate max-w-[20em] text-slate-700`}>
                  {customer.address || "—"}
                </td>
                <td
                  className={`${tdClass} text-right font-mono font-medium whitespace-nowrap ${
                    due > 0
                      ? "text-rose-600"
                      : due < 0
                      ? "text-emerald-600"
                      : "text-slate-700"
                  }`}
                >
                  {formatSignedDue(due)}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
