import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const getOrdersByUserId = async (userId: string) => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("❌ Lỗi lấy orders:", error);
    return [];
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(orderRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("❌ Lỗi lấy order:", error);
    throw error;
  }
};