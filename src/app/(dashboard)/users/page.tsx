import type { Metadata } from "next";
import { Suspense } from "react";
import UsersList from "@/components/Users/UsersList";
import TableSkeleton from "@/components/Global/TableSkeleton";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage staff accounts, roles, and access status",
};

export default function UsersPage() {
  return (
    <Suspense fallback={<TableSkeleton headers={["Name", "Role", "Status", "Phone", "Actions"]} title="Users" />}>
      <UsersList />
    </Suspense>
  );
}
