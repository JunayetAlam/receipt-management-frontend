import { BaseQueryApi } from "@reduxjs/toolkit/query";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type UserRoleEnum = "SUPERADMIN" | "ADMIN" | "CASHIER";

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRoleEnum;
  status: UserStatus;
  bio?: string | null;
  location?: string | null;
  isAgreeWithTerms?: boolean;
  profilePhoto?: string | null;
  isEmailVerified?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  name?: string;
}

export interface DeviceSession {
  id: string;
  ip: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  expireAt: string;
  createdAt: string;
  isCurrent?: boolean;
}
export type TQueryParam = {
  name: string;
  value: boolean | React.Key;
};
export type TError = {
  data: {
    message: string;
    stack: string;
    success: boolean;
  };
  status: number;
};

export type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  data?: T;
  error?: TError;
  meta?: TMeta;
  success: boolean;
  message: string;
};

export type TResponseRedux<T> = TResponse<T> & BaseQueryApi;
