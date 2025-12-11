import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCheck, ShoppingBag, Tag, Bell, Info } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useNotification, NotificationItem } from '../lib/NotificationContext';

export default function NotificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, markAsRead, markAllAsRead } = useNotification();
    const [activeTab, setActiveTab] = useState<'all' | 'order' | 'promo'>('all');

    // Lọc thông báo theo tab
    const filteredNotifications = activeTab === 'all' 
        ? notifications 
        : notifications.filter(n => n.type === activeTab);

    // Format ngày giờ
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        // Nếu dưới 24h
        if (diff < 86400000) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        // Nếu khác
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag size={20} color={COLORS.primary} />;
            case 'promo': return <Tag size={20} color="#F59E0B" />; // Orange for promo
            default: return <Info size={20} color="#3B82F6" />; // Blue for system
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity 
            style={[styles.itemContainer, !item.isRead && styles.itemUnread]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.iconBox}>
                {getIcon(item.type)}
            </View>
            <View style={styles.contentBox}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông báo</Text>
                </View>
                <TouchableOpacity onPress={markAllAsRead}>
                    <CheckCheck size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'promo' && styles.tabActive]}
                    onPress={() => setActiveTab('promo')}
                >
                    <Text style={[styles.tabText, activeTab === 'promo' && styles.tabTextActive]}>Khuyến mãi</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'order' && styles.tabActive]}
                    onPress={() => setActiveTab('order')}
                >
                    <Text style={[styles.tabText, activeTab === 'order' && styles.tabTextActive]}>Đơn hàng</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList 
                data={filteredNotifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Bell size={60} color="#DDD" />
                        <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    tab: {
        marginRight: 15,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    tabActive: {
        backgroundColor: '#E0F2FE', // Light blue
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    tabText: {
        fontSize: 13,
        color: COLORS.subText,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },

    // List
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemUnread: {
        backgroundColor: '#F0F9FF', // Highlight unread items
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentBox: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        color: COLORS.subText,
        lineHeight: 18,
        marginBottom: 6,
    },
    date: {
        fontSize: 11,
        color: '#999',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error, // Red dot
        marginTop: 6,
    },
    emptyBox: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 15,
        color: COLORS.subText,
    }
});