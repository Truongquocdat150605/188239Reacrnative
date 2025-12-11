
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

type Address = {
    id: string;
    name: string;
    phone: string;
    detail: string;
    isDefault: boolean;
    type: 'Home' | 'Office';
};

const MOCK_ADDRESSES: Address[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        detail: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
        isDefault: true,
        type: 'Home'
    },
    {
        id: '2',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        detail: 'Tòa nhà Bitexco, Số 2 Hải Triều, Quận 1, TP. Hồ Chí Minh',
        isDefault: false,
        type: 'Office'
    }
];

export default function AddressesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // New address state
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newDetail, setNewDetail] = useState('');
    const [newType, setNewType] = useState<'Home' | 'Office'>('Home');

    const handleDelete = (id: string) => {
        Alert.alert(
            "Xóa địa chỉ",
            "Bạn có chắc muốn xóa địa chỉ này?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Xóa", 
                    style: "destructive",
                    onPress: () => {
                        setAddresses(prev => prev.filter(addr => addr.id !== id));
                    }
                }
            ]
        );
    };

    const handleSetDefault = (id: string) => {
        setAddresses(prev => prev.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })));
    };

    const handleAddAddress = () => {
        if (!newName || !newPhone || !newDetail) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        const newAddr: Address = {
            id: Date.now().toString(),
            name: newName,
            phone: newPhone,
            detail: newDetail,
            isDefault: addresses.length === 0,
            type: newType
        };

        setAddresses([...addresses, newAddr]);
        setShowAddForm(false);
        setNewName('');
        setNewPhone('');
        setNewDetail('');
        Alert.alert("Thành công", "Đã thêm địa chỉ mới");
    };

    const renderItem = ({ item }: { item: Address }) => (
        <View style={styles.addressCard}>
            <View style={styles.cardHeader}>
                <View style={styles.tagRow}>
                    <Text style={styles.typeTag}>{item.type === 'Home' ? 'Nhà Riêng' : 'Văn Phòng'}</Text>
                    {item.isDefault && <Text style={styles.defaultTag}>Mặc định</Text>}
                </View>
                {!item.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(item.id)}>
                        <Text style={styles.setDefaultText}>Thiết lập mặc định</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.namePhone}>{item.name} | {item.phone}</Text>
            <Text style={styles.addressDetail}>{item.detail}</Text>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Sửa", "Tính năng đang phát triển")}>
                    <Edit2 size={16} color={COLORS.primary} />
                    <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                {!item.isDefault && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                        <Trash2 size={16} color="#FF3B30" />
                        <Text style={[styles.actionText, {color: '#FF3B30'}]}>Xóa</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (showAddForm) {
        return (
            <View style={styles.container}>
                 <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                    <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
                    <View style={{width: 24}} />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Nhập họ tên" />
                    
                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput style={styles.input} value={newPhone} onChangeText={setNewPhone} placeholder="Nhập số điện thoại" keyboardType="phone-pad" />
                    
                    <Text style={styles.label}>Địa chỉ chi tiết</Text>
                    <TextInput style={[styles.input, {height: 80}]} value={newDetail} onChangeText={setNewDetail} placeholder="Số nhà, đường, phường/xã..." multiline />
                    
                    <Text style={styles.label}>Loại địa chỉ</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity 
                            style={[styles.typeBtn, newType === 'Home' && styles.typeBtnActive]} 
                            onPress={() => setNewType('Home')}
                        >
                            <Text style={[styles.typeBtnText, newType === 'Home' && styles.typeBtnTextActive]}>Nhà Riêng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.typeBtn, newType === 'Office' && styles.typeBtnActive]} 
                            onPress={() => setNewType('Office')}
                        >
                            <Text style={[styles.typeBtnText, newType === 'Office' && styles.typeBtnTextActive]}>Văn Phòng</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress}>
                        <Text style={styles.saveBtnText}>Lưu Địa Chỉ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Địa chỉ nhận hàng</Text>
                <TouchableOpacity onPress={() => setShowAddForm(true)}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={addresses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    
    listContent: {
        padding: 15,
    },
    addressCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeTag: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    defaultTag: {
        fontSize: 12,
        color: COLORS.primary,
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.primary,
        fontWeight: '500',
    },
    setDefaultText: {
        fontSize: 12,
        color: COLORS.primary,
    },
    namePhone: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    addressDetail: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        color: COLORS.primary,
    },
    
    // Form Styles
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 5,
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    typeBtnActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F9FF',
    },
    typeBtnText: {
        color: '#666',
        fontWeight: '500',
    },
    typeBtnTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
