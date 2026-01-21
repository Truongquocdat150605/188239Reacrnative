// FILE: app/chat.tsx
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { ArrowLeft, Eye, Mic, MoreVertical, Send, ShoppingBag } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '../app/firebaseConfig';
import { useCart } from '../lib/CartContext'; // Import CartContext
import { COLORS } from '../theme/colors';

    // const API_KEY = "AIzaSyAptfDX542QSU_WleUYD8540ZgxFG8oPho";
const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Thay bằng API Key của bạn
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

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    products?: Product[]; // Thêm trường products cho tin nhắn bot
};

// Quick replies tạm thời, sẽ được cập nhật động
const DEFAULT_QUICK_REPLIES = [
    "Cửa hàng ở đâu?",
    "Chính sách bảo hành?",
    "Tư vấn nhẫn cầu hôn",
    "Có bán vàng không?"
];

type ContentItem = {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
};

export default function ChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList<Message>>(null);
    const { addToCart } = useCart(); // Sử dụng CartContext

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

        // 2️⃣ System prompt với hướng dẫn trả về JSON format khi có sản phẩm
        const systemPrompt = `
Bạn là trợ lý AI của cửa hàng trang sức "Luxe Jewelry".

VAI TRÒ:
- Khi câu hỏi LIÊN QUAN đến trang sức / mua sắm → tư vấn dựa trên sản phẩm bên dưới
- Khi câu hỏi KHÔNG liên quan đến cửa hàng → vẫn trả lời thân thiện như trợ lý AI thông thường
- Không bịa sản phẩm không tồn tại trong danh sách

QUAN TRỌNG: Khi bạn giới thiệu sản phẩm, hãy tìm trong danh sách sản phẩm dưới đây và thông báo cho tôi:
1. Mô tả sản phẩm một cách hấp dẫn
2. Đề cập đến giá, chất liệu, và các đặc điểm nổi bật
3. Nếu có thể, đề xuất 1-3 sản phẩm phù hợp

DANH SÁCH SẢN PHẨM:
${productContext}

QUY TẮC:
- Xưng "mình", gọi khách là "bạn"
- Giọng thân thiện, tự nhiên
- Ưu tiên dẫn dắt câu chuyện quay lại nhu cầu mua sắm nếu phù hợp

THÔNG TIN SHOP:
- Tên: Luxe Jewelry
- Địa chỉ: 123 Lê Lợi, Q1, TP.HCM
- Hotline: 1900 1234
- Bảo hành trọn đời – đổi trả 7 ngày
`;

        // 3️⃣ Gộp lịch sử chat
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
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
                || "Mình chưa tìm được sản phẩm phù hợp cho bạn.";

            // Xác định sản phẩm được đề cập trong câu trả lời
            const mentionedProducts = findMentionedProducts(aiResponse);
            
            return {
                text: aiResponse,
                products: mentionedProducts
            };

        } catch (e) {
            console.error(e);
            return {
                text: "❌ Lỗi kết nối mạng.",
                products: []
            };
        }
    };

    // Helper function để tìm sản phẩm được đề cập trong câu trả lời
    const findMentionedProducts = (aiResponse: string): Product[] => {
        const mentionedProducts: Product[] = [];
        
        // Tìm kiếm tên sản phẩm trong câu trả lời AI
        products.forEach(product => {
            if (aiResponse.toLowerCase().includes(product.name.toLowerCase())) {
                mentionedProducts.push(product);
            }
        });
        
        // Nếu không tìm thấy sản phẩm cụ thể, đề xuất 3 sản phẩm nổi bật
        if (mentionedProducts.length === 0 && products.length > 0) {
            // Ưu tiên sản phẩm mới, giảm giá hoặc rating cao
            const featuredProducts = products
                .sort((a, b) => {
                    let scoreA = 0;
                    let scoreB = 0;
                    if (a.isNew) scoreA += 2;
                    if (a.isSale) scoreA += 2;
                    if (a.rating > 4) scoreA += 1;
                    
                    if (b.isNew) scoreB += 2;
                    if (b.isSale) scoreB += 2;
                    if (b.rating > 4) scoreB += 1;
                    
                    return scoreB - scoreA;
                })
                .slice(0, 3);
            
            return featuredProducts;
        }
        
        return mentionedProducts.slice(0, 3); // Giới hạn 3 sản phẩm
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

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
        const response = await callGeminiAPI(text, newHistory);
        
        // Kiểm tra kiểu của response
        let responseText: string;
        let responseProducts: Product[] = [];
        
        if (typeof response === 'string') {
            // Nếu response là string (lỗi)
            responseText = response;
        } else {
            // Nếu response là object
            responseText = response.text;
            responseProducts = response.products || [];
        }
        
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'bot',
            timestamp: new Date(),
            products: responseProducts
        };

        setMessages(prev => [...prev, botMsg]);
    } catch (e) {
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "❌ Có lỗi xảy ra, thử lại sau nhé.",
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsTyping(false);
    }
};    // Hàm xử lý thêm vào giỏ hàng
const handleAddToCart = (product: Product) => {
    // Tạo cart item theo đúng kiểu mà CartContext yêu cầu
    const cartItem = {
        productId: product.id, // Quan trọng: phải là productId chứ không phải id
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        size: null, // Hoặc undefined nếu không có size
    };
    
    addToCart(cartItem);
    
    Alert.alert('Thành công', `Đã thêm "${product.name}" vào giỏ hàng`);
};    // Hàm xử lý xem chi tiết sản phẩm
    const handleViewDetail = (product: Product) => {
        router.push(`/productdetail?id=${product.id}`);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Render sản phẩm trong tin nhắn
    const renderProductCard = (product: Product) => {
        return (
            <View key={product.id} style={styles.productCard}>
                {product.imageUrl ? (
                    <Image 
                        source={{ uri: product.imageUrl }} 
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.productImage, styles.productImagePlaceholder]}>
                        <Text style={styles.placeholderText}>Luxe</Text>
                    </View>
                )}
                
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                        {product.price.toLocaleString('vi-VN')}đ
                    </Text>
                    <Text style={styles.productMaterial}>
                        Chất liệu: {product.material}
                    </Text>
                    
                    {product.isSale && (
                        <View style={styles.saleBadge}>
                            <Text style={styles.saleText}>Giảm giá</Text>
                        </View>
                    )}
                    
                    {product.isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>Mới</Text>
                        </View>
                    )}
                    
                    <View style={styles.productActions}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleAddToCart(product)}
                        >
                            <ShoppingBag size={16} color="white" />
                            <Text style={styles.actionText}>Thêm giỏ</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.viewDetailButton]}
                            onPress={() => handleViewDetail(product)}
                        >
                            <Eye size={16} color="white" />
                            <Text style={styles.actionText}>Chi tiết</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    // Render tin nhắn
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
                    
                    {/* Hiển thị sản phẩm nếu có */}
                    {!isUser && item.products && item.products.length > 0 && (
                        <View style={styles.productsContainer}>
                            <Text style={styles.productSectionTitle}>
                                Sản phẩm đề xuất:
                            </Text>
                            {item.products.map(product => renderProductCard(product))}
                        </View>
                    )}
                    
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

    // Products Section
    productsContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 12,
    },
    productSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    productImagePlaceholder: {
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    productMaterial: {
        fontSize: 12,
        color: COLORS.subText,
        marginBottom: 8,
    },
    productActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    viewDetailButton: {
        backgroundColor: COLORS.secondary,
        marginRight: 0,
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    saleBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    saleText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    newBadge: {
        position: 'absolute',
        top: 0,
        right: 50,
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    newText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
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