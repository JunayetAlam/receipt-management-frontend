import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipt Management",
  description: "Internal shop tool for products, customers, and receipts.",
};

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
