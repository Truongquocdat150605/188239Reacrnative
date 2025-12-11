import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

// Kiểu dữ liệu User
export type User = {
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
};

type AuthContextType = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (updatedData: Partial<User>) => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mặc định null (chưa đăng nhập)
    const [user, setUser] = useState<User | null>(null);

    const login = (userData: User) => {
        // Giả lập lưu session
        setUser(userData);
        console.log('[AUTH] Đã đăng nhập:', userData.email);
    };

    const logout = () => {
        setUser(null);
        console.log('[AUTH] Đã đăng xuất');
    };

    const updateUser = (updatedData: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updatedData } : null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            updateUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};