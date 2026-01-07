import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../app/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { COLORS } from "../../theme/colors";
import { ArrowLeft } from "lucide-react-native";

export default function OrderDetail() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const ref = doc(db, "users", "test-user", "orders", orderId);
      const snap = await getDoc(ref);
      if (snap.exists()) setOrder(snap.data());
      setLoading(false);
    };
    fetchOrder();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  if (!order)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng.</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft size={26} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      </View>

      <Text style={styles.title}>Mã đơn: {orderId}</Text>
      <Text style={styles.status}>Trạng thái: {order.status}</Text>
      <Text style={styles.total}>Tổng thanh toán: {order.total.toLocaleString("vi-VN")}₫</Text>

      <Text style={styles.section}>Danh sách sản phẩm:</Text>
      {order.items.map((item: any, i: number) => (
        <View key={i} style={styles.item}>
          <Text>{item.name}</Text>
          <Text>x{item.quantity}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 12 },
  title: { fontSize: 16, fontWeight: "bold", marginVertical: 8 },
  status: { marginBottom: 6 },
  total: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  section: { fontWeight: "bold", marginTop: 10 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
