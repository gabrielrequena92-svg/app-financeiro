"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Account {
    id: string;
    name: string;
    type: 'CASH' | 'CREDIT' | 'INVESTMENT' | 'ASSET';
    initialBalance: number;
    currentBalance?: number;
}

export default function InvestmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [accounts, setAccounts] = useState<Account[]>([]);

    const loadAccounts = useCallback(() => {
        api.get(`/accounts/context/${id}`)
            .then(res => setAccounts(res.data))
            .catch(err => console.error("Error loading accounts", err));
    }, [id]);

    const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);

    // Investment Form
    const [invName, setInvName] = useState('');
    const [invTicker, setInvTicker] = useState('');
    const [invQuantity, setInvQuantity] = useState('');
    const [invPrice, setInvPrice] = useState('');
    const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
    const [invCategory, setInvCategory] = useState('');
    const [invSource, setInvSource] = useState('');
    const [invDestination, setInvDestination] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);

    const loadCategories = useCallback(async () => {
        try {
            await api.post(`/categories/defaults/${id}`);
            const res = await api.get(`/categories/context/${id}?type=INVESTMENT`);
            setCategories(res.data);
        } catch (err) { console.error(err); }
    }, [id]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && id) {
            loadAccounts();
            loadCategories();
        }
    }, [user, isLoading, id, router, loadAccounts, loadCategories]);

    const handleCreateInvestment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const qtd = parseFloat(invQuantity);
            const price = parseFloat(invPrice);
            const total = qtd * price;

            const description = `Aporte: ${invTicker.toUpperCase()} - ${qtd} x ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}`;

            await api.post('/transactions', {
                contextId: id,
                description: description,
                amount: total,
                type: 'INVESTMENT',
                date: new Date(invDate).toISOString(),
                isPaid: true,
                categoryId: invCategory || null,
                sourceAccountId: invSource,
                destinationAccountId: invDestination
            });

            loadAccounts();
            setIsInvestmentModalOpen(false);
            setInvName(''); setInvTicker(''); setInvQuantity(''); setInvPrice('');
            setInvSource(''); setInvDestination('');
        } catch (error) {
            console.error(error);
            alert("Erro ao lançar investimento. Verifique se o backend suporta o tipo INVESTMENT.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (isLoading || !user) return <div>Carregando...</div>;

    const investmentAccounts = accounts.filter(a => a.type === 'INVESTMENT');
    const assetAccounts = accounts.filter(a => a.type === 'ASSET');

    // Calcular totais
    const totalInvestments = investmentAccounts.reduce((acc, cur) => acc + (cur.currentBalance ?? cur.initialBalance), 0);
    const totalAssets = assetAccounts.reduce((acc, cur) => acc + (cur.currentBalance ?? cur.initialBalance), 0);
    const totalNetWorth = totalInvestments + totalAssets;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                    <h1 style={{ fontSize: '1.5rem' }}>Investimentos</h1>
                </div>
                <Button onClick={() => setIsInvestmentModalOpen(true)}>+ Novo Aporte</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Resumo Patrimonial */}
                <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Patrimônio Total</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{formatMoney(totalNetWorth)}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'hsla(var(--background) / 0.5)', borderRadius: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Investimentos</p>
                            <p style={{ fontSize: '1rem', fontWeight: 600 }}>{formatMoney(totalInvestments)}</p>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: 'hsla(var(--background) / 0.5)', borderRadius: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Bens</p>
                            <p style={{ fontSize: '1rem', fontWeight: 600 }}>{formatMoney(totalAssets)}</p>
                        </div>
                    </div>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Investimentos */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Carteira</h2>
                        </div>
                        {investmentAccounts.length === 0 ? (
                            <div style={{ padding: '2rem', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem' }}>Nenhum investimento.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {investmentAccounts.map(acc => (
                                    <div key={acc.id} onClick={() => router.push(`/context/${id}/investments/${acc.id}`)} className="glass hover-lift" style={{ padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{acc.name}</p>
                                        </div>
                                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>{formatMoney(acc.currentBalance ?? acc.initialBalance)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Bens */}
                    <section>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Bens e Patrimônio</h2>
                        {assetAccounts.length === 0 ? (
                            <div style={{ padding: '2rem', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem' }}>Nenhum bem.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {assetAccounts.map(acc => (
                                    <div key={acc.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{acc.name}</p>
                                        </div>
                                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>{formatMoney(acc.currentBalance ?? acc.initialBalance)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Investment Modal */}
            {isInvestmentModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px', backgroundColor: 'hsl(var(--background))', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Novo Aporte</h2>
                        <form onSubmit={handleCreateInvestment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem' }}>Ticker / Código</label>
                                <input required placeholder="Ex: PETR4" value={invTicker} onChange={e => setInvTicker(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem' }}>Quantidade</label>
                                    <input required type="number" step="0.0001" inputMode="decimal" placeholder="0" value={invQuantity} onChange={e => setInvQuantity(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem' }}>Preço Unitário</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'normal', color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>R$</span>
                                        <input required type="number" step="0.01" inputMode="decimal" placeholder="0,00" value={invPrice} onChange={e => setInvPrice(e.target.value)} style={{ width: '100%', padding: '0.5rem', paddingLeft: '2rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem' }}>Data</label>
                                <input type="date" value={invDate} onChange={e => setInvDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem' }}>Categoria</label>
                                <select value={invCategory} onChange={e => setInvCategory(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
                                    <option value="">Selecione...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem' }}>Saiu de (Banco)</label>
                                <select required value={invSource} onChange={e => setInvSource(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
                                    <option value="">Selecione...</option>
                                    {accounts.filter(a => a.type === 'CASH').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem' }}>Para (Corretora/Conta)</label>
                                <select required value={invDestination} onChange={e => setInvDestination(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
                                    <option value="">Selecione...</option>
                                    {accounts.filter(a => a.type === 'INVESTMENT').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <Button type="button" onClick={() => setIsInvestmentModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--border))' }}>Cancelar</Button>
                                <Button type="submit" disabled={isSaving}>Lançar Aporte</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );

}
