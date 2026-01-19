"use client";

import React, { use } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function ContextLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <div className="hidden-on-mobile">
                <Sidebar contextId={id} />
            </div>
            <main className="mobile-no-margin" style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width)',
                padding: '2rem',
                width: 'calc(100% - var(--sidebar-width))'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
