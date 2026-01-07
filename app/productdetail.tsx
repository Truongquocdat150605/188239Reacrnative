import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2, ShoppingCart, Minus, Plus } from 'lucide-react-native';

import { COLORS } from '../theme/colors';
import { getAllProducts } from '../app/services/productService';
import { useCart } from '../lib/CartContext';
import { useWishlist } from '../lib/WishlistContext';
import { getProductById } from '../app/services/productService';
const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 380;

/** 🚀 Product type theo Firebase */
interface ProductData {
    id: string;
    name?: string;
    price?: number;
    image?: string;
    type?: string;
    sizes?: string[];
    description?: string;
    specifications?: any;
    [key: string]: any;
}

export default function ProductDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState<ProductData | null>(null);
    const [similarProducts, setSimilarProducts] = useState<ProductData[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    /** 📌 Load dữ liệu theo ID */
    // Thay đổi trong useEffect
    useEffect(() => {
        const load = async () => {
            try {
                // Lấy sản phẩm theo ID
                const productData = await getProductById(String(id));

                if (productData) {
                    setProduct(productData as ProductData);

                    // Lấy sản phẩm cùng loại
                    const allProducts = await getAllProducts();
                    const related = allProducts.filter(
                        (p: ProductData) => p?.type === productData.type && p?.id !== productData.id
                    );
                    setSimilarProducts(related);
                }
            } catch (error) {
                console.error("❌ Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) return <View style={styles.center}><Text>Đang tải...</Text></View>;
    if (!product) return <View style={styles.center}><Text>Không tìm thấy sản phẩm</Text></View>;

    const sizes = product.sizes || [];
    const isFavorite = isInWishlist(product.id);
    const galleryImages = [product.image, product.image, product.image];

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            return Alert.alert("Chưa chọn size", "Vui lòng chọn kích thước");
        }

        addToCart({
            id: product.id,
            name: product.name ?? "",
            price: product.price ?? 0,
            quantity,
            image: product.image,
            size: selectedSize ?? undefined,
        });

        Alert.alert("🎉 Thành công", "Đã thêm sản phẩm vào giỏ!");
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push("/checkout");
    };

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
                        <ShoppingCart size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* BODY */}
            <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
                <View style={styles.galleryContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                            setActiveImageIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {galleryImages.map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.image} resizeMode="contain" />
                        ))}
                    </ScrollView>
                </View>

                {/* INFO */}
                <View style={styles.infoContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{product.name}</Text>
                        <TouchableOpacity onPress={() => toggleWishlist(product)}>
                            <Heart
                                size={28}
                                color={isFavorite ? COLORS.error : COLORS.subText}
                                fill={isFavorite ? COLORS.error : "transparent"}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.price}>{(product.price ?? 0).toLocaleString("vi-VN")}₫</Text>

                    {/* SIZE */}
                    {sizes.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chọn size</Text>
                            <View style={styles.sizeContainer}>
                                {sizes.map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[styles.sizeChip, selectedSize === size && styles.sizeChipSelected]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* DESCRIPTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>{product.description ?? "Đang cập nhật..."}</Text>
                    </View>

                    {/* SIMILAR PRODUCTS */}
                    {similarProducts.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {similarProducts.map((p) => (
                                    <TouchableOpacity
                                        key={p.id}
                                        onPress={() => router.push(`/productdetail?id=${p.id}`)}
                                        style={styles.similarCard}
                                    >
                                        <Image source={{ uri: p.image }} style={styles.similarImage} />
                                        <Text numberOfLines={1}>{p.name}</Text>
                                        <Text style={styles.similarPrice}>{(p.price ?? 0).toLocaleString("vi-VN")}₫</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FOOTER */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}><Minus /></TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity(q => q + 1)}><Plus /></TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                    <ShoppingCart color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
                    <Text style={styles.buyNowText}>Mua Ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ================= STYLES ================ */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
    iconButton: { backgroundColor: "#FFF", padding: 8, borderRadius: 20 },
    headerRight: { flexDirection: 'row', gap: 10 },
    galleryContainer: { height: IMAGE_HEIGHT, backgroundColor: '#F8F8F8' },
    image: { width, height: IMAGE_HEIGHT },
    infoContainer: { padding: 20, marginTop: -10, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 22, fontWeight: '700' },
    price: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginVertical: 10 },
    section: { marginVertical: 18 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    sizeChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#CCC' },
    sizeChipSelected: { borderColor: COLORS.primary, backgroundColor: '#E8F2FF' },
    sizeTextSelected: { color: COLORS.primary, fontWeight: 'bold' },
    sizeText: {
        fontSize: 14,
        color: '#000',
    },

    description: { fontSize: 14, color: '#555' },
    similarCard: { width: 120, marginRight: 10 },
    similarImage: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#EEE' },
    similarPrice: { fontWeight: 'bold', color: COLORS.primary },
    footer: { position: 'absolute', bottom: 0, backgroundColor: '#fff', flexDirection: 'row', padding: 10, gap: 10 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', paddingHorizontal: 10, borderRadius: 8, flex: 1 },
    qtyText: { marginHorizontal: 10, fontSize: 16 },
    addToCartBtn: { width: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10 },
    buyNowBtn: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    buyNowText: { color: '#fff', fontWeight: '700' },
});
