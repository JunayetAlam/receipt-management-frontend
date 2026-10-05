import type { Metadata } from "next";
import ForgetPassword from '@/components/Auth/ForgetPassword';
import React from 'react';

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your account",
};

export default function page() {
    return (
        <ForgetPassword />
    );
}