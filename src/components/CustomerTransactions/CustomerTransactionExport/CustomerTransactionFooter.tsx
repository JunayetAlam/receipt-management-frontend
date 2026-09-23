export default function CustomerTransactionFooter({
  pageNo,
  pageCount,
}: {
  pageNo: number;
  pageCount: number;
}) {
  return (
    <div className="w-full bg-primary text-primary-foreground py-2.5 px-9 flex items-center justify-between text-[11px] font-medium">
      <span className="tracking-wide uppercase text-primary-foreground/80">
        Customer Transactions
      </span>
      <span className="font-semibold">
        Page {pageNo} of {pageCount}
      </span>
    </div>
  );
}
