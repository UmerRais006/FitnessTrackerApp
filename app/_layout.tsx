import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChatModal } from '../components/ChatBot/ChatModal';
import { FloatingChatButton } from '../components/ChatBot/FloatingChatButton';
import '../global.css';
import { ChatProvider } from './ChatContext';
import { WorkoutProvider } from './WorkoutContext';

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <ChatProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="workout" options={{ headerShown: false }} />
          <Stack.Screen name="nutrition" options={{ headerShown: false }} />
          <Stack.Screen name="timer" options={{ headerShown: false }} />
        </Stack>
        <ChatModal />
        <FloatingChatButton />
        <StatusBar style="light" />
      </ChatProvider>
    </WorkoutProvider>
  );
}

