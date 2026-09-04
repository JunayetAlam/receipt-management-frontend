"use client";

import { useParams } from "next/navigation";
import { useGetReceiptByIdQuery } from "@/redux/api/receiptApi";
import ReceiptForm from "@/components/Receipts/ReceiptForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function ReceiptDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useGetReceiptByIdQuery(id, {
    skip: !id,
  });
  const receipt = data?.data;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Receipts
        </h1>
        {receipt && (
          <Link href={`/receipts/${receipt.id}/invoice`}>
            <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/30 hover:bg-primary/10">
              <FileText className="size-4" /> View Invoice (A4)
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError || !receipt ? (
        <div className="p-8 text-center space-y-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-destructive font-semibold">Receipt not found or failed to load</p>
          <Link href="/receipts">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Receipts
            </Button>
          </Link>
        </div>
      ) : (
        <ReceiptForm initialData={receipt} isEditing={true} isDetails={true} />
      )}
    </div>
  );
}
