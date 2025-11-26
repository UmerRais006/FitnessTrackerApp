import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Base URL
// For Android Emulator: http://10.0.2.2:5000
// For iOS Simulator: http://localhost:5000
// For Physical Device: http://YOUR_COMPUTER_IP:5000 (find IP with ipconfig/ifconfig)
const API_URL = 'http://192.168.100.41:3000/api'; // Physical Device - Your computer's IP

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    // Register new user
    register: async (fullName: string, email: string, password: string) => {
        try {
            const response = await api.post('/auth/register', {
                fullName,
                email,
                password,
            });

            if (response.data.success && response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            throw new Error(errorMessage);
        }
    },

    // Login user
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            if (response.data.success && response.data.token) {
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            throw new Error(errorMessage);
        }
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Continue with logout even if API call fails
        } finally {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
        }
    },

    // Update Profile
    updateProfile: async (fullName: string, profilePic: string | null) => {
        try {
            const response = await api.put('/auth/profile', {
                fullName,
                profilePic,
            });

            if (response.data.success && response.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            throw new Error(errorMessage);
        }
    },

    // Check if user is authenticated
    isAuthenticated: async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return !!token; // Returns true if token exists, false otherwise
        } catch (error) {
            return false;
        }
    },

    // Get stored user data
    getStoredUser: async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            return null;
        }
    },
};

export default api;
