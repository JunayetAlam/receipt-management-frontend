"use client";

import { AlertTriangle, PackageX } from "lucide-react";
import { useGetProductStatsQuery } from "@/redux/api/productApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LowStockStatsCard({
  fallbackCount,
}: {
  fallbackCount?: number;
}) {
  const { data, isLoading } = useGetProductStatsQuery();
  const lowStockCount =
    data?.data?.lowStockCount ?? fallbackCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="shadow-xs ring-border/60 border-amber-500/20 bg-amber-500/3">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {lowStockCount === 0 ? (
              <PackageX className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Total Low Stock
            </p>
            {isLoading ? (
              <Skeleton className="mt-1 h-7 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono">
                  {lowStockCount}
                </p>
                <span className="text-xs text-muted-foreground">
                  items (≤ 20 units)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
