import { TCustomerStats, TResponse } from "@/types";
import { baseApi } from "./baseApi";

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerStats: builder.query<TResponse<TCustomerStats>, void>({
      query: () => ({
        url: "/stats/customers",
        method: "GET",
      }),
      providesTags: ["Stats", "Customer", "Receipt", "ReturnInvoice"],
    }),
  }),
});

export const { useGetCustomerStatsQuery } = statsApi;
