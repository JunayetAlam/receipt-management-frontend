export type TDashboardPreset = "today" | "week" | "month" | "all" | "custom";

export type TDashboardTopProduct = {
  productId: string;
  productName: string;
  soldQty: number;
  salesTotal: number;
  purchaseCost: number;
  profit: number;
  profitPercent: number | null;
};

export type TDashboardSummary = {
  range: {
    preset: TDashboardPreset;
    startDate: string;
    endDate: string;
    timezone: string;
  };
  summary: {
    totalSales: number;
    totalExpenses: number;
    totalCustomers: number;
    lowStockCount: number;
  };
  topProducts: TDashboardTopProduct[];
};

export type TSalesPerformancePoint = {
  month: string;
  label: string;
  sales: number;
  expenses: number;
  profit: number;
};

export type TProfitBreakdown = {
  months: {
    month: string;
    label: string;
    profit: number;
    percent: number | null;
  }[];
  totalProfit: number;
  positiveTotal: number;
};

export type TLowStockProduct = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  sellingPrice: number;
  buyingPrice: number | null;
};

export type TLowStockData = {
  threshold: number;
  products: TLowStockProduct[];
};
