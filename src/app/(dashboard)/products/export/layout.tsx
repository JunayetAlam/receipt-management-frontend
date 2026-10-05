import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Products",
  description: "Export product catalog, prices, and stock",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
