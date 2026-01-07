import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/** LẤY TẤT CẢ SẢN PHẨM */
export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? "",
        price: data.price ?? 0,
        image: data.imageUrl || data.image || "", // 🔥 Đảm bảo có imageUrl
        type: data.type ?? "", // ⭐ Gốc fix lỗi ở ProductDetail
        categoryId: data.categoryId ?? "", // 🔥 THÊM DÒNG NÀY
        sizes: data.sizes ?? [],
        description: data.description ?? "",
        specifications: data.specifications ?? {},
        rating: data.rating, // 🔥 Thêm nếu có
        reviewCount: data.reviewCount, // 🔥 Thêm nếu có
      };
    });
  } catch (error) {
    console.error("❌ Lỗi lấy products:", error);
    return [];
  }
};
// productService.ts - THÊM HÀM NÀY
/** LẤY 1 SẢN PHẨM THEO ID */
export const getProductById = async (productId: string) => {
  try {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name ?? "",
        price: data.price ?? 0,
        image: data.imageUrl || data.image || data.imageUri || "",
        type: data.type ?? "",
        sizes: data.sizes ?? [],
        description: data.description ?? "",
        specifications: data.specifications ?? {},
      };
    }
    return null;
  } catch (error) {
    console.error("❌ Lỗi lấy product by ID:", error);
    return null;
  }
};
