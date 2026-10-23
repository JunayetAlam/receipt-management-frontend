import { TBulkImportProduct, TProduct, TProductOption, TProductProfitReport, TProductStats, TResponse } from "@/types";
import { baseApi } from "./baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query<
      TResponse<TProduct[]>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: ["Product"],
    }),

    getProductOptions: builder.query<
      TResponse<TProductOption[]>,
      { searchTerm?: string; limit?: number } | undefined
    >({
      query: (params) => ({
        url: "/products/options",
        method: "GET",
        params,
      }),
      providesTags: ["Product"],
    }),

    getProductStats: builder.query<TResponse<TProductStats>, void>({
      query: () => ({
        url: "/products/stats",
        method: "GET",
      }),
      providesTags: ["Product", "Receipt", "ReturnInvoice"],
    }),

    getProductProfit: builder.query<
      TResponse<TProductProfitReport>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/products/profit",
        method: "GET",
        params,
      }),
      providesTags: ["Product", "Receipt", "ReturnInvoice"],
    }),

    getProductById: builder.query<TResponse<TProduct>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<
      TResponse<TProduct>,
      Partial<TProduct>
    >({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "ActivityLog"],
    }),

    // Used by the background bulk import queue, one row per request.
    // No invalidatesTags: the queue invalidates in batches to avoid a refetch per row.
    importProduct: builder.mutation<
      TResponse<TProduct & { restored: boolean }>,
      TBulkImportProduct
    >({
      query: (body) => ({
        url: "/products/import",
        method: "POST",
        body,
      }),
    }),

    bulkCreateProducts: builder.mutation<
      TResponse<TProduct[]>,
      { products: Partial<TProduct>[] }
    >({
      query: (body) => ({
        url: "/products/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "ActivityLog"],
    }),

    updateProduct: builder.mutation<
      TResponse<TProduct>,
      { id: string; body: Partial<TProduct> }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product", "ActivityLog"],
    }),

    deleteProduct: builder.mutation<
      TResponse<TProduct>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/products/${id}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: ["Product", "ActivityLog", "Notification"],
    }),

    confirmDeleteProduct: builder.mutation<TResponse<TProduct>, string>({
      query: (id) => ({
        url: `/products/${id}/confirm-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product", "ActivityLog", "Notification"],
    }),

    rejectDeleteProduct: builder.mutation<TResponse<TProduct>, string>({
      query: (id) => ({
        url: `/products/${id}/reject-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product", "ActivityLog", "Notification"],
    }),

    restoreProduct: builder.mutation<TResponse<TProduct>, string>({
      query: (id) => ({
        url: `/products/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product", "ActivityLog", "Notification"],
    }),

    permanentDeleteProduct: builder.mutation<TResponse<null>, string>({
      query: (id) => ({
        url: `/products/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "ActivityLog"],
    }),

    clearArchivedProducts: builder.mutation<TResponse<{ count: number }>, void>({
      query: () => ({
        url: "/products/archived/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "ActivityLog"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductOptionsQuery,
  useGetProductStatsQuery,
  useGetProductProfitQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useBulkCreateProductsMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useConfirmDeleteProductMutation,
  useRejectDeleteProductMutation,
  useRestoreProductMutation,
  usePermanentDeleteProductMutation,
  useClearArchivedProductsMutation,
} = productApi;
