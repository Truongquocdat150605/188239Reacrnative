import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../theme/colors';
import { auth } from '../app/firebaseConfig';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
    }
    if (newPass !== confirmPass) {
      return Alert.alert("Lỗi", "Mật khẩu mới không khớp");
    }
    if (newPass.length < 6) {
      return Alert.alert("Lỗi", "Mật khẩu phải ≥ 6 ký tự");
    }

    const user = auth.currentUser;
    if (!user?.email) {
      return Alert.alert("Lỗi", "Không xác định user");
    }

    setLoading(true);
    try {
      // 🔥 Re-auth để đổi mật khẩu Firebase
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPass);

      Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.log("Error:", error);

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        return Alert.alert("Sai mật khẩu", "Mật khẩu hiện tại không đúng");
      }

      if (error.code === "auth/requires-recent-login") {
        return Alert.alert(
          "Phiên hết hạn",
          "Vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu"
        );
      }

      if (error.code === "auth/weak-password") {
        return Alert.alert("Mật khẩu yếu", "Mật khẩu mới cần ≥ 6 hoặc 8 ký tự");
      }

      return Alert.alert("Lỗi", error.message || "Đổi mật khẩu thất bại");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
        <ArrowLeft size={24} />
      </TouchableOpacity>

      <Text style={styles.title}>Đổi mật khẩu</Text>

      <TextInput
        placeholder="Mật khẩu hiện tại"
        secureTextEntry
        value={currentPass}
        onChangeText={setCurrentPass}
        style={styles.input}
      />

      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
        style={styles.input}
      />

      <TextInput
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        value={confirmPass}
        onChangeText={setConfirmPass}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#bbb" }]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  }
});
