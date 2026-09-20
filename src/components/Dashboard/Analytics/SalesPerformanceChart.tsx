"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import type { TSalesPerformancePoint } from "@/types/dashboard";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const chartConfig = {
  sales: { label: "Sales", color: "var(--chart-6)" },
  expenses: { label: "Expenses", color: "var(--chart-7)" },
  profit: { label: "Profit", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function SalesPerformanceChart({
  data,
  isLoading,
}: {
  data?: TSalesPerformancePoint[];
  isLoading?: boolean;
}) {
  const hasData = !!data?.some((p) => p.sales !== 0 || p.expenses !== 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Performance (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : !hasData ? (
          <p className="py-24 text-center text-sm text-muted-foreground">
            No sales in the last 12 months.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-72 w-full">
            <ComposedChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: string) => v.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => compact.format(v)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatInvoiceMoney(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              <Line
                dataKey="expenses"
                type="monotone"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="profit"
                type="monotone"
                stroke="var(--color-profit)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
