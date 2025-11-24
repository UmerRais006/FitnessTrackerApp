import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        profilePic: null as string | null,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                setProfile({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    profilePic: user.profilePic || null,
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleSave = async () => {
        if (!profile.fullName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                const updatedUser = {
                    ...user,
                    fullName: profile.fullName,
                    profilePic: profile.profilePic,
                };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a photo.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0]) {
                setProfile({ ...profile, profilePic: result.assets[0].uri });
                setIsEditing(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                <StatusBar style="dark" />

                {/* Header */}
                <View className="bg-white px-5 pt-2 pb-8 border-b border-gray-200">
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center mb-8">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={22} color="#000" />
                        </TouchableOpacity>

                        <Text className="text-black text-xl font-bold">Edit Profile</Text>

                        <TouchableOpacity
                            onPress={() => {
                                if (isEditing) {
                                    handleSave();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
                        >
                            <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={22} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Picture */}
                    <View className="items-center mb-6">
                        <View className="relative">
                            <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-4 border-gray-200">
                                {profile.profilePic ? (
                                    <Image source={{ uri: profile.profilePic }} className="w-full h-full" />
                                ) : (
                                    <Ionicons name="person" size={64} color="#666" />
                                )}
                            </View>

                            {/* Camera Button */}
                            <TouchableOpacity
                                onPress={pickImage}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black items-center justify-center border-2 border-white"
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-sm mt-3">Tap camera to change photo</Text>
                    </View>
                </View>

                {/* Profile Form */}
                <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
                    {/* Full Name */}
                    <View className="mb-6">
                        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Full Name</Text>
                        <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200">
                            <Ionicons name="person-outline" size={22} color="#000" />
                            <TextInput
                                className="flex-1 ml-3 text-base text-black font-medium"
                                value={profile.fullName}
                                onChangeText={(text) => setProfile({ ...profile, fullName: text })}
                                placeholder="Enter your name"
                                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                editable={isEditing}
                            />
                            {isEditing && (
                                <Ionicons name="create-outline" size={20} color="#000" />
                            )}
                        </View>
                    </View>

                    {/* Email (Read Only) */}
                    <View className="mb-6">
                        <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Email Address</Text>
                        <View className="flex-row items-center bg-gray-100 rounded-2xl px-5 py-4 border-2 border-gray-300">
                            <Ionicons name="mail-outline" size={22} color="#666" />
                            <TextInput
                                className="flex-1 ml-3 text-base text-black/60 font-medium"
                                value={profile.email}
                                placeholder="Email"
                                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                editable={false}
                            />
                            <Ionicons name="lock-closed-outline" size={18} color="#999" />
                        </View>
                        <Text className="text-gray-400 text-xs mt-2 ml-1">Email cannot be changed</Text>
                    </View>

                    {/* Action Buttons */}
                    {isEditing && (
                        <View className="mt-4 mb-8">
                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-black rounded-full py-4 items-center mb-3"
                            >
                                <Text className="text-white text-base font-bold">Save Changes</Text>
                            </TouchableOpacity>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                onPress={() => {
                                    setIsEditing(false);
                                    loadProfile();
                                }}
                                className="bg-gray-200 rounded-full py-4 items-center"
                            >
                                <Text className="text-black text-base font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Info Card */}
                    {!isEditing && (
                        <View className="bg-gray-50 rounded-2xl p-5 mb-8 mt-4 border border-gray-200">
                            <View className="flex-row items-start">
                                <Ionicons name="information-circle-outline" size={24} color="#000" style={{ marginTop: 2 }} />
                                <View className="flex-1 ml-3">
                                    <Text className="text-black font-semibold text-base mb-1">Profile Information</Text>
                                    <Text className="text-gray-600 text-sm leading-5">
                                        Keep your profile up to date. Tap the edit icon above to make changes.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
