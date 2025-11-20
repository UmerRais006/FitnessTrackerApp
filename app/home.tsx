import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const quickActions = [
        { icon: 'barbell-outline', title: 'Workout', color: 'bg-blue-500' },
        { icon: 'nutrition-outline', title: 'Nutrition', color: 'bg-green-500' },
        { icon: 'stats-chart-outline', title: 'Progress', color: 'bg-purple-500' },
        { icon: 'calendar-outline', title: 'Schedule', color: 'bg-orange-500' },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar style="light" />

            {/* Header */}
            <View className="h-64 bg-primary">
                <View className="flex-1 pt-14 px-6">
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center mb-8">
                        <View>
                            <Text className="text-white/80 text-sm">Welcome back,</Text>
                            <Text className="text-white text-2xl font-bold">{user?.fullName || 'User'}</Text>
                        </View>
                        <TouchableOpacity
                            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards */}
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white/20 rounded-2xl p-4">
                            <Ionicons name="flame-outline" size={24} color="#fff" />
                            <Text className="text-white text-2xl font-bold mt-2">0</Text>
                            <Text className="text-white/80 text-xs">Calories Burned</Text>
                        </View>
                        <View className="flex-1 bg-white/20 rounded-2xl p-4">
                            <Ionicons name="fitness-outline" size={24} color="#fff" />
                            <Text className="text-white text-2xl font-bold mt-2">0</Text>
                            <Text className="text-white/80 text-xs">Workouts</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1 -mt-6" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-t-3xl px-6 pt-8 pb-6">
                    {/* Quick Actions */}
                    <Text className="text-xl font-bold text-dark mb-4">Quick Actions</Text>
                    <View className="flex-row flex-wrap gap-3 mb-8">
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                className={`flex-1 min-w-[45%] ${action.color} rounded-2xl p-5 items-center`}
                                activeOpacity={0.8}
                            >
                                <Ionicons name={action.icon as any} size={32} color="#fff" />
                                <Text className="text-white font-semibold mt-2">{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Today's Plan */}
                    <Text className="text-xl font-bold text-dark mb-4">Today's Plan</Text>
                    <View className="bg-gray-100 rounded-2xl p-5 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="calendar-outline" size={20} color="#667eea" />
                            <Text className="text-gray-text ml-2 font-medium">No workouts scheduled</Text>
                        </View>
                        <Text className="text-gray-text text-sm">
                            Start your fitness journey by scheduling your first workout!
                        </Text>
                        <TouchableOpacity className="bg-primary rounded-xl py-3 mt-4">
                            <Text className="text-white text-center font-semibold">Schedule Workout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Activity */}
                    <Text className="text-xl font-bold text-dark mb-4">Recent Activity</Text>
                    <View className="bg-gray-100 rounded-2xl p-5">
                        <View className="items-center py-6">
                            <Ionicons name="barbell-outline" size={48} color="#ccc" />
                            <Text className="text-gray-text mt-3">No recent activity</Text>
                            <Text className="text-gray-text/60 text-sm text-center mt-1">
                                Your workout history will appear here
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
