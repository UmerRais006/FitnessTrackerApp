import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Workout {
    time: Date;
    description: string;
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

    return (
        <WorkoutContext.Provider value={{ workouts, loadWorkouts }}>
            {children}
        </WorkoutContext.Provider>
    );
};
