"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Account {
    id: string;
    name: string;
    type: 'CASH' | 'CREDIT' | 'INVESTMENT' | 'ASSET';
    initialBalance: number;
    currentBalance?: number;
}

export default function AccountsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [type, setType] = useState('CASH');
    const [balance, setBalance] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) router.push('/auth/login');
        if (user && id) loadAccounts();
    }, [user, isLoading, id]);

    const loadAccounts = () => {
        api.get(`/accounts/context/${id}`)
            .then(res => setAccounts(res.data))
            .catch(err => console.error("Erro ao carregar contas", err));
    };

    const handleEditClick = (acc: Account) => {
        setEditingAccount(acc);
        setName(acc.name);
        setType(acc.type);
        // We usually edit initial balance or current balance? 
        // Ideally we should adjust balance via transaction, but user wants to edit.
        // Let's assume we are editing initialBalance for simplicity or provide a way to 'correct' balance.
        // For now, let's edit initialBalance.
        setBalance(acc.initialBalance.toString());
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingAccount(null);
        setName('');
        setType('CASH');
        setBalance('0');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingAccount) {
                await api.patch(`/accounts/${editingAccount.id}`, {
                    name,
                    type,
                    initialBalance: parseFloat(balance)
                });
            } else {
                await api.post('/accounts', {
                    name,
                    type,
                    initialBalance: parseFloat(balance),
                    contextId: id
                });
            }
            loadAccounts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar conta", error);
            alert("Erro ao salvar conta");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingAccount) return;
        if (!confirm("Tem certeza que deseja excluir esta conta? Todas as movimentações associadas serão perdidas.")) return;

        try {
            await api.delete(`/accounts/${editingAccount.id}`);
            loadAccounts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao excluir conta", error);
            alert("Erro ao excluir conta. Verifique se existem movimentações.");
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                <h1>Gerenciar Contas</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={handleCreateClick} style={{ padding: '1rem', border: '2px dashed hsl(var(--border))', borderRadius: 'var(--radius)', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                    + Adicionar Nova Conta
                </button>

                {accounts.map(acc => (
                    <div key={acc.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{acc.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{acc.type}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontWeight: 600 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.currentBalance ?? 0)}</div>
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(acc)}>Editar</Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAccount ? "Editar Conta" : "Nova Conta"}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome</label>
                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
                            <option value="CASH">Conta Corrente / Carteira</option>
                            <option value="CREDIT">Cartão de Crédito</option>
                            <option value="INVESTMENT">Investimento</option>
                            <option value="ASSET">Patrimônio</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Saldo Inicial</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'hsl(var(--muted-foreground))' }}>R$</span>
                            <input required type="number" step="0.01" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontWeight: 'bold' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        {editingAccount && (
                            <Button type="button" onClick={handleDelete} style={{ backgroundColor: 'hsl(var(--destructive))', color: 'white' }}>
                                Excluir
                            </Button>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                            <Button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--border))' }}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
