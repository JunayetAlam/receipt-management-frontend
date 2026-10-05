import type { Metadata } from "next";
import CheckMail from '@/components/Auth/CheckMail';
import React from 'react';

export const metadata: Metadata = {
  title: "Check Email",
  description: "Check your inbox for the verification or password reset link",
};

export default function page() {
  return (
    <CheckMail />
  );
}