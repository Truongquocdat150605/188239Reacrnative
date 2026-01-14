import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ShoppingCart, Trash2, Heart } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useWishlist } from '../lib/WishlistContext';
import { useCart } from '../lib/CartContext';

export default function WishlistScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart({
            productId: product.id,   // QUAN TRỌNG
            name: product.name,
            price: product.price,
            image: product.image ?? null,
            size: null,
        });

        Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
    };

    const getImageSource = (source: any) => {
        if (!source || source === '') {
            // Dùng placeholder online thay vì local file
            return { uri: 'https://via.placeholder.com/100' };
        }
        if (typeof source === 'number') return source;
        if (typeof source === 'string') return { uri: source };
        return source;
    };
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/productdetail', params: { id: item.id } })}
        >
            {/* Sửa dòng này: thay imageUri thành image */}
            <Image source={getImageSource(item.image)} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>{item.price?.toLocaleString('vi-VN')}₫</Text>

                {/* TẠM THỜI ẨN hoặc sửa thành dữ liệu từ Firebase */}
                {/* <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {item.rating || "5.0"}</Text>
                <Text style={styles.review}>({item.reviewCount || "0"} đánh giá)</Text>
            </View> */}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() => handleAddToCart(item)}
                >
                    <ShoppingCart size={20} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeFromWishlist(item.id)}
                >
                    <Trash2 size={20} color="#999" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sản phẩm yêu thích ({wishlistItems.length})</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* List */}
            <FlatList
                data={wishlistItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Heart size={60} color="#DDD" />
                        <Text style={styles.emptyTitle}>Danh sách yêu thích trống</Text>
                        <Text style={styles.emptyText}>Hãy thả tim các sản phẩm bạn yêu thích nhé!</Text>
                        <TouchableOpacity
                            style={styles.shopBtn}
                            onPress={() => router.push('/home')}
                        >
                            <Text style={styles.shopBtnText}>Khám phá ngay</Text>
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
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },

    listContent: {
        padding: 15,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        marginRight: 4,
    },
    review: {
        fontSize: 11,
        color: COLORS.subText,
    },
    actions: {
        justifyContent: 'space-between',
        height: 80,
        paddingVertical: 5,
    },
    cartBtn: {
        padding: 8,
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
    },
    deleteBtn: {
        padding: 8,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 25,
    },
    shopBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});