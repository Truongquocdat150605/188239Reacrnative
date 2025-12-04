// app/search-screen.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import { COLORS } from '../theme/colors'; 
import { useRouter } from 'expo-router';

export default function SearchScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Tìm Kiếm Trang Sức</Text>
                <Text style={styles.subtitle}>
                    Đây là màn hình nơi bạn sẽ nhập từ khóa và hiển thị kết quả.
                </Text>
                
                {/* Nút quay lại để kiểm tra điều hướng */}
                <Button 
                    title="Quay lại Trang Chủ" 
                    onPress={() => router.back()} 
                    color={COLORS.primary} 
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 20,
    }
});