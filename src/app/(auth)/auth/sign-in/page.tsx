import type { Metadata } from "next";
import SignIn from "@/components/Auth/SignIn";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to manage products, customers, receipts, and reports",
};

export default function page() {
  return (
     <SignIn />
  );
}