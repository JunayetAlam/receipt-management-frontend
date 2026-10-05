import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Receipt",
  description: "Edit receipt items, discounts, and payments",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
