import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Minus, Plus, ChevronRight } from 'lucide-react-native';

import { COLORS } from '../theme/colors';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { useCart } from '../lib/CartContext';
import { useWishlist } from '../lib/WishlistContext';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 380;

// Mock Reviews Data
const MOCK_REVIEWS = [
    { id: '1', user: 'Minh Anh', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, date: '20/12/2024', content: 'Sản phẩm rất đẹp, sáng bóng, đóng gói cẩn thận. Giao hàng nhanh!' },
    { id: '2', user: 'Tuấn Kiệt', avatar: 'https://i.pravatar.cc/150?img=2', rating: 4, date: '18/12/2024', content: 'Chất lượng tốt so với tầm giá. Size hơi rộng một chút nhưng vẫn ok.' },
    { id: '3', user: 'Hồng Nhung', avatar: 'https://i.pravatar.cc/150?img=5', rating: 5, date: '10/12/2024', content: 'Tuyệt vời! Sẽ ủng hộ shop dài dài.' },
];

export default function ProductDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const product = MOCK_PRODUCTS.find(p => p.id === id);

    if (!product) return null;

    const isFavorite = isInWishlist(product.id);
    const similarProducts = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    // Mock sizes based on category
    const getSizes = () => {
        if (product.category === 'rings' || product.category === 'wedding' || product.category === 'silver') return ['6', '7', '8', '9', '10', '11'];
        if (product.category === 'bracelets' || product.category === 'gold') return ['15cm', '16cm', '17cm', '18cm'];
        if (product.category === 'necklaces') return ['40cm', '45cm', '50cm'];
        return null; // One size / Freesize
    };
    const sizes = getSizes();

    // Mock Gallery Images (Duplicate current image for demo)
    const galleryImages = [
        product.imageUri,
        product.imageUri, // Mock image 2
        product.imageUri, // Mock image 3
    ];

    const getImageSource = (source: any) => {
        if (!source) return { uri: 'https://via.placeholder.com/300' };
        if (typeof source === 'number') return source;
        if (typeof source === 'string') return { uri: source };
        return source;
    };

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveImageIndex(roundIndex);
    };

    const handleAddToCart = () => {
        if (sizes && !selectedSize) {
            Alert.alert("Chưa chọn kích thước", "Vui lòng chọn size phù hợp với bạn.");
            return;
        }

        addToCart({ ...product, quantity }, selectedSize || undefined);
        
        Alert.alert(
            "Đã thêm vào giỏ", 
            `Đã thêm ${product.name} ${selectedSize ? `(Size ${selectedSize})` : ''} vào giỏ.`,
            [
                { text: "Tiếp tục xem", style: "cancel" },
                { text: "Đến giỏ hàng", onPress: () => router.push('/cart') }
            ]
        );
    };

    const handleBuyNow = () => {
        if (sizes && !selectedSize) {
            Alert.alert("Chưa chọn kích thước", "Vui lòng chọn size phù hợp với bạn.");
            return;
        }

        // Tạo item ID tạm thời giống logic trong CartContext
        const cartItemId = selectedSize ? `${product.id}-${selectedSize}` : product.id;
        
        addToCart({ ...product, quantity }, selectedSize || undefined);

        router.push({
            pathname: "/checkout",
            params: { itemIds: JSON.stringify([cartItemId]) }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Share", "Link sản phẩm đã được sao chép!")}>
                        <Share2 size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
                        <ShoppingCart size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                
                {/* 1. Image Gallery */}
                <View style={styles.galleryContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {galleryImages.map((img, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image 
                                    source={getImageSource(img)} 
                                    style={styles.image} 
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>
                    {/* Pagination Dots */}
                    <View style={styles.dotsContainer}>
                        {galleryImages.map((_, i) => (
                            <View 
                                key={i} 
                                style={[styles.dot, activeImageIndex === i && styles.activeDot]} 
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    {/* Title & Price */}
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{product.name}</Text>
                        <TouchableOpacity onPress={() => toggleWishlist(product)}>
                            <Heart 
                                size={28} 
                                color={isFavorite ? COLORS.error : COLORS.subText} 
                                fill={isFavorite ? COLORS.error : 'transparent'} 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ratingRow}>
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>{product.rating} ({product.reviewCount} đánh giá) • Đã bán 120+</Text>
                    </View>

                    <Text style={styles.price}>{product.price.toLocaleString("vi-VN")}₫</Text>

                    {/* 2. Size Selection */}
                    {sizes && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chọn Kích Thước</Text>
                            <View style={styles.sizeContainer}>
                                {sizes.map((size) => (
                                    <TouchableOpacity 
                                        key={size}
                                        style={[styles.sizeChip, selectedSize === size && styles.sizeChipSelected]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>
                                            {size}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                        <View style={styles.specTable}>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Chất liệu</Text>
                                <Text style={styles.specValue}>{product.specifications?.material || 'Đang cập nhật'}</Text>
                            </View>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Trọng lượng</Text>
                                <Text style={styles.specValue}>{product.specifications?.weight || 'Tiêu chuẩn'}</Text>
                            </View>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Thương hiệu</Text>
                                <Text style={styles.specValue}>Luxe Jewelry</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>
                            Sản phẩm được chế tác thủ công bởi các nghệ nhân lành nghề. Thiết kế tinh xảo, hiện đại nhưng vẫn giữ được nét sang trọng cổ điển. 
                            Phù hợp để làm quà tặng cho người thân, bạn bè hoặc tự thưởng cho bản thân trong các dịp đặc biệt.
                        </Text>
                    </View>

                    {/* 3. Reviews */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Đánh giá ({product.reviewCount})</Text>
                            <TouchableOpacity style={styles.seeAllBtn}>
                                <Text style={styles.seeAllText}>Xem tất cả</Text>
                                <ChevronRight size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        
                        {MOCK_REVIEWS.map((review) => (
                            <View key={review.id} style={styles.reviewItem}>
                                <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                                <View style={styles.reviewContent}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewUser}>{review.user}</Text>
                                        <Text style={styles.reviewDate}>{review.date}</Text>
                                    </View>
                                    <View style={styles.reviewRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} color={i < review.rating ? "#FFD700" : "#EEE"} fill={i < review.rating ? "#FFD700" : "none"} />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewText}>{review.content}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* 4. Similar Products */}
                    {similarProducts.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarList}>
                                {similarProducts.map((p) => (
                                    <TouchableOpacity 
                                        key={p.id} 
                                        style={styles.similarCard}
                                        onPress={() => router.push({ pathname: '/productdetail', params: { id: p.id } })}
                                    >
                                        <Image source={getImageSource(p.imageUri)} style={styles.similarImage} />
                                        <Text numberOfLines={2} style={styles.similarName}>{p.name}</Text>
                                        <Text style={styles.similarPrice}>{p.price.toLocaleString("vi-VN")}₫</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {/* Quantity Selector (Mini) */}
                <View style={styles.qtyContainer}>
                    <TouchableOpacity 
                        style={styles.qtyBtn} 
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Minus size={18} color="#555" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(quantity + 1)}
                    >
                        <Plus size={18} color="#555" />
                    </TouchableOpacity>
                </View>

                {/* Buttons */}
                <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                    <ShoppingCart size={20} color={COLORS.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
                    <Text style={styles.buyNowText}>Mua Ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    // Gallery
    galleryContainer: {
        height: IMAGE_HEIGHT,
        backgroundColor: '#F9F9F9',
        position: 'relative',
    },
    imageWrapper: {
        width: width,
        height: IMAGE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        width: 24,
    },
    // Info Body
    infoContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 13,
        color: COLORS.subText,
        marginLeft: 6,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
    },
    // Sections
    section: {
        marginBottom: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 13,
        color: COLORS.primary,
        marginRight: 4,
    },
    // Sizes
    sizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sizeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: 'white',
    },
    sizeChipSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F9FF',
    },
    sizeText: {
        fontSize: 14,
        color: COLORS.text,
    },
    sizeTextSelected: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    // Specs
    specTable: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    specRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    specLabel: {
        width: 100,
        color: COLORS.subText,
        fontSize: 14,
    },
    specValue: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    // Reviews
    reviewItem: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#FAFAFA',
        padding: 10,
        borderRadius: 12,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    reviewContent: {
        flex: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewUser: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    reviewRating: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    reviewText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
    // Similar Products
    similarList: {
        paddingRight: 20,
    },
    similarCard: {
        width: 140,
        marginRight: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 10,
        padding: 8,
    },
    similarImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F5F5F5',
    },
    similarName: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 4,
    },
    similarPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center',
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 4,
    },
    qtyBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    qtyText: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    addToCartBtn: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#F0F9FF',
    },
    buyNowBtn: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.primary,
    },
    buyNowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});