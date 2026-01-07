import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from "../app/firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
  writeBatch,
} from "firebase/firestore";

// 🧍 TẠM DÙNG USER GIẢ (sau này thay bằng UID khi login)
const userId = "test-user";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
  imageUri?: string;
  size?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be inside <CartProvider>");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🟢 Load giỏ hàng từ Firestore khi mở app
  useEffect(() => {
    const fetchCart = async () => {
      const snapshot = await getDocs(collection(db, "users", userId, "cart"));
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CartItem[];
      setCartItems(items);
    };
    fetchCart();
  }, []);

  // 🛒 Thêm vào giỏ hàng + lưu Firebase
  const addToCart = async (product: CartItem) => {
  const ref = doc(db, "users", userId, "cart", product.id + (product.size || ""));

  await setDoc(ref, {
    ...product,
    image: product.image,
    size: product.size ?? null
  }, { merge: true });

  setCartItems(prev => {
    const exists = prev.find(p => p.id === product.id && p.size === product.size);
    return exists
      ? prev.map(p => p.id === product.id && p.size === product.size
          ? { ...p, quantity: p.quantity + 1 }
          : p
        )
      : [...prev, product];
  });
};


  // ❌ Xóa item khỏi Firebase
  const removeFromCart = async (id: string) => {
    await deleteDoc(doc(db, "users", userId, "cart", id));
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // 🔄 Cập nhật số lượng
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);

    await updateDoc(doc(db, "users", userId, "cart", id), { quantity });
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  // 🧹 Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    const batch = writeBatch(db);
    cartItems.forEach(item => {
      batch.delete(doc(db, "users", userId, "cart", item.id));
    });
    await batch.commit();
    setCartItems([]);
  };

  // 🧮 Tổng số item và tiền
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
