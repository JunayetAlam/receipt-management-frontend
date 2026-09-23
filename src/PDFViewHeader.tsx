import ShopLogo from "./components/ShopLogo";
import { formatInvoiceDate } from "./utils/formatInvoiceDate";

export default function PDFViewHeader({
  logo,
  name,
  title,
}: {
  logo?: string | null;
  name?: string | null;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 relative">
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5 min-w-0 max-w-[30%]">
        <ShopLogo url={logo} alt={name} />
      </div>
      {/* Right: Title */}
      <div className="text-right shrink-0">
        <h2 className="text-xl font-extrabold tracking-wider text-slate-900 uppercase">
          {title}
        </h2>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
          Date: {formatInvoiceDate(new Date().toISOString())}
        </p>
      </div>
    </div>
  );
}
