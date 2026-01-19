"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegister) {
            await register(name, email, password);
        } else {
            await login(email, password);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1.5rem',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: '10%', fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, hsl(var(--primary)), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.05em' }}>
                Antigravity Finance
            </div>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                borderRadius: 'var(--radius)',
                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isRegister ? 'Criar Conta' : 'Login'}
                </h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isRegister && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome</label>
                            <input
                                type="text"
                                placeholder="Seu Nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Senha</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    <Button type="submit" style={{ marginTop: '1rem', width: '100%' }}>
                        {isRegister ? 'Cadastrar' : 'Entrar'}
                    </Button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'hsl(var(--primary))',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isRegister ? 'Já tenho uma conta' : 'Não tenho conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
}
