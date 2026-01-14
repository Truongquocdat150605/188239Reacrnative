import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';

import { db } from '../app/firebaseConfig';
import { useAuth } from './AuthContext';

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ========= TYPES ========= */
type Product = {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  type?: string;
  sizes?: string[];
};

type WishlistContextType = {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  loading: boolean;
  error: string | null;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};

/* ========= STORAGE ABSTRACTION ========= */
const getStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await AsyncStorage.getItem(key);
};

const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    return localStorage.setItem(key, value);
  }
  return await AsyncStorage.setItem(key, value);
};

const removeStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.removeItem(key);
  }
  return await AsyncStorage.removeItem(key);
};

/* ========= PROVIDER ========= */
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wishlistRef = user?.uid ? doc(db, "wishlists", user.uid) : null;

  /* ========= LOAD ========= */
  useEffect(() => {
    if (!user?.uid) {
      // guest mode
      (async () => {
        const stored = await getStorageItem("guest_wishlist");
        if (stored) setWishlistItems(JSON.parse(stored));
      })();
      return;
    }

    setLoading(true);

    const unsub = onSnapshot(
      wishlistRef!,
      (snap) => {
        if (snap.exists()) {
          setWishlistItems(snap.data().items || []);
        } else {
          setDoc(wishlistRef!, { items: [], userId: user.uid });
          setWishlistItems([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Không thể tải wishlist");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  /* ========= ACTIONS ========= */
  const addToWishlist = async (product: Product) => {
    if (!user?.uid) {
      const updated = [...wishlistItems, product];
      setWishlistItems(updated);
      await setStorageItem("guest_wishlist", JSON.stringify(updated));
      return;
    }

    try {
      await updateDoc(wishlistRef!, {
        items: arrayUnion({...product, addedAt: new Date()}),
        updatedAt: new Date()
      });
    } catch (err) {
      console.error(err);
      setError("Không thể thêm yêu thích");
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user?.uid) {
      const updated = wishlistItems.filter(i => i.id !== id);
      setWishlistItems(updated);
      await setStorageItem("guest_wishlist", JSON.stringify(updated));
      return;
    }

    const target = wishlistItems.find(i => i.id === id);
    if (!target) return;

    try {
      await updateDoc(wishlistRef!, {
        items: arrayRemove(target),
        updatedAt: new Date()
      });
    } catch (err) {
      console.error(err);
      setError("Không thể xóa");
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (wishlistItems.some(i => i.id === product.id)) {
      return removeFromWishlist(product.id);
    }
    return addToWishlist(product);
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some(i => i.id === id);
  };

  /* ========= MIGRATE GUEST → USER ========= */
  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      const local = await getStorageItem("guest_wishlist");
      if (!local) return;

      const items: Product[] = JSON.parse(local);

      const docSnap = await getDoc(wishlistRef!);
      const existing = docSnap.exists() ? docSnap.data().items || [] : [];

      const merged = [...existing];
      items.forEach(item => {
        if (!merged.some(x => x.id === item.id)) merged.push(item);
      });

      await setDoc(wishlistRef!, {
        items: merged,
        userId: user.uid,
        updatedAt: new Date()
      });

      await removeStorageItem("guest_wishlist");
    })();
  }, [user?.uid]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount: wishlistItems.length,
      loading,
      error
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
