
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronRight,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    Bell,
    Lock,
    Headphones,
    Edit2
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useWishlist } from '../lib/WishlistContext';
import { useAuth } from '../lib/AuthContext'; // 🆕 Import Auth Context
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../app/firebaseConfig";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { wishlistCount } = useWishlist();
    const { user, logout } = useAuth(); // 🆕 Lấy thông tin user và hàm logout
    const [orderCount, setOrderCount] = useState(0);
    useEffect(() => {
        if (!user?.uid) {
            setOrderCount(0);
            return;
        }

        const fetchOrderCount = async () => {
            try {
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                setOrderCount(snapshot.size); // 🔥 ĐÚNG
            } catch (error) {
                console.error("❌ Lỗi lấy số đơn hàng:", error);
                setOrderCount(0);
            }
        };

        fetchOrderCount();
    }, [user?.uid]);

    const handleLogout = () => {
        const performLogout = () => {
            logout(); // 🆕 Gọi hàm logout từ context

            // Xóa lịch sử điều hướng và về trang login
            if (router.canDismiss()) {
                router.dismissAll();
            }
            router.replace('/login');
        };

        if (Platform.OS === 'web') {
            // Xử lý riêng cho Web
            if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
                performLogout();
            }
        } else {
            // Xử lý cho Mobile
            Alert.alert(
                "Đăng xuất",
                "Bạn có chắc muốn đăng xuất?",
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Đăng xuất",
                        style: "destructive",
                        onPress: performLogout
                    }
                ]
            );
        }
    };

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, isDestructive = false }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconBox, isDestructive && styles.menuIconBoxDestructive]}>
                <Icon size={20} color={isDestructive ? '#FF3B30' : COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, isDestructive && styles.textDestructive]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={20} color="#CCC" />
        </TouchableOpacity>
    );

    // Dữ liệu hiển thị (Fallback nếu user chưa đăng nhập - ví dụ đang dev)
    const displayName = user?.name || 'Khách';
    const displayEmail = user?.email || 'Vui lòng đăng nhập';
    const displayAvatar = user?.avatar || 'https://i.pravatar.cc/150?img=default';

    return (
        <View style={styles.container}>
            {/* Header Background */}
            <View style={[styles.headerBg, { height: 160 + insets.top }]} />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* User Info Card */}
                <View style={styles.userCard}>
                    <Image
                        source={{ uri: displayAvatar }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{displayName}</Text>
                        <Text style={styles.userEmail}>{displayEmail}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Thành viên</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push('/edit-profile')}
                    >
                        <Edit2 size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.statItem} onPress={() => router.push('/orders')}>
                        <View style={styles.statIconBg}>
                            <Package size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.statNumber}>{orderCount}</Text>
                        <Text style={styles.statLabel}>Đơn hàng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statItem} onPress={() => router.push('/wishlist')}>
                        <View style={[styles.statIconBg, { backgroundColor: '#FFF0F0' }]}>
                            <Heart size={24} color="#FF3B30" />
                        </View>
                        <Text style={styles.statNumber}>{wishlistCount}</Text>
                        <Text style={styles.statLabel}>Yêu thích</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statItem} onPress={() => Alert.alert("Voucher", "Bạn có 2 voucher khả dụng")}>
                        <View style={[styles.statIconBg, { backgroundColor: '#F0F9FF' }]}>
                            <Text style={{ fontSize: 18 }}>🎟️</Text>
                        </View>
                        <Text style={styles.statNumber}>2</Text>
                        <Text style={styles.statLabel}>Voucher</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Section 1 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tài khoản của tôi</Text>
                    <MenuItem
                        icon={Package}
                        title="Đơn mua"
                        subtitle="Xem lịch sử đơn hàng"
                        onPress={() => router.push('/orders')}
                    />
                    <MenuItem
                        icon={Heart}
                        title="Đã thích"
                        subtitle={`${wishlistCount} sản phẩm`}
                        onPress={() => router.push('/wishlist')}
                    />
                    <MenuItem
                        icon={MapPin}
                        title="Địa chỉ nhận hàng"
                        subtitle="Quản lý địa chỉ giao hàng"
                        onPress={() => router.push('/addresses')}
                    />
                </View>

                {/* Menu Section 2 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cài đặt & Bảo mật</Text>
                    <MenuItem
                        icon={Lock}
                        title="Đổi mật khẩu"
                        onPress={() => router.push('/change-password')}
                    />
                    <View style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Bell size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Thông báo</Text>
                        </View>
                        <Switch value={true} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <MenuItem
                        icon={Headphones}
                        title="Trung tâm hỗ trợ"
                        onPress={() => Alert.alert("Thông báo", "Liên hệ tổng đài 1900 xxxx")}
                    />
                    <MenuItem
                        icon={LogOut}
                        title="Đăng xuất"
                        isDestructive
                        onPress={handleLogout}
                    />
                </View>

                <Text style={styles.version}>Phiên bản 1.1.0</Text>
                <View style={{ height: 50 }} />
            </ScrollView>

            {/* Back Button Overlay */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 10 }]}
                onPress={() => router.back()}
            >
                <ChevronRight size={24} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        padding: 8,
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    userCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#F0F0F0',
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        color: COLORS.subText,
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#F59E0B',
        fontSize: 11,
        fontWeight: 'bold',
    },
    editBtn: {
        padding: 5,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statItem: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    statIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.subText,
    },
    // Sections
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
        marginLeft: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuIconBoxDestructive: {
        backgroundColor: '#FFF0F0',
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    textDestructive: {
        color: '#FF3B30',
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 2,
    },
    version: {
        textAlign: 'center',
        color: '#CCC',
        fontSize: 12,
        marginBottom: 20,
    },
});