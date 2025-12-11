import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView,
    Image 
} from 'react-native';
import { ShoppingCart, Bell, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useRouter } from 'expo-router';

// 🟢 ĐỊNH NGHĨA TYPE CHO HEADER PROPS
type HeaderProps = {
    cartCount?: number;
    notificationCount?: number;
    showBackButton?: boolean;
    title?: string;
};

// ⭐ Props Header Icon
type HeaderIconProps = {
    IconComponent: React.ComponentType<any>; 
    count: number;
    onPress: () => void;
};

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

// ⭐ Header chính
export const Header: React.FC<HeaderProps> = ({
    cartCount = 0,
    notificationCount = 0,
    showBackButton = false,
    title = "JEWELRY",
}) => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>

                {/* 🔙 Nút Back */}
                {showBackButton ? (
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={styles.backButton}
                    >
                        <ArrowLeft size={26} color={COLORS.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 30 }} /> // giữ cân bằng layout
                )}

                {/* 🏷️ Tiêu đề */}
                <Text style={styles.logoText}>{title}</Text>

                {/* Nhóm Icon */}
                <View style={styles.iconGroup}>

                    {/* Chuông */}
                    <HeaderIcon
                        IconComponent={Bell}
                        count={notificationCount}
                        onPress={() => router.push('/notifications')}
                    />

                    {/* Giỏ hàng + Badge */}
                    <HeaderIcon
                        IconComponent={ShoppingCart}
                        count={cartCount}
                        onPress={() => router.push('/cart')}
                    />

                    {/* 🆕 AVATAR PROFILE */}
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

// ================= Styles =================

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
    // Style cho Avatar
    avatarButton: {
        marginLeft: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16, // Tròn
        borderWidth: 1,
        borderColor: COLORS.lightText,
    }
});