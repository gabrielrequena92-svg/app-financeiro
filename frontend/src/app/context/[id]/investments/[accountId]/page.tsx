"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface Account {
    id: string;
    name: string;
    type: 'CASH' | 'CREDIT' | 'INVESTMENT' | 'ASSET';
    initialBalance: number;
    currentBalance?: number;
}

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    category?: { name: string; icon: string };
    sourceAccountId?: string;
    destinationAccountId?: string;
}

export default function InvestmentDetailsPage({ params }: { params: Promise<{ id: string; accountId: string }> }) {
    const { id, accountId } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && accountId) {
            loadData();
        }
    }, [user, isLoading, accountId]);

    const loadData = async () => {
        try {
            // Load account details - currently we don't have a direct /accounts/:id endpoint without context, 
            // but we can filter from context accounts or add a findOne endpoint.
            // Assuming we added /accounts/context/:id, we can just find it there or fetch specifically?
            // Actually AccountsController has @Get(':id') findOne.
            const accRes = await api.get(`/accounts/${accountId}`);
            setAccount(accRes.data);

            const txRes = await api.get(`/transactions/account/${accountId}`);
            setTransactions(txRes.data);
        } catch (error) {
            console.error("Erro ao carregar detalhes", error);
        }
    };

    const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

    if (isLoading || !account) return <div style={{ padding: '2rem' }}>Carregando...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                <div>
                    <h1 style={{ marginBottom: '0.25rem', fontSize: '1.5rem' }}>{account.name}</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                        {account.type === 'INVESTMENT' ? 'Investimento' : 'Patrimônio'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Summary Card */}
                <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>Saldo Atual</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                        {formatMoney(account.currentBalance ?? account.initialBalance)}
                    </p>
                </section>

                {/* History */}
                <section>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>Histórico</h2>
                    {transactions.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)' }}>
                            <p>Nenhuma movimentação encontrada.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {transactions.map(tx => {
                                const isEntry = tx.destinationAccountId === account.id; // Money coming in
                                // Logic for sign: 
                                // To account: +
                                // From account: -
                                // Wait, simple logic:
                                // If tx.type == INVESTMENT -> usually transfer from CASH to INVESTMENT. So for INVESTMENT account it IS an entry (+).
                                // If tx.type == REDEMPTION -> Investment to Cash (-).

                                // Let's simplify:
                                const isPositive = tx.destinationAccountId === accountId;
                                const color = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
                                const sign = isPositive ? '+' : '-';

                                return (
                                    <div key={tx.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: 'hsla(var(--primary)/0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem'
                                            }}>
                                                {tx.category?.icon || (isPositive ? '📥' : '📤')}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{tx.description}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    {formatDate(tx.date)} • {tx.category?.name || tx.type}
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ color, fontWeight: 600 }}>
                                            {sign} {formatMoney(Number(tx.amount))}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
