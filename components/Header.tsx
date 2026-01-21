import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, ShoppingCart } from 'lucide-react-native';
import React from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../theme/colors';

// 🔥 CONTEXT
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';

// ================== TYPES ==================
type HeaderProps = {
    showBackButton?: boolean;
    title?: string;
};

type HeaderIconProps = {
    IconComponent: React.ComponentType<any>;
    count: number;
    onPress: () => void;
};

// ================== ICON WITH BADGE ==================
const HeaderIcon: React.FC<HeaderIconProps> = ({ IconComponent, count, onPress }) => (
    <TouchableOpacity style={styles.iconButton} onPress={onPress}>
        <IconComponent size={24} color={COLORS.text} />
        {count > 0 && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>
                    {count > 99 ? '99+' : count}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

// ================== HEADER ==================
export const Header: React.FC<HeaderProps> = ({
    showBackButton = false,
    title = 'JEWELRY',
}) => {
    const router = useRouter();

    // 🔥 LẤY DATA THẬT TỪ CONTEXT
    const { unreadCount } = useNotification();
    const { cartCount } = useCart();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>

                {/* 🔙 BACK */}
                {showBackButton ? (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={26} color={COLORS.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 30 }} />
                )}

                {/* 🏷️ TITLE */}
                <Text style={styles.logoText}>{title}</Text>

                {/* 🔔 ICON GROUP */}
                <View style={styles.iconGroup}>

                    {/* 🔔 THÔNG BÁO */}
                    <HeaderIcon
                        IconComponent={Bell}
                        count={unreadCount}
                        onPress={() => router.push('/notifications')}
                    />

                    {/* 🛒 GIỎ HÀNG */}
                    <HeaderIcon
                        IconComponent={ShoppingCart}
                        count={cartCount ?? 0}
                        onPress={() => router.push('/cart')}
                    />

                    {/* 👤 PROFILE */}
                    <TouchableOpacity
                        style={styles.avatarButton}
                        onPress={() => router.push('/profile')}
                    >
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

// ================== STYLES ==================
const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 0.6,
        borderBottomColor: COLORS.lightText,
    },
    backButton: {
        width: 30,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 16,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -6,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    avatarButton: {
        marginLeft: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.lightText,
    },
});
