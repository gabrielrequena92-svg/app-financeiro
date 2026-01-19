"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Budget {
    id: string;
    amount: string;
    categoryId: string;
}

interface Category {
    id: string;
    name: string;
    icon: string;
    type: 'INCOME' | 'EXPENSE';
}

interface ReportCategory {
    id: string | null;
    amount: number;
}

interface Report {
    byCategory: ReportCategory[];
}

export default function BudgetsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [report, setReport] = useState<Report | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [budgetAmount, setBudgetAmount] = useState("");

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        } else if (user && id) {
            loadData();
        }
    }, [user, isLoading, id, month, year]);

    const loadData = async () => {
        try {
            const [budgetsRes, reportRes, categoriesRes] = await Promise.all([
                api.get(`/contexts/${id}/budgets?month=${month}&year=${year}`),
                api.get(`/reports/monthly/${id}?month=${month}&year=${year}`),
                api.get(`/categories/context/${id}?type=EXPENSE`)
            ]);
            setBudgets(budgetsRes.data);
            setReport(reportRes.data);
            setCategories(categoriesRes.data);
        } catch (e) {
            console.error("Error loading data", e);
        }
    };

    const handleOpenModal = (category: Category) => {
        setSelectedCategory(category);
        const existing = budgets.find(b => b.categoryId === category.id);
        setBudgetAmount(existing ? existing.amount.toString() : "");
        setIsModalOpen(true);
    };

    const handleSaveBudget = async () => {
        if (!selectedCategory) return;
        try {
            await api.post(`/contexts/${id}/budgets`, {
                categoryId: selectedCategory.id,
                month,
                year,
                amount: parseFloat(budgetAmount.replace(',', '.')) || 0
            });
            setIsModalOpen(false);
            loadData();
        } catch (e) {
            console.error("Error saving budget", e);
        }
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

    const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const getProgressColor = (spent: number, limit: number) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return '#ef4444'; // Red
        if (percentage >= 80) return '#f59e0b'; // Amber
        return '#10b981'; // Emerald
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                        <h1 style={{ marginBottom: '0.25rem' }}>Metas e Orçamentos</h1>
                    </div>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>←</Button>
                        <span style={{ fontWeight: 600 }}>{month.toString().padStart(2, '0')}/{year}</span>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth}>→</Button>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {categories.map(category => {
                    const budget = budgets.find(b => b.categoryId === category.id);
                    const spentItem = report?.byCategory.find(r => r.id === category.id);
                    const spent = spentItem ? spentItem.amount : 0;
                    const limit = budget ? parseFloat(budget.amount) : 0;
                    const hasBudget = limit > 0;
                    const percentage = hasBudget ? Math.min((spent / limit) * 100, 100) : 0;

                    return (
                        <div key={category.id} className="glass hover-lift transition-all" style={{
                            padding: '1.75rem',
                            borderRadius: 'var(--radius)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                                    <span style={{ fontWeight: 600 }}>{category.name}</span>
                                </div>
                                {!hasBudget ? (
                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(category)}>Definir Meta</Button>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(category)} style={{ color: 'hsl(var(--muted-foreground))' }}>Editar</Button>
                                )}
                            </div>

                            {hasBudget ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span>Gasto: {formatMoney(spent)}</span>
                                        <span>Meta: {formatMoney(limit)}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            backgroundColor: getProgressColor(spent, limit),
                                            transition: 'width 0.5s ease-out'
                                        }}></div>
                                    </div>
                                    {spent > limit && (
                                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                            Você excedeu o orçamento em {formatMoney(spent - limit)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                                    Atual: {formatMoney(spent)} (Sem meta definida)
                                </p>
                            )}
                        </div>
                    );
                })}

                {categories.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                        Nenhuma categoria de despesa encontrada.
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Definir Meta para ${selectedCategory?.name}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor Mensal</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'hsl(var(--muted-foreground))' }}>R$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                placeholder="0,00"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    paddingLeft: '2.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid hsl(var(--border))',
                                    backgroundColor: 'hsl(var(--background))',
                                    color: 'hsl(var(--foreground))',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveBudget}>Salvar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
