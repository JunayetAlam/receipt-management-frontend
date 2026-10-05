import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Sanowar Electric shop management system for products, customers, receipts, and sales reports.",
};

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
