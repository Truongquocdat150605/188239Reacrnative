// components/ProductGrid.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    useWindowDimensions,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useWishlist } from '../lib/WishlistContext';
import type { ProductData } from '../app/services/productService';

type ProductGridProps = {
    title?: string;
    products?: ProductData[];
    onProductPress?: (product: ProductData) => void;
    onAddToCart?: (product: ProductData) => void;
    onSeeAllPress?: () => void;
};

export const ProductGrid: React.FC<ProductGridProps> = ({
    title = "Sản phẩm",
    products = [],
    onProductPress = () => { },
    onAddToCart = () => { },
    onSeeAllPress,
}) => {
    const { width } = useWindowDimensions();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;
    const gap = 12;
    const cardWidth = (width - gap * (numColumns + 1)) / numColumns;

    if (!products || products.length === 0) {
        return (
            <View style={[styles.container, styles.empty]}>
                <Text>Không có sản phẩm nào</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: ProductData }) => {
        const isFavorite = isInWishlist(item.id);

        return (
            <TouchableOpacity
                style={[styles.card, { width: cardWidth }]}
                onPress={() => onProductPress(item)}
            >
                <View style={styles.imgWrapper}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.img}
                    />

                    <TouchableOpacity
                        style={styles.wishlistBtn}
                        onPress={() => toggleWishlist(item)}
                    >
                        <Heart
                            size={20}
                            color={isFavorite ? COLORS.error : "#FFF"}
                            fill={isFavorite ? COLORS.error : "transparent"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() => onAddToCart(item)}
                    >
                        <Text style={{ fontSize: 18 }}>🛒</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>

                <Text style={styles.price}>
                    {(item.price ?? 0).toLocaleString("vi-VN")}₫
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {onSeeAllPress && (
                    <TouchableOpacity onPress={onSeeAllPress}>
                        <Text style={styles.seeAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                key={`grid-${numColumns}`}   // 🔥 force remount fix web
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={numColumns}
                columnWrapperStyle={{ gap }}
                contentContainerStyle={{ gap }}
                scrollEnabled={false}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 12 },
    empty: { alignItems: 'center', padding: 30 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    seeAll: { color: COLORS.primary, fontWeight: '600' },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    imgWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F5F5F5',
        position: 'relative',
    },
    img: { width: '100%', height: '100%' },
    name: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginTop: 6,
        marginHorizontal: 6,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
        margin: 6,
    },
    wishlistBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBtn: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
