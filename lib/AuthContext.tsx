import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../app/firebaseConfig";

// Kiểu dữ liệu User
export type User = {
    uid: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    role: 'user' | 'admin';
};

type AuthContextType = {
    user: User | null;
    login: (userData: { uid: string; email: string; name: string }) => Promise<void>;
    logout: () => void;
    updateUser: (updatedData: Partial<User>) => void;
    isAuthenticated: boolean;
    loading: boolean;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// 🔥 HÀM XÁC ĐỊNH ROLE - ĐẶT NGOÀI COMPONENT
const determineRole = (email: string): 'user' | 'admin' => {
    // Danh sách email admin - THAY EMAIL CỦA BẠN VÀO ĐÂY
    const ADMIN_EMAILS = [
        'admin@example.com',
        'dattruongquoc78@gmail.com', // 🔥 THAY BẰNG EMAIL THẬT CỦA BẠN
        'seller@gmail.com'
    ];

    if (!email) return 'user';

    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    console.log('🔍 [AUTH] Checking role for:', normalizedEmail, '->', isAdmin ? 'admin' : 'user');
    return isAdmin ? 'admin' : 'user';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = async (userData: { uid: string; email: string; name: string }) => {
        try {
            console.log('🔍 [AUTH DEBUG] Login start:', userData.email);
            setLoading(true);

            const userRole = determineRole(userData.email);
            console.log('🔍 [AUTH DEBUG] Determined role:', userRole);

            // Kiểm tra trong Firestore
            const userRef = doc(db, "users", userData.uid);
            console.log('🔍 [AUTH DEBUG] User ref path:', userRef.path);

            const userDoc = await getDoc(userRef);
            console.log('🔍 [AUTH DEBUG] User doc exists:', userDoc.exists());

            let finalRole = userRole;

            if (userDoc.exists()) {
                const firestoreData = userDoc.data();
                console.log('🔍 [AUTH DEBUG] Firestore data:', firestoreData);

                finalRole = firestoreData.role || userRole;
                console.log('🔍 [AUTH DEBUG] Final role:', finalRole);
            } else {
                console.log('🔍 [AUTH DEBUG] Creating new user in Firestore...');
                await setDoc(userRef, {
                    uid: userData.uid,
                    email: userData.email,
                    name: userData.name,
                    role: userRole,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            // Set user state
            setUser({
                uid: userData.uid,
                email: userData.email,
                name: userData.name,
                role: finalRole
            });

            console.log('✅ [AUTH] Đã đăng nhập:', userData.email, 'role:', finalRole);
        } catch (error: any) {
            console.error('❌ [AUTH ERROR] Lỗi khi login:', error);
            console.error('❌ [AUTH ERROR] Error details:', error.message, error.code);

            // Fallback: dùng role từ email
            const fallbackRole = determineRole(userData.email);
            setUser({
                uid: userData.uid,
                email: userData.email,
                name: userData.name,
                role: fallbackRole
            });
        } finally {
            setLoading(false);
            console.log('🔍 [AUTH DEBUG] Login process finished');
        }
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
            isAuthenticated: !!user,
            loading,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};