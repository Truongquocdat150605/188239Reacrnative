import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { showError, showSuccess } from '../utils/alertHelper';
import { auth } from "./firebaseConfig"; // ⚠️ sửa path nếu khác

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSendResetEmail = async () => {
        if (!email.trim()) {
            showError("Vui lòng nhập email"); return;
        }

        try {
            setIsLoading(true);

            await sendPasswordResetEmail(
                auth,
                email.trim().toLowerCase()
            );

            showSuccess("📧 Email đã được gửi\nVui lòng kiểm tra email để đặt lại mật khẩu");
            setTimeout(() => router.replace("/login"), 1500); // Delay 1.5s

        } catch (error: any) {
            showError(error.message || "Không thể gửi email đặt lại mật khẩu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color="#333" />
                        <Text style={styles.backText}>Quay lại</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>🔐 Quên mật khẩu</Text>
                        <Text style={styles.subtitle}>
                            Nhập email để nhận link đặt lại mật khẩu
                        </Text>
                    </View>

                    {/* Email input */}
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#777" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email đã đăng ký"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSendResetEmail}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>
                                Gửi email đặt lại mật khẩu
                            </Text>

                        )}
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={{ color: '#0A84FF', textAlign: 'center', marginBottom: 20 }}
                            onPress={() => router.replace("/login")}
                        >
                            Quay lại đăng nhập
                        </Text>
                    </TouchableOpacity>

                    {/* Note */}
                    <View style={styles.note}>
                        <Text style={styles.noteTitle}>💡 Lưu ý</Text>
                        <Text style={styles.noteText}>
                            • Kiểm tra cả hộp thư spam{'\n'}
                            • Link có hiệu lực trong thời gian ngắn{'\n'}
                            • Đổi mật khẩu xong quay lại đăng nhập
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        top: 16,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingLeft: 45,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#0A84FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#A0C4FF',
        opacity: 0.8,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    note: {
        backgroundColor: '#F0F9FF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0369A1',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 14,
        color: '#0C4A6E',
        lineHeight: 20,
    },
});
