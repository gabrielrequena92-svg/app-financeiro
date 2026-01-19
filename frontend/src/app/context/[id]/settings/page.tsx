"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [features, setFeatures] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get(`/contexts/${id}`)
            .then(res => {
                setFeatures(res.data.features || []);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [id]);

    const toggleFeature = async (feature: string) => {
        const newFeatures = features.includes(feature)
            ? features.filter(f => f !== feature)
            : [...features, feature];

        // Optimistic update
        setFeatures(newFeatures);

        try {
            await api.patch(`/contexts/${id}`, {
                features: newFeatures
            });
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar módulo.");
            setFeatures(features);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Carregando...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Configurações</h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Módulos e Funcionalidades</h2>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Investimentos</h3>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                                Habilita a aba de investimentos, gestão de carteira e categorias específicas.
                            </p>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                            <input
                                type="checkbox"
                                checked={features.includes('INVESTMENTS')}
                                onChange={() => toggleFeature('INVESTMENTS')}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: features.includes('INVESTMENTS') ? '#10b981' : '#ccc',
                                transition: '.4s', borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '26px', width: '26px', left: '4px', bottom: '4px',
                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                                    transform: features.includes('INVESTMENTS') ? 'translateX(26px)' : 'translateX(0)'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>
            </section>

            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Geral</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                <div className="glass hover-lift"
                    onClick={() => router.push(`/context/${id}/accounts`)}
                    style={{ padding: '2rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💳</div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Contas e Carteiras</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                        Gerencie suas contas bancárias, cartões, investimentos e patrimônio.
                    </p>
                </div>

                <div className="glass hover-lift"
                    onClick={() => router.push(`/context/${id}/categories`)}
                    style={{ padding: '2rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏷️</div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Categorias</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                        Personalize as categorias de receitas e despesas.
                    </p>
                </div>

                <div className="glass hover-lift"
                    onClick={() => router.push(`/context/${id}/members`)}
                    style={{ padding: '2rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Membros</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                        Adicione ou remova membros deste contexto.
                    </p>
                </div>
            </div>
        </div>
    );
}
