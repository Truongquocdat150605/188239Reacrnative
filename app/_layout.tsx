import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from '../lib/AuthContext';
import { BuyNowProvider } from '../lib/BuyNowContext';
import { CartProvider } from '../lib/CartContext';
import { NotificationProvider } from '../lib/NotificationContext';
import { WishlistProvider } from '../lib/WishlistContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      setIsFirstLaunch(value === null);
    });
  }, []);

  if (isFirstLaunch === null) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <BuyNowProvider>
                  <View style={styles.container}>
                    <Stack>
                      {isFirstLaunch && (
                        <Stack.Screen name="welcome" options={{ headerShown: false }} />
                      )}
                      <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
                      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                      <Stack.Screen name="home" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="cart" options={{ headerShown: false }} />
                      <Stack.Screen name="checkout" options={{ headerShown: false }} />
                      <Stack.Screen name="productdetail" options={{ headerShown: false }} />
                      <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="profile" options={{ headerShown: false }} />
                      <Stack.Screen name="orders" options={{ headerShown: false }} />
                      <Stack.Screen name="notifications" options={{ headerShown: false }} />
                      <Stack.Screen name="wishlist" options={{ headerShown: false }} />
                      <Stack.Screen name="addresses" options={{ headerShown: false }} />
                      <Stack.Screen name="change-password" options={{ headerShown: false }} />
                      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                      <Stack.Screen name="chat" options={{ headerShown: false }} />
                      <Stack.Screen name="search" options={{ headerShown: false }} />
                      
                      {/* 👇 SỬA TỪ "admin/orders" THÀNH "admin/order" */}
                      <Stack.Screen name="admin/order" options={{ headerShown: false }} />
                      
                      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
                      <Stack.Screen name="orderdetail/[orderId]" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                  </View>
                </BuyNowProvider>
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});