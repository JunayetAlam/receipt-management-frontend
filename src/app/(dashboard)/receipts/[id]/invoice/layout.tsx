import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print Receipt",
  description: "View and print receipt invoice",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
