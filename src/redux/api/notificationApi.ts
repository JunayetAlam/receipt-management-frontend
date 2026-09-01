import { TNotification, TResponse } from "@/types";
import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<
      TResponse<TNotification[]>,
      Record<string, unknown> | undefined
    >({
      query: (params) => ({
        url: "/notifications/my-notifications",
        method: "GET",
        params,
      }),
      providesTags: ["Notification"],
    }),

    getUnreadNotificationCount: builder.query<
      TResponse<{ unreadCount: number }>,
      void
    >({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    markAsRead: builder.mutation<TResponse<{ isRead: boolean }>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<TResponse<{ markedCount: number }>, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<TResponse<null>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
