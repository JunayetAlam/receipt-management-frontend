import { Metadata } from "next";
import ReceiptForm from "@/components/Receipts/ReceiptForm";

export const metadata: Metadata = {
  title: "Create Receipt | Receipt Management",
  description: "Create a new customer receipt with automatic pricing, per-item discount, and payment tracking",
};

export default function CreateReceiptPage() {
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Create Receipt
      </h1>
      <ReceiptForm isEditing={false} />
    </div>
  );
}
