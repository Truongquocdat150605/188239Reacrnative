// app/welcome.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleFinishOnboarding = async () => {
    try {
      // Lưu đánh dấu đã xem màn hình welcome
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      // Chuyển đến trang login
      router.replace('/login');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với nút Skip */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinishOnboarding}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung chính */}
      <View style={styles.content}>
        <Text style={styles.logo}>💎</Text>
        <Text style={styles.title}>Chào mừng đến với</Text>
        <Text style={styles.appName}>Jewelry Store</Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureText}>Mua sắm dễ dàng</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureText}>Giao hàng miễn phí</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💎</Text>
            <Text style={styles.featureText}>Sản phẩm chính hãng</Text>
          </View>
        </View>
      </View>

      {/* Footer với nút bắt đầu */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleFinishOnboarding}
        >
          <Text style={styles.primaryButtonText}>Bắt đầu mua sắm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.secondaryButtonText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#333333',
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 50,
  },
  features: {
    width: '100%',
    marginTop: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  featureText: {
    fontSize: 18,
    color: '#333333',
  },
  footer: {
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});