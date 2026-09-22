"use client";

import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInvoiceMoney } from "@/utils/formatInvoiceMoney";
import { cn } from "@/lib/utils";
import type { TProfitBreakdown } from "@/types/dashboard";
import ChartMonthRangeFilter, {
  formatRangeSubtext,
} from "./ChartMonthRangeFilter";

const colorVar = (i: number) => `var(--chart-${(i % 12) + 1})`;
/** Chart config keys must be CSS-safe, so "2026-09" becomes "m2026_09". */
const keyOf = (month: string) => `m${month.replace("-", "_")}`;

export default function ProfitBreakdownChart({
  data,
  isLoading,
  range,
  onRangeChange,
}: {
  data?: TProfitBreakdown;
  isLoading?: boolean;
  range?: { startMonth?: string; endMonth?: string };
  onRangeChange?: (range: { startMonth?: string; endMonth?: string }) => void;
}) {
  const months = data?.months ?? [];
  const chartConfig = Object.fromEntries(
    months.map((m, i) => [keyOf(m.month), { label: m.label, color: colorVar(i) }]),
  ) satisfies ChartConfig;

  const slices = months
    .map((m, i) => ({ ...m, key: keyOf(m.month), fill: `var(--color-${keyOf(m.month)})`, i }))
    .filter((m) => m.profit > 0);
  const net = data?.totalProfit ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">
          Profit Breakdown ({formatRangeSubtext(range?.startMonth, range?.endMonth)})
        </CardTitle>
        <ChartMonthRangeFilter
          startMonth={range?.startMonth}
          endMonth={range?.endMonth}
          onApply={(start, end) =>
            onRangeChange?.({ startMonth: start, endMonth: end })
          }
          onReset={() => onRangeChange?.({})}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : slices.length === 0 ? (
          <p className="py-24 text-center text-sm text-muted-foreground">
            No profit recorded in the selected period.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <div className="relative shrink-0">
              <ChartContainer config={chartConfig} className="aspect-square h-56 w-56">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="key"
                        formatter={(value, _name, item) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground">{item.payload?.label}</span>
                            <span className="font-mono font-medium tabular-nums">
                              {formatInvoiceMoney(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={slices}
                    dataKey="profit"
                    nameKey="key"
                    innerRadius="62%"
                    strokeWidth={2}
                  >
                    {slices.map((s) => (
                      <Cell key={s.month} fill={s.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-muted-foreground">Net profit</span>
                <span className={cn("text-sm font-semibold", net < 0 ? "text-destructive" : "text-emerald-600")}>
                  {formatInvoiceMoney(net)}
                </span>
              </div>
            </div>

            <ul className="grid max-h-72 w-full grid-cols-1 gap-x-4 gap-y-1.5 overflow-y-auto pr-1 text-sm sm:grid-cols-2">
              {months.map((m, i) => (
                <li key={m.month} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: m.profit > 0 ? colorVar(i) : "var(--destructive)" }}
                    />
                    {m.label}
                  </span>
                  <span className={cn("tabular-nums", m.profit < 0 && "text-destructive")}>
                    {m.profit < 0 ? "−" : ""}
                    {formatInvoiceMoney(Math.abs(m.profit))}
                    {m.percent != null && (
                      <span className="ml-1 text-xs text-muted-foreground">({m.percent}%)</span>
                    )}
                    {m.profit < 0 && <span className="ml-1 text-xs">loss</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
