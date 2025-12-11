import React, { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
    id: string;
    name: string;
    price: number;
    imageUri: any;
    quantity: number;
    size?: string; // 🆕 Thêm thuộc tính size
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: any, size?: string) => void; // 🆕 Cập nhật hàm nhận size
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

type CartProviderProps = {
    children: ReactNode;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (product: any, size?: string) => {
        setCartItems(prev => {
            // Tạo một ID duy nhất cho sản phẩm trong giỏ dựa trên ID gốc và Size
            // Ví dụ: '1-Size 10' khác với '1-Size 11'
            const cartItemId = size ? `${product.id}-${size}` : product.id;

            const existingItem = prev.find(item => item.id === cartItemId);
            
            if (existingItem) {
                // Nếu đã có, tăng số lượng
                return prev.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            } else {
                // Nếu chưa có, thêm mới
                return [
                    ...prev,
                    {
                        id: cartItemId, // Lưu ID mới
                        productId: product.id, // Lưu ID gốc nếu cần tham chiếu
                        name: product.name,
                        price: product.price,
                        imageUri: product.imageUri,
                        quantity: product.quantity || 1,
                        size: size // Lưu size
                    }
                ];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};