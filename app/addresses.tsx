import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../app/firebaseConfig';
import { useAuth } from '../lib/AuthContext';

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

const geocodeAddress = async (address: string) => {
    if (!address || address.trim().length < 5) {
        throw new Error("Địa chỉ quá ngắn");
    }

    // Xóa dấu ngoặc kép nếu có
    const cleanAddress = address.replace(/"/g, '').trim();
    const encodedAddress = encodeURIComponent(cleanAddress);
    
    // THỬ 2 endpoint khác nhau
    const urls = [
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=vn&limit=1`,
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&accept-language=vi&limit=1`
    ];

    console.log("🌐 Geocoding address:", cleanAddress);

    for (let i = 0; i < urls.length; i++) {
        try {
            console.log(`🔗 Trying URL ${i + 1}:`, urls[i]);
            
            const res = await fetch(urls[i], {
                headers: { 
                    "User-Agent": "MyEcommerceApp/1.0 (myemail@example.com)",
                    "Accept": "application/json",
                    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8"
                }
            });

            if (!res.ok) {
                console.log(`⚠️ URL ${i + 1} failed with status:`, res.status);
                continue;
            }

            const data = await res.json();
            console.log(`📍 Geocode response from URL ${i + 1}:`, data);

            if (data && data.length > 0) {
                console.log("✅ Geocode success!");
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    displayName: data[0].display_name,
                };
            }
        } catch (error) {
            // FIX: Type assertion
            const err = error as Error;
            console.warn(`⚠️ URL ${i + 1} error:`, err.message);
            // Thử URL tiếp theo
        }
    }

    // Nếu tất cả đều thất bại, thử fallback API
    console.log("🔄 Trying fallback API...");
    return await tryFallbackGeocode(cleanAddress);
};/* ================= FALLBACK GEOCODE ================= */
const tryFallbackGeocode = async (address: string) => {
    // 1. Thử LocationIQ (free tier)
    try {
        const LOCATIONIQ_KEY = "pk.YOUR_KEY_HERE"; // Cần đăng ký free
        const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data[0]) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name,
            };
        }
    } catch (error) {
    const err = error as Error; // 👈 Thêm dòng này
    console.warn("LocationIQ failed:", err.message);
}

    // 2. Thử Google Maps Geocoding (cần API key)
    // const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
    
    throw new Error("Không thể xác định tọa độ. Lưu địa chỉ không có tọa độ.");
};/* ================= COMPONENT ================= */
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
/* ================= ADD ADDRESS ================= */
const handleAddAddress = async () => {
    if (!newName || !newPhone || !newDetail) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
    }
    if (!user?.uid) return;

    try {
        // THỬ geocode nhưng KHÔNG bắt buộc thành công
        let location = null;
        try {
            location = await geocodeAddress(newDetail);
            console.log("📍 Geocode success:", location);
        } catch (geocodeError) {
            console.warn("⚠️ Geocode failed, saving without coordinates:", geocodeError);
            // Vẫn tiếp tục lưu địa chỉ, không có tọa độ
        }

        await addDoc(
            collection(db, 'users', user.uid, 'addresses'),
            {
                name: newName,
                phone: newPhone,
                detail: newDetail,
                type: newType,
                isDefault: addresses.length === 0,
                ...(location && { lat: location.lat, lng: location.lng }), // Chỉ thêm nếu có
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
        Alert.alert("Lỗi", "Không thể thêm địa chỉ. Vui lòng thử lại.");
    }
};    /* ================= SET DEFAULT ================= */
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
