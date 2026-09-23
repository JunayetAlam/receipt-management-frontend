import PDFViewHeader from "@/PDFViewHeader";
import { TShop } from "@/types";
import {
  formatInvoiceMoney,
  formatSignedDue,
} from "@/utils/formatInvoiceMoney";

export default function CustomerTransactionHeader({
  shop,
  filterLabel,
  customerName,
  dateRangeLabel,
  searchTerm,
  totalCount,
  totalDue = 0,
  totalCash = 0,
  totalBalance = 0,
}: {
  shop: TShop | null | undefined;
  filterLabel: string;
  customerName?: string;
  dateRangeLabel?: string;
  searchTerm?: string;
  totalCount: number;
  totalDue?: number;
  totalCash?: number;
  totalBalance?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Top Header Row */}
      <PDFViewHeader
        title="Customer Transactions"
        logo={shop?.logo}
        name={shop?.name}
      />

      {/* Meta Filter & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-b border-slate-200 py-2.5 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {customerName && (
            <p>
              <span className="font-semibold text-slate-800">Customer:</span>
              <span className="ml-1.5 text-slate-900 font-medium">
                {customerName}
              </span>
            </p>
          )}

          <p>
            <span className="font-semibold text-slate-800">Type:</span>
            <span className="ml-1.5 text-slate-900 font-medium">
              {filterLabel}
            </span>
          </p>

          {dateRangeLabel && (
            <p>
              <span className="font-semibold text-slate-800">Period:</span>
              <span className="ml-1.5 text-slate-900 font-medium">
                {dateRangeLabel}
              </span>
            </p>
          )}

          {searchTerm && (
            <p>
              <span className="font-semibold text-slate-800">Search:</span>
              <span className="ml-1.5 text-slate-900 font-medium">
                “{searchTerm}”
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-slate-900 text-[11px]">
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-1">
              Transactions:
            </span>
            {totalCount}
          </p>
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-1">
              Due:
            </span>
            <span className="text-amber-700 font-semibold">
              {formatInvoiceMoney(totalDue)}
            </span>
          </p>
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-1">
              Cash:
            </span>
            <span className="text-emerald-700 font-semibold">
              {formatInvoiceMoney(totalCash)}
            </span>
          </p>
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-1">
              Balance:
            </span>
            <span
              className={`font-semibold ${
                totalBalance > 0
                  ? "text-rose-700"
                  : totalBalance < 0
                    ? "text-emerald-700"
                    : "text-slate-800"
              }`}
            >
              {formatSignedDue(totalBalance)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
