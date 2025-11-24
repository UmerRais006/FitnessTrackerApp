import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
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
            const profileJson = await AsyncStorage.getItem('nutritionProfile');
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
            await AsyncStorage.setItem('nutritionProfile', JSON.stringify(newProfile));
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

        // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
        // Gender-specific formulas
        let bmr = 0;
        if (userProfile.gender === 'male') {
            bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
        } else {
            // Female formula
            bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
        }

        // Activity multiplier (moderate activity)
        const tdee = bmr * 1.55;

        let calories = tdee;
        let protein = 0;
        let carbs = 0;
        let fats = 0;
        let meals: string[] = [];

        // Adjust macros based on gender and goal
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
                protein = weight * proteinMultiplier; // High to preserve muscle
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
            case 'bulk':
                return 'Build Muscle Mass';
            case 'lean':
                return 'Maintain & Tone';
            case 'loss':
                return 'Lose Weight';
            default:
                return '';
        }
    };

    if (!hasProfile || isEditing) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <StatusBar style="light" />
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => {
                                    if (isEditing && hasProfile) {
                                        setIsEditing(false);
                                    } else {
                                        router.back();
                                    }
                                }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Nutrition Profile</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            <View style={styles.formContainer}>
                                <Text style={styles.formTitle}>
                                    {isEditing ? 'Update Your Profile' : 'Set Up Your Profile'}
                                </Text>
                                <Text style={styles.formSubtitle}>
                                    Tell us about yourself to get a personalized diet plan
                                </Text>

                                {/* Gender Selection */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Gender</Text>
                                    <View style={styles.genderRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.genderCard,
                                                profile.gender === 'male' && styles.genderCardActive,
                                            ]}
                                            onPress={() => setProfile({ ...profile, gender: 'male' })}
                                        >
                                            <Ionicons
                                                name="male"
                                                size={32}
                                                color={profile.gender === 'male' ? '#fff' : '#00b894'}
                                            />
                                            <Text
                                                style={[
                                                    styles.genderText,
                                                    profile.gender === 'male' && styles.genderTextActive,
                                                ]}
                                            >
                                                Male
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.genderCard,
                                                profile.gender === 'female' && styles.genderCardActive,
                                            ]}
                                            onPress={() => setProfile({ ...profile, gender: 'female' })}
                                        >
                                            <Ionicons
                                                name="female"
                                                size={32}
                                                color={profile.gender === 'female' ? '#fff' : '#00b894'}
                                            />
                                            <Text
                                                style={[
                                                    styles.genderText,
                                                    profile.gender === 'female' && styles.genderTextActive,
                                                ]}
                                            >
                                                Female
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Age Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Age (years)</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="calendar-outline" size={20} color="#00b894" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., 25"
                                            placeholderTextColor="#999"
                                            keyboardType="numeric"
                                            value={profile.age}
                                            onChangeText={(text) => setProfile({ ...profile, age: text })}
                                        />
                                    </View>
                                </View>

                                {/* Weight Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="fitness-outline" size={20} color="#00b894" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., 70"
                                            placeholderTextColor="#999"
                                            keyboardType="numeric"
                                            value={profile.weight}
                                            onChangeText={(text) => setProfile({ ...profile, weight: text })}
                                        />
                                    </View>
                                </View>

                                {/* Height Input - Feet and Inches */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Height</Text>
                                    <View style={styles.heightRow}>
                                        <View style={[styles.inputWrapper, styles.heightInput]}>
                                            <Ionicons name="resize-outline" size={20} color="#00b894" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Feet"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                                value={profile.heightFeet}
                                                onChangeText={(text) => setProfile({ ...profile, heightFeet: text })}
                                            />
                                            <Text style={styles.unitText}>ft</Text>
                                        </View>
                                        <View style={[styles.inputWrapper, styles.heightInput]}>
                                            <TextInput
                                                style={[styles.input, { marginLeft: 8 }]}
                                                placeholder="Inches"
                                                placeholderTextColor="#999"
                                                keyboardType="numeric"
                                                value={profile.heightInches}
                                                onChangeText={(text) => setProfile({ ...profile, heightInches: text })}
                                            />
                                            <Text style={styles.unitText}>in</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Goal Selection */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Your Goal</Text>
                                    <View style={styles.goalsContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.goalCard,
                                                profile.goal === 'bulk' && styles.goalCardActive,
                                            ]}
                                            onPress={() => setProfile({ ...profile, goal: 'bulk' })}
                                        >
                                            <Ionicons
                                                name="barbell"
                                                size={32}
                                                color={profile.goal === 'bulk' ? '#fff' : '#00b894'}
                                            />
                                            <Text
                                                style={[
                                                    styles.goalTitle,
                                                    profile.goal === 'bulk' && styles.goalTitleActive,
                                                ]}
                                            >
                                                Bulk
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.goalSubtitle,
                                                    profile.goal === 'bulk' && styles.goalSubtitleActive,
                                                ]}
                                            >
                                                Build Muscle
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.goalCard,
                                                profile.goal === 'lean' && styles.goalCardActive,
                                            ]}
                                            onPress={() => setProfile({ ...profile, goal: 'lean' })}
                                        >
                                            <Ionicons
                                                name="body"
                                                size={32}
                                                color={profile.goal === 'lean' ? '#fff' : '#00b894'}
                                            />
                                            <Text
                                                style={[
                                                    styles.goalTitle,
                                                    profile.goal === 'lean' && styles.goalTitleActive,
                                                ]}
                                            >
                                                Lean
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.goalSubtitle,
                                                    profile.goal === 'lean' && styles.goalSubtitleActive,
                                                ]}
                                            >
                                                Maintain & Tone
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.goalCard,
                                                profile.goal === 'loss' && styles.goalCardActive,
                                            ]}
                                            onPress={() => setProfile({ ...profile, goal: 'loss' })}
                                        >
                                            <Ionicons
                                                name="trending-down"
                                                size={32}
                                                color={profile.goal === 'loss' ? '#fff' : '#00b894'}
                                            />
                                            <Text
                                                style={[
                                                    styles.goalTitle,
                                                    profile.goal === 'loss' && styles.goalTitleActive,
                                                ]}
                                            >
                                                Loss
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.goalSubtitle,
                                                    profile.goal === 'loss' && styles.goalSubtitleActive,
                                                ]}
                                            >
                                                Lose Weight
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveProfile}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {isEditing ? 'Update Profile' : 'Generate Diet Plan'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

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
                        <Text style={styles.headerTitle}>Nutrition Plan</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="create-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Profile Summary */}
                        <ImageBackground
                            source={require('../assets/images/nutrition-food.png')}
                            style={styles.profileBanner}
                            imageStyle={styles.profileBannerImage}
                        >
                            <View style={styles.profileOverlay}>
                                <View style={styles.profileHeader}>
                                    <Text style={styles.profileGoal}>{getGoalDescription(profile.goal!)}</Text>
                                    <View style={styles.genderBadge}>
                                        <Ionicons
                                            name={profile.gender === 'male' ? 'male' : 'female'}
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.genderBadgeText}>
                                            {profile.gender === 'male' ? 'Male' : 'Female'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.profileStats}>
                                    <View style={styles.profileStat}>
                                        <Text style={styles.profileStatValue}>{profile.age}</Text>
                                        <Text style={styles.profileStatLabel}>Years</Text>
                                    </View>
                                    <View style={styles.profileStat}>
                                        <Text style={styles.profileStatValue}>{profile.weight}</Text>
                                        <Text style={styles.profileStatLabel}>kg</Text>
                                    </View>
                                    <View style={styles.profileStat}>
                                        <Text style={styles.profileStatValue}>{profile.heightFeet}'{profile.heightInches}"</Text>
                                        <Text style={styles.profileStatLabel}>Height</Text>
                                    </View>
                                </View>
                            </View>
                        </ImageBackground>

                        {/* Macros */}
                        {dietPlan && (
                            <View style={styles.macrosContainer}>
                                <Text style={styles.sectionTitle}>Daily Macros</Text>
                                <View style={styles.macrosGrid}>
                                    <View style={[styles.macroCard, { backgroundColor: '#667eea' }]}>
                                        <Ionicons name="flame" size={28} color="#fff" />
                                        <Text style={styles.macroValue}>{dietPlan.calories}</Text>
                                        <Text style={styles.macroLabel}>Calories</Text>
                                    </View>
                                    <View style={[styles.macroCard, { backgroundColor: '#00b894' }]}>
                                        <Ionicons name="nutrition" size={28} color="#fff" />
                                        <Text style={styles.macroValue}>{dietPlan.protein}g</Text>
                                        <Text style={styles.macroLabel}>Protein</Text>
                                    </View>
                                    <View style={[styles.macroCard, { backgroundColor: '#a29bfe' }]}>
                                        <Ionicons name="leaf" size={28} color="#fff" />
                                        <Text style={styles.macroValue}>{dietPlan.carbs}g</Text>
                                        <Text style={styles.macroLabel}>Carbs</Text>
                                    </View>
                                    <View style={[styles.macroCard, { backgroundColor: '#fd79a8' }]}>
                                        <Ionicons name="water" size={28} color="#fff" />
                                        <Text style={styles.macroValue}>{dietPlan.fats}g</Text>
                                        <Text style={styles.macroLabel}>Fats</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Meal Plan */}
                        {dietPlan && (
                            <View style={styles.mealsContainer}>
                                <Text style={styles.sectionTitle}>Suggested Meal Plan</Text>
                                {dietPlan.meals.map((meal, index) => (
                                    <View key={index} style={styles.mealCard}>
                                        <View style={styles.mealIcon}>
                                            <Ionicons name="restaurant" size={20} color="#00b894" />
                                        </View>
                                        <Text style={styles.mealText}>{meal}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Tips */}
                        <View style={styles.tipsContainer}>
                            <Text style={styles.sectionTitle}>Nutrition Tips</Text>
                            <View style={styles.tipCard}>
                                <Ionicons name="water-outline" size={24} color="#667eea" />
                                <Text style={styles.tipText}>Drink at least 3-4 liters of water daily</Text>
                            </View>
                            <View style={styles.tipCard}>
                                <Ionicons name="time-outline" size={24} color="#667eea" />
                                <Text style={styles.tipText}>Eat every 3-4 hours to maintain metabolism</Text>
                            </View>
                            <View style={styles.tipCard}>
                                <Ionicons name="moon-outline" size={24} color="#667eea" />
                                <Text style={styles.tipText}>Avoid heavy meals 2-3 hours before bed</Text>
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
        backgroundColor: '#00b894',
    },
    container: {
        flex: 1,
        backgroundColor: '#00b894',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#00b894',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
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
    formContainer: {
        padding: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 24,
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
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    genderCardActive: {
        backgroundColor: '#00b894',
        borderColor: '#00b894',
    },
    genderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginTop: 8,
    },
    genderTextActive: {
        color: '#fff',
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
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2d3436',
        marginLeft: 12,
    },
    heightRow: {
        flexDirection: 'row',
        gap: 12,
    },
    heightInput: {
        flex: 1,
    },
    unitText: {
        fontSize: 14,
        color: '#636e72',
        fontWeight: '600',
        marginLeft: 8,
    },
    goalsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    goalCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    goalCardActive: {
        backgroundColor: '#00b894',
        borderColor: '#00b894',
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginTop: 8,
    },
    goalTitleActive: {
        color: '#fff',
    },
    goalSubtitle: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 4,
    },
    goalSubtitleActive: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    saveButton: {
        backgroundColor: '#00b894',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileBanner: {
        height: 200,
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    profileBannerImage: {
        borderRadius: 16,
    },
    profileOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 184, 148, 0.9)',
        padding: 20,
        justifyContent: 'center',
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileGoal: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    genderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    genderBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    profileStats: {
        flexDirection: 'row',
        gap: 20,
    },
    profileStat: {
        alignItems: 'center',
    },
    profileStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileStatLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    macrosContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 16,
    },
    macrosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    macroCard: {
        width: '48%',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    macroLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    mealsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    mealIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 184, 148, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    mealText: {
        flex: 1,
        fontSize: 14,
        color: '#2d3436',
        lineHeight: 20,
    },
    tipsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#636e72',
        marginLeft: 12,
    },
});
