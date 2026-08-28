import { UserRoleEnum } from "@/types";

export const canManageUser = (
  actorRole: UserRoleEnum | string | undefined,
  targetRole: UserRoleEnum | string,
) => {
  if (!actorRole) return false;
  if (targetRole === "SUPERADMIN") return false;
  if (actorRole === "SUPERADMIN") return true;
  if (actorRole === "ADMIN") return targetRole === "CASHIER";
  return false;
};

export const roleLabel: Record<UserRoleEnum, string> = {
  SUPERADMIN: "Super admin",
  ADMIN: "Admin",
  CASHIER: "Cashier",
};

export const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
};
