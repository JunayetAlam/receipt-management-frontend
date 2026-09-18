import { Metadata } from "next";
import ProductProfitTable from "@/components/ProductProfit/ProductProfitTable";

export const metadata: Metadata = {
  title: "Manage Product Profit | Receipt Management",
  description: "Per-product sales, cost, and profit report with date filters",
};

export default function ProductProfitPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Manage Product Profit
      </h1>
      <ProductProfitTable />
    </div>
  );
}
