import { TReceipt, TResponse } from "@/types";
import { baseApi } from "./baseApi";

export const receiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReceipts: builder.query<
      TResponse<TReceipt[]>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/receipts",
        method: "GET",
        params,
      }),
      providesTags: ["Receipt"],
    }),

    getReceiptById: builder.query<TResponse<TReceipt>, string>({
      query: (id) => ({
        url: `/receipts/${id}`,
        method: "GET",
      }),
      providesTags: ["Receipt"],
    }),

    createReceipt: builder.mutation<
      TResponse<TReceipt>,
      Record<string, any>
    >({
      query: (body) => ({
        url: "/receipts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Receipt", "Product", "Customer", "ActivityLog", "Notification"],
    }),

    updateReceipt: builder.mutation<
      TResponse<TReceipt>,
      { id: string; body: Record<string, any> }
    >({
      query: ({ id, body }) => ({
        url: `/receipts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Receipt", "Product", "Customer", "ActivityLog", "Notification"],
    }),

    updateReceiptStatus: builder.mutation<
      TResponse<TReceipt>,
      { id: string; status: "APPROVED" | "REJECTED" | "PENDING" }
    >({
      query: ({ id, status }) => ({
        url: `/receipts/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Receipt", "ActivityLog", "Notification"],
    }),

    deleteReceipt: builder.mutation<
      TResponse<TReceipt>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/receipts/${id}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: ["Receipt", "Product", "ActivityLog", "Notification"],
    }),

    confirmDeleteReceipt: builder.mutation<TResponse<TReceipt>, string>({
      query: (id) => ({
        url: `/receipts/${id}/confirm-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Receipt", "Product", "ActivityLog", "Notification"],
    }),

    rejectDeleteReceipt: builder.mutation<TResponse<TReceipt>, string>({
      query: (id) => ({
        url: `/receipts/${id}/reject-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Receipt", "ActivityLog", "Notification"],
    }),

    restoreReceipt: builder.mutation<TResponse<TReceipt>, string>({
      query: (id) => ({
        url: `/receipts/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Receipt", "Product", "ActivityLog", "Notification"],
    }),

    addPayment: builder.mutation<
      TResponse<{ payment: any; receipt: TReceipt }>,
      { id: string; amount: number; note?: string | null; date?: string | null }
    >({
      query: ({ id, amount, note, date }) => ({
        url: `/receipts/${id}/payments`,
        method: "POST",
        body: { amount, note, date },
      }),
      invalidatesTags: ["Receipt", "ActivityLog", "Notification"],
    }),

    updatePayment: builder.mutation<
      TResponse<{ payment: any; receipt: TReceipt }>,
      { receiptId: string; paymentId: string; amount?: number; note?: string | null; date?: string | null }
    >({
      query: ({ receiptId, paymentId, amount, note, date }) => ({
        url: `/receipts/${receiptId}/payments/${paymentId}`,
        method: "PATCH",
        body: { amount, note, date },
      }),
      invalidatesTags: ["Receipt", "ActivityLog", "Notification"],
    }),

    approvePayment: builder.mutation<
      TResponse<{ payment: any; receipt: TReceipt }>,
      { receiptId: string; paymentId: string }
    >({
      query: ({ receiptId, paymentId }) => ({
        url: `/receipts/${receiptId}/payments/${paymentId}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Receipt", "ActivityLog", "Notification"],
    }),

    deletePayment: builder.mutation<
      TResponse<{ deletedPaymentId: string; receipt: TReceipt }>,
      { receiptId: string; paymentId: string }
    >({
      query: ({ receiptId, paymentId }) => ({
        url: `/receipts/${receiptId}/payments/${paymentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Receipt", "ActivityLog", "Notification"],
    }),
  }),
});

export const {
  useGetAllReceiptsQuery,
  useGetReceiptByIdQuery,
  useCreateReceiptMutation,
  useUpdateReceiptMutation,
  useUpdateReceiptStatusMutation,
  useDeleteReceiptMutation,
  useConfirmDeleteReceiptMutation,
  useRejectDeleteReceiptMutation,
  useRestoreReceiptMutation,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useApprovePaymentMutation,
  useDeletePaymentMutation,
} = receiptApi;
