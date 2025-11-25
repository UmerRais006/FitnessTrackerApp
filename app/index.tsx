import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WelcomeScreen() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const user = await AsyncStorage.getItem('user');

            if (token && user) {
                // User is authenticated, redirect to home
                router.replace('/home');
            } else {
                // No auth, show welcome screen
                setIsChecking(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsChecking(false);
        }
    };

    // Show loading indicator while checking auth
    if (isChecking) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <StatusBar style="light" />
            <ImageBackground
                source={require('../assets/images/image.png')}
                className="flex-1"
                resizeMode="cover"
            >
                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['rgba(255, 140, 0, 0.3)', 'rgba(139, 69, 19, 0.7)', 'rgba(62, 39, 35, 0.85)']}
                    className="absolute top-0 left-0 right-0 bottom-0"
                />

                <View className="flex-1 justify-between px-8 pt-[100px] pb-[60px]">
                    {/* Logo/Title Section */}
                    <View className="items-center mt-[60px]">
                        <Text className="text-5xl font-bold text-white text-center"></Text>
                    </View>

                    {/* Buttons Section */}
                    <View className="w-full">
                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            activeOpacity={0.8}
                            className="bg-black rounded-[30px] py-[18px] items-center justify-center mb-4 shadow-lg"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            <Text className="text-[#8B4513] text-lg font-bold">Login</Text>
                        </TouchableOpacity>

                        {/* Signup Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/signup')}
                            activeOpacity={0.8}
                            className="bg-transparent border-2 border-black rounded-[30px] py-[19px] items-center justify-center mb-20"
                        >
                            <Text className="text-black text-lg font-bold">Sign Up</Text>
                        </TouchableOpacity>

                        {/* Terms Text */}
                        <Text className="text-white/70 text-xs text-center leading-[18px]">
                            By continuing, you agree to our Terms of Service
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}
