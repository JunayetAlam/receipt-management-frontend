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
import {
  formatInvoiceMoney,
  formatSignedDue,
} from "@/utils/formatInvoiceMoney";

interface CustomerProfileStatsCardsProps {
  customerId: string;
}

export default function CustomerProfileStatsCards({
  customerId,
}: CustomerProfileStatsCardsProps) {
  const { data, isLoading } = useGetCustomerTransactionStatsQuery(
    { customerId },
    { skip: !customerId },
  );

  const stats = data?.data;
  const totalTransactions = stats?.totalTransactions ?? 0;
  const totalDue = stats?.totalDue ?? 0;
  const totalPayment = stats?.totalPayment ?? 0;
  const totalBalance = stats?.totalBalance ?? totalDue - totalPayment;

  const cards = [
    {
      label: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      icon: ArrowLeftRight,
      tone: "blue" as StatTone,
      description: "Total recorded transactions",
    },
    {
      label: "Total Due",
      value: formatInvoiceMoney(totalDue),
      icon: Clock,
      tone: "amber" as StatTone,
      description: "Sum of all invoiced amounts",
    },
    {
      label: "Total Cash / Payment",
      value: formatInvoiceMoney(totalPayment),
      icon: Wallet,
      tone: "emerald" as StatTone,
      description: "Total payments & return credits",
    },
    {
      label: "Present Due",
      value: formatSignedDue(totalBalance),
      icon: Scale,
      tone: (totalBalance > 0 ? "rose" : "violet") as StatTone,
      description: "Net outstanding balance (Due - Paid)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={statCardClass(card.tone)}>
            <CardContent className="flex items-center gap-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${statIconClass(card.tone)}`}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${statLabelClass(card.tone)}`}>
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono truncate mt-0.5">
                    {card.value}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
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
