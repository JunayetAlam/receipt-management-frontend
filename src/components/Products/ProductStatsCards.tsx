"use client";

import { Package, ShoppingCart, Warehouse } from "lucide-react";
import { useGetProductStatsQuery } from "@/redux/api/productApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  statCardClass,
  statIconClass,
  statLabelClass,
  type StatTone,
} from "@/lib/statCardTone";

function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductStatsCards() {
  const { data, isLoading } = useGetProductStatsQuery();
  const stats = data?.data;
  const totalProducts = stats?.totalProducts ?? 0;
  const totalStock = Number(stats?.totalStock) || 0;
  const totalSoldQty = Number(stats?.totalSoldQty) || 0;

  const cards = [
    {
      label: "Total Product",
      value: String(totalProducts),
      icon: Package,
      tone: "indigo" as StatTone,
    },
    {
      label: "Total Stock",
      value: formatQty(totalStock),
      icon: Warehouse,
      tone: "teal" as StatTone,
    },
    {
      label: "Total Sold Qty",
      value: formatQty(totalSoldQty),
      icon: ShoppingCart,
      tone: "emerald" as StatTone,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={statCardClass(card.tone)}>
            <CardContent className="flex items-center gap-4">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${statIconClass(card.tone)}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${statLabelClass(card.tone)}`}>
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground font-mono truncate">
                    {card.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
