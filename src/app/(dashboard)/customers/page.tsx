import { Metadata } from "next";
import CustomerTable from "@/components/Customers/CustomerTable";

export const metadata: Metadata = {
  title: "Manage Customers | Receipt Management",
  description: "Manage customer profiles, phone numbers, contact records, and audit history",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Manage Customers
      </h1>
      <CustomerTable />
    </div>
  );
}
