import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    TextInput,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
// Thư viện để xử lý tai thỏ / home indicator
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Giữ nguyên import của bạn
import { COLORS } from "../theme/colors";
// import { useCart } from "../lib/CartContext"; // Tạm thời comment nếu hook này chưa hoạt động
import { MOCK_PRODUCTS } from "../constants/mockProducts";

type CartItem = {
    id: string;
    name: string;
    price: number;
    imageUri: any;
    quantity: number;
};

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets(); // Lấy khoảng cách an toàn

    // --- LOGIC GIỎ HÀNG (Dùng state nội bộ để đảm bảo nút bấm hoạt động) ---
    // Khởi tạo giỏ hàng giả lập từ MOCK_PRODUCTS để test
    const [cartItems, setCartItems] = useState<CartItem[]>([
        { ...MOCK_PRODUCTS[0], quantity: 1, imageUri: MOCK_PRODUCTS[0].imageUri },
        { ...MOCK_PRODUCTS[1], quantity: 2, imageUri: MOCK_PRODUCTS[1].imageUri },
    ]);

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Tự động chọn tất cả khi vào
    useEffect(() => {
        // Nếu muốn mặc định chọn hết:
        // setSelectedItems(cartItems.map((item) => item.id));
    }, []);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN (Hoạt động trực tiếp trên state) ---
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2000);
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        setCartItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
        ));
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    };

    const clearCart = () => {
        setCartItems([]);
        setSelectedItems([]);
    };

    const addToCart = (product: any) => {
        setCartItems(prev => {
            const exist = prev.find(i => i.id === product.id);
            if (exist) {
                return prev.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // --- TÍNH TOÁN ---
    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    const selectedTotal = useMemo(() =>
        cartItems.reduce((sum, item) => {
            if (!selectedItems.includes(item.id)) return sum;
            return sum + item.price * item.quantity;
        }, 0),
        [cartItems, selectedItems]
    );

    const formatPrice = (price: number) => {
        return price.toLocaleString("vi-VN") + "₫";
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item.id));
        }
    };

    const handleRemoveItem = (id: string, name: string) => {
        Alert.alert(
            "Xóa sản phẩm",
            `Bạn có chắc muốn xóa "${name}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => {
                        removeFromCart(id);
                        showToast(`Đã xóa "${name}"`);
                    },
                },
            ]
        );
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn sản phẩm để thanh toán.");
            return;
        }
        Alert.alert("Thanh toán thành công", `Tổng tiền: ${formatPrice(selectedTotal)}`);
    };

    const handleClearCart = () => {
        if (cartItems.length === 0) return;
        Alert.alert("Xóa giỏ hàng", "Bạn có chắc muốn xóa tất cả?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa tất cả",
                style: "destructive",
                onPress: () => {
                    clearCart();
                    showToast("Đã xóa toàn bộ giỏ hàng");
                },
            },
        ]);
    };

    // Lọc sản phẩm gợi ý
    const suggestedProducts = MOCK_PRODUCTS.filter(
        (p) => !cartItems.some((item) => item.id === p.id)
    ).slice(0, 5);

    const handleAddSuggested = (product: any) => {
        addToCart(product);
        showToast(`Đã thêm "${product.name}"`);
    };

    const getImageSource = (source: any) => {
        if (!source) return { uri: 'https://via.placeholder.com/100' };
        if (typeof source === 'number') return source;
        if (typeof source === 'string') return { uri: source };
        return source;
    };

    return (
        <View style={styles.container}>
            {/* HEADER: Dùng padding insets.top để tránh bị che */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ Hàng ({cartItems.length})</Text>
                {cartItems.length > 0 ? (
                    <TouchableOpacity onPress={handleClearCart}>
                        <Text style={styles.clearText}>Xóa hết</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 50 }} />
                )}
            </View>

            {/* MAIN CONTENT */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.content}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {cartItems.length === 0 ? (
                            <View style={styles.emptyCart}>
                                <Text style={styles.emptyCartIcon}>🛒</Text>
                                <Text style={styles.emptyCartTitle}>Giỏ hàng trống</Text>
                                <TouchableOpacity
                                    style={styles.shopButton}
                                    onPress={() => addToCart(MOCK_PRODUCTS[0])}
                                >
                                    <Text style={styles.shopButtonText}>Thêm sản phẩm mẫu</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {cartItems.map((item) => {
                                    const isSelected = selectedItems.includes(item.id);
                                    return (
                                        <View key={item.id} style={styles.itemContainer}>
                                            <TouchableOpacity
                                                style={styles.checkboxWrapper}
                                                onPress={() => toggleSelectItem(item.id)}
                                            >
                                                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                                                    {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                                                </View>
                                            </TouchableOpacity>

                                            <Image
                                                source={getImageSource(item.imageUri)}
                                                style={styles.itemImage}
                                                resizeMode="contain"
                                            />

                                            <View style={styles.itemInfo}>
                                                <Text numberOfLines={2} style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

                                                <TextInput
                                                    style={styles.noteInput}
                                                    placeholder="Ghi chú..."
                                                    value={notes[item.id] || ""}
                                                    onChangeText={(text) =>
                                                        setNotes((prev) => ({ ...prev, [item.id]: text }))
                                                    }
                                                />

                                                <View style={styles.quantityRow}>
                                                    <View style={styles.quantityContainer}>
                                                        <TouchableOpacity
                                                            style={styles.quantityButton}
                                                            onPress={() => {
                                                                if (item.quantity > 1) {
                                                                    updateQuantity(item.id, item.quantity - 1);
                                                                } else {
                                                                    handleRemoveItem(item.id, item.name);
                                                                }
                                                            }}
                                                        >
                                                            <Text style={styles.quantityButtonText}>-</Text>
                                                        </TouchableOpacity>
                                                        <Text style={styles.quantityText}>{item.quantity}</Text>
                                                        <TouchableOpacity
                                                            style={styles.quantityButton}
                                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Text style={styles.quantityButtonText}>+</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <TouchableOpacity onPress={() => handleRemoveItem(item.id, item.name)}>
                                                        <Text style={styles.removeText}>Xóa</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}

                                {suggestedProducts.length > 0 && (
                                    <View style={styles.suggestSection}>
                                        <Text style={styles.suggestTitle}>Có thể bạn cũng thích</Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.horizontalScrollContent}
                                        >
                                            {suggestedProducts.map((p) => (
                                                <View key={p.id} style={styles.suggestCard}>
                                                    <Image 
                                                        source={getImageSource(p.imageUri)} 
                                                        style={styles.suggestImage}
                                                        resizeMode="cover"
                                                    />
                                                    <Text numberOfLines={2} style={styles.suggestName}>{p.name}</Text>
                                                    <Text style={styles.suggestPrice}>{formatPrice(p.price)}</Text>
                                                    <TouchableOpacity
                                                        style={styles.suggestBtn}
                                                        onPress={() => handleAddSuggested(p)}
                                                    >
                                                        <Text style={styles.suggestBtnText}>+ Thêm</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            {/* FOOTER: Dùng padding insets.bottom để tránh bị che */}
            {cartItems.length > 0 && (
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <View style={styles.footerTopRow}>
                        <TouchableOpacity style={styles.footerSelectAll} onPress={toggleSelectAll}>
                            <View style={[styles.checkbox, isAllSelected && styles.checkboxChecked]}>
                                {isAllSelected && <Text style={styles.checkboxTick}>✓</Text>}
                            </View>
                            <Text style={styles.footerSelectAllText}>Tất cả ({cartItems.length})</Text>
                        </TouchableOpacity>

                        <View style={styles.footerTotal}>
                            <Text style={styles.footerTotalLabel}>Tổng:</Text>
                            <Text style={styles.footerTotalAmount}>{formatPrice(selectedTotal)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.checkoutBtn,
                            selectedItems.length === 0 && styles.checkoutBtnDisabled,
                        ]}
                        disabled={selectedItems.length === 0}
                        onPress={handleCheckout}
                    >
                        <Text style={styles.checkoutText}>
                            Mua ngay ({selectedItems.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* TOAST */}
            {toastMessage && (
                <View style={[styles.toast, { bottom: 120 + insets.bottom }]}>
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightBackground,
        backgroundColor: "white",
        zIndex: 10,
    },
    backButton: { padding: 4 },
    backIcon: { fontSize: 22, color: COLORS.text },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
    clearText: { color: COLORS.error, fontWeight: "600" },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 20 },
    horizontalScrollContent: { paddingHorizontal: 10 },
    // ITEM
    itemContainer: {
        flexDirection: "row",
        marginBottom: 12,
        borderRadius: 10,
        padding: 10,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: COLORS.lightBackground,
    },
    checkboxWrapper: { justifyContent: "center", marginRight: 6 },
    checkbox: {
        width: 22, height: 22, borderRadius: 4, borderWidth: 1.5,
        borderColor: COLORS.subText, alignItems: "center", justifyContent: "center",
        backgroundColor: "white",
    },
    checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    checkboxTick: { color: "white", fontSize: 16, fontWeight: "bold" },
    itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10, backgroundColor: '#f0f0f0' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 4 },
    itemPrice: { fontSize: 15, fontWeight: "bold", color: COLORS.primary, marginBottom: 6 },
    noteInput: {
        borderWidth: 1, borderColor: COLORS.lightBackground, borderRadius: 6,
        paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, marginBottom: 8,
        backgroundColor: "#FAFAFA",
    },
    quantityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    quantityContainer: { flexDirection: "row", alignItems: "center" },
    quantityButton: {
        width: 28, height: 28, borderRadius: 14, borderWidth: 1,
        borderColor: COLORS.lightBackground, justifyContent: "center", alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    quantityButtonText: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
    quantityText: { marginHorizontal: 12, fontSize: 14, fontWeight: "600" },
    removeText: { fontSize: 13, color: COLORS.error, fontWeight: "600" },
    
    // EMPTY & SUGGEST
    emptyCart: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
    emptyCartIcon: { fontSize: 60, marginBottom: 20 },
    emptyCartTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.text, marginBottom: 8 },
    shopButton: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8 },
    shopButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
    suggestSection: { marginTop: 20, marginBottom: 20 },
    suggestTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.text, marginBottom: 10, marginLeft: 4 },
    suggestCard: { width: 140, marginRight: 10, borderRadius: 10, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.lightBackground, padding: 8 },
    suggestImage: { width: "100%", height: 80, borderRadius: 8, marginBottom: 6, backgroundColor: '#f0f0f0' },
    suggestName: { fontSize: 12, fontWeight: "600", color: COLORS.text, marginBottom: 4 },
    suggestPrice: { fontSize: 13, fontWeight: "bold", color: COLORS.primary, marginBottom: 6 },
    suggestBtn: { backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 6, alignItems: "center" },
    suggestBtnText: { color: "white", fontSize: 12, fontWeight: "600" },

    // FOOTER
    footer: {
        backgroundColor: "white",
        borderTopWidth: 1, borderTopColor: COLORS.lightBackground,
        paddingHorizontal: 12, paddingTop: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 3 },
            android: { elevation: 8 },
            web: { boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }
        }),
    },
    footerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    footerSelectAll: { flexDirection: "row", alignItems: "center" },
    footerSelectAllText: { marginLeft: 8, fontSize: 14, color: COLORS.text },
    footerTotal: { alignItems: "flex-end" },
    footerTotalLabel: { fontSize: 12, color: COLORS.subText },
    footerTotalAmount: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
    checkoutBtn: { marginTop: 4, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
    checkoutBtnDisabled: { backgroundColor: "#CCCCCC" },
    checkoutText: { color: "white", fontSize: 15, fontWeight: "bold" },
    toast: {
        position: "absolute", alignSelf: "center", backgroundColor: "#000000CC",
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, zIndex: 1000,
    },
    toastText: { color: "white", fontSize: 13 },
});