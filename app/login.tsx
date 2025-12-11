import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from "expo-router";
import { MOCK_USERS } from '../lib/users';
import { useAuth } from '../lib/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
            return;
        }

        setIsLoading(true);

        setTimeout(async () => {
            setIsLoading(false);

            // Tìm user trong mock DB
            const foundUser = MOCK_USERS.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (foundUser) {
                // Cập nhật Global State thông qua Context
                login({
                    name: foundUser.name,
                    email: foundUser.email,
                    phone: '0901234567', // Mock phone vì MOCK_USERS chưa có
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.name)}&background=0A84FF&color=fff`
                });

                Alert.alert('🎉 Thành công', `Chào mừng ${foundUser.name}!`);
                router.replace('/home'); // Chuyển sang Tabs chính
            } else {
                Alert.alert('❌ Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác');
            }

        }, 1500);
    };


    const handleRegister = () => {
        router.push('/SignupScreen');
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert('Thông báo', `Đang đăng nhập bằng ${provider}... (Chức năng chưa tích hợp API)`);
    };
    
    // Chuyển hướng sang màn hình Quên Mật Khẩu
    const handleForgotPassword = () => {
        router.push('/forgot-password'); 
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Logo/Icon */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>🧑‍💻</Text>
                </View>

                {/* Header */}
                <Text style={styles.welcomeTitle}>Chào mừng trở lại</Text>
                <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

                {/* --- Form Đăng nhập --- */}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Mail size={20} color="#777" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                </View>

                {/* Password Input */}
                <View style={[styles.inputContainer, { marginBottom: 10 }]}>
                    <Lock size={20} color="#777" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} disabled={isLoading}>
                        {showPassword ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
                    </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={handleForgotPassword}
                >
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                {/* Button Đăng nhập */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Đăng nhập</Text>
                    )}
                </TouchableOpacity>

                {/* --- Social Login Section --- */}

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                    <View style={styles.divider} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialRow}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Google')}
                        disabled={isLoading}
                    >
                        <Text style={styles.socialText}>G</Text>
                        <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Facebook')}
                        disabled={isLoading}
                    >
                        <Text style={styles.socialText}>f</Text>
                        <Text style={styles.socialButtonText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                {/* Đăng ký Link */}
                <TouchableOpacity style={styles.registerLinkContainer} onPress={handleRegister}>
                    <Text style={styles.registerText}>
                        Chưa có tài khoản? <Text style={styles.registerLink}>Đăng ký ngay</Text>
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 40,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoText: {
        fontSize: 48,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeButton: {
        padding: 5,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#0A84FF',
        fontWeight: '600',
    },
    button: {
        width: '100%',
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
        width: '100%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#D1D5DB',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#9CA3AF',
        fontSize: 14,
    },
    socialRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 15,
        marginBottom: 30,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    socialText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#333',
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    registerLinkContainer: {
        marginTop: 10,
    },
    registerText: {
        fontSize: 14,
        color: '#6B7280',
    },
    registerLink: {
        color: '#0A84FF',
        fontWeight: 'bold',
    },
});