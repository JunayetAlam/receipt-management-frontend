import VerifyMail from '@/components/Auth/VerifyMail';
import React, { Suspense } from 'react';

export default function page() {
    return (
        <Suspense>
            <VerifyMail />
        </Suspense>
    );
}
