/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  DefinitionType,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { TResponse, User } from "@/types";
import { toast } from "sonner";
import { logout } from "../authSlice";
import { AppConfig } from "@/config";

const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/login-with-firebase",
  "/auth/verify-email",
  "/auth/resend-verification-otp",
  "/auth/resend-verification-email",
  "/auth/forget-password",
  "/auth/verify-forgot-password-otp",
  "/auth/reset-password",
  "/auth/logout",
];

const AUTH_FAILURE_MESSAGES = new Set([
  "You are not authorized!",
  "Expired token",
  "You are not verified!",
  "You are Blocked!",
  "Your account is pending admin approval.",
  "Your account is inactive.",
]);

const getRequestUrl = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url ?? "";

const isPublicAuthRequest = (url: string) =>
  PUBLIC_AUTH_PATHS.some((path) => url === path || url.startsWith(`${path}?`));

const isAuthFailure = (result: { error?: any }) => {
  const status = result.error?.status;
  const message = result.error?.data?.message as string | undefined;

  if (status === 401) return true;
  if (message && AUTH_FAILURE_MESSAGES.has(message)) return true;
  if (message?.includes("Account has been deleted")) return true;
  return false;
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${AppConfig.backendUrl}/api/v1`,
  credentials: "include",
});

const baseQueryWithSession: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  const result = (await baseQuery(args, api, extraOptions)) as TResponse<User>;
  const url = getRequestUrl(args as string | FetchArgs);

  if (!isPublicAuthRequest(url) && isAuthFailure(result)) {
    const message =
      (result.error as { data?: { message?: string } } | undefined)?.data
        ?.message || "Session expired";
    toast.error(message);
    api.dispatch(logout());
    api.dispatch(baseApi.util.resetApiState());
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/auth/")
    ) {
      window.location.href = "/auth/sign-in";
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithSession,
  tagTypes: ["User", "Device"],
  endpoints: () => ({}),
});
