
// components/CategoryGrid.tsx

import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    Dimensions,
    useWindowDimensions
} from 'react-native';
import { MOCK_CATEGORIES } from '../constants/mockCategories';
import { COLORS } from '../theme/colors';

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

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
    onCategoryPress = (category) => console.log('Category pressed:', category.name),
    selectedCategory = null 
}) => {
    const { width } = useWindowDimensions();

    // 🟢 ALIGNMENT LOGIC (Đã sửa để khớp hoàn toàn với Banner)
    // Banner rộng ~92% hoặc max 1200px.
    // Để thẳng hàng, ta cần padding sao cho nội dung bắt đầu từ điểm đó.
    
    const maxGridWidth = 1200;
    
    // Nếu màn hình lớn hơn 1200px (Web PC)
    // Padding = (Màn hình - 1200) / 2
    // Nếu màn hình nhỏ (Mobile/Tablet)
    // Padding mặc định = 15px (giống margin của Banner mobile)
    
    const containerPadding = width > maxGridWidth 
        ? (width - maxGridWidth) / 2 
        : 15; 

    return (
        <View style={styles.container}>
            <View style={[styles.sectionHeader, { paddingHorizontal: containerPadding }]}>
                <Text style={styles.sectionTitle}>Danh Mục</Text>
                <TouchableOpacity onPress={() => onCategoryPress({ 
                    id: 'all', 
                    name: 'Tất cả', 
                    icon: '📦', 
                    count: 0, 
                    type: 'all' 
                } as Category)}>
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
                {MOCK_CATEGORIES.map((category) => (
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
