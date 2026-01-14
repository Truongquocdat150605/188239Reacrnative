// app/services/productService.ts
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/** Kiểu dữ liệu chuẩn 1 sản phẩm */
export interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;                // đã map từ imageUrl / image / imageUri
  categoryId: string;           // ví dụ: "kids", "bracelet", ...
  isNew?: boolean;
  isSale?: boolean;
  rating?: number;
  reviewCount?: number;
  sizes?: string[];
  description?: string;
  specifications?: Record<string, any>;
}

/** Hàm chuẩn hoá 1 doc Firestore về ProductData */
const mapProductDoc = (id: string, data: any): ProductData => {
  return {
    id,
    name: data.name ?? "",
    price: Number(data.price ?? 0),
    image: data.imageUrl || data.image || data.imageUri || "",
    categoryId: data.categoryId ?? "",
    isNew: Boolean(data.isNew),
    isSale: Boolean(data.isSale),
    rating: typeof data.rating === "number" ? data.rating : 0,
    reviewCount: typeof data.reviewCount === "number" ? data.reviewCount : 0,
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    description: data.description ?? "",
    specifications: data.specifications ?? {},
  };
};

/** 🔁 LẤY TẤT CẢ SẢN PHẨM */
export const getAllProducts = async (): Promise<ProductData[]> => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((d) => mapProductDoc(d.id, d.data()));
  } catch (error) {
    console.error("❌ Lỗi lấy products:", error);
    return [];
  }
};

/** 🎯 LẤY 1 SẢN PHẨM THEO ID */
export const getProductById = async (
  productId: string
): Promise<ProductData | null> => {
  try {
    const productRef = doc(db, "products", productId);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return mapProductDoc(docSnap.id, data);
  } catch (error) {
    console.error("❌ Lỗi lấy product by ID:", error);
    return null;
  }
};
