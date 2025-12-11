
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, SlidersHorizontal, ChevronDown, Search } from 'lucide-react-native';

import { ProductGrid } from '../../components/ProductGrid';
import { COLORS } from '../../theme/colors';
import { MOCK_PRODUCTS } from '../../constants/mockProducts';
import { MOCK_CATEGORIES } from '../../constants/mockCategories';
import { useCart } from '../../lib/CartContext';
import { Header } from '../../components/Header';

export default function CategoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams(); // id ở đây là 'type' của category (vd: rings, gold)
    const { addToCart, cartCount } = useCart();

    const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

    // Lấy thông tin Category hiện tại
    const currentCategory = MOCK_CATEGORIES.find(c => c.type === id);
    const categoryName = currentCategory ? currentCategory.name : 'Tất cả sản phẩm';

    // Lọc và Sắp xếp sản phẩm
    const displayProducts = useMemo(() => {
        let products = id === 'all' 
            ? MOCK_PRODUCTS 
            : MOCK_PRODUCTS.filter(p => p.category === id);

        switch (sortBy) {
            case 'price_asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price_desc':
                return [...products].sort((a, b) => b.price - a.price);
            default:
                return products; // Mặc định (phổ biến/mới nhất)
        }
    }, [id, sortBy]);

    const handleProductPress = (product: any) => {
        router.push({
            pathname: "/productdetail",
            params: { id: product.id }
        });
    };

    const handleAddToCart = (product: any) => {
        addToCart(product);
    };

    return (
        <View style={styles.container}>
            {/* Custom Header cho trang Category */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <TouchableOpacity onPress={() => console.log('Search')}>
                    <Search size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Filter & Sort Bar */}
            <View style={styles.filterBar}>
                <TouchableOpacity 
                    style={styles.filterItem} 
                    onPress={() => setSortBy(prev => prev === 'price_asc' ? 'price_desc' : 'price_asc')}
                >
                    <Text style={[styles.filterText, sortBy.includes('price') && styles.filterTextActive]}>
                        Giá {sortBy === 'price_asc' ? '↑' : sortBy === 'price_desc' ? '↓' : ''}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.filterItem}>
                    <Text style={styles.filterText}>Bán chạy</Text>
                </TouchableOpacity>
                
                <View style={styles.verticalLine} />

                <TouchableOpacity style={styles.filterItem}>
                    <Text style={styles.filterText}>Bộ lọc</Text>
                    <SlidersHorizontal size={14} color={COLORS.text} style={{marginLeft: 4}} />
                </TouchableOpacity>
            </View>

            {/* Product List */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ProductGrid 
                    title={`${displayProducts.length} sản phẩm`}
                    products={displayProducts}
                    onProductPress={handleProductPress}
                    onAddToCart={handleAddToCart}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, textTransform: 'capitalize' },
    
    // Filter Bar
    filterBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 14,
        color: COLORS.subText,
    },
    filterTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    verticalLine: {
        width: 1,
        height: '60%',
        backgroundColor: '#EEE',
        alignSelf: 'center',
    },

    scrollContent: {
        paddingBottom: 20,
    }
});
