import { TCustomer, TResponse } from "@/types";
import { baseApi } from "./baseApi";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCustomers: builder.query<
      TResponse<TCustomer[]>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/customers",
        method: "GET",
        params,
      }),
      providesTags: ["Customer"],
    }),

    getCustomerById: builder.query<TResponse<TCustomer>, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: ["Customer"],
    }),

    lookupCustomerByPhone: builder.query<
      TResponse<TCustomer | null>,
      { phoneNumber: string; countryCode?: string }
    >({
      query: (params) => ({
        url: "/customers/lookup-phone",
        method: "GET",
        params,
      }),
    }),

    createCustomer: builder.mutation<
      TResponse<TCustomer>,
      Partial<TCustomer>
    >({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer", "ActivityLog"],
    }),

    updateCustomer: builder.mutation<
      TResponse<TCustomer>,
      { id: string; body: Partial<TCustomer> }
    >({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Customer", "ActivityLog"],
    }),

    deleteCustomer: builder.mutation<
      TResponse<TCustomer>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/customers/${id}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: ["Customer", "ActivityLog", "Notification"],
    }),

    confirmDeleteCustomer: builder.mutation<TResponse<TCustomer>, string>({
      query: (id) => ({
        url: `/customers/${id}/confirm-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Customer", "ActivityLog", "Notification"],
    }),

    rejectDeleteCustomer: builder.mutation<TResponse<TCustomer>, string>({
      query: (id) => ({
        url: `/customers/${id}/reject-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Customer", "ActivityLog", "Notification"],
    }),

    restoreCustomer: builder.mutation<TResponse<TCustomer>, string>({
      query: (id) => ({
        url: `/customers/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Customer", "ActivityLog", "Notification"],
    }),
  }),
});

export const {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useLookupCustomerByPhoneQuery,
  useLazyLookupCustomerByPhoneQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useConfirmDeleteCustomerMutation,
  useRejectDeleteCustomerMutation,
  useRestoreCustomerMutation,
} = customerApi;
