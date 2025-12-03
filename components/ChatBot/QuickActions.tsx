import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsProps {
    onActionPress: (action: string) => void;
    disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionPress, disabled }) => {
    const actions = [
        { id: 'workout', icon: 'barbell', label: 'Suggest Workout', color: '#667eea' },
        { id: 'nutrition', icon: 'nutrition', label: 'Meal Ideas', color: '#00b894' },
        { id: 'motivation', icon: 'flame', label: 'Motivate Me', color: '#fd79a8' },
        { id: 'progress', icon: 'trending-up', label: 'My Progress', color: '#6c5ce7' },
    ];

    return (
        <View className="mb-3">
            <Text className="text-gray-500 text-xs font-semibold mb-2 px-1">
                QUICK ACTIONS
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
            >
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        onPress={() => onActionPress(action.id)}
                        disabled={disabled}
                        className={`bg-gray-100 rounded-full px-4 py-2 mr-2 flex-row items-center ${disabled ? 'opacity-50' : ''
                            }`}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={action.icon as any} size={16} color="#000" />
                        <Text className="text-black font-semibold ml-2 text-sm">
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};
