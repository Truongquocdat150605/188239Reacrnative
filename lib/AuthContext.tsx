import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../app/firebaseConfig";

// ===== TYPES =====
export type User = {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  login: (userData: { uid: string; email: string; name: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
};

// ===== CONTEXT =====
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// ===== ROLE HELPER =====
const determineRole = (email: string): 'user' | 'admin' => {
  const ADMINS = [
    'dattruongquoc78@gmail.com',
    'admin@example.com'
  ];
  return ADMINS.includes(email.toLowerCase()) ? 'admin' : 'user';
};

// ===== PROVIDER =====
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ QUAN TRỌNG NHẤT: RESTORE LOGIN
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: data.name || "User",
            role: data.role || "user",
          });
        } else {
          const role = determineRole(firebaseUser.email || "");
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.email?.split("@")[0] || "User",
            role,
          };

          await setDoc(ref, newUser);
          setUser(newUser);
        }
      } catch (e) {
        console.error("❌ Auth restore error:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  // ===== LOGIN MANUAL (SAU SIGN IN) =====
  const login = async (userData: { uid: string; email: string; name: string }) => {
    const role = determineRole(userData.email);
    setUser({ ...userData, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
