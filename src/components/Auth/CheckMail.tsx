'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckMail() {
    const params = useSearchParams();
    const router = useRouter();
    const email = params.get('email') || '';
    const purpose = params.get('purpose') === 'reset' ? 'reset' : 'verify';

    useEffect(() => {
        const query = new URLSearchParams();
        if (email) query.set('email', email);
        query.set('purpose', purpose);
        router.replace(`/auth/verify-email?${query.toString()}`);
    }, [email, purpose, router]);

    return null;
}
