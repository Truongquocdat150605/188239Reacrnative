import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

// 🔴 DÙNG ĐÚNG CONFIG FIREBASE CỦA BẠN
const firebaseConfig = {
 apiKey: "AIzaSyCzXoNaa8UKO9VfYzs1QfECFBzKeYcIeZ8",
  authDomain: "jewelrystore-1e634.firebaseapp.com",
  projectId: "jewelrystore-1e634",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 PRODUCTS DATA (MAP ĐÚNG categoryId)
const PRODUCTS = [
  {
    name: "Nhẫn Kim Cương Vàng 18K",
    price: 18500000,
    originalPrice: 22000000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "rings",
    isNew: true,
    isSale: true,
    rating: 4.8,
    reviewCount: 24,
    specifications: {
      material: "Vàng 18K",
      weight: "1ct",
      size: "15",
    },
  },
  {
    name: "Vòng Tay Ngọc Trai Cao Cấp",
    price: 3200000,
    originalPrice: 4000000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "bracelets",
    isNew: false,
    isSale: true,
    rating: 4.5,
    reviewCount: 18,
    specifications: {
      material: "Ngọc trai tự nhiên",
      length: "18cm",
    },
  },
  {
    name: "Dây Chuyền Vàng 24K",
    price: 7500000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "necklaces",
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviewCount: 32,
    specifications: {
      material: "Vàng 24K",
      weight: "8g",
    },
  },
  {
    name: "Bông Tai Kim Cương",
    price: 12500000,
    originalPrice: 15000000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "diamonds",
    isNew: false,
    isSale: true,
    rating: 4.7,
    reviewCount: 15,
    specifications: {
      material: "Bạch kim + Kim cương",
      weight: "0.5ct",
    },
  },
  {
    name: "Nhẫn Cưới Kim Cương",
    price: 28500000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "wedding",
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewCount: 8,
    specifications: {
      material: "Vàng trắng 18K",
      weight: "1.5ct",
    },
  },
  {
    name: "Lắc Tay Vàng 24K Đặc",
    price: 9600000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "gold",
    isNew: false,
    isSale: false,
    rating: 4.6,
    reviewCount: 14,
    specifications: {
      material: "Vàng 24K",
      weight: "10g",
    },
  },
  {
    name: "Dây Chuyền Ngọc Trai Nhật",
    price: 4500000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "pearls",
    isNew: true,
    isSale: true,
    rating: 4.9,
    reviewCount: 42,
    specifications: {
      material: "Ngọc Trai Nhật Bản",
      size: "8mm",
    },
  },
  {
    name: "Nhẫn Bạc 925 Basic",
    price: 750000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "silver",
    isNew: false,
    isSale: false,
    rating: 4.2,
    reviewCount: 19,
    specifications: {
      material: "Bạc 925",
      size: "16",
    },
  },
  {
    name: "Vương Miện Trang Sức Luxury",
    price: 55000000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "luxury",
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewCount: 12,
    specifications: {
      material: "Bạch kim + Kim Cương",
      weight: "3.2ct",
    },
  },
  {
    name: "Lắc Tay Bạc Trẻ Em Hình Gấu",
    price: 480000,
    imageUrl: "https://placehold.co/600x600/png",
    categoryId: "kids",
    isNew: true,
    isSale: true,
    rating: 4.8,
    reviewCount: 55,
    specifications: {
      material: "Bạc 925",
      length: "12cm",
    },
  },
];

async function seedProducts() {
  for (const product of PRODUCTS) {
    await addDoc(collection(db, "products"), {
      ...product,
      createdAt: Timestamp.now(),
    });
  }
  console.log("✅ Products seeded successfully!");
}

seedProducts();
