"use client";

import { use, useEffect, useState, useCallback } from "react";
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

interface Context {
    id: string;
    name: string;
    type: string;
    features: string[];
}

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

interface Category {
    id: string;
    name: string;
    icon: string;
    type: 'INCOME' | 'EXPENSE';
}

export default function ContextPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [context, setContext] = useState<Context | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // New state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    // Account Form States
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState('CASH');
    const [newAccountBalance, setNewAccountBalance] = useState('0');
    const [isCreating, setIsCreating] = useState(false);

    // Transaction Form States
    const [txDescription, setTxDescription] = useState('');
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState('EXPENSE');
    const [txCategory, setTxCategory] = useState('');
    const [txSource, setTxSource] = useState('');
    const [txDestination, setTxDestination] = useState('');
    const [txIsPaid, setTxIsPaid] = useState(true);
    const [txDueDate, setTxDueDate] = useState('');

    const [isCreatingTx, setIsCreatingTx] = useState(false);

    // Advanced Transaction Modes
    const [txMode, setTxMode] = useState<'NORMAL' | 'INSTALLMENT' | 'RECURRING'>('NORMAL');
    const [installments, setInstallments] = useState(2);
    const [recurrenceType, setRecurrenceType] = useState<'FIXED' | 'VARIABLE'>('FIXED');
    const [recurrenceDay, setRecurrenceDay] = useState(10);
    const [notificationDays, setNotificationDays] = useState(3);

    // Mobile UX State

    // Mobile UX State
    const [showValues, setShowValues] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Payment Filter State
    const [paymentFilterDate, setPaymentFilterDate] = useState(new Date());

    const handleNextPaymentMonth = () => {
        setPaymentFilterDate(new Date(paymentFilterDate.getFullYear(), paymentFilterDate.getMonth() + 1, 1));
    };

    const handlePrevPaymentMonth = () => {
        setPaymentFilterDate(new Date(paymentFilterDate.getFullYear(), paymentFilterDate.getMonth() - 1, 1));
    };

    const loadAccounts = useCallback(() => {
        api.get(`/accounts/context/${id}`)
            .then(res => setAccounts(res.data))
            .catch(err => console.error("Erro ao carregar contas", err));
    }, [id]);

    const loadTransactions = useCallback(() => {
        api.get(`/transactions/context/${id}`)
            .then(res => setTransactions(res.data))
            .catch(err => console.error("Erro ao carregar transações", err));
    }, [id]);

    const loadCategories = useCallback(() => {
        api.get(`/categories/context/${id}`)
            .then(async res => {
                if (res.data.length === 0) {
                    await api.post(`/categories/defaults/${id}`);
                    const newCats = await api.get(`/categories/context/${id}`);
                    setCategories(newCats.data);
                } else {
                    setCategories(res.data);
                }
            })
            .catch(err => console.error("Erro ao carregar categorias", err));
    }, [id]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && id) {
            api.get(`/contexts/${id}`)
                .then(res => setContext(res.data))
                .catch(err => {
                    console.error("Erro ao carregar contexto", err);
                    router.push('/dashboard');
                });

            loadAccounts();
            loadTransactions();
            loadCategories();
        }
    }, [user, isLoading, id, router, loadAccounts, loadTransactions, loadCategories]);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            await api.post('/accounts', {
                name: newAccountName,
                type: newAccountType,
                initialBalance: parseFloat(newAccountBalance),
                contextId: id
            });
            loadAccounts();
            handleCloseModal();
        } catch (error) {
            console.error("Erro ao criar conta", error);
            alert("Erro ao criar conta");
        } finally {
            setIsCreating(false);
        }
    };

    // Confirm Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [pendingTxData, setPendingTxData] = useState<any>(null);

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();

        if (txType === 'EXPENSE' && !txSource) {
            alert("Selecione uma conta de saída."); return;
        }
        if (txType === 'INCOME' && !txDestination) {
            alert("Selecione uma conta de destino."); return;
        }
        if (txType === 'TRANSFER' && (!txSource || !txDestination)) {
            alert("Selecione as contas de origem e destino."); return;
        }

        const baseData = {
            contextId: id,
            description: txDescription,
            amount: parseFloat(txAmount),
            type: txType,
            categoryId: txCategory || null,
            sourceAccountId: txSource || null,
            destinationAccountId: txDestination || null,
            dueDate: txDueDate ? new Date(txDueDate).toISOString() : new Date().toISOString()
        };

        if (txMode === 'RECURRING') {
            // Directly create recurring
            setIsCreatingTx(true);
            try {
                // RecurringExpense only supports Expenses for now (sourceAccount)
                // Filter out fields that don't exist on RecurringExpense model
                const payload = {
                    contextId: id,
                    description: txDescription,
                    categoryId: txCategory || null,
                    sourceAccountId: txSource || null,
                    // destinationAccountId is not supported in RecurringExpense
                    // dueDate is not supported (uses dayOfMonth)
                    amount: recurrenceType === 'FIXED' ? (parseFloat(txAmount) || 0) : null,
                    type: recurrenceType,
                    dayOfMonth: recurrenceDay,
                    notificationDaysBefore: recurrenceType === 'VARIABLE' ? notificationDays : null,
                    active: true
                };

                await api.post('/recurring-expenses', payload);
                alert("Despesa recorrente criada!");
                handleCloseTxModal();
                loadTransactions();
            } catch (err) {
                console.error(err);
                alert("Erro ao criar despesa recorrente. Verifique se os dados estão corretos.");
            } finally { setIsCreatingTx(false); }
            return;
        }

        if (txMode === 'INSTALLMENT') {
            // Installments are usually future, so we treat as pending by default? 
            // Or we could ask if the first one is paid. 
            // Simplification: Ask same confirmation for the *first* installment?
            // User request: "perguntar se ja foi lançado [Sim/Não]".
            // Let's ask.
            setPendingTxData({ ...baseData, installments });
            setConfirmMessage(txType === 'INCOME' ? "A primeira parcela já foi recebida?" : "A primeira parcela já foi paga?");
            setIsConfirmOpen(true);
            return;
        }

        // Normal Transaction
        setPendingTxData(baseData);
        setConfirmMessage(txType === 'INCOME' ? "O valor já foi recebido?" : "O pagamento já foi realizado?");
        setIsConfirmOpen(true);
    };

    const finalizeTransaction = async (isPaid: boolean) => {
        if (!pendingTxData) return;
        setIsCreatingTx(true);
        setIsConfirmOpen(false); // Close modal first

        try {
            const date = isPaid ? new Date().toISOString() : pendingTxData.dueDate; // If paid, date is now. If pending, date is due date? Actually date represents "competence" or "occurrence".
            // Let's keep date as "now" if paid, or "due date" if future?
            // Usually: Date = when it happened. DueDate = when it should be paid.
            const transactionPayload = {
                ...pendingTxData,
                date: isPaid ? new Date().toISOString() : pendingTxData.dueDate, // If paid, created at now. If not, maybe it's a schedule for the future.
                isPaid: isPaid,
                installments: pendingTxData.installments
            };

            const res = await api.post('/transactions', transactionPayload);

            if (isPaid && !pendingTxData.installments) { // For installments, the backend handles first payment if logic aligns, OR we might need to pay the first one separately. 
                // My backend `create` for installments sets `isPaid` for the first one if passed.
                // So we don't need to double pay.
                if (res.data.id && txType !== 'TRANSFER') { // Transfers usually auto-handled?
                    await api.patch(`/transactions/${res.data.id}/pay`, { date: new Date().toISOString() });
                }
            }
            // Actually, if I pass `isPaid: true` to create, backend should handle it? 
            // Checking backend service... `isPaid: i === 0 ? data.isPaid : false`. Yes.
            // But for Normal transaction: `return this.prisma.transaction.create({ data })`.
            // So if I pass `isPaid: true`, it saves as true.
            // EXCEPT: `paymentDate` is not set automatically if I just pass `isPaid`.
            // User request is to "Ask Sim/Nao".
            // If Sim -> isPaid=true AND paymentDate=now. 
            // My backend doesn't automatically set paymentDate on create if isPaid is true? 
            // Let's ensure payload has paymentDate if isPaid.

            if (isPaid) {
                // Add paymentDate to payload if the backend supports it on create (it should, checking schema... yes transaction has paymentDate)
                // But backend `create` type might not include it in `data`. 
                // Looking at backend `create`: `data: Prisma.TransactionUncheckedCreateInput`. Yes it allows.
                await api.patch(`/transactions/${res.data.id || res.data[0]?.id}/pay`, { date: new Date().toISOString() });
                // Wait, if I create as paid, I should just set paymentDate in create.
                // Better to use the `pay` endpoint to be sure, OR just rely on logic.
                // Simplify: Just call pay endpoint after create if needed.
            }

            loadTransactions();
            loadAccounts();
            handleCloseTxModal();
        } catch (error) {
            console.error("Erro", error);
            alert("Erro ao salvar");
        } finally {
            setIsCreatingTx(false);
            setPendingTxData(null);
        }
    };

    const handlePayTransaction = async (txId: string) => {
        if (!confirm("Confirmar pagamento/recebimento?")) return;

        try {
            await api.patch(`/transactions/${txId}/pay`, {
                date: new Date().toISOString()
            });
            loadTransactions();
            loadAccounts();
        } catch (error) {
            console.error("Erro ao baixar transação", error);
            alert("Erro ao baixar transação");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewAccountName('');
        setNewAccountType('CASH');
        setNewAccountBalance('0');
    };

    const handleCloseTxModal = () => {
        setIsTxModalOpen(false);
        setTxDescription('');
        setTxAmount('');
        setTxCategory('');
        setTxType('EXPENSE');
        setTxSource('');
        setTxDestination('');
        setTxIsPaid(true);
        setTxDueDate('');
        setTxMode('NORMAL');
        setInstallments(2);
    };

    const completedTransactions = transactions.filter(t => t.isPaid);

    const pendingTransactions = transactions.filter(t => {
        if (t.isPaid) return false;
        if (t.type !== 'EXPENSE') return false; // Usually only expenses are 'bills to pay'
        if (!t.dueDate) return true; // Show no-date as always pending or maybe today? optimizing to show.
        const d = new Date(t.dueDate);
        return d.getMonth() === paymentFilterDate.getMonth() && d.getFullYear() === paymentFilterDate.getFullYear();
    });

    if (isLoading || !user || !context) {
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    // Filter categories for the current transaction type
    const availableCategories = categories.filter(c => c.type === txType);

    const accountTypeLabel = {
        'CASH': 'Caixa / Conta Corrente',
        'CREDIT': 'Cartão de Crédito',
        'INVESTMENT': 'Investimento',
        'ASSET': 'Patrimônio'
    };

    const totalBalance = accounts.reduce((acc, curr) => {
        return acc + (Number(curr.currentBalance) || Number(curr.initialBalance) || 0);
    }, 0);

    const refreshData = async () => {
        // Simple manual refresh
        await Promise.all([
            api.get(`/contexts/${id}`).then(res => setContext(res.data)),
            loadAccounts(),
            loadTransactions(),
            loadCategories()
        ]);
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            {/* Mobile Header (Nubank Style) */}
            <div className="visible-on-mobile">
                <div className="nubank-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => setIsProfileOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'white' }}>
                                👤
                            </button>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Olá, {user?.name ? user.name.split(' ')[0] : 'Usuário'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={refreshData} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>🔄</button>
                            <button onClick={() => setShowValues(!showValues)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>
                                {showValues ? '👁️' : '🙈'}
                            </button>
                            <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>❔</button>
                        </div>
                    </div>
                </div>

                <div className="nubank-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Conta</span>
                        {/* Removed useless marker */}
                        <span style={{ fontSize: '1.2rem', visibility: 'hidden' }}>›</span>
                    </div>
                    <div style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Saldo total</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                        {showValues
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)
                            : '•••••••'}
                    </div>
                </div>

                <div className="nubank-action-scroll">
                    <button className="nubank-action-btn" onClick={() => { setTxType('EXPENSE'); setIsTxModalOpen(true); }}>
                        <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>💸</div>
                        <span className="nubank-action-label">Despesa</span>
                    </button>
                    <button className="nubank-action-btn" onClick={() => { setTxType('INCOME'); setIsTxModalOpen(true); }}>
                        <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>💰</div>
                        <span className="nubank-action-label">Receita</span>
                    </button>
                    <button className="nubank-action-btn" onClick={() => { setTxType('TRANSFER'); setIsTxModalOpen(true); }}>
                        <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>⇄</div>
                        <span className="nubank-action-label">Transferir</span>
                    </button>
                    <button className="nubank-action-btn" onClick={() => router.push(`/context/${id}/transactions`)}>
                        <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>📄</div>
                        <span className="nubank-action-label">Extrato</span>
                    </button>
                    <button className="nubank-action-btn" onClick={() => router.push(`/context/${id}/reports`)}>
                        <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>📊</div>
                        <span className="nubank-action-label">Relatórios</span>
                    </button>
                    <button className="nubank-action-btn" onClick={() => router.push(`/context/${id}/budgets`)}>
                        <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>🎯</div>
                        <span className="nubank-action-label">Metas</span>
                    </button>
                    {(context.features?.includes('INVESTMENTS') || true) && (
                        <button className="nubank-action-btn" onClick={() => router.push(`/context/${id}/investments`)}>
                            <div className="nubank-action-icon" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--primary))' }}>📈</div>
                            <span className="nubank-action-label">Investir</span>
                        </button>
                    )}
                </div>

                <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '1rem 0' }}></div>

                {/* Mobile Accounts List */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>Minhas Contas</h3>
                    {accounts.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Nenhuma conta encontrada.</p>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {accounts.map(acc => (
                                <div key={acc.id} onClick={() => router.push(`/context/${id}/accounts`)} style={{ minWidth: '140px', padding: '1rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f0f0f0' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>{acc.name}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                        {showValues
                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.currentBalance ?? acc.initialBalance)
                                            : '••••••'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', marginTop: '0.5rem' }}>Toque para editar</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '1rem 0' }}></div>

                {/* Upcoming / Pending Commitments (Bills to Pay) */}
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Pagamentos</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0f0f0', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>
                            <button onClick={handlePrevPaymentMonth} style={{ background: 'none', border: 'none', padding: '0.2rem', cursor: 'pointer' }}>‹</button>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                {paymentFilterDate.toLocaleDateString('pt-BR', { month: 'short' })}
                            </span>
                            <button onClick={handleNextPaymentMonth} style={{ background: 'none', border: 'none', padding: '0.2rem', cursor: 'pointer' }}>›</button>
                        </div>
                    </div>

                    {pendingTransactions.length === 0 ? (
                        <div style={{ padding: '1rem', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>Nenhum pagamento pendente para este mês.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pendingTransactions.map(tx => (
                                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '1rem', borderLeft: '4px solid #ef4444' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{tx.description}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            Vence {tx.dueDate ? new Date(tx.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, color: '#ef4444' }}>
                                            {showValues
                                                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(tx.amount))
                                                : '••••••'}
                                        </div>
                                        <button onClick={() => handlePayTransaction(tx.id)} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', border: 'none', marginTop: '0.25rem', cursor: 'pointer' }}>
                                            Pagar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <header className="hidden-on-mobile" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>{context.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Visão Geral do Contexto</p>
                        <div style={{ padding: '0.25rem 0.75rem', backgroundColor: 'hsl(var(--muted))', borderRadius: 'var(--radius)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>
                                {showValues
                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)
                                    : '•••••••'}
                            </span>
                            <button onClick={() => setShowValues(!showValues)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                                {showValues ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button onClick={refreshData} variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🔄 Atualizar
                    </Button>
                    <Button variant="outline" onClick={() => setIsTxModalOpen(true)}>+ Movimentação</Button>
                    <Button onClick={() => setIsModalOpen(true)}>Nova Conta</Button>
                </div>
            </header>

            {/* Desktop View Sections */}
            <div className="hidden-on-mobile">

                {/* Desktop Quick Actions */}
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Acesso Rápido</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Button variant="outline" onClick={() => { setTxType('EXPENSE'); setIsTxModalOpen(true); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            💸 Despesa
                        </Button>
                        <Button variant="outline" onClick={() => { setTxType('INCOME'); setIsTxModalOpen(true); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            💰 Receita
                        </Button>
                        <Button variant="outline" onClick={() => { setTxType('TRANSFER'); setIsTxModalOpen(true); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            ⇄ Transferir
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/context/${id}/transactions`)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            📄 Extrato
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/context/${id}/reports`)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            📊 Relatórios
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/context/${id}/budgets`)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            🎯 Metas
                        </Button>
                        {(context.features?.includes('INVESTMENTS') || true) && (
                            <Button variant="outline" onClick={() => router.push(`/context/${id}/investments`)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                📈 Investir
                            </Button>
                        )}
                    </div>
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                    {/* Contas Grid - 4 Columns */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Contas</h2>
                            <Button variant="ghost" onClick={() => router.push(`/context/${id}/accounts`)} style={{ fontSize: '0.9rem' }}>Gerenciar Contas ›</Button>
                        </div>
                        {accounts.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)' }}>
                                <p>Nenhuma conta cadastrada.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                {accounts.map(account => (
                                    <div key={account.id} onClick={() => router.push(`/context/${id}/accounts`)} className="glass hover-lift transition-all" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid transparent' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem', fontWeight: 600 }}>{account.name}</h3>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: account.type === 'CASH' ? '#10b981' : account.type === 'CREDIT' ? '#ef4444' : '#3b82f6' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{accountTypeLabel[account.type]}</span>
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.2rem' }}>Saldo Atual</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                                {showValues
                                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.currentBalance ?? account.initialBalance)
                                                    : '•••••••'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Upcoming Payments (Moved Below Accounts) */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📅 Próximos Pagamentos
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'hsl(var(--muted))', padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>
                                <button onClick={handlePrevPaymentMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>‹</button>
                                <span style={{ fontWeight: 600, textTransform: 'capitalize', minWidth: '80px', textAlign: 'center' }}>
                                    {paymentFilterDate.toLocaleDateString('pt-BR', { month: 'long' })}
                                </span>
                                <button onClick={handleNextPaymentMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>›</button>
                            </div>
                        </div>

                        {pendingTransactions.length === 0 ? (
                            <div style={{ padding: '2rem', color: 'hsl(var(--muted-foreground))', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                Nenhum pagamento pendente para este mês.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {pendingTransactions.map(tx => (
                                    <div key={tx.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{tx.description}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                Vence {tx.dueDate ? new Date(tx.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>
                                                {showValues
                                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(tx.amount))
                                                    : '•••••••'}
                                            </div>
                                            <button onClick={() => handlePayTransaction(tx.id)} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                                Pagar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Desktop Statement */}
                    <section>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>📊</span> Extrato Recente
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {completedTransactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="glass hover-lift transition-all" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', backgroundColor: tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : tx.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: tx.type === 'INCOME' ? '#10b981' : tx.type === 'EXPENSE' ? '#ef4444' : '#3b82f6' }}>{tx.type === 'INCOME' ? '↓' : tx.type === 'EXPENSE' ? '↑' : '⇄'}</div>
                                        <div>
                                            <p style={{ fontWeight: 500 }}>
                                                {tx.category?.icon ? `${tx.category.icon} ` : ''}
                                                {tx.description}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                {tx.category ? <span style={{ marginRight: '0.5rem', backgroundColor: 'hsl(var(--muted))', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{tx.category.name}</span> : null}
                                                {new Date(tx.date).toLocaleDateString('pt-BR')} •
                                                {tx.type === 'EXPENSE' ? ` ${tx.sourceAccount?.name}` : tx.type === 'INCOME' ? ` ${tx.destinationAccount?.name}` : ` ${tx.sourceAccount?.name} → ${tx.destinationAccount?.name}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: tx.type === 'INCOME' ? '#10b981' : tx.type === 'EXPENSE' ? '#ef4444' : 'hsl(var(--foreground))' }}>
                                        {showValues ? (
                                            <>
                                                {tx.type === 'EXPENSE' ? '-' : '+'}
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(tx.amount))}
                                            </>
                                        ) : '•••••••'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>


            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Nova Conta">
                <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome da Conta</label>
                        <input required type="text" placeholder="Ex: Nubank, Carteira" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                        <select value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }}>
                            <option value="CASH">Caixa / Conta Corrente</option>
                            <option value="CREDIT">Cartão de Crédito</option>
                            <option value="INVESTMENT">Investimento</option>
                            <option value="ASSET">Patrimônio</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Saldo Inicial</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'hsl(var(--muted-foreground))' }}>R$</span>
                            <input required type="number" step="0.01" inputMode="decimal" value={newAccountBalance} onChange={(e) => setNewAccountBalance(e.target.value)} style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))', fontWeight: 'bold' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button type="button" onClick={handleCloseModal} style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--border))' }}>Cancelar</Button>
                        <Button type="submit" disabled={isCreating}>{isCreating ? 'Criando...' : 'Criar Conta'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Confirmation Modal for Payment Status */}
            <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirmação">
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ fontSize: '1.2rem' }}>{confirmMessage}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button onClick={() => finalizeTransaction(false)} variant="outline" style={{ flex: 1, borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive))' }}>
                            Não (Pendente)
                        </Button>
                        <Button onClick={() => finalizeTransaction(true)} style={{ flex: 1, backgroundColor: 'hsl(var(--success))' }}>
                            Sim (Pago)
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isTxModalOpen} onClose={handleCloseTxModal} title={txType === 'EXPENSE' ? 'Nova Despesa' : txType === 'INCOME' ? 'Nova Receita' : 'Nova Transferência'}>
                <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '0.5rem', overflowX: 'hidden' }}>

                    {/* Mode Selector - Only for Expenses */}
                    {txType === 'EXPENSE' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button type="button" onClick={() => setTxMode('NORMAL')} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', backgroundColor: txMode === 'NORMAL' ? 'hsl(var(--foreground))' : 'transparent', color: txMode === 'NORMAL' ? 'hsl(var(--background))' : 'hsl(var(--foreground))', fontSize: '0.9rem', fontWeight: 500 }}>Única</button>
                            <button type="button" onClick={() => { setTxMode('INSTALLMENT'); setTxIsPaid(false); }} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', backgroundColor: txMode === 'INSTALLMENT' ? 'hsl(var(--foreground))' : 'transparent', color: txMode === 'INSTALLMENT' ? 'hsl(var(--background))' : 'hsl(var(--foreground))', fontSize: '0.9rem', fontWeight: 500 }}>Parcelada</button>
                            <button type="button" onClick={() => setTxMode('RECURRING')} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', backgroundColor: txMode === 'RECURRING' ? 'hsl(var(--foreground))' : 'transparent', color: txMode === 'RECURRING' ? 'hsl(var(--background))' : 'hsl(var(--foreground))', fontSize: '0.9rem', fontWeight: 500 }}>Recorrente</button>
                        </div>
                    )}

                    {txMode === 'INSTALLMENT' && (
                        <div className="animate-fade-in" style={{ padding: '1rem', backgroundColor: 'hsla(var(--primary) / 0.1)', borderRadius: 'var(--radius)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Número de Parcelas</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="number" min="2" max="60" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} style={{ width: '80px', padding: '0.5rem', borderRadius: 'var(--radius)', fontSize: '1rem' }} />
                                <span>x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((parseFloat(txAmount) || 0) / installments)}</span>
                            </div>
                        </div>
                    )}

                    {txMode === 'RECURRING' && (
                        <div className="animate-fade-in" style={{ padding: '1rem', backgroundColor: 'hsla(var(--primary) / 0.1)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                        <input type="radio" checked={recurrenceType === 'FIXED'} onChange={() => setRecurrenceType('FIXED')} />
                                        Fixo
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                        <input type="radio" checked={recurrenceType === 'VARIABLE'} onChange={() => setRecurrenceType('VARIABLE')} />
                                        Variável
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dia do Vencimento</label>
                                <input type="number" min="1" max="31" value={recurrenceDay} onChange={(e) => setRecurrenceDay(parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '1rem' }} />
                            </div>

                            {recurrenceType === 'VARIABLE' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Avisar com antecedência (dias)</label>
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Para você informar o valor da fatura</p>
                                    <input type="number" min="1" max="15" value={notificationDays} onChange={(e) => setNotificationDays(parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '1rem' }} />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Valor</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', fontWeight: 'bold', color: 'hsl(var(--muted-foreground))' }}>R$</span>
                            <input autoFocus required type="number" step="0.01" inputMode="decimal" placeholder="0,00" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} style={{ width: '100%', padding: '0.75rem', paddingLeft: '3rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))', fontSize: '1.5rem', fontWeight: 'bold' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição</label>
                        <input required type="text" placeholder="O que foi?" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }} />
                    </div>

                    {/* For standard transactions only */}
                    {txMode === 'NORMAL' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vencimento / Data</label>
                            <input required type="date" value={txDueDate || new Date().toISOString().split('T')[0]} onChange={(e) => setTxDueDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }} />
                        </div>
                    )}

                    {txType !== 'TRANSFER' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categoria</label>
                            <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }}>
                                <option value="">Sem categoria</option>
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(txType === 'EXPENSE' || txType === 'TRANSFER') && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Saiu de</label>
                            <select required value={txSource} onChange={(e) => setTxSource(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }}>
                                <option value="">Selecione uma conta...</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(txType === 'INCOME' || txType === 'TRANSFER') && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Entrou em</label>
                            <select required value={txDestination} onChange={(e) => setTxDestination(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }}>
                                <option value="">Selecione uma conta...</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', paddingBottom: '1rem' }}>
                        <Button type="button" onClick={handleCloseTxModal} style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--border))' }}>Cancelar</Button>
                        <Button type="submit" disabled={isCreatingTx}>{isCreatingTx ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Preferências">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={() => router.push(`/context/${id}/members`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: '1.5rem' }}>👥</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>Membros</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Gerenciar acesso</div>
                        </div>
                        <span>›</span>
                    </button>

                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: '1.5rem' }}>💳</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>Contas</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Gerenciar saldos e contas</div>
                        </div>
                        <span>›</span>
                    </button>

                    <button onClick={() => router.push(`/dashboard?select=true`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: '1.5rem' }}>🔄</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>Trocar Contexto</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Alternar entre pessoal/compartilhado</div>
                        </div>
                        <span>›</span>
                    </button>

                    <button onClick={() => router.push(`/context/${id}/categories`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: '1.5rem' }}>🏷️</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>Categorias</div>
                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Editar categorias</div>
                        </div>
                        <span>›</span>
                    </button>

                    {context.features?.includes('INVESTMENTS') && (
                        <button onClick={() => router.push(`/context/${id}/investments`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                            <span style={{ fontSize: '1.5rem' }}>📈</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>Investimentos</div>
                                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Carteira e Patrimônio</div>
                            </div>
                            <span>›</span>
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
}
