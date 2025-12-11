
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChangePassword = () => {
        if (!currentPass || !newPass || !confirmPass) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (newPass.length < 8) {
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }

        if (newPass !== confirmPass) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
            return;
        }

        // Giả lập call API
        Alert.alert(
            "Thành công",
            "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
            [
                { text: "OK", onPress: () => router.replace('/login') }
            ]
        );
    };

    const PasswordInput = ({ label, value, onChange, show, toggleShow, placeholder }: any) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Lock size={20} color="#999" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!show}
                    placeholder={placeholder}
                    placeholderTextColor="#CCC"
                />
                <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
                    {show ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
             <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
                <View style={{width: 24}} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.desc}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</Text>

                <PasswordInput 
                    label="Mật khẩu hiện tại"
                    value={currentPass}
                    onChange={setCurrentPass}
                    show={showCurrent}
                    toggleShow={() => setShowCurrent(!showCurrent)}
                    placeholder="Nhập mật khẩu hiện tại"
                />

                <PasswordInput 
                    label="Mật khẩu mới"
                    value={newPass}
                    onChange={setNewPass}
                    show={showNew}
                    toggleShow={() => setShowNew(!showNew)}
                    placeholder="Ít nhất 8 ký tự"
                />

                <PasswordInput 
                    label="Xác nhận mật khẩu mới"
                    value={confirmPass}
                    onChange={setConfirmPass}
                    show={showConfirm}
                    toggleShow={() => setShowConfirm(!showConfirm)}
                    placeholder="Nhập lại mật khẩu mới"
                />

                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>Xác nhận</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert("Quên mật khẩu", "Vui lòng liên hệ CSKH")}>
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    content: {
        padding: 20,
    },
    desc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
    },
    eyeBtn: {
        padding: 8,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    forgotBtn: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotText: {
        color: COLORS.primary,
        fontSize: 14,
    },
});
