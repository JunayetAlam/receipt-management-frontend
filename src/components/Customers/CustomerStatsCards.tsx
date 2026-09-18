"use client";

import { Users, Wallet } from "lucide-react";
import { useGetCustomerStatsQuery } from "@/redux/api/statsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSignedDue } from "@/utils/formatInvoiceMoney";
import { cn } from "@/lib/utils";

export default function CustomerStatsCards() {
  const { data, isLoading } = useGetCustomerStatsQuery();
  const stats = data?.data;
  const totalCustomers = stats?.totalCustomers ?? 0;
  const totalDue = Number(stats?.totalDue) || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="shadow-xs ring-border/60">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Total Customer
            </p>
            {isLoading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {totalCustomers}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs ring-border/60">
        <CardContent className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              totalDue > 0 && "bg-rose-500/10 text-rose-600",
              totalDue < 0 && "bg-emerald-500/10 text-emerald-600",
              totalDue === 0 && "bg-muted text-muted-foreground",
            )}
          >
            <Wallet className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Total Due
            </p>
            {isLoading ? (
              <Skeleton className="mt-1 h-7 w-28" />
            ) : (
              <p
                className={cn(
                  "text-2xl font-bold tracking-tight font-mono truncate",
                  totalDue > 0 && "text-rose-600",
                  totalDue < 0 && "text-emerald-600",
                  totalDue === 0 && "text-foreground",
                )}
              >
                {formatSignedDue(totalDue)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
