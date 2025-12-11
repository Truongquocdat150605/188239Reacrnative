
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { useCart } from '../lib/CartContext';
import { useNotification } from '../lib/NotificationContext'; // 🆕 IMPORT NOTIFICATION
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle, Wallet } from 'lucide-react-native';

export default function CheckoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const { cartItems, removeFromCart } = useCart();
    const { addNotification } = useNotification(); // 🆕 SỬ DỤNG NOTIFICATION
    
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
    const [isProcessing, setIsProcessing] = useState(false);

    // Lấy danh sách ID sản phẩm được truyền từ giỏ hàng
    const selectedItemIds = useMemo(() => {
        if (!params.itemIds) return [];
        try {
            return JSON.parse(params.itemIds as string);
        } catch (e) {
            return [];
        }
    }, [params.itemIds]);

    // Lọc ra các sản phẩm thực tế từ Context dựa trên ID
    const checkoutItems = useMemo(() => {
        return cartItems.filter(item => selectedItemIds.includes(item.id));
    }, [cartItems, selectedItemIds]);

    // Tính toán tiền
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 30000; // Phí ship cố định
    const total = subtotal + shippingFee;

    const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "₫";

    const handlePlaceOrder = () => {
        setIsProcessing(true);

        // Giả lập gọi API đặt hàng mất 2 giây
        setTimeout(() => {
            setIsProcessing(false);

            // 1. Xóa các sản phẩm đã mua khỏi giỏ hàng
            selectedItemIds.forEach((id: string) => {
                removeFromCart(id);
            });

            // 🆕 2. Bắn thông báo giả lập
            const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
            addNotification({
                title: 'Đặt hàng thành công! 🎉',
                message: `Đơn hàng ${orderId} của bạn đang được xử lý. Cảm ơn bạn đã mua sắm!`,
                type: 'order'
            });

            // 3. Thông báo thành công UI
            const successMsg = "Đơn hàng của bạn đã được đặt thành công!";
            
            if (Platform.OS === 'web') {
                if(window.confirm(successMsg)) {
                    router.dismissAll();
                    router.replace("/home");
                }
            } else {
                Alert.alert(
                    "Đặt hàng thành công! 🎉",
                    "Cảm ơn bạn đã mua sắm. Đơn hàng đang được xử lý.",
                    [
                        {
                            text: "Về trang chủ",
                            onPress: () => {
                                router.dismissAll();
                                router.replace("/home");
                            }
                        }
                    ]
                );
            }
        }, 2000);
    };

    if (checkoutItems.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text>Không tìm thấy thông tin đơn hàng.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{marginTop: 10}}>
                    <Text style={{color: COLORS.primary}}>Quay lại</Text>
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Địa chỉ nhận hàng */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MapPin size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                    </View>
                    <View style={styles.addressBox}>
                        <Text style={styles.customerName}>Nguyễn Văn A | 0901234567</Text>
                        <Text style={styles.addressText}>123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh</Text>
                    </View>
                </View>

                {/* Danh sách sản phẩm */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitleSimple}>Sản phẩm ({checkoutItems.length})</Text>
                    {checkoutItems.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Image 
                                source={typeof item.imageUri === 'string' ? { uri: item.imageUri } : item.imageUri} 
                                style={styles.itemImage} 
                            />
                            <View style={styles.itemInfo}>
                                <Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
                                <View style={styles.itemMeta}>
                                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Phương thức vận chuyển */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Truck size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
                    </View>
                    <View style={styles.optionRow}>
                        <View>
                            <Text style={styles.optionTitle}>Nhanh</Text>
                            <Text style={styles.optionSub}>Nhận hàng vào 20 Th12 - 22 Th12</Text>
                        </View>
                        <Text style={styles.optionPrice}>{formatPrice(shippingFee)}</Text>
                    </View>
                </View>

                {/* Phương thức thanh toán */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Wallet size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
                        {paymentMethod === 'cod' && <CheckCircle size={18} color={COLORS.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'banking' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('banking')}
                    >
                        <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
                        {paymentMethod === 'banking' && <CheckCircle size={18} color={COLORS.primary} />}
                    </TouchableOpacity>
                </View>

                {/* Chi tiết thanh toán */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitleSimple}>Chi tiết thanh toán</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tổng tiền hàng</Text>
                        <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tổng tiền phí vận chuyển</Text>
                        <Text style={styles.priceValue}>{formatPrice(shippingFee)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.footerTotal}>
                    <Text style={styles.footerTotalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.footerTotalValue}>{formatPrice(total)}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.orderButton}
                    onPress={handlePlaceOrder}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.orderButtonText}>Đặt Hàng</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        backgroundColor: 'white',
        marginTop: 10,
        padding: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: 8,
    },
    sectionTitleSimple: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    // Address
    addressBox: {
        marginLeft: 28,
    },
    customerName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: COLORS.subText,
        lineHeight: 18,
    },
    // Items
    itemRow: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 6,
        backgroundColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    itemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    itemQty: {
        fontSize: 14,
        color: COLORS.subText,
    },
    // Shipping
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 28,
    },
    optionTitle: {
        fontSize: 14,
        color: COLORS.text,
    },
    optionSub: {
        fontSize: 12,
        color: '#26aa99', // Greenish for delivery date
        marginTop: 2,
    },
    optionPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    // Payment
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        marginBottom: 8,
    },
    paymentOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#F9FAFB',
    },
    paymentText: {
        fontSize: 14,
        color: COLORS.text,
    },
    // Totals
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 13,
        color: COLORS.subText,
    },
    priceValue: {
        fontSize: 13,
        color: COLORS.text,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    footerTotal: {
        flex: 1,
    },
    footerTotalLabel: {
        fontSize: 12,
        color: COLORS.subText,
    },
    footerTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    orderButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    orderButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});