import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authAPI } from '../services/api';

export default function SignupScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateFullName = (name: string): boolean => name.trim().length >= 3;
    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string): boolean => password.length >= 8;

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as keyof typeof errors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const handleSignup = async () => {
        const newErrors: typeof errors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (!validateFullName(formData.fullName)) {
            newErrors.fullName = 'Name must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await authAPI.register(formData.fullName, formData.email, formData.password);

                if (response.success) {
                    router.replace('/home');
                }
            } catch (error: any) {
                Alert.alert(
                    'Registration Failed',
                    error.message || 'Could not create account. Please try again.',
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
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="flex-1 justify-center px-8 pt-16 pb-12 min-h-screen">
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="absolute top-12 left-6 w-10 h-10 rounded-full bg-gray-100 items-center justify-center z-10"
                        >
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View className="mb-10">
                            <Text className="text-black text-4xl font-bold mb-2">Create Account</Text>
                            <Text className="text-gray-600 text-lg">To get started!</Text>
                        </View>

                        {/* Form Container */}
                        <View className="w-full">
                            {/* Full Name Input */}
                            <View className="mb-4">
                                <TextInput
                                    className="bg-transparent border border-black/40 rounded-xl px-5 py-4 text-base text-black"
                                    placeholder="Full Name"
                                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                    value={formData.fullName}
                                    onChangeText={(text) => handleInputChange('fullName', text)}
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                                {errors.fullName && (
                                    <Text className="text-red-600 text-xs mt-1.5 ml-1">{errors.fullName}</Text>
                                )}
                            </View>

                            {/* Email Input */}
                            <View className="mb-4">
                                <TextInput
                                    className="bg-transparent border border-black/40 rounded-xl px-5 py-4 text-base text-black"
                                    placeholder="Email"
                                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                    value={formData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
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
                            <View className="mb-4">
                                <View className="flex-row items-center">
                                    <TextInput
                                        className="flex-1 bg-transparent border border-black/40 rounded-xl px-5 py-4 text-base text-black"
                                        placeholder="Password"
                                        placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                        value={formData.password}
                                        onChangeText={(text) => handleInputChange('password', text)}
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

                            {/* Confirm Password Input */}
                            <View className="mb-4">
                                <View className="flex-row items-center">
                                    <TextInput
                                        className="flex-1 bg-transparent border border-black/40 rounded-xl px-5 py-4 text-base text-black"
                                        placeholder="Confirm Password"
                                        placeholderTextColor="rgba(0, 0, 0, 0.5)"
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 p-1"
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="rgba(0, 0, 0, 0.6)"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && (
                                    <Text className="text-red-600 text-xs mt-1.5 ml-1">{errors.confirmPassword}</Text>
                                )}
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                onPress={handleSignup}
                                disabled={isLoading}
                                className="bg-black rounded-full py-5 items-center justify-center mb-6 mt-3"
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Sign Up</Text>
                                )}
                            </TouchableOpacity>

                            {/* Sign In Link */}
                            <View className="flex-row justify-center items-center mt-2">
                                <Text className="text-black/70 text-sm">Already have account? </Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/login')}
                                    disabled={isLoading}
                                >
                                    <Text className="text-black text-sm font-bold">Login Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
