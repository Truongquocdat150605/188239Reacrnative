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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../theme/colors";
import { useCart } from "../lib/CartContext";

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToCart,
    } = useCart();

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    /** 🔄 Giữ chọn đúng item còn tồn tại */
    useEffect(() => {
        setSelectedItems((prev) => prev.filter(id => cartItems.some(i => i.id === id)));
    }, [cartItems]);

    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    /** 💰 Tính tổng */
    const selectedTotal = useMemo(() =>
        cartItems.reduce((sum, item) => {
            const key = item.id; // id đã bao gồm size
            const price = item.price ?? 0; // tránh undefined
            const qty = item.quantity ?? 1;

            return selectedItems.includes(key) ? sum + price * qty : sum;
        }, 0),
        [cartItems, selectedItems]
    );


    const formatPrice = (price: number) =>
        price.toLocaleString("vi-VN") + "₫";

    /** 🔘 Chọn từng item */
    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    /** 🔘 Chọn tất cả */
    const toggleSelectAll = () => {
        setSelectedItems(isAllSelected ? [] : cartItems.map(item => item.id));
    };

    /** ❌ Xóa SP đúng với size */
    const handleRemoveItem = (id: string, name: string) => {
        const confirmDelete = () => removeFromCart(id);

        if (Platform.OS === 'web') {
            if (window.confirm(`Xóa "${name}" khỏi giỏ?`)) confirmDelete();
        } else {
            Alert.alert("Xóa sản phẩm", `Xóa "${name}"?`, [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", onPress: confirmDelete, style: "destructive" },
            ]);
        }
    };

    /** 💳 Thanh toán */
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            const msg = "Vui lòng chọn sản phẩm để thanh toán.";
            Platform.OS === 'web' ? alert(msg) : Alert.alert("Thông báo", msg);
            return;
        }

        // 👉 TRUYỀN DANH SÁCH ID MỖI ITEM (HỖ TRỢ CẢ ID + SIZE)
        const encoded = JSON.stringify(selectedItems);

        router.push({
            pathname: "/checkout",
            params: { itemIds: encoded }
        });
    };


    return (
        <View style={styles.container}>
            {/* ===== HEADER ===== */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giỏ Hàng ({cartItems.length})</Text>
                {cartItems.length > 0 ? (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Xóa hết</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 50 }} />}
            </View>

            {/* ===== BODY ===== */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>

                    {cartItems.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyIcon}>🛒</Text>
                            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
                        </View>
                    ) : cartItems.map((item) => {
                        const selected = selectedItems.includes(item.id);

                        return (
                            <View key={item.id} style={styles.itemBox}>
                                {/* Chọn SP */}
                                <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
                                    <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                                        {selected && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                </TouchableOpacity>

                                {/* ẢNH */}
                                <Image
                                    source={
                                        item.image ? { uri: item.image }
                                            : require("../assets/products/placeholder.png")
                                    }
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                />

                                {/* THÔNG TIN */}
                                <View style={styles.itemInfo}>
                                    <Text numberOfLines={2} style={styles.itemName}>
                                        {item.name} {item.size ? `(Size: ${item.size})` : ""}
                                    </Text>
                                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

                                    {/* Ghi chú */}
                                    <TextInput
                                        style={styles.noteInput}
                                        placeholder="Ghi chú cho shop..."
                                        value={notes[item.id] || ""}
                                        onChangeText={(text) => setNotes(prev => ({ ...prev, [item.id]: text }))}
                                    />

                                    {/* Số lượng */}
                                    <View style={styles.qtyRow}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() =>
                                                item.quantity > 1
                                                    ? updateQuantity(item.id, item.quantity - 1)
                                                    : handleRemoveItem(item.id, item.name)
                                            }
                                        >
                                            <Text style={styles.qtyTextBtn}>-</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.qtyNumber}>{item.quantity}</Text>

                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Text style={styles.qtyTextBtn}>+</Text>
                                        </TouchableOpacity>

                                        {/* Xóa */}
                                        <TouchableOpacity onPress={() => handleRemoveItem(item.id, item.name)}>
                                            <Text style={styles.removeText}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ===== FOOTER ===== */}
            {cartItems.length > 0 && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                    <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
                        <View style={[styles.checkbox, isAllSelected && styles.checkboxChecked]}>
                            {isAllSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.selectAllText}>Chọn tất cả</Text>
                    </TouchableOpacity>

                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>Tổng:</Text>
                        <Text style={styles.totalAmount}>{formatPrice(selectedTotal)}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.checkoutBtn, selectedItems.length === 0 && styles.checkoutDisabled]}
                        disabled={selectedItems.length === 0}
                        onPress={handleCheckout}
                    >
                        <Text style={styles.checkoutText}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

/* ========== STYLE ========== */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "white", paddingHorizontal: 15, paddingBottom: 10,
        borderBottomWidth: 1, borderColor: COLORS.lightBackground
    },
    backIcon: { fontSize: 22, color: COLORS.text },
    headerTitle: { fontSize: 18, fontWeight: "bold" },
    clearText: { color: COLORS.error, fontWeight: "600" },

    emptyBox: { alignItems: "center", marginTop: 120 },
    emptyIcon: { fontSize: 60 },
    emptyText: { marginTop: 10, fontSize: 16, color: COLORS.subText },

    scrollContainer: { padding: 12 },
    itemBox: {
        flexDirection: "row", backgroundColor: "white",
        padding: 10, borderRadius: 10, marginBottom: 12,
        borderWidth: 1, borderColor: COLORS.lightBackground
    },
    checkbox: {
        width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: COLORS.subText,
        justifyContent: "center", alignItems: "center", marginRight: 6,
    },
    checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    checkmark: { color: "white", fontWeight: "bold" },

    itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#EEE", marginRight: 10 },
    itemInfo: { flex: 1 },

    itemName: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    itemPrice: { fontSize: 15, fontWeight: "bold", color: COLORS.primary, marginBottom: 6 },

    noteInput: {
        borderWidth: 1, borderColor: "#DDD", borderRadius: 6,
        padding: 6, marginBottom: 8, backgroundColor: "#FAFAFA", fontSize: 12
    },

    qtyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    qtyBtn: { width: 28, height: 28, justifyContent: "center", alignItems: "center", borderRadius: 6, backgroundColor: "#EEE" },
    qtyTextBtn: { fontWeight: "bold", fontSize: 16 },
    qtyNumber: { marginHorizontal: 10, fontSize: 14, fontWeight: "700" },
    removeText: { color: COLORS.error, fontWeight: "600" },

    footer: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "white", padding: 12,
        borderTopWidth: 1, borderColor: COLORS.lightBackground
    },
    selectAllRow: { flexDirection: "row", alignItems: "center" },
    selectAllText: { marginLeft: 8, fontSize: 14 },

    totalBox: { flex: 1, alignItems: "flex-end", marginRight: 10 },
    totalLabel: { fontSize: 12, color: COLORS.subText },
    totalAmount: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },

    checkoutBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12, paddingHorizontal: 20,
        borderRadius: 8,
    },
    checkoutDisabled: { backgroundColor: "#AAA" },
    checkoutText: { color: "white", fontSize: 15, fontWeight: "bold" },
});
