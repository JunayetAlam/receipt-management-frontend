import { Metadata } from "next";
import SellReportTable from "@/components/SellReport/SellReportTable";

export const metadata: Metadata = {
  title: "Sell Report | Receipt Management",
  description: "Per-product sold quantity, sell amount, and receipts report",
};

export default function SellReportPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Sell Report
      </h1>
      <SellReportTable />
    </div>
  );
}
