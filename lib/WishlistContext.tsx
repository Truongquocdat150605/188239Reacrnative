import React, { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
    id: string;
    name?: string;        // ✔ chuyển thành optional
    price?: number;       // ✔ optional
    image?: string;       // ✔ optional
    type?: string;        // ✔ thêm field để khớp Firebase
    sizes?: string[];
    specifications?: any;
};



type WishlistContextType = {
    wishlistItems: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (id: string) => void;
    toggleWishlist: (product: Product) => void;
    isInWishlist: (id: string) => boolean;
    wishlistCount: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    const addToWishlist = (product: Product) => {
        setWishlistItems(prev => {
            if (!prev.some(item => item.id === product.id)) {
                return [...prev, product];
            }
            return prev;
        });
    };

    const removeFromWishlist = (id: string) => {
        setWishlistItems(prev => prev.filter(item => item.id !== id));
    };

    const toggleWishlist = (product: Product) => {
        setWishlistItems(prev => {
            const exists = prev.some(item => item.id === product.id);
            if (exists) {
                return prev.filter(item => item.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const isInWishlist = (id: string) => {
        return wishlistItems.some(item => item.id === id);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            wishlistCount: wishlistItems.length
        }}>
            {children}
        </WishlistContext.Provider>
    );
};