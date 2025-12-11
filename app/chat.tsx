
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

import { COLORS } from '../theme/colors';
import { MOCK_PRODUCTS } from '../constants/mockProducts';

// --- CẤU HÌNH API KEY ---
// ⚠️ QUAN TRỌNG: Hãy dán mã API Key bắt đầu bằng "AIza..." vào bên dưới
const API_KEY = "AIzaSyDTRRj8AQ4_UDa67c4qNS3_HWLDp7E4ISU"; 

// Định nghĩa kiểu tin nhắn
type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

// Các câu hỏi gợi ý
const QUICK_REPLIES = [
    "Cửa hàng ở đâu?",
    "Chính sách bảo hành?",
    "Tư vấn nhẫn cầu hôn",
    "Có bán vàng 24K không?"
];

export default function ChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào! 👋\nMình là trợ lý AI của Luxe Jewelry. Mình có thể giúp bạn tìm trang sức ưng ý hoặc giải đáp thắc mắc về dịch vụ.',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);

    // Cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isTyping]);

    // Hàm gọi API Gemini thủ công (Không cần thư viện)
    const callGeminiAPI = async (userMessage: string, history: Message[]) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        // 1. Tạo ngữ cảnh sản phẩm
        const productContext = MOCK_PRODUCTS.map(p => 
            `- ${p.name}: Giá ${p.price.toLocaleString('vi-VN')}đ. Loại: ${p.category}. Chất liệu: ${p.specifications.material}.`
        ).join('\n');

        const systemInstruction = `
            Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của cửa hàng trang sức "Luxe Jewelry".
            
            NHIỆM VỤ:
            - Tư vấn sản phẩm, giải đáp thắc mắc, chốt đơn.
            - Giọng điệu: Thân thiện, ngắn gọn, dùng emoji.
            - Luôn xưng "mình" và gọi khách là "bạn".

            DANH SÁCH SẢN PHẨM:
            ${productContext}

            CHÍNH SÁCH:
            - Địa chỉ: 123 Lê Lợi, Q1, TP.HCM. Hotline: 1900 1234.
            - Ship: Miễn phí đơn > 1 triệu.
            - Bảo hành: Trọn đời.
        `;

        // 2. Chuyển đổi lịch sử chat sang format của Gemini
        // Lọc bỏ tin nhắn đầu tiên (lời chào) để tránh nhiễu
        const validHistory = history.filter(m => m.id !== '1');
        
        const contents = validHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Thêm tin nhắn hiện tại
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // 3. Body Request
        const body = {
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
                return "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau nhé!";
            }

            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, mình chưa hiểu ý bạn.";
        } catch (error) {
            console.error("Network Error:", error);
            return "Có lỗi kết nối mạng. Vui lòng kiểm tra lại.";
        }
    };

    const handleSend = async (text: string = inputText) => {
        if (!text.trim()) return;

        if (!API_KEY || API_KEY.includes("DÁN_MÃ")) {
            Alert.alert("Thiếu API Key", "Vui lòng nhập API Key trong file chat.tsx");
            return;
        }

        // 1. Thêm tin nhắn User
        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        const currentHistory = [...messages];
        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsTyping(true);

        // 2. Gọi API
        const responseText = await callGeminiAPI(text, currentHistory);

        // 3. Thêm tin nhắn Bot
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'bot',
            timestamp: new Date()
        }]);
        
        setIsTyping(false);
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
                            <View style={[styles.dot, (!API_KEY || API_KEY.includes("DÁN_MÃ")) ? { backgroundColor: 'red' } : {}]} />
                            <Text style={styles.statusText}>
                                {(API_KEY && !API_KEY.includes("DÁN_MÃ")) ? "Sẵn sàng hỗ trợ" : "Chưa nhập Key"}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity>
                    <MoreVertical size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

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
                            </View>
                        </View>
                    ) : null
                }
            />

            {/* Quick Replies */}
            <View style={styles.quickReplyContainer}>
                <FlatList
                    horizontal
                    data={QUICK_REPLIES}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.chip}
                            onPress={() => handleSend(item)}
                            disabled={isTyping}
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
                        placeholder={(API_KEY && !API_KEY.includes("DÁN_MÃ")) ? "Nhập tin nhắn..." : "Chưa nhập API Key"}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => handleSend()}
                        editable={!isTyping}
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim() || isTyping}
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
    backButton: { padding: 4, marginRight: 10 },
    headerInfo: { justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 4 },
    statusText: { fontSize: 11, color: '#10B981' },

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
    msgWrapperLeft: { alignSelf: 'flex-start' },
    msgWrapperRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    
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
    msgText: { fontSize: 15, lineHeight: 22 },
    msgTextLeft: { color: COLORS.text },
    msgTextRight: { color: 'white' },
    
    msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    msgTimeLeft: { color: '#999' },
    msgTimeRight: { color: 'rgba(255,255,255,0.7)' },

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
        justifyContent: 'center',
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
