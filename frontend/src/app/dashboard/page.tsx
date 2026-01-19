"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Context {
    id: string;
    name: string;
    type: string;
}

function DashboardContent() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const showSelection = searchParams.get('select') === 'true';

    const [contexts, setContexts] = useState<Context[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContext, setEditingContext] = useState<Context | null>(null);
    const [contextName, setContextName] = useState('');
    const [contextType, setContextType] = useState('PERSONAL');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) loadContexts();
    }, [user, router, showSelection]);

    const loadContexts = async () => {
        if (!user) return;
        try {
            const response = await api.get(`/contexts/user/${user.id}`);
            setContexts(response.data);
            if (!showSelection && response.data.length > 0) {
                // router.replace(`/context/${response.data[0].id}`); // Disable auto-redirect to allow management?
                // User wants to manage contexts, so better stay here if they came explicitly.
                // But if they just logged in?
                // The original logic was: if not selecting and has contexts, redirect.
                // If "Preferencias - Trocar contexto" sends them here, showSelection should be true?
                // Or we allow management always.
                // Let's keep the redirect ONLY if not editing/managing. But we don't know intent.
                // Let's keep existing logic but maybe comment out for now to test?
                // No, let's respect showSelection.
                if (!showSelection && response.data.length > 0) {
                    router.replace(`/context/${response.data[0].id}`);
                }
            }
        } catch (err) { console.error(err); }
    };

    const openCreateModal = () => {
        setEditingContext(null);
        setContextName('');
        setContextType('PERSONAL');
        setIsModalOpen(true);
    }

    const openEditModal = (ctx: Context) => {
        setEditingContext(ctx);
        setContextName(ctx.name);
        setContextType(ctx.type);
        setIsModalOpen(true);
    }

    const handleSaveContext = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);

        try {
            if (editingContext) {
                await api.patch(`/contexts/${editingContext.id}`, {
                    name: contextName,
                    type: contextType
                });
            } else {
                await api.post(`/contexts/${user.id}`, {
                    name: contextName,
                    type: contextType
                });
            }
            // Reload using the unified function to trigger redirect if needed
            await loadContexts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar contexto", error);
            alert("Erro ao salvar contexto");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteContext = async () => {
        if (!editingContext || !user) return;
        if (!confirm("Tem certeza que deseja excluir este contexto e TODOS os dados associados?")) return;

        try {
            await api.delete(`/contexts/${editingContext.id}`);
            await loadContexts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao excluir contexto", error);
            alert("Erro ao excluir contexto. Pode haver restrições.");
        }
    };

    if (isLoading || !user) {
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    // Only render full UI if we are selecting or have no contexts
    if (!showSelection && contexts.length > 0) {
        return <div style={{ padding: '2rem' }}>Redirecionando...</div>;
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem', fontSize: '1.5rem' }}>Olá, {user?.name}</h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>Gerencie suas finanças</p>
                    </div>
                </div>
                <Button onClick={logout} style={{ backgroundColor: 'hsl(var(--destructive))', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Sair
                </Button>
            </header>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem' }}>Meus Contextos</h2>
                    <Button onClick={openCreateModal}>Novo</Button>
                </div>

                {contexts.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px dashed hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                    }}>
                        <p>Você ainda não participa de nenhum contexto.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {contexts.map(ctx => (
                            <div key={ctx.id} className="glass hover-lift transition-all" style={{
                                padding: '1.5rem',
                                borderRadius: 'var(--radius)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{ctx.name}</h3>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '0.2rem 0.6rem',
                                        backgroundColor: 'hsl(var(--secondary))',
                                        borderRadius: '999px'
                                    }}>
                                        {ctx.type === 'PERSONAL' ? 'Pessoal' : 'Compartilhado'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="outline" onClick={() => openEditModal(ctx)}>⚙️</Button>
                                    <Button size="sm" onClick={() => router.push(`/context/${ctx.id}`)}>Acessar</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingContext ? "Editar Contexto" : "Criar Novo Contexto"}>
                <form onSubmit={handleSaveContext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome do Contexto</label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Minha Casa, Viagem 2026"
                            value={contextName}
                            onChange={(e) => setContextName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--input))',
                                color: 'hsl(var(--foreground))'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                        <select
                            value={contextType}
                            onChange={(e) => setContextType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--input))',
                                color: 'hsl(var(--foreground))'
                            }}
                        >
                            <option value="PERSONAL">Pessoal</option>
                            <option value="SHARED">Compartilhado</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        {editingContext && (
                            <Button type="button" onClick={handleDeleteContext} style={{ backgroundColor: 'hsl(var(--destructive))', color: 'white' }}>
                                Excluir
                            </Button>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                            <Button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--border))' }}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Salvando...' : (editingContext ? 'Salvar' : 'Criar Contexto')}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
