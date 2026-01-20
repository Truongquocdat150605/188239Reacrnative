import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Filter, Search, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAllProducts, type ProductData } from '../../app/services/productService';
import { ProductGrid } from '../../components/ProductGrid';
import { useCart } from '../../lib/CartContext';
import { COLORS } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';

export default function CategoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { addToCart } = useCart();

    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    
    // Filter states
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
    const [showNewOnly, setShowNewOnly] = useState(false);
    const [showSaleOnly, setShowSaleOnly] = useState(false);
    const [minRating, setMinRating] = useState<number>(0);

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

    // 🔥 Load products từ Firebase
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getAllProducts();
                console.log("✅ Loaded products:", data.length);
                // Log ảnh của vài sản phẩm đầu tiên
                data.slice(0, 3).forEach((p, i) => {
                    console.log(`🖼️ Product ${i}: ${p.name} - Image: ${p.image?.substring(0, 50)}...`);
                });
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
    const categoryName = id === 'all' 
        ? 'Tất cả sản phẩm' 
        : getCategoryDisplayName(id as string);

    // Get all unique categories for filter
    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        products.forEach(p => {
            if (p.categoryId) categories.add(p.categoryId);
        });
        return Array.from(categories);
    }, [products]);

    // 🔥 Lọc và Sắp xếp sản phẩm
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            if (id !== 'all' && p.categoryId !== id) return false;
            
            // Filter by category (nếu có chọn trong filter sidebar)
            if (selectedCategories.length > 0) {
                if (!selectedCategories.includes(p.categoryId)) return false;
            }
            
            // Filter by price range
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            
            // Filter by new
            if (showNewOnly && !p.isNew) return false;
            
            // Filter by sale
            if (showSaleOnly && !p.isSale) return false;
            
            // Filter by rating
            if (minRating > 0 && (p.rating || 0) < minRating) return false;
            
            return true;
        });

        // 🔥 LOGIC SẮP XẾP
        switch (sortBy) {
            case 'price_asc':
                return [...result].sort((a, b) => a.price - b.price);
            case 'price_desc':
                return [...result].sort((a, b) => b.price - a.price);
            case 'newest':
                return [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            case 'rating':
                return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'popular':
            default:
                return [...result].sort((a, b) => {
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
    }, [id, sortBy, products, selectedCategories, priceRange, showNewOnly, showSaleOnly, minRating]);

    // Price slider component
    const PriceSlider = () => {
        return (
            <View style={styles.sliderContainer}>
                <Text style={styles.filterSectionTitle}>Khoảng giá</Text>
                <View style={styles.priceRangeDisplay}>
                    <Text style={styles.priceText}>
                        {priceRange[0].toLocaleString('vi-VN')}đ - {priceRange[1].toLocaleString('vi-VN')}đ
                    </Text>
                </View>
                <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { 
                        left: `${(priceRange[0] / 50000000) * 100}%`,
                        width: `${((priceRange[1] - priceRange[0]) / 50000000) * 100}%`
                    }]} />
                </View>
                <View style={styles.priceButtons}>
                    {[
                        { label: 'Dưới 5tr', range: [0, 5000000] },
                        { label: '5-10tr', range: [5000000, 10000000] },
                        { label: '10-20tr', range: [10000000, 20000000] },
                        { label: 'Trên 20tr', range: [20000000, 50000000] }
                    ].map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.priceButton}
                            onPress={() => setPriceRange(btn.range as [number, number])}
                        >
                            <Text style={styles.priceButtonText}>{btn.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    // Handle actions
    const handleProductPress = (product: ProductData) => {
        router.push({
            pathname: "/productdetail",
            params: { id: product.id }
        });
    };

    const handleAddToCart = (product: ProductData) => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image || '',
            size: null
        });
        Alert.alert("Thành công", `Đã thêm "${product.name}" vào giỏ`);
    };

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 50000000]);
        setShowNewOnly(false);
        setShowSaleOnly(false);
        setMinRating(0);
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
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton}>
                        <Search size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterButton}>
                        <Filter size={22} color={COLORS.text} />
                        {selectedCategories.length > 0 || showNewOnly || showSaleOnly || minRating > 0 ? (
                            <View style={styles.filterBadge} />
                        ) : null}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Sidebar Overlay */}
            {showFilter && (
                <TouchableOpacity 
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setShowFilter(false)}
                >
                    <View style={styles.sidebar}>
                        <View style={styles.sidebarHeader}>
                            <Text style={styles.sidebarTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={() => setShowFilter(false)}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterContent}>
                            {/* Category Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterSectionTitle}>Danh mục</Text>
                                <View style={styles.categoryGrid}>
                                    {allCategories.map((category, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.categoryChip,
                                                selectedCategories.includes(category) && styles.categoryChipActive
                                            ]}
                                            onPress={() => handleCategoryToggle(category)}
                                        >
                                            <Text style={[
                                                styles.categoryText,
                                                selectedCategories.includes(category) && styles.categoryTextActive
                                            ]}>
                                                {getCategoryDisplayName(category)}
                                            </Text>
                                            {selectedCategories.includes(category) && (
                                                <Check size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price Range */}
                            <PriceSlider />

                            {/* Other Filters */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterSectionTitle}>Khác</Text>
                                
                                <TouchableOpacity 
                                    style={styles.checkboxItem}
                                    onPress={() => setShowNewOnly(!showNewOnly)}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        showNewOnly && styles.checkboxChecked
                                    ]}>
                                        {showNewOnly && <Check size={12} color="white" />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Sản phẩm mới</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.checkboxItem}
                                    onPress={() => setShowSaleOnly(!showSaleOnly)}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        showSaleOnly && styles.checkboxChecked
                                    ]}>
                                        {showSaleOnly && <Check size={12} color="white" />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Đang giảm giá</Text>
                                </TouchableOpacity>

                                <View style={styles.ratingFilter}>
                                    <Text style={styles.ratingLabel}>Đánh giá từ:</Text>
                                    <View style={styles.ratingButtons}>
                                        {[0, 4, 4.5, 5].map(rating => (
                                            <TouchableOpacity
                                                key={rating}
                                                style={[
                                                    styles.ratingButton,
                                                    minRating === rating && styles.ratingButtonActive
                                                ]}
                                                onPress={() => setMinRating(rating)}
                                            >
                                                <Text style={[
                                                    styles.ratingButtonText,
                                                    minRating === rating && styles.ratingButtonTextActive
                                                ]}>
                                                    {rating === 0 ? 'Tất cả' : `${rating}+`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Filter Actions */}
                        <View style={styles.filterActions}>
                            <TouchableOpacity 
                                style={styles.clearButton}
                                onPress={handleClearFilters}
                            >
                                <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.applyButton}
                                onPress={() => setShowFilter(false)}
                            >
                                <Text style={styles.applyButtonText}>Áp dụng ({filteredProducts.length} SP)</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            {/* Product Count */}
            <View style={styles.productCount}>
                <Text style={styles.countText}>
                    {filteredProducts.length} sản phẩm
                </Text>
            </View>

            {/* Sort Bar */}
            <View style={styles.sortBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
                    {[
                        { key: 'popular', label: 'Phổ biến' },
                        { key: 'newest', label: 'Mới nhất' },
                        { key: 'price_asc', label: 'Giá thấp → cao' },
                        { key: 'price_desc', label: 'Giá cao → thấp' },
                        { key: 'rating', label: 'Đánh giá cao' }
                    ].map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.sortOption,
                                sortBy === option.key && styles.sortOptionActive
                            ]}
                            onPress={() => setSortBy(option.key as SortOption)}
                        >
                            <Text style={[
                                styles.sortOptionText,
                                sortBy === option.key && styles.sortOptionTextActive
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Product Grid */}
            <ScrollView style={styles.productContainer}>
                {filteredProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
                        <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào trong danh mục này</Text>
                        <TouchableOpacity 
                            style={styles.clearButtonFull}
                            onPress={handleClearFilters}
                        >
                            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ProductGrid 
                        title=""
                        products={filteredProducts}
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
        paddingHorizontal: 16,
        paddingBottom: 12,
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
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        padding: 4,
        marginRight: 12,
    },
    filterButton: {
        padding: 4,
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },

    // Product Count
    productCount: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    countText: {
        fontSize: 14,
        color: COLORS.subText,
        fontWeight: '500',
    },

    // Overlay & Sidebar
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        flexDirection: 'row',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        backgroundColor: 'white',
        height: '100%',
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    sidebarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    filterContent: {
        flex: 1,
        padding: 16,
    },

    // Filter Sections
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
    },

    // Category Filter
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: 'white',
    },
    categoryChipActive: {
        backgroundColor: '#E8F4FF',
        borderColor: COLORS.primary,
    },
    categoryText: {
        fontSize: 13,
        color: COLORS.text,
    },
    categoryTextActive: {
        color: COLORS.primary,
        fontWeight: '500',
    },

    // Price Slider
    sliderContainer: {
        marginBottom: 24,
    },
    priceRangeDisplay: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    sliderTrack: {
        height: 4,
        backgroundColor: '#EEE',
        borderRadius: 2,
        position: 'relative',
        marginBottom: 16,
    },
    sliderFill: {
        position: 'absolute',
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    priceButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priceButton: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        alignItems: 'center',
    },
    priceButtonText: {
        fontSize: 13,
        color: COLORS.text,
    },

    // Checkbox
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#DDD',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxLabel: {
        fontSize: 15,
        color: COLORS.text,
    },

    // Rating Filter
    ratingFilter: {
        marginTop: 8,
    },
    ratingLabel: {
        fontSize: 14,
        color: COLORS.subText,
        marginBottom: 8,
    },
    ratingButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingButton: {
        flex: 1,
        paddingVertical: 8,
        backgroundColor: '#F8F9FA',
        borderRadius: 6,
        alignItems: 'center',
    },
    ratingButtonActive: {
        backgroundColor: COLORS.primary,
    },
    ratingButtonText: {
        fontSize: 13,
        color: COLORS.text,
    },
    ratingButtonTextActive: {
        color: 'white',
        fontWeight: '500',
    },

    // Filter Actions
    filterActions: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },

    // Sort Bar
    sortBar: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    sortOptions: {
        flexDirection: 'row',
    },
    sortOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
    },
    sortOptionActive: {
        backgroundColor: COLORS.primary,
    },
    sortOptionText: {
        fontSize: 13,
        color: COLORS.text,
    },
    sortOptionTextActive: {
        color: 'white',
        fontWeight: '500',
    },

    // Product Container
    productContainer: {
        flex: 1,
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: 300,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    clearButtonFull: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
});