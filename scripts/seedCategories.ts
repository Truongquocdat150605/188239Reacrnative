import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyCzXoNaa8UKO9VfYzs1QfECFBzKeYcIeZ8",
  authDomain: "jewelrystore-1e634.firebaseapp.com",
  projectId: "jewelrystore-1e634",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  { id: "rings", name: "Nhẫn", icon: "💍", count: 45 },
  { id: "bracelets", name: "Vòng Tay", icon: "📿", count: 32 },
  { id: "necklaces", name: "Dây Chuyền", icon: "📿", count: 28 },
  { id: "diamonds", name: "Kim Cương", icon: "💎", count: 15 },
  { id: "gold", name: "Vàng 24K", icon: "⭐", count: 23 },
  { id: "pearls", name: "Ngọc Trai", icon: "🔮", count: 17 },
  { id: "wedding", name: "Nhẫn Cưới", icon: "💒", count: 12 },
  { id: "luxury", name: "Cao Cấp", icon: "👑", count: 8 },
  { id: "silver", name: "Bạc", icon: "⚪", count: 21 },
  { id: "kids", name: "Trẻ Em", icon: "👶", count: 14 },
];

async function seedCategories() {
  for (const c of categories) {
    await setDoc(doc(db, "categories", c.id), {
      name: c.name,
      icon: c.icon,
      count: c.count,
      type: c.id,
    });
  }
  console.log("✅ Categories seeded!");
}

seedCategories();
