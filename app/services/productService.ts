import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * LẤY TOÀN BỘ PRODUCTS
 */
export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, "products"));

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Lỗi lấy products:", error);
    return [];
  }
};

/**
 * LẤY PRODUCTS THEO CATEGORY
 * @param categoryId ví dụ: "rings", "gold", "kids"
 */
export const getProductsByCategory = async (categoryId: string) => {
  try {
    const q = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Lỗi filter products:", error);
    return [];
  }
};
