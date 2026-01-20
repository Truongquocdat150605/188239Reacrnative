// CheckoutScreen.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import {
    ArrowLeft,
    CheckCircle,
    QrCode,
    Truck,
    Wallet,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { db } from "../app/firebaseConfig";
import { useAuth } from "../lib/AuthContext";
import { useBuyNow } from "../lib/BuyNowContext";
import { useCart } from "../lib/CartContext";
import { useNotification } from "../lib/NotificationContext";
import { COLORS } from "../theme/colors";
import { showAlert, showError, showSuccess } from "../utils/alertHelper"; // 👈 THÊM

type Address = {
    id: string;
    name: string;
    phone: string;
    detail: string;
    type: "Home" | "Office";
    isDefault: boolean;
};

// ⚠️ DEMO KEY
const PAYOS_CLIENT_ID = "07a3480e-65f6-481b-93c7-90bb3e01b28e";
const PAYOS_API_KEY = "e31e1fcc-ba45-4460-bc0a-542a467706bb";
const PAYOS_CHECKSUM_KEY = "61f5c3b171e082eaa7cf4ecce1fb4d8f7a185e6b68cfd94260ddfb7d23ff6231";
const WEB_RETURN_URL = "http://localhost:8081";
const APP_RETURN_URL = "myapp://payos-return";

