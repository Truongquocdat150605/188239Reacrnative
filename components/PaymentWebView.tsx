import { useRouter } from "expo-router"; // 👈 THÊM
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    View
} from "react-native";
import { WebView } from "react-native-webview";

type Props = {
    visible: boolean;
    paymentUrl: string;
    onClose: () => void;
    onPaymentSuccess: (orderId: string) => void;
    onPaymentFailure: (err: string) => void;
    onNavigateToCart?: () => void; // 👈 THÊM PROP MỚI
};

export default function PaymentWebView({
    visible,
    paymentUrl,
    onClose,
    onPaymentSuccess,
    onPaymentFailure,
    onNavigateToCart
}: Props) {
    const router = useRouter(); // 👈 THÊM
    const webViewRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const handleUrlChange = (event: any) => {
        const url = event.url;
        console.log("🔎 Payment URL redirect:", url);

        // ===== Stripe Success =====
        if (url.includes("stripe_success=true")) {
            const orderId = new URL(url).searchParams.get("orderId") || "";
            console.log("🎉 Stripe success:", orderId);
            onPaymentSuccess(orderId);
            onClose();
            return;
        }

        // ===== Stripe Cancel =====
        if (url.includes("stripe_canceled=true")) {
            console.log("❌ Stripe cancel");
            onPaymentFailure("Stripe đã hủy thanh toán");
            onClose();
            
            // 👇 QUAY VỀ GIỎ HÀNG
            setTimeout(() => {
                if (onNavigateToCart) {
                    onNavigateToCart();
                } else {
                    router.replace("/cart");
                }
            }, 500);
            
            return;
        }

        // ===== PayOS Success =====
        if (url.includes("status=PAID")) {
            const orderId = new URL(url).searchParams.get("orderId") || "";
            console.log("🎉 PayOS paid:", orderId);
            onPaymentSuccess(orderId);
            onClose();
            return;
        }

        // ===== PayOS Cancel =====
        if (url.includes("payment-cancel") || url.includes("status=CANCEL")) {
            console.log("❌ PayOS canceled");
            onPaymentFailure("PayOS canceled");
            onClose();
            
            // 👇 QUAY VỀ GIỎ HÀNG
            setTimeout(() => {
                if (onNavigateToCart) {
                    onNavigateToCart();
                } else {
                    router.replace("/cart");
                }
            }, 500);
            
            return;
        }
    };

    // Xử lý khi đóng modal bằng nút back
    const handleRequestClose = () => {
        Alert.alert(
            "Hủy thanh toán",
            "Bạn có chắc muốn hủy thanh toán?",
            [
                { text: "Tiếp tục", style: "cancel" },
                { 
                    text: "Hủy", 
                    style: "destructive",
                    onPress: () => {
                        onClose();
                        onPaymentFailure("Người dùng đã hủy thanh toán");
                        
                        // 👇 QUAY VỀ GIỎ HÀNG
                        setTimeout(() => {
                            if (onNavigateToCart) {
                                onNavigateToCart();
                            } else {
                                router.replace("/cart");
                            }
                        }, 500);
                    }
                }
            ]
        );
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            onRequestClose={handleRequestClose} // 👈 SỬA
        >
            <View style={{ flex: 1 }}>
                {loading && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" />
                    </View>
                )}

                <WebView
                    ref={webViewRef}
                    source={{ uri: paymentUrl }}
                    onLoadEnd={() => setLoading(false)}
                    onNavigationStateChange={handleUrlChange}
                    style={{ flex: 1 }}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    loading: {
        position: "absolute",
        zIndex: 99,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
    },
});