import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';

interface Workout {
    time: Date;
    description: string;
    notificationScheduled?: boolean;
}

interface WeekWorkouts {
    [key: string]: Workout[];
}

interface WorkoutContextType {
    workouts: WeekWorkouts;
    loadWorkouts: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType>({
    workouts: {},
    loadWorkouts: async () => { },
});

export const useWorkouts = () => useContext(WorkoutContext);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [workouts, setWorkouts] = useState<WeekWorkouts>({});
    const [notifiedWorkouts, setNotifiedWorkouts] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadWorkouts();

        // Check for notifications every 15 seconds
        const interval = setInterval(checkWorkoutNotifications, 15000);

        // Also check when app comes to foreground
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                checkWorkoutNotifications();
            }
        });

        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        // Check notifications whenever workouts change
        if (Object.keys(workouts).length > 0) {
            checkWorkoutNotifications();
        }
    }, [workouts]);

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

    const checkWorkoutNotifications = () => {
        const now = new Date();
        const today = now.toLocaleDateString('en-US', { weekday: 'long' });

        if (workouts[today]) {
            workouts[today].forEach((workout, index) => {
                const workoutTime = new Date(workout.time);
                const timeDiff = workoutTime.getTime() - now.getTime();
                const workoutKey = `${today}-${index}-${workoutTime.getTime()}`;

                // Notify if workout is within 2 minutes and hasn't been notified yet
                if (timeDiff > 0 && timeDiff <= 120000 && !notifiedWorkouts.has(workoutKey)) {
                    console.log(`🔔 Showing notification for: ${workout.description}`);
                    setNotifiedWorkouts(prev => new Set(prev).add(workoutKey));

                    Alert.alert(
                        '💪 Workout Reminder!',
                        `Time for: ${workout.description}\n\nScheduled at: ${formatTime(workoutTime)}`,
                        [
                            {
                                text: 'Dismiss',
                                style: 'cancel'
                            },
                            {
                                text: 'Got it!',
                                onPress: () => console.log('Workout acknowledged')
                            }
                        ],
                        { cancelable: false }
                    );
                }
            });
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
        <WorkoutContext.Provider value={{ workouts, loadWorkouts }}>
            {children}
        </WorkoutContext.Provider>
    );
};
