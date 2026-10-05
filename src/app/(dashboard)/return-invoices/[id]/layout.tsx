import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Invoice Details",
  description: "Return invoice items, refunds, and activity history",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
