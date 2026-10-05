import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Details",
  description: "Customer profile, transactions, dues, and activity history",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
