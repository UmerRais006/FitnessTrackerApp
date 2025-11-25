import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type TimerMode = 'stopwatch' | 'countdown';

export default function TimerScreen() {
    const router = useRouter();
    const [mode, setMode] = useState<TimerMode>('stopwatch');

    // Stopwatch state
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const stopwatchInterval = useRef<NodeJS.Timeout | null>(null);

    // Countdown state
    const [countdownTime, setCountdownTime] = useState(0);
    const [countdownDuration, setCountdownDuration] = useState(60);
    const [isCountdownRunning, setIsCountdownRunning] = useState(false);
    const countdownInterval = useRef<NodeJS.Timeout | null>(null);

    // Preset times in seconds - up to 10 minutes
    const presets = [
        { label: '30s', value: 30 },
        { label: '1min', value: 60 },
        { label: '2min', value: 120 },
        { label: '3min', value: 180 },
        { label: '5min', value: 300 },
        { label: '10min', value: 600 },
    ];

    useEffect(() => {
        return () => {
            if (stopwatchInterval.current) clearInterval(stopwatchInterval.current);
            if (countdownInterval.current) clearInterval(countdownInterval.current);
        };
    }, []);

    // Stopwatch functions
    const startStopwatch = () => {
        setIsStopwatchRunning(true);
        stopwatchInterval.current = setInterval(() => {
            setStopwatchTime(prev => prev + 10);
        }, 10) as any;
    };

    const pauseStopwatch = () => {
        setIsStopwatchRunning(false);
        if (stopwatchInterval.current) {
            clearInterval(stopwatchInterval.current);
        }
    };

    const resetStopwatch = () => {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        if (stopwatchInterval.current) {
            clearInterval(stopwatchInterval.current);
        }
    };

    // Countdown functions
    const startCountdown = () => {
        if (countdownTime === 0) {
            setCountdownTime(countdownDuration);
        }
        setIsCountdownRunning(true);
        countdownInterval.current = setInterval(() => {
            setCountdownTime(prev => {
                if (prev <= 1) {
                    handleCountdownComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000) as any;
    };

    const pauseCountdown = () => {
        setIsCountdownRunning(false);
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
        }
    };

    const resetCountdown = () => {
        setIsCountdownRunning(false);
        setCountdownTime(countdownDuration);
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
        }
    };

    const handleCountdownComplete = () => {
        setIsCountdownRunning(false);
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
        }
        Vibration.vibrate([0, 500, 200, 500]);
        Alert.alert('Time\'s Up!', 'Your countdown timer has finished.', [{ text: 'OK' }]);
    };

    const setPreset = (seconds: number) => {
        setCountdownDuration(seconds);
        setCountdownTime(seconds);
        setIsCountdownRunning(false);
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
        }
    };

    // Format time for stopwatch (MM:SS:MS)
    const formatStopwatch = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    // Format time for countdown (MM:SS)
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const switchMode = (newMode: TimerMode) => {
        // Reset both timers when switching
        resetStopwatch();
        resetCountdown();
        setMode(newMode);
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <StatusBar style="dark" />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
          

                    {/* Mode Toggle */}
                    <View className="px-6 pt-6 pb-4">
                        <View className="flex-row bg-gray-100 rounded-full p-1">
                            <TouchableOpacity
                                onPress={() => switchMode('stopwatch')}
                                className={`flex-1 py-3 rounded-full items-center ${mode === 'stopwatch' ? 'bg-black' : 'bg-transparent'}`}
                                activeOpacity={0.7}
                            >
                                <Text className={`font-semibold ${mode === 'stopwatch' ? 'text-white' : 'text-gray-600'}`}>
                                    Stopwatch
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => switchMode('countdown')}
                                className={`flex-1 py-3 rounded-full items-center ${mode === 'countdown' ? 'bg-black' : 'bg-transparent'}`}
                                activeOpacity={0.7}
                            >
                                <Text className={`font-semibold ${mode === 'countdown' ? 'text-white' : 'text-gray-600'}`}>
                                    Countdown
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Timer Display */}
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="flex-1 justify-center items-center px-6"
                        showsVerticalScrollIndicator={false}
                    >
                        {mode === 'stopwatch' ? (
                            <>
                                {/* Stopwatch Display */}
                                <View className="items-center mb-12">
                                    <Ionicons name="stopwatch-outline" size={64} color="#f97316" />
                                    <Text className="text-7xl font-bold text-black mt-8 tracking-wider">
                                        {formatStopwatch(stopwatchTime)}
                                    </Text>
                                </View>

                                {/* Stopwatch Controls */}
                                <View className="flex-row gap-4 w-full px-4">
                                    <TouchableOpacity
                                        onPress={resetStopwatch}
                                        className="flex-1 bg-gray-100 rounded-2xl py-5 items-center"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="refresh-outline" size={28} color="#000" />
                                        <Text className="text-black font-semibold mt-2">Reset</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={isStopwatchRunning ? pauseStopwatch : startStopwatch}
                                        className="flex-1 bg-black rounded-2xl py-5 items-center"
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={isStopwatchRunning ? 'pause' : 'play'}
                                            size={28}
                                            color="#fff"
                                        />
                                        <Text className="text-white font-semibold mt-2">
                                            {isStopwatchRunning ? 'Pause' : 'Start'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* Countdown Display */}
                                <View className="items-center mb-8">
                                    <Ionicons name="timer-outline" size={64} color="#f97316" />
                                    <Text className="text-8xl font-bold text-black mt-8 tracking-wider">
                                        {formatCountdown(countdownTime || countdownDuration)}
                                    </Text>
                                </View>

                                {/* Preset Buttons */}
                                <View className="flex-row flex-wrap gap-3 mb-8 px-4 justify-center">
                                    {presets.map((preset) => (
                                        <TouchableOpacity
                                            key={preset.value}
                                            onPress={() => setPreset(preset.value)}
                                            className={`px-6 py-3 rounded-full ${countdownDuration === preset.value && !isCountdownRunning
                                                    ? 'bg-orange-500'
                                                    : 'bg-gray-100'
                                                }`}
                                            activeOpacity={0.7}
                                            disabled={isCountdownRunning}
                                        >
                                            <Text className={`font-semibold ${countdownDuration === preset.value && !isCountdownRunning
                                                    ? 'text-white'
                                                    : 'text-black'
                                                }`}>
                                                {preset.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Countdown Controls */}
                                <View className="flex-row gap-4 w-full px-4">
                                    <TouchableOpacity
                                        onPress={resetCountdown}
                                        className="flex-1 bg-gray-100 rounded-2xl py-5 items-center"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="refresh-outline" size={28} color="#000" />
                                        <Text className="text-black font-semibold mt-2">Reset</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={isCountdownRunning ? pauseCountdown : startCountdown}
                                        className="flex-1 bg-black rounded-2xl py-5 items-center"
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={isCountdownRunning ? 'pause' : 'play'}
                                            size={28}
                                            color="#fff"
                                        />
                                        <Text className="text-white font-semibold mt-2">
                                            {isCountdownRunning ? 'Pause' : 'Start'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
