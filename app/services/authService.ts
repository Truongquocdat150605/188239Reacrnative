// /app/services/authService.ts
import { 
  getAuth, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from "firebase/auth";

export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<boolean> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error("Không tìm thấy người dùng");
    }

    // 1. Re-authenticate với mật khẩu hiện tại
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 2. Đổi mật khẩu mới
    await updatePassword(user, newPassword);

    return true;
  } catch (error: any) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    
    // Xử lý lỗi cụ thể
    if (error.code === 'auth/wrong-password') {
      throw new Error("Mật khẩu hiện tại không đúng");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn");
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error("Vui lòng đăng nhập lại để đổi mật khẩu");
    } else {
      throw new Error("Đổi mật khẩu thất bại: " + error.message);
    }
  }
};

export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
  try {
    const auth = getAuth();
    await firebaseSendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error("❌ Lỗi gửi email reset password:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};