import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '@/lib/CartContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>

        {/* 🟦 Only apply frame on WEB */}
        <View style={styles.container}>
          <View style={Platform.OS === 'web' ? styles.phoneFrame : styles.fullMobile}>
            <Stack initialRouteName="login">
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="cart" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: 'modal', title: 'Modal' }}
              />
            </Stack>
          </View>
        </View>

        <StatusBar style="auto" />
      </CartProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🟡 Mobile frame trên WEB
  phoneFrame: {
    width: 390,     // iPhone 12/13/14 width
    height: 844,    // iPhone 12/13/14 height
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0 4px 18px rgba(0,0,0,0.2)',
  },

  // 🟢 Mobile thực thì full
  fullMobile: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
