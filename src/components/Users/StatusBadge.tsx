"use client";

import { User, UserStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/utils/userAccess";

export default function StatusBadge({ status }: { status: UserStatus | string }) {
  const variant =
    status === "BLOCKED"
      ? "destructive"
      : status === "ACTIVE"
        ? "default"
        : "outline";

  return <Badge variant={variant}>{statusLabel[status] || status}</Badge>;
}

export function UserName({ user }: { user: Pick<User, "firstName" | "lastName" | "email"> }) {
  return (
    <div>
      <p className="font-medium">
        {user.firstName} {user.lastName}
      </p>
      <p className="text-xs text-muted-foreground">{user.email}</p>
    </div>
  );
}
