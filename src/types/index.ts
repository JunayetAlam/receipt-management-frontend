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

export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "DUE_REMINDER"
  | "PAYMENT_ALERT"
  | "SYSTEM";

export type NotificationTargetType =
  | "ALL"
  | "ADMINS"
  | "CASHIERS"
  | "SPECIFIC_USER";

export interface TNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetType: NotificationTargetType;
  link?: string | null;
  userId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRoleEnum;
    profilePhoto?: string | null;
  } | null;
}

export type ProductUnit =
  | "KG"
  | "LITER"
  | "PIECE"
  | "GRAM"
  | "METER"
  | "BOX"
  | "PACKET"
  | "OTHER";

export interface TProduct {
  id: string;
  name: string;
  slug?: string | null;
  unit: ProductUnit;
  sellingPrice: number;
  buyingPrice?: number | null;
  stock: number;
  description?: string | null;
  isDeleted: boolean;
  isDeleteRequested: boolean;
  deleteRequestedAt?: string | null;
  deleteReason?: string | null;
  deleteRequestedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TCustomer {
  id: string;
  name: string;
  countryCode?: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  isDeleted: boolean;
  isDeleteRequested: boolean;
  deleteRequestedAt?: string | null;
  deleteReason?: string | null;
  deleteRequestedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type TResponse<T> = {
  data?: T;
  error?: TError;
  meta?: TMeta;
  success: boolean;
  message: string;
};

export type TResponseRedux<T> = TResponse<T> & BaseQueryApi;
