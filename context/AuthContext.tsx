import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

interface User {
    id: string;
    fullName: string;
    email: string;
    isVerified: boolean;
    profile?: any;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const isAuth = await authAPI.isAuthenticated();
            if (isAuth) {
                const storedUser = await authAPI.getStoredUser();
                setUser(storedUser);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.warn('Auth check failed - backend may not be running:', error);
            // Don't crash the app, just continue
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login(email, password);
            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            throw error;
        }
    };

    const register = async (fullName: string, email: string, password: string) => {
        try {
            const response = await authAPI.register(fullName, email, password);
            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
        }
    };

    const updateUser = (userData: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...userData } : null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
