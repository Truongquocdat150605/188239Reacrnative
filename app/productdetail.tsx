import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ArrowLeft,
    Heart,
    Share2,
    ShoppingCart,
    Minus,
    Plus,
} from "lucide-react-native";

import { COLORS } from "../theme/colors";
import {
    getAllProducts,
    getProductById,
    ProductData,
} from "../app/services/productService";
import { useCart } from "../lib/CartContext";
import type { CartItem } from "../lib/CartContext";

import { useWishlist } from "../lib/WishlistContext";
import { useBuyNow } from "../lib/BuyNowContext";
/* ================ CONSTANTS ================ */
const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 380;

export default function ProductDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();

    const productId = Array.isArray(id) ? id[0] : (id as string | undefined);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist,removeFromWishlist,addToWishlist } = useWishlist();
    const { setBuyNowItem } = useBuyNow();

    const [product, setProduct] = useState<ProductData | null>(null);
    const [similarProducts, setSimilarProducts] = useState<ProductData[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    /** 📌 Load dữ liệu theo ID */
    useEffect(() => {
        const load = async () => {
            if (!productId) {
                setLoading(false);
                return;
            }

            try {
                const productData = await getProductById(productId);

                if (productData) {
                    setProduct(productData);

                    // Lấy sản phẩm cùng category
                    const allProducts = await getAllProducts();
                    const related = allProducts.filter(
                        (p) =>
                            p.categoryId === productData.categoryId && p.id !== productData.id
                    );
                    setSimilarProducts(related);
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("❌ Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [productId]);

    if (loading)
        return (
            <View style={styles.center}>
                <Text>Đang tải...</Text>
            </View>
        );

    if (!product)
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy sản phẩm</Text>
            </View>
        );

    const sizes = product.sizes ?? [];
    const isFavorite = isInWishlist(product.id);

    // Firestore hiện tại mới có 1 hình (imageUrl) → dùng 1 ảnh
    const galleryImages = product.image ? [product.image] : [];

    /** 🛒 Thêm vào giỏ */
    const handleAddToCart = async () => {
        if (sizes.length > 0 && !selectedSize) {
            return Alert.alert("Chưa chọn size", "Vui lòng chọn kích thước");
        }

        const item: CartItem = {
            id: selectedSize ? `${product.id}_${selectedSize}` : product.id,
            productId: product.id,
            name: product.name ?? "",
            price: product.price ?? 0,
            quantity: 1,
            image: product.image,
            size: selectedSize ?? null,  // dùng null thay vì undefined
        };

        await addToCart(item);
        Alert.alert("🎉 Thành công", "Đã thêm sản phẩm vào giỏ!");
    };


    /** 💳 Mua ngay */
    const handleBuyNow = () => {
        if (sizes.length > 0 && !selectedSize) {
            return Alert.alert("Chưa chọn size", "Vui lòng chọn kích thước");
        }

        setBuyNowItem({
            id: selectedSize ? `${product.id}_${selectedSize}` : product.id, // QUAN TRỌNG
            productId: product.id,
            name: product.name ?? "",
            price: product.price ?? 0,
            quantity,
            image: product.image,
            size: selectedSize ?? null,
        });

        router.push("/checkout");
    };





    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View
                style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.iconButton}
                >
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push("/cart")}
                    >
                        <ShoppingCart size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* BODY */}
            <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
                {/* GALLERY */}
                <View style={styles.galleryContainer}>
                    {galleryImages.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(
                                    e.nativeEvent.contentOffset.x /
                                    e.nativeEvent.layoutMeasurement.width
                                );
                                setActiveImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                        >
                            {galleryImages.map((img, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: img }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={[styles.image, styles.noImage]}>
                            <Text>Không có hình ảnh</Text>
                        </View>
                    )}
                </View>

                {/* DOTS (nếu nhiều ảnh sau này) */}
                {galleryImages.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {galleryImages.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    activeImageIndex === index && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* INFO */}
                <View style={styles.infoContainer}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={styles.name}>{product.name}</Text>

                            {/* Rating + Review */}
                            {(product.rating || product.reviewCount) && (
                                <Text style={styles.ratingText}>
                                    ⭐ {product.rating?.toFixed(1) ?? "0.0"} (
                                    {product.reviewCount ?? 0} đánh giá)
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={() =>
                                isFavorite
                                    ? removeFromWishlist(product.id)
                                    : addToWishlist({
                                        id: product.id,
                                        name: product.name ?? "",
                                        price: product.price ?? 0,
                                        image: product.image ?? null
                                    })
                            }
                        >

                            <Heart
                                size={28}
                                color={isFavorite ? COLORS.error : COLORS.subText}
                                fill={isFavorite ? COLORS.error : "transparent"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <Text style={styles.price}>
                        {(product.price ?? 0).toLocaleString("vi-VN")}₫
                    </Text>

                    {/* Badge New / Sale */}
                    <View style={styles.badgeRow}>
                        {product.isNew && (
                            <View style={[styles.badge, styles.badgeNew]}>
                                <Text style={styles.badgeText}>Mới</Text>
                            </View>
                        )}
                        {product.isSale && (
                            <View style={[styles.badge, styles.badgeSale]}>
                                <Text style={styles.badgeText}>Khuyến mãi</Text>
                            </View>
                        )}
                    </View>

                    {/* SIZE */}
                    {sizes.length > 0 && (
                        <View className="section">
                            <Text style={styles.sectionTitle}>Chọn size</Text>
                            <View style={styles.sizeContainer}>
                                {sizes.map((size) => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[
                                            styles.sizeChip,
                                            selectedSize === size && styles.sizeChipSelected,
                                        ]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text
                                            style={[
                                                styles.sizeText,
                                                selectedSize === size && styles.sizeTextSelected,
                                            ]}
                                        >
                                            {size}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* DESCRIPTION */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>
                            {product.description || "Đang cập nhật..."}
                        </Text>
                    </View>

                    {/* SPECIFICATIONS */}
                    {product.specifications &&
                        Object.keys(product.specifications).length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Thông số sản phẩm</Text>
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <View key={key} style={styles.specRow}>
                                        <Text style={styles.specKey}>{key}</Text>
                                        <Text style={styles.specValue}>{String(value)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

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
                                        {p.image ? (
                                            <Image
                                                source={{ uri: p.image }}
                                                style={styles.similarImage}
                                            />
                                        ) : (
                                            <View style={[styles.similarImage, styles.noImage]}>
                                                <Text>Không ảnh</Text>
                                            </View>
                                        )}
                                        <Text numberOfLines={1}>{p.name}</Text>
                                        <Text style={styles.similarPrice}>
                                            {(p.price ?? 0).toLocaleString("vi-VN")}₫
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FOOTER */}
            <View
                style={[
                    styles.footer,
                    { paddingBottom: Math.max(insets.bottom, 20) },
                ]}
            >
                <View style={styles.qtyContainer}>
                    <TouchableOpacity
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                        <Minus />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity((q) => q + 1)}>
                        <Plus />
                    </TouchableOpacity>
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
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    iconButton: { backgroundColor: "#FFF", padding: 8, borderRadius: 20 },
    headerRight: { flexDirection: "row", gap: 10 },

    galleryContainer: { height: IMAGE_HEIGHT, backgroundColor: "#F8F8F8" },
    image: { width, height: IMAGE_HEIGHT },
    noImage: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EEE",
    },

    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
        backgroundColor: "#DDD",
    },
    dotActive: {
        backgroundColor: COLORS.primary,
    },

    infoContainer: {
        padding: 20,
        marginTop: -10,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    name: { fontSize: 22, fontWeight: "700" },
    ratingText: { marginTop: 4, fontSize: 13, color: "#777" },

    price: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.primary,
        marginVertical: 10,
    },

    badgeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeNew: { backgroundColor: "#E8F2FF" },
    badgeSale: { backgroundColor: "#FFE8EC" },
    badgeText: { fontSize: 12, fontWeight: "600", color: "#333" },

    section: { marginVertical: 18 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },

    sizeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    sizeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#CCC",
    },
    sizeChipSelected: { borderColor: COLORS.primary, backgroundColor: "#E8F2FF" },
    sizeText: { fontSize: 14, color: "#000" },
    sizeTextSelected: { color: COLORS.primary, fontWeight: "bold" },

    description: { fontSize: 14, color: "#555" },

    specRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    specKey: { fontSize: 14, fontWeight: "500", color: "#444" },
    specValue: { fontSize: 14, color: "#555", maxWidth: "60%" },

    similarCard: { width: 120, marginRight: 10, marginBottom: 8 },
    similarImage: {
        width: "100%",
        height: 100,
        borderRadius: 8,
        backgroundColor: "#EEE",
        marginBottom: 4,
    },
    similarPrice: { fontWeight: "bold", color: COLORS.primary },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        flexDirection: "row",
        padding: 10,
        gap: 10,
    },
    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
        paddingHorizontal: 10,
        borderRadius: 8,
        flex: 1,
    },
    qtyText: { marginHorizontal: 10, fontSize: 16 },

    addToCartBtn: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
    },
    buyNowBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    buyNowText: { color: "#fff", fontWeight: "700" },
});
