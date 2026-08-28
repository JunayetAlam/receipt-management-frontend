"use client";

import { useGetMeQuery } from "@/redux/api/userApi";
import Spinner from "../Global/Spinner";

export default function DashboardAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError } = useGetMeQuery(undefined);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center p-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return <>{children}</>;
}
