'use client'

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Title from '../Global/Title';
import Subtitle from '../Global/Subtitle';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    useResendVerificationEmailMutation,
    useVerifyEmailMutation,
    useVerifyForgotPasswordOtpMutation,
} from '@/redux/api/userApi';

export default function VerifyMail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';
    const purpose = searchParams.get('purpose') === 'reset' ? 'reset' : 'verify';

    const [otp, setOtp] = useState('');
    const [pendingApproval, setPendingApproval] = useState(false);
    const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation();
    const [verifyResetOtp, { isLoading: isVerifyingReset }] = useVerifyForgotPasswordOtpMutation();
    const [resend, { isLoading: isResending }] = useResendVerificationEmailMutation();

    const isLoading = isVerifyingEmail || isVerifyingReset;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !otp) {
            toast.error('Email and verification code are required');
            return;
        }

        const toastId = toast.loading('Verifying...');
        try {
            if (purpose === 'reset') {
                const result = await verifyResetOtp({ email, otp }).unwrap();
                const token = result?.data?.resetToken;
                if (!token) {
                    toast.error('Reset token missing. Try again.', { id: toastId });
                    return;
                }
                toast.success(result?.message || 'Code verified', { id: toastId });
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${token}`);
                return;
            }

            const result = await verifyEmail({ email, otp }).unwrap();
            toast.success(result?.message || 'Email verified', { id: toastId });
            setPendingApproval(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.data?.message || 'Verification failed', { id: toastId });
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Email not found');
            return;
        }
        if (purpose === 'reset') {
            toast.info('Go back and request a new reset code.');
            return;
        }
        const toastId = toast.loading('Resending code...');
        try {
            const result = await resend({ email }).unwrap();
            toast.success(result?.message || 'Code sent', { id: toastId });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.data?.message || 'Could not resend code', { id: toastId });
        }
    };

    if (pendingApproval) {
        return (
            <div className="w-full max-w-md text-center space-y-4">
                <Title>Waiting for approval</Title>
                <Subtitle>
                    Your email is verified. An admin needs to activate your account before you can sign in.
                </Subtitle>
                <Link href="/auth/sign-in">
                    <Button className="mt-4">Go to Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <Title>{purpose === 'reset' ? 'Enter reset code' : 'Verify your email'}</Title>
                <Subtitle>
                    We sent a code to <span className="font-semibold">{email || 'your email'}</span>.
                </Subtitle>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    disabled={isLoading}
                    required
                    className="md:h-11 tracking-widest text-center"
                />
                <Button type="submit" className="w-full" size="lg" disabled={isLoading || !email}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
            </form>

            <div className="text-center mt-6 space-y-2">
                {purpose === 'verify' && (
                    <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive the code?{' '}
                        <Button
                            disabled={isResending || isLoading}
                            onClick={handleResend}
                            variant="link"
                            className="px-0 text-sm"
                        >
                            Resend
                        </Button>
                    </p>
                )}
                <Link href="/auth/sign-in">
                    <Button variant="link" className="px-0 text-sm">Back to sign in</Button>
                </Link>
            </div>
        </div>
    );
}
