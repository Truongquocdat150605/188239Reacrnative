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

// 🔥 Type theo Firebase structure (đồng bộ với productService)
type Product = {
    id: string;
    name?: string;
    price?: number;
    image?: string;        // 🔥 từ Firebase: imageUrl/image/imageUri
    imageUrl?: string;     // 🔥 fallback
    type?: string;
    sizes?: string[];
    description?: string;
    specifications?: {
        material?: string;
        weight?: string;
        size?: string;
    };
    // Các trường không có trong Firebase - để optional
    originalPrice?: number;
    isNew?: boolean;
    isSale?: boolean;
    rating?: number;
    reviewCount?: number;
};

type ProductCardProps = {
    product: Product;
    onPress: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    cardWidth: number;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart, cardWidth }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    
    // 🔥 Xử lý ảnh từ Firebase
    const getImageUri = () => {
        return product.image || product.imageUrl || '';
    };

    const isOnSale = product.originalPrice && product.originalPrice > (product.price || 0);
    const discountPercent = isOnSale && product.originalPrice && product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;
    
    const isFavorite = isInWishlist(product.id);
    
    // 🔥 Xử lý giá
    const price = product.price || 0;
    const originalPrice = product.originalPrice || 0;

    return (
        <TouchableOpacity
            style={[styles.productCard, { width: cardWidth }]}
            onPress={() => onPress(product)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: getImageUri() }}
                    style={styles.productImage}
                    resizeMode="cover"
                    // defaultSource={require('../assets/placeholder.png')} // 🔥 Thêm placeholder nếu có
                />

                {/* Badge trạng thái */}
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

                {/* 🔥 NÚT YÊU THÍCH - Firebase */}
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={() => toggleWishlist(product)}
                >
                    <Heart
                        size={20}
                        color={isFavorite ? COLORS.error : "#FFF"}
                        fill={isFavorite ? COLORS.error : "transparent"}
                    />
                </TouchableOpacity>

                {/* Nút thêm giỏ hàng */}
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => onAddToCart(product)}
                >
                    <Text style={styles.addToCartText}>🛒</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name || "Không có tên"}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>{formatPrice(price)}</Text>
                    {isOnSale && originalPrice > 0 && (
                        <Text style={styles.originalPrice}>
                            {formatPrice(originalPrice)}
                        </Text>
                    )}
                </View>

                {/* 🔥 Material từ Firebase (nếu có) */}
                {product.specifications?.material && (
                    <Text style={styles.materialText}>
                        {product.specifications.material}
                    </Text>
                )}
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
    products = [], // 🔥 Mặc định là mảng rỗng thay vì MOCK
    onProductPress = () => {},
    onAddToCart = () => {},
    onSeeAllPress,
}) => {
    const { width } = useWindowDimensions();

    let numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;
    const maxGridWidth = 1200;
    const containerPadding = width > maxGridWidth ? (width - maxGridWidth) / 2 : 15;
    const gap = 15;
    const totalGap = gap * (numColumns - 1);
    const availableWidth = width > maxGridWidth ? maxGridWidth : (width - containerPadding * 2);
    const cardWidth = (availableWidth - totalGap) / numColumns;

    // 🔥 Hiển thị khi không có sản phẩm
    if (!products || products.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            </View>
        );
    }

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
                    data={products}
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
                    columnWrapperStyle={{ gap }}
                    contentContainerStyle={{ gap }}
                />
            </View>
        </View>
    );
};

const formatPrice = (price: number = 0): string =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(price);

const styles = StyleSheet.create({
    container: { 
        marginVertical: 15, 
        backgroundColor: COLORS.background 
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: COLORS.subText,
        fontSize: 16,
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
        color: COLORS.text 
    },
    seeAllText: { 
        fontSize: 14, 
        color: COLORS.primary, 
        fontWeight: '600' 
    },
    gridWrapper: {
        width: '100%',
    },
    productCard: {
        backgroundColor: COLORS.background, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: COLORS.lightBackground,
        overflow: 'hidden', 
        elevation: 2,
    },
    imageContainer: { 
        width: '100%', 
        aspectRatio: 1, 
        backgroundColor: '#F9F9F9',
        position: 'relative',
    },
    productImage: { 
        width: '100%', 
        height: '100%' 
    },
    badgesContainer: { 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        flexDirection: 'row' 
    },
    badge: { 
        paddingHorizontal: 6, 
        paddingVertical: 2, 
        borderRadius: 4, 
        marginRight: 4 
    },
    newBadge: { 
        backgroundColor: COLORS.success 
    },
    saleBadge: { 
        backgroundColor: COLORS.error 
    },
    badgeText: { 
        fontSize: 10, 
        color: 'white', 
        fontWeight: 'bold' 
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    addToCartButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    addToCartText: { 
        fontSize: 16 
    },
    productInfo: { 
        padding: 10 
    },
    productName: { 
        fontSize: 14, 
        fontWeight: '500', 
        color: COLORS.text, 
        marginBottom: 4 
    },
    priceContainer: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    currentPrice: { 
        fontSize: 15, 
        fontWeight: 'bold', 
        color: COLORS.primary, 
        marginRight: 6 
    },
    originalPrice: { 
        fontSize: 11, 
        color: '#AAA', 
        textDecorationLine: 'line-through' 
    },
    materialText: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 2,
    },
});