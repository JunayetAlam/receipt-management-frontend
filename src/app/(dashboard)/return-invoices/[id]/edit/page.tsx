"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGetReturnInvoiceByIdQuery } from "@/redux/api/returnInvoiceApi";
import ReturnInvoiceForm from "@/components/ReturnInvoices/ReturnInvoiceForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function EditReturnInvoiceInner() {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, isError } = useGetReturnInvoiceByIdQuery(id, {
    skip: !id,
  });
  const returnInvoice = data?.data;

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (isError || !returnInvoice) {
    return (
      <div className="text-center space-y-3">
        <p className="text-destructive font-semibold">
          Return invoice not found
        </p>
        <Link href="/return-invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-1" /> Back
          </Button>
        </Link>
      </div>
    );
  }

  if (returnInvoice.isDeleted) {
    return (
      <div className="text-center space-y-3">
        <p className="text-destructive font-semibold">
          Deleted return invoices cannot be edited
        </p>
        <Link href={`/return-invoices/${returnInvoice.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-1" /> Back to details
          </Button>
        </Link>
      </div>
    );
  }

  if (returnInvoice.isLatest === false) {
    return (
      <div className="text-center space-y-3">
        <p className="font-semibold">
          Only the latest return invoice on this receipt can be edited
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {returnInvoice.returnNumber}
        </p>
        <Link href={`/return-invoices/${returnInvoice.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-1" /> Back to details
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs font-mono text-muted-foreground -mt-2 mb-2">
        {returnInvoice.returnNumber}
      </p>
      <ReturnInvoiceForm initialData={returnInvoice} isEditing />
    </>
  );
}

export default function EditReturnInvoicePage() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">
        Edit Return Invoice
      </h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <EditReturnInvoiceInner />
      </Suspense>
    </div>
  );
}
