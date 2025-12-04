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

// Components
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { BannerCarousel } from '../components/BannerCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductGrid } from '../components/ProductGrid';

import { COLORS } from '../theme/colors';
import { MOCK_PRODUCTS } from '../constants/mockProducts';
import { useCart } from '../lib/CartContext'; // 🆕 IMPORT CART CONTEXT

export default function HomeScreen() {
    const router = useRouter();

    // 🆕 LẤY CART CONTEXT
    const { addToCart, cartCount } = useCart();
    const [searchText, setSearchText] = useState("");
    // State lưu danh mục người dùng chọn
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleLogout = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    onPress: () => {
                        console.log("[LOGOUT] Đang xóa session và đăng xuất...");
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    // Khi nhấn vào danh mục
    const handleCategoryPress = (category: any) => {
        console.log("Selected:", category.name);
        // Nếu đang chọn cùng category thì bỏ chọn
        if (selectedCategory === category.type) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category.type);
        }
    };

    const handleProductPress = (product: any) => {
        console.log('📦 Product selected:', product.name);
        // Sau này sẽ navigate đến product detail
        // router.push(`/product/${product.id}`);
    };

    // 🆕 UPDATE: Dùng cart context để thêm vào giỏ hàng thật
    const handleAddToCart = (product: any) => {
    addToCart(product);

    Alert.alert(
        "🎉 Thêm vào giỏ hàng thành công!",
        `Đã thêm "${product.name}" vào giỏ hàng`,
        [
            { text: "Tiếp tục mua sắm", style: "cancel" },
            { text: "Xem giỏ hàng", onPress: () => router.push('/cart') }
        ]
    );
};


    // Hàm đi đến giỏ hàng
    const goToCart = () => {
        router.push('/cart');
    };

    // Hàm clear filter
    const clearFilter = () => {
        setSelectedCategory(null);
    };
    // 🆕 STATE TÌM KIẾM

    // 🆕 LỌC SẢN PHẨM
    const filteredProducts = MOCK_PRODUCTS.filter(p => {
        const text = searchText.toLowerCase();

        return (
            p.name.toLowerCase().includes(text) ||
            p.specifications?.material?.toLowerCase().includes(text) ||
            p.category.toLowerCase().includes(text)
        );
    });


    return (
        <SafeAreaView style={styles.safeArea}>

            {/* 🆕 TRUYỀN CART COUNT THẬT */}
            <Header cartCount={cartCount} />

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
                    {/* 🆕 TRUYỀN SELECTED CATEGORY ĐỂ HIGHLIGHT */}
                    <CategoryGrid
                        onCategoryPress={handleCategoryPress}
                        selectedCategory={selectedCategory}
                    />
                </View>

                {/* Filter Indicator */}
                {selectedCategory && (
                    <View style={styles.filterIndicator}>
                        <View style={styles.filterInfo}>
                            <Text style={styles.filterText}>
                                Đang xem: <Text style={styles.filterCategory}>
                                    {selectedCategory === 'rings' ? 'Nhẫn' :
                                        selectedCategory === 'bracelets' ? 'Vòng tay' :
                                            selectedCategory === 'necklaces' ? 'Dây chuyền' :
                                                selectedCategory === 'diamonds' ? 'Kim cương' :
                                                    selectedCategory === 'gold' ? 'Vàng 24K' :
                                                        selectedCategory === 'pearls' ? 'Ngọc trai' :
                                                            selectedCategory === 'wedding' ? 'Nhẫn cưới' :
                                                                selectedCategory === 'luxury' ? 'Cao cấp' :
                                                                    selectedCategory}
                                </Text>
                            </Text>
                            <Text style={styles.filterCount}>
                                {MOCK_PRODUCTS.filter(p => p.category === selectedCategory).length} sản phẩm
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.clearFilterButton}
                            onPress={clearFilter}
                        >
                            <Text style={styles.clearFilterText}>✕ Hiển thị tất cả</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* PRODUCT GRID */}
                <View style={styles.sectionMargin}>
                    <ProductGrid
                        title={
                            searchText
                                ? `Kết quả tìm kiếm (${filteredProducts.length})`
                                : selectedCategory
                                    ? "Sản phẩm theo danh mục"
                                    : "Sản phẩm nổi bật"
                        }
                        products={
                            searchText
                                ? filteredProducts
                                : selectedCategory
                                    ? MOCK_PRODUCTS.filter(p => p.category === selectedCategory)
                                    : MOCK_PRODUCTS
                        }
                        onProductPress={handleProductPress}
                        onAddToCart={handleAddToCart}
                        onSeeAllPress={clearFilter}
                    />

                </View>

                {/* 🆕 CART BUTTON */}
                {/* <TouchableOpacity 
                    style={styles.cartButton}
                    onPress={goToCart}
                >
                    <Text style={styles.cartButtonIcon}>🛒</Text>
                    <View style={styles.cartButtonInfo}>
                        <Text style={styles.cartButtonTitle}>Xem giỏ hàng</Text>
                        <Text style={styles.cartButtonCount}>{cartCount} sản phẩm</Text>
                    </View>
                    <Text style={styles.cartButtonArrow}>→</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
                </TouchableOpacity>

            </ScrollView>
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
    // Filter Indicator
    filterIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.lightBackground,
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    filterInfo: {
        flex: 1,
    },
    filterText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
    },
    filterCategory: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    filterCount: {
        fontSize: 12,
        color: COLORS.subText,
    },
    clearFilterButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    clearFilterText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    // Cart Button
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
    },
    cartButtonIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    cartButtonInfo: {
        flex: 1,
    },
    cartButtonTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cartButtonCount: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
    },
    cartButtonArrow: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    // Logout Button
    logoutButton: {
        backgroundColor: '#FF3B30',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 30,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});