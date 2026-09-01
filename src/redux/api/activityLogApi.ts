import { TActivityLog, TResponse } from "@/types";
import { baseApi } from "./baseApi";

export const activityLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllActivityLogs: builder.query<
      TResponse<TActivityLog[]>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/activity-logs",
        method: "GET",
        params,
      }),
      providesTags: ["ActivityLog"],
    }),

    getMyActivityLogs: builder.query<
      TResponse<TActivityLog[]>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/activity-logs/my-logs",
        method: "GET",
        params,
      }),
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const {
  useGetAllActivityLogsQuery,
  useGetMyActivityLogsQuery,
} = activityLogApi;
