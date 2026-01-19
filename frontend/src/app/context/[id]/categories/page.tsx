"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Category {
    id: string;
    name: string;
    icon: string;
    type: 'INCOME' | 'EXPENSE';
}

export default function CategoriesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE' });

    useEffect(() => {
        if (!isLoading && !user) router.push('/auth/login');
        if (user && id) loadCategories();
    }, [user, isLoading, id]);

    const loadCategories = () => {
        api.get(`/categories/context/${id}`).then(res => setCategories(res.data));
    };

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.patch(`/categories/${editId}`, formData);
            } else {
                await api.post('/categories', { ...formData, contextId: id });
            }
            setEditId(null);
            setFormData({ name: '', icon: '', type: 'EXPENSE' });
            setShowEmojiPicker(false);
            loadCategories();
        } catch (error) {
            console.error("Erro ao salvar categoria", error);
            alert("Erro ao salvar");
        }
    };

    const handleDelete = async (catId: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await api.delete(`/categories/${catId}`);
            loadCategories();
        } catch (error) {
            console.error("Erro ao excluir", error);
            alert("Erro ao excluir (pode estar em uso)");
        }
    };

    const startEdit = (cat: Category) => {
        setEditId(cat.id);
        setFormData({ name: cat.name, icon: cat.icon || '', type: cat.type });
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                <h1>Gerenciar Categorias</h1>
            </div>

            <form onSubmit={handleSubmit} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--input))' }}>
                            <option value="EXPENSE">Despesa</option>
                            <option value="INCOME">Receita</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ícone</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem', border: '1px solid hsl(var(--border))', borderRadius: '8px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {formData.icon || '?'}
                            </div>
                            <Button type="button" variant="outline" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                {showEmojiPicker ? 'Fechar' : 'Escolher Ícone'}
                            </Button>
                        </div>

                        {showEmojiPicker && (
                            <div className="animate-fade-in" style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', border: '1px solid hsl(var(--input))', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))' }}>
                                {['🛒', '🍽️', '🏠', '🚗', '⛽', '💊', '👠', '🎮', '💡', '💧', '📱', '✈️', '📚', '🏋️', '🎬', '🎁', '🐶', '👶', '🔧', '🚌', '🍔', '🍺', '🍕', '💵', '💰', '📉', '📈', '💻', '🎓', '🏥', '🏦'].map(emoji => (
                                    <button key={emoji} type="button" onClick={() => { setFormData({ ...formData, icon: emoji }); setShowEmojiPicker(false); }} style={{ fontSize: '1.5rem', background: formData.icon === emoji ? 'hsl(var(--secondary))' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px', padding: '0.25rem' }}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit">{editId ? 'Atualizar' : 'Criar Nova'}</Button>
                    {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setFormData({ name: '', icon: '', type: 'EXPENSE' }); }}>Cancelar</Button>}
                </div>
            </form>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ef4444' }}>Despesas</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                        <div key={cat.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                <p style={{ fontWeight: 600 }}>{cat.name}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => startEdit(cat)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>✏️</button>
                                <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#10b981' }}>Receitas</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {categories.filter(c => c.type === 'INCOME').map(cat => (
                        <div key={cat.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                <p style={{ fontWeight: 600 }}>{cat.name}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => startEdit(cat)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>✏️</button>
                                <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
