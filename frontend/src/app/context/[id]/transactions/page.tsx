"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    isPaid: boolean;
    dueDate?: string;
    sourceAccount?: { name: string };
    destinationAccount?: { name: string };
    category?: { name: string; icon: string };
}

export default function TransactionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!isLoading && !user) router.push('/auth/login');
        if (user && id) loadTransactions();
    }, [user, isLoading, id]);

    const loadTransactions = () => {
        api.get(`/transactions/context/${id}`)
            .then(res => setTransactions(res.data))
            .catch(err => console.error("Erro ao carregar transações", err));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
    });

    const handleDelete = async (txId: string) => {
        if (!confirm("Tem certeza que deseja excluir esta movimentação?")) return;
        try {
            await api.delete(`/transactions/${txId}`);
            loadTransactions(); // Reload after delete
        } catch (error) {
            alert("Erro ao excluir. Funcionalidade pode não estar implementada no backend.");
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                    <h1>Movimentações</h1>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: 'hsl(var(--muted))', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.5rem' }}>‹</button>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.5rem' }}>›</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTransactions.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Nada neste mês.</div>
                ) : (
                    filteredTransactions.map(tx => (
                        <div key={tx.id} className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', backgroundColor: tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : tx.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: tx.type === 'INCOME' ? '#10b981' : tx.type === 'EXPENSE' ? '#ef4444' : '#3b82f6' }}>{tx.type === 'INCOME' ? '↓' : tx.type === 'EXPENSE' ? '↑' : '⇄'}</div>
                                <div>
                                    <p style={{ fontWeight: 500 }}>
                                        {tx.category?.icon ? `${tx.category.icon} ` : ''}
                                        {tx.description}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                        {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.isPaid ? 'Pago' : 'Pendente'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, color: tx.type === 'INCOME' ? '#10b981' : tx.type === 'EXPENSE' ? '#ef4444' : 'hsl(var(--foreground))' }}>
                                    {tx.type === 'EXPENSE' ? '-' : '+'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(tx.amount))}
                                </div>
                                <button onClick={() => handleDelete(tx.id)} style={{ fontSize: '0.7rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem' }}>
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
