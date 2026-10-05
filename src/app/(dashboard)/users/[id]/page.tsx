import type { Metadata } from "next";
import UserDetail from "@/components/Users/UserDetail";

export const metadata: Metadata = {
  title: "User Details",
  description: "View user profile, role, and activity details",
};

export default function UserDetailPage() {
  return <UserDetail />;
}
