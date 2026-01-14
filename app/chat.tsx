// FILE: app/chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Mic, MoreVertical } from 'lucide-react-native';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

import { COLORS } from '../theme/colors';
import { db } from '../app/firebaseConfig'; // Import từ file config của bạn

const API_KEY = "AIzaSyDNJeXwDrcgAKSmaV3kM8Cc8VrsKxo1JwE";

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

// Quick replies tạm thời, sẽ được cập nhật động
const DEFAULT_QUICK_REPLIES = [
    "Cửa hàng ở đâu?",
    "Chính sách bảo hành?",
    "Tư vấn nhẫn cầu hôn",
    "Có bán vàng không?"
];

type Product = {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    imageUrl: string;
    material: string;
    isNew: boolean;
    isSale: boolean;
    rating: number;
    specifications?: {
        material?: string;
        length?: string;
        [key: string]: any;
    };
};

type ContentItem = {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
};

export default function ChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList<Message>>(null);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào! 👋\nMình là trợ lý AI của Luxe Jewelry. Mình có thể giúp bạn tìm trang sức ưng ý hoặc giải đáp thắc mắc về dịch vụ.',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);

    // Load products từ Firebase
    useEffect(() => {
        loadProductsFromFirebase();
    }, []);

    const loadProductsFromFirebase = async () => {
        try {
            setLoadingProducts(true);
            console.log("🔄 Đang tải sản phẩm từ Firebase...");

            const productsRef = collection(db, 'products');
            // Chỉ lấy sản phẩm có giá và tên
            const q = query(
                productsRef,
                where('price', '>', 0),
                orderBy('price', 'desc'),
                limit(20) // Giới hạn 20 sản phẩm để tránh token limit
            );

            const querySnapshot = await getDocs(q);
            const productsList: Product[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Lấy material từ specifications hoặc từ trường material trực tiếp
                let material = 'Không xác định';
                if (data.specifications && typeof data.specifications === 'object') {
                    material = data.specifications.material || 'Không xác định';
                } else if (data.material) {
                    material = data.material;
                }

                productsList.push({
                    id: doc.id,
                    name: data.name || 'Sản phẩm',
                    price: data.price || 0,
                    categoryId: data.categoryId || 'uncategorized',
                    imageUrl: data.imageUrl || '',
                    material: material,
                    isNew: data.isNew || false,
                    isSale: data.isSale || false,
                    rating: data.rating || 0,
                    specifications: typeof data.specifications === 'object' ? data.specifications : {}
                });
            });

            console.log(`✅ Đã load ${productsList.length} sản phẩm`);
            setProducts(productsList);

            // Cập nhật quick replies từ categories
            updateQuickReplies(productsList);

        } catch (error) {
            console.error('❌ Lỗi load products:', error);
            Alert.alert('Thông báo', 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoadingProducts(false);
        }
    };

    const updateQuickReplies = (productsList: Product[]) => {
        if (productsList.length === 0) return;

        // Lấy categories unique
        const categories = [...new Set(productsList.map(p => p.categoryId))];

        // Tạo quick replies từ categories
        const categoryReplies = categories.slice(0, 2).map(cat => {
            const categoryNames: Record<string, string> = {
                'kids': 'trẻ em',
                'rings': 'nhẫn',
                'necklaces': 'dây chuyền',
                'bracelets': 'lắc tay',
                'earrings': 'bông tai'
            };
            const catName = categoryNames[cat] || cat;
            return `Có ${catName} nào không?`;
        });

        // Lấy sản phẩm bán chạy/giảm giá
        const featuredProducts = productsList
            .filter(p => p.isSale || p.rating > 4)
            .slice(0, 2)
            .map(p => `Tư vấn ${p.name.toLowerCase()}`);

        setQuickReplies([
            ...categoryReplies,
            ...featuredProducts,
            "Cửa hàng ở đâu?",
            "Chính sách bảo hành?",
            "Giờ mở cửa thế nào?"
        ]);
    };

    // Cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isTyping]);

    // Hàm gọi API Gemini với data từ Firebase
    //     const callGeminiAPI = async (userMessage: string, history: Message[]) => {
    //         if (!API_KEY) {
    //             return "⚠️ Vui lòng cấu hình API Key để sử dụng AI.";
    //         }

    //         // const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
    //         const url =
    //             `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

    //         /* ======================
    //            1️⃣ TẠO CONTEXT SẢN PHẨM
    //         ====================== */
    //         let productContext = "Hiện tại cửa hàng chưa có thông tin sản phẩm.";

    //         if (products.length > 0) {
    //             productContext = products.slice(0, 10).map(p => {
    //                 const price = p.price
    //                     ? p.price.toLocaleString('vi-VN') + 'đ'
    //                     : 'Liên hệ';
    //                 const material = p.specifications?.material || p.material || 'Không xác định';
    //                 const category = getCategoryName(p.categoryId);
    //                 const saleTag = p.isSale ? " (ĐANG GIẢM GIÁ)" : "";
    //                 const newTag = p.isNew ? " (MỚI)" : "";

    //                 return `- ${p.name}${saleTag}${newTag}: Giá ${price}. Loại: ${category}. Chất liệu: ${material}.`;
    //             }).join('\n');
    //         }

    //         /* ======================
    //            2️⃣ SYSTEM PROMPT (GỘP VÀO TEXT)
    //         ====================== */
    //         const systemPrompt = `
    // Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của cửa hàng trang sức "Luxe Jewelry".

    // DANH SÁCH SẢN PHẨM HIỆN CÓ:
    // ${productContext}

    // QUY TẮC TRẢ LỜI:
    // 1. Chỉ tư vấn sản phẩm có trong danh sách
    // 2. Không bịa sản phẩm không tồn tại
    // 3. Nếu sản phẩm đang giảm giá → nhắc khuyến mãi
    // 4. Nếu là sản phẩm mới → nhắc là hàng mới
    // 5. Giọng điệu thân thiện, xưng "mình", gọi khách là "bạn"

    // CHÍNH SÁCH CỬA HÀNG:
    // - Địa chỉ: 123 Lê Lợi, Q1, TP.HCM
    // - Hotline: 1900 1234 (8h–22h)
    // - Miễn phí ship đơn > 1.000.000đ
    // - Bảo hành trọn đời
    // - Đổi trả trong 7 ngày
    // `;

    //         /* ======================
    //            3️⃣ GỘP LỊCH SỬ CHAT
    //         ====================== */
    //         const chatHistory = history
    //             .filter(m => m.id !== '1')
    //             .map(m => `${m.sender === 'user' ? 'Khách' : 'AI'}: ${m.text}`)
    //             .join('\n');

    //         /* ======================
    //            4️⃣ PROMPT CUỐI GỬI GEMINI
    //         ====================== */
    //         const fullPrompt = `
    // ${systemPrompt}

    // --------------------
    // LỊCH SỬ HỘI THOẠI:
    // ${chatHistory}

    // --------------------
    // CÂU HỎI HIỆN TẠI:
    // ${userMessage}
    // `;

    //         try {
    //             const response = await fetch(url, {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({
    //                     contents: [
    //                         {
    //                             role: 'user',
    //                             parts: [{ text: fullPrompt }]
    //                         }
    //                     ],
    //                     generationConfig: {
    //                         temperature: 0.8,
    //                         maxOutputTokens: 500
    //                     }
    //                 })
    //             });

    //             const data = await response.json();

    //             if (data.error) {
    //                 console.error("API Error:", data.error);
    //                 return "⚠️ Hệ thống AI đang bận, bạn vui lòng thử lại sau nhé!";
    //             }

    //             return (
    //                 data.candidates?.[0]?.content?.parts?.[0]?.text ||
    //                 "Xin lỗi, mình chưa hiểu rõ câu hỏi của bạn. Bạn nói rõ hơn giúp mình nhé!"
    //             );

    //         } catch (error) {
    //             console.error("Network Error:", error);
    //             return "❌ Có lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
    //         }
    //     };
    const callGeminiAPI = async (userMessage: string, history: Message[]) => {
        if (!API_KEY) return "⚠️ Chưa cấu hình API Key.";

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        // 1️⃣ Context sản phẩm từ Firebase
        const productContext = products.length === 0
            ? "Cửa hàng hiện chưa có sản phẩm."
            : products.slice(0, 8).map(p =>
                `- ${p.name} | ${p.price.toLocaleString('vi-VN')}đ | ${getCategoryName(p.categoryId)} | ${p.material}`
            ).join('\n');

        // 2️⃣ System prompt (AI HIỂU SHOP)
        const systemPrompt = `
Bạn là trợ lý AI của cửa hàng trang sức "Luxe Jewelry".

VAI TRÒ:
- Khi câu hỏi LIÊN QUAN đến trang sức / mua sắm → tư vấn dựa trên sản phẩm bên dưới
- Khi câu hỏi KHÔNG liên quan đến cửa hàng → vẫn trả lời thân thiện như trợ lý AI thông thường
- Không bịa sản phẩm không tồn tại trong danh sách

QUY TẮC:
- Xưng "mình", gọi khách là "bạn"
- Giọng thân thiện, tự nhiên
- Ưu tiên dẫn dắt câu chuyện quay lại nhu cầu mua sắm nếu phù hợp

THÔNG TIN SHOP:
- Tên: Luxe Jewelry
- Địa chỉ: 123 Lê Lợi, Q1, TP.HCM
- Hotline: 1900 1234
- Bảo hành trọn đời – đổi trả 7 ngày

DANH SÁCH SẢN PHẨM:
${productContext}
`;


        // 3️⃣ Gộp lịch sử chat (để hỏi nhiều câu vẫn hiểu)
        const chatHistory = history
            .filter(m => m.id !== '1')
            .map(m => `${m.sender === 'user' ? 'Khách' : 'AI'}: ${m.text}`)
            .join('\n');

        const finalPrompt = `
${systemPrompt}

LỊCH SỬ HỘI THOẠI:
${chatHistory}

KHÁCH HỎI:
${userMessage}
`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: finalPrompt }]
                        }
                    ]
                })
            });

            const data = await res.json();

            return data.candidates?.[0]?.content?.parts?.[0]?.text
                || "Mình chưa tìm được sản phẩm phù hợp cho bạn.";

        } catch (e) {
            console.error(e);
            return "❌ Lỗi kết nối mạng.";
        }
    };



    // Helper function để chuyển categoryId thành tên
    const getCategoryName = (categoryId: string): string => {
        const categoryMap: Record<string, string> = {
            'kids': 'Trang sức trẻ em',
            'rings': 'Nhẫn',
            'necklaces': 'Dây chuyền',
            'bracelets': 'Lắc tay',
            'earrings': 'Bông tai',
            'watches': 'Đồng hồ',
            'uncategorized': 'Trang sức'
        };
        return categoryMap[categoryId] || categoryId;
    };

    const handleSend = async (text: string = inputText) => {
        if (!text.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        // 👉 tạo history đúng
        const newHistory = [...messages, userMsg];

        setMessages(newHistory);
        setInputText('');
        setIsTyping(true);

        try {
            const reply = await callGeminiAPI(text, newHistory);

            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: reply,
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);
        } catch (e) {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: "❌ Có lỗi xảy ra, thử lại sau nhé.",
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };


    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.msgWrapper, isUser ? styles.msgWrapperRight : styles.msgWrapperLeft]}>
                {!isUser && (
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }}
                        style={styles.botAvatar}
                    />
                )}
                <View style={[styles.msgBubble, isUser ? styles.msgBubbleRight : styles.msgBubbleLeft]}>
                    <Text style={[styles.msgText, isUser ? styles.msgTextRight : styles.msgTextLeft]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.msgTime, isUser ? styles.msgTimeRight : styles.msgTimeLeft]}>
                        {formatTime(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Trợ lý AI Luxe</Text>
                        <View style={styles.onlineStatus}>
                            <View style={[
                                styles.dot,
                                !API_KEY ? { backgroundColor: 'red' } :
                                    loadingProducts ? { backgroundColor: 'orange' } : {}
                            ]} />
                            <Text style={styles.statusText}>
                                {!API_KEY ? "Chưa có API Key" :
                                    loadingProducts ? "Đang tải sản phẩm..." :
                                        `Sẵn sàng (${products.length} sản phẩm)`}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={loadProductsFromFirebase}>
                    <MoreVertical size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Product Loading Indicator */}
            {loadingProducts && (
                <View style={styles.loadingProductsContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingProductsText}>
                        Đang tải danh sách sản phẩm từ cửa hàng...
                    </Text>
                </View>
            )}

            {/* Message List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    isTyping ? (
                        <View style={styles.typingContainer}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }}
                                style={styles.botAvatar}
                            />
                            <View style={styles.typingBubble}>
                                <ActivityIndicator size="small" color={COLORS.subText} />
                                <Text style={styles.typingText}>Đang soạn tin nhắn...</Text>
                            </View>
                        </View>
                    ) : null
                }
            />

            {/* Quick Replies */}
            <View style={styles.quickReplyContainer}>
                <FlatList
                    horizontal
                    data={quickReplies}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.chip}
                            onPress={() => handleSend(item)}
                            disabled={isTyping || !API_KEY}
                        >
                            <Text style={styles.chipText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Mic size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder={!API_KEY ? "Cần cấu hình API Key..." : "Nhập tin nhắn..."}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => handleSend()}
                        editable={!isTyping && !!API_KEY}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!inputText.trim() || isTyping || !API_KEY) && styles.sendBtnDisabled]}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim() || isTyping || !API_KEY}
                    >
                        {isTyping ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Send size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
        marginRight: 10
    },
    headerInfo: {
        justifyContent: 'center'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 4
    },
    statusText: {
        fontSize: 11,
        color: '#10B981'
    },

    // Loading Products
    loadingProductsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: '#E3F2FD',
        marginHorizontal: 15,
        marginTop: 5,
        borderRadius: 8,
    },
    loadingProductsText: {
        marginLeft: 8,
        color: '#1565C0',
        fontSize: 12,
    },

    // Messages
    listContent: {
        padding: 15,
        paddingBottom: 10,
    },
    msgWrapper: {
        marginBottom: 15,
        flexDirection: 'row',
        maxWidth: '85%',
    },
    msgWrapperLeft: {
        alignSelf: 'flex-start'
    },
    msgWrapperRight: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end'
    },

    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        alignSelf: 'flex-end',
        backgroundColor: '#FFF',
    },
    msgBubble: {
        padding: 12,
        borderRadius: 16,
        minWidth: 60,
    },
    msgBubbleLeft: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
    },
    msgBubbleRight: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 22
    },
    msgTextLeft: {
        color: COLORS.text
    },
    msgTextRight: {
        color: 'white'
    },

    msgTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end'
    },
    msgTimeLeft: {
        color: '#999'
    },
    msgTimeRight: {
        color: 'rgba(255,255,255,0.7)'
    },

    // Typing
    typingContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    typingBubble: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        marginLeft: 8,
        fontSize: 13,
        color: COLORS.subText,
    },

    // Quick Replies
    quickReplyContainer: {
        height: 50,
        backgroundColor: '#F5F7FA',
    },
    chip: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 10,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    chipText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '500',
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    attachBtn: {
        padding: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 8,
        maxHeight: 100,
        fontSize: 15,
        color: COLORS.text,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: '#CCC',
    },
});