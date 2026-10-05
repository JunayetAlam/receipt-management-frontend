import type { Metadata } from "next";
import ResetPassword from '@/components/Auth/ResetPassword';
import React from 'react';

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your account",
};

export default function page() {
    return (
        <ResetPassword />
    );
}