"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGetAllProductsQuery } from "@/redux/api/productApi";
import ProductListExportView from "@/components/Products/ProductListExport/ProductListExportView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function filterLabelFromParams(params: URLSearchParams) {
  if (params.get("isDeleted") === "true") return "Archived";
  if (params.get("isDeleteRequested") === "true") return "Pending Deletion";
  if (params.get("lowStock") === "true") return "Low Stock";
  const unit = params.get("unit");
  if (unit) return `Active · ${unit}`;
  return "All Active";
}

function ExportLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 px-4">
      <div className="max-w-[210mm] mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-[297mm] w-full rounded-sm" />
      </div>
    </div>
  );
}

function ProductExportPageInner() {
  const searchParams = useSearchParams();

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      limit: "all",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const searchTerm = searchParams.get("searchTerm")?.trim();
    if (searchTerm) params.searchTerm = searchTerm;

    const unit = searchParams.get("unit");
    if (unit) params.unit = unit;

    if (searchParams.get("isDeleted") === "true") {
      params.isDeleted = true;
    } else {
      params.isDeleted = false;
    }

    if (searchParams.get("isDeleteRequested") === "true") {
      params.isDeleteRequested = true;
    }

    return params;
  }, [searchParams]);

  const filterLabel = filterLabelFromParams(searchParams);
  const searchTerm = searchParams.get("searchTerm")?.trim() || undefined;
  const lowStockOnly = searchParams.get("lowStock") === "true";

  const { data, isLoading, isError } = useGetAllProductsQuery(queryParams);
  let products = data?.data || [];

  if (lowStockOnly) {
    products = products.filter((p) => p.stock <= 5);
  }

  if (isLoading) return <ExportLoading />;

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4">
        <div className="max-w-md mx-auto p-8 text-center space-y-4 rounded-xl border border-destructive/30 bg-card shadow-sm">
          <p className="text-destructive font-semibold">
            Failed to load the product list
          </p>
          <Link href="/products">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProductListExportView
      products={products}
      filterLabel={filterLabel}
      searchTerm={searchTerm}
    />
  );
}

export default function ProductExportPage() {
  return (
    <Suspense fallback={<ExportLoading />}>
      <ProductExportPageInner />
    </Suspense>
  );
}
