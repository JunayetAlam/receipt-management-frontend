"use client";

import { useGetCustomerStatsQuery } from "@/redux/api/statsApi";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerHeader() {
  const { data, isLoading } = useGetCustomerStatsQuery();
  const totalCustomers = data?.data?.totalCustomers;

  return (
    <div className="flex items-center gap-2.5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Manage Customers
      </h1>
      {isLoading ? (
        <Skeleton className="h-6 w-9 rounded-full" />
      ) : (
        <Badge
          variant="secondary"
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono bg-secondary text-secondary-foreground border border-border/70 shadow-2xs"
          title={`Total Customers: ${totalCustomers ?? 0}`}
        >
          {totalCustomers ?? 0}
        </Badge>
      )}
    </div>
  );
}
