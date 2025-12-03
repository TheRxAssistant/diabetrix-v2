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

export interface InputField {
    field_type: 'zipcode' | 'personal_name' | 'phone' | 'email' | 'dob' | 'address' | 'member_id' | 'group_number';
    label: string;
    placeholder: string;
}

export interface IntelligentOptionsResult {
    options: QuickReply[];
    input_fields: InputField[];
    option_type: string;
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
     * Generate intelligent options based on the last assistant message
     * Analyzes context to return appropriate options (Yes/No for consent, doctor types, etc.)
     * OR input fields for user-input types (zipcode, phone, email, etc.)
     */
    static async generateIntelligentOptions(messages: any[] = [], lastAssistantMessage: string): Promise<IntelligentOptionsResult> {
        try {
            const payload = {
                messages: Array.isArray(messages) ? messages : [],
                last_assistant_message: lastAssistantMessage,
            };

            const result = await postAPI(CAPABILITIES_API_URLS.GENERATE_INTELLIGENT_OPTIONS, payload);

            console.log('📡 Intelligent Options API Response:', result.statusCode);
            
            if (result.statusCode === 200) {
                const hasOptions = result.data.options && result.data.options.length > 0;
                const hasInputFields = result.data.input_fields && result.data.input_fields.length > 0;
                
                if (hasOptions || hasInputFields) {
                    return {
                        options: hasOptions ? result.data.options.map((option: any) => ({
                            text: option.text || option,
                            type: 'action',
                        })) : [],
                        input_fields: hasInputFields ? result.data.input_fields.map((field: any) => ({
                            field_type: field.field_type,
                            label: field.label,
                            placeholder: field.placeholder,
                        })) : [],
                        option_type: result.data.option_type || 'generic',
                    };
                }
            }

            return this.getFallbackIntelligentOptions();
        } catch (error) {
            console.error('Error generating intelligent options:', error);
            return this.getFallbackIntelligentOptions();
        }
    }

    /**
     * Fallback intelligent options when AI generation fails
     */
    private static getFallbackIntelligentOptions(): IntelligentOptionsResult {
        return {
            options: [
                { text: 'Yes', type: 'action' },
                { text: 'No', type: 'action' },
                { text: 'Tell me more', type: 'question' },
                { text: 'Skip', type: 'action' },
            ],
            input_fields: [],
            option_type: 'generic',
        };
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

