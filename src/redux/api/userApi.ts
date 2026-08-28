import { DeviceSession, User, TQueryParam, TResponseRedux } from "@/types";
import { baseApi } from "./baseApi";
import { AuthUser, logout, setUser } from "../authSlice";

const isAuthUser = (value: unknown): value is AuthUser =>
  Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      typeof (value as { id: unknown }).id === "string",
  );

const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/register",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User"],
    }),
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        body: userInfo,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (isAuthUser(data?.data)) {
            dispatch(setUser(data.data));
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    resendVerificationEmail: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/resend-verification-otp",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User"],
    }),
    verifyEmail: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User"],
    }),
    forgetPassword: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/forget-password",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User"],
    }),
    verifyForgotPasswordOtp: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/verify-forgot-password-otp",
        method: "POST",
        body: userInfo,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/change-password",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User", "Device"],
    }),
    getLoggedInDevices: builder.query({
      query: () => ({ url: "/auth/logged-in-devices", method: "GET" }),
      transformResponse: (response: TResponseRedux<DeviceSession[]>) => ({
        data: response.data,
      }),
      providesTags: ["Device"],
    }),
    removeDevice: builder.mutation({
      query: (id: string) => ({
        url: `/auth/devices/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.isCurrent) {
            dispatch(logout());
            dispatch(baseApi.util.resetApiState());
            if (typeof window !== "undefined") {
              window.location.href = "/auth/sign-in";
            }
          }
        } catch {
          // Error toasts are handled by the caller.
        }
      },
      invalidatesTags: ["Device"],
    }),
    getAllUsers: builder.query({
      query: (args: TQueryParam[]) => {
        const params = new URLSearchParams();
        if (args)
          args.forEach((item) =>
            params.append(item.name, item.value as string),
          );
        return { url: "/users", method: "GET", params };
      },
      transformResponse: (response: TResponseRedux<User[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (id: string) => ({ url: `/users/${id}`, method: "GET" }),
      transformResponse: (response: TResponseRedux<User>) => ({
        data: response.data,
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/users/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["User", "Device"],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }: { id: string; role: string }) => ({
        url: `/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),
    logoutUserSessions: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["Device", "User"],
    }),
    getUserDevices: builder.query({
      query: (id: string) => ({
        url: `/users/${id}/devices`,
        method: "GET",
      }),
      transformResponse: (response: TResponseRedux<DeviceSession[]>) => ({
        data: response.data,
      }),
      providesTags: (_result, _error, id) => [{ type: "Device", id }],
    }),
    revokeUserDevice: builder.mutation({
      query: ({ userId, sessionId }: { userId: string; sessionId: string }) => ({
        url: `/users/${userId}/devices/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Device"],
    }),
    getMe: builder.query({
      query: () => ({ url: `/users/me`, method: "GET" }),
      transformResponse: (response: TResponseRedux<User>) => ({
        data: response.data,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (isAuthUser(data?.data)) {
            const profile = data.data;
            dispatch(
              setUser({
                id: profile.id,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                name:
                  profile.name ??
                  `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim(),
                role: profile.role,
                profilePhoto: profile.profilePhoto,
              }),
            );
          }
        } catch {
          // Auth failures are handled in baseApi.
        }
      },
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: `/users/update-profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User", "Device"],
    }),
    undeleteUser: builder.mutation({
      query: (id: string) => ({
        url: `/users/undelete-user/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    updateProfileImg: builder.mutation({
      query: (formData: FormData) => ({
        url: `/users/update-profile-image`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: () => ["User", { type: "User" }],
    }),
  }),
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useLogoutMutation,
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
  useForgetPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetLoggedInDevicesQuery,
  useRemoveDeviceMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useLogoutUserSessionsMutation,
  useGetUserDevicesQuery,
  useRevokeUserDeviceMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useDeleteUserMutation,
  useUndeleteUserMutation,
  useUpdateProfileImgMutation,
} = userApi;
