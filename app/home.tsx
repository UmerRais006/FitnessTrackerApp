import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface Workout {
    time: Date;
    description: string;
    day: string;
}

export default function HomeScreen() {
    const router = useRouter();
    const [userName, setUserName] = useState('User');
    const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
    const [steps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);

    useEffect(() => {
        loadUserData();
        loadTodayWorkouts();

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

        // Refresh workouts when screen comes into focus
        const workoutInterval = setInterval(loadTodayWorkouts, 2000);

        return () => {
            clearInterval(workoutInterval);
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


    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <StatusBar style="dark" />
                <View className="flex-1 bg-white">
                    {/* Header */}
                    <View className="px-6 pt-4 pb-6">
                        {/* Top Bar */}
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-gray-500 text-sm">Welcome back,</Text>
                                <Text className="text-black text-2xl font-bold mt-1">{userName}</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => router.push('/profile')}
                                    className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                                >
                                    <Ionicons name="person-outline" size={22} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleLogout}
                                    className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                                >
                                    <Ionicons name="log-out-outline" size={22} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Stats Cards */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <Ionicons name="footsteps-outline" size={28} color="#000" />
                                <Text className="text-black text-3xl font-bold mt-3 mb-1">{steps.toLocaleString()}</Text>
                                <Text className="text-gray-600 text-sm font-medium">Steps Today</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <Ionicons name="flame-outline" size={28} color="#000" />
                                <Text className="text-black text-3xl font-bold mt-3 mb-1">{calories}</Text>
                                <Text className="text-gray-600 text-sm font-medium">Calories</Text>
                            </View>
                        </View>
                    </View>


                    {/* Main Content */}
                    <ScrollView
                        className="flex-1 bg-white"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="px-6 pt-2 pb-6">
                            {/* Quick Actions */}
                            <Text className="text-black text-xl font-bold mb-4">Quick Actions</Text>
                            <View className="flex-row flex-wrap gap-3 mb-6">
                                {quickActions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleActionPress(action)}
                                        className="w-[48%] bg-gray-50 rounded-2xl p-5 border border-gray-200"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name={action.icon as any} size={32} color="#000" />
                                        <Text className="text-black font-semibold mt-3 text-base">{action.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Today's Workouts */}
                            <Text style={styles.sectionTitle}>Today's Workouts</Text>
                            {todayWorkouts.length === 0 ? (
                                <View style={styles.planCard}>
                                    <View style={styles.planHeader}>
                                        <Ionicons name="calendar-outline" size={20} color="#667eea" />
                                        <Text style={styles.planHeaderText}>No workouts scheduled</Text>
                                    </View>
                                    <Text style={styles.planDescription}>
                                        Start your fitness journey by scheduling your first workout!
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.scheduleButton}
                                        onPress={() => router.push('/workout')}
                                    >
                                        <Text style={styles.scheduleButtonText}>Schedule Workout</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.workoutsListContainer}>
                                    {todayWorkouts.map((workout, index) => (
                                        <View key={index} style={styles.workoutItem}>
                                            <View style={styles.workoutIconContainer}>
                                                <Ionicons name="barbell" size={24} color="#667eea" />
                                            </View>
                                            <View style={styles.workoutDetails}>
                                                <Text style={styles.workoutTime}>{formatTime(workout.time)}</Text>
                                                <Text style={styles.workoutDesc}>{workout.description}</Text>
                                            </View>
                                            <View style={styles.notificationIndicator}>
                                                <Ionicons name="time-outline" size={16} color="#00b894" />
                                            </View>
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.addMoreButton}
                                        onPress={() => router.push('/workout')}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color="#667eea" />
                                        <Text style={styles.addMoreText}>Add More Workouts</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Recent Activity */}
                            <Text style={styles.sectionTitle}>Recent Activity</Text>
                            <View style={styles.activityCard}>
                                <View style={styles.emptyState}>
                                    <Ionicons name="barbell-outline" size={48} color="#ccc" />
                                    <Text style={styles.emptyStateText}>No recent activity</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Your workout history will appear here
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    container: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    header: {
        backgroundColor: '#667eea',
        paddingBottom: 24,
        paddingTop: 8,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    statNumber: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        fontWeight: '600',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    contentContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        minHeight: '100%',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 16,
        marginTop: 8,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    actionCardContainer: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionCardImage: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionCardImageStyle: {
        borderRadius: 16,
    },
    actionCardOverlay: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    actionCard: {
        width: '48%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionTitle: {
        color: '#fff',
        fontWeight: '600',
        marginTop: 8,
        fontSize: 15,
    },
    planCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    planHeaderText: {
        color: '#636e72',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 15,
    },
    planDescription: {
        color: '#636e72',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    scheduleButton: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scheduleButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    workoutsListContainer: {
        marginBottom: 24,
    },
    workoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    workoutIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    workoutDetails: {
        flex: 1,
    },
    workoutTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#667eea',
        marginBottom: 4,
    },
    workoutDesc: {
        fontSize: 14,
        color: '#636e72',
    },
    notificationIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 184, 148, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#667eea',
        borderRadius: 12,
        borderStyle: 'dashed',
    },
    addMoreText: {
        color: '#667eea',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 15,
    },
    activityCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyStateText: {
        color: '#636e72',
        marginTop: 12,
        fontSize: 15,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        color: 'rgba(99, 110, 114, 0.6)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },
});
