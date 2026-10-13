import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Sanowar Electric - Electrical & Electronics Store. Quality electrical cables, switches, lighting fixtures, appliances, and accessories.",
};

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
