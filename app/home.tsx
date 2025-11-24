import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

interface Workout {
    time: Date;
    description: string;
    day: string;
}

export default function HomeScreen() {
    const router = useRouter();
    const [userName, setUserName] = useState('User');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
    const [steps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0);
    const [dailyGoal, setDailyGoal] = useState(5); // Default 5 km
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalInput, setGoalInput] = useState('5');

    useEffect(() => {
        loadUserData();
        loadTodayWorkouts();
        loadGoal();

        // Setup pedometer
        const setupStepCounter = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            if (isAvailable) {
                const { status } = await Pedometer.requestPermissionsAsync();
                if (status === 'granted') {
                    // Fetch steps immediately
                    fetchSteps();
                    // Then fetch every 5 seconds
                    const stepInterval = setInterval(fetchSteps, 5000);
                    return stepInterval;
                }
            }
        };

        const stepIntervalPromise = setupStepCounter();

        // Refresh workouts and user data periodically
        const workoutInterval = setInterval(loadTodayWorkouts, 2000);
        const userDataInterval = setInterval(loadUserData, 2000); // Refresh profile pic every 2 seconds

        return () => {
            clearInterval(workoutInterval);
            clearInterval(userDataInterval);
            stepIntervalPromise.then(interval => interval && clearInterval(interval));
        };
    }, []);

    const fetchSteps = async () => {
        try {
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            const result = await Pedometer.getStepCountAsync(start, end);
            if (result) {
                setSteps(result.steps);
                setCalories(Math.round(result.steps * 0.04));
                setDistance(parseFloat((result.steps * 0.0008).toFixed(2))); // Convert steps to km
            }
        } catch (error) {
            console.log('Error fetching steps:', error);
        }
    };

    const loadUserData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                setUserName(user.fullName || 'User');
                setProfilePic(user.profilePic || null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadTodayWorkouts = async () => {
        try {
            const workoutsJson = await AsyncStorage.getItem('workouts');
            if (workoutsJson) {
                const allWorkouts = JSON.parse(workoutsJson);
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

                const todaysWorkouts = allWorkouts[today] || [];
                setTodayWorkouts(todaysWorkouts.map((w: any) => ({
                    ...w,
                    time: new Date(w.time),
                    day: today,
                })));
            }
        } catch (error) {
            console.error('Error loading workouts:', error);
        }
    };

    const loadGoal = async () => {
        try {
            const savedGoal = await AsyncStorage.getItem('dailyGoal');
            if (savedGoal) {
                const goal = parseFloat(savedGoal);
                setDailyGoal(goal);
                setGoalInput(goal.toString());
            }
        } catch (error) {
            console.error('Error loading goal:', error);
        }
    };

    const saveGoal = async (goal: number) => {
        try {
            await AsyncStorage.setItem('dailyGoal', goal.toString());
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const handleGoalPress = () => {
        setGoalInput(dailyGoal.toString());
        setShowGoalModal(true);
    };

    const handleGoalSubmit = () => {
        const newGoal = parseFloat(goalInput);
        if (isNaN(newGoal) || newGoal <= 0) {
            Alert.alert('Invalid Goal', 'Please enter a valid positive number for your goal.');
            return;
        }
        setDailyGoal(newGoal);
        saveGoal(newGoal);
        setShowGoalModal(false);
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            router.replace('/');
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
        }
    };

    const quickActions = [
        { icon: 'barbell-outline', title: 'Workout', color: '#667eea', route: '/workout', image: require('../assets/images/workout-bicep.png') },
        { icon: 'nutrition-outline', title: 'Nutrition', color: '#00b894', route: '/nutrition', image: require('../assets/images/nutrition-food.png') },
        { icon: 'stats-chart-outline', title: 'Progress', color: '#a29bfe', route: null, image: null },
        { icon: 'calendar-outline', title: 'Schedule', color: '#fd79a8', route: null, image: null },
    ];

    const handleActionPress = (action: any) => {
        if (action.route) {
            router.push(action.route);
        } else {
            Alert.alert('Coming Soon', `${action.title} feature will be available soon!`);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Circular Progress Component
    const CircularProgress = ({ progress, size = 70 }: { progress: number; size?: number }) => {
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const progressOffset = circumference - (Math.min(progress, 100) / 100) * circumference;

        // Color based on progress
        const getColor = () => {
            if (progress >= 100) return '#10b981'; // green
            if (progress >= 50) return '#f97316'; // orange
            return '#d1d5db'; // gray
        };

        return (
            <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#f3f4f6"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={getColor()}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={progressOffset}
                        strokeLinecap="round"
                    />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                        {Math.min(Math.round(progress), 100)}%
                    </Text>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <StatusBar style="dark" />
                <View className="flex-1 bg-white">
                    {/* Header */}
                    <View className="px-6 pt-4 pb-4">
                        {/* Top Bar */}
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-gray-500 text-sm">Welcome back,</Text>
                                <Text className="text-black text-2xl font-bold mt-1">{userName}</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => router.push('/profile')}
                                    className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-2 border-gray-200"
                                >
                                    {profilePic ? (
                                        <Image source={{ uri: profilePic }} className="w-full h-full" />
                                    ) : (
                                        <Ionicons name="person-outline" size={22} color="#000" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleLogout}
                                    className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                                >
                                    <Ionicons name="log-out-outline" size={22} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>


                    {/* Main Content */}
                    <ScrollView
                        className="flex-1 bg-white"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="px-6 pb-6">
                            {/* Stats Cards - 2x2 Grid */}
                            <View className="gap-3 mb-6">
                                {/* Top Row: Steps | Distance */}
                                <View className="flex-row gap-3">
                                    <View className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 items-center">
                                        <Ionicons name="footsteps-outline" size={28} color="#000" />
                                        <Text className="text-black text-3xl font-bold mt-3 mb-1">{steps.toLocaleString()}</Text>
                                        <Text className="text-gray-600 text-sm font-medium">Steps</Text>
                                    </View>
                                    <View className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 items-center">
                                        <Ionicons name="navigate-outline" size={28} color="#000" />
                                        <Text className="text-black text-3xl font-bold mt-3 mb-1">{distance.toFixed(2)}</Text>
                                        <Text className="text-gray-600 text-sm font-medium">Distance (km)</Text>
                                    </View>
                                </View>

                                {/* Bottom Row: Calories | Goal */}
                                <View className="flex-row gap-3">
                                    <View className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 items-center">
                                        <Ionicons name="flame-outline" size={28} color="#000" />
                                        <Text className="text-black text-3xl font-bold mt-3 mb-1">{calories}</Text>
                                        <Text className="text-gray-600 text-sm font-medium">Calories</Text>
                                    </View>
                                    <TouchableOpacity
                                        className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 items-center relative"
                                        onPress={handleGoalPress}
                                        activeOpacity={0.7}
                                    >
                                        <View className="absolute top-5 right-5">
                                            <Ionicons name="create-outline" size={20} color="#666" />
                                        </View>
                                        <Ionicons name="trophy-outline" size={28} color="#000" />
                                        <CircularProgress progress={(distance / dailyGoal) * 100} size={70} />
                                        <Text className="text-gray-600 text-sm font-medium mt-2">Goal: {dailyGoal} km</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Quick Actions */}
                            <Text className="text-black text-xl font-bold mb-4">Quick Actions</Text>
                            <View className="flex-row flex-wrap gap-3 mb-6">
                                {quickActions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleActionPress(action)}
                                        className="w-[48%] bg-gray-50 rounded-2xl p-5 border border-gray-200 items-center"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name={action.icon as any} size={32} color="#000" />
                                        <Text className="text-black font-semibold mt-3 text-base">{action.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                            {/* Today's Workouts */}
                            <Text className="text-black text-xl font-bold mb-4">Today's Workouts</Text>
                            {todayWorkouts.length === 0 ? (
                                <View className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                                    <View className="flex-row items-center mb-3">
                                        <Ionicons name="calendar-outline" size={20} color="#000" />
                                        <Text className="text-black font-semibold ml-2 text-base">No workouts scheduled</Text>
                                    </View>
                                    <Text className="text-gray-600 text-sm mb-4">
                                        Start your fitness journey by scheduling your first workout!
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/workout')}
                                        className="bg-black rounded-full py-3 px-5 flex-row items-center justify-center"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-semibold mr-2">Schedule Workout</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="mb-6">
                                    {todayWorkouts.map((workout, index) => (
                                        <View key={index} className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center border border-gray-200">
                                            <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
                                                <Ionicons name="barbell" size={24} color="#000" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-black font-semibold text-base">{formatTime(workout.time)}</Text>
                                                <Text className="text-gray-600 text-sm mt-1">{workout.description}</Text>
                                            </View>
                                            <Ionicons name="time-outline" size={20} color="#666" />
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        onPress={() => router.push('/workout')}
                                        className="flex-row items-center justify-center py-3"
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color="#000" />
                                        <Text className="text-black font-semibold ml-2">Add More Workouts</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Recent Activity */}
                            <Text className="text-black text-xl font-bold mb-4">Recent Activity</Text>
                            <View className="bg-gray-50 rounded-2xl p-8 border border-gray-200 items-center">
                                <Ionicons name="barbell-outline" size={48} color="#ccc" />
                                <Text className="text-gray-800 font-semibold mt-4 text-base">No recent activity</Text>
                                <Text className="text-gray-500 text-sm mt-2 text-center">
                                    Your workout history will appear here
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Goal Selection Modal */}
                <Modal
                    visible={showGoalModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowGoalModal(false)}
                >
                    <View className="flex-1 bg-black/50 justify-center items-center px-6">
                        <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                            <View className="items-center mb-6">
                                <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="trophy" size={32} color="#f97316" />
                                </View>
                                <Text className="text-black text-2xl font-bold mb-2">Set Daily Goal</Text>
                                <Text className="text-gray-600 text-sm text-center">
                                    Enter your daily distance goal in kilometers
                                </Text>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-700 font-semibold mb-2">Goal (km)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-black text-lg font-semibold"
                                    value={goalInput}
                                    onChangeText={setGoalInput}
                                    keyboardType="decimal-pad"
                                    placeholder="Enter goal"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
                                    onPress={() => setShowGoalModal(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-black rounded-xl py-4 items-center"
                                    onPress={handleGoalSubmit}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-semibold text-base">Save Goal</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({});
