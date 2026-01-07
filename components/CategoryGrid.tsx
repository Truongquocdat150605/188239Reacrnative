import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions
} from 'react-native';
import { COLORS } from '../theme/colors';
import { getAllProducts } from '../app/services/productService'; // 🔥 THÊM

type Category = {
    id: string;
    name: string;
    icon: string;
    count: number;
    type: string;
};

type CategoryCardProps = {
    category: Category;
    onPress: (category: Category) => void;
    isSelected?: boolean;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, isSelected = false }) => {
    return (
        <TouchableOpacity
            style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected
            ]}
            onPress={() => onPress(category)}
            activeOpacity={0.8}
        >
            <View style={[
                styles.iconContainer,
                isSelected && styles.iconContainerSelected
            ]}>
                <Text style={styles.iconText}>{category.icon}</Text>
            </View>
            <Text style={[
                styles.categoryName,
                isSelected && styles.categoryNameSelected
            ]} numberOfLines={1}>
                {category.name}
            </Text>
            <Text style={styles.productCount}>
                {category.count} sản phẩm
            </Text>
        </TouchableOpacity>
    );
};

type CategoryGridProps = {
    onCategoryPress?: (category: Category) => void;
    selectedCategory?: string | null;
};

// 🔥 ICON MAPPING cho categories
const CATEGORY_ICONS: Record<string, string> = {
    'rings': '💍',
    'necklaces': '📿',
    'bracelets': '🪬',
    'earrings': '👂',
    'gold': '🟡',
    'silver': '⚪',
    'platinum': '🔘',
    'diamonds': '💎',
    'pearl': '🫧',
    'luxury': '👑',
    'men': '👨',
    'women': '👩',
    'couple': '👫',
    'gift': '🎁',
    'new': '🆕',
    'sale': '🛒',
    // Thêm các icon khác nếu cần
};

// 🔥 Hàm lấy icon tự động
const getCategoryIcon = (categoryName: string): string => {
    const lowerName = categoryName.toLowerCase();

    // Kiểm tra từ khóa
    if (lowerName.includes('nhẫn') || lowerName.includes('ring')) return '💍';
    if (lowerName.includes('dây chuyền') || lowerName.includes('necklace')) return '📿';
    if (lowerName.includes('vòng tay') || lowerName.includes('bracelet')) return '🪬';
    if (lowerName.includes('bông tai') || lowerName.includes('earring')) return '👂';
    if (lowerName.includes('vàng')) return '🟡';
    if (lowerName.includes('bạc')) return '⚪';
    if (lowerName.includes('kim cương') || lowerName.includes('diamond')) return '💎';
    if (lowerName.includes('ngọc trai') || lowerName.includes('pearl')) return '🫧';
    if (lowerName.includes('nam')) return '👨';
    if (lowerName.includes('nữ')) return '👩';
    if (lowerName.includes('đôi') || lowerName.includes('couple')) return '👫';
    if (lowerName.includes('quà') || lowerName.includes('gift')) return '🎁';

    // Mặc định
    return CATEGORY_ICONS[categoryName] || '📦';
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
    onCategoryPress = (category) => console.log('Category pressed:', category.name),
    selectedCategory = null
}) => {
    const { width } = useWindowDimensions();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    // 🔥 Hàm chuyển categoryId thành tên hiển thị
    const getDisplayNameFromCategoryId = (categoryId: string): string => {
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
            // Thêm các mapping khác
        };

        return nameMap[categoryId] ||
            categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    };

    // 🔥 Sửa hàm getCategoryIcon
    const getCategoryIcon = (categoryId: string): string => {
        const iconMap: Record<string, string> = {
            'kids': '👶',
            'bracelets': '🪬',
            'necklaces': '📿',
            'rings': '💍',
            'earrings': '👂',
            'gold': '🟡',
            'silver': '⚪',
            'diamonds': '💎',
            'pearls': '🫧',
            'luxury': '👑',
            'wedding': '💒',
            // Thêm các icon khác
        };

        return iconMap[categoryId] || '📦';
    };
    // 🔥 Lấy categories từ Firebase
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const products = await getAllProducts();
                console.log("🔥 Products từ Firebase:", products.length, "sản phẩm");

                // 🔥 SỬA: DÙNG categoryId THAY VÌ type
                const categoryMap = new Map<string, number>();

                products.forEach(product => {
                    // 🔥 QUAN TRỌNG: Dùng categoryId thay vì type
                    const categoryId = product.categoryId || product.type;
                    if (categoryId) {
                        const count = categoryMap.get(categoryId) || 0;
                        categoryMap.set(categoryId, count + 1);
                    }
                });

                console.log("🔥 Categories found:", Array.from(categoryMap.entries()));

                // 🔥 Tạm thời dùng categoryId làm type
                const categoryArray: Category[] = Array.from(categoryMap.entries()).map(([categoryId, count]) => {
                    // Tạo tên hiển thị từ categoryId
                    const displayName = getDisplayNameFromCategoryId(categoryId);
                    return {
                        id: categoryId,
                        name: displayName,
                        icon: getCategoryIcon(categoryId), // Sửa hàm này
                        count: count,
                        type: categoryId // 🔥 Dùng categoryId làm type
                    };
                });

                categoryArray.sort((a, b) => b.count - a.count);
                setCategories(categoryArray);

            } catch (error) {
                console.error("❌ Lỗi load categories:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const maxGridWidth = 1200;
    const containerPadding = width > maxGridWidth
        ? (width - maxGridWidth) / 2
        : 15;

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={[styles.sectionHeader, { paddingHorizontal: containerPadding }]}>
                    <Text style={styles.sectionTitle}>Danh Mục</Text>
                </View>
                <View style={{ paddingHorizontal: containerPadding }}>
                    <Text>Đang tải danh mục...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.sectionHeader, { paddingHorizontal: containerPadding }]}>
                <Text style={styles.sectionTitle}>Danh Mục</Text>
                <TouchableOpacity onPress={() => onCategoryPress({
                    id: 'all',
                    name: 'Tất cả',
                    icon: '📦',
                    count: categories.reduce((sum, cat) => sum + cat.count, 0),
                    type: 'all'
                })}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.categoriesContainer,
                    { paddingHorizontal: containerPadding }
                ]}
            >
                {/* 🔥 Hiển thị "Tất cả" đầu tiên */}
                <CategoryCard
                    key="all"
                    category={{
                        id: 'all',
                        name: 'Tất cả',
                        icon: '📦',
                        count: categories.reduce((sum, cat) => sum + cat.count, 0),
                        type: 'all'
                    }}
                    onPress={onCategoryPress}
                    isSelected={selectedCategory === 'all'}
                />

                {/* 🔥 Hiển thị categories từ Firebase */}
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onPress={onCategoryPress}
                        isSelected={selectedCategory === category.type}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
        backgroundColor: COLORS.background,
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
        color: COLORS.text,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    categoriesContainer: {
        paddingVertical: 5,
    },
    categoryCard: {
        width: 80,
        alignItems: 'center',
        marginRight: 20,
    },
    categoryCardSelected: {
        transform: [{ scale: 1.05 }],
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.lightBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    iconContainerSelected: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    iconText: {
        fontSize: 24,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    categoryNameSelected: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    productCount: {
        fontSize: 10,
        color: COLORS.subText,
        textAlign: 'center',
    },
});