import type { Metadata } from "next";
import VerifyMail from '@/components/Auth/VerifyMail';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to activate your account",
};

export default function page() {
    return (
        <Suspense>
            <VerifyMail />
        </Suspense>
    );
}
