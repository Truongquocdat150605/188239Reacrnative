import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const handleLogin = () => {
        console.log("Login attempt:", email, password);
    };

    return (
        <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoBox}>
                <View style={styles.logoInner}>
                    <Lock color="#0A84FF" size={30} />
                </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* Input Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
            />

            {/* Input Password */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    value={password}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={22} color="#777" /> : <Eye size={22} color="#777" />}
                </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity style={{ marginTop: 15 }}>
                <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider}></View>
                <Text style={styles.orText}>or continue with</Text>
                <View style={styles.divider}></View>
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton}>
                    <Text>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                    <Text>Facebook</Text>
                </TouchableOpacity>
            </View>

            {/* Register */}
            <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => router.push("/SignupScreen")}   // <-- thêm navigate
            >
                <Text style={styles.register}>
                    Don't have an account?{" "}
                    <Text style={styles.registerLink}>
                        Register
                    </Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    logoBox: {
        backgroundColor: '#0A84FF',
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoInner: {
        backgroundColor: '#FFF',
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 20
    },
    subtitle: {
        color: '#777',
        marginBottom: 25
    },
    input: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        marginBottom: 15
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 15
    },
    inputPassword: {
        flex: 1,
        paddingVertical: 14
    },
    button: {
        width: '100%',
        backgroundColor: '#0A84FF',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: { color: '#FFF', fontWeight: 'bold' },
    forgotText: { color: '#777' },
    dividerContainer: {
        flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%'
    },
    divider: { flex: 1, height: 1, backgroundColor: '#CCC' },
    orText: { marginHorizontal: 10, color: '#777' },
    socialRow: { flexDirection: 'row', width: '100%', gap: 10 },
    socialButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD'
    },
    register: { color: '#555' },
    registerLink: { color: '#0A84FF', fontWeight: 'bold' }
});
