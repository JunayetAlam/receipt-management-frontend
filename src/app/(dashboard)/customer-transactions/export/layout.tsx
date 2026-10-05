import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Customer Transactions",
  description: "Export customer transactions, payments, and returns",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
