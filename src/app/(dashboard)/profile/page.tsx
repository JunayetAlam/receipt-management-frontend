import type { Metadata } from "next";
import Profile from "@/components/Profile/Profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Update your account profile and password",
};

export default function page() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Profile />
    </div>
  );
}
