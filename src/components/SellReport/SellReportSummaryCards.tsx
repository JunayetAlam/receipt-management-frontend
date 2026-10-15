"use client";

import { Package, ShoppingCart, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  statCardClass,
  statIconClass,
  statLabelClass,
  type StatTone,
} from "@/lib/statCardTone";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import type { TProductProfitSummary } from "@/types";

function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SellReportSummaryCards({
  summary,
  isLoading,
}: {
  summary?: TProductProfitSummary | null;
  isLoading?: boolean;
}) {
  const soldQty = summary?.soldQty ?? 0;
  const salesTotal = summary?.salesTotal ?? 0;
  const productCount = summary?.productCount ?? 0;

  const cards = [
    {
      label: "Products",
      value: String(productCount),
      icon: Package,
      tone: "indigo" as StatTone,
    },
    {
      label: "Sold Qty",
      value: formatQty(soldQty),
      icon: ShoppingCart,
      tone: "orange" as StatTone,
    },
    {
      label: "Total Sales",
      value: formatInvoiceMoney(salesTotal),
      icon: Wallet,
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
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="text-lg font-bold tracking-tight font-mono truncate text-foreground">
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
