
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Truck, Package, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

// Mock Data
const MOCK_ORDERS = [
    {
        id: 'ORD-2024-001',
        date: '20/12/2024',
        status: 'shipping',
        total: 18530000,
        items: [
            { name: 'Nhẫn Kim Cương Vàng 18K', quantity: 1, image: require('../assets/products/ring1.png') }
        ]
    },
    {
        id: 'ORD-2024-002',
        date: '15/12/2024',
        status: 'completed',
        total: 4500000,
        items: [
            { name: 'Dây Chuyền Ngọc Trai Nhật', quantity: 1, image: require('../assets/products/pearl-necklace.png') }
        ]
    },
    {
        id: 'ORD-2024-003',
        date: '10/11/2024',
        status: 'cancelled',
        total: 750000,
        items: [
            { name: 'Nhẫn Bạc 925 Basic', quantity: 2, image: require('../assets/products/silver-ring.png') }
        ]
    }
];

const STATUS_CONFIG: any = {
    pending: { label: 'Chờ xác nhận', color: '#F59E0B', icon: Clock, bg: '#FFF8E1' },
    shipping: { label: 'Đang giao', color: '#3B82F6', icon: Truck, bg: '#EFF6FF' },
    completed: { label: 'Hoàn thành', color: '#10B981', icon: CheckCircle, bg: '#ECFDF5' },
    cancelled: { label: 'Đã hủy', color: '#EF4444', icon: XCircle, bg: '#FEF2F2' },
};

export default function OrderHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('all');

    const filteredOrders = activeTab === 'all' 
        ? MOCK_ORDERS 
        : MOCK_ORDERS.filter(o => o.status === activeTab);

    const getImageSource = (source: any) => {
        if (!source) return { uri: 'https://via.placeholder.com/100' };
        if (typeof source === 'number') return source;
        return { uri: source };
    };

    const renderOrderItem = ({ item }: { item: any }) => {
        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const StatusIcon = statusInfo.icon;

        return (
            <View style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdBox}>
                        <Package size={16} color={COLORS.text} />
                        <Text style={styles.orderId}>{item.id}</Text>
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
                {item.items.map((prod: any, index: number) => (
                    <View key={index} style={styles.productRow}>
                        <Image source={getImageSource(prod.image)} style={styles.productImage} />
                        <View style={styles.productInfo}>
                            <Text numberOfLines={1} style={styles.productName}>{prod.name}</Text>
                            <Text style={styles.productQty}>x{prod.quantity}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.orderFooter}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>Thành tiền:</Text>
                        <Text style={styles.totalPrice}>{item.total.toLocaleString('vi-VN')}₫</Text>
                    </View>
                </View>
                
                {/* Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.outlineBtn}>
                        <Text style={styles.outlineBtnText}>Chi tiết</Text>
                    </TouchableOpacity>
                    {item.status === 'completed' && (
                        <TouchableOpacity style={styles.primaryBtn}>
                            <Text style={styles.primaryBtnText}>Mua lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <TouchableOpacity>
                    <Search size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15}}>
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
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Package size={60} color="#DDD" />
                        <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
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
    },
    productName: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    productQty: {
        fontSize: 13,
        color: COLORS.subText,
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
    },
    emptyText: {
        marginTop: 10,
        color: COLORS.subText,
        fontSize: 16,
    }
});
    