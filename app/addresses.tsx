import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

import { useAuth } from '../lib/AuthContext';
import { db } from '../app/firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    writeBatch,
    serverTimestamp,
} from 'firebase/firestore';

/* ================= TYPES ================= */
type Address = {
    id: string;
    name: string;
    phone: string;
    detail: string;
    isDefault: boolean;
    type: 'Home' | 'Office';
    lat?: number;
    lng?: number;
};

/* ================= GEOCODE (OUTSIDE COMPONENT) ================= */
const geocodeAddress = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const res = await fetch(url, {
        headers: { "User-Agent": "expo-app" }
    });

    const data = await res.json();

    if (!data || data.length === 0) {
        throw new Error("Không tìm thấy tọa độ");
    }

    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
    };
};

/* ================= COMPONENT ================= */
export default function AddressesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newDetail, setNewDetail] = useState('');
    const [newType, setNewType] = useState<'Home' | 'Office'>('Home');

    /* ================= LOAD ADDRESSES ================= */
    useEffect(() => {
        if (!user?.uid) return;

        const loadAddresses = async () => {
            const snap = await getDocs(
                collection(db, 'users', user.uid, 'addresses')
            );

            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Address, 'id'>),
            }));

            setAddresses(list);
        };

        loadAddresses();
    }, [user]);

    /* ================= ADD ADDRESS ================= */
    const handleAddAddress = async () => {
        if (!newName || !newPhone || !newDetail) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (!user?.uid) return;

        try {
            const location = await geocodeAddress(newDetail);

            await addDoc(
                collection(db, 'users', user.uid, 'addresses'),
                {
                    name: newName,
                    phone: newPhone,
                    detail: newDetail,
                    type: newType,
                    isDefault: addresses.length === 0,
                    lat: location.lat,
                    lng: location.lng,
                    createdAt: serverTimestamp(),
                }
            );

            setShowAddForm(false);
            setNewName('');
            setNewPhone('');
            setNewDetail('');

            Alert.alert('Thành công', 'Đã thêm địa chỉ mới');

            // reload
            const snap = await getDocs(
                collection(db, 'users', user.uid, 'addresses')
            );
            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Address, 'id'>),
            }));
            setAddresses(list);

        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không xác định được vị trí địa chỉ");
        }
    };

    /* ================= SET DEFAULT ================= */
    const handleSetDefault = async (id: string) => {
        if (!user?.uid) return;

        const batch = writeBatch(db);

        addresses.forEach(addr => {
            const ref = doc(db, 'users', user.uid, 'addresses', addr.id);
            batch.update(ref, { isDefault: addr.id === id });
        });

        await batch.commit();

        setAddresses(prev =>
            prev.map(addr => ({
                ...addr,
                isDefault: addr.id === id,
            }))
        );
    };

    /* ================= DELETE ================= */
    const handleDelete = (id: string) => {
        if (!user?.uid) return;

        Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    await deleteDoc(
                        doc(db, 'users', user.uid, 'addresses', id)
                    );
                    setAddresses(prev => prev.filter(a => a.id !== id));
                },
            },
        ]);
    };

    /* ================= RENDER ITEM ================= */
    const renderItem = ({ item }: { item: Address }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.tagRow}>
                    <Text style={styles.typeTag}>
                        {item.type === 'Home' ? 'Nhà Riêng' : 'Văn Phòng'}
                    </Text>
                    {item.isDefault && <Text style={styles.defaultTag}>Mặc định</Text>}
                </View>

                {!item.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(item.id)}>
                        <Text style={styles.setDefault}>Thiết lập mặc định</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.name}>{item.name} | {item.phone}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
        </View>
    );

    /* ================= ADD FORM ================= */
    if (showAddForm) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => setShowAddForm(false)}>
                        <ArrowLeft size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thêm địa chỉ</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.form}>
                    <TextInput
                        placeholder="Họ tên"
                        style={styles.input}
                        value={newName}
                        onChangeText={setNewName}
                    />
                    <TextInput
                        placeholder="Số điện thoại"
                        style={styles.input}
                        keyboardType="phone-pad"
                        value={newPhone}
                        onChangeText={setNewPhone}
                    />
                    <TextInput
                        placeholder="Địa chỉ chi tiết"
                        style={[styles.input, { height: 80 }]}
                        multiline
                        value={newDetail}
                        onChangeText={setNewDetail}
                    />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress}>
                        <Text style={styles.saveText}>Lưu địa chỉ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    /* ================= MAIN ================= */
    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Địa chỉ nhận hàng</Text>
                <TouchableOpacity onPress={() => setShowAddForm(true)}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={addresses}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15 }}
            />
        </View>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },

    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tagRow: { flexDirection: 'row', gap: 8 },
    typeTag: { fontSize: 12, color: '#666' },
    defaultTag: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    setDefault: { fontSize: 12, color: COLORS.primary },

    name: { fontWeight: 'bold', marginBottom: 4 },
    detail: { color: '#555' },

    form: { padding: 20 },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },

    saveBtn: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    saveText: { color: 'white', fontWeight: 'bold' },
});
