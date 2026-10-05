import { Metadata } from "next";
import ShopDetailsForm from "@/components/Shop/ShopDetailsForm";

export const metadata: Metadata = {
  title: "Shop Details",
  description: "Configure store identity, branding logo, contact numbers, and branch locations",
};

export default function ShopDetailsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Shop Details
      </h1>
      <ShopDetailsForm />
    </div>
  );
}
