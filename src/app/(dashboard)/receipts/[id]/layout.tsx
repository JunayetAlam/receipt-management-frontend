import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipt Details",
  description: "Receipt items, payments, and activity history",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
