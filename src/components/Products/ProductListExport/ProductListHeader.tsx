import ShopLogo from "@/components/ShopLogo";
import { TShop } from "@/types";
import { formatInvoiceDate } from "@/utils/formatInvoiceDate";
import Image from "next/image";

export default function ProductListHeader({
  shop,
  generatedAt,
  filterLabel,
  searchTerm,
  totalCount,
}: {
  shop: TShop | null | undefined;
  generatedAt: string;
  filterLabel: string;
  searchTerm?: string;
  totalCount: number;
}) {
  const shopName = shop?.name || "Shop";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShopLogo url={shop?.logo} alt={shop?.name} />
        </div>
        <h2 className="text-xl font-extrabold tracking-wider text-slate-900 uppercase shrink-0">
          Product List
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
            <span className="font-semibold text-slate-800">Filter</span>
            <span className="ml-2 text-slate-900">{filterLabel}</span>
          </p>
          {searchTerm ? (
            <p>
              <span className="font-semibold text-slate-800">Search</span>
              <span className="ml-2 text-slate-900">“{searchTerm}”</span>
            </p>
          ) : null}
        </div>
        <p className="font-mono text-slate-900">
          <span className="font-semibold font-sans text-slate-800 mr-2">
            Products
          </span>
          {totalCount}
        </p>
      </div>
    </div>
  );
}
