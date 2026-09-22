export default function CustomerTransactionContinuationBar({
  shopName,
  pageNo,
  pageCount,
}: {
  shopName: string;
  pageNo: number;
  pageCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-300 pb-2 text-xs text-slate-700">
      <span className="font-semibold text-slate-900 truncate max-w-[45%]">
        {shopName}
      </span>
      <span className="uppercase tracking-wide text-[10px] font-semibold text-slate-500">
        Customer Transactions Continued
      </span>
      <span className="font-medium text-slate-800">
        Page {pageNo} of {pageCount}
      </span>
    </div>
  );
}
