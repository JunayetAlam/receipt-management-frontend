import { Metadata } from "next";
import ReceiptTable from "@/components/Receipts/ReceiptTable";

export const metadata: Metadata = {
  title: "Manage Receipts | Receipt Management",
  description: "View, manage, create receipts, track due payments and approvals",
};

export default function ReceiptsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Manage Receipts
      </h1>
      <ReceiptTable />
    </div>
  );
}
