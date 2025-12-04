import AsyncStorage from "@react-native-async-storage/async-storage";

export const AUTH_KEY = "APP_AUTH_USER";  

export const saveUserSession = async (user: any) => {
    const token = Date.now().toString(); // Fake token
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ ...user, token }));
    return token;
};

export const getUserSession = async () => {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
};

export const logoutUser = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
};
