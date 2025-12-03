import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface Workout {
    time: Date;
    description: string;
    notificationScheduled?: boolean;
}

interface CompletedWorkout {
    description: string;
    scheduledTime: Date;
    completedTime: Date;
    day: string;
}

interface WeekWorkouts {
    [key: string]: Workout[];
}

export default function WorkoutScreen() {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [workoutTime, setWorkoutTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [workoutDescription, setWorkoutDescription] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [workouts, setWorkouts] = useState<WeekWorkouts>({});
    const [editingWorkout, setEditingWorkout] = useState<{ day: string; index: number } | null>(null);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            // Get current user
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) return;

            const user = JSON.parse(userJson);
            const userEmail = user.email;

            // Load user-specific workouts
            const workoutsJson = await AsyncStorage.getItem(`workouts_${userEmail}`);
            if (workoutsJson) {
                const savedWorkouts = JSON.parse(workoutsJson);
                const convertedWorkouts: WeekWorkouts = {};
                Object.keys(savedWorkouts).forEach(day => {
                    convertedWorkouts[day] = savedWorkouts[day].map((w: any) => ({
                        ...w,
                        time: new Date(w.time),
                    }));
                });
                setWorkouts(convertedWorkouts);
            }
        } catch (error) {
            console.error('Error loading workouts:', error);
        }
    };

    const saveWorkouts = async (newWorkouts: WeekWorkouts) => {
        try {
            // Get current user
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) return;

            const user = JSON.parse(userJson);
            const userEmail = user.email;

            // Save user-specific workouts
            await AsyncStorage.setItem(`workouts_${userEmail}`, JSON.stringify(newWorkouts));
        } catch (error) {
            console.error('Error saving workouts:', error);
        }
    };

    const daysOfWeek = [
        { short: 'Mon', full: 'Monday' },
        { short: 'Tue', full: 'Tuesday' },
        { short: 'Wed', full: 'Wednesday' },
        { short: 'Thu', full: 'Thursday' },
        { short: 'Fri', full: 'Friday' },
        { short: 'Sat', full: 'Saturday' },
        { short: 'Sun', full: 'Sunday' },
    ];

    const handleDayPress = (day: string) => {
        setSelectedDay(day);
        setWorkoutTime(new Date());
        setWorkoutDescription('');
        setEditingWorkout(null);
        setModalVisible(true);
    };

    const handleEditWorkout = (day: string, index: number) => {
        const workout = workouts[day][index];
        setSelectedDay(day);
        setWorkoutTime(workout.time);
        setWorkoutDescription(workout.description);
        setEditingWorkout({ day, index });
        setModalVisible(true);
    };

    const handleAddWorkout = async () => {
        if (!workoutDescription.trim()) {
            Alert.alert('Error', 'Please enter workout description');
            return;
        }

        if (selectedDay) {
            // Create a proper date for the selected day
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const now = new Date();

            // If the selected day is today and the time has passed, show warning
            if (selectedDay === today && workoutTime <= now) {
                Alert.alert('Invalid Time', 'Please select a future time for today\'s workout.');
                return;
            }

            if (editingWorkout) {
                const updatedWorkouts = { ...workouts };
                updatedWorkouts[editingWorkout.day][editingWorkout.index] = {
                    time: workoutTime,
                    description: workoutDescription,
                    notificationScheduled: false,
                };
                setWorkouts(updatedWorkouts);
                await saveWorkouts(updatedWorkouts);
                Alert.alert('Success!', 'Workout updated successfully!');
            } else {
                const newWorkout: Workout = {
                    time: workoutTime,
                    description: workoutDescription,
                    notificationScheduled: false,
                };

                const updatedWorkouts = {
                    ...workouts,
                    [selectedDay]: [...(workouts[selectedDay] || []), newWorkout],
                };

                setWorkouts(updatedWorkouts);
                await saveWorkouts(updatedWorkouts);

                // Calculate time message
                let timeMessage = `Workout scheduled for ${selectedDay} at ${formatTime(workoutTime)}`;
                if (selectedDay === today) {
                    const timeUntil = Math.floor((workoutTime.getTime() - now.getTime()) / 1000 / 60);
                    timeMessage = `Workout added successfully! Scheduled for ${timeUntil} minute${timeUntil !== 1 ? 's' : ''} from now.`;
                }

                Alert.alert('Success!', timeMessage);
            }

            setWorkoutDescription('');
            setEditingWorkout(null);
            setModalVisible(false);
        }
    };

    const handleCompleteWorkout = async (day: string, index: number) => {
        const workout = workouts[day][index];

        // Validation 1: Check if workout is for today
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (day !== today) {
            Alert.alert(
                'Cannot Complete',
                `You can only complete today's workouts. This workout is scheduled for ${day}.`
            );
            return;
        }

        // Validation 2: Check if scheduled time has passed
        const now = new Date();
        const scheduledTime = new Date(workout.time);

        if (scheduledTime > now) {
            const timeUntil = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000 / 60);
            Alert.alert(
                'Too Early',
                `This workout is scheduled for ${formatTime(scheduledTime)}. You can complete it in ${timeUntil} minute${timeUntil !== 1 ? 's' : ''}.`
            );
            return;
        }

        const completedWorkout: CompletedWorkout = {
            description: workout.description,
            scheduledTime: workout.time,
            completedTime: new Date(),
            day: day,
        };

        try {
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) return;

            const user = JSON.parse(userJson);
            const userEmail = user.email;

            // Load existing completed workouts
            const completedJson = await AsyncStorage.getItem(`completed_workouts_${userEmail}`);
            const completedWorkouts: CompletedWorkout[] = completedJson ? JSON.parse(completedJson) : [];

            // Add new completed workout
            completedWorkouts.unshift(completedWorkout); // Add to beginning

            // Keep only last 10 completed workouts
            const trimmedWorkouts = completedWorkouts.slice(0, 10);

            // Save back to storage
            await AsyncStorage.setItem(`completed_workouts_${userEmail}`, JSON.stringify(trimmedWorkouts));

            // Remove from scheduled workouts
            const updatedWorkouts = {
                ...workouts,
                [day]: workouts[day].filter((_, i) => i !== index),
            };

            setWorkouts(updatedWorkouts);
            await saveWorkouts(updatedWorkouts);

            Alert.alert('Great Job!', 'Workout completed! 💪');
        } catch (error) {
            console.error('Error completing workout:', error);
            Alert.alert('Error', 'Failed to mark workout as complete');
        }
    };

    const handleDeleteWorkout = async (day: string, index: number) => {
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedWorkouts = {
                            ...workouts,
                            [day]: workouts[day].filter((_, i) => i !== index),
                        };

                        setWorkouts(updatedWorkouts);
                        await saveWorkouts(updatedWorkouts);
                    },
                },
            ]
        );
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setWorkoutTime(selectedDate);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <StatusBar style="dark" />

                {/* Header */}
                <View className="px-6 pt-4 pb-4 border-b border-gray-200">
                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity
                            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="text-black text-xl font-bold">Weekly Workout</Text>
                        <View className="w-11" />
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Current Date Display */}
                    <View className="mb-2">
                        <Text className="text-gray-600 text-sm font-medium">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>

                    {/* Week Calendar - Single Row */}
                    <View className="mb-6">
                        <Text className="text-black text-lg font-bold mb-4">Select a Day</Text>
                        <View className="flex-row justify-between">
                            {daysOfWeek.map((day) => {
                                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                                const isToday = day.full === today;
                                const hasWorkouts = workouts[day.full]?.length > 0;

                                return (
                                    <TouchableOpacity
                                        key={day.full}
                                        className={`rounded-xl px-2 py-3 items-center flex-1 mx-0.5 ${isToday
                                            ? 'bg-black'
                                            : hasWorkouts
                                                ? 'bg-gray-800'
                                                : 'bg-white border-2 border-gray-300'
                                            }`}
                                        onPress={() => handleDayPress(day.full)}
                                    >
                                        <Text
                                            className={`text-xs font-bold mb-1 ${isToday || hasWorkouts ? 'text-white' : 'text-black'
                                                }`}
                                        >
                                            {day.short}
                                        </Text>
                                        <View
                                            className={`w-5 h-5 rounded-full items-center justify-center ${isToday || hasWorkouts ? 'bg-white/20' : 'bg-gray-200'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold ${isToday || hasWorkouts ? 'text-white' : 'text-black'
                                                    }`}
                                            >
                                                {workouts[day.full]?.length || 0}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Scheduled Workouts */}
                    <View className="mb-6">
                        <Text className="text-black text-lg font-bold mb-4">Scheduled Workouts</Text>
                        {Object.keys(workouts).length === 0 ? (
                            <View className="bg-gray-50 rounded-2xl p-6 items-center">
                                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                                <Text className="text-black/60 mt-3 text-base font-semibold">No workouts scheduled</Text>
                                <Text className="text-black/40 text-sm text-center mt-1">
                                    Tap a day above to add your first workout
                                </Text>
                            </View>
                        ) : (
                            <View>
                                {daysOfWeek.map((day) => {
                                    const dayWorkouts = workouts[day.full] || [];
                                    if (dayWorkouts.length === 0) return null;

                                    return (
                                        <View key={day.full} className="mb-4">
                                            <Text className="text-black text-sm font-bold mb-2">{day.full}</Text>
                                            {dayWorkouts.map((workout, index) => (
                                                <View
                                                    key={index}
                                                    className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-2 border border-gray-200"
                                                >
                                                    <View className="w-12 h-12 rounded-full bg-black items-center justify-center mr-3">
                                                        <Ionicons name="barbell" size={24} color="#fff" />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-black text-sm font-semibold mb-1">
                                                            {formatTime(workout.time)}
                                                        </Text>
                                                        <Text className="text-gray-600 text-sm">
                                                            {workout.description}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={() => handleCompleteWorkout(day.full, index)}
                                                        className="w-9 h-9 rounded-full bg-green-100 items-center justify-center mr-2"
                                                    >
                                                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleEditWorkout(day.full, index)}
                                                        className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mr-2"
                                                    >
                                                        <Ionicons name="create-outline" size={18} color="#3b82f6" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleDeleteWorkout(day.full, index)}
                                                        className="w-9 h-9 rounded-full bg-red-100 items-center justify-center"
                                                    >
                                                        <Ionicons name="trash-outline" size={18} color="#ff4757" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Add/Edit Workout Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white rounded-t-3xl p-6 pb-8">
                                {/* Modal Header */}
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-black text-xl font-bold">
                                        {editingWorkout ? 'Edit Workout' : 'Add Workout'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalVisible(false);
                                            setEditingWorkout(null);
                                        }}
                                        className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                                    >
                                        <Ionicons name="close" size={24} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                {/* Selected Day */}
                                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <Text className="text-black/60 text-xs font-semibold mb-1">Selected Day</Text>
                                    <Text className="text-black text-lg font-bold">{selectedDay}</Text>
                                </View>

                                {/* Time Picker */}
                                <View className="mb-4">
                                    <Text className="text-black/70 text-sm font-semibold mb-2">Workout Time</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowTimePicker(true)}
                                        className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between border border-gray-200"
                                    >
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={20} color="#000" />
                                            <Text className="text-black ml-3 text-base font-medium">
                                                {formatTime(workoutTime)}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                {showTimePicker && (
                                    <DateTimePicker
                                        value={workoutTime}
                                        mode="time"
                                        is24Hour={false}
                                        display="default"
                                        onChange={onTimeChange}
                                    />
                                )}

                                {/* Description Input */}
                                <View className="mb-6">
                                    <Text className="text-black/70 text-sm font-semibold mb-2">Description</Text>
                                    <TextInput
                                        className="bg-gray-50 rounded-xl p-4 text-base text-black border border-gray-200"
                                        placeholder="e.g., Upper body workout, Cardio session..."
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        value={workoutDescription}
                                        onChangeText={setWorkoutDescription}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>

                                {/* Add/Update Button */}
                                <TouchableOpacity
                                    onPress={handleAddWorkout}
                                    className="bg-black rounded-full py-4 items-center"
                                >
                                    <Text className="text-white text-base font-bold">
                                        {editingWorkout ? 'Update Workout' : 'Add Workout'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
