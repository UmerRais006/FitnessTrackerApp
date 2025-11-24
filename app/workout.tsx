import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ImageBackground,
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

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            const workoutsJson = await AsyncStorage.getItem('workouts');
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
            await AsyncStorage.setItem('workouts', JSON.stringify(newWorkouts));
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
        setModalVisible(true);
    };

    const handleAddWorkout = async () => {
        if (!workoutDescription.trim()) {
            Alert.alert('Error', 'Please enter workout description');
            return;
        }

        const now = new Date();
        if (workoutTime <= now) {
            Alert.alert('Invalid Time', 'Please select a future time for the workout.');
            return;
        }

        if (selectedDay) {
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

            setWorkoutDescription('');
            setModalVisible(false);

            const timeUntil = Math.floor((workoutTime.getTime() - now.getTime()) / 1000 / 60);
            Alert.alert(
                'Success!',
                `Workout added successfully! Scheduled for ${timeUntil} minute${timeUntil !== 1 ? 's' : ''} from now.`
            );
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
                <StatusBar style="light" />

                {/* Header with Background */}
                <ImageBackground
                    source={require('../assets/images/workout-bicep.png')}
                    className="pb-4 pt-2"
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(255, 140, 0, 0.85)', 'rgba(139, 69, 19, 0.9)']}
                        className="absolute inset-0"
                    />

                    <View className="flex-row justify-between items-center px-5">
                        <TouchableOpacity
                            className="w-11 h-11 rounded-full bg-black/20 items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="text-black text-xl font-bold">Weekly Workout</Text>
                        <View className="w-11" />
                    </View>
                </ImageBackground>

                <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Week Calendar */}
                    <View className="mb-6">
                        <Text className="text-black text-lg font-bold mb-4">Select a Day</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {daysOfWeek.map((day) => (
                                <TouchableOpacity
                                    key={day.full}
                                    className={`w-[30%] rounded-2xl p-4 items-center ${workouts[day.full]?.length > 0
                                            ? 'bg-orange-500'
                                            : 'bg-orange-100'
                                        }`}
                                    onPress={() => handleDayPress(day.full)}
                                >
                                    <Text className={`text-sm font-semibold mb-1 ${workouts[day.full]?.length > 0 ? 'text-white' : 'text-black/70'
                                        }`}>
                                        {day.short}
                                    </Text>
                                    <View className={`w-8 h-8 rounded-full items-center justify-center ${workouts[day.full]?.length > 0 ? 'bg-white/30' : 'bg-orange-200'
                                        }`}>
                                        <Text className={`text-xs font-bold ${workouts[day.full]?.length > 0 ? 'text-white' : 'text-orange-600'
                                            }`}>
                                            {workouts[day.full]?.length || 0}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Scheduled Workouts */}
                    <View className="mb-6">
                        <Text className="text-black text-lg font-bold mb-4">Scheduled Workouts</Text>
                        {Object.keys(workouts).length === 0 ? (
                            <View className="bg-orange-50 rounded-2xl p-6 items-center">
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
                                            <Text className="text-orange-600 text-sm font-bold mb-2">{day.full}</Text>
                                            {dayWorkouts.map((workout, index) => (
                                                <View
                                                    key={index}
                                                    className="flex-row items-center bg-orange-50 rounded-xl p-4 mb-2 border border-orange-200"
                                                >
                                                    <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3">
                                                        <Ionicons name="barbell" size={24} color="#FF8C00" />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-orange-600 text-sm font-semibold mb-1">
                                                            {formatTime(workout.time)}
                                                        </Text>
                                                        <Text className="text-black/70 text-sm">
                                                            {workout.description}
                                                        </Text>
                                                    </View>
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

                {/* Add Workout Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white rounded-t-3xl p-6 pb-8">
                            {/* Modal Header */}
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-black text-xl font-bold">Add Workout</Text>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {/* Selected Day */}
                            <View className="bg-orange-50 rounded-xl p-4 mb-4">
                                <Text className="text-black/60 text-xs font-semibold mb-1">Selected Day</Text>
                                <Text className="text-orange-600 text-lg font-bold">{selectedDay}</Text>
                            </View>

                            {/* Time Picker */}
                            <View className="mb-4">
                                <Text className="text-black/70 text-sm font-semibold mb-2">Workout Time</Text>
                                <TouchableOpacity
                                    onPress={() => setShowTimePicker(true)}
                                    className="bg-orange-50 rounded-xl p-4 flex-row items-center justify-between border border-orange-200"
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={20} color="#FF8C00" />
                                        <Text className="text-black ml-3 text-base font-medium">
                                            {formatTime(workoutTime)}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#FF8C00" />
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
                                    className="bg-orange-50 rounded-xl p-4 text-base text-black border border-orange-200"
                                    placeholder="e.g., Upper body workout, Cardio session..."
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    value={workoutDescription}
                                    onChangeText={setWorkoutDescription}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Add Button */}
                            <TouchableOpacity
                                onPress={handleAddWorkout}
                                className="bg-black rounded-full py-4 items-center"
                            >
                                <Text className="text-white text-base font-bold">Add Workout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
