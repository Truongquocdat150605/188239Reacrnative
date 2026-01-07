import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Truck, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../lib/AuthContext';

// 🔥 Service lấy đơn hàng từ Firebase
import { getOrdersByUserId } from '../app/services/orderService';

// 🔥 Type cho Order
interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    userId: string;
    orderNumber: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'shipping' | 'completed' | 'cancelled';
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
    };
    createdAt: any; // Firestore Timestamp
    updatedAt: any;
    paymentMethod: string;
    paymentStatus: string;
}

const STATUS_CONFIG: any = {
    pending: { label: 'Chờ xác nhận', color: '#F59E0B', icon: Clock, bg: '#FFF8E1' },
    shipping: { label: 'Đang giao', color: '#3B82F6', icon: Truck, bg: '#EFF6FF' },
    completed: { label: 'Hoàn thành', color: '#10B981', icon: CheckCircle, bg: '#ECFDF5' },
    cancelled: { label: 'Đã hủy', color: '#EF4444', icon: XCircle, bg: '#FEF2F2' },
};

export default function OrderHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<string>('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 🔥 Lấy đơn hàng từ Firebase
    useEffect(() => {
        if (user?.uid) {
            console.log("🔥 DEBUG - User ID:", user.uid);
            console.log("🔥 DEBUG - User email:", user.email);
            fetchOrders();
        } else {
            console.log("🔥 DEBUG - Chưa có user");
            setLoading(false);
        }
    }, [user?.uid]);

    const fetchOrders = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            console.log("🔥 DEBUG - Đang fetch orders cho user:", user.uid);
            const userOrders = await getOrdersByUserId(user.uid);
            console.log("🔥 DEBUG - Số đơn hàng tìm thấy:", userOrders.length);
            console.log("🔥 DEBUG - Orders data:", userOrders);
            setOrders(userOrders as Order[]);
        } catch (error) {
            console.error("❌ Lỗi lấy đơn hàng:", error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => o.status === activeTab);

    const getImageSource = (source: any) => {
        if (!source || source === '') {
            return { uri: 'https://via.placeholder.com/100?text=Jewelry' };
        }
        if (typeof source === 'string') return { uri: source };
        return source;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Không rõ';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return 'Không rõ';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const StatusIcon = statusInfo.icon;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push({
                    pathname: '/orderdetail/[orderId]',
                    params: { orderId: item.id }
                })}
                activeOpacity={0.9}
            >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdBox}>
                        <Package size={16} color={COLORS.text} />
                        <Text style={styles.orderId}>{item.orderNumber || item.id.substring(0, 8)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <StatusIcon size={14} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Items Preview */}
                {item.items.slice(0, 2).map((prod, index) => (
                    <View key={index} style={styles.productRow}>
                        <Image source={getImageSource(prod.image)} style={styles.productImage} />
                        <View style={styles.productInfo}>
                            <Text numberOfLines={1} style={styles.productName}>{prod.name}</Text>
                            <Text style={styles.productQty}>x{prod.quantity}</Text>
                        </View>
                        <Text style={styles.productPrice}>
                            {(prod.price * prod.quantity).toLocaleString('vi-VN')}₫
                        </Text>
                    </View>
                ))}

                {item.items.length > 2 && (
                    <Text style={styles.moreItemsText}>
                        +{item.items.length - 2} sản phẩm khác
                    </Text>
                )}

                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.orderFooter}>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>Thành tiền:</Text>
                        <Text style={styles.totalPrice}>
                            {item.totalAmount.toLocaleString('vi-VN')}₫
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.outlineBtn}
                        onPress={() => router.push({
                            pathname: '/orderdetail/[orderId]',
                            params: { orderId: item.id }
                        })}
                    >
                        <Text style={styles.outlineBtnText}>Chi tiết</Text>
                    </TouchableOpacity>
                    {item.status === 'completed' && (
                        <TouchableOpacity style={styles.primaryBtn}>
                            <Text style={styles.primaryBtnText}>Mua lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <View style={styles.authContainer}>
                <AlertCircle size={60} color="#DDD" />
                <Text style={styles.authText}>Vui lòng đăng nhập để xem đơn hàng</Text>
                <TouchableOpacity
                    style={styles.authButton}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.authButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Search size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
                    {['all', 'shipping', 'completed', 'cancelled'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === 'all' ? 'Tất cả' :
                                    tab === 'shipping' ? 'Đang giao' :
                                        tab === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Package size={60} color="#DDD" />
                        <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                        <Text style={styles.emptyText}>Đơn hàng của bạn sẽ hiển thị ở đây</Text>
                        <TouchableOpacity
                            style={styles.shopButton}
                            onPress={() => router.push('/home')}
                        >
                            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.subText,
    },
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    authText: {
        fontSize: 16,
        color: COLORS.text,
        marginTop: 15,
        marginBottom: 20,
        textAlign: 'center',
    },
    authButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    authButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: 'white',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },

    // Tabs
    tabContainer: {
        backgroundColor: 'white',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tabItem: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    tabItemActive: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        color: COLORS.subText,
        fontWeight: '500',
    },
    tabTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },

    // List
    listContent: {
        padding: 15,
        flexGrow: 1,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderIdBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        backgroundColor: '#F5F5F5',
    },
    productInfo: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    productName: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    productQty: {
        fontSize: 13,
        color: COLORS.subText,
        marginTop: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    moreItemsText: {
        fontSize: 12,
        color: COLORS.subText,
        textAlign: 'center',
        marginTop: 5,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    totalBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    totalLabel: {
        fontSize: 13,
        color: COLORS.text,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    outlineBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    outlineBtnText: {
        fontSize: 13,
        color: COLORS.text,
    },
    primaryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    primaryBtnText: {
        fontSize: 13,
        color: 'white',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 15,
    },
    emptyText: {
        marginTop: 5,
        color: COLORS.subText,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});