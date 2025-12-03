import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Groq API Configuration - FREE and FAST! 🚀
const GROQ_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

class GroqService {
    private conversationHistory: GroqMessage[] = [];
    private systemContext: string = '';

    constructor() {
        this.initializeSystemContext();
    }

    // Build context from user's fitness data
    private async buildUserContext(): Promise<string> {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            // Get user's workouts
            const workoutsJson = user ? await AsyncStorage.getItem(`workouts_${user.email}`) : null;
            const completedJson = user ? await AsyncStorage.getItem(`completed_workouts_${user.email}`) : null;
            const goalJson = await AsyncStorage.getItem('dailyGoal');

            let context = `You are a helpful AI fitness coach assistant. `;

            if (user) {
                context += `The user's name is ${user.fullName}. `;
            }

            if (goalJson) {
                context += `Their daily distance goal is ${goalJson} km. `;
            }

            if (workoutsJson) {
                const workouts = JSON.parse(workoutsJson);
                const workoutCount = Object.values(workouts).flat().length;
                context += `They have ${workoutCount} scheduled workouts. `;
            }

            if (completedJson) {
                const completed = JSON.parse(completedJson);
                context += `They have completed ${completed.length} workouts. `;
            }

            context += `Provide concise, motivating, and practical fitness advice. Keep responses brief and actionable.`;

            return context;
        } catch (error) {
            // Return default context if there's an error reading user data
            return 'You are a helpful AI fitness coach assistant. Provide concise, motivating, and practical fitness advice. Keep responses brief and actionable.';
        }
    }

    // Initialize system context
    private async initializeSystemContext() {
        this.systemContext = await this.buildUserContext();

        // Initialize conversation with system message
        if (this.conversationHistory.length === 0) {
            this.conversationHistory.push({
                role: 'system',
                content: this.systemContext,
            });
        }
    }

    // Send a message and get AI response - ABSOLUTELY NEVER THROWS ERRORS
    async sendMessage(userMessage: string): Promise<string> {
        try {
            // Ensure system context is initialized
            if (this.conversationHistory.length === 0) {
                await this.initializeSystemContext();
            }

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage,
            });

            // Make API request to Groq
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile', // Groq's fastest and most capable model
                    messages: this.conversationHistory,
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage,
            });

            // Keep conversation history manageable (last 20 messages + system)
            if (this.conversationHistory.length > 21) {
                this.conversationHistory = [
                    this.conversationHistory[0], // Keep system message
                    ...this.conversationHistory.slice(-20), // Keep last 20 messages
                ];
            }

            return assistantMessage;
        } catch (error: any) {
            console.error('Groq API Error in sendMessage:', error);

            // NEVER throw errors - always return a helpful message
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                return `⚠️ API Rate Limit Exceeded\n\nThe API rate limit has been reached.\n\nWhat to do:\n• Wait a few seconds and try again\n• Groq has generous free limits\n• Check: console.groq.com\n\nYour question: "${userMessage}"\n\nPlease try again shortly! 🤖`;
            }

            if (error.message?.includes('401') || error.message?.includes('API key')) {
                return `❌ API Key Error\n\nAPI key configuration issue.\n\nCheck:\n• API key is correct and active\n• API key has proper permissions\n• Visit: console.groq.com/keys`;
            }

            if (error.message?.includes('404')) {
                return `❌ Model Not Found\n\nThe AI model couldn't be accessed.\n\nUsually means:\n• Model name incorrect\n• API configuration issue`;
            }

            if (error.message?.includes('Network') || error.message?.includes('fetch')) {
                return `⚠️ Network Error\n\nCouldn't connect to the AI service.\n\nThis is likely due to:\n• No internet connection\n• Network connectivity issues\n• Service temporarily unavailable\n\nPlease check your connection and try again.`;
            }

            // Generic error - still don't crash
            const errorMsg = error.message || 'Unknown error';
            return `⚠️ Temporary Error\n\nSorry, I encountered an issue:\n${errorMsg}\n\nPlease try again in a moment.`;
        }
    }

    // Reset chat session (useful for starting fresh)
    resetChat() {
        this.conversationHistory = [];
        this.initializeSystemContext();
    }

    // Quick action prompts
    getQuickActionPrompt(action: string): string {
        const prompts: { [key: string]: string } = {
            workout: 'Suggest an effective workout routine for today based on my fitness level.',
            nutrition: 'What are some healthy meal ideas for lunch that support my fitness goals?',
            motivation: 'Give me some motivational tips to stay consistent with my fitness journey.',
            progress: 'Analyze my progress and give me insights on how I\'m doing.',
            plan: 'Create a simple weekly meal plan for me.',
        };
        return prompts[action] || action;
    }
}

// Export singleton instance
export const groqService = new GroqService();

// Also export as geminiService for backward compatibility
export const geminiService = groqService;
export const openaiService = groqService;
