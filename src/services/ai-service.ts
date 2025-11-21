import { postAPI, INDEX_MEMBER_API_URLS, CAPABILITIES_API_URLS } from './api';

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
     * Generate contextual quick replies based on conversation history or search text
     * Schema: search_text is optional. If provided, send both messages and search_text. Otherwise, send only messages array.
     */
    static async generateQuickReplies(messages: any[] = [], search_text?: string): Promise<QuickReply[]> {
        try {
            // Build payload: messages is always sent, search_text is optional
            const payload: { search_text?: string; messages: any[] } = {
                messages: Array.isArray(messages) ? messages : []
            };
            
            // If search_text is provided, add it to payload (optional field)
            if (search_text && search_text.trim()) {
                payload.search_text = search_text.trim();
            }

            const result = await postAPI(CAPABILITIES_API_URLS.GENERATE_QUICK_REPLIES, payload);

            console.log('📡 API Response status:', result.statusCode);
            console.log('text', result.data);
            
            if (result.statusCode === 200 && result.data.quick_replies && result.data.quick_replies.length > 0) {
                // Map the response to match QuickReply interface
                return result.data.quick_replies.map((reply: any) => ({
                    text: reply.text || reply,
                    type: reply.type || 'question',
                }));
            }

            return this.getFallbackQuickReplies();
        } catch (error) {
            console.error('Error generating quick replies:', error);
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

