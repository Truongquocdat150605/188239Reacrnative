// seedProducts.js - Dùng CommonJS
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");

// 🔴 DÙNG ĐÚNG CONFIG FIREBASE CỦA BẠN
const firebaseConfig = {
  apiKey: "AIzaSyCzXoNaa8UKO9VfYzs1QfECFBzKeYcIeZ8",
  authDomain: "jewelrystore-1e634.firebaseapp.com",
  projectId: "jewelrystore-1e634",
  storageBucket: "jewelrystore-1e634.firebasestorage.app",
  messagingSenderId: "1057331212554",
  appId: "1:1057331212554:web:32e9dc8b13d8d5660b2219"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 PRODUCTS DATA
const PRODUCTS = [
  {
    name: "Nhẫn Cưới Vàng 24K Trơn",
    price: 8500000,
    categoryId: "gold",
    imageUrl: "https://placehold.co/600x600/FFD700/000?text=Gold+Ring",
    material: "Vàng 24K",
    rating: 4.8,
    reviewCount: 23,
    isNew: true,
    isSale: false,
    count: 15,
    icon: "⭐",
    type: "gold",
    description: "Nhẫn cưới vàng 24K trơn, sang trọng",
    specifications: {
      material: "Vàng 24K",
      weight: "8g",
      size: "15"
    }
  },
  {
    name: "Dây Chuyền Vàng 18K Mặt Tỳ Hưu",
    price: 12500000,
    categoryId: "gold",
    imageUrl: "https://placehold.co/600x600/FFD700/000?text=Gold+Necklace",
    material: "Vàng 18K",
    rating: 4.9,
    reviewCount: 42,
    isNew: true,
    isSale: true,
    count: 8,
    icon: "⭐",
    type: "gold",
    description: "Dây chuyền vàng 18K mặt tỳ hưu",
    specifications: {
      material: "Vàng 18K",
      weight: "15g",
      length: "45cm"
    }
  }
];

async function seedProducts() {
  try {
    console.log("🔄 Bắt đầu thêm sản phẩm...");
    
    for (const product of PRODUCTS) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: Timestamp.now(),
      });
      console.log(`✅ Đã thêm: ${product.name}`);
    }
    
    console.log(`🎯 Đã thêm ${PRODUCTS.length} sản phẩm thành công!`);
    
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

seedProducts();