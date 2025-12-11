import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MOCK_USERS } from '../lib/users';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã & mật khẩu
    const [isLoading, setIsLoading] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(''); // Lưu mã đã gửi

    const router = useRouter();

    // Kiểm tra email có tồn tại trong MOCK_USERS
    const checkEmailExists = (email: string): boolean => {
        return MOCK_USERS.some(user => 
            user.email.toLowerCase() === email.toLowerCase()
        );
    };

    // Tạo mã reset ngẫu nhiên 6 số
    const generateResetCode = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Bước 1: Gửi mã reset
    const handleSendResetCode = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email của bạn');
            return;
        }

        if (!checkEmailExists(email)) {
            Alert.alert('Email không tồn tại', 'Email này chưa được đăng ký trong hệ thống');
            return;
        }

        setIsLoading(true);

        // Giả lập gửi email (1.5 giây)
        setTimeout(() => {
            setIsLoading(false);
            const code = generateResetCode();
            setGeneratedCode(code); // Lưu mã để verify sau
            
            // Trong thực tế: mã sẽ gửi qua email
            // Đây chỉ demo nên hiện mã luôn
            Alert.alert(
                '📧 Mã xác nhận đã được gửi',
                `Mã xác nhận: ${code}\n\nLưu ý: Đây là demo nên hiện mã. Trong app thật, mã sẽ được gửi đến email của bạn.`,
                [{ text: 'Đã hiểu', onPress: () => setStep(2) }]
            );
        }, 1500);
    };

    // Bước 2: Xác nhận mã và đổi mật khẩu
    const handleResetPassword = () => {
        // Kiểm tra mã
        if (!resetCode.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã xác nhận');
            return;
        }

        if (resetCode !== generatedCode) {
            Alert.alert('Lỗi', 'Mã xác nhận không đúng');
            return;
        }

        // Kiểm tra mật khẩu
        if (!newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        // Giả lập đổi mật khẩu (1.5 giây)
        setTimeout(() => {
            setIsLoading(false);
            
            // Tìm và cập nhật mật khẩu trong MOCK_USERS
            const userIndex = MOCK_USERS.findIndex(u => 
                u.email.toLowerCase() === email.toLowerCase()
            );
            
            if (userIndex !== -1) {
                MOCK_USERS[userIndex].password = newPassword;
                console.log(`[PASSWORD RESET] Đã đổi mật khẩu cho: ${email}`);
            }

            Alert.alert(
                '🎉 Thành công',
                'Mật khẩu đã được đổi thành công!',
                [
                    {
                        text: 'Đăng nhập ngay',
                        onPress: () => router.replace('/login')
                    }
                ]
            );
        }, 1500);
    };

    // Quay lại login
    const handleBackToLogin = () => {
        router.back();
    };

    // Quay lại bước 1
    const handleBackToEmail = () => {
        setStep(1);
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Gửi lại mã
    const handleResendCode = () => {
        const newCode = generateResetCode();
        setGeneratedCode(newCode);
        
        Alert.alert(
            '🔄 Mã mới đã được gửi',
            `Mã xác nhận mới: ${newCode}`,
            [{ text: 'OK' }]
        );
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
                    {/* Nút quay lại */}
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handleBackToLogin}
                    >
                        <ArrowLeft size={24} color="#333" />
                        <Text style={styles.backText}>Quay lại</Text>
                    </TouchableOpacity>

                    {/* Tiêu đề */}
                    <View style={styles.header}>
                        <Text style={styles.title}>🔐 Quên mật khẩu</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 
                                ? 'Nhập email để nhận mã xác nhận'
                                : 'Nhập mã và mật khẩu mới'
                            }
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Bước 1: Nhập email */}
                        {step === 1 && (
                            <>
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

                                <TouchableOpacity
                                    style={[styles.button, isLoading && styles.buttonDisabled]}
                                    onPress={handleSendResetCode}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Gửi mã xác nhận</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Bước 2: Nhập mã và mật khẩu */}
                        {step === 2 && (
                            <>
                                {/* Mã xác nhận */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Mã xác nhận (6 số)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mã từ email"
                                        placeholderTextColor="#999"
                                        value={resetCode}
                                        onChangeText={setResetCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!isLoading}
                                    />
                                    
                                    {/* Nút gửi lại mã */}
                                    <TouchableOpacity 
                                        style={styles.resendButton}
                                        onPress={handleResendCode}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.resendText}>Gửi lại mã</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Mật khẩu mới */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Mật khẩu mới</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <Lock size={20} color="#777" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { paddingLeft: 45 }]}
                                            placeholder="Ít nhất 6 ký tự"
                                            placeholderTextColor="#999"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPassword}
                                            editable={!isLoading}
                                        />
                                        <TouchableOpacity 
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeButton}
                                        >
                                            <Text style={styles.eyeText}>
                                                {showPassword ? 'Ẩn' : 'Hiện'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Xác nhận mật khẩu */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Xác nhận mật khẩu</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <Lock size={20} color="#777" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { paddingLeft: 45 }]}
                                            placeholder="Nhập lại mật khẩu mới"
                                            placeholderTextColor="#999"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showPassword}
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>

                                {/* Nút hành động */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.secondaryButton]}
                                        onPress={handleBackToEmail}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.secondaryButtonText}>Quay lại</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, isLoading && styles.buttonDisabled]}
                                        onPress={handleResetPassword}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <>
                                                <CheckCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
                                                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* Thông báo */}
                        <View style={styles.note}>
                            <Text style={styles.noteTitle}>💡 Lưu ý:</Text>
                            <Text style={styles.noteText}>
                                • Mã xác nhận có hiệu lực trong 10 phút{'\n'}
                                • Kiểm tra hộp thư spam nếu không thấy email{'\n'}
                                • Mật khẩu phải có ít nhất 6 ký tự
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- Styles ---
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
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 15,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    passwordInputContainer: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        top: 15,
        zIndex: 1,
    },
    eyeButton: {
        position: 'absolute',
        right: 15,
        top: 15,
        padding: 5,
    },
    eyeText: {
        color: '#0A84FF',
        fontSize: 14,
        fontWeight: '600',
    },
    resendButton: {
        position: 'absolute',
        right: 15,
        top: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
    },
    resendText: {
        color: '#0A84FF',
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#0A84FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
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
    secondaryButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flex: 1,
        marginRight: 10,
    },
    secondaryButtonText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 30,
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