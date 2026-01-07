import React, { useState, useMemo ,useEffect} from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Image, Alert, Platform, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { API_BASE } from "../app/services/config";
import * as Linking from "expo-linking";
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext';
import { ArrowLeft, MapPin, Truck, CheckCircle, Wallet } from 'lucide-react-native';
import { db } from "../app/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../lib/AuthContext';

// Nếu có AuthContext, dùng:
// import { useAuth } from '../lib/AuthContext';
// const { user } = useAuth();
// const USER_ID = user?.uid || "test-user";

// const USER_ID = "test-user";
// const { user } = useAuth();


export default function CheckoutScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const { cartItems, removeFromCart } = useCart();
    const { addNotification } = useNotification();

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedItemIds = useMemo(() => {
        try {
            return params.itemIds ? JSON.parse(params.itemIds as string) : [];
        } catch {
            return [];
        }
    }, [params.itemIds]);

    const checkoutItems = cartItems.filter(item => {
        return selectedItemIds.some((id: string) =>
            id === item.id || id === `${item.id}` || id === `${item.id}${item.size ? "-" + item.size : ""}`
        );
    });
    useEffect(() => {
        console.log("🔥 AUTH USER:", user);
        console.log("🔥 AUTH UID:", user?.uid);
    }, [user]);
    const subtotal = checkoutItems.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + price * quantity;
    }, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "₫";
    if (!user?.uid) {
        return (
            <View style={styles.empty}>
                <Text>Bạn cần đăng nhập để đặt hàng</Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text style={{ color: COLORS.primary }}>Đi tới đăng nhập</Text>
                </TouchableOpacity>
            </View>
        );
    }


    // 🔥 LƯU ĐƠN HÀNG LÊN FIREBASE - Collection "orders"
    const handlePlaceOrder = async () => {
        if (checkoutItems.length === 0) {
            Alert.alert("Lỗi", "Không có sản phẩm nào!");
            return;
        }

        setIsProcessing(true);
        try {
            // 🔥 KIỂM TRA VÀ LÀM SẠCH DỮ LIỆU
            const cleanedItems = checkoutItems.map(item => {
                const cleanedItem = {
                    productId: item.id || 'unknown',
                    name: item.name || 'Sản phẩm không tên',
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    image: item.image || item.imageUrl || item.imageUri || '',
                    size: item.size || null
                };

                // Debug từng item
                console.log("🔥 Item cleaned:", cleanedItem);
                return cleanedItem;
            });

            // 🔥 KIỂM TRA CÓ ITEM NÀO KHÔNG?
            if (cleanedItems.length === 0) {
                throw new Error("Không có sản phẩm hợp lệ để đặt hàng");
            }

            const orderData = {
                userId: user?.uid,
                orderNumber: `ORD-${Date.now()}`,
                items: cleanedItems, // 🔥 DÙNG cleanedItems
                subtotal: Number(subtotal) || 0,
                shippingFee: Number(shippingFee) || 0,
                totalAmount: Number(total) || 0,
                paymentMethod: paymentMethod || 'cod',
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
                status: "pending",
                shippingAddress: {
                    name: "Nguyễn Văn A",
                    phone: "0901234567",
                    address: "123 Đường Lê Lợi, Quận 1, TP.HCM"
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // 🔥 LOG DỮ LIỆU TRƯỚC KHI GỬI
            console.log("🔥 Order data to save:", JSON.stringify(orderData, null, 2));

            // 🔥 Lưu vào collection "orders"
            const orderRef = await addDoc(collection(db, "orders"), orderData);

            console.log("✅ Order created with ID:", orderRef.id);

            // Xóa item khỏi giỏ hàng
            selectedItemIds.forEach((id: string) => {
                try {
                    removeFromCart(id);
                } catch (error) {
                    console.error("❌ Lỗi xóa item khỏi cart:", error);
                }
            });

            addNotification({
                title: "Đặt hàng thành công 🎉",
                message: `Mã đơn: ${orderData.orderNumber}`,
                type: "order"
            });

            Alert.alert(
                "🎉 Thành công!",
                `Đơn hàng ${orderData.orderNumber} đã được tạo thành công!`,
                [{
                    text: "Về trang chủ",
                    onPress: () => router.replace("/home")
                }]
            );

        } catch (error: any) {
            console.error("❌ Lỗi tạo đơn hàng:", error);
            console.error("❌ Error details:", error.message, error.code);
            Alert.alert("Lỗi", `Không thể đặt hàng: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayWithPayOS = async () => {
        if (checkoutItems.length === 0) {
            Alert.alert("Lỗi", "Không có sản phẩm nào!");
            return;
        }

        setIsProcessing(true);
        try {
            // 🔥 LÀM SẠCH DỮ LIỆU
            const cleanedItems = checkoutItems.map(item => ({
                productId: item.id || 'unknown',
                name: item.name || 'Sản phẩm không tên',
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                image: item.image || item.imageUrl || item.imageUri || '',
                size: item.size || null
            }));

            const orderCode = Date.now();
            const orderData = {
                userId: user?.uid,
                orderNumber: `ORD-${orderCode}`,
                items: cleanedItems,
                subtotal: Number(subtotal) || 0,
                shippingFee: Number(shippingFee) || 0,
                totalAmount: Number(total) || 0,
                paymentMethod: "payos",
                paymentStatus: "pending",
                status: "pending",
                shippingAddress: {
                    name: "Nguyễn Văn A",
                    phone: "0901234567",
                    address: "123 Đường Lê Lợi, Quận 1, TP.HCM"
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            console.log("🔥 PayOS Order data:", JSON.stringify(orderData, null, 2));

            // 🔥 Lưu vào collection "orders"
            await addDoc(collection(db, "orders"), orderData);

            // ... phần còn lại của PayOS

        } catch (error: any) {
            console.error("❌ Lỗi PayOS:", error);
            Alert.alert("⚠ Lỗi", `Không thể tạo đơn hàng: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };
    if (!checkoutItems.length) {
        return (
            <View style={styles.empty}>
                <Text>Không có sản phẩm để thanh toán.</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: COLORS.primary }}>Quay lại giỏ hàng</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Địa chỉ */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <MapPin size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                    </View>
                    <Text style={styles.addr}>Nguyễn Văn A - 0901234567</Text>
                    <Text style={styles.addr}>123 Đường Lê Lợi, Quận 1, TP.HCM</Text>
                </View>

                {/* Sản phẩm */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm ({checkoutItems.length})</Text>
                    {checkoutItems.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            <Image
                                source={item.image ? { uri: item.image } : require("../assets/products/placeholder.png")}
                                style={styles.itemImage}
                            />
                            <View style={{ flex: 1 }}>
                                <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                                <Text>{formatPrice(item.price)} x {item.quantity}</Text>
                                {item.size && <Text>Size: {item.size}</Text>}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Phương thức thanh toán */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Wallet size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.option, paymentMethod === 'cod' && styles.activeOption]}
                        onPress={() => setPaymentMethod('cod')}>
                        <Text>Thanh toán khi nhận hàng (COD)</Text>
                        {paymentMethod === "cod" && <CheckCircle color={COLORS.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.option, paymentMethod === 'banking' && styles.activeOption]}
                        onPress={() => setPaymentMethod('banking')}>
                        <Text>Chuyển khoản ngân hàng</Text>
                        {paymentMethod === "banking" && <CheckCircle color={COLORS.primary} />}
                    </TouchableOpacity>
                </View>

                {/* Tổng tiền */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tổng thanh toán</Text>
                    <Text>Tạm tính: {formatPrice(subtotal)}</Text>
                    <Text>Phí ship: {formatPrice(shippingFee)}</Text>
                    <Text style={styles.total}>Tổng: {formatPrice(total)}</Text>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.total}>Tổng: {formatPrice(total)}</Text>

                {paymentMethod === "cod" ? (
                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={handlePlaceOrder}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.payText}>Đặt hàng (COD)</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={handlePayWithPayOS}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.payText}>Thanh toán PayOS</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Loading Overlay */}
            {isProcessing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang xử lý đơn hàng...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd'
    },
    headerTitle: { fontSize: 18, fontWeight: "bold" },
    section: { backgroundColor: 'white', padding: 15, marginTop: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontWeight: "bold", fontSize: 15, marginVertical: 8 },
    addr: { color: "#666", marginLeft: 28 },
    itemRow: { flexDirection: 'row', gap: 10, marginVertical: 8 },
    itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
    itemName: { fontWeight: '600', marginBottom: 4 },
    option: {
        padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        marginTop: 10, flexDirection: "row", justifyContent: "space-between"
    },
    activeOption: { borderColor: COLORS.primary, backgroundColor: '#F8FAFF' },
    total: { fontWeight: "bold", fontSize: 16, marginTop: 8 },
    footer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd'
    },
    payBtn: {
        backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, minWidth: 140,
        alignItems: 'center'
    },
    payText: { color: 'white', fontWeight: 'bold' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.text,
    }
});