import { useGetMeQuery } from "@/redux/api/userApi";

export default function useIsAdmin() {
  const { data, isLoading: isAdminLoading } = useGetMeQuery(undefined);
  const role = data?.data?.role;
  const isSuperAdmin = role === "SUPERADMIN";
  const isAdmin = role === "SUPERADMIN" || role === "ADMIN";
  return [isAdmin, isAdminLoading, isSuperAdmin] as const;
}
