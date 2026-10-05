import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Customers",
  description: "Export customer records",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
