import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { WorkoutProvider } from './WorkoutContext';

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="workout" options={{ headerShown: false }} />
        <Stack.Screen name="nutrition" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </WorkoutProvider>
  );
}

