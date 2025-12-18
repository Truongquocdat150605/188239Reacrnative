import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { User, Eye, EyeOff, Check, X } from 'lucide-react-native';
import { Link, useRouter } from "expo-router"; // Thêm useRouter
// import { addUser } from '../lib/users';
// import { saveUserSession } from "../utils/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

interface ValidationErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

// Password Requirement Component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <View style={styles.requirement}>
            {met ? (
                <Check size={12} color="#10B981" />
            ) : (
                <X size={12} color="#9CA3AF" />
            )}
            <Text style={[styles.requirementText, met && styles.requirementMet]}>
                {text}
            </Text>
        </View>
    );
}

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false); // NEW: State loading
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        label: '',
        color: '',
    });

    const router = useRouter(); // Khởi tạo router

    // Validate email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Calculate password strength
    const calculatePasswordStrength = (pwd: string): PasswordStrength => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score === 0 || pwd.length === 0) {
            return { score: 0, label: '', color: '' };
        } else if (score <= 2) {
            return { score: 1, label: 'Yếu', color: '#EF4444' };
        } else if (score <= 3) {
            return { score: 2, label: 'Trung bình', color: '#F59E0B' };
        } else if (score <= 4) {
            return { score: 3, label: 'Mạnh', color: '#10B981' };
        } else {
            return { score: 4, label: 'Rất mạnh', color: '#059669' };
        }
    };

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(password));
    }, [password]);

    // Validate form (Dùng khi nhấn nút)
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Vui lòng nhập họ tên';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
        }

        if (!email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email không đúng định dạng';
        }

        const issues = [];
        if (password.length < 8) issues.push('ít nhất 8 ký tự');
        if (!/[a-z]/.test(password)) issues.push('chữ thường');
        if (!/[A-Z]/.test(password)) issues.push('chữ hoa');
        if (!/[0-9]/.test(password)) issues.push('số');
        if (!/[^a-zA-Z0-9]/.test(password)) issues.push('ký tự đặc biệt');

        if (issues.length > 0) {
            // Chỉ hiển thị lỗi này nếu người dùng đã nhập nhưng chưa đáp ứng yêu cầu
            if (password.length > 0) {
                newErrors.password = `Mật khẩu chưa đáp ứng yêu cầu.`;
            } else {
                newErrors.password = 'Vui lòng nhập mật khẩu';
            }
        } else if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        }


        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

