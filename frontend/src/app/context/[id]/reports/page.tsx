"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Report {
    period: { month: number; year: number };
    totalIncome: number;
    totalExpense: number;
    balance: number;
    byCategory: {
        name: string;
        icon: string;
        amount: number;
        type: 'INCOME' | 'EXPENSE';
    }[];
}

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [report, setReport] = useState<Report | null>(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && id) {
            loadReport();
        }
    }, [user, isLoading, id, month, year, router]);

    const loadReport = () => {
        api.get(`/reports/monthly/${id}?month=${month}&year=${year}`)
            .then(res => setReport(res.data))
            .catch(err => console.error("Error loading report", err));
    };

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    if (isLoading || !user) return <div>Carregando...</div>;

    const expenseCategories = report?.byCategory.filter(c => c.type === 'EXPENSE') || [];
    const incomeCategories = report?.byCategory.filter(c => c.type === 'INCOME') || [];

    const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                        <h1 style={{ marginBottom: '0.25rem' }}>Relatórios</h1>
                    </div>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>←</Button>
                        <span style={{ fontWeight: 600 }}>{month.toString().padStart(2, '0')}/{year}</span>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth}>→</Button>
                    </div>
                </div>
            </header>

            {report && (
                <div style={{ display: 'grid', gap: '2rem' }}>

                    {/* Resumo */}
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="glass hover-lift transition-all" style={{ padding: '1.75rem', borderRadius: 'var(--radius)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>Receitas</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>{formatMoney(report.totalIncome)}</p>
                        </div>
                        <div className="glass hover-lift transition-all" style={{ padding: '1.75rem', borderRadius: 'var(--radius)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>Despesas</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>{formatMoney(report.totalExpense)}</p>
                        </div>
                        <div className="glass hover-lift transition-all" style={{ padding: '1.75rem', borderRadius: 'var(--radius)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>Saldo do Mês</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: report.balance >= 0 ? '#10b981' : '#ef4444' }}>{formatMoney(report.balance)}</p>
                        </div>
                    </section>

                    {/* Gráfico de Barras por Categoria (Simplificado com CSS) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                        {/* Despesas */}
                        <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                            <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>Despesas por Categoria</h2>
                            {expenseCategories.length === 0 ? <p style={{ color: 'hsl(var(--muted-foreground))' }}>Sem despesas no período.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {expenseCategories.map((cat, idx) => {
                                        const percent = (cat.amount / report.totalExpense) * 100;
                                        return (
                                            <div key={idx}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                                    <span>{cat.icon} {cat.name}</span>
                                                    <span style={{ fontWeight: 600 }}>{formatMoney(cat.amount)} <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400, fontSize: '0.85rem' }}>({percent.toFixed(1)}%)</span></span>
                                                </div>
                                                <div style={{ width: '100%', height: '10px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '5px', transition: 'width 1s ease-out' }}></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Receitas */}
                        <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                            <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>Receitas por Categoria</h2>
                            {incomeCategories.length === 0 ? <p style={{ color: 'hsl(var(--muted-foreground))' }}>Sem receitas no período.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {incomeCategories.map((cat, idx) => {
                                        const percent = (cat.amount / report.totalIncome) * 100;
                                        return (
                                            <div key={idx}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                                    <span>{cat.icon} {cat.name}</span>
                                                    <span style={{ fontWeight: 600 }}>{formatMoney(cat.amount)} <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400, fontSize: '0.85rem' }}>({percent.toFixed(1)}%)</span></span>
                                                </div>
                                                <div style={{ width: '100%', height: '10px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '5px', transition: 'width 1s ease-out' }}></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            )}
        </div>
    );
}
