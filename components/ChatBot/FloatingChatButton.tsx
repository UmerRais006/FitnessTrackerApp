import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useChat } from '../../app/ChatContext';

export const FloatingChatButton: React.FC = () => {
    const { toggleChat, isVisible } = useChat();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePress = () => {
        scale.value = withSpring(0.9, {}, () => {
            scale.value = withSpring(1);
        });
        toggleChat();
    };

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    bottom: 30,
                    right: 20,
                    zIndex: 1000,
                },
                animatedStyle,
            ]}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                className="bg-black rounded-full w-16 h-16 items-center justify-center shadow-lg"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <View className="relative">
                    <Ionicons
                        name={isVisible ? 'close' : 'chatbubble-ellipses'}
                        size={28}
                        color="#FF8C00"
                    />
                    {!isVisible && (
                        <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-3 h-3" />
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
