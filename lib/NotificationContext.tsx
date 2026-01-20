import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState
} from "react";
import { db } from "../app/firebaseConfig";
import { useAuth } from "./AuthContext";

/* ================== TYPE ================== */

export type NotificationType = "order" | "promo" | "system";

export type NotificationItem = {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: any;
    date: string;
};

type NotificationContextType = {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    addNotification: (item: {
        title: string;
        message: string;
        type: NotificationType;
    }) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
};

/* ================== CONTEXT ================== */

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotification must be used within NotificationProvider"
        );
    }
    return context;
};

/* ================== PROVIDER ================== */

export const NotificationProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    /* ===== LOAD NOTIFICATION THEO USER ===== */
    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const q = query(
                    collection(db, "notifications"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const snap = await getDocs(q);
                const data = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as NotificationItem[];

                setNotifications(data);
            } catch (error) {
                console.error("❌ Lỗi load notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.uid]);

    /* ===== UNREAD COUNT ===== */
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    /* ===== ADD NOTIFICATION (FIRESTORE) ===== */
    const addNotification = async ({
        title,
        message,
        type,
    }: {
        title: string;
        message: string;
        type: NotificationType;
    }) => {
        if (!user?.uid) return;

        await addDoc(collection(db, "notifications"), {
            userId: user.uid,
            title,
            message,
            type,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    };

    /* ===== MARK ONE AS READ ===== */
    const markAsRead = async (id: string) => {
        await updateDoc(doc(db, "notifications", id), {
            isRead: true,
        });

        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
    };

    /* ===== MARK ALL AS READ ===== */
    const markAllAsRead = async () => {
        const unread = notifications.filter((n) => !n.isRead);

        await Promise.all(
            unread.map((n) =>
                updateDoc(doc(db, "notifications", n.id), {
                    isRead: true,
                })
            )
        );

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
        );
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                addNotification,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
