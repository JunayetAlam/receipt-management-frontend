import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Sales Report",
  description: "Export per-product sales report",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
