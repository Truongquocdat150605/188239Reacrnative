import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { db } from "../app/firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

/* ================== TYPE ================== */
export type CartItem = {
  id: string;        // id dùng cho Firestore (có thể kèm size)
  productId: string; // id gốc sản phẩm
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string | null; // ❗ size có thể null, không undefined
};

/* ================== CONTEXT TYPE ================== */
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "id" | "quantity">) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
};

/* ================== CONTEXT ================== */
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

/* ================== PROVIDER ================== */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.uid;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* ===== LOAD CART WHEN USER CHANGES ===== */
  useEffect(() => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    const ref = collection(db, "users", userId, "cart");
    const unsub = onSnapshot(ref, snap => {
      const items = snap.docs.map(d => {
        const data = d.data() as CartItem;
        return {
          ...data,
          id: d.id, // luôn overwrite cuối cùng → chuẩn nhất
        };
      });

      setCartItems(items);
    });

    return unsub;
  }, [userId]);

  /* ===== ADD TO CART ===== */
 const addToCart = async (product: Omit<CartItem, "id" | "quantity">) => {
  if (!userId) return;

  const sizePart = product.size ? `_${product.size}` : "";
  const cartId = `${product.productId}${sizePart}`;

  const ref = doc(db, "users", userId, "cart", cartId);
  const existing = cartItems.find((i) => i.id === cartId);

  if (existing) {
    await updateDoc(ref, { quantity: existing.quantity + 1 });
    return; // KHÔNG setCartItems ở đây
  }

  await setDoc(ref, {
    productId: product.productId,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.image ?? null,
    size: product.size ?? null,
  });

  // ❗ Không cần local setCartItems nữa vì onSnapshot sẽ cập nhật
};

  /* ===== REMOVE ===== */
  const removeFromCart = async (id: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "users", userId, "cart", id));
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* ===== UPDATE QTY ===== */
  const updateQuantity = async (id: string, quantity: number) => {
    if (!userId) return;
    if (quantity < 1) return removeFromCart(id);

    await updateDoc(doc(db, "users", userId, "cart", id), { quantity });

    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  /* ===== CLEAR CART ===== */
  const clearCart = async () => {
    if (!userId) return;

    const batch = writeBatch(db);
    cartItems.forEach((item) => {
      batch.delete(doc(db, "users", userId, "cart", item.id));
    });

    await batch.commit();
    setCartItems([]);
  };

  /* ===== TOTAL ===== */
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
