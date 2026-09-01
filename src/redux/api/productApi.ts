import { TProduct, TResponse } from "@/types";
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
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useConfirmDeleteProductMutation,
  useRejectDeleteProductMutation,
  useRestoreProductMutation,
} = productApi;
