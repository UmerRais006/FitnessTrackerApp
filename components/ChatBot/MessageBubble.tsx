import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Message } from '../../services/geminiService';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <View
            className={`flex-row mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!message.isUser && (
                <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-2">
                    <Ionicons name="sparkles" size={16} color="#fff" />
                </View>
            )}

            <View
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.isUser
                        ? 'bg-black rounded-br-sm'
                        : 'bg-gray-100 rounded-bl-sm'
                    }`}
            >
                <Text
                    className={`text-base leading-6 ${message.isUser ? 'text-white' : 'text-black'
                        }`}
                >
                    {message.text}
                </Text>
                <Text
                    className={`text-xs mt-1 ${message.isUser ? 'text-white/60' : 'text-gray-500'
                        }`}
                >
                    {formatTime(message.timestamp)}
                </Text>
            </View>

            {message.isUser && (
                <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2">
                    <Ionicons name="person" size={16} color="#000" />
                </View>
            )}
        </View>
    );
};