export default function CheckoutScreen() {
    // ===== HOOKS (PHẢI ĐỂ TẤT CẢ Ở ĐẦU) =====
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const { buyNowItem, setBuyNowItem } = useBuyNow();
    const { cartItems, removeFromCart } = useCart();
    const { addNotification } = useNotification();

    const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "payos">("cod");
    const [isProcessing, setIsProcessing] = useState(false);

    // Danh sách id đã chọn trong giỏ
    const selectedItemIds = useMemo<string[]>(() => {
        try {
            return params.itemIds ? JSON.parse(params.itemIds as string) : [];
        } catch {
            return [];
        }
    }, [params.itemIds]);

    // Items cần checkout
    const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

    // ===== LOAD ĐỊA CHỈ MẶC ĐỊNH =====
    useEffect(() => {
        if (!user?.uid) return;

        const loadDefault = async () => {
            try {
                const q = query(
                    collection(db, "users", user.uid, "addresses"),
                    where("isDefault", "==", true)
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const docSnap = snap.docs[0];
                    const data = docSnap.data() as Omit<Address, "id">;
                    setShippingAddress({ id: docSnap.id, ...data });
                }
            } catch (err) {
                console.log("❌ Lỗi load default address:", err);
            }
        };

        loadDefault();
    }, [user]);

    // ===== XỬ LÝ KHI PAYOS REDIRECT VỀ =====
    useEffect(() => {
        const handleUrl = async (url: string | null) => {
            try {
                if (!url || !user?.uid) return;
                
                const urlObj = new URL(url);
                const status = urlObj.searchParams.get("status");
                const orderCodeParam = urlObj.searchParams.get("orderCode");

                if (!status || !orderCodeParam) return;
                const orderCode = Number(orderCodeParam);
                if (!orderCode) return;

                // Tìm đơn
                const q = query(
                    collection(db, "orders"),
                    where("orderCode", "==", orderCode),
                    where("userId", "==", user.uid)
                );
                const snap = await getDocs(q);
                if (snap.empty) return;

                const orderDoc = snap.docs[0];
                const orderRef = doc(db, "orders", orderDoc.id);

                if (status === "PAID") {
                    await updateDoc(orderRef, {
                        paymentStatus: "paid",
                        status: "confirmed",
                        updatedAt: serverTimestamp(),
                    });

                    cleanupCart();

                    addNotification({
                        title: "Thanh toán thành công ✅",
                        message: `Đơn hàng ${orderDoc.data().orderNumber} đã được thanh toán`,
                        type: "order",
                    });

                    showAlert({
                        title: "🎉 Thanh toán thành công!",
                        message: "Đơn hàng của bạn đã được thanh toán thành công!",
                        confirmText: "Xem đơn hàng",
                        onConfirm: () => router.push(`/orders`),
                        cancelText: "Về trang chủ",
                        onCancel: () => router.replace("/home")
                    });
                } else if (status === "CANCEL") {
                    await updateDoc(orderRef, {
                        paymentStatus: "cancel",
                        status: "cancelled",
                        updatedAt: serverTimestamp(),
                    });

                    showError("Bạn đã huỷ thanh toán PayOS. Đơn hàng đã được hủy.");
                }
            } catch (err) {
                console.error("❌ handleUrl error:", err);
            }
        };

        // Xử lý URL ban đầu
        const checkInitialUrl = async () => {
            if (Platform.OS === "web") {
                await handleUrl(window.location.href);
            } else {
                const initial = await Linking.getInitialURL();
                await handleUrl(initial);
            }
        };

        checkInitialUrl();

        // Lắng nghe deep-link
        const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));
        return () => sub.remove();
    }, [user]);

    // ===== CALCULATIONS =====
    const subtotal = checkoutItems.reduce((sum, item) => {
        return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "₫";

    // ===== EARLY RETURNS (SAU TẤT CẢ HOOKS) =====
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

    // ===== HELPER FUNCTIONS =====
    const createSignature = (data: string): string => {
        const CryptoJS = require('crypto-js');
        const hmac = CryptoJS.HmacSHA256(data, PAYOS_CHECKSUM_KEY);
        return hmac.toString(CryptoJS.enc.Hex);
    };

    const normalizeString = (input: string): string => {
        if (!input) return "";
        return input
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim();
    };

    const cleanupCart = () => {
        if (selectedItemIds.length > 0) {
            selectedItemIds.forEach((id: string) => removeFromCart(id));
        }
        if (buyNowItem) setBuyNowItem(null);
    };

    // ===== CREATE ORDER =====
    const createOrder = async (method: "cod" | "payos") => {
        console.log("📝 Creating Firestore order...");

        const cleanedItems = checkoutItems.map((item) => ({
            productId: item.productId || "unknown",
            name: item.name || "Sản phẩm",
            price: Math.round(Number(item.price) || 0),
            quantity: Number(item.quantity) || 1,
            image: item.image || "",
            size: item.size || null,
        }));

        const orderCode = Math.floor(100000 + Math.random() * 900000);
        const orderNumber = `ORD-${orderCode}`;

        const orderData = {
            userId: user.uid,
            orderNumber,
            items: cleanedItems,
            subtotal: Math.round(Number(subtotal) || 0),
            shippingFee: Math.round(Number(shippingFee) || 0),
            totalAmount: Math.round(Number(total) || 0),
            paymentMethod: method,
            paymentStatus: "pending",
            status: "pending",
            shippingAddress: shippingAddress
                ? {
                    name: shippingAddress.name,
                    phone: shippingAddress.phone,
                    address: shippingAddress.detail,
                }
                : {
                    name: "Khách hàng",
                    phone: "0900000000",
                    address: "Địa chỉ mẫu",
                },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            orderCode,
        };

        const orderRef = await addDoc(collection(db, "orders"), orderData);
        console.log("✅ Order created with ID:", orderRef.id);

        return { orderCode, orderNumber, orderId: orderRef.id };
    };

    // ===== COD =====
    const handleCOD = async () => {
        console.log("💵 [COD] Start");

        if (checkoutItems.length === 0) {
            showError("Không có sản phẩm nào!");
            return;
        }

        setIsProcessing(true);
        try {
            const { orderNumber } = await createOrder("cod");
            cleanupCart();
            addNotification({
                title: "Đặt hàng thành công 🎉",
                message: `Mã đơn: ${orderNumber}`,
                type: "order",
            });

            showSuccess(`Đơn hàng ${orderNumber} đã được tạo!`);
            setTimeout(() => router.replace("/home"), 1500);
        } catch (error: any) {
            console.error("❌ [COD] Error:", error);
            showError(error?.message || "Không thể đặt hàng");
        } finally {
            setIsProcessing(false);
        }
    };

    // ===== PAYOS =====
    const handlePayOS = async () => {
        console.log("🏦 [PayOS] Start");

        if (checkoutItems.length === 0) {
            showError("Không có sản phẩm nào!");
            return;
        }

        if (total < 1000) {
            showError("Số tiền thanh toán tối thiểu là 1,000đ");
            return;
        }

        setIsProcessing(true);
        try {
            const { orderCode, orderId } = await createOrder("payos");
            console.log("✅ [PayOS] Order created, orderCode:", orderCode);

            const returnUrl = Platform.OS === "web"
                ? `${WEB_RETURN_URL}?status=PAID&orderCode=${orderCode}`
                : `${APP_RETURN_URL}?status=PAID&orderCode=${orderCode}`;

            const cancelUrl = Platform.OS === "web"
                ? `${WEB_RETURN_URL}?status=CANCEL&orderCode=${orderCode}`
                : `${APP_RETURN_URL}?status=CANCEL&orderCode=${orderCode}`;

            const description = `ĐH #${orderCode}`;
            const dataForSignature = `amount=${Math.round(total)}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
            const signature = createSignature(dataForSignature);

            const requestBody = {
                orderCode: orderCode,
                amount: Math.round(total),
                description: description,
                returnUrl: returnUrl,
                cancelUrl: cancelUrl,
                items: checkoutItems.map(item => ({
                    name: normalizeString(item.name || "Sản phẩm"),
                    quantity: Number(item.quantity) || 1,
                    price: Math.round(Number(item.price) || 0)
                })),
                buyerName: normalizeString(shippingAddress?.name || user?.email?.split('@')[0] || "Khách hàng"),
                buyerEmail: user?.email || "",
                buyerPhone: shippingAddress?.phone || "",
                buyerAddress: shippingAddress?.detail || "",
                signature: signature
            };

            const headers = {
                "Content-Type": "application/json",
                "x-client-id": PAYOS_CLIENT_ID,
                "x-api-key": PAYOS_API_KEY,
            };

            const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();
            if (data.code !== "00" || !data?.data?.checkoutUrl) {
                throw new Error(data.desc || "Không lấy được URL thanh toán");
            }

            const checkoutUrl = data.data.checkoutUrl as string;
            if (Platform.OS === "web") {
                window.open(checkoutUrl, "_blank");
            } else {
                await WebBrowser.openBrowserAsync(checkoutUrl);
            }

        } catch (err: any) {
            console.error("❌ [PayOS] Error:", err);
            showError(err?.message || "Không thể thanh toán PayOS");
        } finally {
            setIsProcessing(false);
        }
    };

    // ===== RENDER =====
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
                {/* Sản phẩm */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Sản phẩm ({checkoutItems.length})
                    </Text>
                    {checkoutItems.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Image
                                source={
                                    item.image
                                        ? { uri: item.image }
                                        : require("../assets/products/placeholder.png")
                                }
                                style={styles.itemImage}
                            />
                            <View style={{ flex: 1 }}>
                                <Text numberOfLines={1} style={styles.itemName}>
                                    {item.name}
                                </Text>
                                <Text>
                                    {formatPrice(item.price)} x {item.quantity}
                                </Text>
                                {item.size && <Text>Size: {item.size}</Text>}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Địa chỉ */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/addresses')}
                            style={styles.changeAddressBtn}
                        >
                            <Text style={styles.changeAddressText}>Thay đổi</Text>
                        </TouchableOpacity>
                    </View>

                    {shippingAddress ? (
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <Text style={styles.addressName}>{shippingAddress.name}</Text>
                                {shippingAddress.isDefault && (
                                    <Text style={styles.defaultBadge}>Mặc định</Text>
                                )}
                            </View>
                            <Text style={styles.addressPhone}>📞 {shippingAddress.phone}</Text>
                            <Text style={styles.addressDetail}>{shippingAddress.detail}</Text>
                            <Text style={styles.addressType}>
                                {shippingAddress.type === 'Home' ? '🏠 Nhà riêng' : '🏢 Văn phòng'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.noAddressCard}>
                            <Text style={styles.noAddressText}>Chưa có địa chỉ giao hàng</Text>
                            <Text style={styles.noAddressSubtext}>
                                Sẽ dùng "Địa chỉ mẫu" nếu bạn không thêm địa chỉ
                            </Text>
                            <TouchableOpacity 
                                style={styles.addAddressBtn}
                                onPress={() => router.push('/addresses')}
                            >
                                <Text style={styles.addAddressText}>+ Thêm địa chỉ mới</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Phương thức thanh toán */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Wallet size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.option,
                            paymentMethod === "cod" && styles.activeOption,
                        ]}
                        onPress={() => setPaymentMethod("cod")}
                    >
                        <Truck size={20} color="#28a745" />
                        <Text style={styles.optionText}>COD - Thanh toán khi nhận hàng</Text>
                        {paymentMethod === "cod" && <CheckCircle color={COLORS.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.option,
                            paymentMethod === "payos" && styles.activeOption,
                        ]}
                        onPress={() => setPaymentMethod("payos")}
                    >
                        <QrCode size={20} color="#2196f3" />
                        <Text style={styles.optionText}>QR Banking (PayOS)</Text>
                        {paymentMethod === "payos" && <CheckCircle color={COLORS.primary} />}
                    </TouchableOpacity>
                </View>

                {/* Tổng tiền */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tổng thanh toán</Text>
                    <View style={styles.totalRow}>
                        <Text>Tạm tính:</Text>
                        <Text>{formatPrice(subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>Phí ship:</Text>
                        <Text>{formatPrice(shippingFee)}</Text>
                    </View>
                    <View style={[styles.totalRow, { marginTop: 10 }]}>
                        <Text style={{ fontWeight: "bold" }}>Tổng cộng:</Text>
                        <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.totalLabel}>Tổng:</Text>
                    <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.payBtn,
                        isProcessing && styles.payBtnDisabled
                    ]}
                    onPress={paymentMethod === "cod" ? handleCOD : handlePayOS}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.payText}>
                            {paymentMethod === "cod" ? "Đặt hàng (COD)" : "Thanh toán PayOS"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold" },
    section: {
        backgroundColor: "white",
        padding: 15,
        marginTop: 10,
        marginHorizontal: 10,
        borderRadius: 8,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionTitle: { fontWeight: "bold", fontSize: 15, marginVertical: 8 },
    itemRow: {
        flexDirection: "row",
        gap: 10,
        marginVertical: 8,
        alignItems: "center",
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#eee",
    },
    itemName: { fontWeight: "600", marginBottom: 4, fontSize: 14 },
    option: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
    },
    optionText: {
        fontSize: 14,
        flex: 1,
    },
    activeOption: {
        borderColor: COLORS.primary,
        backgroundColor: "#F8FAFF",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },
    totalAmount: {
        fontWeight: "bold",
        fontSize: 18,
        color: COLORS.primary,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    totalLabel: {
        fontSize: 12,
        color: "#666",
    },
    payBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 160,
        alignItems: "center",
    },
    payBtnDisabled: {
        backgroundColor: "#ccc",
        opacity: 0.7,
    },
    payText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    addressCard: {
        backgroundColor: '#F8FAFF',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E3F2FD',
        marginTop: 10,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    addressName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    addressPhone: {
        color: '#555',
        marginBottom: 5,
    },
    addressDetail: {
        color: '#333',
        marginBottom: 5,
        lineHeight: 20,
    },
    addressType: {
        fontSize: 12,
        color: '#666',
    },
    defaultBadge: {
        backgroundColor: COLORS.primary,
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: '600',
    },
    noAddressCard: {
        backgroundColor: '#FFF3E0',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFE0B2',
        marginTop: 10,
        alignItems: 'center',
    },
    noAddressText: {
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 5,
    },
    noAddressSubtext: {
        fontSize: 12,
        color: '#777',
        textAlign: 'center',
        marginBottom: 10,
    },
    addAddressBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    addAddressText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    changeAddressBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F0F7FF',
        borderRadius: 6,
    },
    changeAddressText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
    },
});