"use client";

import React from "react";
import { ArrowLeftRight, Clock, Wallet, Scale } from "lucide-react";
import { useGetCustomerTransactionStatsQuery } from "@/redux/api/customerTransactionApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  statCardClass,
  statIconClass,
  statLabelClass,
  type StatTone,
} from "@/lib/statCardTone";
import { formatInvoiceMoney, formatSignedDue } from "@/utils/formatInvoiceMoney";

interface CustomerTransactionStatsCardsProps {
  queryParams?: Record<string, unknown>;
}

export default function CustomerTransactionStatsCards({
  queryParams,
}: CustomerTransactionStatsCardsProps) {
  const { data, isLoading } = useGetCustomerTransactionStatsQuery(queryParams);
  const stats = data?.data;

  const totalTransactions = stats?.totalTransactions ?? 0;
  const totalDue = stats?.totalDue ?? 0;
  const totalPayment = stats?.totalPayment ?? 0;
  const totalBalance = stats?.totalBalance ?? (totalDue - totalPayment);

  const cards = [
    {
      label: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      icon: ArrowLeftRight,
      tone: "blue" as StatTone,
      description: "Recorded transactions count",
    },
    {
      label: "Total Due",
      value: formatInvoiceMoney(totalDue),
      icon: Clock,
      tone: "amber" as StatTone,
      description: "Total invoice due sum",
    },
    {
      label: "Total Cash / Payment",
      value: formatInvoiceMoney(totalPayment),
      icon: Wallet,
      tone: "emerald" as StatTone,
      description: "Total cash received & credits",
    },
    {
      label: "Present Due",
      value: formatSignedDue(totalBalance),
      icon: Scale,
      tone: (totalBalance > 0 ? "rose" : "violet") as StatTone,
      description: "Net outstanding due balance",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={statCardClass(card.tone)}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${statIconClass(card.tone)}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${statLabelClass(card.tone)}`}>
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-20" />
                ) : (
                  <p className="text-xl font-bold tracking-tight text-foreground font-mono truncate">
                    {card.value}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
