import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={require('../assets/images/image.png')}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['rgba(255, 140, 0, 0.3)', 'rgba(139, 69, 19, 0.7)', 'rgba(62, 39, 35, 0.85)']}
                    style={styles.gradientOverlay}
                />

                <View style={styles.content}>
                    {/* Logo/Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}></Text>
                    </View>

                    {/* Buttons Section */}
                    <View style={styles.buttonsSection}>
                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            activeOpacity={0.8}
                            style={styles.loginButton}
                        >
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>

                        {/* Signup Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/signup')}
                            activeOpacity={0.8}
                            style={styles.signupButton}
                        >
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        </TouchableOpacity>

                        {/* Terms Text */}
                        <Text style={styles.termsText}>
                            By continuing, you agree to our Terms of Service
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 100,
        paddingBottom: 60,
    },
    titleSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    buttonsSection: {
        width: '100%',
    },
    loginButton: {
        backgroundColor: '#000000ff',
        borderRadius: 30,
        borderColor:'#a66435ff',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loginButtonText: {
        color: '#8B4513',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#000000ff',
        borderRadius: 30,
        paddingVertical: 19,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 80,
    },
    signupButtonText: {
        color: '#000000ff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    termsText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
