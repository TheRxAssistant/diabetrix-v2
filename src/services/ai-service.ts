import { postAPI, INDEX_MEMBER_API_URLS } from './api';

// AI Service for generating quick replies and contextual responses
export interface AIResponse {
    res: {
        object?: any;
        text?: string;
    };
}

export interface QuickReply {
    text: string;
    type: 'question' | 'clarification' | 'action';
}

export class AIService {

    /**
     * Generate contextual quick replies based on conversation history
     */
    static async generateQuickReplies(messages: any[]): Promise<QuickReply[]> {
        try {
            const conversationContext = this.buildConversationContext(messages);

            const prompt = `
        Based on the following conversation context, generate 3-4 medication-related quick reply suggestions. 
        
        Conversation context:
        ${conversationContext}
        
        Generate quick replies that are:
        1. ONLY about medication questions (dosage, usage, side effects, storage, etc.)
        2. Short and direct (max 6 words each)
        3. Related to Diabetrix® medication if applicable
        
        Examples of good medication-related quick replies:
        - "What is the dosage?"
        - "Tell me more"
        - "How to use?"
        - "Any side effects?"
        - "Storage instructions?"
        - "When to take it?"
        - "Can I adjust dose?"
        - "How often should I take?"
        - "What if I miss dose?"
        - "Can I take with food?"
        
        Focus ONLY on medication-specific questions. Return responses as very concise medication questions (max 6 words each).
      `;

            const schema = {
                type: 'object',
                properties: {
                    quick_replies: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    description: 'The quick reply text',
                                },
                                type: {
                                    type: 'string',
                                    enum: ['question', 'clarification', 'action'],
                                    description: 'The type of quick reply',
                                },
                            },
                            required: ['text', 'type'],
                        },
                    },
                },
                required: ['quick_replies'],
            };

            const result = await postAPI(INDEX_MEMBER_API_URLS.AI_GENERATE_OBJECT, {
                prompt,
                schema: JSON.stringify(schema),
            });

            console.log('📡 API Response status:', result.statusCode);
            console.log('text', result.data);
            
            if (result.statusCode !== 200) {
                throw new Error(`AI service error: ${result.statusCode} - ${result.message}`);
            }

            const data = result.data;
            if (data?.res?.object?.quick_replies) {
                return data.res.object.quick_replies;
            }

            return this.getFallbackQuickReplies();
        } catch (error) {
            return this.getFallbackQuickReplies();
        }
    }

    /**
     * Generate a response to help clarify user intent
     */
    static async generateClarificationResponse(userMessage: string, conversationHistory: any[]): Promise<string> {
        try {
            const context = this.buildConversationContext(conversationHistory);

            const prompt = `
        The user just said: "${userMessage}"
        
        Conversation history:
        ${context}
        
        Generate a helpful clarifying question or response to better understand what the user needs help with regarding their healthcare or pharmaceutical assistance.
      `;

            const result = await postAPI(INDEX_MEMBER_API_URLS.AI_GENERATE_TEXT, {
                prompt,
            });

            if (result.statusCode !== 200) {
                throw new Error(`AI service error: ${result.statusCode} - ${result.message}`);
            }

            const data = result.data as any;

            // Try both possible response structures
            const text = data?.data?.res?.text || data?.res?.text || (data as AIResponse)?.res?.text;

            return text || 'Could you please provide more details about how I can help you?';
        } catch (error) {
            console.error('Error generating clarification response:', error);
            return 'Could you please provide more details about how I can help you?';
        }
    }

    /**
     * Build conversation context from message history
     */
    private static buildConversationContext(messages: any[]): string {
        if (!messages || messages.length === 0) {
            return 'No previous conversation';
        }

        // Get the last 6 messages for context (to avoid token limits)
        const recentMessages = messages.slice(-6);

        return recentMessages.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    }

    /**
     * Fallback quick replies when AI generation fails
     */
    private static getFallbackQuickReplies(): QuickReply[] {
        return [
            { text: 'Tell me more', type: 'question' },
            { text: 'How does this help?', type: 'clarification' },
            { text: "What's next?", type: 'action' },
            { text: 'Any side effects?', type: 'question' },
        ];
    }

    /**
     * Determine if quick replies should be shown based on conversation state
     */
    static shouldShowQuickReplies(messages: any[], loading: boolean): boolean {
        if (loading || !messages || messages.length === 0) {
            return false;
        }

        const lastMessage = messages[messages.length - 1];

        // Show quick replies after assistant responses
        return (
            lastMessage?.role === 'assistant' &&
            !lastMessage?.buttons && // Don't show if there are already buttons
            lastMessage?.content?.length > 10
        ); // Only for substantial responses
    }
}

