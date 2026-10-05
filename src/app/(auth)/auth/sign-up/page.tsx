import type { Metadata } from "next";
import SignUp from '@/components/Auth/SignUp';
import React from 'react';

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a staff account",
};

export default function page() {
  return (
    <SignUp />
  );
}