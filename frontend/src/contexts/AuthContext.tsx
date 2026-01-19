"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Tentar recuperar do localStorage ao iniciar
        const storedUser = localStorage.getItem('finance_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data && response.data.access_token) {
                const { user, access_token } = response.data;
                setUser(user);
                localStorage.setItem('finance_user', JSON.stringify(user));
                localStorage.setItem('finance_token', access_token);
                router.push('/dashboard');
            } else {
                alert('Erro ao entrar. Verifique suas credenciais.');
            }
        } catch (error: any) {
            console.error('Login failed', error);
            alert(error.response?.data?.message || 'Erro ao entrar.');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            if (response.data && response.data.access_token) {
                const { user, access_token } = response.data;
                setUser(user);
                localStorage.setItem('finance_user', JSON.stringify(user));
                localStorage.setItem('finance_token', access_token);
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Registration failed', error);
            alert(error.response?.data?.message || 'Erro ao cadastrar.');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('finance_user');
        localStorage.removeItem('finance_token');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
