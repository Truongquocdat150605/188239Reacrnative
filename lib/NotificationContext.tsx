import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'order' | 'promo' | 'system';

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    date: string; // ISO string or formatted date
    isRead: boolean;
    image?: any; // Optional image for promo
};

type NotificationContextType = {
    notifications: NotificationItem[];
    unreadCount: number;
    addNotification: (item: Omit<NotificationItem, 'id' | 'date' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

// Dữ liệu mẫu ban đầu
const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        title: '🎉 Chào mừng bạn mới!',
        message: 'Tặng bạn mã GIAMGIA50K cho đơn hàng đầu tiên. Mua sắm ngay!',
        type: 'promo',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 ngày trước
        isRead: false,
    },
    {
        id: '2',
        title: '📦 Đơn hàng đã giao thành công',
        message: 'Đơn hàng #ORD-2024-002 đã được giao đến bạn. Hãy đánh giá sản phẩm nhé!',
        type: 'order',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
        isRead: true,
    },
    {
        id: '3',
        title: '💎 Bộ sưu tập Kim Cương mới',
        message: 'Khám phá ngay những mẫu nhẫn kim cương sang trọng vừa cập bến.',
        type: 'system',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 ngày trước
        isRead: true,
    }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (item: Omit<NotificationItem, 'id' | 'date' | 'isRead'>) => {
        const newItem: NotificationItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            isRead: false,
            ...item,
        };
        // Thêm vào đầu danh sách
        setNotifications(prev => [newItem, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            addNotification, 
            markAsRead, 
            markAllAsRead 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};