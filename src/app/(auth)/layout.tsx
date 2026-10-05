import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Sign in to Sanowar Electric to manage products, stock, customers, receipts, and return invoices.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-5 py-10">
      <div className="flex w-full flex-col items-center justify-center gap-5">
        {children}
      </div>
    </div>
  );
}
