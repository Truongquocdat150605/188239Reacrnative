// app/admin/orders.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router'; // 🔥 DÙNG useRouter
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../app/firebaseConfig';
import { CheckCircle, Truck, XCircle, Clock, LucideIcon } from 'lucide-react-native';
import { useAuth } from '../../lib/AuthContext';
import { Stack } from 'expo-router';

// 🔥 Định nghĩa type cho order
interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
}

interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
}

interface Order {
    id: string;
    orderNumber?: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'shipping' | 'completed' | 'cancelled';
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: any;
    updatedAt: any;
}

// 🔥 Type cho STATUS_CONFIG
type OrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    color: string;
    icon: LucideIcon;
}> = {
    pending: { label: 'Chờ xác nhận', color: '#F59E0B', icon: Clock },
    shipping: { label: 'Đang giao', color: '#3B82F6', icon: Truck },
    completed: { label: 'Hoàn thành', color: '#10B981', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: '#EF4444', icon: XCircle },
};

export default function AdminOrdersScreen() {
    const router = useRouter(); // 🔥 TRONG COMPONENT
    const { user, loading: authLoading } = useAuth(); // 🔥 TRONG COMPONENT

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');


    // app/admin/orders.tsx - SỬA useEffect
    useEffect(() => {
        console.log('🔍 [ADMIN] useEffect - authLoading:', authLoading, 'user:', user);

        if (!authLoading && user) {
            console.log('🔍 [ADMIN] User loaded:', {
                email: user.email,
                role: user.role,
                uid: user.uid
            });

            if (user.role !== 'admin') {
                console.log('❌ [ADMIN] NOT ADMIN! Role is:', user.role);
                Alert.alert('Access Denied', 'Admin only');
                router.back();
                return;
            }

            console.log('✅ [ADMIN] Is admin, fetching orders...');
            fetchOrders();
        } else if (!authLoading && !user) {
            console.log('❌ [ADMIN] No user, redirect to login');
            router.replace('/login');
        }
    }, [authLoading, user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const ordersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            setOrders(ordersList);
            console.log(`✅ [ADMIN] Loaded ${ordersList.length} orders`);
        } catch (error) {
            console.error('❌ Lỗi lấy đơn hàng:', error);
            Alert.alert('Lỗi', 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date()
            });

            Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
            fetchOrders(); // Refresh list
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    // 🔥 HIỂN THỊ LOADING HOẶC ACCESS DENIED
    if (authLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Đang kiểm tra quyền truy cập...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>Vui lòng đăng nhập...</Text>
            </View>
        );
    }

    if (user.role !== 'admin') {
        return (
            <View style={styles.accessDenied}>
                <Text style={styles.accessDeniedIcon}>🚫</Text>
                <Text style={styles.accessDeniedTitle}>Truy cập bị từ chối</Text>
                <Text style={styles.accessDeniedText}>
                    Bạn không có quyền truy cập trang quản trị
                </Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(order => order.status === activeTab);

    const renderOrderItem = ({ item }: { item: Order }) => {
        // 🔥 Đảm bảo status hợp lệ
        const statusKey: OrderStatus = ['pending', 'shipping', 'completed', 'cancelled'].includes(item.status)
            ? item.status
            : 'pending';

        const status = STATUS_CONFIG[statusKey];
        const StatusIcon = status.icon;
        // TRONG PHẦN RENDER TRƯỚC RETURN
        console.log('🔍 [ADMIN RENDER] State:', {
            authLoading,
            hasUser: !!user,
            userRole: user?.role,
            userEmail: user?.email
        });

        // Nếu vẫn đang loading auth
        if (authLoading) {
            console.log('🔍 [ADMIN] Still loading auth...');
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text>Đang tải thông tin người dùng...</Text>
                </View>
            );
        }

        // Nếu đã load xong nhưng không có user
        if (!authLoading && !user) {
            console.log('❌ [ADMIN] No user after loading');
            return (
                <View style={styles.center}>
                    <Text>Vui lòng đăng nhập...</Text>
                    <TouchableOpacity onPress={() => router.replace('/login')}>
                        <Text style={{ color: 'blue' }}>Đi đến đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Nếu có user nhưng không phải admin
        if (user && user.role !== 'admin') {
            console.log('❌ [ADMIN] User exists but role is:', user.role);
            return (
                <View style={styles.accessDenied}>
                    <Text style={styles.accessDeniedIcon}>🚫</Text>
                    <Text style={styles.accessDeniedTitle}>Không phải Admin</Text>
                    <Text style={styles.accessDeniedText}>
                        Email: {user.email}
                        {'\n'}Role: {user.role}
                        {'\n'}Chỉ admin mới có quyền truy cập
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        console.log('✅ [ADMIN] All checks passed, showing admin panel');
        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>#{item.orderNumber || item.id.substring(0, 8)}</Text>
                        <Text style={styles.customerName}>{item.shippingAddress?.name}</Text>
                        <Text style={styles.customerPhone}>{item.shippingAddress?.phone}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                        <StatusIcon size={16} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                <Text style={styles.itemsText}>
                    {item.items?.length || 0} sản phẩm • {item.totalAmount?.toLocaleString('vi-VN')}₫
                </Text>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                                onPress={() => updateOrderStatus(item.id, 'shipping')}
                            >
                                <Truck size={16} color="white" />
                                <Text style={styles.actionText}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                                onPress={() => updateOrderStatus(item.id, 'cancelled')}
                            >
                                <XCircle size={16} color="white" />
                                <Text style={styles.actionText}>Hủy đơn</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {item.status === 'shipping' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                            onPress={() => updateOrderStatus(item.id, 'completed')}
                        >
                            <CheckCircle size={16} color="white" />
                            <Text style={styles.actionText}>Hoàn thành</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
                        onPress={() => {
                            // Xem chi tiết đơn hàng
                            console.log('Xem chi tiết:', item.id);
                        }}
                    >
                        <Text style={styles.actionText}>Chi tiết</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <>
            {/* 🔥 DÒNG QUAN TRỌNG NHẤT */}
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>📦 Quản lý đơn hàng</Text>
                    <Text style={styles.subtitle}>{orders.length} đơn hàng</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {(['all', 'pending', 'shipping', 'completed', 'cancelled'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab === 'all' ? 'Tất cả' :
                                    tab === 'pending' ? 'Chờ xác nhận' :
                                        tab === 'shipping' ? 'Đang giao' :
                                            tab === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <FlatList
                    data={filteredOrders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrderItem}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text>Không có đơn hàng nào</Text>
                        </View>
                    }
                />
            </View>
        </>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    accessDenied: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    accessDeniedIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    accessDeniedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 10,
    },
    accessDeniedText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    backButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: { padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { color: '#666', marginTop: 5 },
    tabs: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10 },
    tab: { paddingVertical: 10, paddingHorizontal: 15, marginRight: 10 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#3B82F6' },
    tabText: { color: '#666' },
    activeTabText: { color: '#3B82F6', fontWeight: 'bold' },
    orderCard: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderId: { fontWeight: 'bold', fontSize: 16 },
    customerName: { marginTop: 5, fontWeight: '500' },
    customerPhone: { color: '#666', fontSize: 12 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15
    },
    statusText: { marginLeft: 5, fontSize: 12, fontWeight: '600' },
    itemsText: { marginTop: 10, color: '#666', fontSize: 14 },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        gap: 10
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 5
    },
    actionText: { color: 'white', fontSize: 12, fontWeight: '500' },
    empty: { alignItems: 'center', padding: 40 }
});