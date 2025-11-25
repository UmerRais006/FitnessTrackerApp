import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
    age: string;
    weight: string;
    heightFeet: string;
    heightInches: string;
    gender: 'male' | 'female' | null;
    goal: 'bulk' | 'lean' | 'loss' | null;
}

interface DietPlan {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: string[];
}

// Reusable Components
const MacroCard = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
    <View className="flex-1 bg-black rounded-xl p-4 items-center mx-1">
        <Ionicons name={icon as any} size={24} color="#fff" />
        <Text className="text-white text-xl font-bold mt-2">{value}</Text>
        <Text className="text-gray-400 text-xs mt-1">{label}</Text>
    </View>
);

const MealCard = ({ meal }: { meal: string }) => (
    <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
        <View className="w-10 h-10 rounded-full bg-black items-center justify-center mr-3">
            <Ionicons name="restaurant" size={18} color="#fff" />
        </View>
        <Text className="flex-1 text-black text-sm">{meal}</Text>
    </View>
);

const TipCard = ({ icon, text }: { icon: string; text: string }) => (
    <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
        <Ionicons name={icon as any} size={24} color="#000" />
        <Text className="flex-1 text-black text-sm ml-3">{text}</Text>
    </View>
);

export default function NutritionScreen() {
    const router = useRouter();
    const [hasProfile, setHasProfile] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        age: '',
        weight: '',
        heightFeet: '',
        heightInches: '',
        gender: null,
        goal: null,
    });
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // Get current user
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) return;

            const user = JSON.parse(userJson);
            const userEmail = user.email;

            // Load user-specific nutrition profile
            const profileJson = await AsyncStorage.getItem(`nutritionProfile_${userEmail}`);
            if (profileJson) {
                const savedProfile = JSON.parse(profileJson);
                setProfile(savedProfile);
                setHasProfile(true);
                generateDietPlan(savedProfile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const saveProfile = async (newProfile: UserProfile) => {
        try {
            // Get current user
            const userJson = await AsyncStorage.getItem('user');
            if (!userJson) {
                Alert.alert('Error', 'Please login first');
                return;
            }

            const user = JSON.parse(userJson);
            const userEmail = user.email;

            // Save user-specific nutrition profile
            await AsyncStorage.setItem(`nutritionProfile_${userEmail}`, JSON.stringify(newProfile));
            setProfile(newProfile);
            setHasProfile(true);
            generateDietPlan(newProfile);
            setIsEditing(false);
            Alert.alert('Success', 'Your nutrition profile has been saved!');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    const feetToCm = (feet: number, inches: number): number => {
        return (feet * 30.48) + (inches * 2.54);
    };

    const generateDietPlan = (userProfile: UserProfile) => {
        const age = parseInt(userProfile.age);
        const weight = parseFloat(userProfile.weight);
        const feet = parseInt(userProfile.heightFeet);
        const inches = parseInt(userProfile.heightInches);
        const heightCm = feetToCm(feet, inches);

        let bmr = 0;
        if (userProfile.gender === 'male') {
            bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
        }

        const tdee = bmr * 1.55;
        let calories = tdee;
        let protein = 0;
        let carbs = 0;
        let fats = 0;
        let meals: string[] = [];

        const proteinMultiplier = userProfile.gender === 'male' ? 2.2 : 1.8;
        const fatsMultiplier = userProfile.gender === 'male' ? 1.0 : 0.9;

        switch (userProfile.goal) {
            case 'bulk':
                calories = tdee + (userProfile.gender === 'male' ? 500 : 350);
                protein = weight * proteinMultiplier;
                fats = weight * fatsMultiplier;
                carbs = (calories - (protein * 4 + fats * 9)) / 4;
                meals = [
                    '🍳 Breakfast: 4 eggs, oatmeal with banana, protein shake',
                    '🥗 Snack 1: Greek yogurt with nuts and berries',
                    '🍗 Lunch: Grilled chicken breast, brown rice, vegetables',
                    '🥜 Snack 2: Protein bar and apple',
                    '🥩 Dinner: Lean beef steak, sweet potato, broccoli',
                    '🥛 Before Bed: Casein protein shake',
                ];
                break;

            case 'lean':
                calories = tdee;
                protein = weight * (proteinMultiplier - 0.2);
                fats = weight * (fatsMultiplier - 0.1);
                carbs = (calories - (protein * 4 + fats * 9)) / 4;
                meals = [
                    '🍳 Breakfast: 3 eggs, whole grain toast, avocado',
                    '🥗 Snack 1: Protein shake with banana',
                    '🍗 Lunch: Grilled chicken, quinoa, mixed vegetables',
                    '🍎 Snack 2: Apple with almond butter',
                    '🐟 Dinner: Grilled fish, brown rice, asparagus',
                    '🥛 Evening: Greek yogurt',
                ];
                break;

            case 'loss':
                calories = tdee - (userProfile.gender === 'male' ? 500 : 400);
                protein = weight * proteinMultiplier;
                fats = weight * (fatsMultiplier - 0.2);
                carbs = (calories - (protein * 4 + fats * 9)) / 4;
                meals = [
                    '🍳 Breakfast: Egg whites omelet, oatmeal',
                    '🥗 Snack 1: Protein shake',
                    '🍗 Lunch: Grilled chicken salad, vegetables',
                    '🍎 Snack 2: Apple or berries',
                    '🐟 Dinner: Grilled fish, steamed vegetables',
                    '🥛 Evening: Low-fat Greek yogurt',
                ];
                break;
        }

        setDietPlan({
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fats: Math.round(fats),
            meals,
        });
    };

    const handleSaveProfile = () => {
        if (!profile.age || !profile.weight || !profile.heightFeet || !profile.heightInches || !profile.gender || !profile.goal) {
            Alert.alert('Error', 'Please fill in all fields, select gender and goal');
            return;
        }

        if (parseInt(profile.age) < 10 || parseInt(profile.age) > 100) {
            Alert.alert('Error', 'Please enter a valid age (10-100)');
            return;
        }

        if (parseFloat(profile.weight) < 30 || parseFloat(profile.weight) > 300) {
            Alert.alert('Error', 'Please enter a valid weight (30-300 kg)');
            return;
        }

        const feet = parseInt(profile.heightFeet);
        const inches = parseInt(profile.heightInches);

        if (feet < 3 || feet > 8) {
            Alert.alert('Error', 'Please enter valid height (3-8 feet)');
            return;
        }

        if (inches < 0 || inches > 11) {
            Alert.alert('Error', 'Please enter valid inches (0-11)');
            return;
        }

        saveProfile(profile);
    };

    const getGoalDescription = (goal: string) => {
        switch (goal) {
            case 'bulk': return 'Build Muscle Mass';
            case 'lean': return 'Maintain & Tone';
            case 'loss': return 'Lose Weight';
            default: return '';
        }
    };

    if (!hasProfile || isEditing) {
        return (
            <SafeAreaProvider>
                <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                    <StatusBar style="dark" />

                    {/* Header */}
                    <View className="px-6 pt-4 pb-4 border-b border-gray-200">
                        <View className="flex-row justify-between items-center">
                            <TouchableOpacity
                                className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                                onPress={() => {
                                    if (isEditing && hasProfile) {
                                        setIsEditing(false);
                                    } else {
                                        router.back();
                                    }
                                }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text className="text-black text-xl font-bold">Nutrition Profile</Text>
                            <View className="w-11" />
                        </View>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                    >
                        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                            <Text className="text-black text-2xl font-bold mb-2">
                                {isEditing ? 'Update Your Profile' : 'Set Up Your Profile'}
                            </Text>
                            <Text className="text-gray-600 text-sm mb-6">
                                Tell us about yourself to get a personalized diet plan
                            </Text>

                            {/* Gender Selection */}
                            <Text className="text-black text-sm font-semibold mb-3">Gender</Text>
                            <View className="flex-row gap-3 mb-5">
                                <TouchableOpacity
                                    className={`flex-1 rounded-xl p-5 items-center border-2 ${profile.gender === 'male' ? 'bg-black border-black' : 'bg-white border-gray-300'
                                        }`}
                                    onPress={() => setProfile({ ...profile, gender: 'male' })}
                                >
                                    <Ionicons name="male" size={32} color={profile.gender === 'male' ? '#fff' : '#000'} />
                                    <Text className={`text-base font-bold mt-2 ${profile.gender === 'male' ? 'text-white' : 'text-black'}`}>
                                        Male
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-1 rounded-xl p-5 items-center border-2 ${profile.gender === 'female' ? 'bg-black border-black' : 'bg-white border-gray-300'
                                        }`}
                                    onPress={() => setProfile({ ...profile, gender: 'female' })}
                                >
                                    <Ionicons name="female" size={32} color={profile.gender === 'female' ? '#fff' : '#000'} />
                                    <Text className={`text-base font-bold mt-2 ${profile.gender === 'female' ? 'text-white' : 'text-black'}`}>
                                        Female
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Age Input */}
                            <Text className="text-black text-sm font-semibold mb-3">Age (years)</Text>
                            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 mb-5 border border-gray-200">
                                <Ionicons name="calendar-outline" size={20} color="#000" />
                                <TextInput
                                    className="flex-1 text-black text-base ml-3"
                                    placeholder="e.g., 25"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={profile.age}
                                    onChangeText={(text) => setProfile({ ...profile, age: text })}
                                />
                            </View>

                            {/* Weight Input */}
                            <Text className="text-black text-sm font-semibold mb-3">Weight (kg)</Text>
                            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 mb-5 border border-gray-200">
                                <Ionicons name="fitness-outline" size={20} color="#000" />
                                <TextInput
                                    className="flex-1 text-black text-base ml-3"
                                    placeholder="e.g., 70"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={profile.weight}
                                    onChangeText={(text) => setProfile({ ...profile, weight: text })}
                                />
                            </View>

                            {/* Height Input */}
                            <Text className="text-black text-sm font-semibold mb-3">Height</Text>
                            <View className="flex-row gap-3 mb-5">
                                <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                                    <Ionicons name="resize-outline" size={20} color="#000" />
                                    <TextInput
                                        className="flex-1 text-black text-base ml-3"
                                        placeholder="Feet"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                        value={profile.heightFeet}
                                        onChangeText={(text) => setProfile({ ...profile, heightFeet: text })}
                                    />
                                    <Text className="text-gray-600 text-sm font-semibold">ft</Text>
                                </View>
                                <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                                    <TextInput
                                        className="flex-1 text-black text-base ml-2"
                                        placeholder="Inches"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                        value={profile.heightInches}
                                        onChangeText={(text) => setProfile({ ...profile, heightInches: text })}
                                    />
                                    <Text className="text-gray-600 text-sm font-semibold">in</Text>
                                </View>
                            </View>

                            {/* Goal Selection */}
                            <Text className="text-black text-sm font-semibold mb-3">Your Goal</Text>
                            <View className="flex-row gap-3 mb-6">
                                <TouchableOpacity
                                    className={`flex-1 rounded-xl p-4 items-center border-2 ${profile.goal === 'bulk' ? 'bg-black border-black' : 'bg-white border-gray-300'
                                        }`}
                                    onPress={() => setProfile({ ...profile, goal: 'bulk' })}
                                >
                                    <Ionicons name="barbell" size={28} color={profile.goal === 'bulk' ? '#fff' : '#000'} />
                                    <Text className={`text-sm font-bold mt-2 ${profile.goal === 'bulk' ? 'text-white' : 'text-black'}`}>
                                        Bulk
                                    </Text>
                                    <Text className={`text-xs mt-1 ${profile.goal === 'bulk' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Build Muscle
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-1 rounded-xl p-4 items-center border-2 ${profile.goal === 'lean' ? 'bg-black border-black' : 'bg-white border-gray-300'
                                        }`}
                                    onPress={() => setProfile({ ...profile, goal: 'lean' })}
                                >
                                    <Ionicons name="body" size={28} color={profile.goal === 'lean' ? '#fff' : '#000'} />
                                    <Text className={`text-sm font-bold mt-2 ${profile.goal === 'lean' ? 'text-white' : 'text-black'}`}>
                                        Lean
                                    </Text>
                                    <Text className={`text-xs mt-1 ${profile.goal === 'lean' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Maintain
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-1 rounded-xl p-4 items-center border-2 ${profile.goal === 'loss' ? 'bg-black border-black' : 'bg-white border-gray-300'
                                        }`}
                                    onPress={() => setProfile({ ...profile, goal: 'loss' })}
                                >
                                    <Ionicons name="trending-down" size={28} color={profile.goal === 'loss' ? '#fff' : '#000'} />
                                    <Text className={`text-sm font-bold mt-2 ${profile.goal === 'loss' ? 'text-white' : 'text-black'}`}>
                                        Loss
                                    </Text>
                                    <Text className={`text-xs mt-1 ${profile.goal === 'loss' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Lose Weight
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                className="bg-black rounded-full py-5 flex-row items-center justify-center mb-6"
                                onPress={handleSaveProfile}
                            >
                                <Text className="text-white text-base font-bold mr-2">
                                    {isEditing ? 'Update Profile' : 'Generate Diet Plan'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

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
                        <Text className="text-black text-xl font-bold">Nutrition Plan</Text>
                        <TouchableOpacity
                            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="create-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Profile Summary */}
                    <View className="bg-black rounded-2xl p-6 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-2xl font-bold">{getGoalDescription(profile.goal!)}</Text>
                            <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                                <Ionicons name={profile.gender === 'male' ? 'male' : 'female'} size={16} color="#fff" />
                                <Text className="text-white text-sm font-semibold ml-1">
                                    {profile.gender === 'male' ? 'Male' : 'Female'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-white text-2xl font-bold">{profile.age}</Text>
                                <Text className="text-gray-400 text-xs mt-1">Years</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-white text-2xl font-bold">{profile.weight}</Text>
                                <Text className="text-gray-400 text-xs mt-1">kg</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-white text-2xl font-bold">{profile.heightFeet}'{profile.heightInches}"</Text>
                                <Text className="text-gray-400 text-xs mt-1">Height</Text>
                            </View>
                        </View>
                    </View>

                    {/* Macros */}
                    {dietPlan && (
                        <View className="mb-6">
                            <Text className="text-black text-lg font-bold mb-4">Daily Macros</Text>
                            <View className="flex-row mb-3">
                                <MacroCard icon="flame" value={dietPlan.calories.toString()} label="Calories" />
                                <MacroCard icon="nutrition" value={`${dietPlan.protein}g`} label="Protein" />
                            </View>
                            <View className="flex-row">
                                <MacroCard icon="leaf" value={`${dietPlan.carbs}g`} label="Carbs" />
                                <MacroCard icon="water" value={`${dietPlan.fats}g`} label="Fats" />
                            </View>
                        </View>
                    )}

                    {/* Meal Plan */}
                    {dietPlan && (
                        <View className="mb-6">
                            <Text className="text-black text-lg font-bold mb-4">Suggested Meal Plan</Text>
                            {dietPlan.meals.map((meal, index) => (
                                <MealCard key={index} meal={meal} />
                            ))}
                        </View>
                    )}

                    {/* Tips */}
                    <View className="mb-6">
                        <Text className="text-black text-lg font-bold mb-4">Nutrition Tips</Text>
                        <TipCard icon="water-outline" text="Drink at least 3-4 liters of water daily" />
                        <TipCard icon="time-outline" text="Eat every 3-4 hours to maintain metabolism" />
                        <TipCard icon="moon-outline" text="Avoid heavy meals 2-3 hours before bed" />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
