import { TProductProfitSummary, TShop } from "@/types";
import { formatInvoiceDate } from "@/utils/formatInvoiceDate";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import Image from "next/image";

function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SellReportListHeader({
  shop,
  generatedAt,
  filterLabel,
  searchTerm,
  totalCount,
  summary,
}: {
  shop: TShop | null | undefined;
  generatedAt: string;
  filterLabel: string;
  searchTerm?: string;
  totalCount: number;
  summary: TProductProfitSummary;
}) {
  const shopName = shop?.name || "Shop";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {shop?.logo ? (
            <Image
              src={shop.logo}
              alt={shopName}
              width={36}
              height={36}
              className="size-9 object-contain shrink-0"
            />
          ) : null}
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
            {shopName}
          </h1>
        </div>
        <h2 className="text-xl font-extrabold tracking-wider text-slate-900 uppercase shrink-0">
          Sell Report
        </h2>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-t border-b border-slate-200 py-2 text-xs text-slate-600">
        <div className="space-y-0.5">
          <p>
            <span className="font-semibold text-slate-800">Date</span>
            <span className="font-mono ml-2 text-slate-900">
              {formatInvoiceDate(generatedAt)}
            </span>
          </p>
          <p>
            <span className="font-semibold text-slate-800">Period</span>
            <span className="ml-2 text-slate-900">{filterLabel}</span>
          </p>
          {searchTerm ? (
            <p>
              <span className="font-semibold text-slate-800">Search</span>
              <span className="ml-2 text-slate-900">“{searchTerm}”</span>
            </p>
          ) : null}
        </div>
        <div className="text-right space-y-0.5 font-mono text-slate-900">
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-2">
              Products
            </span>
            {totalCount}
          </p>
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-2">
              Sold
            </span>
            {formatQty(summary.soldQty)}
          </p>
          <p>
            <span className="font-semibold font-sans text-slate-800 mr-2">
              Sale
            </span>
            {formatInvoiceMoney(summary.salesTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
