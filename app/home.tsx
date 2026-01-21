import { useRouter } from "expo-router";
import { MessageCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Components
import { BannerCarousel } from '../components/BannerCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';
import { SearchBar } from '../components/SearchBar';

import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';
import { COLORS } from '../theme/colors';

// ✅ SERVICE FIRESTORE (đường dẫn của bạn đã đúng)
import { getAllProducts, ProductData } from '../app/services/productService';

export default function HomeScreen() {
    const router = useRouter();

    const { addToCart, cartCount } = useCart();
    const { unreadCount } = useNotification();

    const [searchText, setSearchText] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ LOAD PRODUCTS TỪ FIRESTORE
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data);
            } catch (error) {
                console.log("Lỗi load products:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const handleCategoryPress = (category: any) => {
        router.push({ pathname: "/category/[id]", params: { id: category.type } });

    };

    const handleProductPress = (product: any) => {
        router.push({ pathname: "/productdetail", params: { id: product.id } });

    };

    const handleAddToCart = (p: ProductData) => {
        addToCart({
            productId: p.id,
            name: p.name ?? "",
            price: p.price ?? 0,
            image: p.image ?? null,
            size: null, // sản phẩm không có size -> null
        });

        Alert.alert("Thành công", `Đã thêm "${p.name}" vào giỏ`);
    };


    // ✅ SEARCH TRÊN DATA FIRESTORE
    const filteredProducts = products.filter(p => {
        const text = searchText.toLowerCase();
        return (
            p.name?.toLowerCase().includes(text) ||
            p.specifications?.material?.toLowerCase().includes(text)
        );
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header title=" Luxe Jewelry " />

            <SearchBar
                value={searchText}
                onChangeText={setSearchText}
            />

            {loading && (
                <View style={{ padding: 20 }}>
                    <Text>Đang tải sản phẩm...</Text>
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sectionMargin}>
                    <BannerCarousel />
                </View>

                <View style={styles.sectionMargin}>
                    <CategoryGrid
                        onCategoryPress={handleCategoryPress}
                        selectedCategory={null}
                    />
                </View>

                <View style={styles.sectionMargin}>
                    <ProductGrid
                        title={searchText ? "Kết quả tìm kiếm" : "Gợi ý cho bạn"}
                        products={searchText ? filteredProducts : products}
                        onProductPress={handleProductPress}
                        onAddToCart={handleAddToCart}
                    />
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.chatButton}
                
                onPress={() => router.push('/chat')}
                activeOpacity={0.8}
            >
                <MessageCircle size={28} color="white" fill="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1
    },
    contentContainer: {
        paddingBottom: 40
    },
    sectionMargin: {
        marginBottom: 10
    },
    chatButton: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 100,
        
    }
});
