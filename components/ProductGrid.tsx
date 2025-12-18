
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
    Platform
} from 'react-native';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { COLORS } from '../theme/colors';

type Product = {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUri: any;      
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
    cardWidth: number; 
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart, cardWidth }) => {
    const isOnSale = product.originalPrice && product.originalPrice > product.price;

    const discountPercent = isOnSale && product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.productCard, { width: cardWidth }]}
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

                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingStars}>
                        {'⭐'.repeat(Math.floor(product.rating))}
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
    const safeProducts = products || MOCK_PRODUCTS;
    const { width } = useWindowDimensions();

    // 🟢 LOGIC CHIA CỘT RESPONSIVE
    let numColumns = 2; // Mặc định mobile
    if (width > 1200) numColumns = 5;      // Màn hình lớn (PC)
    else if (width > 900) numColumns = 4;  // Laptop nhỏ / Tablet ngang
    else if (width > 600) numColumns = 3;  // Tablet dọc

    // 🟢 ALIGNMENT LOGIC (Đã sửa để khớp hoàn toàn với Banner)
    const maxGridWidth = 1200;
    const containerPadding = width > maxGridWidth 
        ? (width - maxGridWidth) / 2 
        : 15;

    // Khoảng cách giữa các item
    const gap = 15;
    const totalGap = gap * (numColumns - 1);
    
    const availableWidth = width > maxGridWidth ? maxGridWidth : (width - containerPadding * 2);
    const cardWidth = (availableWidth - totalGap) / numColumns;

    return (
        <View style={styles.container}>
            <View style={[styles.sectionHeader, { paddingHorizontal: containerPadding }]}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onSeeAllPress && (
                    <TouchableOpacity onPress={onSeeAllPress}>
                        <Text style={styles.seeAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.gridWrapper, { paddingHorizontal: containerPadding }]}>
                <FlatList
                    key={numColumns} 
                    data={safeProducts}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={onProductPress}
                            onAddToCart={onAddToCart}
                            cardWidth={cardWidth}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    scrollEnabled={false}
                    columnWrapperStyle={[styles.columnWrapper, { gap: gap }]}
                    contentContainerStyle={{ gap: 15 }} 
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>📭</Text>
                            <Text style={styles.emptyStateTitle}>Không có sản phẩm</Text>
                        </View>
                    }
                />
            </View>
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
    gridWrapper: {
        // Wrapper để áp dụng padding ngang
    },
    columnWrapper: {
        justifyContent: 'flex-start',
    },
    productCard: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lightBackground,
        overflow: 'visible',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1, 
        backgroundColor: '#F9F9F9',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        width: 32, 
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addToCartText: {
        fontSize: 16, 
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500', 
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 18,
        height: 36, 
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingStars: {
        fontSize: 10,
        marginRight: 4,
    },
    ratingText: {
        fontSize: 10,
        color: COLORS.subText,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    currentPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 11,
        color: '#AAA',
        textDecorationLine: 'line-through',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        width: '100%',
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
