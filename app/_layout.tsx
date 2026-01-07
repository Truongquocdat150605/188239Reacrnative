import 'react-native-reanimated'; // Must be first
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

import { CartProvider } from '../lib/CartContext';
import { NotificationProvider } from '../lib/NotificationContext';
import { WishlistProvider } from '../lib/WishlistContext';
import { AuthProvider } from '../lib/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <View style={styles.container}>
                  <Stack initialRouteName={isFirstLaunch ? "welcome" : "login"}>
                    <Stack.Screen name="welcome" options={{ headerShown: false }} />
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
                    {/* <Stack.Screen name="orderhistory" options={{ headerShown: false }} /> */}
                    <Stack.Screen name="admin/orders" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="modal"
                      options={{ presentation: 'modal', title: 'Modal' }}
                    />
                  </Stack>
                </View>

                <StatusBar style="auto" />
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
