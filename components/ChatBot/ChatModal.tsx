import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useChat } from '../../app/ChatContext';
import { MessageBubble } from './MessageBubble';
import { QuickActions } from './QuickActions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ChatModal: React.FC = () => {
    const { messages, isVisible, isLoading, error, sendMessage, toggleChat, clearError, sendQuickAction } = useChat();
    const insets = useSafeAreaInsets();
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
        }
    }, [error]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const message = inputText;
        setInputText('');
        await sendMessage(message);
    };

    const handleQuickAction = async (action: string) => {
        if (isLoading) return;
        await sendQuickAction(action);
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={toggleChat}
            presentationStyle="fullScreen"
        >
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
                <StatusBar style="dark" />

                {/* Header */}
                <View className="bg-white border-b border-gray-200 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center mr-3">
                                <Ionicons name="sparkles" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-black text-lg font-bold">AI Fitness Coach</Text>
                                <Text className="text-gray-500 text-xs">
                                    {isLoading ? 'Typing...' : 'Online'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={toggleChat}
                            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Keyboard Avoiding View wraps all content below header */}
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    keyboardVerticalOffset={0}
                >
                    {/* Messages - Scrollable Area */}
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4 pt-4"
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {isLoading && (
                            <View className="flex-row items-center mb-4">
                                <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-2">
                                    <Ionicons name="sparkles" size={16} color="#fff" />
                                </View>
                                <View className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                    <ActivityIndicator size="small" color="#000" />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Quick Actions - Fixed at Bottom */}
                    <View className="px-4 py-2 bg-white border-t border-gray-100">
                        <QuickActions onActionPress={handleQuickAction} disabled={isLoading} />
                    </View>

                    {/* Input - Fixed at Bottom */}
                    <View className="bg-white border-t border-gray-200 px-4 py-3">
                        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                            <TextInput
                                className="flex-1 text-black text-base py-2"
                                placeholder="Ask me anything..."
                                placeholderTextColor="#9ca3af"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                editable={!isLoading}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={!inputText.trim() || isLoading}
                                className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${inputText.trim() && !isLoading ? 'bg-black' : 'bg-gray-300'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="send"
                                    size={18}
                                    color={inputText.trim() && !isLoading ? '#FF8C00' : '#666'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
