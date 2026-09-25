"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetReceiptByIdQuery } from "@/redux/api/receiptApi";
import ReceiptForm from "@/components/Receipts/ReceiptForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function UpdateReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, isError } = useGetReceiptByIdQuery(id, {
    skip: !id,
  });
  const receipt = data?.data;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Update Receipt
      </h1>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError || !receipt ? (
        <div className="p-8 text-center space-y-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-destructive font-semibold">Receipt not found or failed to load</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Go Back</span>
          </Button>
        </div>
      ) : (
        <ReceiptForm initialData={receipt} isEditing={true} />
      )}
    </div>
  );
}
