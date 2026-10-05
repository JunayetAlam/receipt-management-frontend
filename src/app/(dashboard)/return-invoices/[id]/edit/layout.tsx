import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Return Invoice",
  description: "Edit returned items and refund amounts",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
