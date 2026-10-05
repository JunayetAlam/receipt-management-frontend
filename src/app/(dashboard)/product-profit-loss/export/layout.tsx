import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Product Profit & Loss",
  description: "Export per-product profit and loss report",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
