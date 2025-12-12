"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'user' | 'manager' | 'guest';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    hasRole: (roles: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

const loginApi = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    console.log('Login response :', res);
    const result = await res.json();
    
    if (!result.success || !result.data) throw new Error(result.message || 'Login failed');
    const user = result.data;
    return {
        id: String(user.id),
        name: user.username || user.name || '',
        email: user.email,
        role: user.role,
    };
};

const fetchUserApi = async (userToken?: string): Promise<User | null> => {
    try {
        const res = await fetch(`/api/me`, {
            headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : {},
            credentials: 'include',
        });
        if (!res.ok) return null;
        const result = await res.json();
        if (!result.success || !result.data) return null;
        const user = result.data;
        return {
            id: String(user.id),
            name: user.username || user.name || '',
            email: user.email,
            role: user.role,
        };
    } catch {
        return null;
    }
};


export const AuthProvider = ({ children, userToken }: { children: ReactNode, userToken?: string }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        fetchUserApi(userToken).then((userData) => {
            if (isMounted) {
                setUser(userData);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [userToken]);


    const login = React.useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
            await loginApi(email, password);
            const userData = await fetchUserApi();
            setUser(userData);
            router.replace('/dashboard');
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    }, [router]);

    const logout = React.useCallback(async () => {
        setLogoutLoading(true);
        try {
            await fetch(`api/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Ignore logout errors
        }
        setUser(null);
        router.replace('/');
        setLogoutLoading(false);
    }, [router]);

    const hasRole = React.useCallback((roles: Role | Role[]) => {
        if (!user) return false;
        return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export function withRoleGuard<P extends object>(
    Component: React.ComponentType<P>,
    allowedRoles: Role[]
) {
    return function RoleGuarded(props: P) {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && (!user || !allowedRoles.includes(user.role))) {
                router.replace('/unauthorized'); // use replace for navigation in app directory
            }
        }, [user, loading, router]);

        if (loading || !user || !allowedRoles.includes(user.role)) return null;
        return <Component {...props} />;
    };
}