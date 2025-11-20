import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authAPI } from '../services/api';

export default function SignupScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateFullName = (name: string): boolean => name.trim().length >= 3;
    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string): boolean => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as keyof typeof errors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const handleSignup = async () => {
        const newErrors: typeof errors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (!validateFullName(formData.fullName)) {
            newErrors.fullName = 'Name must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be 8+ chars with uppercase, lowercase & number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await authAPI.register(formData.fullName, formData.email, formData.password);

                if (response.success) {
                    router.replace('/home');
                }
            } catch (error: any) {
                Alert.alert(
                    'Registration Failed',
                    error.message || 'Could not create account. Please try again.',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsLoading(false);
            }
        }
    };

    const passwordRequirements = [
        { met: formData.password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
        { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
        { met: /\d/.test(formData.password), text: 'One number' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={require('../assets/images/workout-bg.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.spacer} />

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            disabled={isLoading}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="person-add" size={45} color="#fff" />
                            </View>
                            <Text style={styles.title}>JOIN US</Text>
                            <Text style={styles.subtitle}>Start Your Fitness Journey Today</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.welcomeText}>Create Account</Text>
                            <Text style={styles.signInText}>Fill in your details to get started</Text>

                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                                    <Ionicons name="person-outline" size={20} color="#667eea" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor="#999"
                                        value={formData.fullName}
                                        onChangeText={(text) => handleInputChange('fullName', text)}
                                        autoCapitalize="words"
                                        editable={!isLoading}
                                    />
                                </View>
                                {errors.fullName && (
                                    <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={14} color="#ff4757" />
                                        <Text style={styles.errorText}>{errors.fullName}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                                    <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        placeholderTextColor="#999"
                                        value={formData.email}
                                        onChangeText={(text) => handleInputChange('email', text)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        editable={!isLoading}
                                    />
                                </View>
                                {errors.email && (
                                    <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={14} color="#ff4757" />
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#999"
                                        value={formData.password}
                                        onChangeText={(text) => handleInputChange('password', text)}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color="#667eea"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={14} color="#ff4757" />
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#667eea" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#999"
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color="#667eea"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && (
                                    <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={14} color="#ff4757" />
                                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.requirementsContainer}>
                                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                                {passwordRequirements.map((req, index) => (
                                    <View key={index} style={styles.requirementRow}>
                                        <Ionicons
                                            name={req.met ? "checkmark-circle" : "ellipse-outline"}
                                            size={16}
                                            color={req.met ? "#00b894" : "#b2bec3"}
                                        />
                                        <Text style={styles.requirementText}>{req.text}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                                onPress={handleSignup}
                                activeOpacity={0.8}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.signupButtonText}>Sign Up</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
                                    <Text style={styles.loginLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    spacer: {
        height: 60,
    },
    backButton: {
        position: 'absolute',
        top: 70,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    logoContainer: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: 'rgba(102, 126, 234, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 30,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 6,
    },
    signInText: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    inputError: {
        borderColor: '#ff4757',
        backgroundColor: '#fff5f5',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2d3436',
    },
    eyeIcon: {
        padding: 6,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginLeft: 4,
    },
    errorText: {
        color: '#ff4757',
        fontSize: 12,
        marginLeft: 4,
    },
    requirementsContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 10,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    requirementText: {
        fontSize: 13,
        color: '#636e72',
        marginLeft: 8,
    },
    signupButton: {
        backgroundColor: '#667eea',
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#636e72',
        fontSize: 15,
    },
    loginLink: {
        color: '#667eea',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
