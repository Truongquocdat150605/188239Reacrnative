// lib/BuyNowContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";
import { CartItem } from "./CartContext"; // Import từ CartContext đã sửa

type BuyNowContextType = {
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
};

const BuyNowContext = createContext<BuyNowContextType | undefined>(undefined);

export const useBuyNow = () => {
  const ctx = useContext(BuyNowContext);
  if (!ctx) throw new Error("useBuyNow must be used inside BuyNowProvider");
  return ctx;
};

export const BuyNowProvider = ({ children }: { children: ReactNode }) => {
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  return (
    <BuyNowContext.Provider value={{ buyNowItem, setBuyNowItem }}>
      {children}
    </BuyNowContext.Provider>
  );
};