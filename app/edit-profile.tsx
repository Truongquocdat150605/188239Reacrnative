
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Camera } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../lib/AuthContext'; // 🆕 Import Auth Context

export default function EditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuth(); // 🆕 Lấy user và hàm update

    // Khởi tạo state từ user context
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    // Cập nhật state khi user thay đổi (load lần đầu)
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Tên không được để trống");
            return;
        }
        
        // 🆕 Cập nhật vào Context
        updateUser({
            name,
            phone
        });

        Alert.alert("Thành công", "Cập nhật thông tin thành công!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <View style={styles.container}>
             <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveText}>Lưu</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image 
                            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=default' }} 
                            style={styles.avatar} 
                        />
                        <TouchableOpacity style={styles.cameraBtn}>
                            <Camera size={20} color="white" />
                        </TouchableOpacity>
                    </View>
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
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputWrapper, styles.disabledInput]}>
                        <Mail size={20} color="#999" style={styles.icon} />
                        <TextInput 
                            style={[styles.input, {color: '#888'}]} 
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
                        />
                    </View>
                </View>

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
    saveText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
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
    }
});