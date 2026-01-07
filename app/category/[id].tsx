import React, { useState, useMemo, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert,
    ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, SlidersHorizontal, Search } from 'lucide-react-native';

import { ProductGrid } from '../../components/ProductGrid';
import { COLORS } from '../../theme/colors';
import { useCart } from '../../lib/CartContext';
import { getAllProducts } from '../../app/services/productService';

// 🔥 ĐƯA HÀM LÊN TRƯỚC (TRƯỚC COMPONENT)
const getCategoryDisplayName = (categoryId: string): string => {
    const nameMap: Record<string, string> = {
        'kids': 'Trẻ Em',
        'bracelets': 'Vòng Tay',
        'necklaces': 'Dây Chuyền',
        'rings': 'Nhẫn',
        'earrings': 'Bông Tai',
        'gold': 'Vàng',
        'silver': 'Bạc',
        'diamonds': 'Kim Cương',
        'pearls': 'Ngọc Trai',
        'luxury': 'Cao Cấp',
        'wedding': 'Cưới',
    };
    
    return nameMap[categoryId] || 
           categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

export default function CategoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { addToCart } = useCart();

    const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState(false);

    // 🔥 Lấy danh sách category từ Firebase
    const categories = useMemo(() => {
        const uniqueTypes = new Set<string>();
        products.forEach(p => {
            if (p.categoryId) uniqueTypes.add(p.categoryId);
        });
        
        return Array.from(uniqueTypes).map(type => ({
            id: type,
            name: getCategoryDisplayName(type), // 🔥 DÙNG HÀM ĐÃ ĐƯỢC KHAI BÁO
            type: type
        }));
    }, [products]);

    // 🔥 Load products từ Firebase
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data);
            } catch (error) {
                console.error("❌ Lỗi load products:", error);
                Alert.alert("Lỗi", "Không thể tải sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Lấy thông tin Category hiện tại
    const currentCategory = categories.find(c => c.type === id);
    const categoryName = currentCategory 
        ? currentCategory.name 
        : id === 'all' ? 'Tất cả sản phẩm' : getCategoryDisplayName(id as string);

    // 🔥 Xử lý sort giá
    const handleSortPrice = () => {
        setSorting(true);
        if (sortBy === 'price_asc') {
            setSortBy('price_desc');
        } else if (sortBy === 'price_desc') {
            setSortBy('popular');
        } else {
            setSortBy('price_asc');
        }
        setTimeout(() => setSorting(false), 100);
    };

    // 🔥 Xử lý sort phổ biến
    const handleSortPopular = () => {
        setSorting(true);
        setSortBy('popular');
        setTimeout(() => setSorting(false), 100);
    };

    // 🔥 Lọc và Sắp xếp sản phẩm từ Firebase
    const displayProducts = useMemo(() => {
        let filteredProducts = [];
        
        if (id === 'all' || !id) {
            filteredProducts = products;
        } else {
            filteredProducts = products.filter(p => p.categoryId === id);
        }

        // 🔥 LOGIC SẮP XẾP
        switch (sortBy) {
            case 'price_asc':
                return [...filteredProducts].sort((a, b) => {
                    const priceA = a.price || 0;
                    const priceB = b.price || 0;
                    return priceA - priceB;
                });
                
            case 'price_desc':
                return [...filteredProducts].sort((a, b) => {
                    const priceA = a.price || 0;
                    const priceB = b.price || 0;
                    return priceB - priceA;
                });
                
            case 'popular':
            default:
                return [...filteredProducts].sort((a, b) => {
                    if (a.isNew && !b.isNew) return -1;
                    if (!a.isNew && b.isNew) return 1;
                    
                    if (a.isSale && !b.isSale) return -1;
                    if (!a.isSale && b.isSale) return 1;
                    
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    if (ratingB !== ratingA) return ratingB - ratingA;
                    
                    const reviewA = a.reviewCount || 0;
                    const reviewB = b.reviewCount || 0;
                    return reviewB - reviewA;
                });
        }
    }, [id, sortBy, products]);

    const handleProductPress = (product: any) => {
        router.push({
            pathname: "/productdetail",
            params: { id: product.id }
        });
    };

    const handleAddToCart = (product: any) => {
        addToCart({
            ...product,
            quantity: 1
        });
        Alert.alert("Thành công", `Đã thêm "${product.name}" vào giỏ`);
    };

    const handleSearchPress = () => {
        router.push('/search-screen');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.subText }}>Đang tải sản phẩm...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <TouchableOpacity onPress={handleSearchPress}>
                    <Search size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* 🔥 Số lượng sản phẩm */}
            <View style={styles.productCount}>
                <Text style={styles.countText}>
                    {displayProducts.length} sản phẩm
                </Text>
            </View>

            {/* 🔥 Filter & Sort Bar */}
            <View style={styles.filterBar}>
                {/* Nút GIÁ */}
                <TouchableOpacity 
                    style={[styles.filterItem, sortBy.includes('price') && styles.filterItemActive]} 
                    onPress={handleSortPrice}
                    activeOpacity={0.6}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.filterText, sortBy.includes('price') && styles.filterTextActive]}>
                            Giá
                        </Text>
                        <View style={{ marginLeft: 4 }}>
                            {sortBy === 'price_asc' && <Text style={{ fontSize: 12, color: COLORS.primary }}>↑</Text>}
                            {sortBy === 'price_desc' && <Text style={{ fontSize: 12, color: COLORS.primary }}>↓</Text>}
                        </View>
                    </View>
                </TouchableOpacity>
                
                {/* Nút PHỔ BIẾN */}
                <TouchableOpacity 
                    style={[styles.filterItem, sortBy === 'popular' && styles.filterItemActive]}
                    onPress={handleSortPopular}
                    activeOpacity={0.6}
                >
                    <Text style={[styles.filterText, sortBy === 'popular' && styles.filterTextActive]}>
                        Phổ biến
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.verticalLine} />

                {/* Nút BỘ LỌC */}
                <TouchableOpacity style={styles.filterItem} activeOpacity={0.6}>
                    <Text style={styles.filterText}>Bộ lọc</Text>
                    <SlidersHorizontal size={14} color={COLORS.text} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            </View>

            {/* 🔥 Indicator khi đang sort */}
            {sorting && (
                <View style={styles.sortingIndicator}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
            )}

            {/* 🔥 Product List */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {displayProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
                        <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào trong danh mục này</Text>
                        <TouchableOpacity 
                            style={styles.backToHomeBtn}
                            onPress={() => router.push('/home')}
                        >
                            <Text style={styles.backToHomeText}>Quay lại trang chủ</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ProductGrid 
                        title={''}
                        products={displayProducts}
                        onProductPress={handleProductPress}
                        onAddToCart={handleAddToCart}
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    backButton: { 
        padding: 4 
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: COLORS.text, 
        textTransform: 'capitalize' 
    },
    productCount: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    countText: {
        fontSize: 14,
        color: COLORS.subText,
        fontWeight: '500',
    },
    // Filter Bar
    filterBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        position: 'relative',
    },
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
    },
    filterItemActive: {
        backgroundColor: '#F8FAFF',
        borderRadius: 8,
        marginHorizontal: 2,
    },
    filterText: {
        fontSize: 14,
        color: COLORS.subText,
        fontWeight: '500',
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
    sortingIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    scrollContent: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: 400,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    backToHomeBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backToHomeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});