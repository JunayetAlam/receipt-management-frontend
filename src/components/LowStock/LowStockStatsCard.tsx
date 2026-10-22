"use client";

import { AlertTriangle, PackageX } from "lucide-react";
import { useGetProductStatsQuery } from "@/redux/api/productApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  statCardClass,
  statIconClass,
  statLabelClass,
} from "@/lib/statCardTone";

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
      <Card className={statCardClass("amber")}>
        <CardContent className="flex items-center gap-4">
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${statIconClass("amber")}`}>
            {lowStockCount === 0 ? (
              <PackageX className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-semibold ${statLabelClass("amber")}`}>
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
                  items (≤ 5 units)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
