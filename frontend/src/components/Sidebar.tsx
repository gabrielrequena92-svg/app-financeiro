"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from './ui/Button';

interface SidebarProps {
    contextId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ contextId }) => {
    const router = useRouter();
    const pathname = usePathname();

    const [features, setFeatures] = React.useState<string[]>([]);

    React.useEffect(() => {
        api.get(`/contexts/${contextId}`)
            .then(res => setFeatures(res.data.features || []))
            .catch(err => console.error("Error fetching context features", err));
    }, [contextId]);

    const inputMenuItems = [
        { label: 'Visão Geral', icon: '🏠', path: `/context/${contextId}` },
        { label: 'Relatórios', icon: '📊', path: `/context/${contextId}/reports` },
        { label: 'Metas', icon: '🎯', path: `/context/${contextId}/budgets` },
        { label: 'Investimentos', icon: '📈', path: `/context/${contextId}/investments`, requiredFeature: 'INVESTMENTS' },
        { label: 'Membros', icon: '👥', path: `/context/${contextId}/members` },
        { label: 'Configurações', icon: '⚙️', path: `/context/${contextId}/settings` },
        { label: 'Categorias', icon: '🏷️', path: `/context/${contextId}/categories` },
        { label: 'Contas', icon: '💳', path: `/context/${contextId}/accounts` },
    ];

    const menuItems = inputMenuItems.filter(item => !item.requiredFeature || features.includes(item.requiredFeature));

    return (
        <aside className="glass" style={{
            width: 'var(--sidebar-width, 280px)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            zIndex: 40,
            borderRight: '1px solid hsla(var(--border) / 0.5)'
        }}>
            <div style={{ padding: '0 1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>Financeiro</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="transition-all sidebar-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                backgroundColor: isActive ? 'hsl(var(--primary))' : 'transparent',
                                color: isActive ? 'hsl(var(--primary-foreground))' : 'black',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.95rem'
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem' }}>
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--foreground))' }}
                >
                    🚪 Voltar ao Início
                </Button>
            </div>
        </aside>
    );
};
