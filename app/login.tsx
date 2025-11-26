import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authAPI } from '../services/api';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    const handleLogin = async () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await authAPI.login(email, password);

                if (response.success) {
                    router.replace('/home');
                }
            } catch (error: any) {
                Alert.alert(
                    'Login Failed',
                    error.message || 'Invalid email or password. Please try again.',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-8 pb-12">
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 w-10 h-10 rounded-full bg-gray-100 items-center justify-center z-10"
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View className="mb-12">
                        <Text className="text-black text-4xl font-bold mb-2">Welcome,</Text>
                        <Text className="text-gray-600 text-lg">Let's become fit!</Text>
                    </View>

                    {/* Form Container */}
                    <View className="w-full">
                        {/* Email Input */}
                        <View className="mb-5">
                            <TextInput
                                className="bg-transparent border border-black/40 rounded-xl px-5 py-4 text-base text-black"
                                placeholder="Email"
                                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) {
                                        setErrors({ ...errors, email: undefined });
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!isLoading}
                            />
                            {errors.email && (
                                <Text className="text-red-600 text-xs mt-1.5 ml-1">{errors.email}</Text>
                            )}
                        </View>

                        {/* Password Input */}
                        <View className="mb-5">
                            <View className="flex-row items-center">
                                <TextInput
                                    className="flex-1 bg-transparent border border-black/40 rounded-xl px-5 py-4 text-base text-black"
                                    placeholder="Password"
                                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) {
                                            setErrors({ ...errors, password: undefined });
                                        }
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 p-1"
                                    disabled={isLoading}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="rgba(0, 0, 0, 0.6)"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <Text className="text-red-600 text-xs mt-1.5 ml-1">{errors.password}</Text>
                            )}
                        </View>

                        
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className="bg-black rounded-full py-5 items-center justify-center mb-6 mt-2"
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text className="text-white text-lg font-bold">Login</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-2">
                            <Text className="text-black/70 text-sm">Don't have account? </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/signup')}
                                disabled={isLoading}
                            >
                                <Text className="text-black text-sm font-bold">Sign Up Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
