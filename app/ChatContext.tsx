import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { openaiService as geminiService, Message } from '../services/geminiService';

interface ChatContextType {
    messages: Message[];
    isVisible: boolean;
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    toggleChat: () => void;
    clearError: () => void;
    sendQuickAction: (action: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load chat history on mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    // Save chat history whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory();
        }
    }, [messages]);

    const loadChatHistory = async () => {
        try {
            const historyJson = await AsyncStorage.getItem('chatHistory');
            if (historyJson) {
                const history = JSON.parse(historyJson);
                setMessages(history.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                })));
            } else {
                // Add welcome message if no history
                const welcomeMessage: Message = {
                    id: Date.now().toString(),
                    text: "Hello! I'm your AI fitness coach. I'm here to help you with workouts, nutrition, motivation, and tracking your fitness goals. How can I assist you today?",
                    isUser: false,
                    timestamp: new Date(),
                };
                setMessages([welcomeMessage]);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const saveChatHistory = async () => {
        try {
            await AsyncStorage.setItem('chatHistory', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        setError(null);
        setIsLoading(true);

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            // Get AI response with error handling
            const aiResponse = await geminiService.sendMessage(text);

            // Add AI message
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            // Don't crash - show error as a message instead
            console.error('Chat error:', err);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: err.message || 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendQuickAction = async (action: string) => {
        const prompt = geminiService.getQuickActionPrompt(action);
        await sendMessage(prompt);
    };

    const toggleChat = () => {
        setIsVisible(!isVisible);
        if (!isVisible) {
            setError(null);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                isVisible,
                isLoading,
                error,
                sendMessage,
                toggleChat,
                clearError,
                sendQuickAction,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
