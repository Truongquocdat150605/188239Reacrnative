import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Camera } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../lib/AuthContext';
import { updateUserProfile } from '../app/services/userService'; // 🔥 THÊM

// ... imports ...

export default function EditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuth(); // 🔥 KHÔNG có loading từ context

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [localLoading, setLocalLoading] = useState(true); // 🔥 THÊM local loading

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setLocalLoading(false); // 🔥 ĐÃ load xong
        } else {
            // Nếu không có user, quay về trang chủ
            router.back();
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Tên không được để trống");
            return;
        }

        if (!user?.uid) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
            return;
        }

        setSaving(true);
        try {
            await updateUserProfile(user.uid, {
                name: name.trim(),
                phone: phone.trim()
            });

            updateUser({
                name: name.trim(),
                phone: phone.trim()
            });

            Alert.alert("Thành công", "Cập nhật thông tin thành công!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật profile:", error);
            Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    if (localLoading) { // 🔥 DÙNG localLoading thay vì authLoading
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>Đang tải thông tin...</Text>
            </View>
        );
    }

    if (!user) { // 🔥 Kiểm tra user tồn tại
        return null; // Hoặc redirect
    }
    const handleAvatarChange = () => {
        Alert.alert("Thông báo", "Chức năng thay đổi ảnh đại diện sẽ có trong phiên bản sau");
    };
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Text style={styles.saveText}>Lưu</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handleAvatarChange} style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=default' }}
                            style={styles.avatar}
                        />
                        <View style={styles.cameraBtn}>
                            <Camera size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Chạm để thay đổi ảnh</Text>
                </View>

                {/* Form */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <View style={styles.inputWrapper}>
                        <User size={20} color="#999" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nhập họ tên"
                            editable={!saving}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputWrapper, styles.disabledInput]}>
                        <Mail size={20} color="#999" style={styles.icon} />
                        <TextInput
                            style={[styles.input, { color: '#888' }]}
                            value={email}
                            editable={false}
                        />
                    </View>
                    <Text style={styles.note}>Email không thể thay đổi</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <View style={styles.inputWrapper}>
                        <Phone size={20} color="#999" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="Nhập số điện thoại"
                            editable={!saving}
                        />
                    </View>
                </View>

                {/* Thông tin bổ sung - SỬA LẠI */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Thông tin tài khoản</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID người dùng:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {user?.uid ? `${user.uid.substring(0, 10)}...` : 'Không có'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày tạo:</Text>
                        <Text style={styles.infoValue}>
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                                : 'Không rõ'}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

// ... styles giữ nguyên ...

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    saveText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
    changePhotoText: {
        color: COLORS.subText,
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
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
    disabledInput: {
        backgroundColor: '#F5F5F5',
        borderColor: '#EEE',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
    },
    note: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        marginLeft: 4,
    },
    infoSection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.subText,
    },
    infoValue: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '500',
    },
});