const handleSignup = async () => {
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!agreeToTerms) {
        Alert.alert('Lỗi', 'Vui lòng đồng ý với Điều khoản & Điều kiện');
        return;
    }

    if (!validateForm()) return;

    try {
        setIsLoading(true);

        // 1️⃣ Tạo user Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password
        );

        const uid = userCredential.user.uid;

        // 2️⃣ Tạo document Firestore (ID = UID)
        await setDoc(doc(db, "users", uid), {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: "",
            role: "user",
            createdAt: new Date(),
        });

        Alert.alert("🎉 Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
        router.replace("/login");

    } catch (error: any) {
        Alert.alert(
            "❌ Đăng ký thất bại",
            error.message || "Có lỗi xảy ra"
        );
    } finally {
        setIsLoading(false);
    }
};


    const handleSocialSignup = (provider: string) => {
        Alert.alert('Thông báo', `Đăng ký bằng ${provider}`);
    };

    // Real-time validation cho Name
    useEffect(() => {
        if (touched.name) {
            const newErrors = { ...errors };
            if (!name.trim()) {
                newErrors.name = 'Vui lòng nhập họ tên';
            } else if (name.trim().length < 2) {
                newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
            } else {
                delete newErrors.name;
            }
            setErrors(newErrors);
        }
    }, [name, touched.name]);

    // Real-time validation cho Email
    useEffect(() => {
        if (touched.email) {
            const newErrors = { ...errors };
            if (!email.trim()) {
                newErrors.email = 'Vui lòng nhập email';
            } else if (!validateEmail(email)) {
                newErrors.email = 'Email không đúng định dạng';
            } else {
                delete newErrors.email;
            }
            setErrors(newErrors);
        }
    }, [email, touched.email]);

    // Real-time validation cho Confirm Password
    useEffect(() => {
        if (touched.confirmPassword && confirmPassword) {
            const newErrors = { ...errors };
            if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Mật khẩu không khớp';
            } else {
                delete newErrors.confirmPassword;
            }
            setErrors(newErrors);
        }
    }, [password, confirmPassword, touched.confirmPassword]);

    // Real-time validation cho Password (để xóa lỗi khi người dùng sửa lỗi)
    useEffect(() => {
        if (touched.password && password.length > 0) {
            const newErrors = { ...errors };
            const issues = [];
            if (password.length < 8) issues.push('ít nhất 8 ký tự');
            if (!/[a-z]/.test(password)) issues.push('chữ thường');
            if (!/[A-Z]/.test(password)) issues.push('chữ hoa');
            if (!/[0-9]/.test(password)) issues.push('số');
            if (!/[^a-zA-Z0-9]/.test(password)) issues.push('ký tự đặc biệt');

            if (issues.length === 0) {
                delete newErrors.password;
            }
            setErrors(newErrors);
        }
    }, [password, touched.password]);


    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            {/* Logo */}
            <View style={styles.logoBox}>
                <View style={styles.logoInner}>
                    <User color="#0A84FF" size={30} />
                </View>
            </View>

            {/* Header */}
            <Text style={styles.title}>Tạo Tài Khoản</Text>
            <Text style={styles.subtitle}>Đăng ký để bắt đầu</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, touched.name && errors.name && styles.inputError]}
                    placeholder="Họ và Tên"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    onBlur={() => setTouched({ ...touched, name: true })}
                    editable={!isLoading}
                />
                {touched.name && errors.name && (
                    <View style={styles.errorContainer}>
                        <X size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{errors.name}</Text>
                    </View>
                )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, touched.email && errors.email && styles.inputError]}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                {touched.email && errors.email && (
                    <View style={styles.errorContainer}>
                        <X size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
                <View
                    style={[
                        styles.passwordContainer,
                        touched.password && errors.password && styles.inputError
                    ]}
                >
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Mật khẩu"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        {showPassword ? <EyeOff size={22} color="#777" /> : <Eye size={22} color="#777" />}
                    </TouchableOpacity>
                </View>

                {/* Password Strength */}
                {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                        <View style={styles.strengthBars}>
                            {[1, 2, 3, 4].map((level) => (
                                <View
                                    key={level}
                                    style={[
                                        styles.strengthBar,
                                        {
                                            backgroundColor:
                                                level <= passwordStrength.score
                                                    ? passwordStrength.color
                                                    : '#E5E7EB',
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        {passwordStrength.label && (
                            <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                                Độ mạnh: {passwordStrength.label}
                            </Text>
                        )}
                    </View>
                )}

                {/* Password Requirements */}
                <View style={styles.requirementsContainer}>
                    <PasswordRequirement met={password.length >= 8} text="Ít nhất 8 ký tự" />
                    <PasswordRequirement met={/[A-Z]/.test(password)} text="Có chữ hoa" />
                    <PasswordRequirement met={/[a-z]/.test(password)} text="Có chữ thường" />
                    <PasswordRequirement met={/[0-9]/.test(password)} text="Có số" />
                    <PasswordRequirement
                        met={/[^a-zA-Z0-9]/.test(password)}
                        text="Có ký tự đặc biệt"
                    />
                </View>
                {touched.password && errors.password && (
                    <View style={styles.errorContainer}>
                        <X size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{errors.password}</Text>
                    </View>
                )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
                <View
                    style={[
                        styles.passwordContainer,
                        touched.confirmPassword && errors.confirmPassword && styles.inputError,
                    ]}
                >
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Xác nhận mật khẩu"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                        {showConfirmPassword ? (
                            <EyeOff size={22} color="#777" />
                        ) : (
                            <Eye size={22} color="#777" />
                        )}
                    </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                    <View style={styles.errorContainer}>
                        <X size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    </View>
                )}
                {confirmPassword.length > 0 &&
                    !errors.confirmPassword &&
                    password === confirmPassword && (
                        <View style={styles.successContainer}>
                            <Check size={14} color="#10B981" />
                            <Text style={styles.successText}>Mật khẩu khớp</Text>
                        </View>
                    )}
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
                disabled={isLoading}
            >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                    {agreeToTerms && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>
                    Tôi đồng ý với <Text style={styles.link}>Điều khoản & Điều kiện</Text>
                </Text>
            </TouchableOpacity>

            {/* Signup Button */}
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={isLoading || Object.keys(errors).length > 0}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>Đăng Ký</Text>
                )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>hoặc tiếp tục với</Text>
                <View style={styles.divider} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialSignup('Google')}
                    disabled={isLoading}
                >
                    <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialSignup('Facebook')}
                    disabled={isLoading}
                >
                    <Text style={styles.socialText}>Facebook</Text>
                </TouchableOpacity>
            </View>

            {/* Login Link */}
            <TouchableOpacity
                style={{ marginTop: 20, marginBottom: 30 }}
                onPress={() => router.replace('/login')}
                disabled={isLoading}
            >
                <Text style={styles.register}>
                    Đã có tài khoản? <Text style={styles.registerLink}>Đăng nhập</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
    },
    logoBox: {
        backgroundColor: '#0A84FF',
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoInner: {
        backgroundColor: '#FFF',
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#111827',
    },
    subtitle: {
        color: '#6B7280',
        marginBottom: 25,
        fontSize: 15,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        fontSize: 15,
        color: '#333',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    inputPassword: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#333',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    successText: {
        fontSize: 12,
        color: '#10B981',
    },
    strengthContainer: {
        marginTop: 8,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 6,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    requirementsContainer: {
        marginTop: 8,
        gap: 4,
    },
    requirement: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    requirementText: {
        fontSize: 11,
        color: '#6B7280',
    },
    requirementMet: {
        color: '#10B981',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        marginTop: 8,
        marginBottom: 16,
        gap: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#0A84FF',
        borderColor: '#0A84FF',
    },
    checkboxText: {
        flex: 1,
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    link: {
        color: '#0A84FF',
        fontWeight: '500',
    },
    button: {
        width: '100%',
        backgroundColor: '#0A84FF',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    buttonDisabled: {
        backgroundColor: '#CCC',
        opacity: 0.7,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        width: '100%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#CCC',
    },
    orText: {
        marginHorizontal: 10,
        color: '#777',
        fontSize: 13,
    },
    socialRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    socialButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    socialText: {
        color: '#374151',
        fontWeight: '500',
        fontSize: 14,
    },
    register: {
        color: '#555',
        fontSize: 14,
    },
    registerLink: {
        color: '#0A84FF',
        fontWeight: 'bold',
    },
});