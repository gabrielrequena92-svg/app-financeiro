"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Member {
    userId: string;
    role: 'ADMIN' | 'COLLABORATOR' | 'VIEWER';
    user: {
        name: string;
        email: string;
    }
}

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [members, setMembers] = useState<Member[]>([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Invite Form
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('COLLABORATOR');
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        } else if (user && id) {
            loadMembers();
        }
    }, [user, isLoading, id]);

    const loadMembers = () => {
        api.get(`/contexts/${id}/members`)
            .then(res => setMembers(res.data))
            .catch(err => console.error("Error loading members", err));
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setError('');

        try {
            await api.post(`/contexts/${id}/members`, {
                email: inviteEmail,
                role: inviteRole
            });
            loadMembers();
            setIsInviteModalOpen(false);
            setInviteEmail('');
            setInviteRole('COLLABORATOR');
        } catch (err: any) {
            console.error("Error inviting user", err);
            setError(err.response?.data?.message || "Erro ao adicionar membro (verifique se o email existe)");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Tem certeza que deseja remover este membro?")) return;
        try {
            await api.delete(`/contexts/${id}/members/${userId}`);
            loadMembers();
        } catch (err) {
            console.error("Error removing member", err);
            alert("Erro ao remover membro.");
        }
    };

    const roleLabels = {
        'ADMIN': 'Administrador',
        'COLLABORATOR': 'Colaborador',
        'VIEWER': 'Visualizador'
    };

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                        <h1 style={{ marginBottom: '0.25rem' }}>Membros do Contexto</h1>
                    </div>
                    <Button onClick={() => setIsInviteModalOpen(true)}>Adicionar Membro</Button>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {members.map(member => (
                    <div key={member.userId} className="glass" style={{
                        padding: '1.5rem',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ fontWeight: 600 }}>{member.user.name}</p>
                            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>{member.user.email}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: 'hsl(var(--muted))',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: 500
                            }}>
                                {roleLabels[member.role] || member.role}
                            </span>
                            {/* Prevent removing self if there is only 1 admin? For now just allow removal if not self (simple check) */}
                            {member.userId !== user?.id && (
                                <Button variant="ghost" size="sm" onClick={() => handleRemove(member.userId)} style={{ color: '#ef4444' }}>
                                    Remover
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Adicionar Membro">
                <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email do Usuário</label>
                        <input
                            required
                            type="email"
                            placeholder="usuario@exemplo.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>O usuário já deve estar cadastrado na plataforma.</p>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Papel</label>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--input))', color: 'hsl(var(--foreground))' }}
                        >
                            <option value="COLLABORATOR">Colaborador (Pode editar)</option>
                            <option value="VIEWER">Visualizador (Apenas leitura)</option>
                            <option value="ADMIN">Administrador (Controle total)</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button type="button" onClick={() => setIsInviteModalOpen(false)} style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--border))' }}>Cancelar</Button>
                        <Button type="submit" disabled={isInviting}>{isInviting ? 'Adicionando...' : 'Adicionar'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
