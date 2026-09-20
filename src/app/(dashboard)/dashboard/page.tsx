"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useIsAdmin from "@/hooks/useIsAdmin";
import useHandleSearchParams from "@/hooks/useHandleSearchParams";
import {
  useGetDashboardSummaryQuery,
  useGetProfitBreakdownQuery,
  useGetSalesPerformanceQuery,
} from "@/redux/api/statsApi";
import type { TDashboardPreset } from "@/types/dashboard";
import DashboardHeader from "@/components/Dashboard/Analytics/DashboardHeader";
import DashboardStatCards from "@/components/Dashboard/Analytics/DashboardStatCards";
import SalesPerformanceChart from "@/components/Dashboard/Analytics/SalesPerformanceChart";
import ProfitBreakdownChart from "@/components/Dashboard/Analytics/ProfitBreakdownChart";
import TopSellingProducts from "@/components/Dashboard/Analytics/TopSellingProducts";
import LowStockTable from "@/components/Dashboard/Analytics/LowStockTable";

const PRESET_VALUES: TDashboardPreset[] = ["today", "week", "month", "all", "custom"];

function DashboardContent() {
  const [isAdmin, isAdminLoading] = useIsAdmin();
  const searchParams = useSearchParams();
  const { handleSetSearchParams } = useHandleSearchParams();

  const rawPreset = searchParams.get("preset") as TDashboardPreset | null;
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const preset: TDashboardPreset =
    rawPreset && PRESET_VALUES.includes(rawPreset) ? rawPreset : "month";
  const customReady = preset !== "custom" || (!!startDate && !!endDate);

  const skip = !isAdmin || !customReady;
  const summaryQ = useGetDashboardSummaryQuery(
    { preset, ...(preset === "custom" ? { startDate, endDate } : {}) },
    { skip },
  );
  const salesQ = useGetSalesPerformanceQuery(undefined, { skip: !isAdmin });
  const profitQ = useGetProfitBreakdownQuery(undefined, { skip: !isAdmin });

  if (isAdminLoading) return null;
  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to view dashboard analytics.
        </p>
      </div>
    );
  }

  const summary = summaryQ.data?.data;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <DashboardHeader
        preset={preset}
        startDate={startDate}
        endDate={endDate}
        rangeFrom={summary?.range.startDate}
        rangeTo={summary?.range.endDate}
        onPreset={(p) =>
          handleSetSearchParams({ preset: p, startDate: "", endDate: "", page: "1" })
        }
        onClearRange={() =>
          handleSetSearchParams({ preset: "", startDate: "", endDate: "", page: "1" })
        }
        onCustomRange={(s, e) =>
          handleSetSearchParams({ preset: "custom", startDate: s, endDate: e })
        }
      />

      <DashboardStatCards
        summary={summary?.summary}
        isLoading={summaryQ.isLoading || summaryQ.isFetching}
      />

      <SalesPerformanceChart data={salesQ.data?.data} isLoading={salesQ.isLoading} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfitBreakdownChart data={profitQ.data?.data} isLoading={profitQ.isLoading} />
        <TopSellingProducts
          products={summary?.topProducts}
          isLoading={summaryQ.isLoading || summaryQ.isFetching}
        />
      </div>

      <LowStockTable />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
