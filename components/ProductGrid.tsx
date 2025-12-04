// components/ProductGrid.tsx

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions
} from 'react-native';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { COLORS } from '../theme/colors';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

type Product = {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUri: any;      // ← FIX
    category: string;
    isNew?: boolean;
    isSale?: boolean;
    rating: number;
    reviewCount: number;
    specifications: {
        material: string;
        weight?: string;
        size?: string;
    };
};


type ProductCardProps = {
    product: Product;
    onPress: (product: Product) => void;
    onAddToCart: (product: Product) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart }) => {
    const isOnSale = product.originalPrice && product.originalPrice > product.price;

    // 🔧 FIX: Tránh lỗi khi originalPrice là undefined
    const discountPercent = isOnSale && product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => onPress(product)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={product.imageUri}
                    style={styles.productImage}
                    resizeMode="cover"
                />


                {/* Badges */}
                <View style={styles.badgesContainer}>
                    {product.isNew && (
                        <View style={[styles.badge, styles.newBadge]}>
                            <Text style={styles.badgeText}>MỚI</Text>
                        </View>
                    )}
                    {isOnSale && (
                        <View style={[styles.badge, styles.saleBadge]}>
                            <Text style={styles.badgeText}>-{discountPercent}%</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => onAddToCart(product)}
                >
                    <Text style={styles.addToCartText}>🛒</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                </Text>

                <Text style={styles.productSpecs}>
                    {product.specifications.material}
                </Text>

                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingStars}>
                        {'⭐'.repeat(Math.floor(product.rating))}
                        {product.rating % 1 > 0 ? '½' : ''}
                    </Text>
                    <Text style={styles.ratingText}>({product.reviewCount})</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>
                        {formatPrice(product.price)}
                    </Text>
                    {isOnSale && (
                        <Text style={styles.originalPrice}>
                            {formatPrice(product.originalPrice!)}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

type ProductGridProps = {
    title?: string;
    products?: Product[];
    onProductPress?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onSeeAllPress?: () => void;
};

export const ProductGrid: React.FC<ProductGridProps> = ({
    title = "Sản Phẩm Nổi Bật",
    products = MOCK_PRODUCTS,
    onProductPress = (product) => console.log('Product pressed:', product.name),
    onAddToCart = (product) => console.log('Add to cart:', product.name),
    onSeeAllPress,
}) => {
    // 🔧 FIX: Xử lý khi products là undefined
    const safeProducts = products || MOCK_PRODUCTS;

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onSeeAllPress && (
                    <TouchableOpacity onPress={onSeeAllPress}>
                        <Text style={styles.seeAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={safeProducts}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onPress={onProductPress}
                        onAddToCart={onAddToCart}
                    />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.productsContainer}
                columnWrapperStyle={styles.columnWrapper}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>📭</Text>
                        <Text style={styles.emptyStateTitle}>Không có sản phẩm</Text>
                    </View>
                }
            />

        </View>
    );
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(price);
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
        backgroundColor: COLORS.background,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    productsContainer: {
        paddingHorizontal: 15,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    productCard: {
        // width: (width - 45) / 2,
        width: (Platform.OS === 'web' ? 390 : width - 30) / 2,

        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lightBackground,
        // overflow: 'hidden',
        overflow: 'visible',
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        height: 150,
        overflow: 'visible',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    badgesContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
    },
    newBadge: {
        backgroundColor: COLORS.success,
    },
    saleBadge: {
        backgroundColor: COLORS.error,
    },
    badgeText: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
    },
    addToCartButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: COLORS.primary, // 🟢 ĐỔI THÀNH MÀU NỔI BẬT
        width: 36, // 🟢 TĂNG KÍCH THƯỚC
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
        borderWidth: 2,
        borderColor: 'white', // 🟢 VIỀN TRẮNG ĐỂ NỔI BẬT
    },
    addToCartText: {
        fontSize: 18, // 🟢 TĂNG SIZE
        color: 'white', // 🟢 MÀU TRẮNG TRÊN NỀN VÀNG
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 18,
    },
    productSpecs: {
        fontSize: 12,
        color: COLORS.subText,
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingStars: {
        fontSize: 12,
        marginRight: 4,
    },
    ratingText: {
        fontSize: 11,
        color: COLORS.subText,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.lightText,
        textDecorationLine: 'line-through',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 48,
        marginBottom: 10,
    },
    emptyStateTitle: {
        fontSize: 16,
        color: COLORS.subText,
    },
});