import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print Return Invoice",
  description: "View and print return invoice",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
