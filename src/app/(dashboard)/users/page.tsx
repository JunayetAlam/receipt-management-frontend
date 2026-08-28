import { Suspense } from "react";
import UsersList from "@/components/Users/UsersList";
import TableSkeleton from "@/components/Global/TableSkeleton";

export default function UsersPage() {
  return (
    <Suspense fallback={<TableSkeleton headers={["Name", "Role", "Status", "Phone", "Actions"]} title="Users" />}>
      <UsersList />
    </Suspense>
  );
}
