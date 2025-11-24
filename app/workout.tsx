import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar style="light" />
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Weekly Workout</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Week Calendar */}
                        <View style={styles.calendarContainer}>
                            <Text style={styles.sectionTitle}>Select a Day</Text>
                            <View style={styles.daysGrid}>
                                {daysOfWeek.map((day) => (
                                    <TouchableOpacity
                                        key={day.full}
                                        style={[
                                            styles.dayCard,
                                            workouts[day.full]?.length > 0 && styles.dayCardActive,
                                        ]}
                                        onPress={() => handleDayPress(day.full)}
                                    >
                                        <Text style={[
                                            styles.dayShort,
                                            workouts[day.full]?.length > 0 && styles.dayShortActive,
                                        ]}>
                                            {day.short}
                                        </Text>
                                        {workouts[day.full]?.length > 0 && (
                                            <View style={styles.workoutBadge}>
                                                <Text style={styles.workoutBadgeText}>
                                                    {workouts[day.full].length}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Workouts List */}
                        <View style={styles.workoutsContainer}>
                            <Text style={styles.sectionTitle}>This Week's Workouts</Text>
                            {Object.keys(workouts).length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="calendar-outline" size={64} color="#ccc" />
                                    <Text style={styles.emptyStateText}>No workouts scheduled</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Tap on a day above to add your first workout
                                    </Text>
                                </View>
                            ) : (
                                daysOfWeek.map((day) =>
                                    workouts[day.full]?.length > 0 ? (
                                        <View key={day.full} style={styles.daySection}>
                                            <Text style={styles.daySectionTitle}>{day.full}</Text>
                                            {workouts[day.full].map((workout, index) => (
                                                <View key={index} style={styles.workoutCard}>
                                                    <View style={styles.dumbbellIcon}>
                                                        <Ionicons name="barbell" size={24} color="#667eea" />
                                                    </View>
                                                    <View style={styles.workoutInfo}>
                                                        <View style={styles.workoutTimeContainer}>
                                                            <Ionicons name="time-outline" size={18} color="#667eea" />
                                                            <Text style={styles.workoutTime}>{formatTime(workout.time)}</Text>
                                                        </View>
                                                        <Text style={styles.workoutDescription}>
                                                            {workout.description}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.deleteButton}
                                                        onPress={() => handleDeleteWorkout(day.full, index)}
                                                    >
                                                        <Ionicons name="trash-outline" size={20} color="#ff4757" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null
                                )
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
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Add Workout - {selectedDay}</Text>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="#636e72" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Workout Time</Text>
                                    <TouchableOpacity
                                        style={styles.timePickerButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Ionicons name="time-outline" size={20} color="#667eea" />
                                        <View style={styles.timePickerContent}>
                                            <Text style={styles.timePickerText}>{formatTime(workoutTime)}</Text>
                                            <Text style={styles.timePickerDate}>{formatDate(workoutTime)}</Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={20} color="#667eea" />
                                    </TouchableOpacity>

                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={workoutTime}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={onTimeChange}
                                        />
                                    )}
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Description</Text>
                                    <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                        <Ionicons name="clipboard-outline" size={20} color="#667eea" style={styles.textAreaIcon} />
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="e.g., Chest & Triceps, Cardio, Yoga..."
                                            placeholderTextColor="#999"
                                            value={workoutDescription}
                                            onChangeText={setWorkoutDescription}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddWorkout}
                                >
                                    <Text style={styles.addButtonText}>Add Workout</Text>
                                    <Ionicons name="add-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#667eea',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    calendarContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 16,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dayCard: {
        width: '13%',
        aspectRatio: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e9ecef',
        position: 'relative',
    },
    dayCardActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    dayShort: {
        fontSize: 12,
        fontWeight: '600',
        color: '#636e72',
    },
    dayShortActive: {
        color: '#fff',
    },
    workoutBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#00b894',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workoutBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    workoutsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        color: '#636e72',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        color: 'rgba(99, 110, 114, 0.6)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    daySection: {
        marginBottom: 24,
    },
    daySectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 12,
    },
    workoutCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    dumbbellIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    workoutTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#667eea',
        marginLeft: 6,
    },
    workoutDescription: {
        fontSize: 14,
        color: '#636e72',
        lineHeight: 20,
    },
    deleteButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    closeButton: {
        padding: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 8,
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    timePickerContent: {
        flex: 1,
        marginLeft: 12,
    },
    timePickerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
    },
    timePickerDate: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingTop: 14,
    },
    textAreaIcon: {
        marginTop: 2,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2d3436',
        marginLeft: 12,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
