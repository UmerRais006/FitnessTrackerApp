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



    return (
        <WorkoutContext.Provider value={{ workouts, loadWorkouts }}>
            {children}
        </WorkoutContext.Provider>
    );
};
