// /app/services/userService.ts
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, updateProfile } from "firebase/auth";

export const updateUserProfile = async (userId: string, data: {
  name?: string;
  phone?: string;
  avatar?: string;
}) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });

    // Cập nhật Auth profile
    const auth = getAuth();
    if (auth.currentUser && data.name) {
      await updateProfile(auth.currentUser, {
        displayName: data.name
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Lỗi cập nhật user:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("❌ Lỗi lấy user profile:", error);
    throw error;
  }
};