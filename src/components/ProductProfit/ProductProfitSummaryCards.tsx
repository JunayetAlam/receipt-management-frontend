"use client";

import {
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  statCardClass,
  statIconClass,
  statLabelClass,
  type StatTone,
} from "@/lib/statCardTone";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import { cn } from "@/lib/utils";
import type { TProductProfitSummary } from "@/types";

function formatQty(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductProfitSummaryCards({
  summary,
  isLoading,
}: {
  summary?: TProductProfitSummary | null;
  isLoading?: boolean;
}) {
  const soldQty = summary?.soldQty ?? 0;
  const salesTotal = summary?.salesTotal ?? 0;
  const purchaseCost = summary?.purchaseCost ?? 0;
  const profit = summary?.profit ?? 0;
  const productCount = summary?.productCount ?? 0;
  const profitPercent = summary?.profitPercent;

  const cards = [
    {
      label: "Products",
      value: String(productCount),
      icon: Package,
      color: "indigo" as StatTone,
      tone: "neutral" as const,
    },
    {
      label: "Sold Qty",
      value: formatQty(soldQty),
      icon: ShoppingCart,
      color: "orange" as StatTone,
      tone: "neutral" as const,
    },
    {
      label: "Sales Total",
      value: formatInvoiceMoney(salesTotal),
      icon: Wallet,
      color: "sky" as StatTone,
      tone: "neutral" as const,
    },
    {
      label: "Purchase Cost",
      value: formatInvoiceMoney(purchaseCost),
      icon: TrendingDown,
      color: "amber" as StatTone,
      tone: "neutral" as const,
    },
    {
      label: "Net Profit/Loss",
      value:
        profitPercent != null
          ? `${formatInvoiceMoney(profit)} (${profitPercent}%)`
          : formatInvoiceMoney(profit),
      icon: TrendingUp,
      color: (profit > 0
        ? "emerald"
        : profit < 0
          ? "rose"
          : "violet") as StatTone,
      tone:
        profit > 0 ? ("profit" as const) : profit < 0 ? ("loss" as const) : ("neutral" as const),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={statCardClass(card.color)}>
            <CardContent className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  statIconClass(card.color),
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold", statLabelClass(card.color))}>
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p
                    className={cn(
                      "text-lg font-bold tracking-tight font-mono truncate",
                      card.tone === "profit" && "text-emerald-600",
                      card.tone === "loss" && "text-rose-600",
                      card.tone === "neutral" && "text-foreground",
                    )}
                  >
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
