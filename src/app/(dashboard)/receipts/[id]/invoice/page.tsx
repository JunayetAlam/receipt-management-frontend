"use client";

import { useParams } from "next/navigation";
import { useGetReceiptByIdQuery } from "@/redux/api/receiptApi";
import ReceiptInvoiceView from "@/components/Receipts/ReceiptInvoiceView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReceiptInvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useGetReceiptByIdQuery(id, {
    skip: !id,
  });
  const receipt = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 px-4">
        <div className="max-w-[210mm] mx-auto space-y-6">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-[297mm] w-full rounded-sm" />
        </div>
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4">
        <div className="max-w-md mx-auto p-8 text-center space-y-4 rounded-xl border border-destructive/30 bg-card shadow-sm">
          <p className="text-destructive font-semibold">
            Receipt not found or failed to load
          </p>
          <Link href="/receipts">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Receipts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ReceiptInvoiceView receipt={receipt} />;
}
