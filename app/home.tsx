
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert

} from 'react-native';
import { useRouter } from "expo-router";
import { MessageCircle } from 'lucide-react-native'; // 🆕 Import Icon chat

// Components
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { BannerCarousel } from '../components/BannerCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductGrid } from '../components/ProductGrid';

import { COLORS } from '../theme/colors';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { useCart } from '../lib/CartContext'; // 🆕 IMPORT CART CONTEXT
import { useNotification } from '../lib/NotificationContext'; // 🆕 IMPORT NOTIFICATION CONTEXT

export default function HomeScreen() {
    const router = useRouter();

    // 🆕 LẤY CONTEXT
    const { addToCart, cartCount } = useCart();
    const { unreadCount } = useNotification();
    
    const [searchText, setSearchText] = useState("");
    
    // 🟢 SỬA LOGIC: Không dùng state local để lọc nữa, mà chuyển trang
    const handleCategoryPress = (category: any) => {
        // Chuyển sang trang danh mục riêng
        router.push({
            pathname: "/category/[id]",
            params: { id: category.type }
        });
    };

    const handleProductPress = (product: any) => {
        router.push({
            pathname: "/productdetail",
            params: { id: product.id }
        });
    };

    const handleAddToCart = (product: any) => {
        addToCart(product);
        Alert.alert("Thành công", `Đã thêm "${product.name}" vào giỏ`);
    };

    // 🆕 LỌC SẢN PHẨM (Chỉ dùng cho search bar ở Home)
    const filteredProducts = MOCK_PRODUCTS.filter(p => {
        const text = searchText.toLowerCase();
        return (
            p.name.toLowerCase().includes(text) ||
            p.specifications?.material?.toLowerCase().includes(text)
        );
    });

    return (
        <SafeAreaView style={styles.safeArea}>

            <Header cartCount={cartCount} notificationCount={unreadCount} />

            <SearchBar
                value={searchText}
                onChangeText={setSearchText}
            />

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
                        selectedCategory={null} // Không highlight ở Home nữa
                    />
                </View>

                {/* PRODUCT GRID - Hiển thị sản phẩm nổi bật hoặc kết quả tìm kiếm */}
                <View style={styles.sectionMargin}>
                    <ProductGrid
                        title={searchText ? "Kết quả tìm kiếm" : "Gợi ý cho bạn"}
                        products={searchText ? filteredProducts : MOCK_PRODUCTS}
                        onProductPress={handleProductPress}
                        onAddToCart={handleAddToCart}
                        // onSeeAllPress={() => handleCategoryPress({ type: 'all' })}
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
